'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const TOKEN = process.env.GITALK_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const ROOT = path.resolve(process.env.GITALK_ROOT || 'public');
const DRY_RUN = /^(1|true|yes)$/i.test(process.env.GITALK_DRY_RUN || '')
  || process.argv.includes('--dry-run');
const BASE_LABEL = process.env.GITALK_LABEL || 'Gitalk';
const BASE_LABEL_COLOR = process.env.GITALK_LABEL_COLOR || '3b82f6';
const ID_LABEL_COLOR = process.env.GITALK_ID_LABEL_COLOR || '94a3b8';
const USER_AGENT = 'astroblog-gitalk-issue-init';
const MAX_REDIRECTS = 5;

function walkHtmlFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(parseInt(code, 10)));
}

function pickMeta(html, property) {
  const pattern = new RegExp(`<meta\\s+property=["']${property}["']\\s+content=["']([^"']*)["']`, 'i');
  const match = html.match(pattern);
  return match ? decodeHtml(match[1]).trim() : '';
}

function pickTitle(html) {
  return pickMeta(html, 'og:title')
    || decodeHtml((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '').trim()
    || 'Gitalk comments';
}

function pickUrl(html) {
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
  return pickMeta(html, 'og:url')
    || (canonical ? decodeHtml(canonical[1]).trim() : '');
}

function pickStringField(block, name) {
  const match = block.match(new RegExp(`${name}\\s*:\\s*("(?:(?:\\\\.)|[^"\\\\])*")`));
  return match ? JSON.parse(match[1]) : '';
}

function extractGitalkPages() {
  const pages = [];

  for (const file of walkHtmlFiles(ROOT)) {
    const html = fs.readFileSync(file, 'utf8');
    const blockMatch = html.match(/new Gitalk\(\{([\s\S]*?)\}\)/);
    if (!blockMatch) {
      continue;
    }

    const block = blockMatch[1];
    const id = pickStringField(block, 'id');
    const repo = process.env.GITALK_REPO || pickStringField(block, 'repo');
    const owner = process.env.GITALK_OWNER || pickStringField(block, 'owner');

    if (!id || !repo || !owner) {
      throw new Error(`Cannot parse Gitalk id/owner/repo from ${path.relative(ROOT, file)}`);
    }

    pages.push({
      id,
      owner,
      repo,
      title: pickTitle(html),
      url: pickUrl(html),
      file: path.relative(ROOT, file).replace(/\\/g, '/')
    });
  }

  const byKey = new Map();
  for (const page of pages) {
    byKey.set(`${page.owner}/${page.repo}/${page.id}`, page);
  }

  return [...byKey.values()].sort((a, b) => a.file.localeCompare(b.file));
}

function api(method, endpoint, body, redirects = 0) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : '';
    const url = new URL(endpoint, 'https://api.github.com');

    if (url.hostname !== 'api.github.com') {
      reject(new Error(`Refusing to follow GitHub API redirect to ${url.hostname}`));
      return;
    }

    const request = https.request({
      hostname: url.hostname,
      path: `${url.pathname}${url.search}`,
      method,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': USER_AGENT,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');

        if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
          if (redirects >= MAX_REDIRECTS) {
            reject(new Error(`GitHub API redirect limit exceeded for ${method} ${endpoint}`));
            return;
          }

          const redirectMethod = response.statusCode === 303 ? 'GET' : method;
          const redirectBody = redirectMethod === 'GET' ? null : body;
          resolve(api(redirectMethod, response.headers.location, redirectBody, redirects + 1));
          return;
        }

        let data = null;
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (error) {
            reject(new Error(`GitHub API returned non-JSON response for ${method} ${endpoint}: ${text}`));
            return;
          }
        }

        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(data);
          return;
        }

        const message = data && data.message ? data.message : text;
        const error = new Error(`GitHub API ${response.statusCode} for ${method} ${endpoint}: ${message}`);
        error.statusCode = response.statusCode;
        error.data = data;
        reject(error);
      });
    });

    request.on('error', reject);
    if (payload) {
      request.write(payload);
    }
    request.end();
  });
}

const repoCache = new Map();

async function resolveRepo(owner, repo) {
  const key = `${owner}/${repo}`;
  if (repoCache.has(key)) {
    return repoCache.get(key);
  }

  if (DRY_RUN) {
    const resolved = { owner, repo };
    repoCache.set(key, resolved);
    return resolved;
  }

  const repository = await api('GET', `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
  const resolved = {
    owner: repository.owner.login,
    repo: repository.name
  };

  if (resolved.owner !== owner || resolved.repo !== repo) {
    console.log(`Resolved Gitalk repo ${owner}/${repo} -> ${resolved.owner}/${resolved.repo}`);
  }

  repoCache.set(key, resolved);
  return resolved;
}

function endpointForLabel(owner, repo, label) {
  return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/labels/${encodeURIComponent(label)}`;
}

async function ensureLabel(owner, repo, label, color, description) {
  if (DRY_RUN) {
    console.log(`[dry-run] ensure label ${owner}/${repo}: ${label}`);
    return;
  }

  try {
    await api('GET', endpointForLabel(owner, repo, label));
  } catch (error) {
    if (error.statusCode !== 404) {
      throw error;
    }

    try {
      await api('POST', `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/labels`, {
        name: label,
        color,
        description
      });
      console.log(`Created label ${owner}/${repo}: ${label}`);
    } catch (createError) {
      if (createError.statusCode === 422) {
        return;
      }
      throw createError;
    }
  }
}

async function findIssue(owner, repo, id) {
  const q = [
    `repo:${owner}/${repo}`,
    'is:issue',
    `label:${BASE_LABEL}`,
    `label:${id}`
  ].join(' ');
  const endpoint = `/search/issues?q=${encodeURIComponent(q)}&per_page=1`;
  const result = await api('GET', endpoint);
  return result.items && result.items.length ? result.items[0] : null;
}

async function ensureIssue(page) {
  await ensureLabel(page.owner, page.repo, BASE_LABEL, BASE_LABEL_COLOR, 'Gitalk comment issue');
  await ensureLabel(
    page.owner,
    page.repo,
    page.id,
    ID_LABEL_COLOR,
    `Gitalk issue id for ${page.file}`.slice(0, 100)
  );

  if (DRY_RUN) {
    console.log(`[dry-run] ensure issue ${page.owner}/${page.repo}: ${page.title} (${page.id})`);
    return { created: false };
  }

  const existing = await findIssue(page.owner, page.repo, page.id);
  if (existing) {
    console.log(`Found issue #${existing.number}: ${page.title}`);
    return { created: false };
  }

  const issue = await api('POST', `/repos/${encodeURIComponent(page.owner)}/${encodeURIComponent(page.repo)}/issues`, {
    title: page.title,
    body: [
      page.url || page.file,
      '',
      'This issue is generated automatically for Gitalk comments.'
    ].join('\n'),
    labels: [BASE_LABEL, page.id]
  });

  console.log(`Created issue #${issue.number}: ${page.title}`);
  return { created: true };
}

async function main() {
  const pages = extractGitalkPages();
  if (!pages.length) {
    console.log(`No Gitalk pages found under ${ROOT}`);
    return;
  }

  if (!TOKEN && !DRY_RUN) {
    throw new Error(
      'GITALK_TOKEN is required. Add a repository secret with issue write access to the Gitalk repo.'
    );
  }

  let created = 0;
  for (const page of pages) {
    const repo = await resolveRepo(page.owner, page.repo);
    const result = await ensureIssue({ ...page, ...repo });
    if (result.created) {
      created += 1;
    }
  }

  if (DRY_RUN) {
    console.log(`Gitalk issue dry run complete: ${pages.length} pages would be checked.`);
  } else {
    console.log(`Gitalk issue initialization complete: ${created} created, ${pages.length - created} already present.`);
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
