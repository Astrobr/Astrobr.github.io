---
title: Hexo博客的安装和自动部署
date: 2021-08-16 18:00:00
categories: 
	- [CS]
	#- [cate2]
	#...
tags: 
	- Hexo
	- Travis CI
	- Blog
	#...

#If you need a thumbnail photo for your post, delete the well number below and finish the directory.
cover:  https://astrobear.top/resource/astroblog/thumbnail/TravisCI.png

thumbnail:  https://astrobear.top/resource/astroblog/thumbnail/TravisCI.png

#If you need to customize your excerpt, delete the well number below and input something. You can also input <!-- more --> in your article to divide the excerpt and other contents.
excerpt: 填坑。

#If you don't want to show the ToC (Table of Content) at sidebar, delete the well number below. 

#toc: false

#You can begin to input your article below now.

---

> 在2020年年初Astroblog搭建完成的时候，我就打算记录下当时整个服务器搭建和博客的部署过程。这个过程我打算分为三篇文章来水，分别是服务器搭建、Hexo安装与自动部署、博客主题Icarus的自定义。后来由于种种原因，只写完了三篇文章中的第一篇，剩下两篇拖更到现在。前段时间刚好换了电脑，由于当时部署博客的很多细节都不记得了，迁移的过程尤其痛苦，踩了各种坑之后才终于搞定。于是趁热打铁，赶紧把这两个坑填了，权当备忘。

# 关于Hexo

Hexo是一个高效、简洁的博客框架。它基于Node.js，通过几条命令就可以由Markdown文件快速生成静态的HTML网页。静态网站具有轻量、速度快等特点。它的部署非常方便灵活，不但可以部署在服务器上，还可以部署在静态托管网站上，比如Github Pages。本文主要讨论如何将Hexo部署在服务器上。

首先来认识一下Hexo项目中有什么文件：

```yaml
.
├── _config.yml #Hexo的配置文件
├── db.json #Hexo自动生成的文件
├── package.json #插件配置文件，下同
├── package-lock.json 
├── node_modules #生成网站需要用到的Node.js模块
├── scaffolds #存放模板的文件夹
├── source #博客Markdown源文件夹
├── public #存放生成的静态HTML文件
└── themes #主题文件夹
```

一般来说，Hexo部署的过程是这样的：

1. 在本地编辑Markdown文件并通过Hexo生成静态网页，存放于`./public`文件夹中
2. 将`./public`文件夹中的文件复制到远程服务器上
3. 设置服务器访问的网址为博客首页

你同样可以在服务器上配置Hexo环境，将Markdown源文件上传到服务器上编译。不过一般还是推荐在本地编译，这样比较方便，并且还可以预览生成的博客。

下面开始介绍Hexo博客安装和部署的具体操作。

# Windows系统下Hexo的安装与部署

## 安装相关依赖

Hexo是基于Node.js来生成网页的，那么首先就要安装Node.js。Windows用户清前往[Node.js官方下载地址](http://nodejs.cn/download/)下载最新版本的`.msi`格式的安装包，下载之后打开安装包直接安装即可。安装程序可能会询问你是否自动安装必要的工具，这里没有必要勾选这个选项。

![](https://astrobear.top/resource/astroblog/content/install_node.png)

一般来说安装最新版本的Node.js就可以了。但是作者在迁移博客的过程中发现，由于没有更新Hexo至最新版本，使用最新版本的Node.js会导致编译生成的网页全是空白的，所以作者最后还是使用了`v12.22.5`版本的Node.js。有需要的朋友可以在[这里](https://npm.taobao.org/mirrors/node/)下载到历史版本。

## 安装Hexo并撰写博客

根据Hexo官方提供的安装方法，安装过程需要使用npm包管理工具。新版本的Node.js已经集成了npm，所以打开Powershell终端直接按顺序输入下面的命令行进行安装即可：

```shell
npm install hexo-cli -g #安装hexo
cd <dir> #进入选定的博客存放目录
hexo init #在当前目录初始化博客
hexo g #生成博客文件
hexo s #在本地浏览器预览你的博客
```

如果你看到终端输出了类似下面的信息，恭喜你，你的博客已经构建成功了！你可以在浏览器中访问`http://localhost:4000`来预览你的博客。

![](https://astrobear.top/resource/astroblog/content/hexo_init.png)

你可以使用`./scafflods/post.md`作为模板创建你的第一篇博客。使用编辑器打开这个文件，可以模仿下面的内容来编写你的文章。模板中三根横线之间的内容是`yaml`文件头，并不使用Markdown语法，需要注意。

```yaml
---
title: Hello World! #标题
date: 2021-8-17 18:30:00 #按格式填写博文创建的日期
tags: #按照下面的格式添加博文的标签
    - demo
    - hello
    
#在横线下面开始编辑你的博客正文
---
Hello World!
你好，世界！
```

写完以后，将这个文件放入`./source/_posts`文件夹中，该文件夹中的Markdown文件会被编译生成网页。而存放在`./source/_drafts`文件夹中的文件则只是草稿，并不会在网页中出现。

最后，在你的博客目录下，再次执行`hexo g`和`hexo s`两条命令，你编辑的第一篇博客便可以以网页的形式在浏览器中预览了。另外，你还可以通过`hexo clean`命令来清除之前生成的HTML网页。

## 在服务器上部署Hexo

在本地生成了博客网页以后还不够，只有我们将`./public`中的HTML文件上传到服务器之后，其他人才能通过互联网浏览我们的博客。

你可以使用命令行或者FTP客户端来将你的博客上传到服务器上的指定文件夹。由于作者不擅长使用命令行，所以还是使用了`FileZilla`这个有图形化界面的FTP软件来完成这个工作。

最后，你需要将你的服务器的IP地址或者域名定向到你博客的首页。这里以nginx为例简单说说配置方法。

在nginx的配置文件中的`server-location`项中，将`index`的值修改为博客首页的HTML文件，也即`<dir>/public/intex.html`，其中`<dir>`为你在服务器上存放博客`pubic`文件夹的目录。

保存文件并重启nginx服务后，你应该便可以通过你的服务器的IP地址或者域名来访问你的博客了！

# 配置博客自动部署功能

通过上面的方法，可以完成博客的编辑和部署工作。但是每次编辑完成以后，部署工作显得复杂繁琐。有没有一种办法，能够在完成博客的编辑以后，通过简单的操作就可以将博客部署到服务器上呢？答案是有的。我想实现的效果大概是这样：

1. 完成Markdown的编辑以后，直接上传`./source/_posts`文件夹中的源文件
2. 通过某种方式自动生成HTML文件并将其拷贝到服务器上

这样我们就不需要每次都进行复杂的部署，并且可以专注于写作本身。

下面具体来讲一下怎么实现这个目标。

## 什么是持续集成？

想要实现博客的自动化部署，就必须引入持续集成这个概念。

> 持续集成（Continuous Integration, CI）指的是，频繁地（一天多次）将代码集成到主干。持续集成可以使产品快速迭代，同时保证质量。——[持续集成是什么？ - 阮一峰的网络日志](https://www.ruanyifeng.com/blog/2015/09/continuous-integration.html)

一般来说，持续集成可以让人们快速发现错误。在持续集成之后，随之而来的是持续交付和持续部署。持续交付指的是频繁地将软件提交给质量团队或者用户进行评审，如果评审通过，那么久将软件自动部署到生产环境中。我们通常说的持续集成，同时包括了上面三个过程。

对于个人博客而言，持续集成和持续交付通常是一体的，也就是我们编辑博客内容的过程。而现在我们需要实现的就是持续部署的功能，即将自己的博客源文件自动生成网页并部署到服务器上。

实现持续集成，就必须使用相应的工具。目前市面上的主流持续集成工具有：Jenkins、Travis CI、Gitlab CI等。在这里我们使用Github + Travis CI的组合来实现持续集成的功能。

Travis CI是一个依赖于Github的持续集成工具，它从Github的代码仓库中拉取代码。它在检测到仓库文件有更改之后，会在远程自动创建一个虚拟机，然后根据你的Travis CI配置文件编译你仓库中的代码并执行其他一些操作。

需要注意的是，Travis CI的[官方网址](https://travis-ci.com)现在变为**travis-ci.com**而非travis-ci.org。后者现在是只读模式，请务必注意。

## Github授权并生成Token

使用Travis CI首先就要对其授权使其可以访问自己的Github仓库。

进入Travis CI的官网后直接用Github账号登录，根据提示开通Travis CI对仓库的访问授权。你可以选择允许访问所有仓库，也可以指定部分仓库以供访问。

在自动部署的过程中，Travis CI需要通过命令对Github的仓库进行修改操作，这就需要我们登录Github服务。但是在登录的过程中，将自己的密码直接暴露出去是很危险的。所以，这里使用Token（令牌）来代替密码，以增强安全性。

关于生成Github Token的方法，请看[创建个人访问令牌 - GitHub Docs](https://docs.github.com/cn/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token)。

请妥善保存生成的Token。

## 使用Travis CI进行持续集成

### 配置ssh免密登录服务器

自动部署必然会对服务器端的文件进行操作，因此必须远程登录服务器。但是部署过程是由Travis CI自动完成的，我们也无法在Travis CI的控制台中输入服务器的登录密码。因此我们还要能够免密登录服务器。

免密登录是基于密钥对来实现的。密钥对分为私钥和公钥，私钥以明文形式存储，由我们自己保存，千万不可泄露。而公钥由私钥加密而来，在进行ssh免密登录时，在网络中由本地传送到服务器的就是公钥。本地电脑和服务器经过一系列操作后比对生成的校验值，如果校验通过便可以登录到服务器。

ssh免密登录的具体原理可以参考下图（来源：[图解SSH原理 - 简书 (jianshu.com)](https://www.jianshu.com/p/33461b619d53)）。

![](https://astrobear.top/resource/astroblog/content/ssh.jpeg)

接下来讲讲实现方法。

在Powershell中输入：`ssh-keygen -t rsa`。

之后会提示你输入秘钥的名字，如果直接按回车跳过则会使用默认的文件名`id_rsa`。

接着会让你输入并确定需要加密的密码，这里我们直接跳过。

然后我们就可以在`C:/Users/<你的用户名>/.ssh`中看到新创建的两个文件，其中`id_rsa`为私钥，`id_rsa.pub`为公钥。

在刚才的那个文件夹中创建文件`config`，不需要后缀名。其内容如下：

```
# 远程主机名称
Host <你的服务器域名或ip地址>
# 远程主机域名或者 ip 地址
HostName <你的服务器域名或ip地址>
# 认证方式
PreferredAuthentications publickey
# 私钥位置
IdentityFile C:/Users/<你的用户名>/.ssh/id_rsa
# 用户名
User root
```

将公钥复制一份，重命名为`authorized_keys`。然后将`id_rsa.pub`和`authorized_keys`上传到服务器的`~/.ssh`文件夹中。

在终端里输入：`ssh root@<你的服务器域名或ip地址>`。如果不需要密码就可以登录的话，那就说明ssh免密登录设置成功了。

如果在完成了上面的步骤之后在登录服务器时仍然需要输入密码，或者出现了类似下面的报错：

`Permission denied (publickey,gssapi-keyex,gssapi-with-mic).`

那么请尝试执行下面三条命令，更改服务器上`~/.ssh`文件夹的权限。

```
chmod 700 ~/.ssh/
chmod 700 /home/userName
chmod 600 ~/.ssh/authorized_keys
```

### 配置Travis Ci

在博客的的根目录下面创建Travis CI的配置文件`.travis.yml`，并且将下面模板的内容添加到文件中。

```yaml
#设置构建环境为Node.js
language: node_js 
#选择Node.js版本，我这里由于没有更新Hexo，所以使用了较老的版本，该项值一般为"stable"
node_js: 12.22.5 

#设置需要编译的代码分支，Travis CI只检测当前分支的变动，请根据自己的实际情况修改
branches:
  only:
  - hexo

#在每次构建之前需要先配好环境
before_install:
#配置Travis CI免密登录服务器
- openssl aes-256-cbc -K $encrypted_<key>_key -iv $encrypted_<iv>_iv
  -in <id_rsa.enc> -out ~/.ssh/id_rsa -d
- chmod 600 ~/.ssh/id_rsa
- eval $(ssh-agent)
- ssh-add ~/.ssh/id_rsa
- cp ./ssh_config ~/.ssh/config
#配置Github信息以使Travis CI可以更改仓库
- git config --global user.name "$GIT_NAME"
- git config --global user.email "$GIT_EMAIL"
#安装Hexo
- npm install -g hexo-cli

#安装package.json中的插件
install:
- npm install

#生成网页
script:
- hexo clean
- hexo generate

#生成成功之后需要执行的操作（部署）
after_success:
#将./public文件夹中的网页复制到服务器上的指定位置
- scp -o stricthostkeychecking=no -r ./public/* root@<你的域名或IP>:<博客网页存放的路径>
#在Travis CI上切换到你的博客的./public文件夹，在该路径下初始化git，以"Travis CI Auto Builder"的名称提交代码并推送到"master"分支上
- cd ./public
- git init
- git add --all .
- git commit -m "Travis CI Auto Builder"
- git push --quiet --force https://$GIT_TOKEN@<你博客的Github仓库网址>
  master
  
#配置已知的主机，以保证可以成功登陆
addons:
  ssh_known_hosts:
  - <你的域名或IP>
```

观察上面的文件可以发现，其中以`$`开头的变量一共出现了五次。在Travis CI的配置文件中，这些变量为环境变量，它们的值不以明文的形式出现在配置文件中，需要你自己在Travis CI的网页上设置值。

在Travis CI的网页中找到你的博客的仓库。点击右上角的`More options`按钮后再点击`Settings`进入设置页面。

在设置页面中，必须要打开`General`栏中的`Build pushed branches`。否则即使你推送了代码，Travis CI不会自动构建项目。

然后在`Environment Variables`一栏中的空白文本框处，分别填写你的环境变量的名称`NAME`和值`VALUE`，然后点击`Add`按钮以添加。在这一小节，我们需要添加三个环境变量：

|   Name    |                Value                 |
| :-------: | :----------------------------------: |
| GIT_EMAIL |       <填写你Github绑定的邮箱>       |
| GIT_NAME  |        <填写你Github的账户名>        |
| GIT_TOKEN | <填写你在上一节中生成的Github Token> |

### 文件加密

接下来讲讲Travis CI免密登录服务器的配置以及最后剩下的两个环境变量。

类比之前设置本地ssh免密登录服务器的方法，要想让Travis CI生成的虚拟机可以免密登录服务器，其必须要有公钥`id_rsa.pub`、私钥`id_rsa`、以及配置文件`config`。但是直接将私钥以明文形式上传太危险了。Travis CI提供了加密服务，可以将私钥加密以后上传到它的服务器，再在其虚拟机上解密生成私钥。这样一来，Travis CI就可以安全地进行ssh免密登录了。

接下来的加密操作建议在Linux或者macOS下进行，在Windows 10上操作有可能会产生`bad decrypt`的错误。（参见：[File decryption fails (wrong final block length) on Windows · Issue #4746 · travis-ci/travis-ci (github.com)](https://github.com/travis-ci/travis-ci/issues/4746)）

在加密操作之前，请先确认你的电脑上是否安装有ruby，否则无法使用gem包管理工具。

执行下面的命令以安装Travis：`gem install travis`。

登录Travis：`travis login --github-token <token> --pro`。注意这里必须加上后缀`--pro`，否则这个命令默认登录的是`https://api.travis-ci.org`而非`https://api.travis-ci.com`。

在存放有你的私钥`id_rsa`以及`.travis.yml`的目录下执行：`travis encrypt-file id_rsa --add --pro `。如果这个目录不是你存放博客的Github仓库的本地文件夹，那么请按照给出的提示添加后缀。

执行完毕后，在该文件夹下会新增一个`id_rsa.enc`文件。这个文件就是经过加密后的私钥了。检查`.travis.yml`文件，会发现其中多了一行类似于下面的代码：

```yaml
- openssl aes-256-cbc -K $encrypted_<key>_key -iv $encrypted_<iv>_iv  -in id_rsa.enc -out id_rsa -d
```

上面`<key>`和`<iv>`的值是随机生成的数字和字母的组合，该命令的作用在于解密`id_rsa.enc`以得到私钥`id_rsa`。`-in`表示输入文件，`-out`表示解密后的文件，我们将其路径修改为`~/.ssh/id_rsa`，可以得到：

```yaml
- openssl aes-256-cbc -K $encrypted_<key>_key -iv $encrypted_<iv>_iv
  -in <id_rsa.enc> -out ~/.ssh/id_rsa -d
```

此外，在Travis CI对应仓库的设置中，还会新增两个环境变量`encrypted_<key>_key`与`encrypted_<iv>_iv`。

在得到私钥后，我们还要进行下面的操作以使Travis CI可以免密登录服务器。

在`.travis.yml`中按照模板的格式添加以下代码：

```yaml
- chmod 600 ~/.ssh/id_rsa
- eval $(ssh-agent)
- ssh-add ~/.ssh/id_rsa
- cp ./ssh_config ~/.ssh/config
```

然后，将`id_rsa.enc`移入你的博客的根目录下，并切记**删除你在博客目录下的私钥！**。

在博客根目录下新建文件`ssh_config`，将下面的内容复制进去并保存。我们需要它来配置Travis CI上的ssh登录过程。

```
Host *
  User git
  StrictHostKeyChecking no
  IdentityFile ~/.ssh/id_rsa
  IdentitiesOnly yes
```

到这里，所有的配置工作就完成了！

## 最终实现的效果

经过上面的一系列复杂操作，我们最终实现了博客的持续集成，其工作流如下：

1. 在本地编辑Markdown文件
2. 编辑完成后直接推送到Github的目标分支上
3. Travis CI检测到指定分支上文件的更改
4. Travis CI创建虚拟机并依据配置文件生成博客网页文件
5. Travis CI将生成的网页复制到服务器的指定位置，完成部署

在部署的过程中，只有第二步是需要我们进行操作的，其他的工作全部由Travis CI自动完成了，非常的方便。

点击Travis CI对应仓库标题右侧的绿色图标可以将其以Markdown格式添加到你的Github仓库的`readme.md`文件中。如果Travis CI操作的分支不是默认分支，那么这个图标将只显示`unknown`的状态。

![](https://astrobear.top/resource/astroblog/content/build_passing_mark.png)



参考：

[使用 Travis 打造 SpringBoot 应用持续集成和自动部署 | Travis CI 初体验 (juejin.cn)](https://juejin.cn/post/6946220560938434596#heading-13)

[基于 Hexo 的全自动博客构建部署系统 - KChen's Blog](https://kchen.cc/2016/11/12/hexo-instructions/#总结)

