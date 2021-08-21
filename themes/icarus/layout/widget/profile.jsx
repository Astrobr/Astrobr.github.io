const { Component } = require('inferno');
const gravatrHelper = require('hexo-util').gravatar;
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');

class Profile extends Component {
    renderSocialLinks(links) {
        if (!links.length) {
            return null;
        }
        return <div class="level is-mobile">
            {links.filter(link => typeof link === 'object').map(link => {
                return <a class="level-item button is-transparent is-marginless"
                    target="_blank" rel="noopener" title={link.name} href={link.url}>
                    {'icon' in link ? <i class={link.icon}></i> : link.name}
                </a>;
            })}
        </div>;
    }

    render() {
        const {
            avatar,
            avatarRounded,
            author,
            authorTitle,
            location,
            counter,
            followLink,
            followTitle,
            socialLinks
        } = this.props;
        return <div class="card widget" data-type="profile">
            <div class="card-content">
                <nav class="level" style="margin-bottom:1rem">
                    <div class="level-item has-text-centered flex-shrink-1">
                        <div>
                            <figure class="image is-128x128 mx-auto mb-2">
                                <img class={'avatar' + (avatarRounded ? ' is-rounded' : '')} src={avatar} alt={author} />
                            </figure>
                            {author ? <p class="title is-size-4 is-block" style={{'line-height': 'inherit'}}>{author}</p> : null}
                            {authorTitle ? <p class="is-size-6 is-block">{authorTitle}</p> : null}
                            {location ? <p class="is-size-6 is-flex justify-content-center">
                                <i class="fas fa-map-marker-alt mr-1"></i>
                                <span>{location}</span>
                            </p> : null}
                        </div>
                    </div>
                </nav>
                <nav class="level menu-list is-mobile" style="margin-bottom:1rem">
                    <a class="level-item has-text-centered is-marginless" href={counter.post.url}>
                        <div>
                            <p class="heading">{counter.post.title}</p>
                            <div>
                                <p class="title">{counter.post.count}</p>
                            </div>
                        </div>
                    </a>
                    <a class="level-item has-text-centered is-marginless" href={counter.category.url}>
                        <div>
                            <p class="heading">{counter.category.title}</p>
                            <div>
                                <p class="title">{counter.category.count}</p>
                            </div>
                        </div>
                    </a>
                    <a class="level-item has-text-centered is-marginless" href={counter.tag.url}>
                        <div>
                            <p class="heading">{counter.tag.title}</p>
                            <div>
                                <p class="title">{counter.tag.count}</p>
                            </div>
                        </div>
                    </a>
                </nav>
                {followLink ? <div class="level">
                    <a class="level-item button is-primary is-rounded" href={followLink} target="_blank" rel="noopener"><i class="fab fa-github"></i>&nbsp;&nbsp;{followTitle}</a>
                </div> : null}
                {socialLinks ? this.renderSocialLinks(socialLinks) : null}
            </div>
        </div>;
    }
}

Profile.Cacheable = cacheComponent(Profile, 'widget.profile', props => {
    const { site, helper, widget } = props;
    const {
        avatar,
        gravatar,
        avatar_rounded = false,
        author = props.config.author,
        author_title,
        location,
        follow_link,
        social_links
    } = widget;
    const { url_for, _p, __ } = helper;

    function getAvatar() {
        if (gravatar) {
            return gravatrHelper(gravatar, 96);
        }
        if (avatar) {
            return url_for(avatar);
        }
        return url_for('/img/avatar.png');
    }

    const postCount = site.posts.length;
    const categoryCount = site.categories.filter(category => category.length).length;
    const tagCount = site.tags.filter(tag => tag.length).length;

    const socialLinks = social_links ? Object.keys(social_links).map(name => {
        const link = social_links[name];
        if (typeof link === 'string') {
            return {
                name,
                url: url_for(link)
            };
        }
        return {
            name,
            url: url_for(link.url),
            icon: link.icon
        };
    }) : null;

    return {
        avatar: getAvatar(),
        avatarRounded: avatar_rounded,
        author,
        authorTitle: author_title,
        location,
        counter: {
            post: {
                count: postCount,
                title: _p('common.post', postCount),
                url: url_for('/archives/')
            },
            category: {
                count: categoryCount,
                title: _p('common.category', categoryCount),
                url: url_for('/categories/')
            },
            tag: {
                count: tagCount,
                title: _p('common.tag', tagCount),
                url: url_for('/tags/')
            }
        },
        followLink: follow_link ? url_for(follow_link) : undefined,
        followTitle: __('widget.follow'),
        socialLinks
    };
});

module.exports = Profile;
