---
title: Hexo主题Icarus的自定义
date: 2021-08-23 17:20:00
categories: 
	- [CS]
	#- [cate2]
	#...
tags: 
	- Hexo
	- Icarus
	- Blog

#If you need a thumbnail photo for your post, delete the well number below and finish the directory.
cover: https://i.postimg.cc/FsyWrVNC/icarus.png
thumbnail: https://i.postimg.cc/FsyWrVNC/icarus.png

#If you need to customize your excerpt, delete the well number below and input something. You can also input <!-- more --> in your article to divide the excerpt and other contents.
excerpt: 填坑。

#If you don't want to show the ToC (Table of Content) at sidebar, delete the well number below. 
#toc: false

#You can begin to input your article below now.

---

<article class="message message-immersive is-info">
<div class="message-body">
<i class="fas fa-info-circle mr-2"></i>
这是Astrobear“建站搭博客”系列的第三篇文章，你可以点击下方链接查看该系列其他文章。
</div>
</article>

- “建站搭博客”系列之一：[华为云+nginx服务器搭建总结](https://astrobear.top/2020/01/08/华为云+nginx服务器搭建总结/)
- “建站搭博客”系列之二：[Hexo博客的安装和自动部署](https://astrobear.top/2021/08/16/Hexo的安装和自动部署/)

Icarus是Hexo的一款简单、精致、现代的主题，也是我的博客目前正在使用的主题。这款主题无论从颜值还是从功能上看都相当优秀。但是针对我的需求而言，它仍然有一些不足之处。即使Icarus支持大量的自定义功能以及丰富的插件，要想实现我的目标功能，依旧需要对这个主题进行魔改。此外，在博客迁移的过程中，我还顺便将其版本升级为最新。在此将其过程一并记录下来以供参考。

# Icarus的升级过程

<article class="message message-immersive is-warning">
<div class="message-body">
<i class="fas fa-exclamation-triangle mr-2"></i>
在升级前请务必备份你的原文件！
</div>
</article>

根据主题作者的教程，如果你打算通过修改源代码的方式自定义主题，你必须从源代码安装主题。所以我直接在[该主题的Release](https://github.com/ppoffice/hexo-theme-icarus/releases)下载了其最新版本（4.4.0）的源代码，将文件夹下`./themes/icarus/`中现有的旧文件全部删除后，再将新版本的主题文件复制进去。

完成上面的操作以后在终端中执行`hexo clean`，再执行`hexo g`。由于只是将主题由旧版本升级到最新，其使用的相关依赖和包都还没升级。因此，在生成的过程中可能会出现错误。

依照命令行给出的提示，输入：`npm install --save bulma-stylus@0.8.0 hexo@^5.0.2 hexo-log@^2.0.0 hexo-renderer-inferno@^0.1.3 hexo-renderer-stylus@^2.0.0 hexo-util@^2.2.0 hexo-component-inferno@^0.13.0 inferno@^7.3.3 inferno-create-element@^7.3.3`（视实际情况，命令的内容会有所不同），终端会自动安装所需要的依赖。

安装完成后再次尝试生成博客，这时应该不会再报错了。但是，控制台中出现了新的警告：

```
Deprecated as of 10.7.0. highlight(lang, code, ...args) has been deprecated.
Deprecated as of 10.7.0. Please use highlight(code, options) instead.
https://github.com/highlightjs/highlight.js/issues/2277
```

经过查询，这是由Hexo的一个依赖：`hexo-util`引起的，其作者已经在最新的版本中修正了这一错误（参考：[BugFix: Correct highlighting of multi-line element (fix #10 and hexojs/hexo#2291) by seaoak · Pull Request #22 · hexojs/hexo-util (github.com)](https://github.com/hexojs/hexo-util/pull/22)）。因此，只需要在终端中输入`npm install hexo-util --save`将其更新即可（终端的操作位置应当切换到你的博客所在的文件夹下）。

此外，在更新的过程中，Icarus还会在你的博客根目录创建一个新的主题配置文件`_config,icarus.yml`。这一动作会在终端中以警告的形式表现出来。在完成上述操作后，请不要忘记将旧的主题文件的配置迁移到新的上面。

# 布局

## 文章页面设为两栏布局

Icarus的默认布局为三栏布局，但是在显示文章正文时，三栏布局的挂件（Widgets）会占用文章大量的显示空间。所以，在这里将文章设置成两栏布局较好。

Icarus在更新后提供了通过配置文件来设置页面布局的方法。我们在博客的根目录下新建一个配置文件`_config.post.yml`。在文章页面，`_config.post.yml`会覆盖同一文件夹下的`_config.icarus.yml`中的设置，也即文章页面将只显示在`_config.post.yml`中指明的挂件。所以在该配置文件中，只需要写入想要在文章页面显示的挂件便可以实现两栏布局。

下面给出了`_config.post.yml`的示例，请根据自己的需要增删内容。

```yaml _config.post.yml
widgets:
    # Profile widget configurations
    -
        # Where should the widget be placed, left sidebar or right sidebar
        position: left
        type: profile
        # Author name
        author: Astrobear
        # Author title
        author_title: Building my fortress.
        # Author's current location
        location: PRC
        # URL or path to the avatar image
        avatar: /img/avatar.jpeg
        # Whether show the rounded avatar image
        avatar_rounded: true
        # Email address for the Gravatar
        gravatar: 
        # URL or path for the follow button
        follow_link: 'https://github.com/Astrobr'
        # Links to be shown on the bottom of the profile widget
        social_links:
            Github:
                icon: fab fa-github
                url: 'https://github.com/Astrobr'
            Facebook:
                icon: fab fa-facebook
                url: 'https://www.facebook.com/astrobearforwork'
            Instagram:
                icon: fab fa-instagram
                url: 'https://www.instagram.com/astrobarchen/'
            #Twitter:
            #    icon: fab fa-twitter
            #    url: 'https://twitter.com'
            #Dribbble:
            #    icon: fab fa-dribbble
            #    url: 'https://dribbble.com'
            #RSS:
            #    icon: fas fa-rss
            #    url: /
    # Table of contents widget configurations
    -
        # Where should the widget be placed, left sidebar or right sidebar
        position: left
        type: toc
        # Whether to show the index of each heading
        index: true
        # Whether to collapse sub-headings when they are out-of-view
        collapsed: true
        # Maximum level of headings to show (1-6)
        depth: 3
```

在按照上面的方法修改后，页面右侧的挂件被移除后会空出很多空间。因此我们需要调整一下两栏布局的宽度，使所有页面的侧边宽度一致。下面所有的代码对应文件的路径，除特别注明外，均在Icarus的主题文件夹`./themes/icarus/`下。
```diff layout/layout.jsx
             <Head site={site} config={config} helper={helper} page={page} />
-            <body class={`is-${columnCount}-column`}>
+            <body class={`is-3-column`}>
                 <Navbar config={config} helper={helper} page={page} />
```

```diff layout/layout.jsx
                                 'is-12': columnCount === 1,
-                                'is-8-tablet is-8-desktop is-8-widescreen': columnCount === 2,
+                                'is-8-tablet is-8-desktop is-9-widescreen': columnCount === 2,
                                 'is-8-tablet is-8-desktop is-6-widescreen': columnCount === 3
```

```diff layout/common/widgets.jsx
function getColumnSizeClass(columnCount) {
     switch (columnCount) {
         case 2:
-            return 'is-4-tablet is-4-desktop is-4-widescreen';
+            return 'is-4-tablet is-4-desktop is-3-widescreen';
         case 3:
             return 'is-4-tablet is-4-desktop is-3-widescreen';
     }
```

下面的代码用于优化不同屏幕大小下的宽度。

```diff include/style/responsive.styl
 +widescreen()
+    .is-3-column .container
+        max-width: $widescreen - $gap
+        width: $widescreen - $gap
+
     .is-1-column .container, .is-2-column .container
         max-width: $desktop - 2 * $gap
         width: $desktop - 2 * $gap

 +fullhd()
+    .is-3-column .container
+        max-width: $fullhd - 2 * $gap
+        width: $fullhd - 2 * $gap
+
     .is-2-column .container
         max-width: $widescreen - 2 * $gap
         width: $widescreen - 2 * $gap
```

## 优化标题布局

这里将标题移动到正文上方，增加了更新时间，以及相对应的图标。

```diff layout/common/article.jsx
                 {/* Metadata */}
                 <article class={`card-content article${'direction' in page ? ' ' + page.direction : ''}`} role="article">
+                    {/* Title */}
+                    <h1 className="title is-size-3 is-size-4-mobile has-text-weight-normal">
+                        {index ?
+                            <a className="has-link-black-ter" href={url_for(page.link || page.path)}>
+                                <i className="fas fa-angle-double-right"></i>{page.title}
+                            </a> :
+                            [<i className="fas fa-angle-double-right"></i>, page.title]
+                        }
+                    </h1>
                     {page.layout !== 'page' ? <div class="article-meta is-size-7 is-uppercase level is-mobile">
                         <div class="level-left">
                             {/* Creation Date */}
-                            {page.date && <span class="level-item" dangerouslySetInnerHTML={{
-                                __html: _p('article.created_at', `<time dateTime="${date_xml(page.date)}" title="${date_xml(page.date)}">${date(page.date)}</time>`)
-                            }}></span>}
+                            {page.date && <span class="level-item">
+                                <i className="far fa-calendar-alt">&nbsp;</i>
+                                <time dateTime="${date_xml(page.date)}" title="${date_xml(page.date)}">{date(page.date)}</time>
+                            </span>}
                             {/* Last Update Date */}
-                            {page.updated && <span class="level-item" dangerouslySetInnerHTML={{
-                                __html: _p('article.updated_at', `<time dateTime="${date_xml(page.updated)}" title="${date_xml(page.updated)}">${date(page.updated)}</time>`)
-                            }}></span>}
+                            {page.updated && <span class="level-item is-hidden-mobile">
+                                <i class="far fa-calendar-check">&nbsp;</i>
+                                <time dateTime="${date_xml(page.updated)}" title="${date_xml(page.updated)}">{date(page.updated)}</time>
+                            </span>}
                             {/* author */}
                             {page.author ? <span class="level-item"> {page.author} </span> : null}
```

标题下方的发布时间与更新时间均改为直接使用日期。

```diff source/js/main.js
-    if (typeof moment === 'function') {
-        $('.article-meta time').each(function() {
-            $(this).text(moment($(this).attr('datetime')).fromNow());
-        });
-    }
```

## 优化文章结尾布局

在文章结尾增加一个`hr`以调整间距。另外设置在预览时也显示标签（tags），并将`Read More`按钮置于右侧且添加图标。

```diff layout/common/article.jsx
                     {/* Licensing block */}
                     {!index && article && article.licenses && Object.keys(article.licenses)
                         ? <ArticleLicensing.Cacheable page={page} config={config} helper={helper} /> : null}
+                    <hr style="height:1px;margin:1rem 0"/>
+                    <div className="level is-mobile is-flex">
                     {/* Tags */}
-                    {!index && page.tags && page.tags.length ? <div class="article-tags is-size-7 mb-4">
-                        <span class="mr-2">#</span>
-                        {page.tags.map(tag => {
-                            return <a class="link-muted mr-2" rel="tag" href={url_for(tag.path)}>{tag.name}</a>;
+                    {page.tags && page.tags.length ? <div class="article-tags is-size-7 is-uppercase">
+                        <i class="fas fa-tags has-text-grey"></i>&nbsp;
+                        {page.tags.map((tag, index) => {
+                            return <a class="link-muted" rel="tag" href={url_for(tag.path)}>{tag.name}{index !== page.tags.length-1? ', ':''}</a>;
                         })}
                     </div> : null}
                     {/* "Read more" button */}
-                    {index && page.excerpt ? <a class="article-more button is-small is-size-7" href={`${url_for(page.link || page.path)}#more`}>{__('article.more')}</a> : null}
+                    {index && page.excerpt ? <a class="article-more button is-small is-size-7" href={`${url_for(page.link || page.path)}#more`}><i class="fas fa-book-reader has-text-grey"></i>&nbsp;&nbsp;{__('article.more')}</a> : null}
+                    </div>
                     {/* Share button */}
```

## 优化个人信息布局

将下方博客数据统计修改为链接，在`Follow`按钮前增加Github图标。

```diff layout/widget/profile.jsx
-                    <div class="level-item has-text-centered is-marginless">
+                    <a class="level-item has-text-centered is-marginless" href={counter.category.url}>
                         <div>
                             <p class="heading">{counter.category.title}</p>
-                            <a href={counter.category.url}>
+                            <div>
                                 <p class="title">{counter.category.count}</p>
-                            </a>
+                            </div>
                         </div>
-                    </div>
+                    </a>
```

```diff layout/widget/profile.jsx
{followLink ? <div class="level">
-					 <a class="level-item button is-primary is-rounded" href={followLink} target="_blank" rel="noopener">&nbsp;&nbsp;{followTitle}</a>
+                    <a class="level-item button is-primary is-rounded" href={followLink} target="_blank" rel="noopener"><i class="fab fa-github"></i>&nbsp;&nbsp;{followTitle}</a>
                </div> : null}
```

## 目录粘性定位

```diff source/js/main.js
if ($toc.length > 0) {
+        $toc.addClass('column-left is-sticky');
         const $mask = $('<div>');
```

```diff include/style/widget.styl
+#toc
+    max-height: calc(100vh - 22px)
+    overflow-y: scroll
```

# 功能

## 夜间模式

复制下面的代码，然后在`./themes/icarus/source/css/`目录下创建`night.styl`文件并粘贴。

{% codeblock "night.styl" lang:stylus >folded %}
dark-primary-color = rgb(55, 61, 72)
dark-primary-color-hover = rgb(67, 74, 86)
dark-primary-color-active = rgb(44, 49, 58)
dark-font-color = #c0c0c0



#universe
  display: none

.navbar-logo,
.footer-logo
  .logo-img-dark
    display: none

body.night
  background: #0e1225

.night
  // code highlight (https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/atom-one-dark.min.css)
  // navigation bar, cards
  .content code
    color: rgb(203,186,125)

  // night icon changed to fas fa-sun
  #night-nav #night-icon:before
    content: '\f185'

  .navbar-menu
    background-color: inherit
  .navbar-main .navbar-menu .navbar-item
    &:hover,
    &:focus
      color: #ffffff
      background-color: dark-primary-color
  .navbar,
  .card
    background-color: rgba(40, 44, 52, 0.5)
    backdrop-filter: none
    -webkit-backdrop-filter: none

  .card
    &:hover
      background-color: rgba(40, 44, 52, 0.8)

  .footer
    background-color: rgba(40, 44, 52, 0.5)
    backdrop-filter: none
    -webkit-backdrop-filter: none

    &:before
      background-color: rgba(40, 44, 52, 0.5)

  // input

  .input, .textarea
    background-color: dark-primary-color-hover
    border-color: dark-primary-color

  // message
  .message.message-immersive
    background-color: #c2c2c2
    .message-body
      color: #222222
  .message.message-immersive.is-info
    background-color: #bdc3c8 
    .message-body
      color: #004779
  .message.message-immersive.is-warning
    background-color: #cbc8ba
    .message-body
      color: #5b4b00
  .message.message-immersive.is-danger
    background-color: #c6babe
    .message-body
      color: #79000f
  .message.message-immersive.is-success
    background-color: #bfc7c0
    .message-body
      color: #1e4d1c
  .message.message-immersive.is-primary
    background-color: #bdc0c9
    .message-body
      color: #003790





  // button

  .button.is-primary, .button.is-light, .button.is-small
    background-color: dark-primary-color
    color: dark-font-color

    &:hover, &.is-hovered
      color: #ffffff
      background-color: dark-primary-color-hover
    
    &:active, &.is-active
      color: #ffffff
      background-color: dark-primary-color-active

  .button.is-white,
  .button.is-transparent
    background-color: transparent

    &:hover
      background-color: dark-primary-color !important

  .pagination .pagination-next,
  .pagination .pagination-previous
  .pagination-link:not(.is-current)
    color: dark-font-color





  // button

  .button.is-primary, .button.is-light, .button.is-small
    background-color: dark-primary-color
    color: dark-font-color

    &:hover, &.is-hovered
      color: #ffffff
      background-color: dark-primary-color-hover
    
    &:active, &.is-active
      color: #ffffff
      background-color: dark-primary-color-active

  .button.is-white,
  .button.is-transparent
    background-color: transparent

    &:hover
      background-color: dark-primary-color !important

  .pagination .pagination-next,
  .pagination .pagination-previous
  .pagination-link:not(.is-current)
    color: dark-font-color
    background-color: dark-primary-color

    a
      color: dark-font-color

  .pagination-link.is-current
    background-color: dark-primary-color-hover
    border-color: dark-primary-color-hover

  // comment

  .v .vwrap,
  .v .vwrap .vheader .vinput
    border-color: dark-primary-color

  .v .vwrap .vheader .vinput:focus
    border-color: dark-primary-color-hover

  .v .vbtn
    color: dark-font-color
    background-color: dark-primary-color
    border-color: dark-primary-color

    &:hover
      background-color: dark-primary-color-hover
    
    &:active
      background-color: dark-primary-color-active

  .v .vlist .vcard .vhead .vsys
    background-color: dark-primary-color

  .v a:hover,
  .v .vlist .vcard .vh .vmeta .vat
    color: #ffffff

  .v .vlist .vcard .vcontent.expand:before
    background: -webkit-gradient(linear, left top, left bottom, from(rgba(37, 41, 54, 0)), to(rgba(37, 41, 54, 1)))
    background: linear-gradient(180deg, rgba(37, 41, 54, 0), rgba(37, 41, 54, 1))

  .v .vlist .vcard .vcontent.expand:after
    background: rgba(37, 41, 54, 1)

  .v .vlist .vcard .vh,
  .v .vlist .vcard .vquote
    border-color: dark-primary-color-hover

  // font color

  body,
  strong,
  time,
  .title,
  .footer,
  .card,
  .content h1,
  .content h2,
  .content h3,
  .content h4,
  .content h5,
  .content h6,
  .navbar-item,
  .navbar-item.is-active,
  .navbar-link,
  .menu-list a,
  .menu-label,
  .level-item,
  .input,
  .textarea,
  .button.is-white,
  .button.is-transparent,
  .article-licensing,
  .v *
    color: dark-font-color

  .media-content,
  .has-text-grey,
  .link-muted
    color: dark-font-color !important

  a
    color: rgb(82, 153, 224)

    &:hover
      color: #ffffff

  // quote

  .content blockquote,
  .article-licensing
    background-color: dark-primary-color
    border-color: dark-primary-color-hover

  .post-copyright
    background-color: dark-primary-color
    border-color: dark-primary-color-hover

  // table

  .content table thead td,
  .content table thead th
    color: dark-font-color

  .content table td,
  .content table th
    border-color: dark-primary-color-hover

  // break line

  hr
    background-color: dark-primary-color-hover

  // tags and menus

  article.article, article.media

    .title:hover a
      // override anotherr !important
      color: dark-font-color !important

  .tag:not(body)
    color: dark-font-color
    background-color: dark-primary-color

  .tag.is-grey
    background-color: dark-primary-color-hover

  .menu-list a:hover
    background-color: dark-primary-color

  .menu-list a.is-active
    background-color: dark-primary-color-hover

  .menu-list li ul
    border-color: dark-primary-color

  // time line

  .timeline .media:last-child:after
    background-color: rgb(37, 41, 54)

  .timeline
    border-color: dark-primary-color-hover

  .timeline .media:before
    background-color: dark-primary-color-hover

  // search box

  .searchbox
    .searchbox-container,
    .searchbox-header,
    .searchbox-header .searchbox-input,
    .searchbox-header .searchbox-close,
    .searchbox-body,
    .searchbox-result-section,
    .searchbox-result-item
      color: dark-font-color
      background-color: dark-primary-color
      border-color: dark-primary-color-hover

    .searchbox-container .searchbox-result-section .searchbox-result-item:hover,
    .searchbox-container .searchbox-result-section .searchbox-result-item.active,
    .searchbox-container .searchbox-header .searchbox-close:hover
      color: #ffffff
      background-color: dark-primary-color-hover

  // selection

  ::selection
    color: #ffffff
    background-color: rgba(52, 109, 167, 0.8)

  ::-moz-selection
    color: #ffffff
    background-color: rgba(52, 109, 167, 0.8)

  input:-webkit-autofill
    -webkit-text-fill-color: dark-font-color !important
    box-shadow: 0 0 0px 1000px dark-primary-color inset

  .hljs {
    display: block;
    overflow-x: auto;

    padding: 0.5em;
    color: #abb2bf;
    background: #282c34
  }

  .hljs-comment, .hljs-quote {
    color: #5c6370;
    font-style: italic
  }

  .hljs-doctag, .hljs-keyword, .hljs-formula {
    color: #c678dd
  }

  .hljs-section, .hljs-name, .hljs-selector-tag, .hljs-deletion, .hljs-subst {
    color: #e06c75
  }

  .hljs-literal {
    color: #56b6c2
  }

  .hljs-string, .hljs-regexp, .hljs-addition, .hljs-attribute, .hljs-meta-string {
    color: #98c379
  }

  .hljs-built_in, .hljs-class .hljs-title {
    color: #e6c07b
  }

  .hljs-attr, .hljs-variable, .hljs-template-variable, .hljs-type, .hljs-selector-class, .hljs-selector-attr, .hljs-selector-pseudo, .hljs-number {
    color: #d19a66
  }

  .hljs-symbol, .hljs-bullet, .hljs-link, .hljs-meta, .hljs-selector-id, .hljs-title {
    color: #61aeee
  }

  .hljs-emphasis {
    font-style: italic
  }

  .hljs-strong {
    font-weight: bold
  }

  .hljs-link {
    text-decoration: underline
  }
{% endcodeblock %}

接下来需要修改一下样式文件。

```diff source/css/default.styl
  @import 'style'
+ @import 'night'
```

然后在`./themes/icarus/source/js`下创建`night.js`文件，其内容如下：

```js night.js
(function () {
  /**

   * Icarus 夜间模式 by iMaeGoo
   * https://www.imaegoo.com/
      */

    var isNight = localStorage.getItem('night');
    var nightNav;

  function applyNight(value) {
      if (value.toString() === 'true') {
          document.body.classList.remove('light');
          document.body.classList.add('night');
      } else {
          document.body.classList.remove('night');
          document.body.classList.add('light');
      }
  }

  function findNightNav() {
      nightNav = document.getElementById('night-nav');
      if (!nightNav) {
          setTimeout(findNightNav, 100);
      } else {
          nightNav.addEventListener('click', switchNight);
      }
  }

  function switchNight() {
      isNight = isNight ? isNight.toString() !== 'true' : true;
      applyNight(isNight);
      localStorage.setItem('night', isNight);
  }

  findNightNav();
  isNight && applyNight(isNight);
}());
```

最后，还要修改一下下面两个文件。

```diff layout/common/scripts.jsx
			 <script src={url_for('/js/main.js')} defer></script>
+            <script src={url_for('/js/night.js')} defer={true}></script>
        </Fragment>;
```

```diff layout/commom/navbar.jsx
				<div class="navbar-end">
+                        <a class="navbar-item night" id="night-nav" title="Night Mode" href="javascript:;">
+	                        <i class="fas fa-moon" id="night-icon"></i>
+                        </a>
                        {Object.keys(links).length ? <Fragment>
```

## Mathjax自动换行

在文章中，如果一行数学公式过长的话，公式内容会跑到文章栏的外面，非常难看。这里要设置的是使长公式根据页面宽度自动换行显示。

在`./themes/icarus/source/js/`目录下新建一个名为`mathjax-config.js`的文件，其内容如下：

```js mathjax-config.js
document.addEventListener('DOMContentLoaded', function () {
    MathJax.Hub.Config({
        showProcessingMessages: false,
        messageStyle: "none",
        'HTML-CSS': {
            matchFontHeight: false,
            linebreaks: { automatic: true },
        },
        SVG: {
            matchFontHeight: false,
            linebreaks: { automatic: true },
        },
        CommonHTML: {
            matchFontHeight: false,
            linebreaks: { automatic: true },
        },
        tex2jax: {
            inlineMath: [
                ['$','$'],
                ['\\(','\\)']
            ],
            displayMath: [ 
                ['$$','$$'], 
                ["\\[","\\]"] 
            ]
        }
    });
});
```

然后修改下面的文件即可。

```diff layout/layout.jsx
 		<Search config={config} helper={helper} />
             </body>
+            <script type="text/javascript" src="/js/mathjax-config.js"></script>
        </html>;
```

# 样式

## 在页面底部添加创作共用许可协议的图标

按照下面的方法更改代码即可。

```diff layout/common/footer.jsx
                                 const link = links[name];
                                 return <p class="control">
                                     <a class={`button is-transparent ${link.icon ? 'is-large' : ''}`} target="_blank" rel="noopener" title={name} href={link.url}>
-                                        {link.icon ? <i class={link.icon}></i> : name}
+                                        {link.icon ?
+                                            (Array.isArray(link.icon) ?
+                                                link.icon.map(i => [<i className={i}></i>, '\u00A0']) :
+                                                <i className={link.icon}></i>
+                                        ) : name}
                                     </a>
                                 </p>;
                             })}
```

```diff include/schema/common/footer.json
-            "$ref": "/misc/poly_links.json",
```

在`_config.icarus.yml`中添加如下配置：

```yaml _config.icarus.yml
footer:
    links:
        CC BY-NC-SA 4.0:
            icon:
              - fab fa-creative-commons
              - fab fa-creative-commons-by
              - fab fa-creative-commons-nc
              - fab fa-creative-commons-sa
            url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
```

## 按钮背景颜色增加渐变

```diff include/style/widget.styl
 .widget
     .menu-list
         li
             ul
                 margin-right: 0
+        a
+            transition: background-color 0.3s ease-in-out
         .level
             margin-bottom: 0
```

## 挂件卡片增加浮动效果

当鼠标悬浮在卡片上时增大阴影，并且设置渐变动画效果。

```diff include/style/card.styl
 .card
     overflow: visible
     border-radius: $card-radius
+    &:hover
+        box-shadow: 0 6px 15px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1)
```

```diff source/js/animation.js
     setTimeout(() => {
         $('body > .navbar, body > .section, body > .footer').forEach(element => {
             element.style.opacity = '1';
-            element.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
+            element.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out, box-shadow 0.3s ease-in-out';
         });
```

```diff source/js/animation.js
                     element.style.transform = '';
-                    element.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
+                    element.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out, box-shadow 0.3s ease-in-out';
                 }, i * 100);
```

## 修改标签颜色

由于此处新增了夜间模式，所以需要修改两个`.styl`文件。

```diff include/style/widget.styl
	.tags
         .tag:first-child
-            background: $primary
-            color: $primary-invert
+            background: $light-grey
+            color: #4a4a4a

         .tag:last-child
-            background: $light-grey
+            background: #e7e7e7
             color: $white-invert
```

```diff source/css/night.styl
 .title:hover a
       // override anotherr !important
       color: dark-font-color !important

+  .tags
+    .tag:first-child
+      background: dark-primary-color
+      color: dark-font-color
+
+    .tag:last-child
+      background: rgb(45, 51, 62)
+      color: dark-font-color

   .tag:not(body)
     color: dark-font-color
     background-color: dark-primary-color
```

## 滚动条统一改为新样式

Icarus在最近的更新中修改了滚动条的样式。相比之前的系统默认样式，新版本的滚动条看起来更窄并做了圆角化处理。但是Icarus的作者只修改了桌面端的滚动条样式，在移动端或者当桌面端的浏览器窗口变窄时，滚动条会变为之前傻大黑粗的默认样式。为了美观和统一，只需要在`./themes/icarus/include/style/base.styl`文件的末尾添加下面的代码，即可完美解决上述问题。

```stylus base.styl
+mobile()
    ::-webkit-scrollbar
        width: 8px
        height: 8px

    ::-webkit-scrollbar-track
        border-radius: 3px
        background: rgba(0,0,0,0.06)
        box-shadow: inset 0 0 5px rgba(0,0,0,0.1)

    ::-webkit-scrollbar-thumb
        border-radius: 3px
        background: rgba(0,0,0,0.12)
        box-shadow: inset 0 0 10px rgba(0,0,0,0.2)

    ::-webkit-scrollbar-thumb:hover
        background: rgba(0,0,0,0.24)

+tablet()
    ::-webkit-scrollbar
        width: 8px
        height: 8px

    ::-webkit-scrollbar-track
        border-radius: 3px
        background: rgba(0,0,0,0.06)
        box-shadow: inset 0 0 5px rgba(0,0,0,0.1)

    ::-webkit-scrollbar-thumb
        border-radius: 3px
        background: rgba(0,0,0,0.12)
        box-shadow: inset 0 0 10px rgba(0,0,0,0.2)

    ::-webkit-scrollbar-thumb:hover
        background: rgba(0,0,0,0.24)
```



---

参考：

[Icarus 主题自定义 - Alpha Lxy](https://www.alphalxy.com/2019/03/customize-icarus/#页面footer显示一组icon)

[Icarus用户指南 - 主题配置 - Icarus (ppoffice.github.io)](https://ppoffice.github.io/hexo-theme-icarus/Configuration/icarus用户指南-主题配置/)

[Hexo 主题 icarus 4 配置夜间模式 Night Mode - Asahi's Blog (asahih.com)](https://blog.asahih.com/hexo-icarus-night-mode/)

[Hexo折腾系列（四）鼠标指针美化 - 江风引雨の小po站 (luzy.top)](https://blog.luzy.top/posts/486003558/)









