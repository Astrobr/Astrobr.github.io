---
title: VIO快速入门（三）：IMU残差因子
date: 2026-06-02 16:00:00
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

在上一篇文章中我们已经了解了VIO视觉残差因子与其雅可比矩阵和信息矩阵的构造和计算方法。
$$
\begin{aligned}
\min_{\mathcal{X}}\left(\underbrace{\|\mathbf{r}_p-\mathbf{J}_p\mathcal{X}\|_{\boldsymbol\Sigma_p}^2}_{\mathrm{prior~error}}+\underbrace{\sum_{i,j\in B}\left\|\mathbf{r}_b(\hat{\mathbf{z}}^{b_i}_{b_{j}},\mathcal{X})\right\|_{\boldsymbol\Sigma^{b_i}_{b_{j}}}^2}_{\mathrm{IMU~error}}\\
+\underbrace{\sum_{j\in B,k\in F}\rho\left\|\mathbf{r}_c(\hat{\mathbf{z}}_{\mathbf{f}_k}^{c_{j}},\mathcal{X})\right\|_{\boldsymbol\Sigma_{\mathbf{f}_k}^{c_j}}^2}_{\text{image error}}\}\right)
\end{aligned}
$$
现在让我们学习一下IMU残差因子的构造方法，与其雅可比矩阵和信息矩阵的计算。

## IMU模型与预积分

IMU是用于测量加速度（由加速度计测量）与角速度（由陀螺仪测量）的元器件，它的具体原理不在这里介绍，大家只需要知道在VIO中它“长成”什么样子即可。在VIO中，IMU的模型如下
$$
\begin{aligned}
\hat{\boldsymbol{\omega}}^b&=\boldsymbol{\omega}^b+\mathbf{b}_g+\mathbf{n}_g\\
\hat{\mathbf{a}}^b&=\mathbf{a}^b+\mathbf{q}_{w}^b\mathbf{g}^w+\mathbf{b}_a+\mathbf{n}_a
\end{aligned}
$$
式中，$\hat{\boldsymbol\omega}^b$为IMU输出的角速度的量测；$\boldsymbol \omega^b$为角速度的真值；$\mathbf b_g$为陀螺仪的零偏；$\mathbf n_g$为陀螺仪的噪声；$\hat{\mathbf a}^b$为IMU输出的加速度的量测；$\mathbf q^b_w$为世界坐标系$w$相对IMU坐标系（也即体坐标系）$b$的姿态四元数；$\mathbf a^b$为IMU坐标系下加速度的真值；$\mathbf g^w$为重力加速度；$\mathbf b_a$为加速度计的零偏；$\mathbf n_a$为加速度计的噪声。所谓零偏指的是在真值为零的情况下，传感器输出的一个不为零的量测，这个量测即为零偏。另外，这里的噪声都认为是高斯白噪声。

那么，如何根据IMU的量测计算得到位置、速度、姿态呢？首先给出连续形式下从第$i$帧到第$j$帧的IMU积分方法
$$
\begin{aligned}
&\mathbf{p}^w_{b_j}=\mathbf{p}^w_{b_i}+\mathbf{v}_i^w\Delta t+\iint_{t\in[i,j]}(\mathbf{R}^w_{b_t}(\hat{\mathbf{a}}^{b_t}-\mathbf b_{a_t})-\mathbf{g}^w)\delta t^2\\
&\mathbf{v}_{b_j}^w=\mathbf{v}_{b_i}^w+\int_{t\in[i,j]}(\mathbf{R}^w_{b_t}(\hat{\mathbf{a}}^{b_t}-\mathbf b_{a_t})-\mathbf{g}^w)\delta t\\
&\mathbf{q}^w_{b_j}=\int_{t\in[i,j]}\mathbf{q}^w_{b_t}\otimes\begin{bmatrix}0\\\frac{1}{2}(\hat{\boldsymbol{\omega}}^{b_t}-\mathbf b_{g_t})\end{bmatrix}\delta t
\end{aligned}
$$

式中，从上到下分别是对位置、速度、姿态四元数的积分；$\Delta t=t_j-t_i$。注意，因为任一时刻的噪声是无法确定的，因此这里没办法把它们像零偏一样扣除。对位置和速度的积分方法应该比较好理解，注意加速度计测量得到的是IMU坐标系下的加速度，因此需要将它旋转到世界坐标系下。这里主要介绍一下对姿态的积分。大家都知道，对旋转的叠加应该使用（广义的）乘法。那么令$\delta\mathbf q$为短时间内转动的一个小量，则在转动之后原四元数$\mathbf q_0$变为
$$
\mathbf q=\mathbf q_0\otimes\delta\mathbf q
$$
四元数与轴角满足如下关系
$$
\mathbf q=\begin{bmatrix}\cos\frac{\theta}{2}\\\boldsymbol n\sin\frac{\theta}{2}\end{bmatrix}
$$
其中，$\theta$为转动的角度，$\boldsymbol n$为旋转轴。那么当$\theta\to0$时，有
$$
\delta\mathbf q=\begin{bmatrix}1\\\frac{1}{2}\boldsymbol n\theta\end{bmatrix}=\begin{bmatrix}1\\\frac{1}{2}\boldsymbol\omega\delta t\end{bmatrix}
$$
其中，$\delta t\to 0$。之后根据导数的定义，求四元数对时间的导数
$$
\begin{aligned}
\dot{\mathbf q}&=\lim_{\delta t\to 0}\frac{\mathbf q_0\otimes\delta\mathbf q-\mathbf q_0}{\delta t}\\
&=\lim_{\delta t\to 0}\frac{\mathbf q_0\otimes(\begin{bmatrix}1\\\frac{1}{2}\boldsymbol \omega\delta t\end{bmatrix}-\begin{bmatrix}1\\\mathbf 0\end{bmatrix})}{\delta t}\\
&=\mathbf q_0\otimes\begin{bmatrix}0\\\frac{1}{2}\boldsymbol\omega\end{bmatrix}
\end{aligned}
$$

至此，就完成对四元数积分的推导了。当然，在计算机上这种积分必须转换为离散形式的。在VINS中，使用中值积分法进行积分。这里每一步的积分可以表示为
$$
\begin{aligned}
&\mathbf p_{b_{k+1}}^w=\mathbf p_{b_k}^w+\mathbf v^w_{b_k}\Delta t+\frac{1}{2}\bar{\hat{\mathbf a}}^{b_k}\Delta t^2\\
&\mathbf v^w_{b_{k+1}}=\mathbf v^w_{b_k}+\bar{\hat{\mathbf a}}^{b_k}\Delta t\\
&\mathbf q_{b_{k+1}}^w=\mathbf q^w_{b_k}\otimes\begin{bmatrix}1\\\frac{1}{2}\bar{\hat{\boldsymbol\omega}}^{b_k}\Delta t\end{bmatrix}
\end{aligned}
$$
其中，$k$是$i$、$j$两帧之间的离散时刻，并且有
$$
\begin{aligned}
&\bar{\hat{\mathbf a}}^{b_k}=\frac{1}{2}[\mathbf{q}_{b_k}^w(\hat{\mathbf{a}}^{b_k}-\mathbf b_{a_k})-\mathbf{g}^w+\mathbf{q}_{b_{k+1}}^w(\hat{\mathbf{a}}^{b_{k+1}}-\mathbf b_{a_{k}})-\mathbf{g}^w] \\
&\bar{\hat{\boldsymbol \omega}}^{b_{k}}=\frac{1}{2}(\hat{\boldsymbol\omega}^{b_{k}}+\hat{\boldsymbol\omega}^{b_{k+1}})-\mathbf b_{g_k}
\end{aligned}
$$

在这里使用中值积分得到的结果被用作第$j$帧图像的优化初值。

回忆第一讲中的内容，对IMU的数据积分的作用是求出IMU在各帧时相对世界坐标系的位置、速度、姿态，然后将待估计的位置、速度、姿态的优化变量与预积分出来的结果作差得到残差。需要注意到，一旦优化得到新的$\mathbf q_b^w$，那么滑动窗口内所有的积分都要重新进行计算。这个计算不容小觑，要知道IMU的数据是以200Hz的频率发布的。为了解决这个问题，VINS使用了预积分的策略来减小计算量。只需要做一下简单的变换，就可以将原来的积分模型转换为预积分模型
$$
\begin{aligned}
&\mathbf{p}^w_{b_j}=\mathbf{p}^w_{b_i}+\mathbf{v}_i^w\Delta t -\frac{1}{2}\mathbf g^w\Delta t^2+\mathbf R_{b_i}^{w}\iint_{t\in[i,j]}\mathbf{R}^{b_i}_{b_t}(\hat{\mathbf{a}}^{b_t}-\mathbf b_{a_t})\delta t^2\\
&\mathbf{v}_{b_j}^w=\mathbf{v}_{b_i}^w-\mathbf g^w\Delta t+\mathbf R_{b_i}^w\int_{t\in[i,j]}\mathbf{R}^{b_i}_{b_t}(\hat{\mathbf{a}}^{b_t}-\mathbf b_{a_t})\delta t\\
&\mathbf{q}^w_{b_j}=\mathbf q^w_{b_i}\int_{t\in[i,j]}\mathbf{q}^{b_i}_{b_t}\otimes\begin{bmatrix}0\\\frac{1}{2}(\hat{\boldsymbol{\omega}}^{b_t}-\mathbf b_{g_t})\end{bmatrix}\delta t
\end{aligned}
$$
上面等式中最右边的部分即为预积分量，它们只与IMU的测量值有关。因此如果优化后得到了新的状态量，就不需要重新进行积分，而只用做几次加减法即可。预积分量的定义如下
$$
\begin{aligned}
&\boldsymbol\alpha_{b_j}^{b_i}=\iint_{t\in[i,j]}\mathbf{R}^{b_i}_{b_t}(\hat{\mathbf{a}}^{b_t}-\mathbf b_{a_t})\delta t^2\\
&\boldsymbol\beta_{b_j}^{b_i}=\int_{t\in[i,j]}\mathbf{R}^{b_i}_{b_t}(\hat{\mathbf{a}}^{b_t}-\mathbf b_{a_t})\delta t\\
&\boldsymbol\gamma_{b_j}^{b_i}=\int_{t\in[i,j]}\mathbf{q}^{b_i}_{b_t}\otimes\begin{bmatrix}0\\\frac{1}{2}(\hat{\boldsymbol{\omega}}^{b_t}-\mathbf b_{g_t})\end{bmatrix}\delta t
\end{aligned}
$$
同样，预积分量的计算需要表示为离散的形式
$$
\begin{aligned}
&\bar{\hat{\boldsymbol\omega}}^{b_k}=\frac{1}{2}((\hat{\boldsymbol{\omega}}^{b_k}-\mathbf{b}_{g_k})+(\hat{\boldsymbol{\omega}}^{b_{k+1}}-\mathbf{b}_{g_k}))\\
&\boldsymbol{\gamma}^{b_i}_{b_{k+1}}=\boldsymbol{\gamma}^{b_i}_{b_k}\otimes\begin{bmatrix}1\\\frac{1}{2}\bar{\hat{\boldsymbol{\omega}}}^{b_k}\Delta t\end{bmatrix}\\
&\bar{\hat{\mathbf{a}}}^{b_k}=\frac{1}{2}[\mathbf{R}^{b_i}_{b_k}(\hat{\mathbf{a}}^{b_k}-\mathbf{b}_{a_k})+\mathbf{R}^{b_i}_{b_{k+1}}(\hat{\mathbf{a}}^{b_{k+1}}-\mathbf{b}_{a_k}))\\
&\boldsymbol{\alpha}^{b_i}_{b_{k+1}}=\boldsymbol{\alpha}^{b_i}_{b_k}+\boldsymbol{\beta}^{b_i}_{b_k}\Delta t+\frac{1}{2}\bar{\hat{\mathbf{a}}}^{b_k}\Delta t^2\\
&\boldsymbol{\beta}^{b_i}_{b_{k+1}}=\boldsymbol\beta^{b_i}_{b_k}+\bar{\hat{\mathbf{a}}}^{b_k}\Delta t
\end{aligned}
$$

## 残差构造方法

在VIO的优化问题中，第$i$、$j$帧图像拍摄时IMU的位置、速度、姿态、陀螺仪和加速度计的零偏是优化变量。那么，可以将预积分量作为量测，构造残差因子
$$
\mathbf{r}_b(\hat{\mathbf{z}}^{b_i}_{b_{j}},\mathcal{X})=
\begin{bmatrix}\delta\boldsymbol{\alpha}_{b_j}^{b_i}\\\delta\boldsymbol{\theta}_{b_j}^{b_i}\\\delta\boldsymbol{\beta}_{b_j}^{b_i}\\\delta\mathbf{b}_{a_{ij}}\\\delta\mathbf{b}_{g_{ij}}\end{bmatrix}=
\begin{bmatrix}
\mathbf{R}^{b_i}_w(\mathbf{p}^w_{b_j}-\mathbf{p}^w_{b_i}-\mathbf{v}_{b_i}^w\Delta t+\frac{1}{2}\mathbf{g}^w\Delta t^2)-\boldsymbol{\alpha}^{b_i}_{b_j}\\
2[{\boldsymbol\gamma^{b_i}_{b_j}}^{-1}\otimes({\mathbf{q}^{w}_{b_i}}^{-1}\otimes\mathbf{q}^w_{b_j})]_{xyz}\\
\mathbf{R}^{b_i}_w(\mathbf{v}_{b_j}^w-\mathbf{v}_{b_i}^w+\mathbf{g}^w\Delta t)-\boldsymbol{\beta}^{b_i}_{b_j}\\
\mathbf{b}_{a_j}-\mathbf{b}_{a_i}\\
\mathbf{b}_{g_j}-\mathbf{b}_{g_i}
\end{bmatrix}
$$
其中，$\delta\boldsymbol{\alpha}_{b_j}^{b_i}$表示第$i$帧与第$j$帧之间的位移与这两帧预积分得到的位移之间的偏差；$\delta\boldsymbol{\beta}_{b_j}^{b_i}$表示第$i$帧与第$j$帧之间的速度变化量与这两帧预积分得到的速度变化量之间的偏差；$\delta\boldsymbol{\theta}_{b_j}^{b_i}$表示第$i$帧与第$j$帧之间的旋转角度与这两帧预积分得到的旋转角度之间的偏差；$\delta\mathbf{b}_{a_{ij}}$和$\delta\mathbf{b}_{g_{ij}}$分别为两帧之间加速度计零偏和陀螺仪零偏的变化量。在计算$\delta\boldsymbol\theta^{b_i}_{b_j}$时，$[\cdot]_{xyz}$表示取四元数的虚部。因为考虑到两帧之间姿态变化比较小，在离散形式的预积分中，四元数的实部恒为1，所以只取了虚部。旋转这项前面的$2$也是因为四元数的虚部前面有个$\frac{1}{2}$，转换成实际的姿态角变化要乘$2$。关于零偏的残差项是基于“在两帧之间的短时间内陀螺仪和加速度计的零偏是几乎不变的”来构造的。接下来，让我们来计算求与IMU残差因子有关的雅可比和协方差矩阵。

## 协方差矩阵推导

我们知道，可以通过标定的方法确定IMU测量值的噪声方差。但是在目标函数中我们计算的是系统状态的残差（状态误差），要求的是**残差**的协方差矩阵。因此需要根据IMU的测量值的噪声方差推导出残差的噪声方差，这样才能构造出正确的目标函数。

已知一个多维随机变量$\boldsymbol y$满足$\boldsymbol y=\boldsymbol {Ax}$，并且$\boldsymbol x$服从均值为0，协方差为$\boldsymbol \Sigma_x$的高斯分布（可以把它理解为噪声）。根据协方差的定义有
$$
\begin{aligned}
\boldsymbol\Sigma_y&=E((\boldsymbol{Ax})(\boldsymbol{Ax})^\top)\\
&=E(\boldsymbol{Ax}\boldsymbol x^\top\boldsymbol A^\top)\\
&=\boldsymbol{A\Sigma_x A}^\top
\end{aligned}
$$
所以，要推导预积分量的协方差，我们需要知道IMU噪声和预积分量之间的线性递推关系。一般来说，对于一个离散的非线性系统可以表示为
$$
\boldsymbol x_k=f(\boldsymbol x_{k-1},\boldsymbol u_{k-1})
$$
其中，$\boldsymbol x$为系统状态，$\boldsymbol u$为系统输入，$k$是$i$、$j$两帧之间的离散时刻。令$\boldsymbol x=\hat{\boldsymbol x}+\delta\boldsymbol x$，真值为$\hat{\boldsymbol x}$，误差为$\delta\boldsymbol x$。将噪声$\boldsymbol n$视为系统输入的一部分，并对非线性系统的状态方程进行一阶泰勒展开并略去无穷小项得
$$
\begin{aligned}
\boldsymbol x_k&=f(\boldsymbol x_{k-1},\boldsymbol u_{k-1})\\
\hat{\boldsymbol x}_k+\delta\boldsymbol x_k&=f(\hat{\boldsymbol x}_{k-1}+\delta\boldsymbol x_{k-1}, \hat{\boldsymbol u}_{k-1}+\boldsymbol n_{k-1})\\
\hat{\boldsymbol x}_k+\delta\boldsymbol x_k&=f(\hat{\boldsymbol x}_{k-1},\hat{\boldsymbol u}_{k-1})+\boldsymbol F_{k-1}\delta\boldsymbol x_{k-1}+\boldsymbol G_{k-1}\boldsymbol n_{k-1}
\end{aligned}
$$
其中，$\boldsymbol F_{k-1}$是$\boldsymbol x_k$对$\boldsymbol x_{k-1}$的雅可比矩阵，$\boldsymbol G_{k-1}$是$\boldsymbol x_k$对$\boldsymbol u_{k-1}$的雅可比矩阵，也即
$$
\boldsymbol F_{k-1}=\frac{\partial\boldsymbol x_k}{\partial \boldsymbol x_{k-1}},\boldsymbol G_{k-1}=\frac{\partial\boldsymbol x_k}{\partial\boldsymbol u_{k-1}}
$$
根据上面的关系可以写出离散的系统状态量误差的递推公式
$$
\delta\boldsymbol x_k=\boldsymbol F_{k-1}\delta\boldsymbol x_{k-1}+\boldsymbol G_{k-1}\boldsymbol n_{k-1}
$$
这个式子可以这样理解：当前时刻的状态误差受到上一时刻的系统状态误差和噪声影响。根据协方差的定义，可以得到$i$、$j$两帧之间系统状态因IMU量测的噪声而产生误差的协方差矩阵的递推公式为
$$
\boldsymbol\Sigma_{\delta\boldsymbol x_k}=\boldsymbol F_{k-1}\boldsymbol\Sigma_{\delta\boldsymbol x_{k-1}}\boldsymbol F_{k-1}^\top+\boldsymbol G_{k-1}\boldsymbol\Sigma_{\boldsymbol n}\boldsymbol G_{k-1}^\top
$$
其中，$\boldsymbol\Sigma_{\boldsymbol n}$为IMU量测噪声的协方差矩阵，这个矩阵最开始由人为给定；$\boldsymbol\Sigma_{\delta\boldsymbol x_0}$在最开始时为零矩阵。那么，只要求出了$\boldsymbol F$和$\boldsymbol G$就可以完成对系统状态协方差矩阵的递推计算了。下面让我们先推导连续的系统状态量误差传递公式，再推导离散的系统状态量误差的递推公式。

### 连续的系统状态量误差传递公式

首先明确一下连续的系统状态误差传递公式的基本形式为
$$
\delta \dot{\mathbf z}=\boldsymbol A\delta{\mathbf z}+\boldsymbol B\mathbf n
$$
其中
$$
\delta{\mathbf z}=
\begin{bmatrix}
\delta\boldsymbol\alpha\\
\delta\boldsymbol\theta\\
\delta\boldsymbol\beta\\
\delta\mathbf b_{a}\\
\delta\mathbf b_{g}\\
\end{bmatrix},
\mathbf n=
\begin{bmatrix}
\mathbf n_a\\
\mathbf n_g\\
\mathbf n_{b_a}\\
\mathbf n_{b_g}
\end{bmatrix}
$$
式中$\mathbf n_{b_a}$和$\mathbf n_{b_g}$分别为加速度计和陀螺仪零偏的噪声，它们满足下面的关系（随机游走）
$$
\delta\dot{\mathbf b}_a=\mathbf n_{b_a}\\
\delta\dot{\mathbf b}_g=\mathbf n_{b_g}
$$
上面的这两个式子即为连续形式的加速度计和陀螺仪零偏变化量的传递公式，下面继续推导剩余三项的。

#### 姿态项

对姿态的状态误差$\delta\boldsymbol\theta$，它是由预积分量$\boldsymbol\gamma$中的IMU噪声带来的。前面已经推导出了$\boldsymbol\gamma$的计算公式，那么在不考虑误差的情况下，容易得到姿态四元数求导的微分方程。为了便于阅读和我打公式，下面的公式都略去了角标
$$
\dot{\mathbf q}=\mathbf q\otimes\begin{bmatrix}0\\\frac{1}{2}({\boldsymbol{\omega}}-\mathbf b_{g})\end{bmatrix}
$$
如果考虑了误差，这个姿态预积分项的误差只与陀螺仪的噪声和零偏有关。注意零偏是系统状态的一部分，因此要将其误差考虑进去，也即
$$
\hat{\dot{\mathbf q}}=\hat{\mathbf q}\otimes\begin{bmatrix}0\\\frac{1}{2}({\hat{\boldsymbol{\omega}}-\hat{\mathbf b}_{g}})\end{bmatrix}
$$
其中，带$\hat{\cdot}$符号的物理量都代表名义值（可以理解为测量值），不带这个符号的则为真实值。上面的式子中，角速度和加速度计的零偏还满足下面的关系
$$
\hat{\boldsymbol\omega}=\boldsymbol\omega+\mathbf n_g\\
\hat{\mathbf b}_g=\mathbf b_g+\delta\mathbf b_g
$$
注意这里没有显式写出陀螺仪零偏的噪声$\mathbf n_{b_g}$，这是因为这部分噪声已经包括在$\delta\mathbf b_g$中了。而我们知道，$\hat{\mathbf q}$还可以表示为真实值与偏差相乘的形式，也即
$$
\hat{\mathbf q}=\mathbf q\otimes\delta\mathbf q
$$
这个$\delta\mathbf q$可以使用偏差的角度$\delta\boldsymbol\theta$来表示，当$\delta\boldsymbol\theta\to0$时，有
$$
\delta\mathbf q\approx\begin{bmatrix}1\\\frac{\delta\boldsymbol\theta}{2}\end{bmatrix}
$$
将上面的式子代入之前的微分方程可得
$$
\begin{aligned}
\dot{(\mathbf q\otimes\delta\mathbf q)}&=\frac{1}{2}\mathbf q\otimes\delta\mathbf q\otimes\begin{bmatrix}0\\{\hat{\boldsymbol{\omega}}-\hat{\mathbf b}_{g}}\end{bmatrix}\\
\dot{\mathbf q}\otimes\delta\mathbf q+\mathbf q\otimes\delta\dot{\mathbf q}&=\frac{1}{2}\mathbf q\otimes\delta\mathbf q\otimes\begin{bmatrix}0\\\boldsymbol\omega+\mathbf n_g-\mathbf b_g-\delta\mathbf b_g\end{bmatrix}\\
\frac{1}{2}\mathbf q\otimes\begin{bmatrix}0\\\boldsymbol{\omega}-\mathbf b_g\end{bmatrix}\otimes\delta\mathbf q+\mathbf q\otimes\delta\dot{\mathbf q}&=\frac{1}{2}\mathbf q\otimes\delta\mathbf q\otimes\begin{bmatrix}0\\\boldsymbol\omega+\mathbf n_g-\mathbf b_g-\delta\mathbf b_g\end{bmatrix}
\end{aligned}
$$
在式子两边同时左乘${\mathbf q}^{-1}$，然后移项可得
$$
\delta\dot{\mathbf q}=\frac{1}{2}\delta\mathbf q\otimes\begin{bmatrix}0\\\boldsymbol\omega+\mathbf n_g-\mathbf b_g-\delta\mathbf b_g\end{bmatrix}-\frac{1}{2}\begin{bmatrix}0\\\boldsymbol{\omega}-\mathbf b_g\end{bmatrix}\otimes\delta\mathbf q
$$
这里插一句，先来介绍一下四元数乘法是如何用矩阵乘法表示的。设一个旋转四元数$\mathbf q=[s,\boldsymbol v]^\top$，那么定义它的左乘矩阵为
$$
\mathcal L[\mathbf q]=\begin{bmatrix}s&-\boldsymbol v^\top\\\boldsymbol v & s\boldsymbol I+[\boldsymbol v]_\times\end{bmatrix}
$$
它的右乘矩阵为
$$
\mathcal R[\mathbf q]=\begin{bmatrix}s&-\boldsymbol v^\top\\\boldsymbol v & s\boldsymbol I-[\boldsymbol v]_\times\end{bmatrix}
$$
那么
$$
\mathbf q_1\otimes\mathbf q_2=\mathcal L[\mathbf q_1]\mathbf q_2=\mathcal R[\mathbf q_2]\mathbf q_1
$$
右乘矩阵可以写为下面的形式
$$
\mathcal R[\mathbf q]=\begin{bmatrix}0 & -\boldsymbol v^\top\\\boldsymbol v&-[\boldsymbol v]_\times\end{bmatrix}+s\boldsymbol I_{4\times 4}
$$
将之前的微分方程写为矩阵乘法的形式
$$
\begin{aligned}
\delta\dot{\mathbf q}&=\frac{1}{2}\mathcal R\begin{bmatrix}0\\\boldsymbol\omega+\mathbf n_g-\mathbf b_g-\delta\mathbf b_g\end{bmatrix}\delta\mathbf q-\frac{1}{2}\mathcal L\begin{bmatrix}0\\\boldsymbol{\omega}-\mathbf b_g\end{bmatrix}\delta\mathbf q\\
&=\frac{1}{2}\mathcal R\begin{bmatrix}0\\\boldsymbol\omega_1\end{bmatrix}\delta\mathbf q-\frac{1}{2}\mathcal L\begin{bmatrix}0\\\boldsymbol{\omega}_2\end{bmatrix}\delta\mathbf q\\
&=\frac{1}{2}\begin{bmatrix}0 & -\boldsymbol\omega_1^\top\\\boldsymbol\omega_1 & -[\boldsymbol\omega_1]_\times\end{bmatrix}\delta\mathbf q-\frac{1}{2}\begin{bmatrix}0 & -\boldsymbol\omega_2^\top\\\boldsymbol\omega_2 & [\boldsymbol\omega_2]_\times\end{bmatrix}\delta\mathbf q\\
&=\frac{1}{2}\begin{bmatrix}0 & (\boldsymbol\omega_2-\boldsymbol\omega_1)^\top\\\boldsymbol\omega_1-\boldsymbol\omega_2 & -[\boldsymbol\omega_1+\boldsymbol\omega_2]_\times\end{bmatrix}\delta\mathbf q
\end{aligned}
$$
再利用之前推出来的$\delta\mathbf q$和$\delta\boldsymbol\theta$的关系，可以得到
$$
\begin{bmatrix}0\\\frac{\delta\dot{\boldsymbol\theta}}{2}\end{bmatrix}=\frac{1}{2}\begin{bmatrix}0 & (\boldsymbol\omega_2-\boldsymbol\omega_1)^\top\\\boldsymbol\omega_1-\boldsymbol\omega_2 & -[\boldsymbol\omega_1+\boldsymbol\omega_2]_\times\end{bmatrix}\begin{bmatrix}1\\
\frac{\delta\boldsymbol\theta}{2}\end{bmatrix}
$$
注意因为$\delta\boldsymbol\theta\to 0$，因此上面式子的第一行是成立的。我们主要需要第二行的关系，可以得到
$$
\begin{aligned}
\delta\dot{\boldsymbol\theta}&=-(\boldsymbol\omega_1+\boldsymbol\omega_2)\times\frac{\delta\boldsymbol\theta}{2}+\boldsymbol\omega_1-\boldsymbol\omega_2\\
&=-(2\boldsymbol\omega+\mathbf n_g-2\mathbf b_g-\delta\mathbf b_g)\times\frac{\delta\boldsymbol\theta}{2}+\mathbf n_g-\delta\mathbf b_g
\end{aligned}
$$
在上式中的括号里，$\mathbf n_g$和$\delta\mathbf b_g$都是小量，在跟括号外面的$\delta\boldsymbol\theta$相乘时是二阶小量，可以忽略。最后可以得到
$$
\delta\dot{\boldsymbol\theta}=-[\boldsymbol\omega-\mathbf b_g]_\times\delta\boldsymbol\theta+\mathbf n_g-\delta\mathbf b_g
$$
完成了上面又臭又长的推导，还剩两个又臭又长的推导。

#### 速度项

与上面类似，对速度的状态误差$\delta\boldsymbol\beta$，它是由预积分量$\boldsymbol\beta$中的IMU噪声带来的。先写出不考虑误差的对速度求导的微分方程
$$
\dot{\boldsymbol\beta}=\mathbf R(\mathbf a-\mathbf b_a)
$$
与之前一样的，$\mathbf R$是从IMU坐标系到世界坐标系的姿态变换，$\mathbf a$是IMU坐标系下加速度的真值。再写出考虑误差的微分方程
$$
\hat{\dot{\boldsymbol\beta}}=\hat{\mathbf R}(\hat{\mathbf a}-\hat{\mathbf b}_a)
$$
真实值与名义值之间的关系为
$$
\hat{\boldsymbol\beta}=\boldsymbol\beta+\delta\boldsymbol\beta\\
\hat{\mathbf a}=\mathbf a+\mathbf n_a\\
\hat{\mathbf b}_a=\mathbf b_a+\delta\mathbf b_a\\
\hat{\mathbf R}=\mathbf R\exp([\delta\boldsymbol\theta]_\times)=\mathbf R(\boldsymbol I+[\delta\boldsymbol\theta]_\times)
$$
根据上一节介绍过的知识，姿态的名义值可以表示真值乘上一个小角度偏差$\delta\boldsymbol\theta$的扰动。除了这点，其他的关系应该都很好理解。然后将这些关系代回微分方程
$$
\begin{aligned}
\dot{\boldsymbol\beta}+\delta\dot{\boldsymbol\beta}&=\mathbf R(\boldsymbol I+[\delta\boldsymbol\theta]_\times)(\mathbf a+\mathbf n_a-\mathbf b_a-\delta\mathbf b_a)\\
\mathbf R(\mathbf a-\mathbf b_a)+\delta\dot{\boldsymbol\beta}&=\mathbf R(\boldsymbol I+[\delta\boldsymbol\theta]_\times)(\mathbf a+\mathbf n_a-\mathbf b_a-\delta\mathbf b_a)\\
\end{aligned}
$$
将上面的式子展开，并忽略二阶小量可得
$$
\begin{aligned}
\delta\dot{\boldsymbol\beta}&=\mathbf R(\mathbf a+\mathbf n_a-\mathbf b_a-\delta\mathbf b_a)+\mathbf R[\delta\boldsymbol\theta]_\times(\mathbf a-\delta\mathbf b_a)-\mathbf R(\mathbf a-\mathbf b_a)\\
&=\mathbf R(\mathbf n_a-\delta\mathbf b_a)-\mathbf R[\mathbf a-\mathbf b_a]_\times\delta\boldsymbol\theta
\end{aligned}
$$
现在还剩最后一个又臭又长的推导。

#### 位置项

对位置的状态误差$\delta\boldsymbol\alpha$，它是由预积分量$\boldsymbol\alpha$中的IMU噪声带来的。不考虑误差的对位置求导的微分方程为
$$
\dot{\boldsymbol\alpha}=\boldsymbol\beta
$$
考虑误差的微分方程为
$$
\hat{\dot{\boldsymbol\alpha}}=\hat{\boldsymbol\beta}
$$
真实值与名义值之间的关系为
$$
\hat{\boldsymbol\alpha}=\boldsymbol\alpha+\delta\boldsymbol\alpha\\
\hat{\boldsymbol\beta}=\boldsymbol\beta+\delta\boldsymbol\beta
$$
将上面的关系代回微分方程
$$
\begin{aligned}
\dot{\boldsymbol\alpha}+\delta\dot{\boldsymbol\alpha}&=\boldsymbol\beta+\delta\boldsymbol\beta\\
\boldsymbol\beta+\delta\dot{\boldsymbol\alpha}&=\boldsymbol\beta+\delta\boldsymbol\beta\\
\delta\dot{\boldsymbol\alpha}&=\delta\boldsymbol{\beta}
\end{aligned}
$$

### 离散的系统状态量误差传递公式

下面将连续的系统状态量误差传递公式转换为离散的，这样计算机才能够进行计算。这里依旧按照上面的顺序进行讲解。我们最终希望得到下面的误差递推公式
$$
\delta{\mathbf z_{k+1}}=\boldsymbol F_k\delta{\mathbf z_k}+\boldsymbol G_k\mathbf n_k
$$
其中
$$
\delta{\mathbf z}_{k}=
\begin{bmatrix}
\delta\boldsymbol\alpha_{k}\\
\delta\boldsymbol\theta_{k}\\
\delta\boldsymbol\beta_{k}\\
\delta\mathbf b_{a_{k}}\\
\delta\mathbf b_{g_{k}}\\
\end{bmatrix},
\mathbf n_k=
\begin{bmatrix}
\mathbf n_{a_k}\\
\mathbf n_{g_k}\\
\mathbf n_{a_{k+1}}\\
\mathbf n_{g_{k+1}}\\
\mathbf n_{b_{a}}\\
\mathbf n_{b_{g}}
\end{bmatrix}
$$
注意到这里的噪声项有了一些变化。陀螺仪和加速度计的噪声分成了$k$时刻和$k+1$时刻的两项，而$\mathbf n_{b_a}$和$\mathbf n_{b_g}$没有分成两项。这是因为IMU的噪声是变化的，而IMU的零偏的漂移速率是恒定的，这也与我们的感性认识相符。

#### 零偏项

以$\delta\mathbf b_a$为例，其对时间的导数可以写为
$$
\delta\dot{\mathbf b}_a=\frac{\delta\mathbf b_{a_{k+1}}-\delta\mathbf b_{a_k}}{\delta t}=\mathbf n_{b_a}
$$
易得
$$
\delta\mathbf b_{a_{k+1}}=\delta\mathbf b_{a_k}+\mathbf n_{b_a}\delta t
$$
同理可得
$$
\delta\mathbf b_{g_{k+1}}=\delta\mathbf b_{g_k}+\mathbf n_{b_g}\delta t
$$

#### 姿态项

因为
$$
\delta\boldsymbol\theta_{k+1}=\delta\boldsymbol\theta_k+\delta\dot{\boldsymbol\theta}\delta t
$$
并且有
$$
\delta\dot{\boldsymbol\theta}=-[\boldsymbol\omega-\mathbf b_g]_\times\delta\boldsymbol\theta+\mathbf n_g-\delta\mathbf b_g
$$
由于在VINS中使用了中值法进行积分，因此这里也同样使用中值法进行离散化。使用中值法算这个导数，可以得到
$$
\delta\dot{\boldsymbol\theta}_k=-[\frac{1}{2}(\boldsymbol\omega_{k+1}+\boldsymbol\omega_k)-\mathbf b_{g_k}]_\times\delta\boldsymbol\theta_k+\frac{1}{2}(\mathbf n_{g_k}+\mathbf n_{g_{k+1}})-\delta\mathbf b_{g_k}
$$
这里简单说说中值法转换的原则。在连续形式的求导公式中，对带$\delta$前缀的且在这个式子中被求了时间的导数的状态量均认为是$k$时刻的，而且因为它们本身就被求导了，所以不需要展开成两时刻的平均值。例如，现在求的是$\delta\boldsymbol\theta_k$的导数，那么等号右边的$\delta\boldsymbol\theta_k$就不用展开。对$\mathbf n_{b_a}$和$\mathbf n_{b_g}$，它们是不变的，所以不用展开。需要展开的状态量是跟之前预积分量的中值积分有关的状态量，其中对真值$\boldsymbol\omega$和$\mathbf a$，他们都是量测的一部分，就按之前中值积分的方法将它们组合起来的量测展开即可。由于还引入了噪声$\mathbf n_g$和$\mathbf n_a$，他们也是量测的一部分，所以也需要将其展开。此外，从$\delta\boldsymbol\theta$到$\delta\boldsymbol\beta$到$\delta\boldsymbol\alpha$，他们都是使用中值积分的方法进行计算的，因此在他们积分传播的路径上都需要对前一个被积分的状态量进行展开。至于零偏，我们认为它们在短时间是不变的，因此之前在推导预积分的中值积分公式的时候也没有对它们进行展开。所以对$\mathbf b_a$、$\mathbf b_g$、$\delta\mathbf b_a$、$\delta\mathbf b_g$，在这里也不对它们展开。

最后有
$$
\begin{aligned}
\delta\boldsymbol\theta_{k+1}&=\delta\boldsymbol\theta_k+\{-[\frac{1}{2}(\boldsymbol\omega_{k+1}+\boldsymbol\omega_k)-\mathbf b_{g_k}]_\times\delta\boldsymbol\theta+\frac{1}{2}(\mathbf n_{g_k}+\mathbf n_{g_{k+1}})-\delta\mathbf b_{g_k}\}\delta t\\
&=(\boldsymbol I-[\frac{1}{2}(\boldsymbol\omega_{k+1}+\boldsymbol\omega_k)-\mathbf b_{g_k}]_\times\delta t)\delta\boldsymbol\theta_k+\frac{1}{2}(\mathbf n_{g_k}+\mathbf n_{g_{k+1}})\delta t-\delta\mathbf b_{g_k}\delta t\\
&=(\boldsymbol I-[\bar{\boldsymbol\omega}]_\times\delta t)\delta\boldsymbol\theta_k+\frac{1}{2}\mathbf n_{g_k}\delta t+\frac{1}{2}\mathbf n_{g_{k+1}}\delta t-\delta\mathbf b_{g_k}\delta t
\end{aligned}
$$
其中$\bar{\boldsymbol\omega}=\frac{1}{2}(\boldsymbol\omega_{k+1}+\boldsymbol\omega_k)-\mathbf b_{g_k}$。

#### 速度项

这又是一个又臭又长的推导。

因为
$$
\delta\boldsymbol\beta_{k+1}=\delta\boldsymbol\beta_k+\delta\dot{\boldsymbol\beta}\delta t
$$
已知
$$
\delta\dot{\boldsymbol\beta}=\mathbf R(\mathbf n_a-\delta\mathbf b_a)-\mathbf R[(\mathbf a-\mathbf b_a)\times]\delta\boldsymbol\theta
$$
使用中值法计算这个导数有
$$
\begin{aligned}
\delta\dot{\boldsymbol\beta}_k=&\frac{1}{2}(\mathbf R_k\mathbf n_{a_{k}}+\mathbf R_{k+1}\mathbf n_{a_{k+1}})-\frac{1}{2}(\mathbf R_k+\mathbf R_{k+1})\delta\mathbf b_{a_k}\\
&-\frac{1}{2}\mathbf R_k[\mathbf a_k-\mathbf b_{a_k}]_\times\delta\boldsymbol\theta_k-\frac{1}{2}\mathbf R_{k+1}[\mathbf a_{k+1}-\mathbf b_{a_k}]_\times\delta\boldsymbol\theta_{k+1}
\end{aligned}
$$
再将上面得到的$\delta\boldsymbol\theta_{k+1}$的表达式代入，可以得到
$$
\begin{aligned}
\delta\dot{\boldsymbol\beta}_k=&\frac{1}{2}(\mathbf R_k\mathbf n_{a_{k}}+\mathbf R_{k+1}\mathbf n_{a_{k+1}})-\frac{1}{2}(\mathbf R_k+\mathbf R_{k+1})\delta\mathbf b_{a_k}-\frac{1}{2}\mathbf R_k[(\mathbf a_k-\mathbf b_{a_k})\times]\delta\boldsymbol\theta_k\\&-\frac{1}{2}\mathbf R_{k+1}[\mathbf a_{k+1}-\mathbf b_{a_k}]_\times\{(\boldsymbol I-[\bar{\boldsymbol\omega}]_\times\delta t)\delta\boldsymbol\theta_k+\frac{1}{2}\mathbf n_{g_k}\delta t+\frac{1}{2}\mathbf n_{g_{k+1}}\delta t-\delta\mathbf b_{g_k}\delta t\}
\end{aligned}
$$
化简并合并同类项可得
$$
\begin{aligned}
\delta\dot{\boldsymbol \beta}_k=&-\frac{1}{2}\{\mathbf R_k[\mathbf a_k-\mathbf b_{a_k}]_\times+\mathbf R_{k+1}[\mathbf a_{k+1}-\mathbf b_{a_k}]_\times(\boldsymbol I-[\bar{\boldsymbol\omega}]_\times\delta t)\}\delta\boldsymbol\theta_k\\
&-\frac{1}{4}\mathbf R_{k+1}[\mathbf a_{k+1}-\mathbf b_{a_k}]_\times\mathbf n_{g_k}\delta t-\frac{1}{4}\mathbf R_{k+1}[\mathbf a_{k+1}-\mathbf b_{a_k}]_\times\mathbf n_{g_{k+1}}\delta t\\
&+\frac{1}{2}\mathbf R_{k+1}[\mathbf a_{k+1}-\mathbf b_{a_k}]_\times\delta\mathbf b_{g_k}\delta t-\frac{1}{2}(\mathbf R_k+\mathbf R_{k+1})\delta\mathbf b_{a_k} + \frac{1}{2}(\mathbf R_k\mathbf n_{a_{k}}+\mathbf R_{k+1}\mathbf n_{a_{k+1}})
\end{aligned}
$$

最后代入离散的微分公式中得
$$
\begin{aligned}
\delta\boldsymbol\beta_{k+1}=&\delta\boldsymbol\beta_k-\frac{1}{2}\{\mathbf R_k[\mathbf a_k-\mathbf b_{a_k}]_\times+\mathbf R_{k+1}[\mathbf a_{k+1}-\mathbf b_{a_k}]_\times(\boldsymbol I-[\bar{\boldsymbol\omega}]_\times\delta t)\}\delta\boldsymbol\theta_k\delta t\\
&-\frac{1}{4}\mathbf R_{k+1}[\mathbf a_{k+1}-\mathbf b_{a_k}]_\times\mathbf n_{g_k}\delta t^2-\frac{1}{4}\mathbf R_{k+1}[\mathbf a_{k+1}-\mathbf b_{a_k}]_\times\mathbf n_{g_{k+1}}\delta t^2\\
&+\frac{1}{2}\mathbf R_{k+1}[\mathbf a_{k+1}-\mathbf b_{a_k}]_\times\delta\mathbf b_{g_k}\delta t^2-\frac{1}{2}(\mathbf R_k+\mathbf R_{k+1})\delta\mathbf b_{a_k}\delta t + \frac{1}{2}(\mathbf R_k\mathbf n_{a_{k}}+\mathbf R_{k+1}\mathbf n_{a_{k+1}})\delta t
\end{aligned}
$$

#### 位置项

因为
$$
\delta\boldsymbol\alpha_{k+1}=\delta\boldsymbol\alpha_k+\delta\dot{\boldsymbol\alpha}\delta t
$$
且有
$$
\delta\dot{\boldsymbol\alpha}=\delta\boldsymbol\beta
$$
使用中值积分法计算有
$$
\begin{aligned}
\delta\dot{\boldsymbol{\alpha}}_k=&\frac{1}{2}\delta\boldsymbol{\beta}_{k+1}+\frac{1}{2}\delta\boldsymbol\beta_k\\
=&\delta\boldsymbol\beta_k-\frac{1}{4}\{\mathbf R_k[\mathbf a_k-\mathbf b_{a_k}]_\times+\mathbf R_{k+1}[\mathbf a_{k+1}-\mathbf b_{a_k}]_\times(\boldsymbol I-[\bar{\boldsymbol\omega}]_\times\delta t)\}\delta\boldsymbol\theta_k\delta t\\
&-\frac{1}{8}\mathbf R_{k+1}[\mathbf a_{k+1}-\mathbf b_{a_k}]_\times\mathbf n_{g_k}\delta t^2-\frac{1}{8}\mathbf R_{k+1}[\mathbf a_{k+1}-\mathbf b_{a_k}]_\times\mathbf n_{g_{k+1}}\delta t^2\\
&+\frac{1}{4}\mathbf R_{k+1}[\mathbf a_{k+1}-\mathbf b_{a_k}]_\times\delta\mathbf b_{g_k}\delta t^2-\frac{1}{4}(\mathbf R_k+\mathbf R_{k+1})\delta\mathbf b_{a_k}\delta t + \frac{1}{4}(\mathbf R_k\mathbf n_{a_{k}}+\mathbf R_{k+1}\mathbf n_{a_{k+1}})\delta t
\end{aligned}
$$
最后代入离散的微分公式中得
$$
\begin{aligned}
\delta\boldsymbol\alpha_{k+1}=&\delta\boldsymbol\alpha_k+\delta\boldsymbol\beta_k\delta t-\frac{1}{4}\{\mathbf R_k[\mathbf a_k-\mathbf b_{a_k}]_\times+\mathbf R_{k+1}[\mathbf a_{k+1}-\mathbf b_{a_k}]_\times(\boldsymbol I-[\bar{\boldsymbol\omega}]_\times\delta t)\}\delta\boldsymbol\theta_k\delta t^2\\
&-\frac{1}{8}\mathbf R_{k+1}[\mathbf a_{k+1}-\mathbf b_{a_k}]_\times\mathbf n_{g_k}\delta t^3-\frac{1}{8}\mathbf R_{k+1}[\mathbf a_{k+1}-\mathbf b_{a_k}]_\times\mathbf n_{g_{k+1}}\delta t^3\\
&+\frac{1}{4}\mathbf R_{k+1}[\mathbf a_{k+1}-\mathbf b_{a_k}]_\times\delta\mathbf b_{g_k}\delta t^3-\frac{1}{4}(\mathbf R_k+\mathbf R_{k+1})\delta\mathbf b_{a_k}\delta t^2 + \frac{1}{4}(\mathbf R_k\mathbf n_{a_{k}}+\mathbf R_{k+1}\mathbf n_{a_{k+1}})\delta t^2
\end{aligned}
$$
到这里，离散的系统状态量误差传递公式总算是推导完了。于是可以写出$\boldsymbol F$矩阵和$\boldsymbol G$矩阵
$$
\boldsymbol F_k=
\begin{bmatrix}\boldsymbol{I}&\mathbf{f}_{12}&\boldsymbol{I}\delta t&-\frac{1}{4}(\mathbf{R}_{k}+\mathbf{R}_{{k+1}})\delta t^2&\mathbf{f}_{15}\\\mathbf{0}&\boldsymbol{I}-[\bar{\boldsymbol{\omega}}]_\times&\mathbf{0}&\mathbf{0}&-\boldsymbol{I}\delta t\\\mathbf{0}&\mathbf{f}_{32}&\boldsymbol{I}&-\frac{1}{2}(\mathbf{R}_{k}+\mathbf{R}_{{k+1}})\delta t&\mathbf{f}_{35}\\\mathbf{0}&\mathbf{0}&\mathbf{0}&\boldsymbol{I}&\mathbf{0}\\\mathbf{0}&\mathbf{0}&\mathbf{0}&\mathbf{0}&\boldsymbol{I}\end{bmatrix}
$$

$$
\boldsymbol G_k=
\begin{bmatrix}\frac{1}{4}\mathbf{R}_{k}\delta t^2&\mathbf{g}_{12}&\frac{1}{4}\mathbf{R}_{{k+1}}\delta t^2&\mathbf{g}_{14}&\mathbf{0}&\mathbf{0}\\\mathbf{0}&\frac{1}{2}\boldsymbol{I}\delta t&\mathbf{0}&\frac{1}{2}\boldsymbol{I}\delta t&\mathbf{0}&\mathbf{0}\\\frac{1}{2}\mathbf{R}_{k}\delta t&\mathbf{g}_{32}&\frac{1}{2}\mathbf{R}_{{k+1}}\delta t&\mathbf{g}_{34}&\mathbf{0}&\mathbf{0}\\\mathbf{0}&\mathbf{0}&\mathbf{0}&\mathbf{0}&\boldsymbol{I}\delta t&\mathbf{0}\\\mathbf{0}&\mathbf{0}&\mathbf{0}&\mathbf{0}&\mathbf{0}&\boldsymbol{I}\delta t\end{bmatrix}
$$

其中
$$
\begin{aligned}
&\mathbf f_{12}=-\frac{\delta t^2}{4}(\mathbf{R}_k[\mathbf{a}_k-\mathbf{b}_{a_k}]_\times+\mathbf{R}_{k+1}[\mathbf{a}_{k+1}-\mathbf{b}_{a_k}]_\times(\boldsymbol{I}-[\bar{\boldsymbol{\omega}}\times]\delta t))\\
&\mathbf f_{15}=\frac{\delta t^3}{4}\mathbf{R}_{k+1}\left[\mathbf{a}_{k+1}-\mathbf{b}_{a_k}\right]_\times\delta\mathbf{b}_{\omega_k}\\
&\mathbf f_{32}=-\frac{\delta t}{2}(\mathbf R_k[\mathbf{a}_k-\mathbf{b}_{a_k}]_\times+\mathbf R_{k+1}[\mathbf{a}_{k+1}-\mathbf{b}_{a_k}]_\times(\boldsymbol{I}-[\bar{\boldsymbol{\omega}}]_\times\delta t))\\
&\mathbf f_{35}=\frac{\delta t^2}{2}\mathbf{R}_{k+1}[\mathbf{a}_{k+1}-\mathbf{b}_{a_k}]_\times\\
&\mathbf g_{12}=-\frac{\delta t^3}{8}\mathbf{R}_{k+1}[\mathbf{a}_{k+1}-\boldsymbol{b}_{a_k}]_\times\\
&\mathbf g_{14}=-\frac{\delta t^3}{8}\mathbf{R}_{k+1}[\mathbf{a}_{k+1}-\mathbf{b}_{a_k}]_\times\\
&\mathbf g_{32}=-\frac{\delta t^2}{4}\mathbf{R}_{k+1}[\mathbf{a}_{k+1}-\mathbf{b}_{a_k}]_\times\\
&\mathbf g_{34}=-\frac{\delta t^2}{4}\mathbf{R}_{k+1}[\mathbf{a}_{k+1}-\mathbf{b}_{a_k}]_\times
\end{aligned}
$$
知道了离散的系统状态量误差传递公式中的$\boldsymbol F$和$\boldsymbol G$，我们就可以完成对协方差矩阵的递推计算了。

## 雅可比矩阵推导

现在来进行雅可比矩阵的推导。之前已经说过，在IMU残差项中，涉及到的优化变量为第$i$、$j$帧图像拍摄时IMU的位置、速度、姿态、陀螺仪和加速度计的零偏。在求这部分的雅可比矩阵时，比较复杂的部分主要是求$\delta\boldsymbol\alpha_{b_j}^{b_i}$、$\delta\boldsymbol\theta_{b_j}^{b_i}$、$\delta\boldsymbol\beta_{b_j}^{b_i}$对状态量的雅可比，而求$\delta\mathbf b_a$和$\delta\mathbf b_g$对状态量的雅克比则十分简单。因此，这里将主要推导对前面三个残差求雅可比的过程。为了便于阅读，这里将残差的公式重新列出
$$
\mathbf{r}_b(\hat{\mathbf{z}}^{b_i}_{b_{j}},\mathcal{X})=
\begin{bmatrix}\delta\boldsymbol{\alpha}_{b_j}^{b_i}\\\delta\boldsymbol{\theta}_{b_j}^{b_i}\\\delta\boldsymbol{\beta}_{b_j}^{b_i}\\\delta\mathbf{b}_{a_{ij}}\\\delta\mathbf{b}_{g_{ij}}\end{bmatrix}=
\begin{bmatrix}
{\mathbf{R}^{w}_{b_i}}^\top(\mathbf{p}^w_{b_j}-\mathbf{p}^w_{b_i}-\mathbf{v}_{b_i}^w\Delta t+\frac{1}{2}\mathbf{g}^w\Delta t^2)-\boldsymbol{\alpha}^{b_i}_{b_j}\\
2[{\boldsymbol\gamma^{b_i}_{b_j}}^{-1}\otimes({\mathbf{q}^{w}_{b_i}}^{-1}\otimes\mathbf{q}^w_{b_j})]_{xyz}\\
{\mathbf{R}^{w}_{b_i}}^\top(\mathbf{v}_{b_j}^w-\mathbf{v}_{b_i}^w+\mathbf{g}^w\Delta t)-\boldsymbol{\beta}^{b_i}_{b_j}\\
\mathbf{b}_{a_j}-\mathbf{b}_{a_i}\\
\mathbf{b}_{g_j}-\mathbf{b}_{g_i}
\end{bmatrix}
$$
然后我们需要对下面的变量求雅可比
$$
[\mathbf p^w_{b_i},\mathbf q^w_{b_i},\mathbf v^w_{b_i},\mathbf b_{a_i},\mathbf b_{g_i},\mathbf p^w_{b_j},\mathbf q^w_{b_j},\mathbf v^w_{b_j},\mathbf b_{a_j},\mathbf b_{g_j}]^\top
$$
需要注意的是姿态在此处的表示，除了在计算姿态预积分量的残差时使用的是四元数（的虚部），在其他地方都使用旋转矩阵表示旋转。另外，$\mathbf b_{a_i}$、$\mathbf b_{g_i}$、$\mathbf b_{a_j}$、$\mathbf b_{g_j}$隐式地包含在$\boldsymbol\alpha^{b_i}_{b_j}$、$\boldsymbol\gamma_{b_j}^{b_i}$、$\boldsymbol\beta^{b_i}_{b_j}$中，对这部分雅可比矩阵的计算方法不同于常规，后面会进行介绍。

### 位置项

观察$\delta\boldsymbol\alpha_{b_j}^{b_i}$可知，与其相关的不包含零偏的优化变量包括$\mathbf R^{w}_{b_i}$、$\mathbf p^w_{b_j}$、$\mathbf p^w_{b_i}$、$\mathbf v^w_{b_i}$。

首先求$\frac{\partial\delta\boldsymbol\alpha^{b_i}_{b_j}}{\partial\mathbf p^w_{b_i}}$，这项十分简单，可以直接写出结果
$$
\frac{\partial\delta\boldsymbol\alpha^{b_i}_{b_j}}{\partial\mathbf p_{b_i}^w}=-{\mathbf R^{w}_{b_i}}^\top
$$
同理可以求出
$$
\frac{\partial\delta\boldsymbol\alpha^{b_i}_{b_j}}{\partial\mathbf p_{b_j}^w}={\mathbf R^{w}_{b_i}}^\top
$$
再来求$\frac{\partial\delta\boldsymbol\alpha^{b_i}_{b_j}}{\partial\mathbf v^w_{b_i}}$，这部分也十分简单
$$
\frac{\partial\delta\boldsymbol\alpha^{b_i}_{b_j}}{\partial\mathbf v^w_{b_i}}=-{\mathbf R^w_{b_i}}^\top\Delta t
$$
下面求$\frac{\partial\delta\boldsymbol\alpha^{b_i}_{b_j}}{\partial\mathbf R^w_{b_i}}$，这里还是跟之前求视觉残差的雅可比一样使用扰动法求导
$$
\begin{aligned}
\frac{\partial\delta\boldsymbol\alpha^{b_i}_{b_j}}{\partial\mathbf R^w_{b_i}}&=\lim_{\delta\boldsymbol\phi\to 0}\frac{(\mathbf{R}^{w}_{b_i}\exp([\delta\boldsymbol\phi]_\times))^\top(\mathbf{p}^w_{b_j}-\mathbf{p}^w_{b_i}-\mathbf{v}_{b_i}^w\Delta t+\frac{1}{2}\mathbf{g}^w\Delta t^2)-\mathbf{R}^{b_i}_w(\mathbf{p}^w_{b_j}-\mathbf{p}^w_{b_i}-\mathbf{v}_{b_i}^w\Delta t+\frac{1}{2}\mathbf{g}^w\Delta t^2)}{\delta\boldsymbol\phi}\\
&=\lim_{\delta\boldsymbol\phi\to 0}\frac{\exp([-\delta\boldsymbol\phi]_\times){\mathbf{R}^{w}_{b_i}}^\top(\mathbf{p}^w_{b_j}-\mathbf{p}^w_{b_i}-\mathbf{v}_{b_i}^w\Delta t+\frac{1}{2}\mathbf{g}^w\Delta t^2)-\mathbf{R}^{b_i}_w(\mathbf{p}^w_{b_j}-\mathbf{p}^w_{b_i}-\mathbf{v}_{b_i}^w\Delta t+\frac{1}{2}\mathbf{g}^w\Delta t^2)}{\delta\boldsymbol\phi}\\
&=\lim_{\delta\boldsymbol\phi\to 0}\frac{(\boldsymbol I-[\delta\boldsymbol\phi]_\times){\mathbf{R}^{w}_{b_i}}^\top(\mathbf{p}^w_{b_j}-\mathbf{p}^w_{b_i}-\mathbf{v}_{b_i}^w\Delta t+\frac{1}{2}\mathbf{g}^w\Delta t^2)-\mathbf{R}^{b_i}_w(\mathbf{p}^w_{b_j}-\mathbf{p}^w_{b_i}-\mathbf{v}_{b_i}^w\Delta t+\frac{1}{2}\mathbf{g}^w\Delta t^2)}{\delta\boldsymbol\phi}\\
&=\lim_{\delta\boldsymbol\phi\to 0}\frac{-[\delta\boldsymbol\phi]_\times{\mathbf{R}^{w}_{b_i}}^\top(\mathbf{p}^w_{b_j}-\mathbf{p}^w_{b_i}-\mathbf{v}_{b_i}^w\Delta t+\frac{1}{2}\mathbf{g}^w\Delta t^2)}{\delta\boldsymbol\phi}\\
&=\lim_{\delta\boldsymbol\phi\to 0}\frac{[{\mathbf{R}^{w}_{b_i}}^\top(\mathbf{p}^w_{b_j}-\mathbf{p}^w_{b_i}-\mathbf{v}_{b_i}^w\Delta t+\frac{1}{2}\mathbf{g}^w\Delta t^2)]_\times\delta\boldsymbol\phi}{\delta\boldsymbol\phi}\\
&={[\mathbf{R}^{w}_{b_i}}^\top(\mathbf{p}^w_{b_j}-\mathbf{p}^w_{b_i}-\mathbf{v}_{b_i}^w\Delta t+\frac{1}{2}\mathbf{g}^w\Delta t^2)]_\times
\end{aligned}
$$

### 速度项

相关的不包含零偏的优化变量为$\mathbf R^w_{b_i}$、$\mathbf v^w_{b_j}$、$\mathbf v^w_{b_i}$。

易得
$$
\frac{\partial\delta\boldsymbol\beta^{b_i}_{b_j}}{\partial\mathbf v^w_{b_i}}=-{\mathbf R^w_{b_i}}^\top\\
\frac{\partial\delta\boldsymbol\beta^{b_i}_{b_j}}{\partial\mathbf v^w_{b_j}}={\mathbf R^w_{b_i}}^\top\\
$$
对$\frac{\partial\delta\boldsymbol\beta^{b_i}_{b_j}}{\partial\mathbf R^w_{b_i}}$也是用扰动法求导，现在应该对这种方法非常熟练了
$$
\begin{aligned}
\frac{\partial\delta\boldsymbol\beta^{b_i}_{b_j}}{\partial\mathbf R^w_{b_i}}&=\lim_{\delta\boldsymbol\phi\to 0}\frac{(\mathbf{R}^{w}_{b_i}\exp([\delta\boldsymbol\phi]_\times))^\top(\mathbf{v}_{b_j}^w-\mathbf{v}_{b_i}^w+\mathbf{g}^w\Delta t)-\mathbf{R}^{b_i}_w(\mathbf{v}_{b_j}^w-\mathbf{v}_{b_i}^w+\mathbf{g}^w\Delta t)}{\delta\boldsymbol\phi}\\
&=\lim_{\delta\boldsymbol\phi\to 0}\frac{\exp([-\delta\boldsymbol\phi]_\times){\mathbf{R}^{w}_{b_i}}^\top(\mathbf{v}_{b_j}^w-\mathbf{v}_{b_i}^w+\mathbf{g}^w\Delta t)-\mathbf{R}^{b_i}_w(\mathbf{v}_{b_j}^w-\mathbf{v}_{b_i}^w+\mathbf{g}^w\Delta t)}{\delta\boldsymbol\phi}\\
&=\lim_{\delta\boldsymbol\phi\to 0}\frac{-[\delta\boldsymbol\phi]_\times{\mathbf{R}^{w}_{b_i}}^\top(\mathbf{v}_{b_j}^w-\mathbf{v}_{b_i}^w+\mathbf{g}^w\Delta t)}{\delta\boldsymbol\phi}\\
&=[{\mathbf{R}^{w}_{b_i}}^\top(\mathbf{v}_{b_j}^w-\mathbf{v}_{b_i}^w+\mathbf{g}^w\Delta t)]_\times
\end{aligned}
$$

### 姿态项

相关的不包含零偏的优化变量为$\mathbf q^w_{b_i}$、$\mathbf q^w_{b_j}$。对单位四元数（旋转四元数都是单位四元数），它的逆为它的共轭四元数，也即有$\mathbf q^{-1}=[s,-\boldsymbol v]^\top$，那么可以写出$\mathbf q^{-1}$的右乘矩阵为
$$
\mathcal R[\mathbf q^{-1}]=\begin{bmatrix}0 & \boldsymbol v^\top\\-\boldsymbol v&[\boldsymbol v]_\times\end{bmatrix}+s\boldsymbol I_{4\times 4}
$$
如果我们只取考虑右下角$3\times 3$的虚部部分，则有
$$
\mathcal R[\mathbf q^{-1}]_{3\times3}=\mathcal L[\mathbf q]_{3\times3}
$$
类似的，对左乘矩阵一样有
$$
\mathcal L[\mathbf q^{-1}]_{3\times3}=\mathcal R[\mathbf q]_{3\times3}
$$
下面来求$\frac{\partial\delta\boldsymbol\theta_{b_j}^{b_i}}{\partial\mathbf q^w_{b_i}}$，这里一样是使用扰动法求导，注意这里略去了分子的$[\cdot]_{xyz}$
$$
\begin{aligned}
\frac{\partial\delta\boldsymbol\theta_{b_j}^{b_i}}{\partial\mathbf q^w_{b_i}}&=2\lim_{\delta\boldsymbol\phi\to 0}\frac{{\boldsymbol\gamma^{b_i}_{b_j}}^{-1}\otimes{\left(\mathbf{q}^{w}_{b_i}\otimes\begin{bmatrix}1\\\frac{\delta\boldsymbol\phi}{2}\end{bmatrix}\right)}^{-1}\otimes\mathbf{q}^w_{b_j}-{\boldsymbol\gamma^{b_i}_{b_j}}^{-1}\otimes{\left(\mathbf{q}^{w}_{b_i}\otimes\begin{bmatrix}1\\\boldsymbol 0\end{bmatrix}\right)}^{-1}\otimes\mathbf{q}^w_{b_j}}{\delta\boldsymbol\phi}\\
&=2\lim_{\delta\boldsymbol\phi\to 0}\frac{{\boldsymbol\gamma^{b_i}_{b_j}}^{-1}\otimes{\begin{bmatrix}1\\\frac{\delta\boldsymbol\phi}{2}\end{bmatrix}}^{-1}\otimes{\mathbf{q}^{w}_{b_i}}^{-1}\otimes\mathbf{q}^w_{b_j}-{\boldsymbol\gamma^{b_i}_{b_j}}^{-1}\otimes{\begin{bmatrix}1\\\boldsymbol0\end{bmatrix}}^{-1}\otimes{\mathbf{q}^{w}_{b_i}}^{-1}\otimes\mathbf{q}^w_{b_j}}{\delta\boldsymbol\phi}\\
&=2\lim_{\delta\boldsymbol\phi\to 0}\frac{{\boldsymbol\gamma^{b_i}_{b_j}}^{-1}\otimes{\begin{bmatrix}1\\-\frac{\delta\boldsymbol\phi}{2}\end{bmatrix}}\otimes{\mathbf{q}^{w}_{b_i}}^{-1}\otimes\mathbf{q}^w_{b_j}-{\boldsymbol\gamma^{b_i}_{b_j}}^{-1}\otimes{\begin{bmatrix}1\\\boldsymbol0\end{bmatrix}}\otimes{\mathbf{q}^{w}_{b_i}}^{-1}\otimes\mathbf{q}^w_{b_j}}{\delta\boldsymbol\phi}\\
&=2\lim_{\delta\boldsymbol\phi\to 0}\frac{\mathcal R[{\mathbf{q}^{w}_{b_i}}^{-1}\otimes\mathbf{q}^w_{b_j}]\ \mathcal L[{\boldsymbol\gamma^{b_i}_{b_j}}^{-1}]\left({\begin{bmatrix}1\\-\frac{\delta\boldsymbol\phi}{2}\end{bmatrix}}-{\begin{bmatrix}1\\\boldsymbol0\end{bmatrix}}\right)}{\delta\boldsymbol\phi}\\
&=2\lim_{\delta\boldsymbol\phi\to 0}\frac{\mathcal R[{\mathbf{q}^{w}_{b_i}}^{-1}\otimes\mathbf{q}^w_{b_j}]\ \mathcal L[{\boldsymbol\gamma^{b_i}_{b_j}}^{-1}]{\begin{bmatrix}0\\-\frac{\delta\boldsymbol\phi}{2}\end{bmatrix}}}{\delta\boldsymbol\phi}\\
&=-\lim_{\delta\boldsymbol\phi\to 0}\frac{\left\{{\mathcal L[{\mathbf{q}^{w}_{b_j}}^{-1}\otimes\mathbf{q}^w_{b_i}]\ \mathcal R[\boldsymbol\gamma^{b_i}_{b_j}]\begin{bmatrix}0\\{\delta\boldsymbol\phi}\end{bmatrix}}\right\}_{3\times3}}{\delta\boldsymbol\phi}\\
&=-\left\{\mathcal L[{\mathbf{q}^{w}_{b_j}}^{-1}\otimes\mathbf{q}^w_{b_i}]\ \mathcal R[\boldsymbol\gamma^{b_i}_{b_j}]\right\}_{3\times3}
\end{aligned}
$$
类似的，可以求出
$$
\begin{aligned}
\frac{\partial\delta\boldsymbol\theta_{b_j}^{b_i}}{\partial\mathbf q^w_{b_i}}&=2\lim_{\delta\boldsymbol\phi\to 0}\frac{{\boldsymbol\gamma^{b_i}_{b_j}}^{-1}\otimes{\mathbf{q}^{w}_{b_i}}^{-1}\otimes\mathbf{q}^w_{b_j}\otimes\begin{bmatrix}1\\\frac{\delta\boldsymbol\phi}{2}\end{bmatrix}-{\boldsymbol\gamma^{b_i}_{b_j}}^{-1}\otimes{\mathbf{q}^{w}_{b_i}}^{-1}\otimes\mathbf{q}^w_{b_j}\otimes\begin{bmatrix}1\\\boldsymbol 0\end{bmatrix}}{\delta\boldsymbol\phi}\\
&= 2\lim_{\delta\boldsymbol\phi\to 0}\frac{\mathcal L[{\boldsymbol\gamma^{b_i}_{b_j}}^{-1}\otimes{\mathbf{q}^{w}_{b_i}}^{-1}\otimes\mathbf{q}^w_{b_j}]\begin{bmatrix}0\\\frac{\delta\boldsymbol\phi}{2}\end{bmatrix}}{\delta\boldsymbol\phi}\\
&=\left\{\mathcal L[{\boldsymbol\gamma^{b_i}_{b_j}}^{-1}\otimes{\mathbf{q}^{w}_{b_i}}^{-1}\otimes\mathbf{q}^w_{b_j}]\right\}_{3\times3}\\

\end{aligned}
$$

### 零偏项

求残差对零偏的雅可比矩阵本质上是求预积分量$\boldsymbol\alpha^{b_i}_{b_j}$、$\boldsymbol\beta^{b_i}_{b_j}$、$\boldsymbol\gamma^{b_i}_{b_j}$对零偏的雅可比。在这里我们不着急先去求这些雅可比矩阵，而是注意到，预积分量与陀螺仪和加速度计的零偏有关，而零偏也是优化变量。这又会导致之前说过的问题：在优化中每迭代一次得到新的零偏，又要重新算一遍预积分量来更新残差，非常浪费时间。我们把之前推导得到的预积分量的公式重新写一遍
$$
\begin{aligned}
&\bar{\hat{\boldsymbol\omega}}^{b_k}=\frac{1}{2}((\hat{\boldsymbol{\omega}}^{b_k}-\mathbf{b}_{g_k})+(\hat{\boldsymbol{\omega}}^{b_{k+1}}-\mathbf{b}_{g_k}))\\
&\boldsymbol{\gamma}^{b_i}_{b_{k+1}}=\boldsymbol{\gamma}^{b_i}_{b_k}\otimes\begin{bmatrix}1\\\frac{1}{2}\bar{\hat{\boldsymbol{\omega}}}^{b_k}\Delta t\end{bmatrix}\\
&\bar{\hat{\mathbf{a}}}^{b_k}=\frac{1}{2}[\mathbf{R}^{b_i}_{b_k}(\hat{\mathbf{a}}^{b_k}-\mathbf{b}_{a_k})+\mathbf{R}^{b_i}_{b_{k+1}}(\hat{\mathbf{a}}^{b_{k+1}}-\mathbf{b}_{a_k}))\\
&\boldsymbol{\alpha}^{b_i}_{b_{k+1}}=\boldsymbol{\alpha}^{b_i}_{b_k}+\boldsymbol{\beta}^{b_i}_{b_k}\Delta t+\frac{1}{2}\bar{\hat{\mathbf{a}}}^{b_k}\Delta t^2\\
&\boldsymbol{\beta}^{b_i}_{b_{k+1}}=\boldsymbol\beta^{b_i}_{b_k}+\bar{\hat{\mathbf{a}}}^{b_k}\Delta t
\end{aligned}
$$
注意到这里零偏是用$\mathbf b_{a_k}$、$\mathbf b_{g_k}$表示的，下标$k$的意思是零偏在各帧IMU数据中都是不一样的。这样写一是为了在推导误差传递方程时便于理解，二是与实际情况相符。但是在VINS算法与实际计算预积分量的代码中采用了简化的方法，也即
$$
\begin{aligned}
&\bar{\hat{\boldsymbol\omega}}^{b_k}=\frac{1}{2}((\hat{\boldsymbol{\omega}}^{b_k}-\mathbf{b}_{g_i})+(\hat{\boldsymbol{\omega}}^{b_{k+1}}-\mathbf{b}_{g_i}))\\
&\boldsymbol{\gamma}^{b_i}_{b_{k+1}}=\boldsymbol{\gamma}^{b_i}_{b_k}\otimes\begin{bmatrix}1\\\frac{1}{2}\bar{\hat{\boldsymbol{\omega}}}^{b_k}\Delta t\end{bmatrix}\\
&\bar{\hat{\mathbf{a}}}^{b_k}=\frac{1}{2}[\mathbf{R}^{b_i}_{b_k}(\hat{\mathbf{a}}^{b_k}-\mathbf{b}_{a_i})+\mathbf{R}^{b_i}_{b_{k+1}}(\hat{\mathbf{a}}^{b_{k+1}}-\mathbf{b}_{a_i}))\\
&\boldsymbol{\alpha}^{b_i}_{b_{k+1}}=\boldsymbol{\alpha}^{b_i}_{b_k}+\boldsymbol{\beta}^{b_i}_{b_k}\Delta t+\frac{1}{2}\bar{\hat{\mathbf{a}}}^{b_k}\Delta t^2\\
&\boldsymbol{\beta}^{b_i}_{b_{k+1}}=\boldsymbol\beta^{b_i}_{b_k}+\bar{\hat{\mathbf{a}}}^{b_k}\Delta t
\end{aligned}
$$
这里零偏改为了用$\mathbf b_{a_i}$、$\mathbf b_{g_i}$表示，意思是在滑窗的两帧之间的所有IMU数据的零偏都是不变的，这样就与之前构造零偏的残差项$\delta\mathbf b_a$、$\delta\mathbf b_g$的原则一样了：认为零偏是几乎不变的。但即使是这样，还是得面临零偏迭代更新后重算预积分量的问题。这里VINS采用了一个取巧的方法：既然认为零偏是几乎不变的，零偏的变化量也是小量，那我们就可以认为预积分量的变化量与滑窗中第$i$帧的零偏$\mathbf b_{a_i}$与$\mathbf b_{g_i}$的变化量在零偏附近是线性关系，也即通过下面的式子补偿零偏变化对预积分量的影响
$$
\boldsymbol\alpha^{b_i}_{b_j}=\boldsymbol\alpha^{b_i}_{b_j}+\boldsymbol J^\boldsymbol\alpha_{\mathbf b_{a_i}}\delta\mathbf b_{a_i}+\boldsymbol J^\boldsymbol\alpha_{\mathbf b_{g_i}}\delta\mathbf b_{g_i} \\
\boldsymbol\beta^{b_i}_{b_j}=\boldsymbol\beta^{b_i}_{b_j}+\boldsymbol J^\boldsymbol\beta_{\mathbf b_{a_i}}\delta\mathbf b_{a_i}+\boldsymbol J^\boldsymbol\beta_{\mathbf b_{g_i}}\delta\mathbf b_{g_i}\\
\boldsymbol\gamma^{b_i}_{b_j}=\boldsymbol\gamma^{b_i}_{b_j}\otimes\begin{bmatrix}1\\\frac{1}{2}\boldsymbol J^{\boldsymbol\gamma}_{b_{g_i}}\delta\mathbf b_{g_i}\end{bmatrix}
$$

其中$\delta\mathbf b_{a_i}$与$\delta\mathbf b_{g_i}$为迭代前后第$i$帧的零偏的变化量（注意他们与残差$\mathbf b_{a_{ij}}$和$\mathbf b_{g_{ij}}$是不一样的），$\boldsymbol J^{[\cdot]}_{\mathbf b_{a_i}}$或者$\boldsymbol J^{[\cdot]}_{\mathbf b_{g_i}}$为相应的预积分量对第$i$帧的零偏的雅可比矩阵。之后在迭代中每更新一次$\mathbf b_{a_i}$或者$\mathbf b_{g_i}$，就算出$\delta\mathbf b_{a_i}$或者$\delta\mathbf b_{g_i}$利用上面的公式补偿进预积分量中。现在就让我们来求残差对零偏的雅可比。先看看$\delta\boldsymbol\alpha^{b_i}_{b_j}$对如何零偏求偏导数，其中与零偏有关的只有$\boldsymbol\alpha^{b_i}_{b_j}$这一项，并且它只和$\mathbf b_{a_i}$和$\mathbf b_{g_i}$有关。因此根据上面的内容，易得
$$
\frac{\partial\delta\boldsymbol\alpha^{b_i}_{b_j}}{\partial\mathbf b_{a_i}}=-\boldsymbol J^{\boldsymbol\alpha}_{\mathbf b_{a_i}}\\
\frac{\partial\delta\boldsymbol\alpha^{b_i}_{b_j}}{\partial\mathbf b_{g_i}}=-\boldsymbol J^{\boldsymbol\alpha}_{\mathbf b_{g_i}}
$$
类似的有
$$
\frac{\partial\delta\boldsymbol\beta^{b_i}_{b_j}}{\partial\mathbf b_{a_i}}=-\boldsymbol J^{\boldsymbol\beta}_{\mathbf b_{a_i}}\\
\frac{\partial\delta\boldsymbol\beta^{b_i}_{b_j}}{\partial\mathbf b_{g_i}}=-\boldsymbol J^{\boldsymbol\beta}_{\mathbf b_{g_i}}
$$
下面看看姿态项$\delta\boldsymbol\gamma^{b_i}_{b_j}$，它只与$\mathbf b_{g_i}$有关，注意到$\delta\mathbf b_{g_i}$已经是小量了，于是可以用扰动法求导
$$
\begin{aligned}
\frac{\partial\delta\boldsymbol\gamma^{b_i}_{b_j}}{\partial\mathbf b_{g_i}}&=2\lim_{\delta\mathbf b_{g_i}\to0}\frac{{\left(\boldsymbol\gamma^{b_i}_{b_j}\otimes\begin{bmatrix}1\\\frac{1}{2}\boldsymbol J^{\boldsymbol\gamma}_{\mathbf b_{g_i}}\delta\mathbf b_{g_i}\end{bmatrix}\right)}^{-1}\otimes{\mathbf{q}^{w}_{b_i}}^{-1}\otimes\mathbf{q}^w_{b_j}\otimes-{\left(\boldsymbol\gamma^{b_i}_{b_j}\otimes\begin{bmatrix}1\\\boldsymbol 0\end{bmatrix}\right)}^{-1}\otimes{\mathbf{q}^{w}_{b_i}}^{-1}\otimes\mathbf{q}^w_{b_j}}{\delta\mathbf b_{g_i}}\\
&=2\lim_{\delta\mathbf b_{g_i}\to0}\frac{{\begin{bmatrix}0\\-\frac{1}{2}\boldsymbol J^{\boldsymbol\gamma}_{\mathbf b_{g_i}}\delta\mathbf b_{g_i}\end{bmatrix}}\otimes{\boldsymbol\gamma^{b_i}_{b_j}}^{-1}\otimes{\mathbf{q}^{w}_{b_i}}^{-1}\otimes\mathbf{q}^w_{b_j}}{\delta\mathbf b_{g_i}}\\
&=-\mathcal R[{\boldsymbol\gamma^{b_i}_{b_j}}^{-1}\otimes{\mathbf{q}^{w}_{b_i}}^{-1}\otimes\mathbf{q}^w_{b_j}]{\begin{bmatrix}0\\\boldsymbol J^{\boldsymbol\gamma}_{\mathbf b_{g_i}}\end{bmatrix}}\\
&=\left\{-\mathcal L[{\mathbf{q}^w_{b_j}}^{-1}\otimes\mathbf{q}^{w}_{b_i}\otimes{\boldsymbol\gamma^{b_i}_{b_j}}]\right\}_{3\times3}\boldsymbol J^\boldsymbol\gamma_{\mathbf b_{g_i}}
\end{aligned}
$$
至于上面出现的这些雅可比矩阵$\boldsymbol J^{[\cdot]}_{\mathbf b_{a_i}}$和$\boldsymbol J^{[\cdot]}_{\mathbf b_{g_i}}$，我们知道他们实际上满足
$$
\boldsymbol J^{\boldsymbol\alpha}_{\mathbf b_{a_i}}=\frac{\partial\boldsymbol\alpha^{b_i}_{b_j}}{\partial\mathbf b_{a_i}},\boldsymbol J^{\boldsymbol\alpha}_{\mathbf b_{g_i}}=\frac{\partial\boldsymbol\alpha^{b_i}_{b_j}}{\partial\mathbf b_{g_i}}\\
\boldsymbol J^{\boldsymbol\beta}_{\mathbf b_{a_i}}=\frac{\partial\boldsymbol\beta^{b_i}_{b_j}}{\partial\mathbf b_{a_i}},\boldsymbol J^{\boldsymbol\beta}_{\mathbf b_{g_i}}=\frac{\partial\boldsymbol\beta^{b_i}_{b_j}}{\partial\mathbf b_{g_i}}\\
\boldsymbol J^{\boldsymbol\gamma}_{\mathbf b_{g_i}}=\frac{\partial\boldsymbol\gamma^{b_i}_{b_j}}{\partial\mathbf b_{g_i}}
$$
根据这些雅可比的形式我们可以发现，它们非常像之前我们推导的系统状态误差递推传递公式中的$\boldsymbol F$和$\boldsymbol G$
$$
\boldsymbol F_k=\frac{\partial\boldsymbol x_{k+1}}{\partial \boldsymbol x_{k}},\boldsymbol G_k=\frac{\partial\boldsymbol x_{k+1}}{\partial\boldsymbol u_{k}}
$$
实际上这些雅可比矩阵描述的是滑窗中$i$、$j$两帧之间系统状态量的关系，他们都可以写为
$$
\boldsymbol J^{\boldsymbol x_j}_{\boldsymbol x_i}=\frac{\partial\boldsymbol x_j}{\partial \boldsymbol x_i}
$$
而$i$、$j$两帧之间系统的状态都是由一帧一帧的IMU数据积分得到的，存在很多的中间变量$\boldsymbol x_k$。于是根据链式法则，我们可以写出
$$
\begin{aligned}
\boldsymbol J^{\boldsymbol x_j}_{\boldsymbol x_i}&=\frac{\partial\boldsymbol x_j}{\partial\boldsymbol x_{j-1}}\frac{\partial\boldsymbol x_{j-1}}{\partial\boldsymbol x_{j-2}}\cdots\frac{\partial\boldsymbol x_{k+1}}{\partial\boldsymbol x_{k}}\cdots\frac{\partial\boldsymbol x_{i+2}}{\partial\boldsymbol x_{i+1}}\frac{\partial\boldsymbol x_{i+1}}{\partial\boldsymbol x_{i}}\\
&=\boldsymbol F_{j-1}\boldsymbol F_{j-2}\cdots\boldsymbol F_k\cdots\boldsymbol F_{i+1}\boldsymbol F_i
\end{aligned}
$$
因此我们可以在求$\boldsymbol J^{x_j}_{x_i}$时使用递推的方式
$$
\boldsymbol J_{k+1}=\boldsymbol F_k\boldsymbol J_{k}
$$
其中$\boldsymbol J_i=\boldsymbol I$，这是因为在刚开始时系统的状态量只与自身有关，开始积分后不同的状态量之间才因为噪声的引入产生联系。

最后来看看$\delta\mathbf b_{a_{ij}}$和$\delta\mathbf b_{g_{ij}}$，这部分就非常简单了
$$
\frac{\partial\delta\mathbf b_{a_{ij}}}{\partial\mathbf b_{a_i}}=-\boldsymbol I,\frac{\partial\delta\mathbf b_{a_{ij}}}{\partial\mathbf b_{a_j}}=\boldsymbol I\\
\frac{\partial\delta\mathbf b_{g_{ij}}}{\partial\mathbf b_{g_i}}=-\boldsymbol I,\frac{\partial\delta\mathbf b_{g_{ij}}}{\partial\mathbf b_{g_j}}=\boldsymbol I
$$
现在我们终于完成了与IMU残差因子相关的各种公式的推导，我们推导了IMU残差的形式以及相应的协方差矩阵和雅可比矩阵，这都是为了我们的优化求解做准备。这部分内容比较多，符号也很复杂。个人的体会是在学习时一定要耐心，要明白每个符号和每个公式背后的物理意义，这样理解起来才比较快。千万不要把自己的思维和视角集中到一个点上，导致公式推着推着就不知道自己在干啥了。
