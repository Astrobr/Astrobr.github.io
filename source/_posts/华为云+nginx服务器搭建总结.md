---
title: 华为云+nginx服务器搭建总结
date: 2020-1-8 10:29
categories: 
	- [CS]
	#- [cate2]
	#...
tags: 
	- Nginx
	- Internet server
	- Network Technology
	- Experience
	#...

#If you need a thumbnail photo for your post, delete the well number below and finish the directory.
thumbnail: https://kinsta.com/wp-content/uploads/2018/03/what-is-nginx.png

#If you need to customize your excerpt, delete the well number below and input something. You can also input <!-- more --> in your article to divide the excerpt and other contents.
excerpt: 搭建自己的服务器并不难，只是过程较为复杂。

#You can begin to input your article below now.
---

> 由于自己是去年七月配置好的服务器，有一些细节或者遇到的问题已经记不太清，故本文可能会有不完整的地方，遇到问题请善用搜索引擎，而且服务器的配置方法也不只有这一种。本文主要用作对自己操作步骤和方法的一个总结，以便于日后查阅。

### 购买服务器

首先去[华为云官网](https://www.huaweicloud.com/?locale=zh-cn)注册一个账号。如果是学生，可以搜索“学生”，并进行学生认证。学生认证的步骤参见[学生认证流程](https://support.huaweicloud.com/usermanual-account/zh-cn_topic_0069253575.html)。进行身份验证后可以购买学生优惠套餐，云服务器价格只要99元/年，比阿里云和腾讯云的都要便宜一些。

![华为云学生优惠](https://astrobear.top/resource/astroblog/content/hwcloud_discount.png)

购买完成后，你可以在控制台看到自己现有的资源以及运行情况。

![控制台](https://astrobear.top/resource/astroblog/content/console.png)

### 配置安全组

> 安全组是一个逻辑上的分组，为具有相同安全保护需求并相互信任的云服务器提供访问策略。安全组创建后，用户可以在安全组中定义各种访问规则，当云服务器加入该安全组后，即受到这些访问规则的保护。
>
> 系统会为每个用户默认创建一个默认安全组，默认安全组的规则是在出方向上的数据报文全部放行，入方向访问受限，安全组内的云服务器无需添加规则即可互相访问。默认安全组可以直接使用。
>
> 安全组创建后，你可以在安全组中设置出方向、入方向规则，这些规则会对安全组内部的云服务器出入方向网络流量进行访问控制，当云服务器加入该安全组后，即受到这些访问规则的保护。[^1]

在控制台点击“弹性云服务器ECS”，在这里你可看到你的服务器的公网IP，请记下这个IP地址。然后点击在列表中点击你的服务器的名称。

![选择服务器](https://astrobear.top/resource/astroblog/content/security_groups.png)

进入云服务器管理页面后，点击“安全组”。再点击“Sys-default”可以看到默认安全组。然后下面给出的图片是我目前的安全组设置，仅供参考。选择“入/出方向方向规则”，再点击“添加规则“即可手动添加规则。一般来说，配置的都是入方向的安全组，并且源地址（访问服务器的设备的IP地址）都为“0.0.0.0/0”（所有IP地址）。

通常需要配置如下几个功能：

- SSH远程连接Linux弹性云服务器（协议：SSH，端口：22）
- 公网“ping”ECS弹性云服务器（协议：ICMP，端口：全部）
- 弹性云服务器作Web服务器
  - 协议：http，端口：80
  - 协议：https，端口：433

详细配置请参考[安全组配置示例](https://support.huaweicloud.com/usermanual-ecs/zh-cn_topic_0140323152.html)。

![安全组设置](https://astrobear.top/resource/astroblog/content/sg_settings.png)

![安全组设置](https://astrobear.top/resource/astroblog/content/sg_settings1.png)

配置完成后，可以打开电脑上的终端，用下面的语句测试一下：

`ping 你的公网IP`

出现类似下面的内容就代表成功了：

![ping测试](https://astrobear.top/resource/astroblog/content/ping_test.png)

你可以按下`Ctrl+C`来结束`ping`这个进程。

然后在终端里输入：

`ssh 你的公网IP`

如果你的安全组配置正确的话，会让你输入服务器的登录密码。输入密码（注意：密码是不会显示的）后回车，应该可以看到这样的输出：

![ssh登录](https://astrobear.top/resource/astroblog/content/ssh_login.png)

这个时候，你的终端就已经连接上了服务器的系统了，你在终端里的一切操作都是作用在服务器上的。

### 在服务器上安装nginx

首先请在终端使用ssh登录你的服务器，然后按照下面给出的顺序输入命令。

```shell
yum -y install gcc zlib zlib-devel pcre-devel openssl openssl-devel #安装编译工具及库文件
cd /usr/local/ #切换到目标安装文件夹
wget http://nginx.org/download/nginx-1.16.1.tar.gz #下载最新版本的Nginx
tar -zxvf nginx-1.16.1.tar.gz #解压文件
cd nginx-1.16.1 #进入解压的文件夹
./configure #执行程序
make #编译
make install #安装
cd /usr/local/nginx/sbin #进入Nginx安装目录
./nginx #运行Nginx
```

此时，安装应该已经完成了。打开浏览器，在地址栏中输入你的公网ip。如果看到下图所示内容，就代表安装成功了。

![nginx安装成功](https://astrobear.top/resource/astroblog/content/nginx_install.png)

### 创建属于你自己的域名

在拥有了自己的服务器以后，就可以做很多事情了。但是现在你只能通过IP地址访问自己的服务器，看起来总是有点别扭。另外，如果你想要网站有一定的影响力的话，仅有IP地址会让人几乎找不到你的网站，而且也不符合国家法律规定。所以还是建议大家弄一个自己的域名。

现在市面上的云服务器提供商也都提供域名注册的服务，直接在你的服务提供商的平台上面注册即可。下面我继续用华为云的平台演示。

首先在华为云网站页面的导航栏的搜索框内搜索“域名”，打开第一个链接“域名注册服务”。也可以直接点击这里：[域名注册服务_华为云](https://www.huaweicloud.com/product/domain.html)。

然后你可以在网页中选择你的域名，常见的如`.com`，`.cn`，`.net`等。这些域名会相对比较贵。作为学生党，我选择一个最便宜的域名`.top`，只需要9元/年。

点击你想要的域名后，会跳转到一个新的页面。接下来再次选择你要的域名，并且在“查域名”的搜索框内输入你想要的域名，看看是否已经被占用，如果被占用了就换一个。若显示“域名可注册”，就点击“立即购买”。

![域名购买](https://astrobear.top/resource/astroblog/content/buy_domain.png)

购买完成后，你就拥有了自己域名了！

### 备案

> 备案是中国大陆的一项法规，使用大陆节点服务器提供互联网信息服务的用户，需要在服务器提供商处提交备案申请。
>
> 根据工信部《互联网信息服务管理办法》(国务院292号令)和工信部令第33号《非经营性互联网信息服务备案管理办法》规定，国家对经营性互联网信息服务实行许可制度，对非经营性互联网信息服务实行备案制度。未取得许可或者未履行备案手续的，不得从事互联网信息服务，否则属违法行为。通俗来讲，要开办网站必须先办理网站备案，备案成功并获取通信管理局下发的ICP备案号后才能开通访问。[^2]

这一步不多说了，具体步骤比较繁琐，花费的时间也比较长，需要一两周。网站上有很清晰的[操作方法](https://support.huaweicloud.com/pi-icp/zh-cn_topic_0115820080.html)，请自行查阅，根据步骤操作即可。需要注意一点的是，在审核过程中可能会接到服务提供商打来的电话，不要漏接。

需要注意的是，上面的备案操作是在工信部备案的。完成了在工信部的备案以后还需要公安备案。具体[操作方法](http://www.beian.gov.cn/portal/downloadFile?token=596b0ddf-6c81-40bf-babd-65147ee8120c&id=29&token=596b0ddf-6c81-40bf-babd-65147ee8120c)也请自行查阅。

### 域名解析

在完成一系列繁琐的备案流程以后，你的网站还不可以通过域名访问。只有把你的域名跟服务器的IP地址绑定在一起之后，并且在服务器上修改了配置文件之后才可以。

首先打开管理控制台，在控制台中选择“域名注册”。然后在下面的页面中点击“解析”。

![域名注册](https://astrobear.top/resource/astroblog/content/domain.png)

点击你的域名，显示如下页面。这里显示的是你域名的记录集，前两个记录集应该是预置设置，不可暂停服务。<span id="1">你可以在这基础上添加自己的记录集。</span>

![记录集](https://astrobear.top/resource/astroblog/content/record.png)

点击页面右上角红色按钮以添加记录集。添加记录集的配置如下图所示。下图中给出的例子是添加的“A”型记录集，也即通过`example.com`访问网站。若需要通过`www.example.com`访问网站，则需要为`example.com`的子域名添加“A”型记录集。具体配置参见：[配置网站解析_华为云](https://support.huaweicloud.com/qs-dns/dns_qs_0002.html#section1)。点击“确定”，完成添加。你可以通过`ping 你的域名`来测试你添加的记录集是否生效了。

![添加记录集](https://support.huaweicloud.com/qs-dns/zh-cn_image_0200891923.png)

### 配置nginx

<span id="2">打开</span>你电脑上的终端，输入命令：`ssh 你的IP地址`，输入你的服务器的密码。

进入你的nginx的安装目录：`cd /usr/local/nginx/`。

使用vim打开nginx的配置文件：`vim ./conf/nginx.conf`。

按`I`开始输入。

在最后一个大括号前插入以下内容：

```nginx
server {
	    listen   80; #监听端口设为 80
	    server_name  example.com; #绑定您的域名
	    index index.htm index.html; #指定默认文件
	    root html; #指定网站根目录
}
```

然后按`esc`退出编辑，再按`Shift+zz`保存。

输入：`cd ./sbin`，切换文件夹。

执行命令：`nginx -s relod`，重启nginx服务。

这时候再尝试用浏览器访问你的域名，应该会显示之前出现过的“Welcome to nginx ”的页面了！

### 申请SSL证书

SSL证书可以在数据传输的过程中对其进行加密和隐藏，可以极大地提高数据传输的安全性。拥有SSL证书的网站的请求头都是`https`，并且在链接旁边会出现一把小锁。但是，SSL证书并不是所有网站都必须的，这视你的需要而定。比如，微信小程序的服务器就必须要有域名和SSL证书。另外，出于信息传输的安全性方面的考虑，有SSL证书还是显得更为妥当和专业一点。

现在市面上各大云服务器提供商也都提供配套的SSL证书申请服务，一般都是提供企业级的证书，价格比较昂贵。但是同时网络上也有一些免费的SSL证书服务可以选择。下面还是以华为云的平台为例，简单说明一下如何申请SSL证书。

首先在华为云页面的导航栏的搜索框内搜索“免费证书“，然后点击[亚洲诚信域名型DV单域名SSL证书--免费证书](https://marketplace.huaweicloud.com/product/00301-315148-0--0)，可以看到证书的价格是0.00元。点击“立即购买”。

![购买SSL证书](https://astrobear.top/resource/astroblog/content/buy_ssl.png)

完成购买后请不要立即关闭页面，页面中的订单号在之后还需要用到。尔后，系统会发送”HuaweiCloud账户申请”邮件至用户邮箱，即你在华为云的注册邮箱。

![HuaweiCloud账户申请](https://astrobear.top/resource/astroblog/content/request_account.png)

点击邮件中的登录地址进入系统，并使用邮件提供的账号和初始密码进行登录。登入系统后请修改你的初始密码，然后请根据华为云中给你提供的订单号在该系统中查询你的订单。查询到你的订单以后，需要你补充一些信息，请如实填写。系统会要你填写公司信息，如果只是个人网站，那么公司名称直接填写你的名字即可，公司地址就填写你的住址。

填写完成后会进入审核阶段，系统会给你发送一封邮件。

![证书审核](https://astrobear.top/resource/astroblog/content/check.png)

根据邮件的提示，需要在记录集中添加新的内容。请根据[前文](#1)所述方法，将邮件中的内容添加至新的记录集。填写方法如下图所示。

![填写记录集](https://astrobear.top/resource/astroblog/content/modify_record.png)

填写完成后，可以在本地电脑的终端里输入`nslookup -querytype=txt 你的域名`来测试记录集是否生效。

![测试记录集](https://astrobear.top/resource/astroblog/content/test_record.png)

一般来说，记录集生效后10分钟以内证书就会颁发了。

![证书颁发](https://astrobear.top/resource/astroblog/content/issue.png)

### SSL证书部署

接下来我们要把SSL证书部署到我们的服务器上。

在收到的“证书颁发”的邮件的底部有一条链接，点击这条链接，进入证书管理系统。登录系统，在左侧导航栏中点击“SSL证书”，再点击“预览”，再在右侧的“信息预览”中点击“下载最新证书“。

![下载证书](https://astrobear.top/resource/astroblog/content/download_cert.png)

在弹出的对话框内，选择证书格式为“PEM(适用于Nginx,SLB)”，输入你的订单密码。证书密码可以留空。

![下载证书](https://astrobear.top/resource/astroblog/content/download_cert1.png)

下载完成后，解压下载的压缩包，需要输入你的订单密码（如果你没有设置证书密码）。解压以后可以得到下图两个文件。

![解压缩](https://astrobear.top/resource/astroblog/content/unzip_cert.png)

接下来，打开你的终端，按顺序输入下列命令：

```shell
ssh 你的公网IP #ssh登录，输入你的密码
cd /usr/local/nginx #切换到nginx的安装目录
mkdir ./cert #创建一个新文件夹cert用于存放你的证书
exit #断开与服务器的连接
scp 文件的路径/你的域名.key 你的服务器用户名@你的服务器IP地址:./cert #将.key文件上传到你的服务器的指定目录下
scp 文件的路径/你的域名.crt 你的服务器用户名@你的服务器IP地址:./cert #将.crt文件上传到你的服务器的指定目录下
```

接下来我们需要修改nginx的配置文件。参考[前文](#2)所述方法打开nginx的配置文件。先将你之前插入的内容删除或者使用`#`注释掉，然后在最后一个大括号前插入以下内容：

```nginx
server {
         listen       443 ssl;
         server_name  example.com; #你证书绑定的域名;

        ssl_certificate      /usr/local/nginx/cert/你的域名.crt;
        ssl_certificate_key  /usr/local/nginx/cert/你的域名.key;

        ssl_session_cache    shared:SSL:1m;
        ssl_session_timeout  5m;

        ssl_ciphers  HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers  on;
        
        location / {
            index index.htm index.html; #指定默认文件。
	    			root html; #指定网站根目录。
        }
}
server { #将你的80端口重定向至433端口，即强制使用https访问
  			listen 80;
  			server_name; example.com; #你的域名
				rewrite ^/(.*)$ https://example.com:443/$1 permanent;
}
```

将文件保存以后重启nginx服务。

重启以后你可能会遇到这样的问题：`**unknown directive “ssl” in /usr/local/nginx/conf/nginx.conf:121**`，这是因为你在安装nginx时，没有编译SSL模块。你可以在终端里按照下述步骤解决[^ 3]：

```shell
cd ../nginx-1.16.1 #进入到nginx的源码包的目录下
./configure --with-http_ssl_module #带参数执行程序
make #编译
cp /usr/local/nginx/sbin/nginx /usr/local/nginx/sbin/nginx_bak #备份旧的nginx
cp ./objs/nginx /usr/local/nginx/sbin/ #然后将新的nginx的程序复制一份
cd /usr/local/nginx/sbin/ #切换到sbin目录
./nginx -s reload #重启nginx服务
```

如果重启成功的话，打开浏览器访问你的域名，这时候应该可以在链接旁边看到一个小锁了！

[^1]:https://support.huaweicloud.com/usermanual-vpc/zh-cn_topic_0073379079.html

[^2]: https://support.huaweicloud.com/icprb-icp/zh-cn_topic_0115815923.html
[^ 3]: https://blog.csdn.net/qq_26369317/article/details/102863613

