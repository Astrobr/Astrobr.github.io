---
title: 黑苹果入门完全指南
date: 2020-2-14 20:36:00
categories: 
	- [Hackintosh]
	#- [cate2]
	#...
tags: 
	- macOS
	- Hackintosh
	#...

#If you need a thumbnail photo for your post, delete the well number below and finish the directory.
thumbnail: https://astrobear.top/resource/astroblog/thumbnail/hpenvy13hackintosh.jpeg

#If you need to customize your excerpt, delete the well number below and input something. You can also input <!-- more --> in your article to divide the excerpt and other contents.
excerpt: 震惊！黑苹果的背后居然有着这些不为人知的秘密！

#You can begin to input your article below now.

---

### 关于黑苹果

欢迎步入黑苹果的世界！众所周知，Mac因其独特的macOS系统在众多Windows电脑中独树一帜。macOS具有许多与Windows不同的特性和优点（当然，也有不足），而且有些软件在macOS上的优化会比Windows更好或者只支持macOS平台。这就是为什么Mac在市场上一直有着广泛的需求的根本原因——即macOS的独特性。由于苹果的封闭性策略，macOS在正常情况下只能安装在Mac上。而黑苹果的出现，给广大对macOS有需求的人们提供了一个新的选择——你再也不需要为了一个系统去购买在同等硬件或性能条件下价格更为昂贵的电脑了。

黑苹果，意思就是安装有macOS的，可以正常工作的非Mac的电脑，也可以指为非Mac的电脑安装macOS的行为，亦可以指安装在非Mac电脑上的macOS。对于这个词的确切定义还是模糊不清的，不过这不是关键所在。与黑苹果相对，白苹果的含义就非常明显了，也就是苹果的Mac或者安装在Mac上的macOS。

黑苹果的原理就是通过对电脑主板的破解和对系统的欺骗，让macOS以为这是一台Mac，再通过一系列驱动和补丁使得这台电脑可以在macOS下正常运行。需要注意的是：

<font size=4>**将macOS安装在非Mac的电脑上是违反苹果公司的法律条款的！**</font>

所以安装黑苹果是存在一定的法律风险的，这有可能（但是非常非常罕见）导致你的AppleID被锁死。但是一般情况下，苹果公司对这种行为都是睁一只眼闭一只眼。只是随着黑苹果数量上的日益增长，不知道什么时候会引起苹果公司的重视并对此采取措施。而在另一方面，如果你使用黑苹果来牟利的话，性质就完全不同了，你有可能会受到法律的制裁。

由于macOS从一开始就不被允许安装在非Mac的电脑上，因此安装黑苹果绝对不是一件容易的事情，它涉及到对主板的破解，对硬件的驱动，对系统的欺骗，同时也会产生很多奇奇怪怪的bug。黑苹果有很多缺点：

- 不完美的黑苹果相对于白苹果不那么稳定
- 黑苹果在硬件层面上的缺失导致很多功能无法实现，如Touch Bar，Touch ID，力度触控板等
- 安装黑苹果仍需要满足一定的硬件条件，某些型号的硬件在黑苹果下是无法驱动的
- 安装黑苹果费时费力，相当折腾

既然黑苹果有那么多缺点，并且还是非法的行为，那为什么还有那么多人在使用黑苹果并且人数还在日益增长呢？因为黑苹果与同样安装有macOS的电脑相比，还是有其优点的：

- 完美的黑苹果在使用体验上基本不输给Mac

- 黑苹果在同等硬件或性能条件下比起Mac便宜许多
- 黑苹果的定制性和可扩展性在某些方面比Mac强大许多

从黑苹果的优点来看，再结合实际情况，我们可以发现使用黑苹果的人群可以分为以下几类：

- 对macOS有刚需，但是又不想花钱/没钱买Mac的，如某些影视、音乐工作者
- 对macOS有刚需，但是受限于苹果封闭的生态，只能通过黑苹果的高可扩展性来满足自己对硬件的需求的特定行业从业者
- 对macOS没有刚需，具有反叛精神的极客，专门研究操作系统和硬件的工程师，通常这类人也有白苹果
- 对macOS没有刚需，只是想要体验macOS或苹果完整生态却又不想花钱/没钱购买Mac的人

而博主作为一个穷学生，就是属于最后一类的人😂。我折腾黑苹果已经有1年时间，现在自己在用的电脑是惠普的`Envy-13 ad024TU`，装有Windows和macOS两个系统。博主的黑苹果已经基本完美，在使用体验上已经与白苹果相差无几。关于我的黑苹果的更多信息，可以参考我的[GitHub仓库](https://github.com/Astrobr/HackintoshForEnvy13-ad0xx)，或者我的[另一篇博客](https://astrobear.top/2020/02/14/HP_Envy-13_ad024TU_Hackintosh/)，在那篇博客里我主要总结了给自己的电脑安装黑苹果时踩过的一些坑。而这篇文章主要是针对笔记本电脑，让大家对黑苹果有一个初步的了解。看完这篇文章，你就基本入门黑苹果了。

### 黑苹果的原理以及核心

#### 黑苹果的原理

在讨论这个问题以前，我们先要了解一下电脑是怎么启动的。

首先，在你按下开机键以后，电脑上电，各硬件进入了待命状态。CPU（Central Processing Unit，中央处理器）启动以后，按照其在设计时就固定好的功能送出了第一条指令，这一条指令将会使BIOS（Basic Input/Output System，基本输入输出系统）芯片中装载的程序开始执行。BIOS程序可以实现很多功能，比如系统自检，提供中断服务等。但是它最主要的功能则是将存放于硬盘引导区的操作系统引导程序（Boot loader，下文简称引导）装载入内存，再通过引导将操作系统装载进内存。

当然，现在市面上新发售的电脑大部分都已经采用了一种更新的方式来装载引导，也就是所谓的UEFI（Unified Extensible Firmware Interface，统一可扩部件接口）。UEFI作为一种较新的方案，它和BIOS的区别主要是在可扩展性方面。但是除了一些细微的差别，它在整个启动的流程上与BIOS基本相同，且最终目的都是将引导装载进内存当中。另外在开发者圈子中，BIOS和UEFI也常常被混为一谈。因此尽管现在的主流是采用更先进的UEFI，但在下面的叙述中我还是会使用BIOS的概念。这并不会给理解带来困难，只是你们需要知道这两者有些许微妙的区别即可。

也许有人会问，为什么不使用BIOS直接将操作系统装载进内存呢？首先，如果有多个操作系统，那么不同的操作系统的装载过程会有所不同。如果要让BIOS适配不同的操作系统，那么会导致它的体积过于庞大，系统过于复杂，不利于它的的稳定。其次就是，BIOS是固定在BIOS芯片中的，不方便修改。这也导致了我们难以让BIOS对不同的操作系统做适配。因此，我们需要引导来完成操作系统加载的工作。

具体而言，引导需要完成的工作主要有以下几点：

- 初始化其他硬件设备，为系统提供可访问的表和服务
- 为操作系统分配内存空间，再将它加载进内存当中
- 为高级计算机程序语言提供执行环境
- 将控制权移交给操作系统

在此之后，系统的完整的启动过程就结束了，操作系统接管了整个电脑。简而言之，电脑的启动过程可以概括为：`BIOS->Bootloder->OS(操作系统)`。

回到黑苹果上来。我们想要在一款非Mac的电脑上运行macOS，与我们在电脑上运行Windows的最大区别在哪儿？当然是操作系统不同啊！由于macOS与Windows是两个完全不同的操作系统，因此他们启动和加载的过程也完全不同。所以我们肯定不可以用启动Windows的那一套方法去启动macOS，而必须要有专门的适应macOS的一套启动方法（程序）。

我们想要将macOS加载到我们的内存当中，就要对当前我们的启动程序进行修改和适配。回顾上文所说的电脑的启动过程我们可以发现，BIOS是固定在芯片中的，不易修改。那么我们可以操作的部分就只有引导了。所以我们要找到合适的引导程序，使其可以将macOS正确地装载进内存，并给它提供正确的服务，让它可以与硬件正常交流，最终使它正常运行。

通过上面的一番讲解，我们可以发现，安装黑苹果的核心就是引导。而实际上，折腾黑苹果折腾的也主要就是引导。而由于白苹果的硬件，BIOS，和引导都是针对macOS开发的，所以当然不要任何的折腾，开箱即用就行（废话......）。

目前主流的可以用于在非Mac的电脑上启动macOS的引导主要有两个，分别是`Clover`和`OpenCore`（下文简称OC）。由于OC是新开发的引导，目前还在公测阶段，而且其在社区普及率远远不如Clover，所以下面将主要讲解Clover，而对于OC只作非常简单的介绍。

#### Clover

> 启动器的名字`Clover`由一位创建者kabyl命名。他发现了四叶草和Mac键盘上Commmand键（⌘）的相似之处，由此起了Clover这个名字。四叶草是三叶草的稀有变种。根据西方传统，发现者四叶草意味的是好运，尤其是偶然发现的，更是祥瑞之兆。另外，第一片叶子代表信仰，第二片叶子代表希望，第三片叶子代表爱情，第四片叶子代表运气。——摘自维基百科

Clover是一个操作系统引导程序，可以通过新老两种方式进行启动，也就是BIOS方式和UEFI方式。目前主流的操作系统都已经是通过UEFI方式启动的了，如macOS，Windows 7/8/10 (64-bit)，Linux。

所有的引导都是放在电脑硬盘开头部分的引导区（ESP分区）的EFI文件夹中，Clover也不例外。当然，EFI文件中还存放着Windows，Linux，或者其他操作系统的引导。下面就来看看Clover的文件结构吧。

![重要的文件夹和其功能在图中注明](https://astrobear.top/resource/astroblog/content/hack1.png)

在Clover下使用UEFI方式启动的流程是这样的：`UEFI->CLOVERX64.efi->OS`。

下面我将主要根据在实际操作中用到的一些功能来介绍Clover。

- 进入操作系统

  这一步非常简单，开机之后用方向键选择你需要进入的操作系统的卷标，按下回车即可。

  ![图中出现了三种不同系统的卷标(Credit: daliansky)](http://7.daliansky.net/1-main.png)

- 显示帮助

  按下`F1`键会出现帮助信息。

  ![帮助信息(Credit: daliansky)](http://7.daliansky.net/Help_F11.png)

- 更新Clover

  请在[这里](https://github.com/Dids/clover-builder/releases)下载最新版本的`CLOVERX64.efi`并使用它替换掉你的EFI文件夹中的Clover文件夹中的同名文件。

- 开启啰嗦模式启动

  首先我要介绍一下什么是啰嗦模式。一般来说，我们在启动系统的时候只能看到一个进度条或者旋转的表示加载中的图案。而啰嗦模式就是将系统启动时各种详细参数和日志以及报错消息全部显示出来的模式，如下图所示。如果发生了操作系统启动异常/失败的情况，通过开启啰嗦模式，我们可以快速定位到出错的位置。

  开启啰嗦模式的方法很简单。首先选择你想要进入的系统的图标，按空格即可进入下图所示的页面，然后勾选图示选项，再选择`Boot macOS with selected options`启动。

  ![开启啰嗦模式(Credit: daliansky)](http://7.daliansky.net/space-selected.png)

  <img src="https://astrobear.top/resource/astroblog/content/hack2.jpg" alt="开启啰嗦模式的效果" />

- 显示隐藏的卷标

  有的时候在Clover的启动页面中会出现很多以不同方式启动同一系统的卷标（Volume，可以理解为入口），我们可以通过修改Clover的配置文件来隐藏这些卷标，但是有的时候你又需要它们显示出来（比如你要通过进入`Recovery`卷标来关闭macOS的系统完整性保护的时候）。这个时候我们不必重新修改配置文件，只需要在Clover的主界面按下`F3`，即可将隐藏的卷标显示出来。

  关于怎么隐藏卷标，我将在下面介绍。

- 提取DSDT

  DSDT的全称为 Differentiated System Description Table，它是一个描述系统硬件不同信息的表，通过查阅这个表中的信息可以知道你的电脑有什么硬件，它们的名称是什么。知道这些信息有利于我们理顺硬件之间的关系，再通过修改补丁更正硬件信息，以优化操作系统的工作状况。

  在Clover主界面下按`F4`即可将你的DSDT信息保存到`EFI/CLOVER/ACPI/origin/`文件夹中。请注意，DSDT是由多个文件组成的。

- 选择你想要启用/禁用的驱动程序

  通过Clover加载的驱动程序保存在`EFI/CLOVER/kexts/Other`中，这些驱动程序是针对macOS生效的。在上面所说的那个文件夹中包含了很多不同的驱动文件，有些驱动文件之间会产生冲突，而有些驱动文件又是完全没有必要存在的。为了管理和精简你的驱动程序，你可以在Clover中设置你想要禁用的驱动程序以排查各种驱动的工作状况。

  首先你要选择macOS的图标，按下空格键。然后在新的页面中将光标移动到`Block injected kexts`，按下回车后进入该选项。再在新的页面中选择`Other`选项，这个时候你就可以看到你的驱动程序了。勾选你想要禁用的驱动程序以后，按`Esc`回到主页面，再直接回车进入macOS。

  ![选择你想要禁用的驱动程序(Credit: daliansky)](http://7.daliansky.net/BIKChoose.png)

  请注意，你的这一设置只对这一次启动有效，在之后的启动中将不会保留。

- 设置Clover（修改`config.plist`）

  有多种方法进行设置。

  - 你可以在开机以后的Clover主界面下按下按键`O`进入设置页面，然后你就可以选择不同的选项开始修改你的配置文件了，不过一般情况下我们不会使用这种`抽象`的方式来修改

    ![Clover的设置页面(Credit: daliansky)](http://7.daliansky.net/options.png)

  - 使用Clover Configurator来修改

    Clover Configurator是一款运行在macOS下的应用程序，专门用来修改Clover的配置文件。它具有友好的图形化界面，每个选项都有比较详细的功能说明，操作起来比在启动时修改要轻松得多。Clover Configurator的下载链接放在文末。

    在设置以前，你需要在Clover Configurator的`挂载分区`选项卡中挂载你ESP分区（通常情况下这个分区都是隐藏的）。然后在你的Clover文件夹下使用Clover Configurator打开`config.plist`文件，进行修改。修改完成以后，请点击左下角的保存图标（图中以红框标明）。

    ![Clover Configurator的设置界面](https://astrobear.top/resource/astroblog/content/hack3.png)

    ![Clover Configurator的设置界面](https://astrobear.top/resource/astroblog/content/hack4.png)

  - 你还可以使用普通的文本文档编辑器（如Xcode或者Visual Studio Code）打开`config.plist`对其进行编辑，但是这个方法依旧比较`抽象`，不推荐新手或者代码小白这样操作

    ![在Visual Studio Code中打开的Clover配置文件](https://astrobear.top/resource/astroblog/content/hack5.png)

- 增加/删除/修改/查找驱动程序

  在启动以后，你可以使用Clover Configurator挂载EFI分区，然后直接使用访达在驱动文件夹中以可视化的方式管理你的驱动程序。

  当然，你也可以使用`Disk Genius`在Windows下管理你的驱动程序。在下一章节中有关于`Disk Genius`的更多介绍。

- 更换Clover的主题

  Clover提供了很多自定义功能，你可以选择自己喜欢的Clover开机主题。Clover的主题存放在`EFI/CLOVER/themes/`文件夹中，你可以下载你喜欢的主题文件夹并将其保存到上述路径中。然后，你需要在Clover Configurator中的`引导界面`选项卡中填写你想要设置的主题文件夹的名字（如下图）并保存。

  ![修改Clover主题](https://astrobear.top/resource/astroblog/content/hack6.png)

  作者目前用的是一款名为`Simple`的主题，可以点击[此处](https://github.com/burpsuite/clover_theme)下载。在GitHub上还有很多不同的Clover主题可供选择。

  ![作者正在使用的Simple主题](https://astrobear.top/resource/astroblog/content/hack7.png)

- 隐藏你不需要的卷标

  如果你的Clover启动界面有很多引导同一系统的卷标，你可以将他们隐藏起来。具体方法是，Clover Configurator中的`引导界面`选项卡中的`隐藏卷`一栏中填写你想要隐藏的卷标的名称，然后保存文件。

  ![隐藏你不需要的卷标](https://astrobear.top/resource/astroblog/content/hack8.png)

Clover的主要功能就介绍到这里了。由于本文是纯粹的新手向，在这里就不介绍如何配置`config.plist`了。一般来说，只要你能够找到完全对应你机型的EFI文件，基本上就不需要再重新配置Clover了。下面，我们再简单介绍一下新时代的引导工具：OpenCore。

#### OpenCore

OpenCore是一个着眼于未来的先进的开源引导工具，他支持多种主流操作系统的引导。OC的历史使命就是有朝一日代替Clover，成为主流。OC主要有以下几个优势：

- 从 2019 年 9 月以后, Acidanthera（神级大佬，黑苹果现有的大部分驱动目前都是他在开发管理）开发的内核驱动 （Lilu, AppleALC 等）将**不再会**在 Clover 上做兼容性测试（虽然这不能算是优势，但是很关键好吗！）
- OC的安全性更好，对文件保险箱（FileVault）有更强大的支持
- OC使用更先进的方法注入第三方内核驱动（也就是你`EFI/CLOVER/kexts/Other`里面的那些`kext`文件）
- OC在启动体验上会更加接近白苹果

当然，为什么现在OC还未能成为主流，首先是因为它还处于开发阶段，各方面还未达到最成熟的状态；其次是因为OC的配置相对于Clover要复杂许多，而且目前没有像Clover Configurator一样直观的图形化界面的配置工具；最后是因为，OC在社区中普及程度不高，导致遇到问题很难找到现成的案例解决。这些原因使很多人放弃了折腾。但是历史的发展是一个螺旋上升的过程，未来将一定是OC的！（笑）

### 黑苹果的初步安装

讨论完了黑苹果的原理以及核心，下一步就该讲讲如何安装了！但是请大家注意，因为这篇文章主要是面向新手的，所以我只会介绍一些最最基本和通用的操作，目的是为了让大家先把黑苹果装上。而安装完成以后的那些各种优化的操作，包括配置Clover的配置文件，给系统打补丁等定制性比较强的内容，都**不会**在本文中涉及。博主可能在接下来一段很长的时间内陆陆续续更新一些系统优化的内容，敬请期待！闲话少说，我们开始吧！

---

#### 制作安装盘

下面的操作均在Windows系统下进行。

- 在[黑果小兵的部落阁](https://blog.daliansky.net)按照你的需要下载某个版本的系统镜像文件（后缀为`iso`）

- 打开`WinMD5`软件，将下载完成的`iso`镜像文件拖入软件窗口，与网站上提供的`md5`值比对，校验`md5`值是否正确，如不正确，请重新下载（`md5`值相当于一个文件的身份证号码，它的值是唯一的，如果你下载下来的文件的`md5`值与官方提供的不一样，说明你下载的文件可能被修改过或者出错了）

  <img src="https://astrobear.top/resource/astroblog/content/image-20200322163623208.png" alt="校验MD5值" style="zoom:50%;" />

- 找到一个容量为16GB或以上的**空U盘**，插入电脑

- 以管理员身份打开`TransMac`软件，在窗口中左侧列表鼠标右击你的U盘，点击`Restore With Disk Image`

  <img src="https://astrobear.top/resource/astroblog/content/image-20200322164230903.png" alt="Restore with Disk Image" style="zoom:50%;" />

- 点击后有可能会弹出下图所示的警告，是提示你的U盘可能含有已经挂载的卷，请确保你选择的U盘是正确的，然后点击`Yes`

  <img src="https://astrobear.top/resource/astroblog/content/image-20200322164627959.png" alt="请确保你选择的U盘正确！" style="zoom:50%;" />

- 在弹出的窗口中选择你刚才下载好的`iso`文件，点击`OK`，这个时候会**格式化**你的U盘并把系统镜像烧录到你的U盘中，耐心等待安装盘制作完成吧，这一过程大约要持续20~30分钟

  <img src="https://astrobear.top/resource/astroblog/content/image-20200322164435201.png" alt="选择镜像文件" style="zoom:50%;" />

  <img src="https://astrobear.top/resource/astroblog/content/image-20200322165214199.png" alt="等待时间，来杯卡布奇诺" style="zoom:50%;" />

- 制作完成以后会弹出对话框，直接点击`OK`

- 在此之后系统会提示你要格式化U盘，不必理会，直接点击`取消`

---

#### 替换安装盘中的EFI文件

安装macOS时，我们运行的是在U盘上的`macOS安装程序`，这一步与运行macOS其实是差不多的。此时我们的U盘就相当于一个外置的系统盘，需要通过位于U盘上的Clover引导来启动`macOS安装程序`。

为了可以正确引导操作系统，不同型号，甚至不同批次的电脑的EFI文件都是不太一样的。因为这些电脑之间的硬件有所区别，所以你需要确保你的电脑的EFI文件是与你的电脑硬件适配的。这个问题的原理我们已经在前面提到过了。

但是这个软硬件适配的工作对于小白来说极度不友好，因为这需要一部分的数字电路，微型计算机原理，以及代码编写的知识。那有什么办法可以解决这个问题呢？答案就是：“拿来主义”。多亏了开源社区的发展，有许多人在网站上将他们已经完善的EFI文件分享给其他使用同一型号电脑的人。所以你现在要做的就是：找到与你的电脑型号对应的EFI文件，然后下载下来。

daliansky整理了一个清单，里面收集了大量不同机型的EFI文件，你可以在里面找找有没有自己电脑的型号：[Hackintosh黑苹果长期维护机型整理清单](https://blog.daliansky.net/Hackintosh-long-term-maintenance-model-checklist.html)。如果有的话，点击链接，然后将别人提供的这个EFI文件下载下来即可。

这时有人会问了，如果没找到自己电脑的型号怎么办呢？不要气馁，你也可以尝试使用与你的电脑硬件配置类似的其他机型的EFI文件，或者使用daliansky提供的镜像中的通用EFI文件。

按照daliansky的建议，在安装macOS时不必将镜像中的通用EFI文件替换为对应自己机型的EFI文件。但是我个人认为，如果你已经找到了与你的机型对应的EFI文件，那么在安装之前就将其更换，可能会在安装过程中避免一些错误的发生。

下面就来介绍一下如何替换安装盘中的EFI文件吧！

- 打开`DiskGenius`软件，在左侧列表中找到你已经制作好的安装盘，并单击选中

  <img src="https://astrobear.top/resource/astroblog/content/image-20200322172930142.png" alt="选择你已经制作好的安装盘" style="zoom:50%;" />

- 依次双击右侧列表中的`ESP(0)`卷标，`EFI`文件夹，进入如下页面

  <img src="https://astrobear.top/resource/astroblog/content/image-20200322173254704.png" style="zoom:50%;" />

- 单击`CLOVER`文件夹，然后按`delete`键，弹出对话框后点击`删除`，将这个文件夹删除掉

- 选中你从别人那儿拿来的EFI文件中的`CLOVER`文件夹，按下`Ctrl+C`后将窗口切回`DiskGenius`，然后再按下`Ctrl+V`将新的`CLOVER`文件夹复制进去，这样就完成了EFI文件的替换了

---

#### 给硬盘分区

接下来我们要在电脑的硬盘上给即将安装的macOS分配一块足够大的空间。

以下操作均在Windows下的`DiskGenius`软件中进行，且以我的U盘作为示例，操作方法与在电脑内置硬盘上的一样。在进行以下操作之前，请先备份你的文件。

- 打开`DiskGenius`软件，在右侧列表中选中你的硬盘，然后在顶部查看你的硬盘空间分配情况，在顶部最左侧找到你的EFI分区，确保你的EFI分区的空间大于200MB，否则macOS将无法安装

  ![](https://astrobear.top/resource/astroblog/content/image-20200322174413977.png)

- 右键单击你的硬盘，选择`转换分区表类型为GUID`模式，否则macOS将无法安装，如果这个选项是灰色的而下一个选项可选，则无须转换

  <img src="https://astrobear.top/resource/astroblog/content/image-20200322174834408.png" alt="转换为GUID格式" style="zoom:50%;" />

- 右键单击上方的蓝色容量条，点击`建立新分区`

  <img src="https://astrobear.top/resource/astroblog/content/image-20200322175353564.png" alt="建立新分区" style="zoom:50%;" />

- 在弹出的窗口中调整你要分给macOS的容量大小，然后点击`开始`，接下来会有弹窗出现，请**严格遵守弹窗中给出的要求**操作，以免发生意外，然后点击`是`，开始分区

  <img src="https://astrobear.top/resource/astroblog/content/image-20200322175546512.png" style="zoom:50%;" />

  <img src="https://astrobear.top/resource/astroblog/content/image-20200322181027988.png" alt="别怪我没提醒你!" style="zoom:50%;" />

- 分区完成以后，右键单击顶部蓝色容量条，点击`删除当前分区`（因为macOS的磁盘格式为APFS，因此现在对其进行格式化没有意义）

  <img src="https://astrobear.top/resource/astroblog/content/image-20200322181359400.png" style="zoom:50%;" />

---

#### 设置BIOS

前文已经说过，操作系统的启动顺序是`UEFI/BIOS->CLOVERX64.efi->OS`。因此，为了使我们的电脑可以启动安装盘上的`macOS安装程序`，我们还需要正确设置我们的BIOS。

由于不同品牌的电脑使用不同的主板，所以BIOS的设置以及进行操作的键位也千差万别，这里仅以作者的电脑举例。由于作者电脑的BIOS十分垃圾，可供调整的选项寥寥无几，因此下面所给出的操作步骤中的设置配置要求是最基本的。如果你的电脑的BIOS功能足够强大且有很多其他的设置选项的话，请尽量弄懂这些选项的含义，并按照需要进行设置。

- 按下开机按钮以后，迅速按`F10`进入BIOS设置

- 按方向键进入`系统设置`菜单中的`启动选项`，请开启`传统模式`，禁用`安全启动模式`，启用`USB启动`

  <img src="https://astrobear.top/resource/astroblog/content/hack11.JPG" style="zoom:50%;" />

- 按`F10`保存设置，电脑将自动重启

现在BIOS也已经设置完成。做完这些前期准备工作以后，接下来就要正式开始安装系统了！

---

#### 安装系统

下面以macOS 10.15.3的安装过程为例。

- 重启电脑，看到左下角的提示以后，按`esc`暂停启动

  <img src="https://astrobear.top/resource/astroblog/content/hack10.JPG" alt="这是惠普的BIOS操作方法" style="zoom:50%;" />

- 进入`启动菜单`，按`F9`进入`启动设备选项`

- 在列出的一串引导中，选择`USB硬盘（UEFI）`的选项以启动安装盘中的引导，如果你使用的是daliansky提供的较新的系统镜像，安装盘中会出现两个引导，一个是微PE（后面会提到），另一个是Clover，我们需要启动的是Clover

  <img src="https://astrobear.top/resource/astroblog/content/hack12.JPG" style="zoom:50%;" />

- 进入Clover界面以后，按照前文所说过的方法，开启啰嗦模式

- 如果你需要使用镜像中的通用EFI文件，那么请执行下面的步骤，否则直接跳过：

  - 在Clover主界面按`O`进入选项，光标移动到`Configs`后按回车进入进入该选项，这个选项是用来选择需要生效的Clover配置文件的

    ![选择Configs(Credit: daliansky)](http://7.daliansky.net/10.15.3/2_Clover_Configs.png)

  - 选择`config_Install`这个配置文件

    ![选择config_Install(Credit: daliansky)](http://7.daliansky.net/10.15.3/3_Clover_Select_Installer.png)

  - 按两次`esc`返回到Clover主界面

- 在Clover主界面选择卷标`Boot macOS Install from Install macOS Catalina`，然后按下回车，开始引导安装程序

  ![开始引导(Credit: daliansky)](http://7.daliansky.net/10.15.3/1_Clover_Installer.png)

- 这个时候会出现如下图所示的安装日志，如果你很不幸地卡住了，那么你可以参考[macOS Catalina 10.15安装中常见的问题及解决方法](https://blog.daliansky.net/Common-problems-and-solutions-in-macOS-Catalina-10.15-installation.html)，或者附上你卡住的地方的照片和你的电脑配置，在各种交 流 群中询问大佬

  ![这是一个群友的求助图片，出现的问题是卡ec了](https://astrobear.top/resource/astroblog/content/hack2.jpg)

- 如果没有卡住，你的日志会消失，然后出现苹果的logo和进度条

  ![白苹果(Credit: daliansky)](http://7.daliansky.net/Air13/1.png)

- 等待一段时间以后，会出现语言选择界面，请选择中文并点击`继续`，如果有装逼需求或者想练习外语，你也可以选择其他语言

  ![还是选择中文吧(Credit: daliansky)](http://7.daliansky.net/Air13/4.png)

- 选择`磁盘工具`并点击`继续`

  ![实用工具(Credit: daliansky)](http://7.daliansky.net/10.15.3/3.png)

- 进入磁盘工具以后，在左上角右键点击你的磁盘，并选择`显示所有设备`，并找到你之前已经准备好安装macOS的分区

  ![选择显示所有设备](http://7.daliansky.net/10.15.3/4.png)

- 选中你之前已经准备好安装macOS的分区，然后点击`抹掉`，在弹出的窗口中，你需要给你的分区起一个名字，并将格式设置成`APFS`，然后将方案设置为`GUID分区图`，再点击`抹掉`，这一步会将你电脑上的硬盘分区格式化

  ![抹掉磁盘(Credit: daliansky)](http://7.daliansky.net/10.15.3/6.png)

- 操作完成以后，点击左上方`磁盘工具`，在弹出的选项中选择`退出磁盘工具`并返回到安装界面

  ![退出磁盘工具(Credit: daliansky)](http://7.daliansky.net/10.15.3/8.png)

- 在主界面选择`安装macOS`并点击`继续`，再闭着眼睛同意条款

- 在下图所示的界面中选择你要安装的磁盘分区，然后点击`安装`，接下来安装程序会将安装文件复制到你的分区中，这个过程会持续几分钟，待复制完成以后，电脑会重新启动

  ![选择你准备好的那个磁盘分区(Credit: daliansky)](http://7.daliansky.net/10.15.3/12.png)

- 重启之后，按照本节一开始所述方法进入Clover，这时候你会发现，Clover主界面会多出来几个卷标，从现在开始直到安装完成，请都选择`Boot macOS Install form xxx（你给你的macOS分区起的名字）`卷标启动，在安装过程中请耐心等待，无论你做了什么奇怪的事情让你增加了什么奇怪的知识，都不要在出现白苹果logo的时候乱动鼠标或者键盘

- 经过两到三次重启以后，你会发现`Boot macOS Install form xxx`的卷标消失了，新出现了`Boot macOS form xxx`的卷标，选中它，然后进入，再对着白苹果等待几分钟，难得的休息时间马上就要结束了

- 进度条走完，出现设置向导，接下来会让你设置你的国家和地区，语言和输入法，按照你的需要设置即可，然后会进入`数据和隐私`界面，点击`继续`

  ![选择国家和地区(Credit: daliansky)](http://7.daliansky.net/Air13/22.png)

- 接下来会问你是否需要将macOS从你的备份中恢复，黑苹果玩家一无所有，选择`现在不传输任何信息`并点击`继续`

  ![没有备份，无需恢复(Credit: daliansky)](http://7.daliansky.net/Air13/25.png)

- 接下来要你使用Apple ID登陆，这里先跳过

  ![不要登陆！登陆了也没用(Credit: daliansky)](http://7.daliansky.net/10.15.3/15.png)

- 还是闭着眼接受条款

  ![接受就完事了(Credit: daliansky)](http://7.daliansky.net/10.15.3/16.png)

- 接下来你需要创建一个电脑用户，这是一个管理员帐户，请注意，在这里设置了用户名以后，如果未来要更改的话会极为麻烦，建议想清楚了再继续下一步

  ![不要起什么奇奇怪怪的名字(Credit: daliansky)](http://7.daliansky.net/Air13/30.png)

- 进入`快捷设置`页面，点击`继续`，然后会进入`分析`页面，取消勾选`与App开发共享崩溃与使用数据`，黑苹果这种东西自己偷摸着用就行

  ![不要共享(Credit: daliansky)](http://7.daliansky.net/10.15.3/17.png)

- 接下来还会要你设置屏幕使用时间，Siri，以及外观，这些选项按照你的需要设置就行，一路`继续`下去，直到出现`正在设置你的Mac`页面，请稍等片刻

  ![即将完成！(Credit: daliansky)](http://7.daliansky.net/Air13/34.png)

- 终于进入了桌面，这时macOS的基本安装已经完成了！先庆祝一下，折腾的事情还在后头呢（虽然这篇文章不会写吧......）

  ![老二次元了doge](https://astrobear.top/resource/astroblog/content/hack9.png)

---

#### 将引导添加到硬盘并调整顺序

现在，macOS已经成功安装到我们电脑的硬盘上了，但是我们电脑硬盘上的macOS还是通过U盘里的Clover引导的。这就意味着，如果拔掉U盘，我们将不能够启动macOS。所以我们需要将U盘引导区中的Clover文件夹复制到硬盘引导区的EFI文件夹中，以实现脱离U盘启动。这一步的操作与前文`替换安装盘中的EFI文件`这一小节的操作基本是一致的，需要你在Windows系统下使用`DiskGenius`操作，这里就不再赘述了。

如果现在重启电脑，你还是会发现直接进入了Windows的引导而不是Clover。这是因为除了Clover之外，电脑当然还有许多其他的引导项，这些引导项按顺序排列在启动序列之中。现在我们只是把Clover的文件夹放入了硬盘的引导区中，但是还没有把Clover添加到启动序列之中。电脑不知道自己居然还可以用Clover引导macOS，只能继续用老一套方法直接引导Windows启动了。那么下面我们就要告诉电脑，让它知道自己可以使用Clover引导操作系统。下面的操作都是在Windows下进行的。

- 打开`EasyUEFI`软件，你可以看到所有的引导项之中没有Clover，点击红框中按钮创建新的引导项

  <img src="https://astrobear.top/resource/astroblog/content/image-20200405233601042.png" alt="创建引导项" style="zoom:50%;" />

- 在弹出的窗口中，`类型`选择`Linux或者其它操作系统`，`描述`可以随便填写，这里使用的是`CLOVER`，目标分区选择`磁盘0`的ESP分区（唯一可选的那一个）

  <img src="https://astrobear.top/resource/astroblog/content/image-20200405234307270.png" style="zoom:50%;" />

- 在`文件路径`一行中，点击`浏览`，在弹出的窗口中显示了一个硬盘的图标，这个就是你电脑上硬盘的ESP分区了，点击它左侧的加号将其展开，在EFI文件夹中找到`CLOVERX64.efi`，这个就是Clover的引导文件，选中后点击`确定`

  <img src="https://astrobear.top/resource/astroblog/content/image-20200405234725001.png" style="zoom:50%;" />

- 回到原先的界面之后，点击`确定`，可以发现Clover已经添加到启动序列中了

- 到这里还没结束，因为Clover被上面众多引导项压着，启动的时候怎么也轮不到它，因此我们点击红框中的按钮，将Clover移到启动序列的第一位，使电脑开机的时候默认使用Clover引导操作系统

  <img src="https://astrobear.top/resource/astroblog/content/image-20200405235126649.png" style="zoom:50%;" />

现在再重启电脑，不要按`esc`暂停启动，电脑会默认使用Clover进行引导。选择macOS分卷，按回车进入。如果成功启动了，那么你便可以重新设置你的BIOS，将`传统模式`关闭了（但不要开启`安全启动模式`）。

到这里，macOS的前期安装已经正式完成！夸赞一波自己吧！

---

#### 黑苹果单系统安装

按照上面所说的步骤，如果不出问题，你便在电脑上成功安装了Windows和macOS双系统。如果你只需要macOS的单系统，操作步骤与上面所说有些许不同，但是绝大部分步骤是一样的，唯一的区别在于`给磁盘分区`和`将引导添加到硬盘并调整顺序`这两部步。如果你在制作安装盘的时候，下载的是daliansky提供的较新系统版本的镜像，或者你在制作完系统启动U盘以后，在`此电脑`中可以看到有诸如`微PE`字样的磁盘，那么下面步骤中的前三步可以省略掉。大致的操作方法如下：

- 于[官网](http://www.wepe.com.cn/download.html)下载`微PE工具箱V2.0 64位版本`
- 打开软件，将微PE工具安装到你的已经制作好的macOS安装盘中
- 将`DiskGenius`和`UEFIManager`拷贝到微PE的文件盘中（微PE系统中本身自带非专业版的`DiskGenius`，某些功能有缺失）
- 设置BIOS
- 重启，在BIOS中使用安装盘中微PE的引导启动
- 进入系统后你可以发现界面与Windows10几乎一样，运行你存放在U盘中的`DiskGenius`，删除你硬盘中Windows使用的分区，并删除硬盘EFI分区的Windows文件夹
- 将硬盘分区表类型转换为`GUID`格式
- 按照你的需要以及前文所述要求，重新分配你的硬盘分区，并将他们格式化
- 接下来就是安装系统了，如果一切顺利进入了macOS的桌面，你可以继续下面的步骤
- 重启，使用安装盘中微PE的引导启动
- 运行`DiskGenius`，将安装盘EFI文件夹中`CLOVER`文件夹复制到电脑硬盘的EFI文件夹中
- 运行`UEFIManager`，然后参考上文所说的方法，添加并调整你的引导项
- 如果没有问题，关闭BIOS的`传统模式`启动
- 大功告成！

### 安装完成后可能出现的问题

完成macOS的安装并不代表你的电脑就已经是可堪重用的生产力/娱乐工具了。绝大多数情况下，刚刚完成安装的黑苹果还会存在着各种各样的问题。即使你使用的是完全对应你的电脑型号的EFI文件，依然有大概率会出现这些问题。**黑苹果的折腾之处不是安装macOS的过程，而是完全解决这些问题的过程。**所以这就是为什么我建议大家不要在安装的最后几步（包括完成安装以后）登陆你的苹果服务，因为你的电脑存在的一些问题会导致苹果服务登不上去，而且折腾的过程也有可能把你的Apple ID中的信息搞乱，就像下图一样。

<img src="https://astrobear.top/resource/astroblog/content/hack13.JPG" alt="瞬间富有" style="zoom:50%;" />

安装完成以后，大家可以检查一下自己的电脑有没有出现下面列出的这些问题。下面的检查大部分都在macOS的设置中完成，还有一些直接观察即可。在每个问题的末尾都会给大家提供一些解决问题的思考方向，但并不会提供具体的解决办法。另外还附上了无故障发生的效果图供大家参考。

- 网络与蓝牙的问题：下面的这些问题与你的**网卡的型号或者驱动**有关

  - 打开`系统偏好设置-网络`选项，里面没有有Wi-Fi选项，即使有也打不开Wi-Fi
  - 打开`系统偏好设置-蓝牙`选项，无法开启蓝牙
  - 无法使用随航
  - 无法使用Siri，FaceTime，iMessage

  ![](https://astrobear.top/resource/astroblog/content/hack14.png)

  ![](https://astrobear.top/resource/astroblog/content/hack15.png)

- 声音的问题：这个问题的表现形式很多，出现这些问题是因为**声卡没有驱动**

  - 打开系统`系统偏好设置-声音`选项，无法调节音量
  - 勾选`当更改音量时播放反馈`再调节音量，电脑没有声音
  - 麦克风没有输入电平的变化
  - 使用快捷键调节音量，喇叭图标下出现禁行标志

  ![](https://astrobear.top/resource/astroblog/content/hack16.png)

- 触控板的问题：触控板根本没有反应，或者在`系统偏好设置-触控板`选项中某些手势无法使用，或者某些功能不显示，这个问题与你的**触控板驱动**有关

  ![](https://astrobear.top/resource/astroblog/content/hack17.png)

- 显示的问题：这个问题也涉及到很多方面，注意**下面给出的图片是错误示例，不是正确的打开方式**

  - 色偏严重：这个问题与你的**显示器描述文件和EDID**有关

    ![严重的色偏](https://astrobear.top/resource/astroblog/content/hack18.JPG)

  - 文字显示过小，图标与文字比例失调：这个问题与你的**EDID以及是否开启了HiDPI**有关

    ![失调的比例](https://astrobear.top/resource/astroblog/content/hack19.png)

  - 出现颜色断层：这个问题与你的**EDID和显卡缓冲帧**有关

    <img src="https://astrobear.top/resource/astroblog/content/hack20.jpg" alt="断层的色彩" style="zoom:50%;" />
    
  - 无法调节亮度：在`系统偏好设置-显示器`选项中没有亮度调节条，键盘上的亮度调节快捷键也没有反应，这个问题可能与你的**亮度调节驱动或者系统补丁**有关

- 电源管理的问题：这个问题的表现形式很多，导致这个问题产生的原因也很多

  - 节能管理未加载：在`系统偏好设置-节能`选项中没有将4个（台式机为5个）选项全部加载，出现这个问题是因为你**没有加载macOS原生的电源管理**

    ![](https://astrobear.top/resource/astroblog/content/hack21.png)

  - 睡眠失灵：睡眠秒醒或者睡眠自动关机/死机/重启，这个问题与你的**电源管理或者USB驱动**有关

- USB总线的问题：USB接口部分或者全部失灵，打开`Photo Booth`后摄像头无画面，这个问题与你的**USB驱动**有关（话说回来`Photo Booth`还是蛮有意思的😂）

- 独立显卡无法驱动：黑苹果下只有部分独立显卡可以驱动，如果你的独显**有独立输出并且满足特定型号要求**的话可以尝试将其驱动，否则你就需要屏蔽独显，使用集显了，这里不展开叙述

另外，你也可以在`左上角苹果图标-关于本机-系统报告`中直接查看你电脑的硬件情况。通过检查各个硬件的驱动情况和相关数据，一样可以判断你的电脑是否会有上面的问题。

上面给大家介绍的都是一些典型的问题，你也有可能遇到其他的疑难杂症。希望大家面对问题不要望而却步，尽情享受折腾的过程吧！

(～￣▽￣)～

### 黑苹果相关资源推荐

折腾黑苹果，宜广集信息，多多提问；忌盲目瞎搞，重复建设。

#### 黑苹果相关优秀网站

- [黑果小兵的部落阁](https://blog.daliansky.net)：也就是daliansky——国内黑苹果领军人物的博客，他的网站会非常及时地更新系统镜像并不定时地提供一些精品教程
- [IT密码](https://www.itpwd.com)：网站上面的资源非常丰富，从系统镜像到软件资源再到方法技巧一应俱全，博主也是非常牛啤的
- [OC简体中文参考手册](https://oc.skk.moe)：由业界大佬合力完成，仍在维护中，学习OC必备
- [GitHub](https://github.com)：这个不用多说了，绝大部分黑苹果软件和驱动的来源，全球最大同性交友网站🐶，神奇的地方
- [远景论坛](http://www.pcbeta.com)：国内最主要的黑苹果交流论坛，注册需要邀请码
- [tonymacx86](https://www.tonymacx86.com)：国外知名的黑苹果交流论坛，资源丰富，需要一定的英语能力
- [insanelymac](https://www.insanelymac.com/forum/)：与tonymacx86类似的论坛

#### 黑苹果软件、驱动资源

下面只列出了一些至关重要的驱动和软件，其他功能的还有很多，这里就不一一列出了。

- [Clover Configurator](https://mackie100projects.altervista.org/download-clover-configurator/)：Clover的图形化配置软件
- [Hackintool](https://github.com/headkaze/Hackintool/releases)：黑苹果完善必备工具
- [Clover](https://github.com/CloverHackyColor/CloverBootloader/releases)：在这里可以找到已经编译好的Clover
- [Lilu.kext](https://github.com/acidanthera/Lilu/releases)：众多常用驱动的依赖
- [AppleALC.kext](https://github.com/acidanthera/AppleALC/releases)：常用声卡驱动
- [VoodooPS2Controller.kext](https://github.com/acidanthera/VoodooPS2/releases)：PS2总线输入设备（鼠标，键盘，触控板）的驱动，此外对于I2C总线的输入设备还有VoodooI2C.kext
- [VoodooInput.kext](https://github.com/acidanthera/VoodooInput/releases)：VoodooPS2Controller的依赖
- [WhateverGreen.kext](https://github.com/acidanthera/WhateverGreen/releases)：用于驱动Intel集成显卡
- [FakeSMC.kext](https://bitbucket.org/RehabMan/os-x-fakesmc-kozlek/downloads/)：必备驱动，用于仿冒SMC设备，欺骗macOS，让它以为我们的电脑就是Mac



### 声明与致谢

黑苹果社区的健康需要大家共同维护，恳请新人们注意以下几点：

- 不要把社区的成果（如各种机型的EFI，开源软件等）拿来作商业用途
- 不要购买淘宝上面的EFI！所有现存的EFI都可以在网上免费获得！请不要支持那些兜售EFI的无良商家，他们也是从网上下载的
- 不建议去淘宝上购买安装黑苹果的服务，出了问题到最后还是要你自己解决
- 不建议把自己的折腾成果在网络上有偿提供，这样并不利于社区的发展
- 网友没有义务去无偿地帮你解决问题，另外也请善用搜索引擎

黑苹果一开始是极客的产物，是反叛精神的象征。令人意料不到的是，现在它居然可以为我们普通人所用。而从极客到大众的过渡，黑苹果的开源社区对此作出了极大贡献。对那些对社区做出过极大贡献的极客和工程师们，对社区建设贡献出自己的一份力量、努力维护社区健康发展的成员，我向你们表达最诚挚的感谢。没有社区，就没有黑苹果的今天。作为从社区中获益的普通成员，也应该通过自己的努力，以自己的方式去回馈这个社区，帮助它更好地发展。

博主在此谨向你们表达我的感谢：[RehabMan](https://github.com/RehabMan)，[Acidanthera](https://github.com/acidanthera)，[黑果小兵](https://blog.daliansky.net)，[SlientSliver](https://github.com/SilentSliver)，[IT密码](https://www.itpwd.com)，以及其他给予过我帮助的网友或开发者们😘。



附：[软件度盘链接](https://pan.baidu.com/s/17yVMb2FQyzfK2sAYbHuZnw) ，密码：3lkx。
