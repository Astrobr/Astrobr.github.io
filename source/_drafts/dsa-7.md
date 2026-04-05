---
title: DSA-7：列表及其接口设计1
date: 2022-4-12 21:50:00
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
cover: https://i.postimg.cc/bwq6sSvy/dsa.webp
thumbnail: https://i.postimg.cc/bwq6sSvy/dsa.webp

#If you need to customize your excerpt, delete the well number below and input something. You can also input <!-- more --> in your article to divide the excerpt and other contents.
excerpt: 列表就是链表。

#If you don't want to show the ToC (Table of Content) at sidebar, delete the well number below. 
#toc: false

#You can begin to input your article below now.

---

## 从向量到列表

向量采用“循秩访问”的方式，可以通过秩直接访问对应元素。列表与向量同属于序列结构的范畴，其中的元素也构成一个线性逻辑次序。但是与向量极为不同的是，列表中元素的物理地址可以是任意的。

为了保证对列表元素访问的可行性，逻辑上互为前驱和后继的元素之间，应当维护某种索引关系。这种索引索引关系，可以抽象地理解为被索引元素的位置。因此列表元素是“循位置访问”。索引还可以理解为通往被索引元素的链接，因此也可以被称作是“循链接访问”。

列表结构相比于向量，在解决某些问题时有其独有的优势，可以弥补向量结构在功能和性能方面的不足。

### 从静态到动态

数据结构支持静态和动态两种操作，静态操作仅从中获取信息，后者则会修改数据结构的局部甚至整体。

向量采用的就是静态的存储策略，可以在$\mathcal O(1)$时间内由秩确定向量元素的物理地址，但是在添加或者删除元素时，会伴随着$\mathcal O(n)$元素的移动。

列表结构要求元素在逻辑上具有线性次序，但是对其物理地址并未作任何限制——这就是采用了“动态存储”的策略。在生命周期内，动态存储的数据结构将随着内部数据的需要，相应地分配或回收局部的数据空间。为了实现这一功能，该类结构需要使用指针或者引用的方法，来确定各个元素实际的物理地址。

采用动态存储的策略可以大大降低动态操作的成本。

### 由秩到位置

相对应的，采用动态存储的策略时，静态操作的性能会有所下降。

以列表为例，为了访问秩为`r`的元素，我们只能顺着相邻元素之间的指针，从某一端出发逐个扫描各个元素，经过`r`步迭代之后才能确定该元素的物理存储位置。这意味着，原先只需要$\mathcal O(1)$时间的静态操作，此时的复杂度也将线性正比于被访问元素的秩，在最坏情况下等于元素总数`n`。即使在各个元素被访问概率相等的情况下，平均而言也需要$\mathcal O(n)$时间。

对于采用动态存储策略的数据结构，应该通过位置而非秩来指代并访问其中的数据元素。列表中的位置是指代各数据元素的一个标识性指标，借助它可以便捷地得到元素的物理存储地址。各个元素的位置，通常可以表示和实现为联结与元素之间的指针和引用。

### 列表

与向量一样，列表也是由线性逻辑次序的一组元素构成的集合：

$L = \{ a_0, a_1, ..., a_{n-1} \}$

列表是链表结构的一般化推广，其中的元素称作节点，分别由特定的位置或者链接指代。与向量一样，在元素之间也可以定义前驱、直接前驱、后继、直接后继。相对于任意元素，也有定义对应的前缀、后缀等子集。

## 列表的基本接口

由上面的叙述可知，列表节点除了需要保存对应的数据项，还需要记录其前驱和后继的位置。因此这里首先设计列表节点对象，然后通过基本的节点去构建列表。

### 列表节点

列表节点对象应该支持下面的操作接口：

|     操作接口      |                      功能                       |
| :---------------: | :---------------------------------------------: |
|      `data`       |            当前节点所存储的数据对象             |
|      `pred`       |             当前节点前驱节点的位置              |
|      `succ`       |             当前节点后继节点的位置              |
| `insertAsPred(e)` | 插入前驱节点，存入被引用对象`e`，返回新节点位置 |
| `insertAsSucc(e)` | 插入后继节点，存入被引用对象`e`，返回新节点位置 |

根据上表的内容，可以设计`ListNode`模板类如下：

```c++
using Rank = int; //秩
template <typename T> struct ListNode;
template <typename T> using ListNodePosi = ListNode<T>*; //列表节点位置
template <typename T> struct ListNode { //列表节点模板类（以双向链表形式实现）
// 成员
   T data; ListNodePosi<T> pred; ListNodePosi<T> succ; //数值、前驱、后继
// 构造函数
   ListNode() {} //针对header和trailer的构造
   ListNode ( T e, ListNodePosi<T> p = NULL, ListNodePosi<T> s = NULL )
      : data ( e ), pred ( p ), succ ( s ) {} //默认构造器
// 操作接口
   ListNodePosi<T> insertAsPred ( T const& e ); //紧靠当前节点之前插入新节点
   ListNodePosi<T> insertAsSucc ( T const& e ); //紧随当前节点之后插入新节点
};
```

### 列表

列表对象应该支持下面的操作接口：

|               操作接口                |                      功能                      | 适用对象 |
| :-----------------------------------: | :--------------------------------------------: | :------: |
|               `size()`                |         报告列表当前的规模（节点总数）         |   列表   |
|          `first()`、`last()`          |              返回首、末节点的位置              |   列表   |
| `insertAsFirst(e)`、`insertAsLast(e)` |            将`e`当作首、末节点插入             |   列表   |
|   `insertA(p, e)`、`insertB(p, e)`    |      将`e`当作节点`p`的直接后继、前驱插入      |   列表   |
|              `remove(p)`              |        删除位置`p`处的节点，返回其数值         |   列表   |
|            `disordered()`             |         判断所有节点是否已按非降序排列         |   列表   |
|               `sort()`                |       调整各节点的位置，使之按非降序排列       |   列表   |
|               `find(e)`               |       查找目标元素`e`，失败时返回`NULL`        |   列表   |
|              `search(e)`              |  查找目标元素`e`，返回不大于`e`且秩最大的节点  | 有序列表 |
|            `deduplicate()`            |                  剔除重复节点                  |   列表   |
|             `uniquify()`              |                  剔除重复节点                  | 有序列表 |
|             `traverse()`              | 遍历并统一处理所有节点，处理方法由函数对象决定 |   列表   |

根据上表的内容，可以设计`List`模板类如下：

{% codeblock lang:C++ >folded %}

template <typename T> class List { //列表模板类

private:
   int _size; ListNodePosi<T> header; ListNodePosi<T> trailer; //规模、头哨兵、尾哨兵

protected:
   void init(); //列表创建时的初始化
   int clear(); //清除所有节点
   void copyNodes ( ListNodePosi<T>, int ); //复制列表中自位置p起的n项
   ListNodePosi<T> merge ( ListNodePosi<T>, int, List<T> &, ListNodePosi<T>, int ); //归并
   void mergeSort ( ListNodePosi<T> &, int ); //对从p开始连续的n个节点归并排序
   void selectionSort ( ListNodePosi<T>, int ); //对从p开始连续的n个节点选择排序
   void insertionSort ( ListNodePosi<T>, int ); //对从p开始连续的n个节点插入排序
   void radixSort(ListNodePosi<T>, int); //对从p开始连续的n个节点基数排序

public:
// 构造函数
   List() { init(); } //默认
   List ( List<T> const& L ); //整体复制列表L
   List ( List<T> const& L, Rank r, int n ); //复制列表L中自第r项起的n项
   List ( ListNodePosi<T> p, int n ); //复制列表中自位置p起的n项
// 析构函数
   ~List(); //释放（包含头、尾哨兵在内的）所有节点
// 只读访问接口
   Rank size() const { return _size; } //规模
   bool empty() const { return _size <= 0; } //判空
   T& operator[] ( Rank r ) const; //重载，支持循秩访问（效率低）
   ListNodePosi<T> first() const { return header->succ; } //首节点位置
   ListNodePosi<T> last() const { return trailer->pred; } //末节点位置
   bool valid ( ListNodePosi<T> p ) //判断位置p是否对外合法
   { return p && ( trailer != p ) && ( header != p ); } //将头、尾节点等同于NULL
   ListNodePosi<T> find ( T const& e ) const //无序列表查找
   { return find ( e, _size, trailer ); }
   ListNodePosi<T> find ( T const& e, int n, ListNodePosi<T> p ) const; //无序区间查找
   ListNodePosi<T> search ( T const& e ) const //有序列表查找
   { return search ( e, _size, trailer ); }
   ListNodePosi<T> search ( T const& e, int n, ListNodePosi<T> p ) const; //有序区间查找
   ListNodePosi<T> selectMax ( ListNodePosi<T> p, int n ); //在p及其n-1个后继中选出最大者
   ListNodePosi<T> selectMax() { return selectMax ( header->succ, _size ); } //整体最大者
// 可写访问接口
   ListNodePosi<T> insertAsFirst ( T const& e ); //将e当作首节点插入
   ListNodePosi<T> insertAsLast ( T const& e ); //将e当作末节点插入
   ListNodePosi<T> insert ( ListNodePosi<T> p, T const& e ); //将e当作p的后继插入
   ListNodePosi<T> insert ( T const& e, ListNodePosi<T> p ); //将e当作p的前驱插入
   T remove ( ListNodePosi<T> p ); //删除合法位置p处的节点,返回被删除节点
   void merge ( List<T> & L ) { merge ( header->succ, _size, L, L.header->succ, L._size ); } //全列表归并
   void sort ( ListNodePosi<T> p, int n ); //列表区间排序
   void sort() { sort ( first(), _size ); } //列表整体排序
   int deduplicate(); //无序去重
   int uniquify(); //有序去重
   void reverse(); //前后倒置（习题）
// 遍历
   void traverse ( void (* ) ( T& ) ); //遍历，依次实施visit操作（函数指针，只读或局部性修改）
   template <typename VST> //操作器
   void traverse ( VST& ); //遍历，依次实施visit操作（函数对象，可全局性修改）
}; //List

{% endcodeblock %}

## 列表的基本接口（其一）

### 头、尾节点

列表中存在有头节点和尾节点，它们是私有的，对外界不可见。如果存在对外部可见的数据节点，则其中的第一个和最后一个节点分别称作首节点和末节点。列表对象内部的组成及逻辑结构如下图所示：

![列表的结构](https://i.postimg.cc/k5sNzTNK/dsa-7-1.png)

就内部结构而言，头节点紧邻于首节点之前，尾节点紧邻于末节点之后。这类封装之后从外部不可见的节点，称作哨兵节点。此处的两个哨兵节点被等效地视作`NULL`。

设置了哨兵节点之后，对于从外部可见的任一节点而言，其前驱和后继在列表内部都必然存在。这使得相关算法不必再对各种边界退化情况做专门的处理，从而避免了出错的可能，还带来了许多的便利。

### 默认构造方法

创建`List`对象时，默认构造方法将调用下面的统一初始化过程`init()`。该函数完成了以下工作：

- 在列表内部创建了头、尾哨兵节点
- 将头哨兵节点的前驱设为`NULL`，后继设为尾哨兵节点
- 将尾哨兵节点的后继设为`NULL`，前驱设为头哨兵节点
- 将列表规模置零

新创建出来的`List`对象如下图所示，其对外的有效部分初始为空，哨兵节点对外不可见，此后插入的新节点都将在两哨兵节点之间。

![新创建的列表的结构](https://i.postimg.cc/mrBNmv9T/dsa-7-2.png)

`init()`函数也会在列表的其他构造方法中被调用。该函数只需运行常数时间。

列表的析构函数由于需要调用类中其他的接口，所以将在下一篇博客中给出。

### 由秩到位置

列表偶尔可能需要使用秩来指定列表节点，因此这里通过重载操作符`[]`的方式设计一个转换接口。

```c++
template <typename T> //重载下标操作符，以通过秩直接访问列表节点（虽方便，效率低，需慎用）
T& List<T>::operator[] ( Rank r ) const { //assert: 0 <= r < size
   ListNodePosi<T> p = first(); //从首节点出发
   while ( 0 < r-- ) p = p->succ; //顺数第r个节点即是
   return p->data; //目标节点，返回其中所存元素
}
```

这段代码的功能非常明显：要确定秩为`r`的元素的位置，只需要从首节点出发顺着后继指针向后移动`r`步即可。由此，该算法的时间复杂度为$\mathcal O (\rm r)$。可以看出，相比于向量的同类接口，列表在使用秩访问指定元素时时效率十分低下。

当$\rm{r > n/2}$时，从尾哨兵节点出发沿前驱指针向前查找可以在一定程度上减少查找次数。但是就总的平均效率而言，这一改进并无实质性意义。

### 查找

列表中有两个查找接口，分别是`find(e)`和`find(e, n, p)`。前者为整体查找，后者为区间查找。前者作为后者的特例，可以直接调用后者，因此这里考虑后者的实现。代码如下：

```c++
template <typename T> //在无序列表内节点p（可能是trailer）的n个（真）前驱中，找到等于e的最后者
ListNodePosi<T> List<T>::find ( T const& e, int n, ListNodePosi<T> p ) const {
   while ( 0 < n-- ) //（0 <= n <= rank(p) < _size）对于p的最近的n个前驱，从右向左
      if ( e == ( p = p->pred )->data ) return p; //逐个比对，直至命中或范围越界
   return NULL; //p越出左边界意味着区间内不含e，查找失败
} //失败时，返回NULL
```

该查找算法是顺序查找方法，时间复杂度应是$\mathcal O (\rm n)$，线性正比于查找区间的宽度。



