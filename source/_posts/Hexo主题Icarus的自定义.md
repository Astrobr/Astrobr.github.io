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
cover: https://astrobear.top/resource/astroblog/thumbnail/icarus.png
thumbnail: https://astrobear.top/resource/astroblog/thumbnail/icarus.png

#If you need to customize your excerpt, delete the well number below and input something. You can also input <!-- more --> in your article to divide the excerpt and other contents.
excerpt: 填坑。

#If you don't want to show the ToC (Table of Content) at sidebar, delete the well number below. 
#toc: false

#You can begin to input your article below now.

---

Icarus是Hexo的一款简单、精致、现代的主题，也是我的博客目前正在使用的主题。这款主题无论从颜值还是从功能上看都相当优秀，但是针对我的需求而言，仍然有一些不足之处。即使Icarus支持大量的自定义功能以及丰富的插件，要想实现我的目标功能，仍然需要对这个主题进行魔改。此外，在博客迁移的过程中，我还顺便将其版本升级为最新了，在此将其过程一并记录下来以供参考。

# Icarus升级过程

<article class="message message-immersive is-warning">
<div class="message-body">
<i class="fas fa-exclamation-triangle mr-2"></i>
在升级前请务必备份你的原文件！
</div>
</article>

根据主题作者的教程，如果你打算通过修改源代码的方式自定义主题，你必须从源代码安装主题。所以我直接在[该主题的Release](https://github.com/ppoffice/hexo-theme-icarus/releases)下载了其最新版本（4.4.0）的源代码，将文件夹下`./Themes/Icarus/`中现有的旧文件全部删除后，再将新版本的主题文件复制进去。

完成上面的操作以后在终端中执行`hexo clean`，再执行`hexo g`。由于只是将主题由旧版本升级到最新，其使用的相关依赖和包都还没升级。因此，在生成的过程中可能会出现错误。

依照命令行给出的提示，输入：`npm install --save bulma-stylus@0.8.0 hexo@^5.0.2 hexo-log@^2.0.0 hexo-renderer-inferno@^0.1.3 hexo-renderer-stylus@^2.0.0 hexo-util@^2.2.0 hexo-component-inferno@^0.13.0 inferno@^7.3.3 inferno-create-element@^7.3.3`（视实际情况，命令的内容会有所不同），终端会自动安装所需要的依赖。

安装完成后再次尝试生成博客，这时应该不会再报错了。但是，控制台中出现了新的警告：

```
Deprecated as of 10.7.0. highlight(lang, code, ...args) has been deprecated.
Deprecated as of 10.7.0. Please use highlight(code, options) instead.
https://github.com/highlightjs/highlight.js/issues/2277
```

经过查询，这是由Hexo的一个依赖：`hexo-util`引起的，其作者已经在最新的版本中修正了这一错误（参考：[BugFix: Correct highlighting of multi-line element (fix #10 and hexojs/hexo#2291) by seaoak · Pull Request #22 · hexojs/hexo-util (github.com)](https://github.com/hexojs/hexo-util/pull/22)）。因此，只需要在终端中输入`npm install hexo-util --save`将其更新即可。

此外，在更新的过程中，Icarus还会在你的博客根目录创建一个新的主题配置文件`_config,icarus.yml`。这一动作会在终端中以警告的形式表现出来。在完成上述操作后，请不要忘记将旧的主题文件的配置迁移到新的上面。

# 布局

# 样式





