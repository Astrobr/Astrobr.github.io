---
title: CS106L总结与C++的一些新特性
date: 2023-05-05 15:38:00
categories: 
  - CS
  #- cate2
  #...
tags: 
  - C++
  - Programming Language
  #...

#If you need a thumbnail photo for your post, delete the well number below and finish the directory.
cover: https://i.postimg.cc/Gp2qj0Y6/cpp.png
thumbnail: https://i.postimg.cc/Gp2qj0Y6/cpp.png

#If you need to customize your excerpt, delete the well number below and input something. You can also input <!-- more --> in your article to divide the excerpt and other contents.
excerpt: 最近看完了Stanford CS106L的课程，总结一下课程中学到的新知识，顺便加入课程中未提及的额外的C++新特性。

#If you don't want to show the ToC (Table of Content) at sidebar, delete the well number below. 
#toc: false

#You can begin to input your article below now.

---

> 这篇文章主要根据Stanford CS106L课程中的内容，对之前的博客[Accelerated C++笔记](https://astrobear.top/2021/09/16/acc_cpp笔记/)进行一些补充

### auto关键字

- `auto`意味着由编译器自动推断出类型，如果对象的类型是什么不太重要时，可以使用`auto`
- 一些使用场景：
  - 在声明某个容器的迭代器时使用`auto`可以避免输入冗长的类型
  - 在初始化表达式已经能够清晰体现对象类型时
  - 在泛型lambda的参数中（C++14起）
- `auto`必须能够根据初始化表达式推导类型，因此`auto a;`是非法的。C++14起函数也可以使用`auto`推导返回类型，但是否使用仍需考虑可读性
- `auto`会丢弃引用和顶层`const`，但会保留底层`const`。如果需要引用或只读引用，可以使用`auto&`或`const auto&`；需要严格保留表达式类型时可以考虑`decltype(auto)`

### std::pair与结构绑定

- `std::pair`用于将两个任意类型的对象绑定起来
  - 声明与初始化：`std::pair<T1, T2> p = {field1, field2};`
  - 使用`p.first`和`p.second`来访问`pair`中的对象
  - 可以使用`std::make_pair(field1, field2)`来构造一个`pair`
  - 可以使用`pair`作函数返回值，同时返回函数状态（成功？/失败？）以及需要的结果（值）
- 结构化绑定：直接使用`auto`和中括号获取`pair`中的内容，例如对上面声明的`p`，可以这样获得其中的内容：`auto [field1, field2] = p;`。结构化绑定也可以用于数组和其他满足条件的类型

### 关于stream的更多知识

- `stream`是对字符输入和输出的抽象，可以连接终端、文件、字符串等不同的数据源或目的地；其中字符串流可以用于字符串与格式化数据之间的转换
- 关于输出流：`<<`操作符会把对象格式化后写入输出流。输出内容可能经过缓冲，但并不一定要等到`std::endl`才输出；`std::endl`会插入换行符并强制刷新流
- `std::getline(std::istream& stream, std::string& str)`可以和`>>`混用，但要注意`>>`可能在输入序列中留下换行符，可以使用`ignore()`或`std::ws`进行处理
- 关于流的状态位：
  - Good bit：`std::ios_base::goodbit`的值为0，表示当前没有设置任何错误状态
  - Fail bit：`std::ios_base::failbit`，表示格式化提取等操作失败（例如要求读入一个`int`却收到了无法解析的字符）。在调用`clear()`清除状态前，后续大多数输入操作会直接失败
  - EOF bit：`std::ios_base::eofbit`，表示读取时遇到了输入序列末尾；普通空格不会设置该状态
  - Bad bit：`std::ios_base::badbit`，表示底层设备、缓冲区或其他通常不可恢复的I/O错误
  - `eofbit`可以和`failbit`同时出现；`fail()`在`failbit`或`badbit`被设置时返回`true`
- `std::cin >> value`是标准的格式化输入方式。如果一次提取失败，通常需要调用`clear()`清除状态，并丢弃输入序列中导致失败的内容后再继续读取
- 关于`stringstreams`
  - 使用`stringstreams`之前要先定义对象，如：`std::istringstream iss("blah blah");`，`std::ostringstream oss;`
  - `std::istringstream`：从字符串中读取字符，并通过`>>`等操作将其解析为指定类型的数据
  - `std::ostringstream`：将数据格式化后写入字符串，使用`oss.str()`取得结果

### 通用初始化与std::initializer_list

- 通用初始化（Uniform Initialization）可以用于初始化内置类型、容器和自定义类型。假设自定义类`Student`具有匹配的三参数构造函数，那么可以使用`Student s{"Yaju", "JP", 24};`的方式初始化；花括号初始化还可以阻止一部分窄化转换
- 通用初始化可以嵌套使用
- `std::initializer_list<T>`可以用于接受含有同种类型元素的列表，其中的元素是只读的
  - 如果自定义类定义了接受`std::initializer_list<T>`的构造函数，就可以用同类型元素的花括号列表进行初始化。它是initializer-list构造函数，不是拷贝构造函数
  - 也可以使用`std::initializer_list`传递函数参数

### STL序列容器对比

这里主要是对比一下`std::vector`、`std::deque`、`std::list`几个序列容器：

常见操作的复杂度可以粗略总结如下，其中“中间插入/删除”是否快速取决于是否已经持有目标位置的迭代器：

| 操作 | `std::vector` | `std::deque` | `std::list` |
| --- | --- | --- | --- |
| 首部插入/删除 | O(n) | O(1) | O(1) |
| 尾部插入/删除 | 插入均摊O(1)，删除O(1) | O(1) | O(1) |
| 随机访问 | O(1) | O(1) | 不支持；线性遍历为O(n) |
| 中间插入/删除 | O(n) | O(n) | 已知位置时O(1)，查找位置为O(n) |
| 存储特点 | 连续存储，额外开销较低 | 分段连续存储 | 每个节点需要额外保存链接指针 |

`std::list`还支持`splice`，可以在满足条件时高效地转移节点。迭代器失效规则需要针对具体操作分别判断，不能直接等同于容器的线程安全性；对同一个容器进行并发修改通常仍需要外部同步。

- `std::vector`：向量
- `std::list`：双向链表

- `std::deque`：双端队列，支持随机访问，并允许在首尾两端快速插入/删除

绝大部分情况下用`std::vector`就可以了。

### #include "xxx.cpp"的作用以及编译过程

在CS106L的课程中，是在模板类中涉及到`#include "xxx.cpp"`这样的操作。模板的定义通常必须在实例化点可见，因此模板声明和定义经常都放在头文件中。如果想在代码层面分离，也可以将定义写入`.tpp`或`.ipp`等实现文件，再由头文件将其包含进来；除此之外还可以使用显式实例化或C++模块等方案。

普通`.cpp`文件一般应该作为独立翻译单元参与编译，而不是被其他源文件直接`include`。直接包含`.cpp`可能造成重复定义、内部符号冲突和构建依赖混乱。少数构建系统会使用Unity Build，将多个源文件合并成一个翻译单元以减少编译开销并给编译器提供更多上下文，但这是一种专门的构建策略，并不意味着包含`.cpp`一定能改善运行时性能。

下面给出编译过程：

- 预处理：从一个源文件形成翻译单元，处理`#include`、宏和条件编译等预处理指令。预处理不会展开内联函数
- 编译：输入`.i`，得到汇编代码
- 汇编：输入`.s`，将汇编指令转为机器码
- 链接：输入`.o`目标文件以及所需的库，解析符号引用并完成重定位
- 最后得到可执行文件；`.exe`是Windows常见的扩展名，Linux和macOS上的可执行文件通常没有固定扩展名

### using、typedef及其作用域

- 定义一般类型的别名时没有区别，定义模板的别名只能用`using`
- 通常使用`using`就可以了
- `using`声明可以出现在块、类或命名空间作用域中，其有效范围取决于声明所在的作用域

### 范围for循环

对于一个容器，使用其迭代器自动迭代：

```cpp
std::vector<int> vec{1, 2, 3, 4, 5};

for (const auto& value : vec) {
	std::cout << value << std::endl;
}
```

- 范围`for`中声明的是元素变量而不是迭代器。上例中的`value`是当前元素的只读引用；如果需要修改容器中的值，应使用`auto& value`，如果确实需要复制每个元素则可以使用`auto value`
- 范围`for`不仅支持标准容器，也支持数组以及能够通过成员函数或参数依赖查找取得`begin`和`end`的类型
- 迭代过程中需要能够对迭代器解引用、递增，并与结束迭代器或哨兵进行比较

### 运算符重载与仿函数（functor）

- 对于作为成员函数重载的二元运算符，左操作数对应`*this`，因此调用该运算符时对象位于左侧。一元运算符以及`operator()`、`operator[]`等运算符需要分别理解

- 非成员函数的重载运算符若需要访问类的私有成员，可以将其声明为`friend`

- 仿函数（functor）：重载`()`运算符的类，也叫函数对象

  - 通过使用对象维护某些操作中重复出现的值，使语法更加简洁

  - 可以在函数中调用这个仿函数对象来进行特定的操作，使用仿函数（本质是一个类的实例）时的方法就像使用函数一样，调用仿函数的函数负责为仿函数提供需要的参数

- 一部分仿函数功能也可以使用函数指针实现，它们都属于可调用对象，可以独立调用，也可以作为参数传给算法；不过函数指针不能像有状态的仿函数那样直接保存上下文

### lambda表达式

- lambda表达式常用于替代仿函数或作为算法的可调用参数；只有不捕获变量的lambda才能转换为兼容的普通函数指针
- 其形式为

```cpp
auto func_name = [captures](type_name parameter) -> return_type { body };
```

- lambda引入符和捕获列表：`[]`表示接下来是lambda表达式，其中可以声明需要捕获的上下文变量
  - `[]`表示不捕获任何变量
  - `[var]`、`[&var]`分别表示按值/按引用捕获变量
  - `[=]`、`[&]`分别表示对lambda实际需要的局部变量默认按值/按引用捕获，并不是无条件捕获父作用域中的所有变量
  - 按值捕获的变量默认不能在lambda函数中修改，可以在参数列表后加上`mutable`关键字以修改lambda内部的副本，但不会改变外部原变量
- 参数列表：用于声明函数体中需要用到的参数及其类型
- 返回值是可选的

### for_each

- `for_each`提供了另一种遍历语义
- 调用形式为：`std::for_each(first, last, callable);`
- 第一、二个参数是容器的迭代器，分别指向需要操作的元素范围的起点和终点
- 第三个参数可以接受满足要求的可调用对象，例如函数指针、仿函数或lambda表达式；`std::function`是可以包装这些可调用对象的一种类型

### Special member functions

对于一个类`A`，共有6个：

- 默认构造函数：`A();`或`A() = default;`

- 拷贝构造函数：`A(const A& other);`

  拷贝构造函数使用已有对象初始化新对象，应使新对象具有与原对象等价且符合类型所有权语义的状态，不一定是简单地复制全部成员所占的内存

- 拷贝赋值函数：`A& operator=(const A& rhs);`

  函数通常返回引用以实现连续赋值。实现需要正确处理自我赋值，但不一定必须显式比较地址，例如copy-and-swap可以天然保证安全；管理资源时还要避免在成功取得新资源之前破坏旧状态

- 移动构造函数：`A(A&& other);`

  常见签名使用非`const`右值引用，以便转移资源。命名变量`other`在表达式中是左值，因此在移动其成员时通常需要使用`std::move`，但基本类型等成员直接复制即可。移动后源对象必须保持有效，但其具体状态通常未指定

- 移动赋值函数：`A& operator=(A&& rhs);`

  除转移资源外，还要正确处理目标对象原来持有的资源和可能的自移动；具体实现不一定需要显式进行地址比较

- 析构函数：`~A();`或`~A() = default;`

### 深拷贝与浅拷贝

- 浅拷贝通常指逐成员复制，使新旧对象中的指针等成员指向同一资源；编译器生成的拷贝是逐成员拷贝，并不等同于对整个对象直接进行`memcpy`
- 如果类通过裸指针独占动态资源，通常需要在复制时重新分配并复制资源，使两个对象独立拥有各自的资源，这就是深拷贝。但类中存在指针并不必然要求深拷贝：非拥有指针、共享所有权等情况应根据实际语义决定

### 左/右值，左/右值引用

- 左值是具有身份、能够定位到某个对象或函数的表达式；不能简单地用“表达式结束后是否存在”来定义
- 右值包括纯右值（prvalue）和将亡值（xvalue）。右值对应的临时对象同样可能拥有存储空间，因此不能说右值“没有分配内存”
- 字符字面量如`'a'`是纯右值，而字符串字面量如`"abc"`是数组类型的左值
- 左值引用`&`通常绑定左值，右值引用`&&`通常绑定右值；引用只是已有对象的别名，绑定引用本身既不是深拷贝也不是浅拷贝
- 移动构造或移动赋值可以利用右值即将不再使用的特点转移资源，但是否以及如何转移由类型本身的实现决定
- `const &`同样可以接受右值

### 移动语义

- 对于之后不再依赖其原有值的对象，可以使用`std::move`将表达式转换为将亡值，使移动构造或移动赋值重载有机会被选择，尤其适用于持有大量资源的对象
- `std::move`本身不会移动或释放任何资源，它本质上进行值类别转换。真正的资源转移由移动构造/赋值函数完成；移动后的源对象仍然有效，但其状态通常未指定

### Rule of three、five与zero

- Rule of three：如果资源管理语义要求手动定义析构函数、拷贝构造函数或拷贝赋值函数中的一个，通常也需要考虑另外两个
- Rule of five：C++11加入移动语义后，还需要同时考虑移动构造函数和移动赋值函数。默认构造函数不属于这条规则，因此总数是五个而不是六个
- 某些特殊成员函数可以使用`=default`或`=delete`明确表达意图，并不是定义其中一个就必须实现其余所有函数
- Rule of zero：优先让标准容器、字符串和智能指针等RAII类型管理资源，从而不需要手动定义这些特殊成员函数

### std::optional

- `std::optional`是一个模板类，其中可以含有一个`T`类型的值，也可以不含值（此时可以用`std::nullopt`表示）。它用于表达“可能存在也可能不存在的值”，常用于替代特殊哨兵值或某些可空返回结果
- 成员函数（接口）：
  - `value()`：返回其中保存的值或抛出`bad_optional_access`异常
  - `value_or()`：返回其中保存的值或默认值
  - `has_value()`：如果其中有值则返回`true`，否则返回`false`

### RAII与智能指针

- 程序中发生的一些异常可能导致之前申请的动态内存没有被释放

- RAII：Resource Acquisition Is Initialization，将资源的生命周期绑定到对象的生命周期，在对象初始化时取得资源，并在析构时自动释放。这里的资源包括动态分配的内存、文件、锁等

- 针对内存而言，可以使用智能指针实现RAII，避免显式使用`new`、`delete`

- 有三种智能指针：

  - `std::unique_ptr`：不能被复制，只有它自己能管理它所指向的资源，当它离开自己的作用域时它和它指向的资源都被释放，使用`std::make_unique<T>()`初始化，不能拷贝构造或拷贝赋值，但是可以进行移动构造或移动赋值
  - `std::shared_ptr`：可以被复制，多个对象共享资源所有权；当最后一个拥有该资源的`std::shared_ptr`被销毁或重置时资源会被释放。通常使用`std::make_shared<T>()`初始化，但要注意由`shared_ptr`组成的引用环可能导致资源无法释放
  - `std::weak_ptr`：不拥有资源，也不会增加强引用计数，用于观察由`std::shared_ptr`管理的资源。它可以从兼容的`std::shared_ptr`或`std::weak_ptr`构造或赋值；访问资源前应调用`lock()`取得`std::shared_ptr`

- 例：

  ```c++
  std::unique_ptr<T> up = std::make_unique<T>();
  std::shared_ptr<T> sp = std::make_shared<T>();
  std::weak_ptr<T> wp = sp;
  ```



