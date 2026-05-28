---
title: VIO快速入门（二）：视觉残差因子
date: 2026-05-28 10:00:00
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

在上一篇文章中我们已经了解了VIO后端优化的目标函数
$$
\begin{aligned}
\min_{\mathcal{X}}\left(\underbrace{\|\mathbf{r}_p-\mathbf{J}_p\mathcal{X}\|_{\boldsymbol\Sigma_p}^2}_{\mathrm{prior~error}}+\underbrace{\sum_{i,j\in B}\left\|\mathbf{r}_b(\hat{\mathbf{z}}^{b_i}_{b_{j}},\mathcal{X})\right\|_{\boldsymbol\Sigma^{b_i}_{b_{j}}}^2}_{\mathrm{IMU~error}}\\
+\underbrace{\sum_{j\in B,k\in F}\rho\left\|\mathbf{r}_c(\hat{\mathbf{z}}_{\mathbf{f}_k}^{c_{j}},\mathcal{X})\right\|_{\boldsymbol\Sigma_{\mathbf{f}_k}^{c_j}}^2}_{\text{image error}}\}\right)
\end{aligned}
$$
现在就让我们来学习一下在目标函数中残差的具体形式，以及相应的雅可比矩阵与协方差矩阵如何计算，这是求解优化问题必须完成的工作。

## 成像模型

在介绍视觉残差因子之前，首先来快速了解一下相机成像的模型。尽管相机成像的模型多种多样，但是在这里只介绍针孔相机模型。这个模型已经足以帮助我们理解视觉残差因子的构造原理了。

![针孔相机模型](https://i.postimg.cc/7LSqgjqS/slam2-2.png)

上面的图片展示了针孔相机模型的成像原理：也就是初中学过的相似三角形。图中点$O$为光心，$FO=f$也即焦距。在实际中成像平面应该在光心后方一个焦距的距离上，但是为了便于表示，通常都把成像平面对称地放到光心前面，这样同样也满足相似三角形的关系。于是可以有
$$
\dfrac{z}{f}=\dfrac{x}{x'}=\dfrac{y}{y'}
$$
其中，$(x,y,z)$为特征点在三维空间中相对相机坐标系的位置，$(x',y')$为特征点投影在成像平面上的坐标，这两个坐标的单位都是米。根据这个式子可以得出
$$
x'=f\dfrac{x}{z}\\
y'=f\dfrac{y}{z}
$$
在数字图像中，点的位置都是由像素表示的。因此我们还可以将点$(x',y')$映射到像素坐标系上
$$
\mu=\alpha x'+c_x\\
\nu=\beta y'+c_y
$$
这里$(\mu,\nu)$为特征点的像素坐标；$\alpha$、$\beta$为从成像平面到像素平面的缩放，单位为“像素/米”；$c_x$、$c_y$为像素坐标系原点与成像平面原点之间平移的距离，单位为像素。

令$f_x=\alpha f$，$f_y=\beta f$，上面的式子可以改写为
$$
\mu=f_x\dfrac{x}{z}+c_x\\
\nu=f_y\dfrac{y}{z}+c_y
$$
如果将上面的式子写成矩阵的形式，那么有
$$
\begin{bmatrix}\mu\\\nu\\1\end{bmatrix}=\dfrac{1}{z}\begin{bmatrix}f_{x}&0&c_{x}\\0&f_{y}&c_{y}\\0&0&1\end{bmatrix}\begin{bmatrix}x\\y\\z\end{bmatrix}
$$
式子中$3\times3$的矩阵$\boldsymbol K$为相机的内参矩阵。将这个矩阵移到等式左侧有
$$
\boldsymbol K^{-1}\begin{bmatrix}\mu\\\nu\\1\end{bmatrix}= \lambda\begin{bmatrix}x\\y\\z\end{bmatrix}=\begin{bmatrix}u\\v\\1\end{bmatrix}
$$
$[u,v,1]^\top$为特征点在归一化相机坐标系中的坐标，$\lambda=1/z$被称为逆深度。

在实际中，相机的内参可以自己标定或者由厂家提供，我们认为是已知的。这样，就可以根据特征点的像素坐标直接求出其在归一化相机坐标系中的坐标。在VIO中，视觉残差因子是通过在归一化相机坐标系中的特征点坐标构造的。

## 残差构造方法

回到这张经典的图片。

![一个典型的VIO问题](https://i.postimg.cc/gjC8YSKP/slam1-2.png)

假设路标点在世界中是静止不动的，我们可以根据路标点在第$i$帧的相机坐标系中的特征点的坐标，预测路标点在第$j$帧的相机坐标系中的特征点的坐标
$$
\begin{bmatrix}x_{c_j}\\y_{c_j}\\z_{c_j}\\1\end{bmatrix}={\mathbf{T}^b_{c}}^{-1}{\mathbf{T}^w_{b_j}}^{-1}\mathbf{T}^w_{b_i}\mathbf{T}^b_{c}\begin{bmatrix}x_{c_i}\\y_{c_i}\\z_{c_i}\\1\end{bmatrix}
$$
式中，$\mathbf T$为包含旋转与平移的$4\times 4$的变换矩阵；$\mathbf T^b_c$为从相机坐标系$c$到IMU坐标系$b$的变换矩阵（也即外参）；$\mathbf T^w_b$为从IMU坐标系$b$到世界坐标系$w$的变换矩阵（也即IMU或载体相对世界的位姿）。根据这个关系，就可以与量测结合构造视觉重投影误差（残差）
$$
\mathbf{r}_c(\hat{\mathbf{z}}_{\mathbf{f}_k}^{c_j},\mathcal{X}) = 
\begin{bmatrix}
{x_{c_j}}/z_{c_j}-\hat{u}_{c_j} \\
{y_{c_j}}/z_{c_j}-\hat{v}_{c_j}
\end{bmatrix}
$$
式中，$[\hat{u}_{c_j},\hat{v}_{c_j},1]^\top$为观测到的特征点在第$j$帧的归一化相机坐标系的坐标。在这个残差中，所有的变换矩阵$\mathbf T$和逆深度$\lambda_j$都是待优化的变量。大家可能乍一看觉得特征点在第$j$帧的相机坐标系中的三个位置分量都是不确定的，为何这里只优化了它的逆深度？这是因为我们认为特征点投影到归一化相机平面上的坐标是准确的，因此只有它在投影线上的位置需要确定。

在VINS-Fusion中由于多了一个相机，因此视觉残差的构成会稍微复杂一点：

1. 从第$i$帧左相机投影到第$j$帧左相机；
2. 从第$i$帧左相机投影到第$i$帧右相机；
3. 从第$i$帧左相机投影到第$j$帧右相机。

与VINS-Mono相比，多出来的其实就是后面两项。

## 雅可比矩阵推导

将$\mathbf T$中的旋转和平移分离开，可以将视觉残差写成下面的形式
$$
\mathbf{r}_{c}(\hat{z}_{\mathbf f_k}^{c_{j}},\mathcal{X})=\pi_{c}( {\mathbf R_{c}^{b}}^\top({\mathbf R_{b_{j}}^{w}}^{\top}(\mathbf R_{b_{i}}^{w}(\mathbf R_{c}^{b}\frac{1}{\lambda_{i}}\pi_{c}^{-1}(\begin{bmatrix}u_{c_{i}}\\v_{c_{i}}\end{bmatrix})+\mathbf p^b_{c})+\mathbf p^{w}_{b_i}-\mathbf p^{w}_{b_{j}})-\mathbf p^{b}_{c}))-\begin{bmatrix}\hat{u}_{c_{j}}\\\hat{v}_{c_{j}}\end{bmatrix}
$$
其中，$\pi_c$为将相机坐标系下的三维空间点投影到归一化相机坐标系的投影函数；$\mathbf R$为$3\times 3$的旋转矩阵；$\mathbf p$为三维的位移矢量。对于针孔相机模型，易知
$$
\pi_c(\mathbf p_{c_i}) = \begin{bmatrix}x_{c_i}/z_{c_i}\\ y_{c_i}/z_{c_i}\end{bmatrix}
$$
对于鱼眼相机模型，$\pi_c$需要将球面上的视觉残差投影到正切平面上，因此具有更加复杂的形式。

在视觉残差中，$\lambda_i$、$\mathbf R$、$\mathbf p$为优化变量，因此需要对它们求偏导。在下面的推导中，令
$$
\mathbf p_{c_i}=\frac{1}{\lambda_{i}}\pi_{c}^{-1}(\begin{bmatrix}u_{c_{i}}\\v_{c_{i}}\end{bmatrix})
$$
这里$\mathbf p_{c_i}$是路标点在第$i$帧相机坐标系中的特征点的位置。那么，原来的视觉残差可以写为
$$
\begin{aligned}
\mathbf{r}_{c}(\hat{z}_{\mathbf f_k}^{c_{j}},\mathcal{X})&=\pi_{c}( {\mathbf R_{c}^{b}}^\top({\mathbf R_{b_{j}}^{w}}^{\top}(\mathbf R_{b_{i}}^{w}(\mathbf R_{c}^{b}\mathbf p_{c_i}+\mathbf p^b_{c})+\mathbf p^{w}_{b_i}-\mathbf p^{w}_{b_{j}})-\mathbf p^{b}_{c}))-\begin{bmatrix}\hat{u}_{c_{j}}\\\hat{v}_{c_{j}}\end{bmatrix} \\
&= \pi_c(\mathbf p_{c_j})-\begin{bmatrix}\hat{u}_{c_{j}}\\\hat{v}_{c_{j}}\end{bmatrix}
\end{aligned}
$$
根据残差函数的形式可知，如果我们要对任一非$\mathbf p_{c_j}$的优化变量$\mathcal X$求导，都需要使用链式法则先对$\mathbf p_{c_j}$求偏导，然后再对$\mathcal X$求偏导，也即
$$
\frac{\partial \mathbf r_c}{\partial\mathcal X}=\frac{\partial\mathbf{r}_{c}}{\partial \mathbf p_{c_j}}\frac{\partial \mathbf p_{c_j}}{\partial\mathcal X}=\frac{\partial\pi_c(\mathbf p_{c_j})}{\partial\mathbf p_{c_j}}\frac{\partial\mathbf p_{c_j}}{\partial\mathcal X}
$$
由于
$$
\pi_c(\mathbf p_{c_j}) = \begin{bmatrix}x_{c_j}/z_{c_j}\\ y_{c_j}/z_{c_j}\end{bmatrix}
$$
易得
$$
\frac{\partial\mathbf{r}_{c}}{\partial \mathbf p_{c_j}}=\frac{\partial\pi_c(\mathbf p_{c_j})}{\partial\mathbf p_{c_j}}=\begin{bmatrix}\frac{1}{z_{c_j}}&0&-\frac{x_{c_j}}{z_{c_j}^2}\\0&\frac{1}{z_{c_j}}&-\frac{y_{c_j}^2}{z_{c_j}^2}\end{bmatrix}
$$
下面在介绍残差对任一非$\mathbf p_{c_j}$的优化变量$\mathcal X$求导时，就只介绍${\partial\mathbf p_{c_j}}/{\partial\mathcal X}$的部分了。

首先是对第$i$帧的位置$\mathbf p_{b_i}^w$求偏导。这部分非常简单
$$
\frac{\partial\mathbf{r}_{c}}{\partial\mathbf p^w_{b_i}}=\frac{\partial\mathbf{r}_{c}}{\partial \mathbf p_{c_j}}\frac{\partial \mathbf p_{c_j}}{\partial\mathbf p^w_{b_i}}=\frac{\partial\mathbf{r}_{c}}{\partial \mathbf p_{c_j}}{\mathbf R_{c}^{b}}^\top{\mathbf R_{b_{j}}^{w}}^\top
$$
之后是对第$i$帧的姿态求偏导，这部分稍微比较复杂，需要先介绍两个前置知识。

首先介绍反对称矩阵。对一个矩阵$\boldsymbol A$，若它满足
$$
\boldsymbol A^\top=-\boldsymbol A
$$
那么这个矩阵是一个反对称矩阵。

反对称矩阵可以用来表示向量的叉乘
$$
\boldsymbol{a}\times\boldsymbol{b}=\begin{bmatrix}\boldsymbol{i}&\boldsymbol{j}&\boldsymbol{k}\\a_1&a_2&a_3\\b_1&b_2&b_3\end{bmatrix}=\begin{bmatrix}a_2b_3-a_3b_2\\a_3b_1-a_1b_3\\a_1b_2-a_2b_1\end{bmatrix}=\begin{bmatrix}0&-a_3&a_2\\a_3&0&-a_1\\-a_2&a_1&0\end{bmatrix}\boldsymbol{b}
$$
我们将上面等式右侧的矩阵记为$[\boldsymbol a]_\times$，显然这是一个反对称矩阵，而且是$\boldsymbol a$唯一对应的反对称矩阵。根据向量叉乘的性质可以得知反对称矩阵的性质
$$
[\boldsymbol a]_\times\boldsymbol b=-[\boldsymbol b]_\times\boldsymbol a
$$
然后介绍如何对旋转矩阵求导。

对于任意的一个随时间变化的旋转矩阵$\boldsymbol R(t)$，均有$\boldsymbol R(t) \boldsymbol R(t)^\top=\boldsymbol I$。在等式两边对时间求导可得
$$
\dot{\boldsymbol R}(t)\boldsymbol R(t)^\top+\boldsymbol R(t)\dot{\boldsymbol R}(t)^\top=0
$$
整理得
$$
\dot{\boldsymbol R}(t)\boldsymbol R(t)^\top=-({\dot{\boldsymbol R}(t)\boldsymbol R(t)^\top})^\top
$$
所以$\dot{\boldsymbol R}(t)\boldsymbol R(t)^\top$是一个反对称矩阵。假设这个反对称矩阵对应的向量为$\boldsymbol \phi(t)$，那么
$$
\dot{\boldsymbol R}(t)=[\boldsymbol \phi(t)]_\times\boldsymbol R(t)
$$
假设$t$在$t_0$附近有，$\boldsymbol R(t_0)=\boldsymbol I$，$\boldsymbol \phi(t_0)=\boldsymbol \phi_0$为常数，那么
$$
\dot{\boldsymbol R}(t)=[\boldsymbol \phi_0]_\times\boldsymbol R(t)
$$
解这个微分方程可得
$$
\boldsymbol R(t)=\exp([\boldsymbol \phi_0]_\times t)
$$
这里$\boldsymbol R$在特殊正交群SO(3)中，$\boldsymbol \phi$是对应到SO(3)上的李代数$\mathfrak{so}(3)$。将上面的结论推广到任意时刻，可以得到指数映射公式
$$
\boldsymbol R=\exp([\boldsymbol\phi]_\times)
$$
那么如何计算$\exp([\boldsymbol\phi]_\times)$呢？可以使用泰勒公式对其进行展开。将$\boldsymbol\phi$表示为$\theta\boldsymbol n$（$\theta$为标量，$\boldsymbol n$为三维单位向量），这里不加证明地给出下面的关系
$$
\exp([\theta\boldsymbol n]_\times)=\cos\theta\boldsymbol I+(1-\cos\theta)\boldsymbol {nn}^\top+\sin\theta[\boldsymbol n]_\times
$$
上面的公式被称为罗德里格斯公式，$\theta$为旋转的角度，$\boldsymbol n$为旋转轴。这个公式的作用就是将SO(3)上的旋转矩阵$\boldsymbol R$映射到$\mathfrak{so}(3)$上的轴角$\boldsymbol \phi$。这个关系可以用来求某个变换对旋转矩阵的导数。

假设有一空间点$\boldsymbol p$，旋转后得到$\boldsymbol{Rp}$，要求旋转之后点的坐标对旋转的导数$\frac{\partial\boldsymbol{Rp}}{\partial\boldsymbol R}$，可以在右侧对$\boldsymbol R$增加一个小扰动$\Delta\boldsymbol R$，看结果相对这个扰动的变化率。设$\boldsymbol R$对应的李代数为$\boldsymbol\phi$，$\Delta\boldsymbol R$对应的李代数为$\delta\boldsymbol\theta$，那么根据指数映射有
$$
\frac{\partial\boldsymbol{Rp}}{\partial\boldsymbol R}=\frac{\partial\boldsymbol{R}\Delta\boldsymbol{Rp}}{\partial\delta\boldsymbol\theta}=\lim_{\delta\boldsymbol\theta\to0}\frac{\exp([\boldsymbol\phi]_\times)\exp([\delta\boldsymbol\theta]_\times)\boldsymbol p-\exp([\boldsymbol\phi]_\times)\boldsymbol p}{\delta\boldsymbol\theta}
$$
当$\delta\boldsymbol\theta\to0$时，根据罗德里格斯公式有
$$
\exp([\delta\boldsymbol\theta]_\times)=\boldsymbol I+[\delta\boldsymbol\theta]_\times
$$
于是
$$
\begin{aligned}
\frac{\partial\boldsymbol{Rp}}{\partial\delta\boldsymbol\theta}&=\lim_{\delta\boldsymbol\theta\to0}\frac{\exp([\boldsymbol\phi]_\times)(\boldsymbol I+[\delta\boldsymbol\theta]_\times)\boldsymbol p-\exp([\boldsymbol\phi]_\times)\boldsymbol p}{\delta\boldsymbol\theta}\\
&=\lim_{\delta\boldsymbol\theta\to0}\frac{\exp([\boldsymbol\phi]_\times)[\delta\boldsymbol\theta]_\times\boldsymbol p}{\delta\boldsymbol\theta}\\
&=\lim_{\delta\boldsymbol\theta\to0}\frac{\boldsymbol R[\delta\boldsymbol\theta]_\times\boldsymbol p}{\delta\boldsymbol\theta}\\
&=\lim_{\delta\boldsymbol\theta\to0}-\frac{\boldsymbol R[\boldsymbol p]_\times\delta\boldsymbol\theta}{\delta\boldsymbol\theta}\\
&=-\boldsymbol R[\boldsymbol p]_\times
\end{aligned}
$$
上面为右扰动下对旋转矩阵的求导，换成左扰动也有类似的结果。

回到VIO上，现在我们来对第$i$帧的姿态（也即$\mathbf R^w_{b_i}$）求偏导，也即求
$$
\frac{\partial\mathbf{r}_{c}}{\partial\mathbf R^w_{b_i}}=\frac{\partial\mathbf{r}_{c}}{\partial \mathbf p_{c_j}}\frac{\partial \mathbf p_{c_j}}{\partial\mathbf R^w_{b_i}}
$$
下面使用扰动法求$\frac{\partial \mathbf p_{c_j}}{\partial\mathbf R^w_{b_i}}$，这里略去了后面一大串无关的项，求导过程也比较简单
$$
\begin{aligned}
\frac{\partial \mathbf p_{c_j}}{\partial\mathbf R^w_{b_i}}&=\lim_{\delta\boldsymbol\theta\to 0}\frac{{\mathbf R_{c}^{b}}^\top{\mathbf R_{b_j}^{w}}^\top \mathbf R_{b_{i}}^{w}\exp([\delta\boldsymbol\theta]_\times)(\mathbf R^b_c\mathbf p_{c_{i}}+\mathbf p^{b}_{c})-{\mathbf R_{c}^{b}}^\top{\mathbf R_{b_j}^{w}}^\top \mathbf R_{b_{i}}^{w}(\mathbf R^b_c\mathbf p_{c_{i}}+\mathbf p^{b}_{c})}{\delta\boldsymbol\theta} \\
&=\lim_{\delta\boldsymbol\theta\to 0}\frac{{\mathbf R_{c}^{b}}^\top{\mathbf R_{b_j}^{w}}^\top \mathbf R_{b_{i}}^{w}[\delta\boldsymbol\theta]_\times(\mathbf R^b_c\mathbf p_{c_{i}}+\mathbf p^{b}_{c})}{\delta\boldsymbol\theta} \\
&=\lim_{\delta\boldsymbol\theta\to 0}-\frac{{\mathbf R_{c}^{b}}^\top{\mathbf R_{b_j}^{w}}^\top \mathbf R_{b_{i}}^{w}[\mathbf R^b_c\mathbf p_{c_{i}}+\mathbf p^{b}_{c}]_\times\delta\boldsymbol\theta}{\delta\boldsymbol\theta} \\
&=-{\mathbf R_{c}^{b}}^\top{\mathbf R_{b_j}^{w}}^\top \mathbf R_{b_{i}}^{w}[\mathbf R^b_c\mathbf p_{c_{i}}+\mathbf p^{b}_{c}]_\times
\end{aligned}
$$
之后求$\frac{\partial \mathbf p_{c_j}}{\partial\mathbf p^w_{b_j}}$，这个导数也非常简单，可以直接看出来
$$
\frac{\partial \mathbf p_{c_j}}{\partial\mathbf p^w_{b_j}}=-{\mathbf R_c^b}^\top{\mathbf R^w_{bj}}^\top
$$
再来求$\frac{\partial \mathbf p_{c_j}}{\partial\mathbf R^w_{b_j}}$，同样略去无关项，使用一样的方法计算
$$
\begin{aligned}
\frac{\partial \mathbf p_{c_j}}{\partial\mathbf R^w_{b_j}}&=\lim_{\delta\boldsymbol\theta\to 0}\frac{{\mathbf R_{c}^{b}}^\top({\mathbf R_{b_j}^{w}\exp([\delta\boldsymbol\theta]_\times)})^\top(\mathbf R_{b_{i}}^{w}(\mathbf R_{c}^{b}\mathbf p_{c_i}+\mathbf p^b_{c})+\mathbf p^{w}_{b_i}-\mathbf p^{w}_{b_{j}})-{\mathbf R_{c}^{b}}^\top{\mathbf R_{b_j}^{w}}^\top(\mathbf R_{b_{i}}^{w}(\mathbf R_{c}^{b}\mathbf p_{c_i}+\mathbf p^b_{c})+\mathbf p^{w}_{b_i}-\mathbf p^{w}_{b_{j}})}{\delta\boldsymbol\theta} \\
&=\lim_{\delta\boldsymbol\theta\to 0}\frac{{\mathbf R_{c}^{b}}^\top\exp([\delta\boldsymbol\theta]_\times)^\top{\mathbf R_{b_j}^{w}}^\top(\mathbf R_{b_{i}}^{w}(\mathbf R_{c}^{b}\mathbf p_{c_i}+\mathbf p^b_{c})+\mathbf p^{w}_{b_i}-\mathbf p^{w}_{b_{j}})-{\mathbf R_{c}^{b}}^\top{\mathbf R_{b_j}^{w}}^\top(\mathbf R_{b_{i}}^{w}(\mathbf R_{c}^{b}\mathbf p_{c_i}+\mathbf p^b_{c})+\mathbf p^{w}_{b_i}-\mathbf p^{w}_{b_{j}})}{\delta\boldsymbol\theta} \\
&=\lim_{\delta\boldsymbol\theta\to 0}\frac{{\mathbf R_{c}^{b}}^\top\exp([-\delta\boldsymbol\theta]_\times){\mathbf R_{b_j}^{w}}^\top(\mathbf R_{b_{i}}^{w}(\mathbf R_{c}^{b}\mathbf p_{c_i}+\mathbf p^b_{c})+\mathbf p^{w}_{b_i}-\mathbf p^{w}_{b_{j}})-{\mathbf R_{c}^{b}}^\top{\mathbf R_{b_j}^{w}}^\top(\mathbf R_{b_{i}}^{w}(\mathbf R_{c}^{b}\mathbf p_{c_i}+\mathbf p^b_{c})+\mathbf p^{w}_{b_i}-\mathbf p^{w}_{b_{j}})}{\delta\boldsymbol\theta} \\
&=\lim_{\delta\boldsymbol\theta\to 0}\frac{{\mathbf R_{c}^{b}}^\top(\boldsymbol I-[\delta\boldsymbol\theta]_\times){\mathbf R_{b_j}^{w}}^\top(\mathbf R_{b_{i}}^{w}(\mathbf R_{c}^{b}\mathbf p_{c_i}+\mathbf p^b_{c})+\mathbf p^{w}_{b_i}-\mathbf p^{w}_{b_{j}})-{\mathbf R_{c}^{b}}^\top{\mathbf R_{b_j}^{w}}^\top(\mathbf R_{b_{i}}^{w}(\mathbf R_{c}^{b}\mathbf p_{c_i}+\mathbf p^b_{c})+\mathbf p^{w}_{b_i}-\mathbf p^{w}_{b_{j}})}{\delta\boldsymbol\theta} \\
&=\lim_{\delta\boldsymbol\theta\to 0}\frac{-{\mathbf R_{c}^{b}}^\top[\delta\boldsymbol\theta]_\times{\mathbf R_{b_j}^{w}}^\top(\mathbf R_{b_{i}}^{w}(\mathbf R_{c}^{b}\mathbf p_{c_i}+\mathbf p^b_{c})+\mathbf p^{w}_{b_i}-\mathbf p^{w}_{b_{j}})}{\delta\boldsymbol\theta} \\
&=\lim_{\delta\boldsymbol\theta\to 0}\frac{{\mathbf R_{c}^{b}}^\top[{\mathbf R_{b_j}^{w}}^\top(\mathbf R_{b_{i}}^{w}(\mathbf R_{c}^{b}\mathbf p_{c_i}+\mathbf p^b_{c})+\mathbf p^{w}_{b_i}-\mathbf p^{w}_{b_{j}})]_\times\delta\boldsymbol\theta}{\delta\boldsymbol\theta} \\
&={\mathbf R_{c}^{b}}^\top[{\mathbf R_{b_j}^{w}}^\top(\mathbf R_{b_{i}}^{w}(\mathbf R_{c}^{b}\mathbf p_{c_i}+\mathbf p^b_{c})+\mathbf p^{w}_{b_i}-\mathbf p^{w}_{b_{j}})]_\times
\end{aligned}
$$
注意上面在处理$\exp([\delta\boldsymbol\theta]_\times)$时，使用了下面的关系
$$
\begin{aligned}
\exp([\theta\boldsymbol n]_\times)^\top&=\cos\theta\boldsymbol I^\top+(1-\cos\theta)(\boldsymbol {nn}^\top)^\top+\sin\theta([\boldsymbol n]_\times)^\top\\
&=\cos\theta\boldsymbol I+(1-\cos\theta)\boldsymbol {nn}^\top+\sin\theta[-\boldsymbol n]_\times \\
&=\exp([-\theta\boldsymbol n]_\times)
\end{aligned}
$$
之后对特征点的逆深度$\lambda_i$求偏导，易得
$$
\frac{\partial \mathbf p_{c_j}}{\partial\lambda_i}=-{\mathbf R_{c}^{b}}^\top{\mathbf R_{b_{j}}^{w}}^{\top}\mathbf R_{b_{i}}^{w}\mathbf R_{c}^{b}\pi_{c}^{-1}(\begin{bmatrix}u_{c_{i}}\\v_{c_{i}}\end{bmatrix})\frac{1}{{\lambda_{i}}^2}
$$
最后，对外参的平移部分$\mathbf p_c^b$求偏导，易得
$$
\frac{\partial \mathbf p_{c_j}}{\partial\mathbf p^b_c}={\mathbf R^b_c}^\top({\mathbf R_{b_j}^w}^\top\mathbf R_{b_i}^w-\boldsymbol I)
$$
再对外参的旋转部分$\mathbf R_c^b$求偏导。这部分不是那么易得……

把$\mathbf p_{c_j}$写成两部分
$$
\begin{aligned}
\mathbf p_{c_j}&=\mathbf f_1+\mathbf f_2\\
&=\{{\mathbf R_c^b}^\top{\mathbf R_{b_j}^w}^\top\mathbf R_{b_i}^w\mathbf R_c^b\mathbf p_{c_i}\}+\{{\mathbf R_c^b}^\top({\mathbf R_{b_j}^w}^\top(\mathbf R_{b_i}^w\mathbf p_c^b+\mathbf p_{b_i}^w-\mathbf p_{b_j}^w)-\mathbf p_c^b)\}
\end{aligned}
$$
先求$\frac{\partial\mathbf f_1}{\partial\mathbf R_c^b}$
$$
\begin{aligned}
\frac{\partial\mathbf f_1}{\partial\mathbf R_c^b}&=\lim_{\delta\boldsymbol\theta\to 0}\frac{({\mathbf R_c^b}\exp([\delta\boldsymbol\theta]_\times))^\top{\mathbf R_{b_j}^w}^\top\mathbf R_{b_i}^w\mathbf R_c^b\exp([\delta\boldsymbol\theta]_\times)\mathbf p_{c_i}-{\mathbf R_c^b}^\top{\mathbf R_{b_j}^w}^\top\mathbf R_{b_i}^w\mathbf R_c^b\mathbf p_{c_i}}{\delta\boldsymbol\theta} \\
&=\lim_{\delta\boldsymbol\theta\to 0}\frac{(\boldsymbol I-[\delta\boldsymbol\theta]_\times){\mathbf R_c^b}^\top{\mathbf R_{b_j}^w}^\top\mathbf R_{b_i}^w\mathbf R_c^b(\boldsymbol I+[\delta\boldsymbol\theta]_\times)\mathbf p_{c_i}-{\mathbf R_c^b}^\top{\mathbf R_{b_j}^w}^\top\mathbf R_{b_i}^w\mathbf R_c^b\mathbf p_{c_i}}{\delta\boldsymbol\theta}
\end{aligned}
$$
将分子展开并略去二阶小量可得
$$
\begin{aligned}
\frac{\partial\mathbf f_1}{\partial\mathbf R_c^b}&=\lim_{\delta\boldsymbol\theta\to 0}\frac{{\mathbf R_c^b}^\top{\mathbf R_{b_j}^w}^\top\mathbf R_{b_i}^w\mathbf R_c^b[\delta\boldsymbol\theta]_\times\mathbf p_{c_i}-[\delta\boldsymbol\theta]_\times{\mathbf R_c^b}^\top{\mathbf R_{b_j}^w}^\top\mathbf R_{b_i}^w\mathbf R_c^b\mathbf p_{c_i}}{\delta\boldsymbol\theta} \\
&=-{\mathbf R_c^b}^\top{\mathbf R_{b_j}^w}^\top\mathbf R_{b_i}^w\mathbf R_c^b[\mathbf p_{c_i}]_\times+[{\mathbf R_c^b}^\top{\mathbf R_{b_j}^w}^\top\mathbf R_{b_i}^w\mathbf R_c^b\mathbf p_{c_i}]_\times
\end{aligned}
$$
再来求$\frac{\partial\mathbf f_2}{\partial\mathbf R_c^b}$
$$
\begin{aligned}
\frac{\partial\mathbf f_2}{\partial\mathbf R_c^b}&=\lim_{\delta\boldsymbol\theta\to 0}\frac{(\boldsymbol I-[\delta\boldsymbol\theta]_\times){\mathbf R_c^b}^\top({\mathbf R_{b_j}^w}^\top(\mathbf R_{b_i}^w\mathbf p_c^b+\mathbf p_{b_i}^w-\mathbf p_{b_j}^w)-\mathbf p_c^b)-{\mathbf R_c^b}^\top({\mathbf R_{b_j}^w}^\top(\mathbf R_{b_i}^w\mathbf p_c^b+\mathbf p_{b_i}^w-\mathbf p_{b_j}^w)-\mathbf p_c^b)}{\delta\boldsymbol\theta}\\
&=\lim_{\delta\boldsymbol\theta\to 0}\frac{-[\delta\boldsymbol\theta]_\times{\mathbf R_c^b}^\top({\mathbf R_{b_j}^w}^\top(\mathbf R_{b_i}^w\mathbf p_c^b+\mathbf p_{b_i}^w-\mathbf p_{b_j}^w)-\mathbf p_c^b)}{\delta\boldsymbol\theta} \\
&=[{\mathbf R_c^b}^\top({\mathbf R_{b_j}^w}^\top(\mathbf R_{b_i}^w\mathbf p_c^b+\mathbf p_{b_i}^w-\mathbf p_{b_j}^w)-\mathbf p_c^b)]_\times
\end{aligned}
$$
将上面两部分合二为一得
$$
\frac{\partial \mathbf p_{c_j}}{\partial\mathbf R^b_c}=\frac{\partial\mathbf f_1}{\partial\mathbf R^b_c}+\frac{\partial\mathbf f_2}{\partial\mathbf R^b_c}
$$
在VINS中，还对图像帧与IMU数据的时间偏移$t_d$进行了优化，这部分留到之后再介绍。

## 协方差矩阵推导

视觉残差的噪声协方差与重投影误差有关，这里取1.5个像素。这个误差对应到归一化相机坐标系平面上需要除以焦距$f$。因此一个视觉残差的信息矩阵为
$$
{\boldsymbol \Sigma_{\mathbf f_k}^{c_j}}^{-1}=(\frac{1.5}{f}\boldsymbol I_{2\times2})^{-1} = \frac{f}{1.5}\boldsymbol I_{2\times2}
$$

