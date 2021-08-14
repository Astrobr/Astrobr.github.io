---
title: Python学习笔记
date: 2020-1-6 17:00:00
categories: 
	- [CS]
	#- [cate2]
	#...
tags: 
	- Python
	- Programming Language
	#...

#If you need a thumbnail photo for your post, delete the well number below and finish the directory.
thumbnail: https://astrobear.top/resource/astroblog/thumbnail/t4.png

#If you need to customize your excerpt, delete the well number below and input something. You can also input <!-- more --> in your article to divide the excerpt and other contents.
excerpt: 记录本人在学习Python时遇到的坑以及这门语言的特性。

#You can begin to input your article below now.

---

> 这篇文章主要记录本人在学习Python时遇到的坑以及这个语言的一些特性，内容以时间顺序整理，比较零散杂乱。对于从零开始的同学，请参考官方文档[Python 3.8.1 中文文档](https://docs.python.org/zh-cn/3/)或其他网络上的教程。本文章将持续更新。

### 19/9/14

- 注释方法：`#（一行注释）`，`“”“ ”“”（多行注释）`
- for循环：`for （变量） in （范围）`，范围可以用`range`函数
- `Input`函数的输入是`char`类型的
- `// `是整除运算
- 逗号不可以用来分隔语句
- 使用缩进（4个空格）来代替C/C++中的大括号

### 19/9/15

- `for...in`循环中，`_ `可以作为循环变量，这时候仅循环指定次数，而不需要关心循环变量的值；事实上，`_ `是一个合法的标识符，如果不关心这个变量，就可以将其定义成这个值，它是一个垃圾桶
- 定义函数时，使用`函数名(*参数名)`的定义方式， `*` 代表函数的参数是可变参数，可以有0到多个参数
- 一个文件代表一个模块(module)，若在不同的模块中含有同名函数，那么可以通过`import`导入指定的模块中的函数，如`from 模块 import 函数`，或者`import 模块 as 自定义模块名称`，再通过`自定义模块名称.函数`的方式调用
- `__name__`是Python中一个隐含的变量，代表了模块的名字，只用直接执行的模块的名字才是`__main__`
- 可以使用`global`指定使用的是一个全局变量，如果全局变量中没有找到对应的，那么会定义一个新的全局变量
- 嵌套作用域：对于函数a内部的函数b而言，a中定义的变量对b来说是在嵌套作用域中的，若要指定修改嵌套作用域中的变量，可以使用`nonlocal`指示变量来自嵌套作用域
- `pass`是一个空语句，只起到占位作用
- 可以定义一个`main`函数（或者与模块名字相同的函数），再按照`if __name__ = '__main__'`的格式使脚本执行

### 19/9/17

- 与字符串有关的函数的调用方式为：`字符串名称.字符串操作函数()`，在此时字符串是一个对象，字符串操作函数的作用是向字符串对象发送一个消息
- 字符串实质上是一个数组，可以进行下标运算
- 字符串切片可以在下标运算中使用冒号进行运算，`[起始字符:结束字符:间隔]`，若不定义起始与终止字符，则默认为整个字符串，当间隔为负值时，以为着切片操作反向
- 字符串的索引为负值时，意味着索引从右到左数
- 列表可以理解为一个数组，其操作与字符串类似
- 可使用`sorted`函数对列表进行排序
- 可以使用生成式语法创建列表：`f = [x for x in range(1, 10)]`（此方法在创建列表后元素已经准备就绪，耗费较多内存），或`f = (x for x in range(1, 10))`（此方法创建的是一个生成器对象，需要数据时列表通过生成器产生，节省内存但是耗费较多时间）
- 可以使用`yield`关键字来实现迭代，使用`yield`就是产生了一个生成器，每次遇到` yield `时函数会暂停并保存当前所有的运行信息，返回` yield `的值，并在下一次执行此方法是从当前位置开始运行
- 可以定义元组，其相当于不能修改的数组，一个元组中的元素数据类型可以不同，定义元组使用`t = ()`
- 列表和元组可以互相转换
- 可以定义集合，定义集合可以使用`set = {}`，元组可以转换为集合
- 字典类似于数组，但是它是由多组键值对组成的

### 19/9/19

- 使用class关键字定义类，再在类中定义函数，如：`class 类名(object)`
- `__init__`函数是用于在创建对象时进行的初始化操作
- self是类的本身，是它的实例变量，在类中所有函数的第一个参数就是self，在类中修改属性值需使用`self.属性值 = x`的语法
- 实例化类的方法：`对象名 = 类名(初始化函数参数)`
- 对象中方法的引用可以采用`对象.方法（也即函数）`的语句，通过此方式向对象发送消息
- Python中，属性和方法的访问权限只有`public`和`private`，若希望属性或方法是私有的，在给它们命名的时候要使用`__`开头，但是不建议将属性设置为私有的
- 使用`_`开头暗示属性或方法是受保护(protected)的，访问它们建议通过特定的方法，但实际上它们还是可以直接被外部访问
- 可以通过在类中定义方法以访问对象受保护的属性，在定义这些方法（函数）时，要在上一行使用`@property`包装这些方法
- 对于被保护的属性，在访问它们时采用`getter`方法，需添加`@property`，在修改它们时采用`setter`方法，需添加`@函数（即方法）名.setter`
- Python可以对对象动态绑定新的属性或方法
- 可以使用`__slots__`限定对象只能绑定某些属性，但是它只对当前类的对象生效，对子类不起作用
- 可以通过给类发送消息，在类的对象被创建出来之前直接使用其中的方法，此种方法被称为静态方法，需要在定义时添加`@staticmethod`，此类方法的参数不含有`self`
- 通过类方法可以获取类相关的信息并且可以__创建出类的对象__，需要在定义时添加`@classmethod`，类方法的第一个参数是`cls`，这个`cls`相当于就是在外部实例化类时定义的对象名，只不过它是放在类的内部使用了，其功能就是可以像在外部调用对象的属性和方法一样在类的内部使用对象（类）的属性和方法

### 19/9/20

- 类之间的关系：
  - is-a：继承或者泛化，如：__student__ is a __human being__，__cell phone__ is a __electronic device__
  - has-a：关联，如 __department__ has an __employee__
  - use-a：依赖，如 __driver__ use a __car__ 
- 类与类之间可以继承，提供继承信息的成为父类（超类或者基类），得到继承的称为子类（派生类或者衍生类）
- Python中继承的写法：`class 子类名(基类名)`
- 在编程中一般使用子类去替代基类
- 在子类中，通过重新定义父类中的方法，可以让同一种方法在不同的子类中有不同的行为，这称为重写

### 20/1/11

- Python中提供两个重要的功能：异常处理和断言（Assertions）来处理运行中出现的异常和错误，他们的功能是用于调试Python程序
- 异常：无法正常处理程序时会发生异常，是一个对象，如果不捕获异常，程序会终止执行
- Python中异常处理的写法：

```python
try: 
	#operation1
except exception_type, argument:
	#if error occurs in operation1, execute operation2
  #operation2
else: 
	#if no error occurs in operation1, execute operation3
  #operation3
```

- 使用`except`可以不带异常类型，但是会让`try-except`语句捕获所有的异常，不建议这样写
- 可以使用`expect(exception1[, expection2[, expection3]])`来添加多个异常类型
- `argument`为异常的参数，可以用于输出异常信息的异常值
- 也可以使用如下方法，但是与`try-except`有所不同：

```python
try:
	#operation1
finally:
	#in error occurs in operation1, directly execute operation2, otherwise, execute operation2 after operation1 finished
```

- `finally`和`except`不可以同时使用

- 可以使用`raise`触发异常
- `append()`方法用于在列表末尾添加新的对象，对于一个数组`list`，可以这样使用：`list.append()`
- 多线程用于同时执行多个不同的程序，可以把占据长时间的程序中的任务放到后台处理
- 线程与进程：独立的线程有自己的程序入口、执行序列、程序出口，但是线程不可以独立执行，必须依存在应用程序中，由应用程序提供多个线程执行控制
- 在Python中使用线程：`thread.start_new_thread(function, args[, kwargs])`，其中`function`为线程函数，这个函数需要提前定义好，`args`为传递给线程函数的参数，是一个元组，`kwargs`为可选参数，此种方式称为函数式，线程的结束一般靠函数的自然结束
- 此外还可以使用Python所提供的`threading`模块，直接从`threading.Thread`继承：`class myThread(threading.Thread)`，然后重写`__init__`和`run`方法，把需要执行的代码写到`run`方法里面，`__init__`的重写方法如下：

```python
def __init__(self, threadID, name, counter):
	threading.Thread.__init__(self)
	self.threadID = threadID
	self.name = name
	self.counter = counter
```

- 上述`thread`类提供了以下方法：
  - `run()`：表示线程活动的方法
  - `start`：启动线程
  - `join()`：等待直到线程终止
  - `isAlive()`：查询线程是否活动
  - `getName()`：返回线程名
  - `setName()`：设置线程名
- 为了避免两个或多个线程同时运行，产生冲突，可以使用线程锁来控制线程执行的优先顺序，被锁定的线程优先执行，其他进程必须停止
- 可以使用`threading.Lock().acquire()`和`threading.Lock().release()`来锁定和释放线程
- 可以建立一个空数组用于存放线程，再通过`append`方法将线程添加至该数组中，通过遍历数组可以对其中的线程做同样的操作
