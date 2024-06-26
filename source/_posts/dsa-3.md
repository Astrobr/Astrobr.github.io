---
title: DSA-3：向量及其接口设计1
date: 2022-03-17 16:00:00
categories: 
	- [CS]
	#- [cate2]
	#...
tags: 
	- Data Structure
	- Algorithm
	- C++
	#...

#If you need a thumbnail photo for your post, delete the well number below and finish the directory.
cover:  https://i.postimg.cc/bwq6sSvy/dsa.webp
thumbnail:  https://i.postimg.cc/bwq6sSvy/dsa.webp

#If you need to customize your excerpt, delete the well number below and input something. You can also input <!-- more --> in your article to divide the excerpt and other contents.
excerpt: 正式开始介绍数据结构！

#If you don't want to show the ToC (Table of Content) at sidebar, delete the well number below. 
#toc: false

#You can begin to input your article below now.

---

## 数据结构的基本概念

数据结构是数据项的结构化集合，其结构性表现为数据项之间的相互联系及作用，也可以理解为定义于数据项之间的某种逻辑次序。

根据这种逻辑次序的复杂程度，大致可以将各种数据结构划分为*线性结构*、*半线性结构*、*非线性结构*三类。在线性结构中，各个数据项按照一个线性次序构成一个整体。

最基本的线性结构被称为*序列*。根据其中数据项的逻辑次序与其物理存储地址的对应关系不同，又可以将其区分为*向量*和*列表*。向量的所有数据项的物理存放位置与其逻辑次序完全吻合，此时的逻辑次序也被称为*秩*（就是索引或者下标）；而在列表中，逻辑上相邻的数据项在物理上未必相邻，它们的地址只能相互间接确定。

## 从数组到向量

数组是许多元素的一个集合，这些元素具有线性次序。假设它们存放于起始地址为`A`，物理地址连续的一段存储空间，它们的集合就被称作数组`A[]`。数组中的每一个元素都唯一对应一个下标编号，如有`n`个元素的数组，那么它的下标范围是`[0, n)`中的正整数。

### 前驱与后继

对于任何$0\le i<j<n$，数组`A[]`中的元素`A[i]`都是`A[j]`的*前驱*，`A[j]`都是`A[i]`的*后继*。特别地，对任意$i\ge 1$，`A[i-1]`都是`A[i]`的*直接前驱*；对任意$i\le n-2$，`A[i+1]`都是`A[i]`的*直接后继*。

任一元素的所有前驱构成其*前缀*，所有后继构成其*后缀*。

在这一规则下，若数组`A[]`的起始地址为`A`，且每个元素占用`s`个单位的空间，则元素`A[i]`对应的物理地址即为`A + si`。这样的性质可以让我们通过下标这个元素的唯一指代，在常数时间内访问这个元素。

### 向量

向量其实就是数组的一种抽象和泛化，它也是由具有线性次序的一组元素构成的集合，其中的元素分别由秩互相区分。向量中的秩具有与数组中的秩完全一样的特性。例如，若元素`e`的前驱元素共计`r`个，则其秩就是`r`。反过来，通过秩`r`也可以唯一确定元素`e`。这种向量特有的元素访问方式，称作*循秩访问*。

向量的元素与数组中的相比，类型的范围极大地扩大了（即泛化）。向量的元素本身可以是来自于更具一般性的某一类的对象。另外，各个元素也不一定具有数值属性，也即不能保证它们之间能够互相比较大小。

接下来的内容就向量最基本的接口的设计展开讨论，实现了相对应的响亮模板类。此外，下面的章节中通过引入比较器或者重载运算符明确各元素间的大小判断依据，并以此为据认为向量的元素都是可以比较大小的。

## 向量的基本接口

向量对象应该支持如下的操作接口：

|    操作接口    |                           功能                           | 适用对象 |
| :------------: | :------------------------------------------------------: | :------: |
|    `size()`    |               报告向量当前规模（元素个数）               |   向量   |
|    `get(r)`    |                    获取秩为`r`的元素                     |   向量   |
|   `put(r,e)`   |                用`e`替换秩为`r`的元素的值                |   向量   |
| `insert(r,e)`  |           把`e`插入秩`r`的位置，原后继依次后移           |   向量   |
|  `remove(r)`   |       删除秩为`r`的元素，返回该元素中存放的原对象        |   向量   |
| `disordered()` |             判断所有元素是否已按照非降序排列             |   向量   |
|    `sort()`    |            调整各元素的位置，使之按非降序排列            |   向量   |
|   `find(e)`    |                查找等于`e`且秩最大的元素                 |   向量   |
|  `search(e)`   |       查找目标元素`e`，返回不大于`e`且秩最大的元素       | 有序向量 |
| `depulicate()` |                       剔除重复元素                       |   向量   |
|  `uniquify()`  |                       剔除重复元素                       | 有序向量 |
|  `traverse()`  | 遍历向量并且统一按照给定的函数对象指定的方法处理所有元素 |   向量   |

根据上表的内容，可以设计`Vector`模板类如下所示。

{% codeblock lang:C++ >folded %}

using Rank = int; //秩
#define DEFAULT_CAPACITY  3 //默认的初始容量（实际应用中可设置为更大）

template <typename T> class Vector { //向量模板类
protected:
   Rank _size; Rank _capacity;  T* _elem; //规模、容量、数据区
   void copyFrom ( T const* A, Rank lo, Rank hi ); //复制数组区间A[lo, hi)
   void expand(); //空间不足时扩容
   void shrink(); //装填因子过小时压缩
   bool bubble ( Rank lo, Rank hi ); //扫描交换
   void bubbleSort ( Rank lo, Rank hi ); //起泡排序算法
   Rank maxItem ( Rank lo, Rank hi ); //选取最大元素
   void selectionSort ( Rank lo, Rank hi ); //选择排序算法
   void merge ( Rank lo, Rank mi, Rank hi ); //归并算法
   void mergeSort ( Rank lo, Rank hi ); //归并排序算法
   void heapSort ( Rank lo, Rank hi ); //堆排序（稍后结合完全堆讲解）
   Rank partition ( Rank lo, Rank hi ); //轴点构造算法
   void quickSort ( Rank lo, Rank hi ); //快速排序算法
   void shellSort ( Rank lo, Rank hi ); //希尔排序算法
public:
// 构造函数
   Vector ( int c = DEFAULT_CAPACITY, Rank s = 0, T v = 0 ) //容量为c、规模为s、所有元素初始为v
   { _elem = new T[_capacity = c]; for ( _size = 0; _size < s; _elem[_size++] = v ); } //s<=c
   Vector ( T const* A, Rank n ) { copyFrom ( A, 0, n ); } //数组整体复制
   Vector ( T const* A, Rank lo, Rank hi ) { copyFrom ( A, lo, hi ); } //区间
   Vector ( Vector<T> const& V ) { copyFrom ( V._elem, 0, V._size ); } //向量整体复制
   Vector ( Vector<T> const& V, Rank lo, Rank hi ) { copyFrom ( V._elem, lo, hi ); } //区间
// 析构函数
   ~Vector() { delete [] _elem; } //释放内部空间
// 只读访问接口
   Rank size() const { return _size; } //规模
   bool empty() const { return !_size; } //判空
   Rank find ( T const& e ) const { return find ( e, 0, _size ); } //无序向量整体查找
   Rank find ( T const& e, Rank lo, Rank hi ) const; //无序向量区间查找
   Rank search ( T const& e ) const //有序向量整体查找
   { return ( 0 >= _size ) ? -1 : search ( e, 0, _size ); }
   Rank search ( T const& e, Rank lo, Rank hi ) const; //有序向量区间查找
// 可写访问接口
   T& operator[] ( Rank r ); //重载下标操作符，可以类似于数组形式引用各元素
   const T& operator[] ( Rank r ) const; //仅限于做右值的重载版本
   Vector<T> & operator= ( Vector<T> const& ); //重载赋值操作符，以便直接克隆向量
   T remove ( Rank r ); //删除秩为r的元素
   int remove ( Rank lo, Rank hi ); //删除秩在区间[lo, hi)之内的元素
   Rank insert ( Rank r, T const& e ); //插入元素
   Rank insert ( T const& e ) { return insert ( _size, e ); } //默认作为末元素插入
   void sort ( Rank lo, Rank hi ); //对[lo, hi)排序
   void sort() { sort ( 0, _size ); } //整体排序
   void unsort ( Rank lo, Rank hi ); //对[lo, hi)置乱
   void unsort() { unsort ( 0, _size ); } //整体置乱
   Rank deduplicate(); //无序去重
   Rank uniquify(); //有序去重
// 遍历
   void traverse ( void (* ) ( T& ) ); //遍历（使用函数指针，只读或局部性修改）
   template <typename VST> void traverse ( VST& ); //遍历（使用函数对象，可全局性修改）
}; //Vector

{% endcodeblock %}

这里使用了模板编程，可以提高向量中元素的数据结构选用的灵活性和运行效率。

## 构造与析构

观察上面的代码可以知道，向量模板类中的私有数组`_elem[]`用来存储向量中实际的元素；其容量（`_elem[]`中元素的个数，其中可能有空元素）由私有变量`_capacity`指示；其有效元素的数量（向量的规模）由`_size`指示。此外规定，向量中秩为`r`的元素，对应于内部数组中的`_elem[r]`，其物理地址为`_elem + r`。

### 默认构造函数

首先根据创建者指定的初始容量`c`向操作系统申请为`_elem[]`分配容量为`c`的空间，如果没有明确指定，则使用`DEFAULT_CAPACITY`。然后，由于新创建的向量中不包含任何元素，所以在未明确指定的情形下，把向量的规模`_size`设为0。最后，对`_elem[]`中的元素用`v`进行初始化。

### 复制构造函数

复制构造方法以某个已有的向量或数组作为蓝本，进行局部或者整体的克隆。在向量接口类中，有四个复制构造函数，它们均使用了`copyForm()`方法。[该函数](https://dsa.cs.tsinghua.edu.cn/~deng/ds/src_link/vector/vector_constructor_by_copying.h.htm)首先根据待复制区间的边界计算出新向量的初始规模，再以初始规模的两倍为`_elem[]`申请空间。最后通过一趟迭代将源向量（数组）中指定范围内的各个元素复制到新向量中。

注意，由于向量中的元素可能不是内置类型，因此这里有必要重载`operator=`操作符以适应自定义类型可能需要进行的赋值操作。重载的`operator=`操作符应当返回对当前（接受赋值）的对象的引用，以便于链式赋值。

复制构造函数的运行时间正比于区间的宽度，其时间复杂度为$\mathcal O (\rm{\underline{ } size})$。

### 析构函数

向量对象的析构函数只需要释放`_elem[]`的空间即可，因为只有它是由`new`申请出来的。

## 动态空间管理

使用数组来存储向量的元素有一个缺点：向量内部数组的容量是固定的，如果在数组填满之后向量还需要插入元素，那么就会造成溢出（上溢）。因此，可以考虑根据向量的规模动态地调整其容量。这里引入*装填因子*的概念：向量实际规模与其内部数组容量的比值，也即`_size/_capacity`，它是衡量向量空间利用率的重要指标。

为了实现动态空间管理，需要保证**向量的装填因子既不超过1，又不太接近于0**。

### 可扩充向量

扩充向量的原理很简单：如果内部仍有空余，那么插入操作可以正常进行，经过一次插入（删除）操作之后，可用空间都会减少（增加）一个单元。一旦可用空间耗尽，就动态地扩大内部数组的容量。

具体到操作方法上，由于数组的大小在初始化时就已经确定并且之后不可以进行更改，所以我们在扩充向量时需要重新申请一个容量更大的数组，并将原数组中的成员集体搬迁至新的空间，然后再将原数组释放掉。

基于以上策略，可以设计算法`expand()`。在调用`insert()`接口插入新元素之前，都要先调用该算法来检查内部数组的可用容量。一旦`_size == _capacity`，就将原数组替换为一个更大的数组。

```c++
template <typename T> void Vector<T>::expand() { //向量空间不足时扩容
   if ( _size < _capacity ) return; //尚未满员时，不必扩容
   if ( _capacity < DEFAULT_CAPACITY ) _capacity = DEFAULT_CAPACITY; //不低于最小容量
   T* oldElem = _elem;  _elem = new T[_capacity <<= 1]; //容量加倍
   for ( Rank i = 0; i < _size; i++ )
      _elem[i] = oldElem[i]; //复制原向量内容（T为基本类型，或已重载赋值操作符'='）
   delete [] oldElem; //释放原空间
}
```

#### 复杂度分析

向量每次由`n`扩容至`2n`，都需要花费$\mathcal O (n)$时间。在扩容后，至少还需要`n`次插入操作才需要再次扩容。也就是说，随着向量规模的不断扩大，在执行插入操作之前需要扩容的概率也会迅速降低。因此就某种平均意义来说，用于扩容的时间成本不至于很高。

考查对向量足够多次的连续操作，将其所消耗的时间分摊至所有的操作上，这样分摊平均至单次操作的时间成本被称为*分摊运行时间*。

*平均运行时间*的概念看似与分摊运行时间一样，实则有很大区别。平均运行时间是按照某种假定的概率分布，对各种（输入）情况下所需要的执行时间的加权平均，因此亦称作期望运行时间。而对于分摊运行时间来说，参与分摊的操作应当来自一个真实可行的、足够长的确定的操作序列。

接下来使用分摊分析的方法来分析向量插入操作的复杂度。

假定的`_elem[]`的初始容量和初始规模均为某一常数`N`。假设在此后需要连续进行`n`次操作，并且`n`远大于`N`。因此，在连续插入`n`个元素后，向量的规模`_size`应该变成`n + N`。根据向量扩充的策略，装填因子绝对不会超过100%，同时也不会低于50%。因此，在连续插入`n`个元素后，有下面的关系$\rm{\underline{ }size}\le\rm{\underline{ } capacity}<2\cdot\rm{\underline{ } size}$。

于是有：$\rm{\underline{ } capacity} = \Theta(\rm{\underline{ } size}) = \Theta(n + N) = \Theta(n)$。

向量的容量以2为比例按指数速度增长，在容量到达`_capacity`前，共做过$\Theta(\log_2n)$次扩容，每次扩容所需要的时间正比于向量当时的规模，并且同样以2为比例按指数速度增长。因此消耗于扩容的时间为：$\rm T(n)=2N + 4N + ... + \underline{ } capacity < 2\cdot \underline{ } capacity = \Theta(n)$。分摊到每次操作上，单次操作所需要的运行时间应为$\mathcal O (1)$。

### 向量的缩容

除了插入操作之外，影响向量的装填因子的另一因素就是删除操作。如果向量中的删除操作远多于插入操作，那么向量的装填因子很有可能远低于100%。当装填因子小于某个阈值时，称数组发生了*下溢*。

尽管下溢不是必须要解决的问题，但是它对空间利用率还是有着负面的影响。下面的代码给出了向量的动态缩容算法：

```c++
template <typename T> void Vector<T>::shrink() { //装填因子过小时压缩向量所占空间
   if ( _capacity < DEFAULT_CAPACITY << 1 ) return; //不致收缩到DEFAULT_CAPACITY以下
   if ( _size << 2 > _capacity ) return; //以25%为界
   T* oldElem = _elem;  _elem = new T[_capacity >>= 1]; //容量减半
   for ( Rank i = 0; i < _size; i++ ) _elem[i] = oldElem[i]; //复制原向量内容
   delete [] oldElem; //释放原空间
}
```

缩容算法的策略很简单：每次进行删除操作以后，如果算法的空间利用率降低到25%以下，就将容量减半。缩容算法的分摊复杂度同样为$\mathcal O (1)$。

在实际应用中，为了避免出现频繁交替扩容和缩容的情况，可以选择更低的阈值，或者直接禁止缩容。

尽管在分摊意义上向量的扩容和缩容操作效率很高，但是对某次具体的扩容或者缩容操作来说，其需要的时间的确会高达$\Omega (n)$。因此，在对单次操作速度及其敏感的应用场合上不能继续沿用上面的策略。
