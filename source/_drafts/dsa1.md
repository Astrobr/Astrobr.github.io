---
title: #数据结构与算法1
date: #2021-12-20 11:00:00
categories: 
	#- [CS]
	#- [cate2]
	#...
tags: 
	- Data Structure
	- Algorithm
	#...

#If you need a thumbnail photo for your post, delete the well number below and finish the directory.
#cover: https://astrobear.top/resource/astroblog/thumbnail/xxx
#thumbnail: https://astrobear.top/resource/astroblog/thumbnail/xxx

#If you need to customize your excerpt, delete the well number below and input something. You can also input <!-- more --> in your article to divide the excerpt and other contents.
excerpt: 绪论

#If you don't want to show the ToC (Table of Content) at sidebar, delete the well number below. 
#toc: false

#You can begin to input your article below now.

---

# 关于算法的基本概念

## 定义

算法是基于特定的计算机模型，旨在解决某一信息处理问题而设计的一个指令序列。

## 基本特性

### 输入与输出

任何算法都需要通过输入来获得某一问题的实例，并且通过输出来给出问题的解。

### 基本操作、确定性与可行性

- 基本操作：可以理解为计算机可以执行的，汇编语言中的一条命令，如`MOV`、`SUB`等
- 确定性与可行性：算法可以描述为由若干语义明确的基本操作组成的指令序列，且每一基本操作在对应的计算模型中均可兑现

### 有穷性与正确性

- 有穷性：算法在执行有限次基本操作之后会终止并且输出
- 正确性：算法给出的输出是正确的

#### 如何证明算法的有穷性与正确性

- 问题的有效规模：其定义由问题的具体形式决定，如算法中需要操作的元素个数、需要操作的bit位等
- 算法的单调性：问题的有效规模会随着算法的推进而递减
- 算法的不变性：算法在任何时候都满足问题的前提条件，并且当问题的有效规模缩减到0时依旧满足，此时不变性等价于正确性
- 证明算法有穷性和正确性的一个重要技巧就是从适当的角度审视整个计算过程，找到其中所具有的某种不变性和单调性

### 退化性和鲁棒性

- 退化性：算法可以处理各种极端的输入个例（退化情况）
- 鲁棒性：算法能够尽可能充分应对极端输入的情况

### 重用性

算法的总体框架可以便捷地推广到其他应用场合。

## 算法的效率问题

- 可计算性：算法应当是在有限时间内能给出结果的，应当是必然终止的，也即满足有穷性
- 难解性：算法满足有穷性但是花费的时间成本太高，这样的算法是难解的

# 算法的复杂度度量













