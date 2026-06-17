---
title: VIO快速入门（五）：前端与初始化——以VINS为例
date: 2026-06-17 16:00:00
categories: 
	- [SLAM]
	#- [cate2]
	#...
tags: 
	- CS
	- Robotics
	#...

#If you need a thumbnail photo for your post, delete the well number below and finish the directory.
cover: https://i.postimg.cc/sgqd35kQ/slam.png
thumbnail: https://i.postimg.cc/sgqd35kQ/slam.png

#If you need to customize your excerpt, delete the well number below and input something. You can also input <!-- more --> in your article to divide the excerpt and other contents.
#excerpt: ...

#If you don't want to show the ToC (Table of Content) at sidebar, delete the well number below. 
#toc: false

#You can begin to input your article below now.

---

## 前端

VIO的框架由前端和后端共同构成，其中后端我们之前花了四讲的时间介绍，它的作用是进行滑动窗口优化，本质上是融合了IMU与视觉的信息以确定相机的位姿。我们知道，在后端优化中需要用到特征点在归一化平面上的坐标，这个坐标是需要前端提供的。此外，在初始化的时候前端还需要承担确定与追踪相机位姿的作用。可以说，前端是VIO的一个非常重要的部分，如果没有前端信息的补充，VIO系统就像瘸了一条腿而只能靠IMU苦苦支撑，最终走向快速发散的命运。

一个好的前端需要有很好的特征点追踪效果，在存在干扰（光照变化、遮挡、动态物体）的情形下保持稳定，还要有很快的计算速度以及小的累积误差。目前VIO的前端具有多种多样的方案，每个方案之间差异较大，并且都有其各自的优缺点。这里就以VINS的前端为例进行介绍。在介绍前端的算法时，几乎没有公式推导，而主要是一些流程性的步骤。在VINS的代码中，前端的大量工作都是使用Open CV的库函数完成的，即使没有了解算法的每一个细节，只要知道它大概是做什么的，也不影响对前端的理解。

### 前端流程

VINS中前端采用光流法进行特征点跟踪，整个过程也比较简单，大致可以概括如下：

1. 对新来的图像帧首先进行亮度调整，将一幅图像中过暗或者过亮的部分调亮或调暗，以便揭示更多细节，便于后面的特征点提取；
2. 进行特征点跟踪，使用光流法，根据上一帧的特征点在当前帧中找到对应的特征点；
3. 根据两帧的匹配点计算基础矩阵以剔除异常点；
4. 在新的一帧中提取新的特征点；
5. 将特征点的坐标通过ROS的话题发布出去。

下面主要介绍光流跟踪和特征点提取这两部分。

### 光流跟踪

光流是一种描述像素在图像之间运动的方法。在VINS中使用的是LK（Lucas-Kanade）光流，这是一种追踪图像中部分像素运动的算法。在LK光流中，认为来自相机的图像是随时间变化的，图像可以视为时间的函数。那么，在$t$时刻，位于$(x,y)$处的像素的灰度（可以理解为亮度）可以写为
$$
\boldsymbol I(x,y,t)
$$
在LK光流中，使用了一个灰度不变假设，它的意思是：空间中同一个点对应的像素的灰度值，在各张图像中都是固定不变的。基于这个假设，假设这个像素在$t+\mathrm{d}t$时运动到$(x+\mathrm{d}x,y+\mathrm{d}y)$处，可以得到
$$
\boldsymbol I(x+\mathrm{d}x,y+\mathrm{d}y,t+\mathrm{d}t)=\boldsymbol I(x,y,t)
$$
对左边进行泰勒展开，保留一阶项，得
$$
\boldsymbol I (x + \mathrm{d}x, y + \mathrm{d}y, t + \mathrm{d}t) \approx \boldsymbol I (x, y, t) + \frac{\partial \boldsymbol I}{\partial x} \mathrm{d}x + \frac{\partial \boldsymbol I}{\partial y} \mathrm{d}y + \frac{\partial \boldsymbol I}{\partial t} \mathrm{d}t
$$
根据灰度不变假设，下一时刻的灰度等于之前的灰度，因此
$$
\frac{\partial \boldsymbol I}{\partial x} \mathrm{d}x + \frac{\partial \boldsymbol I}{\partial y} \mathrm{d}y + \frac{\partial \boldsymbol I}{\partial t} \mathrm{d}t=0
$$
两边除以$\mathrm{d}t$，得到
$$
\frac{\partial \boldsymbol I}{\partial x} \frac{\mathrm{d}x}{\mathrm{d}t} + \frac{\partial \boldsymbol I}{\partial y} \frac{\mathrm{d}y}{\mathrm{d}t} =- \frac{\partial \boldsymbol I}{\partial t}
$$
其中，$\mathrm{d}x/\mathrm{d}t$为像素在$x$轴方向上运动的速度，$\mathrm{d}y/\mathrm{d}t$为像素在$y$轴方向上运动的速度，分别记为$u$、$v$；$\partial\boldsymbol I/\partial x$为图像在像素点处$x$方向上灰度的梯度，$\partial\boldsymbol I/\partial y$为图像在像素点处$y$方向上灰度的梯度，分别记为$\boldsymbol I_x$、$\boldsymbol I_y$。将整个图像灰度对时间的偏导数记为$\boldsymbol I_t$，可得
$$
\begin{bmatrix}\boldsymbol I_x & \boldsymbol I_y\end{bmatrix}\begin{bmatrix}u\\v\end{bmatrix}=-\boldsymbol I_t
$$
在上面的式子中未知数是$u$和$v$，但是一个方程算不出两个未知数。所以引入额外的假设：某一个图像窗口内的像素具有相同的运动。考虑一个大小为$w\times w$的窗口，它含有$w^2$个像素，该窗口内像素具有同样的运动，因此可以得到$w^2$个方程
$$
\begin{bmatrix}\boldsymbol I_x & \boldsymbol I_y\end{bmatrix}\begin{bmatrix}u\\v\end{bmatrix}=-\boldsymbol I_{t_k}
$$
其中$k=1,\cdots,w^2$。因此上面的方程变成了一个超定方程，一般使用最小二乘法求解。当$t$为离散时刻时，通过计算像素点的速度即可估计像素在下一时刻的位置，实现对像素的追踪。

最基础的LK光流可能会出现一些问题：在图像运动较快时，两张图像差异比较明显，那么这就很容易使得最小二乘求解进入一个局部极小值而提前结束。这种情况可以通过引入金字塔光流改善。金字塔光流对同一张图像进行缩放，得到不同分辨率下的图像。在计算光流时，先从顶层的图像开始计算，然后把上一层追踪的结果作为下一层光流的初始值。这样即使原始图像中一个像素移动了很大的距离，在上层的图像中只是移动了很小的距离，于是最终的追踪结果可以得到极大提升。

<img src="https://i.postimg.cc/fRQpfQJ5/image-20250819154826976.png" alt="" style="zoom:50%;" />

### 特征点提取

在VINS中，光流跟踪不是跟踪所有的像素点，而是有选择性的跟踪一些特征点。特征点指的是图像中比较有代表性的一些点，通常被选取为角点。角点的类型有很多种，例如FAST角点，Harris角点，Shi-Tomas角点等。在VINS中使用的是Shi-Tomas角点。具体如何提取特征点这里就不过多介绍了，在VINS中也是直接调用的OpenCV的接口完成的这项工作。在光流跟踪完成后会输出跟上一帧图像匹配的特征点，但是这些特征点可能出现误匹配的异常点。那么如何检测出这些异常点呢？在VINS中是基于基础矩阵，使用RANSAC算法完成的。下面首先介绍一下基础矩阵是什么。

假设我们有两帧图像$I_1$和$I_2$，现在希望求出从第一帧图像到第二帧图像的相对运动$\boldsymbol R$和$\boldsymbol t$。两个相机中心为$O_1$和$O_2$。现在在$I_1$中有一个特征点$p_1$，在$I_2$中有一个特征点$p_2$，这两个特征点是通过正确的特征匹配得到的。这个关系也被叫做对极几何。下面的图描绘了这个问题

<img src="https://i.postimg.cc/5t2V8Wrc/image-20250819163330799.png" alt="" style="zoom:50%;" />

其中，$O_1p_1$和$O_2p_2$交会于点$P$，$O_1$、$O_2$、$P$三点确定的平面被称为极平面。直线$O_1O_2$与$I_1$、$I_2$分别交于点$e_1$和$e_2$，它们被称为极点，$O_1O_2$被称为基线。假设$P$点的空间位置为$\boldsymbol P=[X,Y,Z]^\top$，使用之前介绍过的针孔相机模型，两个像素点的像素位置$\boldsymbol p_1$、$\boldsymbol p_2$为
$$
z_1\boldsymbol p_1=\boldsymbol {KP}\\
z_2\boldsymbol p_2=\boldsymbol K(\boldsymbol{RP}+\boldsymbol t)
$$
其中$\boldsymbol K$为相机的内参矩阵，$z_1$和$z_2$为深度。由于我们只考虑投影关系，因此深度在这里并不重要。那么有
$$
\boldsymbol p_1\simeq\boldsymbol{KP}\\
\boldsymbol p_2\simeq\boldsymbol K(\boldsymbol{RP}+\boldsymbol t)
$$
令
$$
\boldsymbol x_1=\boldsymbol K^{-1}\boldsymbol p_1\\
\boldsymbol x_2=\boldsymbol K^{-1}\boldsymbol p_2\\
$$
其中$\boldsymbol x_1$、$\boldsymbol x_2$为两个像素点在归一化相机坐标系中的坐标，可得
$$
\boldsymbol x_2\simeq\boldsymbol {Rx}_1+\boldsymbol t
$$
两边同时左乘$\boldsymbol x_2^\top[\boldsymbol t]_{\times}$，有
$$
\boldsymbol x_2^\top[\boldsymbol t]_\times\boldsymbol x_2\simeq\boldsymbol x_2^\top[\boldsymbol t]_\times\boldsymbol R\boldsymbol x_1
$$
由于$[\boldsymbol t]_\times\boldsymbol x_2$是一个与$\boldsymbol t$和$\boldsymbol x_2$都垂直的向量，所以等式左侧为$\boldsymbol 0$。可以得到
$$
\boldsymbol x_2^\top[\boldsymbol t]_\times\boldsymbol R\boldsymbol x_1=\boldsymbol 0\\
{\boldsymbol p_2}^\top{\boldsymbol K^{-1}}^\top[\boldsymbol t]_\times\boldsymbol {RK}^{-1}\boldsymbol p_1=\boldsymbol 0
$$
令基础矩阵（Fundamental Matrix）$\boldsymbol F={\boldsymbol K^{-1}}^\top[\boldsymbol t]_\times\boldsymbol {RK}^{-1}$，上面的式子可以写为
$$
\boldsymbol p_2^\top\boldsymbol{Fp}_1=\boldsymbol 0
$$
这个关系被称为对极约束。有了这个关系，估计两帧间相机位姿变换的问题可以变为：

1. 根据特征点$\boldsymbol p_1$和$\boldsymbol p_2$的像素位置求出$\boldsymbol F$；
2. 根据$\boldsymbol F$，通过SVD分解求出$\boldsymbol R$和$\boldsymbol t$。

但是，由于匹配中存在大量异常点，如果去计算基础矩阵，会被错误匹配点严重干扰。因此，RANSAC算法首先从匹配点集中随机抽取最少需要的点（如果使用八点法求基础矩阵就是8个点），用它们估计一个候选的基础矩阵。之后用这个基础矩阵去计算所有匹配点的对称极几何误差，如果这个这个误差小于设定的阈值（例如一个像素），则认为该特征点是内点，否则是外点。然后，重复随机采样和评估很多次，找到包含最多内点的基础矩阵作为最优模型。最终，将这个基础矩阵的内点作为可以保留的匹配特征点。

另外，需要注意的一个点是，假如在位移$\boldsymbol t$前面乘一个任意的常数$s$，对极约束仍然是成立的。所以实际上本质矩阵只存储了位移的方向，而丢失了位移的大小（也即尺度）信息。

## 从图像到位姿

### 三角化

三角化也叫做三角测量，这种方法可以用于估计特征点的深度信息。与上一节中介绍的求基础矩阵的场景类似，考虑图像$I_1$和$I_2$，它们之间与特征点$p_1$、$p_2$的关系如下所示

<img src="https://i.postimg.cc/G3y1FQXX/image-20250820170921148.png" alt="" style="zoom:50%;" />

按照对极几何的定义，设$\boldsymbol x_1$、$\boldsymbol x_2$为两个特征点在归一化相机坐标系中的坐标，那么它们满足
$$
z_2\boldsymbol x_2=z_1\boldsymbol{Rx}_1+\boldsymbol t
$$
通过之前求基础矩阵的方法，我们可以认为$\boldsymbol R$和$\boldsymbol t$为已知的，现在要求$z_1$和$z_2$。于是，对上式左乘一个$[\boldsymbol x_2]_\times$可得
$$
z_2[\boldsymbol x_2]_\times\boldsymbol x_2=\boldsymbol 0=z_1[\boldsymbol x_2]_\times\boldsymbol {Rx}_1+[\boldsymbol x_2]_\times\boldsymbol t
$$
这个式子右侧可以看成$z_1$的一个方程，可以直接求出$z_1$。然后，再利用左乘$[\boldsymbol x_2]_\times$前的方程便可以求出$z_2$。

理论上，直线$O_1p_1$和$O_2p_2$在场景中会刚好相交于点$P$处，但是由于噪声的影响，这两条直线往往无法相交。因此一般使用最小二乘法进行求解。

### PnP

PnP（Perspective-n-Point）是求解3D点到2D点对运动的方法，它描述了当知道$n$个3D空间点在世界坐标系中的坐标及其在图像坐标系上的投影位置时，如何估计相机的位姿。前面介绍的根据对极几何确定相机位姿和三角化的方法需要8个或以上的点对（以8点法为例），而且存在初始化，纯旋转和尺度的问题。但是，如果两张图像中一个特征点的3D位置已知，那么最少只需要3个点对就可以估计相机运动。对于双目相机，可以直接确定特征点的3D位置，因此可以直接使用PnP来求解相机的运动；对于单目相机，则必须先使用对极约束进行初始化。PnP方法本身不需要使用对极约束，又可以在很少的特征点中获得较好的运动估计，是一种最重要的位姿估计方法。PnP的方法有很多，这里主要简单介绍一下P3P和BA法。

#### P3P

P3P需要利用给定的3个点的几何关系，它的输入为3对3D-2D匹配点。记世界坐标系下的3D点为$A$、$B$、$C$，相机坐标系中的2D点为$a$、$b$、$c$，相机光心为$O$，如下图所示

<img src="https://i.postimg.cc/634FhWfQ/image-20250820192415966.png" alt="" style="zoom:50%;" />

首先，三角形之间存在相似关系
$$
\Delta Oab \sim\Delta OAB,\Delta Obc\sim\Delta OBC,\Delta Oac\sim\Delta OAC
$$
根据余弦定理可得
$$
OA^{2}+OB^{2}-2OA\cdot OB\cdot\cos\langle a,b\rangle = AB^{2}\\
OB^{2}+OC^{2}-2OB\cdot OC\cdot\cos\langle b,c\rangle = BC^{2}\\
OA^{2}+OC^{2}-2OA\cdot OC\cdot\cos\langle a,c\rangle = AC^{2}
$$
对上面三式全部除以$OC^2$，并记$x=OA/OC$，$y=OB/OC$，有
$$
x^2 + y^2 - 2xy \cos \langle a, b \rangle = AB^2/OC^2\\
y^2 + 1^2 - 2y \cos \langle b, c \rangle = BC^2/OC^2\\
x^2 + 1^2 - 2x \cos \langle a, c \rangle = AC^2/OC^2
$$
再令$v=AB^2/OC^2$，$u=BC^2/AB^2$，$w=AC^2/AB^2$，有
$$
x^2 + y^2 - 2xy \cos \langle a, b \rangle = v\\
y^2 + 1^2 - 2y \cos \langle b, c \rangle - uv = 0\\
x^2 + 1^2 - 2x \cos \langle a, c \rangle - wv = 0
$$
将第一式代入第二、三式中，得
$$
(1 - u) y^2 - ux^2 - \cos \langle b, c \rangle y + 2uxy \cos \langle a, b \rangle + 1 = 0\\
(1 - w) x^2 - wy^2 - \cos \langle a, c \rangle x + 2wxy \cos \langle a, b \rangle + 1 = 0
$$
由于图像中2D点的位置是已知的，所以式中三个余弦值是已知的。另外，由于3D点在世界坐标系中的位置已知，所以$u$、$w$的值也是可以算出来的（变换到相机坐标系下后这个比值不会改变）。所以，上面的方程组是一个关于$x$、$y$的二元二次方程组。只要解出这两个未知数，就可以得到3D点在相机坐标系下的坐标。此外P3P还需要一对验证点，以从可能的解中选出正确的那个。

但是，我们要求的是相机的位姿，现在我们已经知道了3D点在相机坐标系中的坐标和它在世界坐标系中的坐标。根据这个信息求相机位姿的问题被称为ICP（Iterative Closest Point）问题。假设匹配好的3D点集在不同坐标系下表示为
$$
\boldsymbol P = \{\boldsymbol p_1, \dots, \boldsymbol p_n\},\boldsymbol P' = \{\boldsymbol p'_1, \dots, \boldsymbol p'_n\}
$$
希望求出变换$\boldsymbol R$，$\boldsymbol t$，使得对于任意的点$\boldsymbol p_i$，都有
$$
\boldsymbol p_i=\boldsymbol{Rp}_i'+\boldsymbol t
$$
对这个问题可以使用SVD的方法求解。首先，构建最小二乘问题
$$
\min_{\boldsymbol R,\boldsymbol t}\frac{1}{2}\sum_{i=1}^n||\boldsymbol p_i-(\boldsymbol{Rp}_i'+\boldsymbol t)||^2_2
$$
然后定义两组点的质心
$$
\boldsymbol p=\frac{1}{n}\sum_{i=1}^n(\boldsymbol p_i),\boldsymbol p'=\frac{1}{n}\sum_{i=1}^n(\boldsymbol p_i')
$$
之后，最小二乘问题的误差项可以变为
$$
\begin{aligned}\frac{1}{2}\sum_{i=1}^n\left\|\boldsymbol{p}_i-(\boldsymbol{R}\boldsymbol{p}_i^{\prime}+\boldsymbol{t})\right\|^2&=\frac{1}{2}\sum_{i=1}^n\left\|\boldsymbol{p}_i-\boldsymbol{R}\boldsymbol{p}_i^{\prime}-\boldsymbol{t}-\boldsymbol{p}+\boldsymbol{R}\boldsymbol{p}^{\prime}+\boldsymbol{p}-\boldsymbol{R}\boldsymbol{p}^{\prime}\right\|^2\\&=\frac{1}{2}\sum_{i=1}^n\left\|\left(\boldsymbol{p}_i-\boldsymbol{p}-\boldsymbol{R}\left(\boldsymbol{p}_i^{\prime}-\boldsymbol{p}^{\prime}\right)\right)+\left(\boldsymbol{p}-\boldsymbol{R}\boldsymbol{p}^{\prime}-\boldsymbol{t}\right)\right\|^2\\&=\frac{1}{2}\sum_{i=1}^n(\left\|\boldsymbol{p}_i-\boldsymbol{p}-\boldsymbol{R}\left(\boldsymbol{p}_i^{\prime}-\boldsymbol{p}^{\prime}\right)\right\|^2+\left\|\boldsymbol{p}-\boldsymbol{R}\boldsymbol{p}^{\prime}-\boldsymbol{t}\right\|^2+\\&2(\boldsymbol{p}_i-\boldsymbol{p}-\boldsymbol{R}\left(\boldsymbol{p}_i^{\prime}-\boldsymbol{p}^{\prime}\right))^\top(\boldsymbol{p}-\boldsymbol{R}\boldsymbol{p}^{\prime}-\boldsymbol{t}))\end{aligned}
$$
其中的交叉项$\boldsymbol{p}_i-\boldsymbol{p}-\boldsymbol{R}\left(\boldsymbol{p}_i^{\prime}-\boldsymbol{p}^{\prime}\right)$在求和之后为零，因此目标函数可以简化为
$$
\min_{\boldsymbol{R},\boldsymbol{t}}J=\frac{1}{2}\sum_{i=1}^{n}(\left\|\boldsymbol{p}_{i}-\boldsymbol{p}-\boldsymbol{R}\left(\boldsymbol{p}_{i}^{\prime}-\boldsymbol{p}^{\prime}\right)\right\|^{2}+\left\|\boldsymbol{p}-\boldsymbol{R}\boldsymbol{p}^{\prime}-\boldsymbol{t}\right\|^{2})
$$
又因为有$\boldsymbol p_i=\boldsymbol{Rp}_i'+\boldsymbol t$，因此可以得到
$$
\boldsymbol{p}-\boldsymbol{R}\boldsymbol{p}^{\prime}-\boldsymbol{t}=\boldsymbol 0
$$
所以，问题最终变为求下面的旋转矩阵
$$
\boldsymbol{R}^*=\arg\min_{\boldsymbol{R}}\frac{1}{2}\sum_{i=1}^n\left\|\boldsymbol{q}_i-\boldsymbol{R}\boldsymbol{q}_i^{\prime}\right\|^2
$$
将这个优化问题中的误差项展开得
$$
\frac{1}{2}\sum_{i=1}^n\left\|\boldsymbol{q}_i-\boldsymbol{R}\boldsymbol{q}_i^{\prime}\right\|^2=\frac{1}{2}\sum_{i=1}^n\left(\boldsymbol{q}_i^\top\boldsymbol{q}_i+\boldsymbol{q}_i^{\prime\top}\boldsymbol{R}^\top\boldsymbol{R}\boldsymbol{q}_i^{\prime}-2\boldsymbol{q}_i^\top\boldsymbol{R}\boldsymbol{q}_i^{\prime}\right)
$$
注意到第一项和$\boldsymbol R$无关。第二项由于$\boldsymbol R^\top\boldsymbol R=\boldsymbol I$，同样与$\boldsymbol R$无关。因此目标函数变为
$$
\sum_{i=1}^n-\boldsymbol{q}_i^\top\boldsymbol{R}\boldsymbol{q}_i^\prime=\sum_{i=1}^n-\mathrm{tr}\left(\boldsymbol{R}\boldsymbol{q}_i^\prime\boldsymbol{q}_i^\top\right)=-\mathrm{tr}\left(\boldsymbol{R}\sum_{i=1}^n\boldsymbol{q}_i^\prime\boldsymbol{q}_i^\top\right)
$$
这里利用了一个小变换：对两个列向量$\boldsymbol a$和$\boldsymbol b$，总有$\boldsymbol a^\top\boldsymbol b=\mathrm{tr}(\boldsymbol {ba}^\top)$。定义$\boldsymbol W=\boldsymbol{q}_i\boldsymbol{q}_i^{\prime\top}$，对其进行SVD分解，得到
$$
\boldsymbol W=\boldsymbol {U\Sigma V}^\top
$$
其中，$\boldsymbol\Sigma$为奇异值构成的对角矩阵，对角线元素从大到小排列，而$\boldsymbol U$和$V$为对角矩阵。当$\boldsymbol W$满秩时，可以求得$\boldsymbol R^*$
$$
\boldsymbol R^*=\boldsymbol {UV}^\top
$$
在求得$\boldsymbol R^*$后，即可求出$\boldsymbol t^*$
$$
\boldsymbol t^*=\boldsymbol p-\boldsymbol {Rp}'
$$

#### BA法

BA（Bundle Adjustment）被称为“捆集调整”或者“光束平差法”，是将相机模型和3D点放在一起进行最优化的问题。我们可以使用BA法求解PnP问题。考虑$n$个3D点$P$及其投影$p$，希望计算相机的位姿$\boldsymbol R$、$t$，它的变换矩阵为$\boldsymbol T$。假设空间点坐标为$\boldsymbol P_i=[X_i,Y_i,Z_i]^\top$，其投影的像素坐标为$\boldsymbol u_i=[u_i,v_i]^\top$。根据以前的知识，我们可以确定像素位置与空间点位置的关系
$$
z_i\begin{bmatrix}u_i\\v_i\\1\end{bmatrix}=\boldsymbol{KT}\begin{bmatrix}X_i\\Y_i\\Z_i\\1\end{bmatrix}
$$
其中，$z_i$为第$i$个点的深度。写成矩阵形式有
$$
z_i\boldsymbol u_i=\boldsymbol{KTP}_i
$$
由于相机的位姿未知以及观测误差的存在，等式两边并不是完全相等的。因此可以利用这个式子得出误差项，构造最小二乘问题，最终求出相机位姿
$$
\boldsymbol T^*=\mathrm{arg}\min_\boldsymbol T\frac{1}{2}\sum_{i=1}^n\left\|\boldsymbol u_i-\frac{1}{z_i}\boldsymbol{KTP}_i\right\|^2_2
$$
这个式子实际上是将3D点的投影位置与观测位置作差，所以本质上就是重投影误差。要求解这个非线性优化问题需要求出其关于优化变量$\boldsymbol T$的雅可比矩阵，具体的求导方法与之前介绍过的是一样的，这里就不再赘述了。另外需要注意的是，在第二讲中介绍的重投影误差没有先求出3D点在世界坐标系中的坐标，而是利用了相机在帧间的运动间接求出3D点在世界坐标系中的坐标。

## VINS-Mono的初始化

VINS-Mono的初始化可以分为“视觉初始化”和“视觉与IMU对齐”两大步骤。当前端有比较稳定的特征点并且滑窗被填满之后，开始初始化的流程。

### 视觉初始化

在这一步中，算法会根据特征点的投影位置还原出相机的位姿。首先，算法会寻找滑窗中与当前帧（也就是滑窗中的最后一帧）共视特征点较多，且视差较大的一帧作为参考帧。这里假设参考帧是第5帧。之后，通过2D-2D的对极约束求出基础矩阵，然后求出当前帧到参考帧的相对位姿$\mathbf T$。将参考帧的相机坐标系认为是伪世界坐标系，那么我们可以得到从伪世界系到当前帧的相机系的变换。之后，三角化**参考帧与当前帧**之间有共视的特征点，得到它们在伪世界系下的3D坐标。因为这些共视点在第6帧中也有出现，所以现在可以使用PnP求解出第6帧在伪世界系下的位姿。于是，我们又可以对**第6帧与当前帧**的共视点进行三角化。所有三角化后的特征点又可以在第7帧看到一部分，于是又可以用PnP求解出第7帧在伪世界系下的位姿。这个过程可以不断延续下去，直到第6\~9帧与当前帧的所有共视点全部被三角化出来，第6\~9帧在伪世界系下的位姿都被确定。

<img src="https://i.postimg.cc/N0SzLhvv/image-20250826121004576.png" alt="" style="zoom:50%;" />

在得到第6\~9帧在伪世界坐标系下的位姿之后，可以将参考帧与第6\~9帧的共视点三角化出来。接下来还是类似的，第4帧与参考帧总有一些已经三角化了的共视点，于是可以使用PnP求解出第4帧在伪世界系下的位姿。然后，就可以再三角化**第4帧与参考帧**的的所有共视点。再通过PnP求出第3帧在伪世界系下的位姿，然后三角化**第3帧与参考帧**的所有共视点。不断持续这个过程，直到第0\~4帧与参考帧的所有共视点都被三角化出来，第0\~4帧在伪世界系下的位姿都被确定。

<img src="https://i.postimg.cc/vZmqz8Qw/image-20250826143423383.png" alt="" style="zoom:50%;" />

最后，还有一些与参考帧和当前帧无关的共视点，也将它们都三角化出来。

<img src="https://i.postimg.cc/J7cpCHnq/image-20250826145210276.png" alt="" style="zoom:50%;" />

现在，所有特征点在伪世界坐标系下的坐标和所有帧在伪世界坐标系中的位姿都确定了。可以使用BA法对整个滑窗中的帧和特征点做一次PnP，得到最优的位姿。

我们已经求得了滑窗中所有帧相对参考帧的位姿$\mathbf R^{c_r}_{c_i}$、$\mathbf p^{c_r}_{c_i}$（这里$c_r$代表参考帧，$c_i$代表滑窗中的其他帧），它们构成的变换矩阵为$\mathbf T^{c_r}_{c_i}$。那么为了将每帧的位姿与真实世界联系起来，需要首先借助外参将各帧的IMU坐标系表示到伪世界坐标系下
$$
\mathbf T^{c_r}_{b_i}=\mathbf T^{c_r}_{c_i}{\mathbf T^b_c}^{-1}\\
\mathbf T^{c_r}_{b_i}\mathbf T^b_c=\mathbf T^{c_r}_{b_i}
$$
在上面的式子两边同时右乘一个向量$\mathbf p_{c_i}$，可以得到下面的关系
$$
\mathbf R^{c_r}_{b_i}(\mathbf R^b_c\mathbf p_{c_i}+\mathbf p^b_c)+\mathbf p^{c_r}_{b_i}=\mathbf R^{c_r}_{c_i}\mathbf p_{c_i}+\mathbf p^{c_r}_{c_i}\\
\mathbf R^{c_r}_{b_i}\mathbf R^b_c\mathbf p_{c_i}+\mathbf R^{c_r}_{b_i}\mathbf p^b_c+\mathbf p^{c_r}_{b_i}=\mathbf R^{c_r}_{c_i}\mathbf p_{c_i}+\mathbf p^{c_r}_{c_i}
$$
观察可得
$$
\mathbf R^{c_r}_{b_i}=\mathbf R^{c_r}_{c_i}{\mathbf R^{b}_c}^\top\\
\mathbf p^{c_r}_{b_i}=\mathbf p^{c_r}_{c_i}-{\mathbf R^{c_r}_{b_i}}\mathbf p^b_c
$$
上面的式子中，左边是IMU坐标系相对伪世界坐标系（参考帧的相机坐标系）的位姿。需要注意的是，$\mathbf p^{c_r}_{c_i}$与$\mathbf p^{c_r}_{b_i}$的尺度与$\mathbf p^b_c$是不一致的。在之前视觉初始化的部分我们说过，首先需要通过对极约束求出当前帧到参考帧的相对位姿，在这一步的时候已经丢失了全局的尺度信息，进而导致后面整个视觉初始化得到的所有位移都是没有全局的尺度信息的。所以我们需要将上面的式子中的位移部分增加一个全局的尺度因子以将其还原成米制单位
$$
s\mathbf p^{c_r}_{b_i}=s\mathbf p^{c_r}_{c_i}-{\mathbf R^{c_r}_{b_i}}\mathbf p^b_c
$$

### 初始化陀螺仪零偏

在后端优化中，陀螺仪的零偏也是优化变量之一。注意这个零偏在一开始的时候是未知的，所以需要使用前面纯视觉得到的IMU的姿态以及陀螺仪预积分得到的姿态得到陀螺仪零偏的初始估计。理论上来说，纯视觉得到的帧间姿态变化应该等于IMU预积分得到的旋转，所以可以构造下面的优化问题来求解
$$
\min_{\delta\mathbf b_g}\sum_{i\in B}\left\|{\mathbf q_{b_j}^{c_r}}^{-1}\otimes\mathbf q_{b_i}^{c_r}\otimes\boldsymbol\gamma_{b_j}^{b_i}\right\|^2
$$
其中
$$
\boldsymbol \gamma^{b_i}_{b_j}\approx\hat{\boldsymbol\gamma}^{b_i}_{b_j}\otimes\begin{bmatrix}1\\\frac{1}{2}\boldsymbol J^{\boldsymbol \gamma}_{\mathbf{b}_g}\delta\mathbf b_g\end{bmatrix}
$$
这与第三讲中后端优化对零偏的处理方式是一样的。我们知道上述目标函数的最小值一定为单位四元数，所以存在下面的关系
$$
{\mathbf q_{b_j}^{c_r}}^{-1}\otimes\mathbf q_{b_i}^{c_r}\otimes\boldsymbol\gamma_{b_j}^{b_i}=\begin{bmatrix}1\\\boldsymbol 0\end{bmatrix}\\
\hat{\boldsymbol\gamma}^{b_i}_{b_j}\otimes\begin{bmatrix}1\\\frac{1}{2}\boldsymbol J^{\boldsymbol \gamma}_{\mathbf{b}_g}\delta\mathbf b_g\end{bmatrix}={\mathbf q_{b_i}^{c_r}}^{-1}\otimes\mathbf q_{b_j}^{c_r}\otimes\begin{bmatrix}1\\\boldsymbol 0\end{bmatrix}\\
\begin{bmatrix}1\\\frac{1}{2}\boldsymbol J^{\boldsymbol \gamma}_{\mathbf{b}_g}\delta\mathbf b_g\end{bmatrix}={\hat{\boldsymbol\gamma}^{b_i}_{b_j}}^{-1}\otimes{\mathbf q_{b_i}^{c_r}}^{-1}\otimes\mathbf q_{b_j}^{c_r}\otimes\begin{bmatrix}1\\\boldsymbol 0\end{bmatrix}
$$
只考虑虚部，则有
$$
\boldsymbol J^{\boldsymbol \gamma}_{\mathbf b_g}\delta\mathbf b_g=2\left({\hat{\boldsymbol\gamma}^{b_i}_{b_j}}^{-1}\otimes{\mathbf q_{b_i}^{c_r}}^{-1}\otimes\mathbf q_{b_j}^{c_r}\right)_{xyz}
$$
再在方程两边乘一个${\boldsymbol J^{\boldsymbol \gamma}_{\mathbf b_g}}^\top$保证方程左边的正定性，然后就可以使用LDLT分解法直接解出$\delta\mathbf b_g$。在解得陀螺仪得零偏之后，需要重新计算一次预积分。

这里补充一点。在VINS中只初始化了陀螺仪的零偏，而将加速度零偏初始值认为是零。这是因为加速度的零偏比较小，很容易就淹没在了重力加速度中，所以在初始化的时候就没有考虑它。

### 初始化速度、重力、和尺度因子

首先定义优化变量为
$$
\mathcal X=[\mathbf v^{b_0}_0,\mathbf v^{b_1}_1,\cdots,\mathbf v^{b_n}_n,\mathbf g^{c_r},s]^\top
$$
其中，$\mathbf v^{b_i}_i$为第$i$帧时IMU坐标系相对世界坐标系的速度矢量（其实就是IMU的速度）；$\mathbf g^{c_r}$为在伪世界坐标系中表示的重力矢量；$s$为尺度因子。回顾第三讲中的预积分量约束，在世界坐标系$w$下有
$$
\boldsymbol{\alpha}^{b_i}_{b_j}=\mathbf{R}^{b_i}_w(\mathbf{p}^w_{b_j}-\mathbf{p}^w_{b_i}-\mathbf{v}_{b_i}^w\Delta t+\frac{1}{2}\mathbf{g}^w\Delta t^2)\\
\boldsymbol{\beta}^{b_i}_{b_j}=\mathbf{R}^{b_i}_w(\mathbf{v}_{b_j}^w-\mathbf{v}_{b_i}^w+\mathbf{g}^w\Delta t)
$$
将世界坐标系换为伪世界坐标系，可得
$$
\boldsymbol{\alpha}^{b_i}_{b_j}=\mathbf{R}^{b_i}_{c_r}(s\mathbf{p}^{c_r}_{b_j}-s\mathbf{p}^{c_r}_{b_i}-\mathbf R^{c_r}_{b_i}\mathbf{v}^{b_i}_i\Delta t+\frac{1}{2}\mathbf{g}^{c_r}\Delta t^2)\\
\boldsymbol{\beta}^{b_i}_{b_j}=\mathbf{R}^{b_i}_{c_0}(\mathbf R^{c_r}_{b_j}\mathbf{v}^{b_j}_j-\mathbf R^{c_r}_{b_i}\mathbf{v}^{b_i}_i+\mathbf{g}^{c_r}\Delta t)
$$
我们前面已知
$$
s\mathbf p^{c_r}_{b_i}=s\mathbf p^{c_r}_{c_i}-{\mathbf R^{c_r}_{b_i}}\mathbf p^b_c
$$
将其代入先前的第一个方程，可以得到
$$
\begin{aligned}
\boldsymbol\alpha^{b_i}_{b_j}=&s\mathbf R^{b_i}_{c_r}\mathbf p^{c_r}_{c_j}-\mathbf R^{b_i}_{c_r}\mathbf R^{c_r}_{b_j}\mathbf p^b_c-s\mathbf R^{b_i}_{c_r}\mathbf p^{c_r}_{c_i}+\mathbf p^b_c-\mathbf v^{b_i}_i\Delta t+\frac{1}{2}\mathbf R^{b_i}_{c_r}\mathbf g^{c_r}\Delta t^2\\
=&s\mathbf R^{b_i}_{c_r}(\mathbf p^{c_r}_{c_j}-\mathbf p^{c_r}_{c_i})-\mathbf R^{b_i}_{c_r}\mathbf R^{c_r}_{b_j}\mathbf p^b_c+\mathbf p^b_c-\mathbf v^{b_i}_i\Delta t+\frac{1}{2}\mathbf R^{b_i}_{c_r}\mathbf g^{c_r}\Delta t^2
\end{aligned}
$$
将与优化变量有关的项写到等式左边，可得
$$
s\mathbf R^{b_i}_{c_r}(\mathbf p^{c_r}_{c_j}-\mathbf p^{c_r}_{c_i})-\mathbf v^{b_i}_i\Delta t+\frac{1}{2}\mathbf R^{b_i}_{c_r}\mathbf g^{c_r}\Delta t^2=\boldsymbol\alpha^{b_i}_{b_j}-\mathbf p^b_c+\mathbf R^{b_i}_{c_r}\mathbf R^{c_r}_{b_j}\mathbf p^b_c\\
\mathbf{R}^{b_i}_{c_r}(\mathbf R^{c_r}_{b_j}\mathbf{v}^{b_j}_j-\mathbf R^{c_r}_{b_i}\mathbf{v}^{b_i}_i+\mathbf{g}^{c_r}\Delta t)=\boldsymbol{\beta}^{b_i}_{b_j}
$$
将上面的方程写成$\boldsymbol{H}^{b_i}_{b_j}\mathcal X_i=\mathbf z^{b_i}_{b_j}$的形式，可以得到
$$
\mathcal X_i=[\mathbf v^{b_i}_i,\mathbf v^{b_j}_j,\mathbf g^{c_r},s]^\top\\
\boldsymbol H^{b_i}_{b_j}=\begin{bmatrix}
-\boldsymbol I\Delta t & \boldsymbol 0 & \frac{1}{2}\mathbf R^{b_i}_{c_r}\Delta t^2 & \mathbf R^{b_i}_{c_r}(\mathbf p^{c_r}_{c_j}-\mathbf p^{c_r}_{c_i})\\
-\boldsymbol I & \mathbf R^{b_i}_{c_r}\mathbf R^{c_r}_{b_j} & \mathbf R^{b_i}_{c_r}\Delta t & \boldsymbol 0
\end{bmatrix}\\
\mathbf z^{b_i}_{b_j}=\begin{bmatrix}\boldsymbol\alpha^{b_i}_{b_j}-\mathbf p^b_c+\mathbf R^{b_i}_{c_r}\mathbf R^{c_r}_{b_j}\mathbf p^b_c\\\boldsymbol{\beta}^{b_i}_{b_j}\end{bmatrix}
$$
这样一来，$\boldsymbol H^{b_i}_{b_j}$和$\mathbf z^{b_i}_{b_j}$里面就全都是已知量了：$\boldsymbol\alpha^{b_i}_{b_j}$和$\boldsymbol{\beta}^{b_i}_{b_j}$都是测量得到的预积分量，$\mathbf p^b_c$是已知的外参，$\mathbf R^{b_i}_{c_r}$、$\mathbf R^{c_r}_{b_j}$、$\mathbf p^{c_r}_{b_j}、$$\mathbf p^{c_r}_{c_i}$都是在视觉初始化时求得的。构造线性最小二乘问题如下
$$
\min_{\mathcal X_i}\sum_{i,j\in B}\|\mathbf z^{b_i}_{b_j}-\boldsymbol H^{b_i}_{b_j}\mathcal X_i\|^2
$$
回忆第一讲中的内容，求目标函数的雅可比矩阵并令其等于零即可以得到增量方程。直接解这个方程即可得到优化变量的值。

### 重力矢量优化

在上一小节，我们已经求出了重力矢量，但是为什么还要对其进行优化呢？这是因为，之前我们求解重力矢量的过程并没有加入模长限制，也就是$\|\mathbf g^{c_r}\|=9.81$。所以，看似是三维变量，$\mathbf g^{c_r}$其实只有两个自由度。所以，可以使用球面坐标对其进行参数化。

<img src="https://i.postimg.cc/6q9Lpz3m/image-20250906164054075.png" alt="" style="zoom:50%;" />

可以将重力矢量重新表示为
$$
\mathbf g^{c_r}=\|g\|\cdot\bar{\mathbf g}^{c_r}+w_1\boldsymbol b_1+w_2\boldsymbol b_2=\|g\|\cdot\bar{\mathbf g}^{c_r}+\boldsymbol {bw}
$$
其中，$\bar{\mathbf g}^{c_r}$方向与先前优化得到的重力矢量的方向相同，模长为1；$\|g\|=9.81$；$\boldsymbol b_1$和$\boldsymbol b_2$为与$\bar{\mathbf g}^{c_r}$垂直的切平面上的一对正交单位向量，$\boldsymbol b=[\boldsymbol b_1,\boldsymbol b_2]$；$w_1$和$w_2$为优化变量，它们影响了重力矢量的修正方向，$\boldsymbol w=[w_1,w_2]^\top$。将新的重力矢量代回原方程$\boldsymbol{H}^{b_i}_{b_j}\mathcal X_i=\mathbf z^{b_i}_{b_j}$，可以得到
$$
\mathcal X_i=[\mathbf v^{b_i}_i,\mathbf v^{b_j}_j,\boldsymbol w,s]^\top\\
\boldsymbol H^{b_i}_{b_j}=
\begin{bmatrix}
-\boldsymbol I\Delta t & \boldsymbol 0 & \frac{1}{2}\mathbf R^{b_i}_{c_r}\Delta t^2\boldsymbol b  & \mathbf R^{b_i}_{c_r}(\mathbf p^{c_r}_{c_j}-\mathbf p^{c_r}_{c_i})\\
-\boldsymbol I & \mathbf R^{b_i}_{c_r}\mathbf R^{c_r}_{b_j} & \mathbf R^{b_i}_{c_r}\Delta t\boldsymbol b & \boldsymbol 0
\end{bmatrix}\\
\mathbf z^{b_i}_{b_j}=\begin{bmatrix}\boldsymbol\alpha^{b_i}_{b_j}-\mathbf p^b_c+\mathbf R^{b_i}_{c_r}\mathbf R^{c_r}_{b_j}\mathbf p^b_c-\frac{1}{2}\mathbf R^{b_i}_{c_r}\Delta t^2\|g\|\cdot\bar{\mathbf g}^{c_r}\\
\boldsymbol{\beta}^{b_i}_{b_j}-\mathbf R^{b_i}_{c_r}\Delta t\|g\|\cdot\bar{\mathbf g}^{c_r}\end{bmatrix}
$$
重新求解最小二乘问题即可求得最终的重力矢量。在代码中，迭代求解了多次这个线性最小二乘问题。如果$w_1$、$w_2$不等于零，会导致重力矢量的方向被优化了，但是模长不为9.81了。所以在每次迭代完成后，都会把生成的重力矢量的模调整为9.81，保证其一直在球面上。

### 坐标系对齐

现在，我们已经知道了重力矢量在伪世界坐标系中的表示$\mathbf g^{c_r}$。我们还知道，在世界坐标系下重力矢量为$\mathbf g^w=[0,0,-9.81]^\top$。于是，我们就可以根据这两个矢量求出从伪世界坐标系到世界坐标系下的旋转矩阵$\mathbf R^w_{c_r}$。

根据指数映射公式，有
$$
\mathbf R^w_{c_r}=\exp([\theta\mathbf n]_\times)
$$
旋转轴$\mathbf n$为
$$
\mathbf n=\frac{\mathbf g^{c_r}\times\mathbf g^w}{\|\mathbf g^{c_r}\times\mathbf g^w\|}
$$
旋转角$\theta$为
$$
\theta=\arctan\left(\frac{\|\mathbf g^{c_r}\times\mathbf g^w\|}{\mathbf g^{c_r}\cdot\mathbf g^w}\right)
$$
在VINS中，真正的世界坐标系按照下面的方式定义：

- 原点与滑窗中第0帧的相机坐标系的原点重合；
- $z$轴方向与重力矢量相反，为ENU坐标系；
- IMU在第0帧时相对世界坐标系的航向角等于零。在重新设定基准后，需要进行下面的变换。

首先根据下面的式子求出各帧IMU相对第0帧相机坐标系的位移
$$
s\mathbf p^{c_0}_{b_i}=s\mathbf p^{c_r}_{b_i}-s\mathbf p^{c_r}_{b_0}
$$
然后，之前优化得到的速度都是表示在IMU坐标系下的，需要将它们左乘一个$\mathbf R^{c_r}_{b_i}$以表示在伪世界坐标系下
$$
\mathbf v^{c_r}_{b_i}=\mathbf R^{c_r}_{b_i}
$$
之后，求出第0帧IMU坐标系相对世界坐标系的姿态：$\mathbf R^w_{b_0}=\mathbf R^{w}_{c_r}\mathbf R^{c_r}_{b_0}$。我们可以根据下式求出在世界坐标系下参考帧相对第0帧的航向角
$$
\mathrm{yaw}=(\mathbf R^{w}_{c_r}\mathbf R^{c_r}_{b_0})_{\mathrm{yaw}}
$$
之后用表示$-\mathrm{yaw}$的旋转矩阵左乘$\mathbf R^w_{c_r}$得到最终的$\mathbf R^{w}_{c_r}$，这样$\mathbf R^w_{c_r}$左乘$\mathbf R^{c_r}_{b_0}$后第0帧的航向角就等于零了。

现在，就可以将之前求得的所有表示在伪世界坐标系下的未知、速度、姿态旋转到真正的世界坐标系下了。在初始化的最后阶段算法还重新计算了特征点的深度以及预积分量，这里不再赘述。

