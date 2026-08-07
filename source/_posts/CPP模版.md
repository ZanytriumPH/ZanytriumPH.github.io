---
title: C++ 模版
date: 2026-03-20 15:33:21
tags: [C++]
categories: [C++]
description: "- C++ 的另一种编程思想称为 泛型编程，主要利用的技术就是模板"
---

> 多态的一种形式，“类属多态”

- C++ 的另一种编程思想称为 **泛型编程**，主要利用的技术就是模板
- C++ 提供两种模板机制：**函数模板** 和 **类模板**

## 1 函数模版

### 1.1 语法

```cpp
template<typename T>
void mySwap(T &a, T &b)
{
    T temp = a;
    a = b;
    b = temp;
}
```

- `template` 声明创建模板
- `typename` 表示其后面的符号是一种数据类型，可以**用 `class` 替换**
- `T` 通用的数据类型，名称可以替换，通常为大写字母

两种函数模版的使用方式：

```cpp
int main()
{
    int a = 2, b = 3;
    mySwap(a, b); // 自动类型推导
    mySwap<int>(a, b); // 显示指定类型
}
```

### 1.2 注意事项

- ==自动类型推导，必须推导出一致的数据类型 T 才可以使用==
- 模板必须要确定出 T 的数据类型才可以使用

```cpp
void test()
{
    int a = 2;
    char c = '1';
    // mySwap(a, c); // Err，自动类型推导，必须推导出一致的数据类型 T 才可以使用
}
```

> 当然，如果用显式类型转换也是可以的 `mySwap(a, (int)c);`

```cpp
template<class T>
void func()
{
    cout << typeid(T).name() << endl;
}
void test()
{
    // func(); // Err，模板必须要确定出 T 的数据类型才可以使用
    func<string>(); // 显示指定类型
}
```

### 1.3 普通函数 VS 函数模版

- ==普通函数 调用可以发生隐式类型转换==
- 函数模版 如果用**自动类型推导，不可以发生隐式类型转换**
- 函数模版 如果用**显示指定类型，可以发生隐式类型转换**

```cpp
int add1(int a, int b)
{
    return a + b;
}

template<class T>
T add2(T a, T b)
{
    return a + b;
}

void test()
{
    int a = 2; char c = 'a';
    cout << add1(a, c) << endl; // OK，输出 99
    // cout << add2(a, c) << endl; // Err
    cout << add2<int>(a, c) << endl; // OK，输出 99
    cout << add2<char>(a, c) << endl; // OK，输出 c
}
```

### 1.4 普通函数与函数模版的调用规则

- 如果函数模版和普通函数**都可以实现，优先调用普通函数**
- 可以通过==空模版参数列表来强制调用函数模版==
- ==函数模版也可以发生重载==
- ==如果函数模版可以产生更好的匹配，优先调用函数模版==

```cpp
void myPrint(int a)
{
    cout << "common" << endl;
}

template<class T>
void myPrint(T a)
{
    cout << "template" << endl;
}

template<class T>
void myPrint(T a, T b)
{
    cout << "override template" << endl;
}

void test()
{
    int a = 10;
    myPrint(a); // common
    myPrint<>(a); // template
    myPrint(a, a); // override template
    char b = '1'; myPrint(b); // template
}
```

> 实际开发中，有模版就不要再写普通函数了

### 1.5 模版具体化（特化）

考虑这样以下场景

```cpp
template<class T>
bool myComp(T a, T b)
{
    return a == b;
}

void test()
{
    const char* p1 = "hello";
    const char* p2 = "hello";
    cout << myComp(p1, p2) << endl; // 输出 ？
}
```

> 输出实则不确定

这里比较的是地址，如果编译器有优化则相同，否则不同（如果是用 `new char[]` 则一定不同）

而实际上想要比较的是内容，而针对这种==特殊行为的添加可以使用模版具体化==

```cpp
template<>  // 特化标志：空模板参数列表（表示「不需要泛化参数，针对具体类型」）
返回值类型 函数名<具体类型>(参数列表) {  // 函数名后用 <具体类型> 指定特化类型
    // 该类型的专属逻辑
}
```

```cpp
template<class T>
bool myComp(T a, T b)
{
    return a == b;
}

template<> // 空模板参数列表
bool myComp<const char*>(const char* p1, const char* p2)
{
    return strcmp(p1, p2) == 0;
}
```

当然，如果是类，==若没有对 == 操作符进行重载也无法使用该函数模板，也可以通过特化来实现==

## 2 类模版

### 2.1 语法

```cpp
template<class T>
class 类名
```

```cpp
template<class nameType, class ageType>
class Person
{
public:
    nameType name;
    ageType age;
    Person(nameType name, ageType age)
    {
        this->name = name;
        this->age = age;
    }
};

void test()
{
    Person<string,int> p("Tom",10);
}
```

### 2.2 参数

- ==类模版在模版参数列表中可以有默认参数==

```cpp
template <class T = int>
class Stack
{
    T buffer[100];
public:
    void push(T x) {}
};

Stack st1; // 不显示指定，为默认参数类型 int
Stack <double> st2;
```

- 可以带普通参数，但一般放在类型参数之后

```cpp
template <class T, int size>
class Stack
{     T buffer[size];
public:
    void push(T x) {}
};

Stack<int, 100> st1; // 使用时需要显式实例化（不然 100 怎么推）
```

### 2.3 类模板中成员函数创建时机

- 普通类中的成员函数一开始就可以创建
- **类模版中的成员函数在调用时才创建**

```cpp
class Person1
{
public:
    void show1() { cout << "p1" << endl; }
};

class Person2
{
public:
    void show2() { cout << "p2" << endl; }
};

template<class T>
class MyClass
{
public:
    T obj;
    void func1() { obj.show1(); }
    void func2() { obj.show2(); }
};

void test()
{
    MyClass<Person1> obj;
    obj.func1(); // OK
    // obj.func2(); // Err
}
```

可以通过编译，即使 Person1 没有 show2 ，因为该成员函数还未创建，在调用时才会创建

### 2.4 类模板对象做函数参数

类模板实例化的对象，一共有三种向函数传参的方式

1. **指定传入的类型**：直接显示对象类型
2. 参数模板化：将对象中的参数变为模板进行传递
3. 整个类模板化：将这个对象类型模板化进行传递

```cpp
template<class T1, class T2>
class Person
{
public:
    T1 name;
    T2 age;
    Person(T1 name, T2 age) : name(name), age(age){}
};

// 1.指定传入类型
void printP1(Person<string, int>&p)
{
    cout<< "Name: " << p.name << endl;
}

// 2.参数模板化
template<class T1, class T2>
void printP2(Person<T1, T2>&p)
{
    cout<<typeid(T1).name()<<" "<<typeid(T2).name()<<endl;
}

// 3.整个类模板化
template<class T>
void printP3(T &p)
{
    cout<<typeid(p).name();
}

void test()
{
    Person<string,int>p("Tom",10);
    printP1(p);
    printP2(p);
    printP3(p);
}
```

> 第一种方式最常用

### 2.5 类模板与继承

当类模板遇到继承时，需要注意：

1. ==当子类继承的父类是一个类模板时，子类在声明的时候要指定出父类中的 T 类型==，否则编译器无法给子类分配内存
2. ==如果想灵活指定父类中的 T 类型，子类也需变为类模板==，并在子类模板中指定出父类模板中的 T 类型

```cpp
template <class T>
class Base
{
    T m;
};

// class Son : public Base {}; // Err
class Son1 : public Base<int> {}; // OK

template <class T1, class T2> // T1 T2
class Son2 : public Base<T1>
{
    T2 obj;
};

void test()
{
    Son1 s1; // int m
    Son2<int, string> s2; // int m, string obj
}
```

### 2.6 类模板成员函数的类外实现

类模板中的成员函数类外实现时，需要==加上模版参数列表==

```cpp
template <class T1, class T2>
class Person
{
public:
    T1 name;
    T2 age;
    Person(T1 name, T2 age);
    void show();
};

// 构造函数类外实现
template <class T1, class T2>
Person<T1, T2>::Person(T1 name, T2 age) : name(name), age(age) {}

template <class T1, class T2>
void Person<T1, T2>::show()
{
    cout << "Name and Age: " << name << " " << age << endl;
}

int main()
{
    Person<string, int> p("Tom",10);
    p.show();
}
```

### 2.7 类模板分文件编写

问题：

- **类模板中成员函数==创建时机是在调用阶段==，导致分文件编写时链接不到**

```cpp
// Person.h
#pragma once
#include <iostream>
using namespace std;

template <class T1, class T2>
class Person
{
public:
    T1 name;
    T2 age;
    Person(T1 name, T2 age);
    void show();
};

// Person.cpp
#include "Person.h"

template <class T1, class T2>
Person<T1, T2>::Person(T1 name, T2 age) : name(name), age(age) {}

template <class T1, class T2>
void Person<T1, T2>::show()
{
    cout << "Name and Age: " << name << " " << age << endl;
}

// main.cpp
#include "Person.h"

int main()
{
    Person<string, int> p("Tom",10);
    p.show();
}
```

一运行就崩了

解决：

- 直接包含 .cpp 源文件

```cpp
// main.cpp
#include "Person.cpp"
// ... OK
```

- **将声明和实现写到同一个文件中**，后缀名 ==.hpp== (约定俗成)

> 主流的方法，C++ 中模板的完整定义通常出现在头文件中

### 2.8 类模板与友元

- 全局函数类内实现：直接在类内声明友元即可

```cpp
template <class T1, class T2>
class Person
{
    // 全局函数类内实现
    friend void show(Person<T1, T2> p)
    {
        cout << p.name << " " << p.age << endl;
    }

    T1 name;
    T2 age;
public:
    Person(T1 name, T2 age) : name(name), age(age) {}
};

int main()
{
    Person<string, int> p("Tom",10);
    show(p);
}
```

> 类内部用 friend 声明的函数，本质是外部函数（全局函数或其他类的成员函数），而非当前类的成员

- 全局函数类外实现：**需要提前让编译器知道全局函数的存在**

```cpp
// 类模板前向声明
template <class T1, class T2>
class Person;

// 模板友元函数声明，当然也可以放声明，后面再实现
template <class T1, class T2>
void show(Person<T1, T2>& p)
{
    cout << p.name << " " << p.age << endl;
}

template <class T1, class T2>
class Person
{
    // 全局函数类外实现
    // 友元声明时加 <>，绑定第一步声明的模板函数
    friend void show<>(Person<T1, T2>& p);

    T1 name;
    T2 age;
public:
    Person(T1 name, T2 age) : name(name), age(age) {}
};
```

> 建议使用全局函数类内实现的方式

## 3 补充

### 杂杂

- ==是否实例化模板的某个实例由使用点来决定==；如果未使用到一个模板的某个实例，则编译系统不会生成相应==实例的代码==

- **类模板中的静态成员属于实例化后的类**
  - `vector<int>` `vector<double>` 各有 static，因为分开编译，各有自己的一段代码

### if constexpr

```cpp
template <typename T> std::string autoToString(T val) {
    if (std::is_same_v<T, std::string>) { // T 为 string 类型
        return val;
    } else { // T 为数字类型
        return std::to_string(val);
    }
}
```

先看这个代码，如果 `T` 为 `string` 类型，则返回 `val`，若为 `int` 返回 `to_string(val)`，但编译上均有问题

- 若 `T` 为 `string`，else 分支的 `to_string(val)` 方法不能传入 `string`，编译出错
- 若 `T` 为 `int`，if 分支的返回值类型是 int，但这个函数返回值是 `string`，编译出错

核心是 **用运行时的普通 if 处理模板的编译期类型分支，导致无效分支的代码编译报错**

使用 `if constexpr` 可以解决，让编译器在编译期丢弃无效分支，直接删掉与类型无关的代码

> 实际上这不是一个运行阶段的 `if else`，而是编译阶段的 `if else` 分支选择

```cpp
template <typename T> std::string autoToString(T val) {
    if constexpr (std::is_same_v<T, std::string>) {
        return val;
    } else {
        return std::to_string(val);
    }
}
int main() {
    std::cout << typeid(autoToString(20)).name(); // string
}
```

if constexpr 是编译时判断，if 是运行时判断，所以 if constexpr 的条件必须是编译时就能确定的，否则编译出错

### 元编程（MetaProgramming）

是一种编程范式，核心定义是：让程序在 “编译期” 或 “运行时” 将 “代码本身作为数据来操作”

C++ 以编译期元编程为核心，主要是利用==模板元编程==

> 功能强大，但实则很少使用

```cpp
template <int N>
class Fib
{
public:
    enum { value = Fib<N-1>::value + Fib<N-2>::value };
};

template <> // 全特化
class Fib<0>
{
public:
    enum { value = 1 };
};

template <>
class Fib<1>
{
public:
    enum { value = 1 };
};

int main()
{
    std::cout << Fib<8>::value << std::endl;
}
```

```cpp
template <int N>
constexpr int Fib()
{
    if constexpr (N <= 1)
    {
        return 1;
    }
    else
    {
        return Fib<N-1>() + Fib<N-2>();
    }
}
```

### 编译期类型推导 auto

- 必须初始化，否则无法推导，编译器报错
- ==默认情况下 auto 推导出的类型是值拷贝==

```cpp
    vector<int> v = {1, 2, 3};
    for (auto i : v)
    {
        i = i * 2; // 无效修改
    }

    for (auto& i : v)
    {
        i = i * 2; // 有效修改
    }
```

- 默认**丢弃引用和顶层 const 限定符**

```cpp
    const int a = 5;
    // a = 20; // Err
    auto a_auto = a; // int
    a_auto = 10; // OK

    int b = 15;
    int& c = b;
    c = 20;
    cout << b << endl; // 20
    auto c_auto = c; // int
    c_auto = 25;
    cout << b << endl; // 20
```

- 不会忽略底层 const（==指针指向的内容==）

```cpp
    const char* s = "Hello World!";
    auto s_auto = s;
    // s_auto[1] = 'h'; // Err
    s_auto = "hello"; // OK
```

`const char*`: const 修饰的是 char（字符串内容），而非 *s（指针本身）

故可以修改指针本身，但不能修改其指向的内容

```cpp
    char* const s = "Hello World!";
    auto s_auto = s;
    s_auto[1] = 'h'; // Are you OK ?
```

再补充一点，这段代码编译器不会报错，但运行时会报错，s 的内容存放在只读区内存，而 auto 丢弃顶层 const，试图修改只读内存而导致运行时错误
