'use strict';

const htmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '{': '&#123;',
    '}': '&#125;'
};

const mathOpenBracePlaceholder = '\uE000';
const mathCodeBlockPattern = /<hexoPostRenderCodeBlock>[\s\S]+?<\/hexoPostRenderCodeBlock>/g;

function escapeHtml(str) {
    return str.replace(/[&<>{}]/g, ch => htmlEscapeMap[ch]);
}

function restoreMathPlaceholders(str) {
    return str.split(mathOpenBracePlaceholder).join('{');
}

function protectNunjucksOpeners(str) {
    return str.replace(/\{(?=[{#%])/g, mathOpenBracePlaceholder);
}

function findClosingDelimiter(src, delimiter, start) {
    for (let index = start; index < src.length; index++) {
        if (src[index] === '\n') {
            return -1;
        }

        if (src.startsWith(delimiter, index)) {
            let slashCount = 0;
            for (let cursor = index - 1; cursor >= 0 && src[cursor] === '\\'; cursor--) {
                slashCount++;
            }

            if (slashCount % 2 === 0) {
                return index;
            }
        }
    }

    return -1;
}

function findClosingDelimiterMultiline(src, delimiter, start) {
    for (let index = start; index < src.length; index++) {
        if (src.startsWith(delimiter, index)) {
            let slashCount = 0;
            for (let cursor = index - 1; cursor >= 0 && src[cursor] === '\\'; cursor--) {
                slashCount++;
            }

            if (slashCount % 2 === 0) {
                return index;
            }
        }
    }

    return -1;
}

function getNextMathStart(src, start) {
    const starts = [
        src.indexOf('$$', start),
        src.indexOf('\\[', start),
        src.indexOf('\\(', start),
        src.indexOf('$', start)
    ].filter(index => index !== -1);

    return starts.length ? Math.min(...starts) : -1;
}

function protectMathInText(src) {
    let result = '';
    let index = 0;

    while (index < src.length) {
        const start = getNextMathStart(src, index);

        if (start === -1) {
            result += src.slice(index);
            break;
        }

        result += src.slice(index, start);

        let end = -1;
        let closeLength = 0;

        if (src.startsWith('$$', start)) {
            end = findClosingDelimiterMultiline(src, '$$', start + 2);
            closeLength = 2;
        } else if (src.startsWith('\\[', start)) {
            end = findClosingDelimiterMultiline(src, '\\]', start + 2);
            closeLength = 2;
        } else if (src.startsWith('\\(', start)) {
            end = findClosingDelimiter(src, '\\)', start + 2);
            closeLength = 2;
        } else if (src[start] === '$' && src[start + 1] !== '$') {
            end = findClosingDelimiter(src, '$', start + 1);
            closeLength = 1;
        }

        if (end === -1) {
            result += src[start];
            index = start + 1;
            continue;
        }

        result += protectNunjucksOpeners(src.slice(start, end + closeLength));
        index = end + closeLength;
    }

    return result;
}

function protectMathSegments(data) {
    if (!data || typeof data.content !== 'string') {
        return data;
    }

    let result = '';
    let lastIndex = 0;

    data.content.replace(mathCodeBlockPattern, (match, offset) => {
        result += protectMathInText(data.content.slice(lastIndex, offset));
        result += match;
        lastIndex = offset + match.length;
        return match;
    });

    result += protectMathInText(data.content.slice(lastIndex));
    data.content = result;

    return data;
}

function createMathExtensions() {
    return [
        {
            name: 'mathBlock',
            level: 'block',
            start(src) {
                const match = src.match(/(?:^|\n) {0,3}(?:\$\$|\\\[)/);
                return match ? match.index : undefined;
            },
            tokenizer(src) {
                const dollarMatch = src.match(/^ {0,3}\$\$[ \t]*\n?([\s\S]+?)\n? {0,3}\$\$(?:[ \t]*(?:\n|$)|$)/);

                if (dollarMatch) {
                    return {
                        type: 'mathBlock',
                        raw: dollarMatch[0],
                        text: dollarMatch[1].trim()
                    };
                }

                const bracketMatch = src.match(/^ {0,3}\\\[[ \t]*\n?([\s\S]+?)\n? {0,3}\\\](?:[ \t]*(?:\n|$)|$)/);

                if (bracketMatch) {
                    return {
                        type: 'mathBlock',
                        raw: bracketMatch[0],
                        text: bracketMatch[1].trim()
                    };
                }
            },
            renderer(token) {
                return `<div class="mathjax-block">$$\n${escapeHtml(restoreMathPlaceholders(token.text))}\n$$</div>\n`;
            }
        },
        {
            name: 'mathInline',
            level: 'inline',
            start(src) {
                const dollarIndex = src.indexOf('$');
                const bracketIndex = src.indexOf('\\(');

                if (dollarIndex === -1) {
                    return bracketIndex === -1 ? undefined : bracketIndex;
                }

                if (bracketIndex === -1) {
                    return dollarIndex;
                }

                return Math.min(dollarIndex, bracketIndex);
            },
            tokenizer(src) {
                if (src.startsWith('\\(')) {
                    const end = findClosingDelimiter(src, '\\)', 2);

                    if (end > 2) {
                        return {
                            type: 'mathInline',
                            raw: src.slice(0, end + 2),
                            text: src.slice(2, end).trim()
                        };
                    }
                }

                if (src[0] !== '$' || src[1] === '$') {
                    return;
                }

                const end = findClosingDelimiter(src, '$', 1);

                if (end <= 1) {
                    return;
                }

                const text = src.slice(1, end);

                if (/^\s|\s$/.test(text)) {
                    return;
                }

                return {
                    type: 'mathInline',
                    raw: src.slice(0, end + 1),
                    text
                };
            },
            renderer(token) {
                return `<span class="mathjax-inline">$${escapeHtml(restoreMathPlaceholders(token.text))}$</span>`;
            }
        }
    ];
}

hexo.extend.filter.register('before_post_render', protectMathSegments, 20);

hexo.extend.filter.register('marked:extensions', extensions => {
    extensions.push(...createMathExtensions());
});
