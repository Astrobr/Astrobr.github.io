const { Component, Fragment } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');

class MathJax extends Component {
    render() {
        const { jsUrl } = this.props;
        const config = `MathJax.Hub.Config({
            showProcessingMessages: false,
            messageStyle: 'none',
            'HTML-CSS': {
                matchFontHeight: false,
                linebreaks: { automatic: true }
            },
            SVG: {
                matchFontHeight: false,
                linebreaks: { automatic: true }
            },
            CommonHTML: {
                matchFontHeight: false,
                linebreaks: { automatic: true }
            },
            tex2jax: {
                inlineMath: [
                    ['$', '$'],
                    ['\\\\(', '\\\\)']
                ],
                displayMath: [
                    ['$$', '$$'],
                    ['\\\\[', '\\\\]']
                ],
                processEscapes: true,
                processEnvironments: true,
                skipTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
            },
            TeX: {
                extensions: ['AMSmath.js', 'AMSsymbols.js', 'noErrors.js', 'noUndefined.js']
            }
        });`;

        return <Fragment>
            <script type="text/x-mathjax-config" dangerouslySetInnerHTML={{ __html: config }}></script>
            <script src={jsUrl} defer></script>
        </Fragment>;
    }
}

MathJax.Cacheable = cacheComponent(MathJax, 'plugin.mathjax', props => {
    const { helper, head } = props;

    if (head) {
        return null;
    }

    return {
        jsUrl: helper.cdn('mathjax', '2.7.5', 'unpacked/MathJax.js?config=TeX-MML-AM_CHTML')
    };
});

module.exports = MathJax;
