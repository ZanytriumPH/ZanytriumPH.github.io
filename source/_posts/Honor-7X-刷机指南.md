---
title: Honor 7X 刷机指南
date: 2026-01-21 19:14:01
tags: [服务器, Linux, Android]
categories: [刷机]
description: "在我 2025 秋季学期的选修课 “自动化测试” 的代码大作业中，有将自行实现的模糊测试工具在目标程序上运行 24h 的…"
priority: 999
cover: /assets/img/posts/Honor-7X-刷机指南/flash1.webp
---

## 0 前言

在我 2025 秋季学期的选修课 “[自动化测试](https://github.com/ZanytriumPH/FuzzerProject)” 的代码大作业中，有将自行实现的模糊测试工具在目标程序上运行 24h 的要求，若有服务器则可免受电脑本地运行的劳役。加之好友对其刷机成果的分享，遂诞生了将闲置手机刷机为 **“口袋服务器”** 的想法。

寒假回家后，候选者仅有一台相对完好的 **Honor 7X**。但一方面华为/荣耀早在 2018 年就关闭了 Bootloader 解锁服务，另一方面国内外对该机型的刷机教程也较为稀缺，国内相关视频评价其刷机为 “**逆天难度**”。

但想体验一把当 “**极客**（geek）” 的感觉，仍决定 “明知山有虎，偏向虎山行”，一探究竟是否 “误闯天家”。

### 设备参数

| 参数 | 值 |
| :--- | :--- |
| 设备名称 | Honor 7X |
| 型号 | BND-AL10 |
| 系统版本 | EMUI 9.1.0 （基于 Android 9） |
| 处理器 | Kirin 659 |
| 运行内存 | 4 GB |
| 手机存储 | 32 GB |
| Bootloader 状态 | 未解锁 |

### 主要流程

1. 解锁 **Bootloader**
2. 跳过 TWRP 界面直接获取 **Root**
3. 使用 **Linux Deploy** 部署服务

### 风险提示

刷机有**变砖**风险！刷机有**变砖**风险！刷机有**变砖**风险！
且会导致手机保修失效。请务必谨慎操作，且自行承担风险。

## 1 解锁 Bootloader

### 1.1 前备知识

Bootloader（简称 bl）是手机开机时首先运行的程序，负责初始化硬件并加载操作系统。大多数手机厂商会锁定 Bootloader 以防止用户刷入非官方固件，从而保护设备的安全性和完整性。

> “boot” 即 “启动”，“loader” 即 “加载程序”。

手机的 boot 流程和电脑类似，步骤固定且不可逆：

- 通电自检：按下开机键，手机硬件先执行固化在芯片里的 ROM 程序，检查 CPU、内存、存储等核心部件是否正常
- 加载 Bootloader：自检通过后，自动运行 Bootloader 程序
- 引导系统：Bootloader 根据指令，选择加载手机系统（Android） 或恢复模式（Recovery）
- 启动完成：操作系统加载驱动、桌面程序，最终进入可操作界面

解锁 Bootloader 意味着允许用户刷入自定义的恢复环境和操作系统，但也会带来安全风险，如数据泄露和设备不稳定。

#### 为什么要解锁 Bootloader ？

- **获取 Root 权限**：通过刷入 Magisk 等工具，获得超级用户（Root）权限
- **安装第三方 ROM**：如 LineageOS，获得更纯净或功能增强的系统体验。
- 修改内核与性能调优
- 探索非 Android 系统

#### 怎么解锁 Bootloader ？

一种通用且常见的方法是先获取手机**解锁码**，再让手机进入 Fastboot 模式:

- 这是手机在启动 Android 系统之前进入的一种特殊状态
- 在此模式下，手机的系统内核尚未加载，它停留在 Bootloader 阶段

通过 Fastboot 工具，向手机发送相关命令，执行解锁操作。

区别于小米和一加等厂商，华为/荣耀在 2018 年关闭了**官方的解锁码申请通道**，这里只能采用通过其他途径解锁的方式。

### 1.2 准备工作

#### 电脑上

1. **安装 [ADB 和 Fastboot 工具](https://developer.android.google.cn/tools/releases/platform-tools?hl=zh-cn)**：在电脑上安装 ADB（Android Debug Bridge）和 Fastboot 工具，用于与手机进行通信和刷机操作
2. **根据 [PotatoNV](https://github.com/mashed-potatoes/PotatoNV) 文档**下载[相关软件](https://github.com/mashed-potatoes/PotatoNV?tab=readme-ov-file#unlocking-the-bootloader)，PotatoNV 是一款免费的华为/荣耀手机 Bootloader 解锁工具（仅针对其中使用特定麒麟芯片的机型），更详细的说明可参考其官方文档

![alt text](/assets/img/posts/Honor-7X-刷机指南/flash2.webp)

#### 手机上

1. **启用开发者选项**
   - 进入 “设置” > “系统” > “关于手机”，连续点击 “版本号” 七次，开启开发者选项
   - 返回 “设置” > “系统” > “开发人员选项”
     - 启用 “USB 调试”
     - 启用 “OEM 解锁” （如果有）
2. **确保电量充足**
3. **手机关机**

#### 现实中

1. **数据线**：确保连接手机与电脑后，电脑能识别手机
2. **导电镊子**：金属镊子，头要尖细，非绝缘体，用于短接主板测试点
3. **螺丝刀**：建议使用套具，用于拆卸后盖和电池排线上的金属盖板的螺丝
4. 坚硬的薄片：用于撬开后盖

### 1.3 解锁步骤

#### 1.3.1 拆后盖

- 取出 SIM 卡托（否则会强行掰断）
- 拆下充电口附件的两个螺丝
- 使用吹风机加热后盖四周（一开始撬不开，加热后确实就撬开了）
- 使用撬片从充电口处撬开后盖
  - 屏幕与盖交界处，按垂直充电口方向插入撬片，沿边缘缓慢撬开，注意不要用力过猛以免损坏内部元件
  - 撬开后不要完全取下后盖，避免指纹识别排线损坏

拆开后如图所示：

![图1](/assets/img/posts/Honor-7X-刷机指南/flash3.webp)

- 蓝色部分是接下来断电要拆下的螺丝
- 红色的两个点是要**短接的测试点**

#### 1.3.2 断电池排线

- 拆下上图蓝色部分的两个螺丝，取下金属盖板

取下后如图所示：

![图2](/assets/img/posts/Honor-7X-刷机指南/flash4.webp)

- 使用**绝缘体**轻轻撬起电池排线接口（图中红色部分），断开电池连接

#### 1.3.3 短接测试点

> 如果是不同型号的手机，请自行搜索对应的测试点位置

- 使用导电镊子短接**第一张图片**红色标记的两个测试点
  - 即镊子两头分别接触两个点
- 保持短接状态，连接数据线到电脑
  - 建议数据线在短接前先连接好电脑端，短接后只需插入手机端
- 连接成功后，电脑会有提示音，此时可松开短接
  - 查看设备管理器，在 “端口（COM 和 LPT）” 下应出现 “HUAWEI USB COM 1.0”
  - 若无，则断开数据线，重复以上步骤

![alt text](/assets/img/posts/Honor-7X-刷机指南/flash5.webp)

#### 1.3.4 启动 PotatoNV

- 打开 “PotatoNV” 文件夹，双击运行 “PotatoNV-next”
  - “Target device” 应能自动识别
  - “Bootloader” 选择 “Kirin 65x(A)”（其他手机型号自行参考官方文档）
  - 勾选 "Disable FBLOCK"
  - 点击 “Start” 按钮

按以上操作完成后，应能看到类似以下提示（部分隐私信息被我打了*，正常来说不会出现*）：

```plaintext
PotatoNV v2.2.1
User manual: https://kutt.it/pnv-en
Verifying images...
Uploading hisi65x_a...
- xloader
- fastboot
Waiting for any device...
Connecting...
Serial number: A5R*************
Board ID: NW4*************
Model: BND-AL10
Build number: BND-AL10 9.1.0.151(C00E148R1P7)
FBLOCK state: unlocked
Saved key: UUUUUUUUUUUUUUUU
Writing FBLOCK...
Writing WVLOCK...
Writing USRKEY...
Rebooting...
New unlock code: Z4B*************
```

手机重启后，屏幕应显示如下信息：

![alt text](/assets/img/posts/Honor-7X-刷机指南/flash6.webp)

有以上信息即表示 Bootloader 解锁成功。

#### 1.3.5 ~~重装回后盖（可选）~~

- 重新连接电池排线
- 装回固定电池排线的金属盖板，拧紧螺丝
- 盖回后盖，确保四周卡扣卡紧

### 1.4 原理补充

[PotatoNV 的工作原理](https://github.com/mashed-potatoes/PotatoNV?tab=readme-ov-file#how-it-works)并非通过常规的 Fastboot 指令，而是利用了海思芯片（HiSilicon SoC）固有的**硬件级漏洞**。

- **利用 BootROM 漏洞** (VCOM/USB COM 1.0 模式)：
  - 华为的海思麒麟芯片在启动最早期（BootROM 阶段）有一个紧急下载模式，通常被称为 USB COM 1.0 模式。
  - 这是一个底层的硬件调试接口，权限极高，先于安卓系统和常规 Fastboot 模式启动。
- **需要 “短接” 测试点**：
  - 为了进入这个模式，PotatoNV 要求用户将主板上特定的金属触点与地线（通常是金属屏蔽罩）短接，然后连接电脑。
  - 这一步是物理层面的强制介入。
  - *其实，本机即 Honor 7X 的两个测试点中，其中一个是地线。*
- **注入特制的 Bootloader**：
  - 一旦设备进入 COM 1.0 模式，PotatoNV 会向设备的 RAM 中上传一个微型的、经过修改或来自工厂调试用的 Bootloader。
  - 这个临时的 Bootloader 没有常规的安全签名校验限制。
- **修改 NVRAM/OEMINFO 分区**：
  - 通过这个临时 Bootloader，PotatoNV 获得了对手机底层存储（NVMe/NVRAM）的读写权限。
  - 它会定位到存储 Bootloader 锁状态的区域，读取加密密钥并计算出解锁码，或者直接修改标志位，将锁的状态由 LOCKED 更改为 UNLOCKED。

结果： 重启后，手机便处于 Bootloader 已解锁状态

## 2 跳过 TWRP 界面直接获取 Root

在传统的刷机流程中，解锁 bl 后通常会刷入 TWRP，然后在 TWRP 的图形界面中刷入 Magisk 安装包来获取 Root 权限。

然而，对于**运行 EMUI 9.1.0 的 Honor 7X** 而言，这是一条死胡同。由于华为在 EMUI 9.0 之后引入了强制加密机制，普通的 TWRP 刷入后无法解密 data 分区，导致无法读取并刷入 Magisk 包。

但在翻阅 XDA 论坛时，发现大神 **jonnymcweed** 提供了一个[天才的解决方案](https://xdaforums.com/t/twrp-for-emui-9-1.4319353/)：**既然 TWRP 界面无法解密，不如直接把 Magisk “预装” 进 TWRP 镜像里。**

这里的最终目标是运行 Linux Deploy，只需要 Root 权限，并不必须拥有一个可交互的 TWRP 界面。因此，这里采用 “修补版镜像” 方案，刷入即 Root，这个镜像的主要功能已经从刷机工具变成了**带 Root 的启动引导器**。

### 2.1 准备工作

#### 下载修补镜像

- 在该 [XDA 帖子](https://xdaforums.com/t/twrp-for-emui-9-1.4319353/)的 2 楼找到附件下载链接，下载 `magisk_patched-twrp.img` (约 24.7 MB)
- **注**：为了方便后续输入命令，将文件重命名为 `root.img`，并**放入 ADB 工具箱目录**中

### 2.2 刷入镜像

此步骤将替换手机原本的恢复分区。

- **进入 Fastboot 模式**：
  - 手机**关机**
  - 按住 **“音量减”** 键不放，同时插入连接电脑的 USB 线
  - 直到手机屏幕显示如下图所示的 Fastboot 界面

![alt text](/assets/img/posts/Honor-7X-刷机指南/flash7.webp)

> 图中最后一行的 “PHONE Unlocked” 也即对第一步解锁 Bootloader 的验证

- **执行刷入命令**：
  - 在电脑的 ADB 目录下打开终端，输入以下命令：

```bash
fastboot flash recovery_ramdisk root.img
```

当终端出现类似如下信息时，说明刷入成功。

```plaintext
(base) PS C:\Users\YourName\Desktop\platform-tools> fastboot flash recovery_ramdisk root.img
Warning: skip copying recovery_ramdisk image avb footer (recovery_ramdisk partition size: 0, recovery_ramdisk image size
: 25847808).
Sending 'recovery_ramdisk' (25242 KB)                      OKAY [  0.711s]
Writing 'recovery_ramdisk'                                 OKAY [  0.485s]
Finished. Total time: 1.268s
(base) PS C:\Users\YourName\Desktop\platform-tools>
```

### 2.3 关键步骤：特殊启动激活 Root

这是最容易失败的一步。

刷入镜像后，必须通过特定的**组合键启动**，才能激活 Magisk Root 环境。

1. **拔掉 USB 数据线**
2. 同时按住 **“音量加”** + **“电源键”**
3. 当屏幕出现 Honor 启动 Logo 时，**松开电源键**，但**继续死死按住 “音量加” 键**
   - 等待约 15-20 秒后，手机会自动进入正常的 Android 系统桌面，此时即可松手

### 2.4 验证 Root 成果

进入系统后，我们需要验证 Root 是否生效：

> 若不是直接进入桌面，而是出现 EMUI 恢复界面（出现蓝色按钮 “下载最新版本并恢复”），说明未成功激活 Root，此时先点击 “重新启动”，手机关机，重试 **2.3** 步骤。

1. 在桌面上寻找是否出现了 **Magisk** 图标
2. 确保**手机联网**，打开 Magisk，按指示下载安装更新
3. 安装完成后，打开 Magisk，应如下图所示，表示 Root 激活成功：

![alt text](/assets/img/posts/Honor-7X-刷机指南/flash8.webp)

若 “当前” 显示 “无法获取”，则进入了无 Root 权限的系统，重试 2.3 步骤

### 2.5 补充说明

#### 2.5.1 TWRP

**TWRP**（Team Win Recovery Project）是一款开源的**第三方安卓恢复工具**，拥有图形化界面和丰富的自定义功能，是刷机、系统备份还原及刷入 Linux 镜像的核心工具。

刷入 TWRP 的本质是**替换手机的恢复分区（/recovery）**。恢复分区是一个独立于主系统的特殊小型系统分区，专门用于在手机无法正常启动时，执行刷机、恢复、清除数据等维护操作。

- 正常开机时： 手机的引导程序 (Bootloader) 会指向 /boot 分区，加载内核，然后启动庞大的 Android 系统。
- 进入恢复分区时： 通过特定按键告诉 Bootloader 换条路走，使其指向 /recovery 分区，加载该分区中的内核（刷入 TWRP 后即为 TWRP 的内核）。

关键点：此时手机里庞大的 Android 系统根本没有运行，它还在 “睡觉”。这就是为什么 TWRP 可以随意删除、修改系统文件的原因 —— 就像做手术，病人必须先麻醉。

#### 2.5.2 Magisk

**Magisk** 是一款流行的安卓 Root 管理工具，采用 “系统无修改” 方式获取 Root 权限，允许用户在不修改系统分区的情况下获得超级用户权限。

它通过在启动时注入一个虚拟的 “Magisk 镜像” 来实现 Root 功能。

#### 2.5.3 “双系统” 的味道？

刷入该修补版 TWRP 镜像后，手机的恢复分区实际上变成了一个**带有 Magisk 的启动引导器**。

- 如果通过正常的开机方式（长按电源键）开机，则进入无 Root 的普通系统
- 如果通过 2.3 的组合键开机，则进入带有 Magisk 的 Root 系统

> 怎么回事？感觉怪怪的...？

1. 正常的安卓启动逻辑
   - 在普通手机上，Root 通常是刷入 Boot 分区（内核层）
   - 按电源键 $\rightarrow$ 手机读取 Boot 分区 $\rightarrow$ 加载内核（包含 Root） $\rightarrow$ 启动系统
   - 结果：无论怎么开机，都有 Root
2. 荣耀/华为 EMUI 9 的特殊情况
   - 由于华为 EMUI 9 的分区结构很特殊，且 Boot 分区很难直接修改，Magisk 的开发者发明了一种 **“Recovery 下放”** 的方案：**将 Magisk 修补到了 Recovery 分区**，而不是 Boot 分区
   - 这就导致了该手机有两个 “入口”：
     - 入口 A：普通的开机：
       - Bootloader $\rightarrow$ 读取 Boot 分区（这是原厂未修改的） $\rightarrow$ 启动系统
       - 结果：因为 Boot 分区是干净的，所以系统没有 Root 权限
     - 入口 B：特殊的开机：
       - Bootloader 检测到按键 $\rightarrow$ 认为你要进“恢复模式” $\rightarrow$ 读取 Recovery 分区。
       - Magisk “偷天换日”：手机以为它进的是恢复模式，但这个分区已经被 Magisk 篡改了。Magisk 先启动，把自己挂载到内存里（获取 Root），然后再使手机带着其 Root 权限去启动正常的安卓系统

可见两种启动方式均为进入同一个安卓系统，且数据共享，不是真正意义上的 “双系统”，更确切地说是 “**单系统，双模式**”。

> ~~但这也产生了一个痛点：若想真正发挥 “口袋服务器” 的功能，启动时只能按照这个蛋疼的组合键方式开机😅...~~
>
> 并非，只有在 2.2 结束后的首次启动需要按此组合键，一旦有了 root 后再进行 Magisk 的下载安装更新，Magisk 会自动打补丁，后续正常开机键开机也能进入 Root 系统。————**（2026-03-01 更新）**

## 3 部署 Linux Deploy

一般来说，在手机上运行 Linux 有以下几种方案：

- **Termux**：利用 Proot (模拟 Root) 环境，不需要 Root 权限，运行非完整 Linux 系统
- **Linux Deploy**：通过 chroot 技术，在安卓系统内运行**完整原生 Linux 发行版**
- Native Linux 刷机，如 PostmarketOS 或 Ubuntu Touch，刷成纯 Linux 手机

如果不想刷机或出现某些失败的话，Termux 也可用于运行轻量级的 Linux 环境，但功能非常有限；而刷成纯 Linux 手机对于 Honor 7X 这种华为海思芯片的机型，驱动支持极其困难，刷完后可能只有极少功能可用。

而鉴于目前通过上述修补版 TWRP 镜像 “曲线救国” 的方式可成功夺取 Root 权限，这里选择使用 **Linux Deploy** 方案。

> 进行以下步骤前，先确保手机正常联网

### 3.1 准备工作

#### 安装 Busybox

- 进入 Magisk，点击右下角的拼图状图标（模块）
- 搜索 “busybox”，发现 “Busybox for Android NDK” 的模块
- 下载安装

Android 系统虽然基于 Linux 内核，但其自带的命令行工具功能非常精简，缺少很多标准 Linux 发行版（如 Debian、Ubuntu）安装和运行所需的复杂命令。

BusyBox 被称为 “嵌入式 Linux 的瑞士军刀”，它把几百个常用的 Linux 命令压缩成一个可执行文件，是 Linux Deploy 能够顺利运行的基础。

#### 安装 Linux Deploy

- 手机上，在 [Github Releases](https://github.com/meefik/linuxdeploy/releases) 页面下载最新版本的 APK 文件并安装（目前是 2.6.0）

![alt text](/assets/img/posts/Honor-7X-刷机指南/flash9.webp)

### 3.2 配置 Linux 系统

进入 Linux Deploy（后续任何时候出现该应用申请 Root 权限时，一定要允许），点击**右下角**的设置图标，进行以下配置（当然，也可根据个人经验灵活配置）：

| 配置项 | 建议值 |
| :--- | :--- |
| 发行版 GNU/Linux | Ubuntu |
| 架构 | arm64 |
| 发行版 GNU/Linux 版本 | bionic |
| 源地址 | http://mirrors.aliyun.com/ubuntu-ports/ |
| 用户名 | 自行更改 |
| 密码 | 自行更改 |
| 本地化 | zh_CN.UTF-8 |
| **启用 SSH 服务器** | **勾选** |

- 完成后，回到上一页面，点击**右上角**三个点，选择 “**安装**”，可能需要四五分钟，直到最后显示：**`<<< deploy`**，代表安装完成

- 安装完成后，点击左下角 “启动” 按钮，启动 Linux 系统，待最下面显示：**`<<< start`** 并且其上一行为 **`:: Starting extra/ssh ... done`**，代表启动成功

### 3.3 连接 Linux 系统

- 电脑上打开终端（`Win + R`，输入 `cmd` 回车）
- 在终端中输入以下命令，连接到手机的 Linux 系统：

```bash
ssh 用户名@手机IP地址 
```

- 用户名即配置项中的用户名
- 手机 IP 地址可在 Linux Deploy 主界面顶部找到
- 如果更改了端口号，则需要加上 `-p 端口号` 参数

输入命令按回车后应类似如下所示：

```plaintext
C:\Users\YourName>ssh user@192.168.0.106
The authenticity of host '192.168.0.106 (192.168.0.106)' can't be established.
ED25519 key fingerprint is SHA256:RAcLJv8mVs4HPx/sv6s6vUs5yvDW4XtR/tm5t/s6Klo.
This host key is known by the following other names/addresses:
    C:\Users\YourName/.ssh/known_hosts:2: 192.168.0.104
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

- 输入 `yes` 并按回车
- 接着输入密码并按回车（输入时不会显示任何字符）

```plaintext
Welcome to Ubuntu 18.04 LTS (GNU/Linux 4.9.148 aarch64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

Ubuntu 18.04 LTS [running via Linux Deploy]
root@localhost:~#
```

若出现如上提示，恭喜你，已经成功连接到手机的 Linux 系统🎉！

### 3.4 最后的一点仪式感

> *极客的专属浪漫*

- 在终端中输入以下命令，更新软件包列表：

```bash
apt update
```

- 安装并运行 Neofetch (系统概览)

```bash
apt install neofetch -y
```

安装完成后，输入以下并按回车：

```bash
neofetch
```

![alt text](/assets/img/posts/Honor-7X-刷机指南/flash10.webp)

- 至此，Linux 系统部署**大功告成**🚀！可以根据需要安装其他软件包和服务，好好享受这个口袋 Kirin 659 Linux 服务器~

## 4 后记

### 4.1 一丝叮嘱

0. 如果刷失败变砖了，不要慌，“**救砖**” 教程网上很多
1. 手机安装好环境后，在 Linux Deploy 中就**不要再点 “安装”** 按钮了，否则会覆盖之前的配置
2. 手机**关机前**确保 Linux Deploy 中的 Linux 系统已**停止**运行
3. 别忘了**进入 Root 模式的组合键**（但貌似还有其他的进入方式）
4. 注意后台不要把 Linux Deploy 杀掉，否则会导致 Linux 系统停止运行
5. 如果 ssh 一直连不上，可尝试让服务器手机与电脑同时连接另一部手机的热点

### 4.2 一点遗憾

#### 4.2.1 Linux 发行版版本受限

由于 Linux Deploy 的作者于 2020-02-01 停止更新，使得该软件支持的 Linux 发行版皆为该日期之前的版本，如其可选的 Ubuntu 的最新版为 18.04 的 bionic，可能因此带来一些不便。

> *如果**在 Ubuntu 中强制升级版本**呢？*

由于手机硬件很大可能跟不上，也许会出现各种错误。不过因为是在 Linux Deploy 上运行，**如果真炸了也只是在 Linux Deploy 上重装即可**，不会危及手机致使 “变砖”。

- 可运行以下命令强制将 Ubuntu 18.04 升级为 20.04：

```bash
sed -i 's/bionic/focal/g' /etc/apt/sources.list
apt-get update
apt-get dist-upgrade -y
```

经测试，**本机型可成功升级到 focal 即 20.04 版本**。~~22.04 版还未测试，虽然个人不太看好还能继续升级，但如果后续有空测试这个的话，会再来更新这里。~~

#### 4.2.2 Docker 无法使用

Linux Deploy 使用的是 chroot 容器技术，它没有自己的内核，而是与安卓系统共用同一个内核，而 Docker 的运行极其依赖 Linux 内核的几个关键特性。

由于手机厂商编译的 Android 内核通常为了省电和精简，可能会把 Docker 必须的内核特性给阉割掉，导致 Docker 不能正常使用。

经测试，**本机型不能使用 Docker**😭，运行 Docker 官方自检脚本可见红色的 `missing` 满天飞，缺少其核心组件。

但已经解锁 bl 了，也许可以通过**刷入 “定制内核”** 的方式解决这个问题，不过这又是一个新的折腾之旅了（但如果 Docker 中的环境就是 Linux Deploy 直接或间接可支持的，那何尝不**直接将 Linux Deploy 当作容器**...**污染环境？重装即可！**）。

### 4.3 一番感悟

刷机前鉴于该机型教程少且网传难度大，有点担心投入后却收获变砖的硕果；而某🐟️上三四十元就能买到的二手小米则有更丰富和成熟的教程资源，当时在这二者间犹豫不决。

但最终还是选择了 Honor 7X，作为极客，就必须**不怕折腾**。

折腾本身就是极客精神的体现，折腾中遇到的困难和挑战，正是极客乐此不疲的原因所在；折腾也是精湛技术的过程，折腾中积累的经验和知识，正是极客不断进步的源泉所在。

> **有人说，极客正被这个时代所抛弃**。

- 手机厂商严格限制 Bootloader 甚至锁死，软件中各种订阅制。**厂商希望用户变傻**，变成只懂 “点击付费” 的流量节点，而**不是试图掌握设备的主人**。
- 以前极客引以为傲的 “会写脚本”、“会刷机”，现在 **AI 一键生成**代码，新手也能用软件一键解决问题。那种 “掌握独门秘籍” 的优势与优越感正在被技术稀释。
- 在消费主义的洪流下，主流价值观即 “**旧了就扔，慢了就换**”。花两三天去改造一台老机，在很多人眼里可能是浪费时间，认为不如换新的。

> 但 —— **极客从未被抛弃，极客只是变成了这个便利时代的 “守夜人”。**

极客是 “知其所以然” 的少数派：当全世界都在依赖云服务时，一旦断网、服务器宕机或隐私泄露，普通用户拿它没办法。而极客懂得如何在本地搭建服务，懂得数据的去向。在万物互联的脆弱时代，极客掌握着最底层的生存技能。

极客是对抗 “计划报废” 的逆行者：商业逻辑希望旧机早早就进垃圾堆。但因为技术与热爱，也许旧设备还能跑 Python 脚本，能挂载 Docker，能当私人网盘。用技术延长了物的使用寿命，是对消费主义的优雅反击。

创新往往诞生于边缘：现在的 AI 大模型、区块链等，最早都是一群极客在破旧的论坛和简陋的硬件上折腾出来的。**尽管大公司在收割，但极客在播种。**

> **极客没有被抛弃，只是门槛变了**。

在刷机的角度说，以前的门槛是 “**信息差**”（谁会刷机），现在的门槛是 “**把控力**”（谁能在算法和云端大厂的夹缝中，依然拥有对自己数据和设备的绝对主权）。

---

**致敬极客的折腾精神**。

---

### 4.4 一些参考

最后，一路的顺利走来也离不开各论坛和开源社区的大神们的无私奉献，在此表示感谢！

- [PotatoNV 官方文档](https://github.com/mashed-potatoes/PotatoNV)
- [XDA 论坛：TWRP for EMUI 9.1](https://xdaforums.com/t/twrp-for-emui-9-1.4319353/)
- [油管的刷机视频](https://www.youtube.com/watch?v=y04WOMxkeb0)
- [B站的刷机相关科普视频1](https://www.bilibili.com/video/BV18aFZeTEeW?vd_source=baf8ab7109309c58c9711ed712a1bee7)
- [B站的刷机相关科普视频2](https://www.bilibili.com/video/BV1BY4y1H7Mc?vd_source=baf8ab7109309c58c9711ed712a1bee7)
- *好友的刷机教程（未正式发布，~~也许~~正在更新中.....）*

> 如有疏漏或错误，欢迎批评指正~
> Have a nice day!
