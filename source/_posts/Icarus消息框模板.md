---
title: Icarus消息框模板
date: 2021-08-22 15:00:00
categories: 
	- [Others]
	#- [cate2]
	#...
tags: 
	- Hexo
	- Icarus
	- Template

#If you need a thumbnail photo for your post, delete the well number below and finish the directory.
cover:  https://astrobear.top/resource/astroblog/thumbnail/icarus.png
thumbnail:  https://astrobear.top/resource/astroblog/thumbnail/icarus.png

#If you need to customize your excerpt, delete the well number below and input something. You can also input <!-- more --> in your article to divide the excerpt and other contents.
#excerpt: ...

#If you don't want to show the ToC (Table of Content) at sidebar, delete the well number below. 
#toc: false

#You can begin to input your article below now.

---
Hexo主题Icarus的[示例网站](https://ppoffice.github.io/hexo-theme-icarus/)更新后文章中出现了样式美观的提示框，但是好像这个提示框并不是主题的新特性。查看作者的源码后发现，这个提示框仍然是以HTML代码的形式插入在Markdown文件中的。这里将这些代码整理成一个模板以便日后使用。
<!-- more -->
# 白
<article class="message message-immersive is-white">
<div class="message-body">
<i class="fas fa-info-circle mr-2"></i>
这是一个默认白色消息框，点击<a href="https://astrobear.top">此处</a>以浏览更多。
</div>
</article>
```html
<article class="message message-immersive is-white">
<div class="message-body">
<i class="fas fa-info-circle mr-2"></i>
这是一个默认白色消息框，点击<a href="https://astrobear.top">此处</a>以浏览更多。
</div>
</article>
```

# 黑
<article class="message message-immersive is-black">
<div class="message-body">
<i class="fas fa-info-circle mr-2"></i>
这是一个默认黑色消息框，点击<a href="https://astrobear.top">此处</a>以浏览更多。
</div>
</article>
```HTML
<article class="message message-immersive is-black">
<div class="message-body">
<i class="fas fa-info-circle mr-2"></i>
这是一个默认黑色消息框，点击<a href="https://astrobear.top">此处</a>以浏览更多。
</div>
</article>
```

# 亮
<article class="message message-immersive is-light">
<div class="message-body">
<i class="fas fa-info-circle mr-2"></i>
这是一个默认亮消息框，点击<a href="https://astrobear.top">此处</a>以浏览更多。
</div>
</article>
```HTML
<article class="message message-immersive is-light">
<div class="message-body">
<i class="fas fa-info-circle mr-2"></i>
这是一个默认亮消息框，点击<a href="https://astrobear.top">此处</a>以浏览更多。
</div>
</article>
```

# 暗
<article class="message message-immersive is-dark">
<div class="message-body">
<i class="fas fa-info-circle mr-2"></i>
这是一个默认暗消息框，点击<a href="https://astrobear.top">此处</a>以浏览更多。
</div>
</article>
```HTML
<article class="message message-immersive is-dark">
<div class="message-body">
<i class="fas fa-info-circle mr-2"></i>
这是一个默认暗消息框，点击<a href="https://astrobear.top">此处</a>以浏览更多。
</div>
</article>
```

# 基本
<article class="message message-immersive is-primary">
<div class="message-body">
<i class="fas fa-info-circle mr-2"></i>
这是一个基本消息框，点击<a href="https://astrobear.top">此处</a>以浏览更多。
</div>
</article>
```HTML
<article class="message message-immersive is-primary">
<div class="message-body">
<i class="fas fa-info-circle mr-2"></i>
这是一个基本消息框，点击<a href="https://astrobear.top">此处</a>以浏览更多。
</div>
</article>
```

# 链接
<article class="message message-immersive is-link">
<div class="message-body">
<i class="fas fa-link mr-2"></i>
这是一个链接消息框，点击<a href="https://astrobear.top">此处</a>以浏览更多。
</div>
</article>
```HTML
<article class="message message-immersive is-link">
<div class="message-body">
<i class="fas fa-link mr-2"></i>
这是一个链接消息框，点击<a href="https://astrobear.top">此处</a>以浏览更多。
</div>
</article>
```

# 信息
<article class="message message-immersive is-info">
<div class="message-body">
<i class="fas fa-info-circle mr-2"></i>
这是一个信息消息框，点击<a href="https://astrobear.top">此处</a>以浏览更多。
</div>
</article>
```HTML
<article class="message message-immersive is-info">
<div class="message-body">
<i class="fas fa-info-circle mr-2"></i>
这是一个信息消息框，点击<a href="https://astrobear.top">此处</a>以浏览更多。
</div>
</article>
```

# 成功
<article class="message message-immersive is-success">
<div class="message-body">
<i class="fas fa-check mr-2"></i>
这是一个成功消息框，点击<a href="https://astrobear.top">此处</a>以浏览更多。
</div>
</article>
```HTML
<article class="message message-immersive is-success">
<div class="message-body">
<i class="fas fa-check mr-2"></i>
这是一个成功消息框，点击<a href="https://astrobear.top">此处</a>以浏览更多。
</div>
</article>
```

# 警告
<article class="message message-immersive is-warning">
<div class="message-body">
<i class="fas fa-exclamation-triangle mr-2"></i>
这是一个警告消息框，点击<a href="https://astrobear.top">此处</a>以浏览更多。
</div>
</article>
```HTML
<article class="message message-immersive is-warning">
<div class="message-body">
<i class="fas fa-exclamation-triangle mr-2"></i>
这是一个警告消息框，点击<a href="https://astrobear.top">此处</a>以浏览更多。
</div>
</article>
```

# 危险
<article class="message message-immersive is-danger">
<div class="message-body">
<i class="fas fa-bug mr-2"></i>
这是一个危险消息框，点击<a href="https://astrobear.top">此处</a>以浏览更多。
</div>
</article>
```HTML
<article class="message message-immersive is-danger">
<div class="message-body">
<i class="fas fa-bug mr-2"></i>
这是一个危险消息框，点击<a href="https://astrobear.top">此处</a>以浏览更多。
</div>
</article>
```

