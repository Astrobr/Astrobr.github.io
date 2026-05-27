'use strict';

const htmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};

function escapeHtml(str) {
    return str.replace(/[&<>]/g, ch => htmlEscapeMap[ch]);
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
                return `<div class="mathjax-block">$$\n${escapeHtml(token.text)}\n$$</div>\n`;
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
                return `<span class="mathjax-inline">$${escapeHtml(token.text)}$</span>`;
            }
        }
    ];
}

hexo.extend.filter.register('marked:extensions', extensions => {
    extensions.push(...createMathExtensions());
});
