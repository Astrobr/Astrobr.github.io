---
title: VIO快速入门（四）：舒尔补与边缘化
date: 2026-06-04 11:00:00
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

## 舒尔补

舒尔补是矩阵运算中的一个常见操作，它可以用来解方程。

对一个给定的分块矩阵$\boldsymbol M$
$$
\boldsymbol M=\begin{bmatrix}\boldsymbol A & \boldsymbol B\\\boldsymbol C & \boldsymbol D\end{bmatrix}
$$
其中$\boldsymbol D$为可逆矩阵，并且在求$\boldsymbol D^{-1}$时可以利用一些性质简化求逆的过程（例如$\boldsymbol D$是对角矩阵）。对下面的方程
$$
\begin{bmatrix}\boldsymbol A & \boldsymbol B\\\boldsymbol C & \boldsymbol D\end{bmatrix}\begin{bmatrix}\boldsymbol x_c\\\boldsymbol x_p\end{bmatrix}=\begin{bmatrix}\boldsymbol v\\\boldsymbol w\end{bmatrix}
$$
可以进行高斯消元
$$
\begin{bmatrix}\boldsymbol I & -\boldsymbol{BD}^{-1}\\\boldsymbol 0 & \boldsymbol I\end{bmatrix}\begin{bmatrix}\boldsymbol A & \boldsymbol B\\\boldsymbol C & \boldsymbol D\end{bmatrix}\begin{bmatrix}\boldsymbol x_c\\\boldsymbol x_p\end{bmatrix}=\begin{bmatrix}\boldsymbol I & -\boldsymbol{BD}^{-1}\\\boldsymbol 0 & \boldsymbol I\end{bmatrix}\begin{bmatrix}\boldsymbol v\\\boldsymbol w\end{bmatrix}
$$
整理后可以得到
$$
\begin{bmatrix}\boldsymbol A-\boldsymbol{BD}^{-1}\boldsymbol C & \boldsymbol 0\\\boldsymbol C & \boldsymbol D\end{bmatrix}\begin{bmatrix}\boldsymbol x_c\\\boldsymbol x_p\end{bmatrix}=\begin{bmatrix}\boldsymbol v-\boldsymbol{BD}^{-1}\boldsymbol w\\\boldsymbol w\end{bmatrix}
$$
这样处理之后，可以先求解第一行的方程，再求解第二行的方程，这样就可以不用费大功夫求$\boldsymbol M$的逆，简化计算。这里$\boldsymbol A-\boldsymbol{BD}^{-1}\boldsymbol C$被称为$\boldsymbol D$关于$\boldsymbol M$的舒尔补。

如果$\boldsymbol A$是可逆的，那么我们也可以使用舒尔补将$\boldsymbol M$写为下面的形式
$$
\left[\begin{array}{ll}
\boldsymbol{A} & \boldsymbol{~B} \\
\boldsymbol{C} & \boldsymbol{D}
\end{array}\right]=\left[\begin{array}{cc}
\boldsymbol{I} & \boldsymbol 0 \\
\boldsymbol{CA}^{-1} & \boldsymbol{I}
\end{array}\right]\left[\begin{array}{cc}
\boldsymbol{A} & \boldsymbol0 \\
\boldsymbol0 & \Delta_{\boldsymbol A}
\end{array}\right]\left[\begin{array}{cc}
\boldsymbol{I} & \boldsymbol{A}^{-1} \boldsymbol{B} \\
\boldsymbol 0 & \boldsymbol{I}
\end{array}\right]
$$
其中，$\Delta_{\boldsymbol A}=\boldsymbol D-\boldsymbol{CA}^{-1}\boldsymbol B$。将$\boldsymbol M$化为对角形和上/下三角矩阵的乘积后，就可以很方便地求出它的逆矩阵了
$$
\left[\begin{array}{cc}\boldsymbol{A}&\boldsymbol{B}\\\boldsymbol{C}&\boldsymbol{D}\end{array}\right]^{-1}=\begin{bmatrix}\boldsymbol{I}&-\boldsymbol{A}^{-1}\boldsymbol{B}\\\boldsymbol{0}&\boldsymbol{I}\end{bmatrix}\begin{bmatrix}\boldsymbol{A}^{-1}&\boldsymbol{0}\\\boldsymbol{0}&\Delta_{\boldsymbol A}^{-1}\end{bmatrix}\begin{bmatrix}\boldsymbol{I}&\boldsymbol{0}\\\boldsymbol{-CA}^{-1}&\boldsymbol{I}\end{bmatrix}
$$

## 舒尔补与概率分布的关系

### 协方差矩阵与信息矩阵

在之前的内容中，我们已经对协方差矩阵和信息矩阵有了一定的认识。现在我们再来通过一个案例仔细看看协方差矩阵和信息矩阵是如何构造的，里面包含什么东西。

假设现在有两间屋子，里面的温度与屋外的温度有一定差别。我们知道，屋里屋外的温度在一段时间后将趋于一致。但是由于屋子结构和材料的区别，两件屋子里面温度的变化规律不太一样。假设$x_2$为户外的温度，$x_1$、$x_3$分别是两间屋子里的温度。它们满足下面的关系
$$
x_2=v_2\\
x_1=w_1x_2 + v_1\\
x_3=w_3x_2+v_3
$$
这个关系可以表示为下面的图

<img src="https://i.postimg.cc/NMvmYNJ7/image-20250811190137731.png" alt="A toy example" style="zoom:25%;" />

其中，$v_i$为温度的随机变化，它们相互独立，且各自服从均值为0，协方差为$\sigma^2_i$的高斯分布。根据协方差的计算公式可以写出$\boldsymbol x=[x_1,x_2,x_3]^\top$的协方差矩阵$\boldsymbol\Sigma$。对两个随机变量$X$和$Y$，它们的协方差矩阵的计算公式为
$$
\mathrm{cov}(X,Y)=E(XY)-E(X)E(Y)
$$
下面先从对角线元素开始计算$\boldsymbol\Sigma$
$$
\begin{aligned}
\Sigma_{11}=E(x_1x_1)&=E[(w_1v_2+v_1)(w_1v_2+v_1)]\\
&=w_1^2E(v_2^2)+2w_1E(v_1v_2)+E(v_1^2)\\
&=w_1^2\sigma_2^2+\sigma_1^2
\end{aligned}
$$
同理可得$\Sigma_{22}=\sigma_2^2$，$\Sigma_{33}=w^2_3\sigma_2^2+\sigma_3^2$。继续计算其他元素
$$
\Sigma_{12}=E(x_1x_2)=E[(w_1v_2+v_1)v_2]=w_1\sigma_2^2\\
\Sigma_{13}=E(x_1x_3)=E[(w_1v_2+v_1)(w_3v_2+v_3)]=w_1w_3\sigma_2^2
$$
以此类推可以得到整个协方差矩阵
$$
\boldsymbol{\Sigma}=\begin{bmatrix}w_1^2\sigma_2^2+\sigma_1^2&w_1\sigma_2^2&w_1w_3\sigma_2^2\\w_1\sigma_2^2&\sigma_2^2&w_3\sigma_2^2\\w_1w_3\sigma_2^2&w_3\sigma_2^2&w_3^2\sigma_2^2+\sigma_3^2\end{bmatrix}
$$
信息矩阵是协方差矩阵的逆矩阵。我们可以直接求它的逆，也可以通过计算联合高斯分布，在这个分布的指数部分取出这个逆矩阵。这里直接给出信息矩阵如下
$$
\boldsymbol \Lambda=\boldsymbol {\Sigma}^{-1}=\begin{bmatrix}\frac{1}{\sigma_1^2}&-\frac{w_1}{\sigma_1^2}&0\\-\frac{w_1}{\sigma_1^2}&\frac{w_1^2}{\sigma_1^2}+\frac{1}{\sigma_2^2}+\frac{w_3^2}{\sigma_1^2}&-\frac{w_3}{\sigma_3^2}\\0&-\frac{w_3}{\sigma_3^2}&\frac{1}{\sigma_3^2}\end{bmatrix}
$$
信息矩阵中有两个元素为0，这有什么含义呢？对信息矩阵，如果坐标为$(i,j)$的元素为0，代表元素$i$和元素$j$关于其他变量条件独立。在这个例子中说明$x_1$和$x_3$关于$x_2$条件独立，也即$x_1$和$x_3$受$x_2$影响（图中表现为与$x_2$有相连的边），但$x_1$和$x_3$两者之间本身没有关系（图中表现为它们两者之间没有相连的边）。

### 舒尔补在多元高斯分布中的应用

对上面的那个例子，现在我们想将$x_3$这个变量从系统中去除，也即将原模型变为下图的样子

<img src="https://i.postimg.cc/GpGTMFLp/image-20250811190900147.png" style="zoom:25%;" />

如果现在要求这个系统的协方差矩阵，可以发现$x_1$和$x_2$计算协方差时与$x_3$没有关系，于是可以将原协方差矩阵中与$x_3$有关的项直接去掉，可得
$$
\boldsymbol{\Sigma}_2=\begin{bmatrix}w_1^2\sigma_2^2+\sigma_1^2&w_1\sigma_2^2\\w_1\sigma_2^2&\sigma_2^2\end{bmatrix}
$$
类似的，求信息信息矩阵时也是将与$x_3$相关的部分去掉，可得
$$
\boldsymbol{\Sigma}_2^{-1}=\begin{bmatrix}\frac{1}{\sigma_1^2}&-\frac{w_1}{\sigma_1^2}\\-\frac{w_1}{\sigma_1^2}&\frac{w_1^2}{\sigma_1^2}+\frac{1}{\sigma_2^2}\end{bmatrix}
$$
但是在程序的操作中，矩阵中每个元素的计算结果都是合并在一起的，不会写成各个变量对应部分组合的形式，因此也不可能直接去除与某个变量相关的部分。那么怎么办呢？舒尔补可以完成这个任务。

假设多元变量$\boldsymbol x=[a,b]^\top$服从高斯分布，变量之间构成的协方差矩阵为
$$
\boldsymbol{K}=\begin{bmatrix}A&C^\top\\C&D\end{bmatrix}
$$
其中，$A=\mathrm{cov}(a,a)$，$D=\mathrm{cov}(b,b)$，$C=\mathrm{cov}(a,b)$。由此$\boldsymbol x$的概率分布为
$$
\left.P(a,b)=P(a)P(b|a)\propto\exp\left(-\frac{1}{2}\left[\begin{array}{c}a\\b\end{array}\right.\right]^\top\begin{bmatrix}A&C^\top\\C&D\end{bmatrix}^{-1}\begin{bmatrix}a\\b\end{bmatrix}\right)
$$
现在我们只知道知$\boldsymbol x$的信息矩阵，然后想求出移除随机变量$b$后的信息矩阵（也即$A^{-1}$）。令上式中指数部分的信息矩阵为
$$
\begin{bmatrix}A&C^\top\\C&D\end{bmatrix}^{-1}=\begin{bmatrix}\Lambda_{aa}&\Lambda_{ab}\\\Lambda_{ba}&\Lambda_{bb}\end{bmatrix}
$$
利用舒尔补，可以将其写为
$$
\begin{bmatrix}\Lambda_{aa}&\Lambda_{ab}\\\Lambda_{ba}&\Lambda_{bb}\end{bmatrix}=\left.\left[\begin{array}{cc}A^{-1}+A^{-1}C^{\top}\Delta_A^{-1}CA^{-1}&-A^{-1}C^{\top}\Delta_{{A}}^{-1}\\-\Delta_{{A}}^{-1}CA^{-1}&\Delta_{{A}}^{-1}\end{array}\right.\right]
$$
显而易见，有$\Delta_A^{-1}=\Lambda_{bb}$，于是
$$
\begin{aligned}
A^{-1}&=\Lambda_{aa}-A^{-1}C^\top\Delta_A^{-1}CA^{-1}\\
&=\Lambda_{aa}-A^{-1}C^\top\Delta_A^{-1}\Delta_A\Delta_A^{-1}CA^{-1}\\
&=\Lambda_{aa}-\Lambda_{ab}\Lambda_{bb}^{-1}\Lambda_{ba}
\end{aligned}
$$
上面这个过程本质上是在根据联合概率分布$p(a,b)$求边际概率分布$p(a)$，一般的做法是通过概率密度函数积分的方法求出$p(a)$，再求出$A^{-1}$，也即
$$
p(a)=\int p(a,b)\mathrm d b
$$
注意到在处理$p(a,b)$的过程中保留了随机变量$b$的信息。与之前舒尔补的方法进行对比可以发现，舒尔补的方法要简单很多。

回到一开始的那个温度的例子，现在我们想求去除$x_3$后的信息矩阵，利用上面的公式可得
$$
\begin{aligned}
\boldsymbol\Sigma_2^{-1}&=\Lambda_{aa}-\Lambda_{ab}\Lambda_{bb}^{-1}\Lambda_{ba}\\
&=\begin{bmatrix}\frac{1}{\sigma_1^2}&-\frac{w_1}{\sigma_1^2}\\-\frac{w_1}{\sigma_1^2}&\frac{w_1^2}{\sigma_1^2}+\frac{1}{\sigma_2^2}+\frac{w_3^2}{\sigma_1^2}\end{bmatrix}-\begin{bmatrix}0\\-
\frac{w_3}{\sigma^2_3}\end{bmatrix}\sigma_3^2\begin{bmatrix}0&-\frac{w_3}{\sigma_3^2}\end{bmatrix}\\
&=\begin{bmatrix}\frac{1}{\sigma_1^2}&-\frac{w_1}{\sigma_1^2}\\-\frac{w_1}{\sigma_1^2}&\frac{w_1^2}{\sigma_1^2}+\frac{1}{\sigma_2^2}\end{bmatrix}
\end{aligned}
$$
这与之前我们手动去除$x_3$相关项得到的结果是一样的。

## 滑动窗口算法

### 最小二乘与因子图

假设有这样的一个最小二乘系统
$$
\boldsymbol{\xi}=\underset{\boldsymbol{\xi}}{\operatorname*{\operatorname*{argmin}}}\frac{1}{2}\sum_{i=1}^5\left\|\mathbf{r}_i\right\|_{\boldsymbol{\Sigma}_i}^2
$$
其中
$$
\boldsymbol{\xi}=\begin{bmatrix}\boldsymbol{\xi}_1\\\boldsymbol{\xi}_2\\...\\\boldsymbol{\xi}_6\end{bmatrix},\mathbf{r}=\begin{bmatrix}\mathbf{r}_{12}\\\mathbf{r}_{13}\\\mathbf{r}_{14}\\\mathbf{r}_{15}\\\mathbf{r}_{56}\end{bmatrix}
$$
那么这个系统可以用下面的因子图来表示

<img src="https://i.postimg.cc/CKTzfRG5/image-20250812120025252.png" style="zoom:30%;" />

图中的圆圈为顶点，代表优化变量；连接顶点的边代表顶点之间构建的残差（也就是优化变量之间的“联系”）。回顾第一讲中的内容，这个最小二乘问题对应的增量方程为
$$
\underbrace{\boldsymbol{J}^\top\boldsymbol{\Sigma}^{-1}\boldsymbol{J}}_{\begin{array}{c}\boldsymbol{H}~or~\boldsymbol\Lambda\end{array}}\delta\boldsymbol{\xi}=\underbrace{-\boldsymbol{J}^\top\boldsymbol{\Sigma}^{-1}\mathbf{r}}_{\boldsymbol{b}}
$$
其中，$\boldsymbol\Sigma^{-1}$为残差的信息矩阵，$\boldsymbol J$为残差对优化变量的雅可比矩阵。这里的雅可比矩阵为
$$
\boldsymbol{J}=\frac{\partial\mathbf{r}}{\partial\boldsymbol{\xi}}=\begin{bmatrix}\frac{\partial\mathbf{r}_{12}}{\partial\boldsymbol{\xi}}\\\frac{\partial\mathbf{r}_{13}}{\partial\boldsymbol{\xi}}\\\frac{\partial\mathbf{r}_{14}}{\partial\boldsymbol{\xi}}\\\frac{\partial\mathbf{r}_{15}}{\partial\boldsymbol{\xi}}\\\frac{\partial\mathbf{r}_{56}}{\partial\boldsymbol{\xi}}\end{bmatrix}=\begin{bmatrix}\boldsymbol{J}_1\\\boldsymbol{J}_2\\\boldsymbol{J}_3\\\boldsymbol{J}_4\\\boldsymbol{J}_5\end{bmatrix}
$$
上面的增量方程可以写为累加的形式
$$
\sum_{i=1}^5\boldsymbol{J}_i^\top\boldsymbol{\Sigma}_i^{-1}\boldsymbol{J}_i\delta\boldsymbol{\xi}=-\sum_{i=1}^5\boldsymbol{J}_i^\top\boldsymbol{\Sigma}_i^{-1}\mathbf{r}_i
$$
由于每个残差只和某几个状态量有关，因此雅可比矩阵是稀疏的，如
$$
\boldsymbol J_{2} = \frac{\partial \mathbf{r}_{13}}{\partial \boldsymbol{\xi}} = \begin{bmatrix} \frac{\partial \mathbf{r}_{13}}{\partial \xi_{1}} & \mathbf{0} & \frac{\partial \mathbf{r}_{13}}{\partial \xi_{3}} & \mathbf{0} & \mathbf{0} & \mathbf{0} \end{bmatrix}
$$

$$
\boldsymbol{J}_{2}^{\top}\boldsymbol \Sigma_{2}^{-1}\boldsymbol{J}_2 = \begin{bmatrix} (\frac{\partial \mathbf{r}_{13}}{\partial \boldsymbol{\xi}_{1}})^{\top} \boldsymbol\Sigma_{2}^{-1} \frac{\partial \mathbf{r}_{13}}{\partial \boldsymbol{\xi}_{1}} & \boldsymbol 0 & (\frac{\partial \mathbf{r}_{13}}{\partial \boldsymbol{\xi}_{1}})^{\top} \boldsymbol\Sigma_{2}^{-1} \frac{\partial \mathbf{r}_{13}}{\partial \boldsymbol{\xi}_{3}} & \boldsymbol0 & \boldsymbol0 \\ \boldsymbol0 & \boldsymbol0 & \boldsymbol0 & \boldsymbol0 & \boldsymbol0 \\ (\frac{\partial \mathbf{r}_{13}}{\partial \boldsymbol{\xi}_{3}})^{\top} \boldsymbol\Sigma_{2}^{-1} \frac{\partial \mathbf{r}_{13}}{\partial \boldsymbol{\xi}_{1}} & \boldsymbol0 & (\frac{\partial \mathbf{r}_{13}}{\partial \boldsymbol{\xi}_{3}})^{\top} \boldsymbol\Sigma_{2}^{-1} \frac{\partial \mathbf{r}_{13}}{\partial \boldsymbol{\xi}_{3}} & \boldsymbol0 & \boldsymbol0 \\ \boldsymbol0 & \boldsymbol0 & \boldsymbol0 & \boldsymbol0 & \boldsymbol0 \\ \boldsymbol0 & \boldsymbol0 & \boldsymbol0 & \boldsymbol0 & \boldsymbol0 \end{bmatrix}
$$

同理可知，其他的$\boldsymbol J_i^\top\boldsymbol\Sigma^{-1}_i\boldsymbol J_i$也是稀疏的。将5个$\boldsymbol \Lambda_i$矩阵加起来可以得到一个同样稀疏的$\boldsymbol\Lambda$矩阵。这个过程可以用下面的图表示，其中蓝色的元素为非零元素。

<img src="https://i.postimg.cc/KzmjJCp0/image-20250812143345889.png" style="zoom:30%;" />

### 滑动窗口算法与舒尔补

在之前的几讲中，我们已经大致了解了滑动窗口算法。这个算法的主要思想或目的是：随着VIO系统不断往新环境探索，就会有新的相机姿态以及看到新的环境特征，最小二乘残差就会越来越多，信息矩阵越来越大，计算量将不断增加，为了保持优化变量的个数在一定范围内，需要使用滑动窗口算法动态增加或移除优化变量。滑动窗口算法的大致流程为：

- 增加新的变量进入最小二乘系统优化
- 如果变量数目达到了一定的维度，则移除老的变量，在VINS中，变量是以每一帧图像的所有特征点及其对应的位置、速度、姿态、零偏的组合为单位来移除的，移除变量的过程叫做**边缘化**
- 不断循环前面两步

那么应该如何移除老的变量呢？如果直接丢弃这些变量和对应的测量值会损失信息。正确的做法是使用边际概率，将待丢弃变量所携带的信息传递给剩余变量，完成这个操作就需要舒尔补。下面的图片展示了移除本节介绍的最小二乘系统的变量$\boldsymbol\xi_1$时信息矩阵的变化过程。

![](https://i.postimg.cc/T1wwXg6B/image-20250812144634837.png)

### 例：一个简单的VIO因子图

![](https://i.postimg.cc/05Wj0WGx/image-20250812154624998.png)

上面这张图描绘了一个简单的VIO系统的因子图及其对应的$\boldsymbol H$矩阵。在因子图中，所有的圆圈都代表优化变量，其中明黄色圆圈代表路标点的逆深度，绿色圆圈代表图像帧对应IMU的位置和姿态，橙黄色圆圈代表图像帧对应的IMU的速度和零偏；所有的方块代表残差项（也就是约束或因子），红色方块代表重投影约束，蓝色方块代表IMU的预积分约束。以第0帧与第1帧为例进行讲解，这两帧的共视特征点为X0和X1，两帧的位置和姿态可以通过重投影残差rv10和rv11构建联系。当然X0与rv10，X1与rv11肯定是有联系的。另外，两帧的位置姿态（T0、T1）、速度零偏（M0、M1）可以通过预积分约束rb01构建联系。其他因子之间的联系也是类似的。图片右侧展示了与这个因子图对应的$\boldsymbol H$矩阵，空白的地方为零矩阵，绿色块同时受视觉和IMU共同约束影响，黄色块只受IMU约束影响，红色和蓝色块只受视觉约束影响。图中给出了(T1, T1)块的组成，可以看出它是由所有与T1有关的约束对T1的偏导数叠加构成的，注意这里省略了信息矩阵。再举一个(T0, M0)块的例子，同样略去了信息矩阵
$$
\boldsymbol H_{T0M0}=\left(\frac{\partial\mathbf r_{b_{01}}}{\partial T_0}\right)^\top\left(\frac{\partial\mathbf r_{b_{01}}}{\partial M_0}\right)
$$
$\boldsymbol H$矩阵的其他块的计算方法都是类似的，这里就不再赘述了。

### 例：VINS中的边缘化过程图解

回顾VINS中优化问题的目标函数
$$
\begin{aligned}
\min_{\mathcal{X}}\left(\underbrace{\|\mathbf{r}_p-\mathbf{J}_p\mathcal{X}\|_{\boldsymbol\Sigma_p}^2}_{\mathrm{prior~error}}+\underbrace{\sum_{i,j\in B}\left\|\mathbf{r}_b(\hat{\mathbf{z}}^{b_i}_{b_{j}},\mathcal{X})\right\|_{\boldsymbol\Sigma^{b_i}_{b_{j}}}^2}_{\mathrm{IMU~error}}\\
+\underbrace{\sum_{j\in B,k\in F}\rho\left\|\mathbf{r}_c(\hat{\mathbf{z}}_{\mathbf{f}_k}^{c_{j}},\mathcal{X})\right\|_{\boldsymbol\Sigma_{\mathbf{f}_k}^{c_j}}^2}_{\text{image error}}\}\right)
\end{aligned}
$$
目标函数被分为了先验残差因子、IMU残差因子、视觉残差因子三个部分。在前面的两讲中我们已经介绍过了IMU残差因子和视觉残差因子，这里主要介绍先验残差因子。

首先需要明确一下，先验残差因子本质上不是一个残差，它本质上是对增量方程中$\boldsymbol H$和$\boldsymbol b$的操作，也就是把待边缘化变量的信息转移到其他变量上。这里写成一个残差的形式是因为在Ceres中没有办法直接修改增量方程，而只能操作残差和雅可比矩阵，因此要将增量方程反推回残差和雅可比的形式。

另外，我们在前面已经知道增量方程可以写为不同部分雅可比矩阵的叠加形式，因此只需要写出原本的$\boldsymbol H$矩阵中与待边缘化变量相关的部分，然后对这个$\boldsymbol H$矩阵进行舒尔补操作即可。这个也不难理解，观察之前进行舒尔补操作的因子图可以看出，舒尔补后只对$\boldsymbol H$矩阵左上角的一小部分会有影响，而左下角与待边缘化变量无关的部分是根本与它没关系的，只需将这部分矩阵与舒尔补并调整大小后的$\boldsymbol H$矩阵相加即可。

下面这个例子简要介绍了VINS中边缘化的流程。

![](https://i.postimg.cc/0ymNx9TN/image-20250812163059129.png)

在上面的因子图中，包括11帧图像的位姿。现在，我们想将第0帧相关的变量边缘化掉。图中画出了与第0帧相关的所有边。在上图中，第0帧观测到的特征点中有42个与第1帧形成共视，有29个与第2帧形成共视，有16个与第3帧形成共视，有14个与其他剩余帧形成共视。因此，与第0帧有关的视觉因子（约束）一共有185个，另外还有一个IMU预积分因子（约束）。在这个问题中，$\boldsymbol H$矩阵的维度由优化变量的数目决定：2个速度零偏顶点带来18维，11个位姿顶点带来66维，1个外参顶点带来6维，还有42个特征点带来42维。所以$\boldsymbol H$矩阵的维度为132维。图中用圆角矩形框住的部分为需要边缘化掉的优化变量，这部分在$\boldsymbol H$矩阵中占据了57维：1个速度零偏顶点带来9维，1个位姿顶点带来6维，42个特征点带来42维。之后，可以计算出剩下需要保留的变量的维度为66维。于是，可以构造边缘化中使用的$\boldsymbol H$矩阵

<img src="https://i.postimg.cc/7LnYGmY8/image-20250813113703626.png" style="zoom:40%;" />

首先将视觉因子填入这个矩阵中，一共有185个。

![](https://i.postimg.cc/SRJyP46r/image-20250813113853578.png)

![](https://i.postimg.cc/FFBFLfvW/image-20250813113911981.png)

再将一个IMU因子填充进去。

![](https://i.postimg.cc/654WL95C/image-20250813114445197.png)

最后叠加到一起有

![](https://i.postimg.cc/HLdTgX0r/image-20250813114530107.png)

然后进行舒尔补的操作，可以得到维度与右下角小块一样的边缘化因子。

![](https://i.postimg.cc/TwPGyx4T/image-20250813114649170.png)

![](https://i.postimg.cc/ZKNmvVVW/image-20250813114659580.png)

之后将第0帧相关的部分从旧的$\boldsymbol H$矩阵中移除，将边缘化因子与新的一帧加入优化问题，于是新的因子图为

![](https://i.postimg.cc/vZLd3DRZ/image-20250813115017802.png)

注意这里第0帧为之前的第1帧。边缘化因子在新的$\boldsymbol H$中的分布如下所示

![](https://i.postimg.cc/JngwGkJW/image-20250813115121415.png)

整个$\boldsymbol H$矩阵如下所示

![](https://i.postimg.cc/3JQ8BsyZ/image-20250813115215414.png)

之后又对第0帧相关的变量进行边缘化，只需要重复上面的操作即可。

### 滑动窗口算法存在的问题

回到之前的案例，假如我们在移除$\xi_1$后又加入了新的变量$\xi_7$，这个因子图一开始是下面这样的

<img src="https://i.postimg.cc/Gmcc0vxJ/image-20250813120019318.png" style="zoom:50%;" />

图中红色的是被边缘化掉的变量及其约束，绿色的是跟被边缘化变量有关的保留下来的变量，蓝色为与被边缘化变量无关的变量。边缘化之后的因子图是下面这样的

<img src="https://i.postimg.cc/85rGd4Nb/image-20250813120222607.png" style="zoom:50%;" />

下图给出了边缘化完成后加入$\xi_7$的$\boldsymbol H$矩阵变化过程

<img src="https://i.postimg.cc/rsXkf4p4/image-20250813121026961.png" style="zoom:40%;" />

注意到边缘化之后图中$\boldsymbol\Lambda$左上角的块包含两部分信息，一部分是$\xi_1$带来的，一部分是$\xi_2$自己带来的。由于$\xi_1$被边缘化掉了，相关的量测也被丢弃，因此包含了$\xi_1$的雅可比的$\boldsymbol\Lambda$无法在后续求解中更新，而这部分是在先前的线性化点上计算的。在这部分叠加到其他相关变量（如$\xi_2$）上后，随着求解的不断进行，对这些未边缘化的相关变量的雅可比又在新的线性化点上进行计算。如图中$\boldsymbol\Lambda_6$左上角的块，线性化点是加入了$\xi_7$后的$\xi_2$，而$\boldsymbol\Lambda^\prime$左上角的块的线性化点则是边缘化掉$\xi_1$时的$\xi_2$，两个线性化点不同。而这可能会导致信息矩阵的零空间发生变化，在求解时引入错误信息。

假设在求解VIO的最小二乘问题时有下面的增量方程
$$
\boldsymbol H \delta\boldsymbol x=\boldsymbol b
$$
如果$\boldsymbol H$不满秩，那么这个方程有多解。根据线性代数的知识，我们知道上面的方程的解的结构为“特解+零空间向量”。满足$\boldsymbol H\delta\boldsymbol x_N=\boldsymbol 0$的所有$\delta\boldsymbol x_N$构成的向量空间称为$\boldsymbol H$的零空间。当解在零空间内变化时，对整个系统或者残差是没有影响的，那么系统可以有多个最小化目标函数的解。
$$
\boldsymbol H(\delta\boldsymbol x+\delta\boldsymbol x_N)=\boldsymbol b
$$
<img src="https://i.postimg.cc/bwNjVpqQ/image-20250813152904335.png" style="zoom:50%;" />

在上面的四张图中，$E$由两个相同的非线性函数$E_1$和$E_2$组成。令$E=0$，得到的解为$xy=1$，对应第一张图中深蓝色的曲线。第二张图在交叉处对$E_1$进行了线性化，第三张图在圆圈处对$E_2$进行了线性化。将线性化后的函数进行叠加后得到的$E^\prime$得到了对整个系统的近似，我们发现原来的零空间消失了，$E^\prime=0$的解变成了一个点，这意味着整个系统其实出现了比较严重的畸变。

在实际经验中发现，有时VINS发散之后系统状态朝着一个方向飞快的移动，估计就是遇到了这种情况。在正常的求解中因为零空间的存在，求解器收敛的速度会相对较慢。在发散之后求解器的求解时间异常地短，很有可能就是因为零空间消失，畸形的系统非常快地收敛到了错误的极小值处。

如何解决这个问题呢？可以使用FEJ（First Estimated Jacobian）算法来处理，它的思想是：不同残差对同一个状态求雅克比时，线性化点必须一致。出于篇幅考虑，这里就不再介绍FEJ的原理了。但是在VINS中并没有使用FEJ的策略，据作者说是因为没有发现明显的航向不可观性导致的轨迹漂移，反而加入FEJ后优化结果不佳。

## VINS中滑动窗口算法的一些细节

### 滑动窗口帧丢弃策略

VINS的边缘化策略并不是一味地将新帧添加到滑窗内而移除老帧。为了处理一些静止（或小视差变化），VINS做了些策略调整，具体如下：

- MARGIN OLD：如果次新帧是关键帧，则丢弃滑动窗口内最老帧，同时对与该图像帧关联的约束项进行边缘化处理，丢弃 IMU 预积分，保留有共视特征点；
- MARGIN NEW：如果次新帧不是关键帧，则丢弃当前帧的前一帧，因为判断当前帧不是关键帧的条件是当前帧与前一帧视差很小，这种情况下直接丢弃前一帧，去掉特征点与次新帧的共视关系，而两段IMU预积分拼接到一块，保证 IMU 预积分的连贯性。

利用这种策略可以处理运动变化较小的情况，通过频繁的MARGIN NEW保留那些比较老但是视差比较大的位姿。但是如果一直MARGIN OLD的话，视觉约束不够强，状态估计会受IMU积分误差影响，具有较大的累计误差。

### 边缘化后先验因子的雅可比与残差

之前我们说过，可以通过直接操作系统的$\boldsymbol H$矩阵进行舒尔补实现边缘化。这里将舒尔补的过程重新再写一遍，假设我们要边缘化$\mathbf x_m$
$$
\begin{align*}
\begin{bmatrix} \boldsymbol H_{mm} & \boldsymbol H_{bm}^\top \\ \boldsymbol H_{bm} & \boldsymbol H_{bb} \end{bmatrix} \begin{bmatrix} \delta \boldsymbol {x}_{m} \\ \delta \boldsymbol {x}_{b} \end{bmatrix} &= \begin{bmatrix} \boldsymbol {b}_{m} \\ \boldsymbol {b}_{b} \end{bmatrix} \\
\begin{bmatrix} \boldsymbol I & \boldsymbol 0 \\ -\boldsymbol H_{bm}\boldsymbol H_{mm}^{-1} & \boldsymbol I \end{bmatrix} \begin{bmatrix} \boldsymbol H_{mm} & \boldsymbol H_{bm}^\top \\ \boldsymbol H_{bm} & \boldsymbol H_{bb} \end{bmatrix} \begin{bmatrix} \delta \boldsymbol {x}_{m} \\ \delta \boldsymbol {x}_{b} \end{bmatrix} &= \begin{bmatrix} \boldsymbol I & \boldsymbol 0 \\ -\boldsymbol H_{bm}\boldsymbol H_{mm}^{-1} & \boldsymbol I \end{bmatrix} \begin{bmatrix} \boldsymbol {b}_{m} \\ \boldsymbol {b}_{b} \end{bmatrix} \\
\begin{bmatrix} \boldsymbol H_{mm} & \boldsymbol H_{bm}^\top \\ \boldsymbol 0 & \boldsymbol H_{bb} - \boldsymbol H_{bm}\boldsymbol H_{mm}^{-1}\boldsymbol H_{bm}^\top \end{bmatrix} \begin{bmatrix} \delta \boldsymbol {x}_{m} \\ \delta \boldsymbol {x}_{b} \end{bmatrix} &= \begin{bmatrix} \boldsymbol {b}_{m} \\ \boldsymbol {b}_{b} - \boldsymbol H_{bm}\boldsymbol H_{mm}^{-1}\boldsymbol {b}_{m} \end{bmatrix}
\end{align*}
$$
可以得到新的增量方程
$$
\underbrace{(\boldsymbol H_{bb} - \boldsymbol H_{bm}\boldsymbol H_{mm}^{-1}\boldsymbol H_{bm}^\top)}_{\boldsymbol A} \delta \boldsymbol {x}_{b} = \underbrace{\boldsymbol {b}_{b} - \boldsymbol H_{bm}\boldsymbol H_{mm}^{-1}\boldsymbol {b}_{m}}_{\boldsymbol b}
$$
现在我们得到了边缘化后的$\boldsymbol H$矩阵，把它记为$\boldsymbol A$（与代码的符号统一）。根据增量方程的形式（在这里略去了雅可比矩阵中间的信息矩阵）
$$
\boldsymbol J^\top\boldsymbol J\delta\boldsymbol  x=-\boldsymbol J^\top\mathbf r
$$
可以分解出求解器需要的雅可比和残差
$$
\boldsymbol A = \boldsymbol J^\top\boldsymbol J = \boldsymbol V\boldsymbol S\boldsymbol V^\top = \boldsymbol V\boldsymbol S\boldsymbol V^{-1} =\boldsymbol V \sqrt{\boldsymbol S} \sqrt{\boldsymbol S} \boldsymbol V^\top = (\sqrt{\boldsymbol S}\boldsymbol V^\top)^\top \sqrt{\boldsymbol S} \boldsymbol V^\top\\
\boldsymbol J = \sqrt{\boldsymbol S} \boldsymbol V^\top
$$

$$
\boldsymbol b = \boldsymbol J^\top \boldsymbol r\\
\boldsymbol r = (\boldsymbol J^\top)^{-1}\boldsymbol b = (\boldsymbol V \sqrt{\boldsymbol S})^{-1}\boldsymbol b = \sqrt{\boldsymbol S}^{-1}\boldsymbol V^{-1}\boldsymbol b = \sqrt{\boldsymbol S}^{-1}\boldsymbol V^\top \boldsymbol b
$$

### 先验因子残差更新

虽然边缘化后先验信息矩阵（边缘化之后的小$\boldsymbol H$矩阵）固定不变，但随着迭代的推进，变量不断优化，先验残差需要跟随变化。否则，求解系统可能崩溃。先验残差的变化可以用一阶泰勒近似
$$
\boldsymbol b = \boldsymbol b_0 + \frac{\partial \boldsymbol b}{\partial \boldsymbol  x} \delta\boldsymbol  x = \boldsymbol b_0 + \frac{\partial (-\boldsymbol J^\top \boldsymbol r)}{\partial \boldsymbol  x} \delta\boldsymbol  x = \boldsymbol b_0 - \boldsymbol J^\top \frac{\partial \boldsymbol r}{\partial\boldsymbol  x} \delta\boldsymbol  x
= \boldsymbol b_0 - \boldsymbol J^\top \boldsymbol J \delta\boldsymbol  x = \boldsymbol b_0 - \boldsymbol A \delta\boldsymbol  x\\
-\boldsymbol J^\top \boldsymbol r = -\boldsymbol J^\top \boldsymbol r_0 - \boldsymbol J^\top \boldsymbol J \delta\boldsymbol  x\\
\boldsymbol r = \boldsymbol r_0 + \boldsymbol J \delta\boldsymbol  x
$$
其中，下角标$[\cdot]_0$代表更新前的量。

### 舒尔补加速后端求解

在得到增量方程后，如果我们直接通过$\delta\boldsymbol x=-\boldsymbol H^{-1}\boldsymbol b$来求解的话，求$\boldsymbol H^{-1}$计算量会很大。可以使用舒尔补的方法，利用$\boldsymbol H$的稀疏性加速求解。在一般情况下，$\boldsymbol H$矩阵具有下面的结构

<img src="https://i.postimg.cc/8C7gD4JW/image-20250813184920144.png" style="zoom:33%;" />

右下角的对角矩阵是与特征点的逆深度有关的块，这种矩阵被叫做箭头形矩阵。将$\boldsymbol H$矩阵写成分块的形式，原本的增量方程变为
$$
\begin{bmatrix}\boldsymbol H_{pp} & \boldsymbol H_{pl}\\\boldsymbol H_{lp} & \boldsymbol H_{ll}\end{bmatrix}\begin{bmatrix}\boldsymbol \delta \boldsymbol x_p\\\delta\boldsymbol x_l\end{bmatrix}=\begin{bmatrix}-\boldsymbol b_p\\-\boldsymbol b_l\end{bmatrix}
$$
对这种矩阵使用舒尔补操作，使其变为下三角矩阵
$$
(\boldsymbol H_{pp}-\boldsymbol H_{pl}\boldsymbol H_{ll}^{-1}\boldsymbol H_{pl}^\top)\delta\boldsymbol x_p=-\boldsymbol b_p+\boldsymbol H_{pl}\boldsymbol H^{-1}_{ll}\boldsymbol b_l
$$
这样缩小了未知数的个数，并且代价只是要多求对角矩阵$\boldsymbol H_{ll}$的逆，相对简单。解出$\delta\boldsymbol x_p$后，再解下面的方程计算$\delta\boldsymbol x_l$
$$
\boldsymbol H_{ll}\delta\boldsymbol x_l=-\boldsymbol b_l-\boldsymbol H_{pl}^\top\delta\boldsymbol x_p
$$
到这里，整个VIO的后端优化部分就基本介绍完了。在求解优化问题时，还有很多细节需要处理，以保证较好的优化结果。例如，如何防止优化值在零空间漂移、FEJ的算法与实现、核函数引起的雅可比和残差的缩放等等。但是这部分内容与优化理论更为相关，就不再赘述了。
