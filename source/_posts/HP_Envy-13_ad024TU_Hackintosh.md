---
title: HP Envy-13 ad024TU黑苹果安装总结
date: 2020-2-14 22:20:00
categories: 
	- [Hackintosh]
	#- [cate2]
	#...
tags: 
	- macOS
	- Hackintosh
	- HP
	#...

#If you need a thumbnail photo for your post, delete the well number below and finish the directory.
thumbnail: https://astrobear.top/resource/astroblog/thumbnail/hpenvy13hackintosh.jpeg

#If you need to customize your excerpt, delete the well number below and input something. You can also input <!-- more --> in your article to divide the excerpt and other contents.
excerpt: 黑苹果安装的踩坑记录。

#You can begin to input your article below now.

---

### 请先了解以下内容

本文主要介绍在完成黑苹果的基本安装以后的完善过程。对于黑苹果完全没有概念的朋友，请看[这篇文章]()。而本文是在很早的时候开始写的，并在原基础上不断增添了内容。那时候作者还未对EFI做足够的优化，因此本文在现在看来有一些过时。假如你遇到了文章中出现的类似情况，希望可以给你提供一些解决思路。但是一般来说，如果你的**机型和硬件**与我的相同且使用了我提供的EFI的话，基本安装完成以后机器就已经是几乎完美的一个状态了，只需要做很少的优化即可。

- 作者电脑的EFI存放于这个Github仓库中：[HackintoshForEnvy13-ad0xx](https://github.com/Astrobr/HackintoshForEnvy13-ad0xx)。

- 作者电脑型号为`HP Envy-13 ad024TU`，其中部分文件不建议大家直接用于其他型号的电脑。若使用本仓库中文件导致系统故障或崩溃，作者本人概不负责。

- 作者电脑的网卡和硬盘均作了更换。故即使机型相同，直接套用此EFI依旧可能会产生问题，请知照！
- 此EFI一开始是来自于交流群中来源不明的Envy-13通用EFI，里面的内容杂乱无章而且有很多不必要的驱动和补丁，但还是可以将机器驱动起来。经过大半年的维护，我对其中的内容作了一些精简，但是其中的方法依旧相对落后和杂乱。现在的这个EFI基本上是基于[SlientSliver](https://github.com/SilentSliver)的[HP-ENVY13-ad1XX-Hackintosh](https://github.com/SilentSliver/HP-ENVY-13-ad1XX-Hackintosh)修改而来，保留了其中的hotpatch部分，更改了一些驱动和补丁。特此鸣谢！
- 关于本机的功能：
  - CPU：可以正常变频
  - 电源：节能五项似乎没有完全加载，但是电池电量显示正常，使用上没有障碍
  - 显卡：仿冒的`Intel HD Graphics 520`，`ig-platform-id`为`0x19160000`，驱动原生显卡`Intel HD Graphics 620`会产生非常诡异的色阶断层，严重影响观感
  - 睡眠：正常，以前曾有过睡眠唤醒掉蓝牙的问题，现在已经解决
  - 声音：使用的`LayoutID`为`03`，只能驱动底面的扬声器，对于这款笔记本电脑来说，两个扬声器和四个扬声器听起来并无什么差别，对音质有追求的请直接外接蓝牙音响或者使用耳机，插入耳机后音量可以自动调节为之前的设置值
  - 网卡和蓝牙：原配网卡无法使用，我更换为`DW1560`，没有故障出现，Airdrop，HandOff，Sidecar都可以正常使用，可以连接AirPods听音乐并且功能完整
  - 触控板：加载了白苹果手势，但除了四指手势和力度感应之外其他手势都可以用
  - 亮度调节：可调，但是档位间隔不大，最低档位的时候屏幕还是较亮
  - USB接口：四个接口均可正常使用
  - 摄像头：可用
  - 读卡器：无法驱动，有需要的建议使用读卡器
- **声明：仓库中所有文件均可供个人用途和技术交流使用，在转载时请务必标明出处。不得将此仓库中的任何文件用于任何商业活动！**

### 基本安装过程中的一些问题

这部分不是主要内容，但还是讲两句吧。

- 进入不了安装界面：

  首先请确认你安装镜像中的EFI是适用于你的电脑型号的。如果还是不行，请在`Clover`中的`Option`选项中选择`-v`以啰嗦模式启动，这样启动的时候会显示出详细的信息。将最后出现的报错信息拍下来或者整个启动过程录制下来以后，找网友求助吧。

- 安装macOS 10.15的过程中，在啰嗦模式中出现如下图所示报错：![报错内容请注意最后一部分](https://astrobear.top/resource/astroblog/content/hpenvy13hackintosh_1.JPG)

  ​		请在`Clover`中打上如图所示的这个补丁。![补丁图示](https://astrobear.top/resource/astroblog/content/hpenvy13hackintosh_2.png)

- 进入安装界面且开始安装一段时间后，无法继续安装：

  请重新下载镜像，在下载完成以后检查镜像的`md5`值是否正确。如正确，再制作你的镜像U盘。

- 对于10.14.x的镜像进入安装界面后提示应用已经损坏，无法安装：

  请将你的bios时间往前调整至2019年10月25日以前，但是不要调整得太久远。这是因为旧的镜像中的证书会在上述时间以后过期导致无法安装。

### 后续完善中的一些问题

在安装完成以后，便可以进入系统了。但是这个时候的系统还是非常不完善的，需要做很多调整。进入系统后，先在 `关于本机-系统报告`中检查各个硬件项目是否被成功驱动，然后再根据没有成功驱动的项目，安装相对应的驱动或者打必要的补丁。但是前文说过：如果你的**机型和硬件**与我的相同且使用了我提供的EFI的话，基本安装完成以后机器就已经是几乎完美的一个状态了，只需要做很少的优化即可。

如果使用的是与作者相同型号的电脑（型号完全一致，且未更换过任何硬件），以下项目是有故障的

- 网卡未被驱动，无法上网
- 蓝牙未驱动，无法使用蓝牙
- Siri, iMessage, FaceTime, HandOff无法使用

以下项目有可能出现故障：

- 声卡未驱动，没有声音，也无法录音
- 无法调节显示器亮度，在`系统偏好设置`中也没有调节亮度的拖动条
- 触控板未被驱动，无法使用触控板

因此，仅仅完成了系统的安装是远远不够的。此时我们的电脑还无法被称为生产力工具。下面就介绍一些解决故障的办法以及系统优化的办法。

- 首先应当获取软件安装权限，只有在此以后你才可以安装非App Store下载的，或者由非受信任的开发者开发的软件：

  在终端中输入：`sudo spctl --master-disable`

- 建议安装的软件：

  - `Clover Configurator`：用于修改`Clover`的配置文件`config.plist`
  - `Hackintool`：功能强大的黑苹果配置工具
  - `Kext Utility`：用于重建缓存
  - `CPU-S`：用于测试CPU变频档位
  - `MaciASL`：用于修改SSDT

  这些软件可以通过这个[百度云链接](https://pan.baidu.com/s/12Kp9dv8HkVgm1VoVeXmC8w)下载。密码：57qf。

- 机型选择：

  使用`Clover Configurator`打开`config.plist`，确保在`机型设置`中选择`MacBook Pro 14,1`。关于机型的选择，原则上是需要将你的电脑的集成显卡的型号与所选机型的集成显卡型号对应起来的，否则无法驱动你的显卡。具体的选择参见：[黑苹果必备：Intel核显platform ID整理及smbios速查表](https://blog.daliansky.net/Intel-core-display-platformID-finishing.html)。

- 驱动的正确安装方法：

  如果驱动没有正确安装，有极大的可能性会导致重启之后无法进入系统。作者本人就在这个问题上吃了很大的亏。关于驱动的安装，分为两种情况。

  - 操作的是`/EFI/CLOVER/kexts/Other`中的驱动文件。对于这种情况，不需要重建缓存。

  - 操作的是`/Library/Extensions`或者`/System/Library/Extensions`中的驱动文件。如果操作的是这个两个文件夹中的驱动文件，则需要重建缓存。可以通过`Kext Utility`软件或者使用终端命令行来重建缓存。

  重建缓存的命令：`sudo kextcache -i /`。

- 关于网络：

  对于使用安装了Intel（或者其他某些品牌）的网卡的电脑的朋友们，进入黑苹果系统以后网卡是没有驱动的，也就是说这个时候电脑是没有办法上网的。若是电脑安装了某些型号的免驱网卡，在macOS系统下电脑就可以直接连接网络。一般来说，如果不想拆机，可以使用USB网卡。但是使用USB网卡无法使用Siri, iMessage, FaceTime, HandOff等功能。

  **对于Intel的网卡，目前在macOS下是没有很好的办法驱动的。**但是情况也在发生着一些改变。最近远景论坛已经有大佬写出了Intel网卡的驱动，但是还是存在一些问题。有兴趣的可以看看他的GitHub项目里面有没有支持你的网卡的型号：[IntelBluetoothFirmware](https://github.com/zxystd/IntelBluetoothFirmware)。

  对于网络的问题，可以使用USB网卡。或者直接将电脑的网卡拆下并更换为可以使用的免驱网卡。关于免驱网卡型号的选择，可以参考这个网站：[黑苹果建议的无线网卡 Hackintosh Compatible WiFi(20190505增加无线路由器推荐)](https://www.itpwd.com/330.html#)。

  当安装了合适的网卡以后，电脑便可以上网了。这个时候，这台电脑才基本可以投入使用。

- 关于`BCM94352Z(DW1560)`：

  作者使用的就是这种无线网卡。这个网卡是Wi-Fi和蓝牙二合一无线网卡。该网卡的无线局域网功能在macOS和Windows系统下都是免驱的。但是这个网卡在macOS下要驱动蓝牙需要三个驱动文件，分别为：`AirportBrcmFixup.kext`，`BrcmFirmwareData.kext`，`BrcmPatchRAM3.kext`。将这些驱动文件放入`/EFI/CLOVER/kexts/Other`下。注意，该目录下还应当存在`Lilu.kext`，否则驱动文件无法正常工作（仓库中提供的EFI文件夹中都已包含这些驱动文件了）。

  作者的电脑一度出现了电脑睡眠唤醒后蓝牙失效的情况，并被这个问题困扰了很久。一开始是参考了[Broadcom BCM94352z/DW1560驱动新姿势[新方法]](https://blog.daliansky.net/Broadcom-BCM94352z-DW1560-drive-new-posture.html)中的方法，但是问题并没有得到根本解决。之后在`/EFI/CLOVER/kexts/Other`中加入了`ACPIDebug.kext`，将电脑`hibernatemode`的值调整为`0`，并在`蓝牙偏好设置-高级选项`中取消勾选`允许蓝牙设备唤醒这台电脑`后，也没有解决该问题。然后作者尝试重新订制USB驱动来解决这个问题，但是还是没有能够解决这个问题。

  最后，作者更换了最新的蓝牙驱动，才最终完美解决了这个问题。需要注意的是，有时在睡眠唤醒之后，蓝牙图标会短暂的显示为失效状态，然后回复正常。

  在Windows系统下，可以自行安装`驱动人生`软件来安装蓝牙的驱动。

  目前市面上`DW1560`的价格在300元左右。实话说，这个价格完全是因为黑苹果这边的需求炒起来的。而同时社区中也有其他网卡的解决方案，除了上文所提到过的驱动还开发中的部分Intel网卡之外，`DW1820`是另一个价格相对低廉的选择。但是根据社区中的反馈，`DW1820`的表现并不是特别稳定，有可能会出现各种奇怪的问题。因此，作者建议还是直接购买`DW1560`比较好，一步到位，省了各种折腾和闹心。另外，你也可以购买Mac上的拆机网卡或者`DW1830`，后者的价格在500元左右，速度比`DW1560`更快。

- 关于睡眠：

  请打开`Hackintool`软件，并切换到`电源`一栏。再点击红框中的按钮，使得电源信息中红色的两行变为绿色。此操作可能可以解决一些睡眠问题。

  ![睡眠修复](https://astrobear.top/resource/astroblog/content/hpenvy13hackintosh_3.png)

- 定制USB驱动：

  定制USB驱动有可能可以帮助解决一些睡眠上的问题，其操作步骤也十分简单，所以博主强烈推荐大家还是定制一下。在此处附上订制USB驱动的教程：[Hackintool(Intel FB Patcher) USB定制视频](https://blog.daliansky.net/Intel-FB-Patcher-USB-Custom-Video.html)。需要注意的是，你有可能发现在使用了`USBInjectALL.kext`以后仍有端口无法加载/检测不到。你可以尝试在`Clover`的`config.plist`中添加下列`解除USB端口数量限制补丁`来解决这个问题。

  ![解除USB端口数量限制补丁](https://astrobear.top/resource/astroblog/content/hpenvy13hackintosh_5.png)

  ```
  Comment: USB port limit patch #1 10.15.x modify by DalianSky(credit ydeng)
  Name: com.apple.iokit.IOUSBHostFamily
  Find: 83FB0F0F
  Replace: 83FB3F0F
  
  Comment: USB Port limit patch #2 10.15.x modify by DalianSky
  Name: com.apple.driver.usb.AppleUSBXHCI
  Find: 83F90F0F
  Replace: 83F93F0F
  ```

- 开启`HiDPI`使屏幕看起来清晰：

  在终端中输入：`sh -c "$(curl -fsSL https://raw.githubusercontent.com/xzhih/one-key-hidpi/master/hidpi-zh.sh)"`，再按提示操作即可。

  详情请见：[HiDPI是什么？以及黑苹果如何开启HiDPI](https://www.sqlsec.com/2018/09/hidpi.html)。

- 打开`SSD Trim`：

  在终端中输入：`sudo trimforce enable`，然后输入`y`再回车，重复一次，电脑将自动重启。需要注意的是，使用原装SSD的朋友请**不要**打开这个功能，这会导致你的电脑在macOS下非常卡顿，几乎无法操作。

- 电脑卡顿的解决办法：

  在刚安装完黑苹果后，系统大概率会出现极为卡顿的情况。这种卡顿主要表现在：鼠标移动卡顿、动画严重掉帧、开机速度以及应用打开速度很慢、系统资源大量占用、电脑发热严重、无法正常关机。这些问题有的时候不太明显，有的时候则令电脑根本无法使用。上述问题有时在让电脑睡眠一段时间之后重新唤醒即可得到改善，但是无法根本解决。

  出现上述问题的根本原因就在于本型号电脑所使用的SSD——Intel SSDPEKKF360G7H对macOS的兼容并不好。若要正常使用该SSD的话必须在`/EFI/CLOVER/kexts/Other`中添加`HackrNVMeFamily.kext`。你可以在GitHub仓库文件主目录下的`kext`文件夹中找到这个驱动。在添加了这个驱动之后，系统的卡顿现象可以得到非常明显的改善，基本上做到了流畅运行，但是偶尔还是会有些许卡顿。

  解决这个问题最根本的方法还是更换SSD。作者的SSD已经更换为西部数据的SN500，故在EFI文件夹中删除了这个驱动文件。

- 电脑无法调节屏幕亮度的解决办法：

  一般情况下不会出现这样的情况，但是如果发生了，使用`Kext Utility`重建缓存后重启即可。

- 关于本机的`VoodooPS2Controller.kext`：

  在更换了EFI的hotpatch方法以后，最新版本的`VoodooPS2Controller.kext`已经可以正常使用。注意，新版本的`VoodooPS2Controller.kext`需要配合`VoodooInput.kext`使用。下面所说的定制`VoodooPS2Controller.kext`的内容已经过时，但此处仍加以保留，你可以根据自己的喜好按需使用。

  旧版本的`VoodooPS2Controller.kext`存放于GitHub仓库文件主目录下的`kext`文件夹中，它双指手势只支持上下左右滑动，三指手势在修改后实现了下表所述功能。它与新版驱动相比，优点在于：十分稳定，三指手势的识别成功率几乎达到100%，并且双指轻触十分灵敏。

  为迎合macOS调度中心默认的键位，我将该驱动的三只滑动手势的键盘映射作了些许调整，其对应关系如下表：

| 手势     | 原本对应的快捷键 | 修改后的快捷键 | 功能                 |
| -------- | ---------------- | -------------- | -------------------- |
| 三指上滑 | ⌘+ˆ+↑            | ˆ+↑            | 调度中心             |
| 三指下滑 | ⌘+ˆ+↓            | ˆ+↓            | App Exposé           |
| 三指左滑 | ⌘+ˆ+←            | ˆ+→            | 向右切换一个全屏页面 |
| 三指右滑 | ⌘+ˆ+→            | ˆ+←            | 向左切换一个全屏页面 |

- 触控板没有反应的情况：

  一开始我以为是相关驱动没有成功加载的缘故，但是后来发现这是因为触控板被误锁定了。按下电脑键盘右上角的`prt sc`键可以锁定/解锁触控板。

- 关于`CPUFriend.kext`：

  该驱动文件用于实现CPU的变频功能。由于该驱动程序只能根据用户个人的电脑定制，所以请不要直接使用仓库EFi文件夹中所提供的驱动文件。具体安装方法参见：[利用CPUFriend.kext实现变频](https://change-y.github.io/2018/04/30/利用CPUFriend-kext实现变频/)。

  安装完成后，可以使用CPU-S来检测自己电脑的变频档位。

- 打开原生的NTFS读写功能：

  **该操作有一定风险，是否需要开启请自行判断。**

  在macOS的默认状态下，NTFS格式的磁盘是只能读不能写的。但是我们可以将隐藏的功能打开，从而可以对该格式的磁盘进行写操作，详情参考这个链接：[macOS打开原生的NTFS读写功能](http://bbs.pcbeta.com/viewthread-1742688-1-8.html)。

  如果你对NTFS格式的磁盘读写功能有刚需，也有很多相关的软件可供选择。此处略去不表。

- 修复Windows和macOS下时钟不同步的问题：

  对于安装了双系统的电脑，在从macOS切换回Windows之后会发现Windows的系统时间与当前时间不符。解决这个问题的办法是：在Windows下，打开CMD输入下面的命令后回车。

  `Reg add HKLM\SYSTEM\CurrentControlSet\Control\TimeZoneInformation /v RealTimeIsUniversal /t REG_DWORD /d 1`。

- 关于显卡`platform-id`的选择：

  本机的显卡就是`Intel HD Graphics 620`，是属于7代Kaby Lake平台的，其`platform-id`为`0x5916000`，对应机型为`MacbookPro 14,2`。但是经过本人实践发现，如果注入的是HD 620的id，系统显示器输出的`帧缓冲深度(Framebuffer depth)`为诡异的30位，这对应的是10位的显示器。由于电脑显示器本身为8位的，因此10位的颜色输出会导致高斯模糊和半透明的画面出现严重的色阶断层（色带）。一开始我以为是显示器EDID不匹配的问题，但是经过搜索发现，在Kaby Lake平台上，这个问题是因为显卡`platform-id`选择得不对，应该是需要仿冒6代Sky Lake平台的`Intel HD Graphics 520`才可以得到正确的24位的帧缓冲深度输出，如下图所示。

  关于这个问题的具体内容和解决方法可以参看这个[网页](https://www.tonymacx86.com/threads/help-weird-ring-like-blur-and-images-in-mojave.262566/#post-1834064)。

  ![正确的帧缓冲深度](https://astrobear.top/resource/astroblog/content/hpenvy13hackintosh_4.png)



至此，黑苹果的安装和完善就差不多结束了。现在可以登陆iCloud以及其他苹果服务，并安装自己需要的软件了。



附：博主电脑配置

| 型号 | HP Envy-13 ad024TU                                 |
| ---- | -------------------------------------------------- |
| CPU  | Intel Core i7-7500U(2.7GHz)                        |
| RAM  | 8GB DDR4                                           |
| 显卡 | Intel HD Graphics 620                              |
| 硬盘 | ~~Intel SSDPEKKF360G7H 360G~~ （已更换为WD SN500） |
| 网卡 | ~~Intel 7265NGW~~（已更换为DW1560）                |
| 声卡 | ALC295                                             |

