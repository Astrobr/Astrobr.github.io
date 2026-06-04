# Astroblog  ![](https://github.com/Astrobr/Astrobr.github.io/actions/workflows/pages.yml/badge.svg)
Astrobear's blog. 

## Gitalk issue initialization

The Pages workflow runs `npm run gitalk:init` after Hexo builds the site. It scans the generated Gitalk config in `public/**/*.html` and creates missing GitHub issues for pages that need comments.

Add a repository secret named `GITALK_TOKEN` with write access to issues in the configured Gitalk repo (`Astrobr/astroblog`).
