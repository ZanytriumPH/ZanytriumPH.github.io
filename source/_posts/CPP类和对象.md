---
title: C++ 类和对象
mathjax: true
date: 2026-03-18 17:47:55
categories: C++
tags: C++
---

## 1 封装

> `C++` 面向对象三大特性：==封装、继承、多态==

万事万物皆为对象，对象有其**属性**和**行为**

具有相同性质的对象可以抽象称为类

**封装的意义**：

- 将属性和行为作为一个整体，表现生活中的事物

- 将属性和行为加以权限控制

**语法**：`class 类名{ 访问权限: 属性 / 行为 };`

### 1.1 将属性和行为作为整体表现事物

```cpp
class Person
{
public: // 公共权限
    // 属性
    string name;
    // 行为
    void sleep()
    {
        cout << "sleeping" << endl;
    }
};


int main()
{
    Person p1; // 实例化
    p1.name = "Tom";
    p1.sleep();
    return 0;
}
```

类中的属性和行为统称为**成员**

- 属性：成员变量 / 成员属性
- 行为：成员函数 / 成员方法

**实例化**：使用类创建具体对象的过程

### 1.2 访问权限

| 访问权限   | 类内 | 类外 | 子类|
| ---------- | ---- | ---- |---- |
| public     | √    | √    | √   |
| protected  | √    | ×    | √   |
| private    | √    | ×    | ×   |

```cpp
class Person
{
public:
    string name;

protected:
    string car;

private:
    string password;

public:
    void func(){
        name = "Tom";
        // 类内可以访问
        car = "Benz";
        password = "123456";
    }
};

int main()
{
    Person p1;
    p1.name = "Tom";
    // 类外无法访问
    // p1.car = "Benz";
    // p1.password = "123456";
}
```

### 1.3 struct 和 class 的区别

`struct` 和 `class` 的唯一区别是默认的访问权限不同

- `struct` 默认权限为 `public`
- `class` 默认权限为 `private`

#### 成员变量设置为私有

**意义**：

- 控制读写权限
- 检测数据有效性

```cpp
class Person
{
private:
    int pAge;

public:
    void setAge(int age)
    {
        if (age < 0 || age > 150){
            cout << "invalid age" << endl;
            return;
        }
        pAge = age;
    }
    int getAge()
    {
        return pAge;
    }
}
```

### 1.4 其他

- 某些情况下判断两个对象是否相等，可以使用全局函数（传两个参数），也可使用成员函数（此时只需要传一个参数）

- 一个类中可以让另一个类作为成员
  
- 在类定义中描述数据成员时一般不能给它们赋初值，数据成员的初始化应在类的构造函数
  
- ==在声明数据成员的类型时，如果未见到相应的类型定义或相应的类型未定义完，则该数据成员的类型一般只能是这些类型的指针或引用类型==

```cpp
class A; // A 是在程序其他地方定义的类，这里是声明
class B
{ 
    A a; // Error，未见 A 的定义，其所需内存空间大小未知
    B b; // Error，B 还未定义完，形成递归定义
    A *p; // OK
    B *q; // OK
    A &aa; // OK
    B &bb; // OK
};
```

- 对象的创建：
  - 直接：`类名 对象名;`，称**静态对象**
  - 间接：**`new` 运算符**：动态创建对象，返回指向对象的指针，称**动态对象**
- 对象的操作
  - 静态对象：`对象名.成员`
  - 动态对象：`对象指针->成员` 或 `*对象指针.成员`

## 2 对象的初始化和清理

### 2.1 构造函数和析构函数

对象的初始化和清理是编译器强制要做的，如果不提供构造函数和析构函数，编译器会提供默认的（空实现）构造函数和析构函数

- **构造函数**：创建对象时对成员属性赋值，由编译器自动调用，无需手动调用

- **析构函数**：在对象销毁前系统自动调用，用于清理工作

**构造函数语法**：`类名(){}`

- 无返回值也不写 void（无返回类型）
- 函数名与类名相同
- 可以无参数，也可以有参数，因此**可以发生重载**
- 程序执行时自动调用且只调用一次

**析构函数语法**：`~类名(){}`

- 无返回值也不写 void（无返回类型）
- 函数名与类名相同，在名称前加上`~`
- **不可以有参数**，因此**不可以发生重载**
- 程序执行结束时自动调用且只调用一次

```cpp
#include <iostream>
using namespace std;
class Person
{
public:
    Person()
    {
        cout<<"Person constructor"<<endl;
    }
    ~Person()
    {
        cout<<"Person destructor"<<endl;
    }
};

void test1()
{
    Person p; // 栈上的数据，test1 执行完毕后，释放这个对象
}

int main()
{
    // test1(); // 既有构造函数输出也有析构函数输出
    Person p1; // 只有构造函数输出
    system("pause");
    return 0;
}
```

#### 构造函数补充

- 带默认参数值的构造函数

```cpp
class A
{ 
    int x,y;
public:
    // A()
    // { 
    //     x = y = 0;
    // }
    // A(int x1)
    // { 
    //     x = x1; y = 0;
    // }
    // A(int x1,int y1)
    // { 
    //     x = x1; 
    //     y = y1;
    // }
    A(int x1=0,int y1=0) // 具有三个构造函数的效果
    { 
        x = x1; 
        y = y1;
    }
};
```

- 类的构造函数一般是公开的，但有时也==把构造函数声明为私有的，其作用是限制创建该类对象的范围，这时，只能在本类和友元==中创建该类对象

- ==**在创建动态的对象数组时，只能用默认构造函数来进行初始化**==
  
- 如果用库函数 `malloc` 来创建动态对象，则系统不会去调用对象类的构造函数对其初始化，因此，动态对象一般不用 `malloc` 来创建

#### 析构函数补充

有些情况下，我们并不撤销对象，只是归还对象所申请的资源，这时，我们可以通过显式地调用对象类的析构函数来实现

`对象名.~类名(); //eg. tst.~Test();`

### 2.2 构造函数的分类及调用

**两种分类方式**：

- 按**参数**分为：有参构造和无参构造
- 按**类型**分为：普通构造和拷贝构造

**三种调用方式**：

- 括号法
- 显示法
- 隐式转换法

```cpp
#include <iostream>
using namespace std;
class Person
{
    int age;
public:
    Person()
    {
        cout<<"Person default constructor"<<endl;
    }
    Person(int a)
    {
        age = a;
        cout<<"Person parameterized constructor"<<endl;
    }
    Person(const Person &p)
    {
        age = p.age;
        cout<<"Person copy constructor"<<endl;
    }
    ~Person()
    {
        cout<<"Person destructor"<<endl;
    }
};

void test1() // 调用
{
    Person p1; // 默认其实都一样
    // 1.括号法
    Person p2(18); // 有参
    Person p3(p2); // 拷贝
    // 2.显示法
    Person p4 = Person(18); // 有参
    Person p5 = Person(p4); // 拷贝，赋值操作符
    // 3.隐式转换法
    Person p6 = 18; // 有参
    Person p7 = p6; // 拷贝，赋值操作符
}
```

**注意**：

- 使用**括号法调用默认构造函数时，不要加`()`**，如 `Person p1()` ，编译器会认为是一个函数声明，而不是创建对象

- 形如 `Person(18)` `Person(p5)` 称为**匿名对象**，特点是当前行执行结束后，系统会立刻回收。**不要利用拷贝构造函数初始化匿名对象**，编译器会认为 `Person(p5)` 等价于 `Person p5`，是一个对象的声明

### 2.3 拷贝构造函数的调用时机

拷贝构造函数的原型是：`<类名>(const <类名>&);`

C++中拷贝构造函数调用时机通常有三种情况

- 使用一个已经创建完毕的对象来初始化一个新对象

- **值传递**的方式给**函数参数传值**

- 以**值方式返回局部对象**

#### (1) 使用一个已经创建完毕的对象来初始化一个新对象

```cpp
void test1()
{
    Person p1(18);
    Person p2(p1);
}
```

输出：

```cpp
Person parameterized constructor
Person copy constructor
Person destructor
Person destructor
```

#### (2) 值传递的方式给函数参数传值

```cpp
void func1(Person p) {}
void test2()
{
    Person p;
    func1(p);
}
```

输出：

```md
Person default constructor
Person copy constructor
Person destructor
Person destructor
```

#### (3) 以值方式返回局部对象

```cpp
Person func2()
{
    Person p1;
    return p1;
}
void test3()
{
    Person p = func2();
}
```

（期望）输出：

```md
Person default constructor
Person copy constructor
Person destructor
Person destructor
```

但经过编译器**返回值优化**（`RVO`）实际上不会输出中间的两行，除非使用 `return Person(p1);` 显式创建一个临时对象

### 2.4 构造函数调用规则

默认情况下，C++编译器给每个类都添加至少3个函数

1. 默认构造函数（无参，函数体为空）
2. 默认析构函数（无参，函数体为空）
3. 默认拷贝构造函数，对属性进行值拷贝

构造函数调用规则如下：

- 如果用户定义有参构造函数，编译器不再提供默认无参构造函数，但仍会提供默认拷贝构造函数

- 如果用户定义了拷贝构造函数，编译器不再提供其他普通构造函数

#### (1) 如果用户定义有参构造函数，编译器不再提供默认无参构造函数，但仍会提供默认拷贝构造函数

```cpp
class Person
{
    int age;
public:
    Person(int a)
    {
        age = a;
        cout<<"Person parameterized constructor"<<endl;
    }
    ~Person()
    {
        cout<<"Person destructor"<<endl;
    }
};

void test1()
{
    Person p; // 报错：缺少默认构造函数
}
void test2()
{
    Person p1(18);
    Person p2(p1); // 拷贝构造可用
}
```

#### (2) 如果用户定义了拷贝构造函数，编译器不再提供其他普通构造函数

```cpp
class Person
{
    int age;
public:
    Person(const Person &p)
    {
        age = p.age;
        cout<<"Person copy constructor"<<endl;
    }
    ~Person()
    {
        cout<<"Person destructor"<<endl;
    }
};

void test1()
{
    Person p; // 报错：缺少默认构造函数
}
void test2()
{
    Person p1(18); // 报错
}
```

总结：有你就没别的，自下往上:

- 默认构造函数
- 有参构造函数
- 拷贝构造函数

### 2.5 深拷贝与浅拷贝

浅拷贝：简单的赋值拷贝操作（默认拷贝构造函数就是浅拷贝）

深拷贝：在堆区重新申请空间，进行拷贝操作

```cpp
class Person
{
    int age;
    int *height;
public:
    Person(int a,int h)
    {
        age = a;
        height = new int(h); // 向堆区申请空间
        cout<<"Person parameterized constructor"<<endl;
    }
    ~Person()
    {
        // 析构函数重要作用：手动释放在堆区开辟的数据
        delete height;
        height = nullptr; // 防止野指针出现
        cout<<"Person destructor"<< endl;
    }
};

void test()
{
    Person p1(18,160);
    Person p2(p1); // 默认拷贝构造函数，浅拷贝
}
```

输出：

```md
Person parameterized constructor
Person destructor

进程已结束，退出代码为 -1073740940 (0xC0000374)
```

退出代码意为堆内存损坏，在这里其原因是双重释放

||p1 |p2|
|---|---|---|
|age|18|18|
|height|0x19ee8bc1a80|0x19ee8bc1a80|
|*height|160|160|

由栈的先进后出，`test()` 调用完毕后，先释放 `p2`，再释放 `p1`，导致 `p1` 释放时又重复释放了 `p2` 的堆区数据

修正方法：在原代码基础上，**重写拷贝构造函数**，实现深拷贝

```cpp
Person(const Person &p)
{
    age = p.age;
    height = new int(*p.height); // 深拷贝，申请另一块空间
}
```

总结：**如果类中有属性在堆区开辟的，一定要自己提供拷贝构造函数，防止浅拷贝带来的问题**

#### 补充：动态对象数组的创建与撤消

```cpp
A *p;
p = new A[100];
delete  []p;
```

- **使用 new 时，不能显式初始化，相应的类必须有默认构造函数**
- delete 中的 `[]` 不能省

##### 动态二维数组

```cpp
const int ROWS = 3; 
const int COLUMNS = 4;
 
char **chArray2; 

// allocate the rows 
chArray2 = new char* [ROWS]; 

// allocate the (pointer) elements for each row 
for (int row = 0; row < ROWS; row++) 
    chArray2[row] = new char[COLUMNS]; 

// delete
for (int row = 0; row < ROWS; row++) 
{ 
    delete [] chArray2[row]; 
    chArray2[row] = NULL; 
} 

delete [] chArray2; 
chArray2 = NULL; 
```

### 2.6 初始化列表

作用：初始化属性

语法：`构造函数() : 属性1(值1), 属性2(值2) ... {}`

> 注意这个**冒号**不要丢！

注意：在成员初始化表中，成员初始化的书写次序并不决定它们的初始化次序，数据成员的**初始化次序**由它们在类定义中的**声明次序决定**

```cpp
class Person
{
    int age;
    int height;
public:
    // 传统初始化操作
    // Person()
    // {
    //     age = 18;
    //     height = 160;
    // }
    // Person(int a,int h)
    // {
    //     age = a;
    //     height = h;
    // }
    
    // 初始化列表
    Person(): age(18), height(160){}
    Person(int a, int h): age(a), height(h){}
};
```

### 2.6+ 初始化表补充

==执行上，先于构造函数体==。在运行阶段，可以减轻编译器的负担，提高效率

类成员的初始化时机：在进入构造函数体之前，所有成员（包括类成员）已完成创建（分配内存）。因此：

- ==初始化表：成员在创建时直接初始化（一次完成）==
- ==构造函数体赋值：成员先默认初始化（可能是垃圾值、默认构造），再通过赋值语句修改（两次操作）==

这是初始化表所有优势的底层逻辑

```cpp
class MyClass
{
public:
    // 默认构造（无参）：模拟开销
    MyClass()
    {
        cout << "MyClass default construct(overhead)" << endl;
    }
    // 带参构造：直接初始化
    MyClass(int x)
    {
        cout << "MyClass para construct(x=" << x << ")" << endl;
    }
    // 赋值运算符：模拟开销
    MyClass& operator=(const MyClass& other)
    {
        cout << "MyClass operator=(overhead)" << endl;
        return *this;
    }
};

// 测试类：用两种方式初始化 MyClass 成员
class Test1
{
    MyClass obj; // 类类型成员
public:
    // 方式 1：构造函数体赋值
    Test1()
    {
        obj = MyClass(10); // 先默认构造 obj，再赋值
    }
};

class Test2
{
    MyClass obj;
public:
    // 方式 2：成员初始化表
    Test2() : obj(10){} // 直接调用 MyClass(10) 初始化 obj，无默认构造和赋值
};

int main()
{
    cout << "creat Test1 obj" << endl;
    Test1 t1;
    cout << "\ncreat Test2 obj" << endl;
    Test2 t2;
}
```

输出：

```md
creat Test1 obj
MyClass default construct(overhead)
MyClass para construct(x=10)
MyClass operator=(overhead)

creat Test2 obj
MyClass para construct(x=10)
```

#### 必须使用初始化列表的场景

（1）**常量数据成员**、**引用数据成员**

不能在声明时对它们进行初始化，也不能采用赋值操作对它们进行初始化

```cpp
class A
{
    int x;
    const int y = 1; // Error
    int& z = x; // Error
public:
    A()
    {
        x = 0;  // OK
        y = 1;  // Error，y 是常量成员，其值不能改变
        z = &x; // Error，z 不是指针
    }
};
```

但可以在初始化列表中进行初始化

```cpp
class A
{
    int x;
    const int y;
    int& z;
public:
    A(): y(1), z(x) // OK
    {
    }
};
```

（2）**对象成员**

- 对象成员没有默认构造函数，必须通过初始化列表进行初始化

若类成员没有默认构造函数（无参构造），则该成员无法默认初始化，必须在创建时调用其带参构造函数——只能通过初始化表实现。

- 若想调用对象成员的构造函数，必须使用成员初始化表

考虑类 A 作为 类 B 的对象成员，在类 B 的构造函数体中，无法直接调用 A 的构造函数——因为构造函数体执行时，成员对象 A 已经完成了初始化（默认调用无参构造），此时再操作 A 只能是「赋值」，而非「初始化」

> 这两种情况的本质是一样的：初始化列表的初始化时机早于构造函数体，而构造函数体无法操作已经初始化的成员对象；而构造函数体执行时，成员对象已经完成了初始化

（3）**子类**

逻辑上与对象成员相同，下面直接用表格总结

|核心规则|成员对象场景（B 包含 A）|继承场景（B 继承 A）|
|---|---|---|
|初始化顺序|先初始化 A（成员对象），再执行 B 的构造函数体|先初始化 A（基类），再执行 B 的构造函数体|
|构造函数调用方式|只能在初始化表指定 A 的构造（无参 / 带参）|只能在初始化表指定 A 的构造（无参 / 带参）|
|无默认构造时的处理|必须在初始化表调用 A 的带参构造（否则报错）|必须在初始化表调用 A 的带参构造（否则报错）|
|构造函数体的作用|只能对 A 做赋值，不能初始化（A 已构造）|只能对 A 的成员做赋值，不能初始化（A 已构造）|

#### 补充之扩展

C++ 的其他成员初始化方式

- 就地成员初值
  
```cpp
struct S {
  int x = 0;     // 就地成员初值
  S() : x(42) {} // 如果没有这个那么x=0, 否则会覆盖掉
};
```

- 统一初始化

```cpp
int x{0};                // 标量
std::vector<int> v{1,2}; // 容器
S s{1, "abc"};           // 聚合或匹配构造
```

注意：相比于 `()` 或 `=`，`{}` 的初始化方式更安全，有窄化检查，不会发生「窄化转换」

```cpp
double d = 3.14;
int a(d);  // OK，可能静默截断
int b = d; // OK，可能静默截断
int c{d};  // 报错：窄化   
```

### 2.7 类对象作为类成员

C++ 类中的成员变量可以是另一个类的对象，我们称该成员变量为**对象成员**

```cpp
class Phone
{
    string phoneName;
public:
    Phone(string pName)
    {
        phoneName = pName;
        cout << "Phone constructor" << endl;
    }
    ~Phone()
    {
        cout << "Phone destructor" << endl;
    }
};

class Person
{
    string name;
    Phone phone;
public:
    Person(string n,string pN): name(n),phone(pN)
    {
        cout << "Person constructor" << endl;
    }
    ~Person()
    {
        cout << "Person destructor" << endl;
    }
};

void test()
{
    Person p("dio","onePlus");
}
```

输出：

```md
Phone constructor
Person constructor
Person destructor
Phone destructor
```

总结：

- 构造函数的顺序：**先调用对象成员的构造，再调用本类的构造**
- 析构函数的顺序：与构造函数的顺序相反
  
==当一个对象包含多个成员对象时，对成员对象构造函数的**调用次序**由成员对象在类中的**声明次序**来决定==，与它们在成员初始化表中的声明次序无关；析构函数依然相反

#### 包含成员对象的类的拷贝构造函数

需要注意的是，当类定义中包含成员对象时，**系统提供的默认拷贝构造函数会去调用成员对象的拷贝构造函数，但自定义的拷贝构造函数则默认地去调用成员对象的默认构造函数**，而不是去调用成员对象的拷贝构造函数

```cpp
class A
{
    int x, y;
public:
    A() { x = y = 0; }
    void inc()
    {
        x++;
        y++;
    }
};

class B
{
    int z;
    A a;
public:
    B() { z = 0; }
    B(const B& b) { z = b.z; }
    void inc()
    {
        z++;
        a.inc();
    }
};
// ···
B b1;     // b1.z = b1.a.x = b1.a.y = 0
b1.inc(); // b1.a.x = b1.a.y = b1.z = 1
B b2(b1); // b2.z = 1，但 b2.a.x = b2.a.y = 0
```

为了保证 b2 与 b1 一致，**应在自定义拷贝构造函数的成员初始化表中显式地指出调用成员对象类的拷贝构造函数**：

`B(const B& b): a(b.a) { z = b.z; }`

### 2.8 静态成员

在成员变量或成员函数前加上 `static` 关键字，则称为静态成员

静态成员分为：

- 静态成员变量
  - 所有对象共享同一份数据
  - 在编译阶段分配内存 (存储在全局 / 静态存储区)
  - 类内声明，类外初始化
- 静态成员函数
  - 所有对象共享同一个函数
  - 静态成员函数只能访问静态成员变量

#### 静态成员变量

1. ==所有对象共享同一份数据==
2. 在编译阶段分配内存 (存储在全局 / 静态存储区)
3. ==类内声明，类外初始化==

```cpp
class Person
{
public:
    static int A;
};
// 类内声明，类外初始化
int Person::A = 100; // 记得最前面先写类型

void test1()
{
    Person p;
    cout << p.A << endl; // 如果无类外初始化则报错

    Person anotherP;
    anotherP.A = 200;
    cout << p.A << endl; //所有对象共享一份数据，变 200
}
```

静态成员变量不属于某个对象上，所有对象共享同一份数据

因此**静态成员变量有两种访问方式**

1. 通过对象访问
2. 通过类名访问

```cpp
void test2()
{
    // 通过对象访问
    Person p;
    cout << p.A << endl; 
    // 通过类名访问
    cout << Person::A << endl; 
}
```

**静态成员变量也有访问权限**，如果设置为私有，即使在类外初始化，类外也不能使用

#### 静态成员函数

1. 所有对象共享同一个函数
2. ==**静态成员函数只能访问静态成员（变量、函数）**==

```cpp
class Person
{
    static int A;
    int B;
public:
    static void func()
    {
        A = 200; // 静态成员函数可以访问静态成员变量
        // B = 300; // 报错，静态成员函数不可以访问非静态成员变量
        // 静态成员变量和函数是 “唯一” 的，如果访问非静态成员变量，无法区分是哪个对象的
        cout << "static void func" << endl;
    }
};
int Person::A = 100;

void test1() // 同样有两种访问方式
{
    // 通过对象访问
    Person p;
    p.func();
    // 通过类名访问
    Person::func();
}
```

静态成员函数的访问方式和静态成员变量一样，有两种访问方式：通过对象访问和通过类名访问

静态成员函数也有访问权限，如果设置为私有，类外无法访问

#### 静态成员函数补充

**静态成员函数没有隐藏的 this 指针参数**，这是因为静态成员函数是对静态数据成员进行操作，而静态数据成员是某类对象共享的，它们只有一个拷贝，因此，**静态成员函数不需要知道某个具体对象**

静态成员函数不能访问非静态成员变量，因为非静态成员变量是属于某个具体对象的，而静态成员函数没有 this 指针参数

> So，静态成员变量？

静态成员变量没有 this 指针

- **this 指针是一个隐含的指针，仅存在于非静态成员函数中**（非静态成员变量属于对象的，故也没有this），指向当前对象的实例（即调用该函数的具体对象）
- 静态成员变量属于类本身，而非类的某个实例。它在内存中只有一份拷贝，被所有类的对象共享，不与任何具体对象绑定

| 成员类型               | 是否有 this | 归属主体       | 访问方式（推荐）               | 内存特点                                   |
|------------------------|------------------|----------------|--------------------------------|--------------------------------------------|
| 非静态成员变量         | 无               | 类的**对象实例** | 通过对象（如`obj.var`）或`this`（函数内） | 每个对象拥有独立副本，对象创建时分配内存    |
| 静态成员变量           | 无               | **类本身**     | 通过类名（如`ClassName::var`） | 整个类仅1份副本，程序启动时（静态区）分配  |
| 非静态成员函数         | 有               | 类的**对象实例** | 通过对象（如`obj.func()`）     | 类共享1份函数代码，调用时需绑定对象（`this`指向该对象） |
| 静态成员函数           | 无               | **类本身**     | 通过类名（如`ClassName::func()`） | 类共享1份函数代码，不依赖任何对象实例      |

#### 案例1：对象个数统计

在程序执行的某个时刻，有时需要知道创建了多少个某类对象（还未消亡）

为了实现这个功能，我们可以在类中定义一个用来计数的静态数据成员，每创建一个该类的对象
就把这个静态数据成员的值加 1，每撤销一个该类的对象就把该静态数据成员的值减 1

在程序运行的任何时刻，通过该静态数据成员，我们就可以知道某时刻该类对象的个数

```cpp
class A
{
    static int obj_count; // 记录创建的对象个数
public:
    A() { obj_count++; }
    A(const A& a) { obj_count++; }
    ~A() { obj_count--; }
    static int get_num_of_objects() { return obj_count; } // 获得对象的个数

};
int A::obj_count = 0; // 把创建的对象数初始化为 0
```

#### 案例2：单例模式

单例模式（Singleton Pattern）是一种常用的软件设计模式，其目的是==确保一个类只有一个实例，并提供一个全局访问点来获取该实例==

```cpp
class  singleton
{
protected:
    // 保护构造函数，防止外部直接创建实例
    singleton() = default; // singleton(){}
    singleton(const singleton &);
public:
    // 获取单例实例的静态方法
    static singleton * instance()
    {
        // 懒汉式创建：第一次调用时才创建实例
        return  m_instance == nullptr ?
            m_instance = new singleton : m_instance;
    }
    static void destroy()  { delete m_instance; m_instance = nullptr; }
private:
    static singleton * m_instance;
};
// 静态成员的类外初始化
singleton * singleton ::m_instance= nullptr; 
```

Resource Control 原则："谁创建，谁归还" ：创建资源的代码应该负责释放该资源

- 在单例模式中：虽然构造函数是 protected，但 `instance()` 方法实际创建了对象，因此提供了对应的 `destroy()` 方法，避免内存泄漏和资源浪费

## 3 C++对象模型和this指针

### 3.1 成员变量和成员函数分开存储

在 C++ 中，类内的成员变量和成员函数分开存储

==只有非静态成员变量才属于类的对象上==

```cpp
class Person {};

void test1()
{
    Person p;
    cout << "size of p = " << sizeof(p) << endl; // 1
}
```

==空对象占用内存空间 1 个字节==

编译器会给每个空对象都分配一个字节空间，为了区分空对象占内存的位置

每个空对象也应该有一个独一无二的内存地址

```cpp
class Person
{
    int A; // 非静态成员变量，属于类的对象上

    static int B; // 静态成员变量，不属于类的对象上

    void func1(){} // 非静态成员函数，不属于类的对象上

    static void func2(){} // 静态成员函数，不属于类的对象上
};

void test1()
{
    Person p;
    cout << "size of p = " << sizeof(p) << endl; // 4 对于 int A
}
```

### 3.2 this指针

每一个非静态成员函数只会诞生一份函数实例，也就是说多个同类型的对象会共用一块代码

那么这一块代码如何区分哪个对象调用自己？

C++通过提供特殊的对象指针 `this` 来完成这个区分

**`this` 指针指向被调用的成员函数所属的对象**

`this` 指针是隐含每一个非静态成员函数内的一种指针

`this` 指针不需要定义，直接使用即可

`this` 指针的用途：

- 当形参和成员变量同名时，可用 `this` 指针来区分
- 在类的非静态成员函数中**返回对象本身**，可使用 `return *this` ( this 指向被调用的成员函数所属的对象，再解引用)

```cpp
class Person
{
public:
    int age;
    Person(int age)
    {
        // age = age; // 报错：二元运算符 '=' 作用于相同的操作数
        this->age = age; // this 指针指向被调用的成员函数所属的对象
    }

    void PersonAddAge1(Person &p)
    {
        this->age += p.age;
    }

    Person& PersonAddAge2(Person &p) // 返回值 Person&
    //加 &：表示返回的是对象的引用（即 *this 本身的别名），而非对象的拷贝
    {
        this->age += p.age;
        return *this;
    }
};

// 1.解决名称冲突
void test1()
{
    Person p(18); // this 指向 p
    cout << p.age << endl;
}

// 2.返回对象本身用 *this
void test2()
{
    Person p1(18);
    Person p2(18);
    // p2.PersonAddAge1(p1).PersonAddAge1(p1);
    // 报错，p2.PersonAddAge(p1) 返回 void，后面就不能再调函数了
    p2.PersonAddAge2(p1).PersonAddAge2(p1); // 链式编程思想
    cout << p2.age << endl; // 56
    // 如果不加 & 则 36，后一次添加不是在 p2 上，而是在其拷贝上
}
```

- 在成员函数中要把 this 所指向的对象作为整体来操作，则必须显式地使用 this 指针

```cpp
void func(A *p) // 参数为 A 类对象的地址
{ 
    // ···
}
class A
{ 
public:
    void g(int i) 
    { 
        x = i; 
        func(this); //
    }
private:
    int x, y, z;
};
```

### 3.3 空指针访问成员函数

C++ 空指针也是可以调用成员函数的，但是也要注意有没有用到 this 指针

如果用到 this 指针，需要加以判断保证代码的鲁棒性

```cpp
cclass Person
{
public:
    int age;
    Person(int age)
    {
        this->age = age;
    }
    void showClassName()
    {
        cout << "Person" << endl;
    }
    void showPersonAge()
    {
        // if (this == nullptr) // 提高鲁棒性的操作
        // {
        //     return;
        // }
        cout << age << endl; // 有默认的 this->
    }
};

void test1()
{
    Person *p = nullptr;
    p->showClassName(); // 正常运行
    p->showPersonAge(); // 退出代码异常，空指针访问属性 age
}
```

### 3.4 const 修饰成员函数

**常函数**：

- 成员函数**后加 const**，称这个函数为常函数
- **常函数内不可以修改成员属性**
- ==成员属性声明时加关键字 `mutable` 后==，在常函数中依然可以修改

**常对象**：

- 声明对象前加 const，称这个对象为常对象
- **常对象只能调用常函数**

所谓 “常”，可以理解为只读

```cpp
class Person
{
public:
    Person(){};
    int A;
    mutable int B;
    // this 指针本质是指针常量，指针的指向不可修改
    // const Person * const this;
    // 在成员函数后面加上 const，修饰的是 this 指针，让指针指向的值也不可修改
    void showClassName() const // 常函数
    {
        // this = nullptr; // 报错
        // this->A = 100; // 报错
        this->B = 200; // 有 mutable 则可修改
        cout << "Person" << endl;
    }

    void func()
    {
        A = 300;
    }
};

void test1()
{
    // 常对象
    const Person p;
    p.showClassName();
    // p.func(); // 报错，常对象不可以调用普通成员函数，因为普通成员函数可以修改属性
}
```

#### 常对象补充

常量对象经常用于函数的参数说明

当把一个对象传递给函数时，为了提高参数的传递效率，往往把形参定义为对象指针或引用

但为了防止函数修改实参对象，可把==形参定义为常量对象指针或常量对象引用==

```cpp
class A
{
    int x, y;
public:
    void f() const
    {
       // ...
    }
    void g()
    {
       // ...
    }
};

void func(const A* pa) // 或 void func(const A &a)
{
    pa->f(); // OK
    pa->g(); // Error
}
```

需要注意的是，当把常成员函数放在类外定义时，则函数声明和定义的地方都要加上 const

```cpp
class A
{
    void f() const; // 声明
};

void A::f() const // 定义
{ 
    // ...
}
```

#### 补充：Constant Expressions

在编译期即可计算出结果的表达式

把计算前移到编译期 → 更快；错误更早暴露

- constexpr：可在编译期求值（也可运行期）
- consteval（C++20）：**只能出现在函数声明上**，必须在编译期求值，调用点不是常量表达式就报错

适用：数组大小、非类型模板实参、switch 的 case 标签、查表/位运算等

##### Example 1

```cpp
enum Flags { GOOD=0, FAIL=1, BAD=2 };

int operator| (Flags f1, Flags f2)  { return Flags(int(f1)|int(f2)); }

void f(Flags x) {
    switch (x) {
    case BAD|GOOD: /* ... */ break; // 报错，BAD|GOOD 不是常量表达式
    default: /* ... */ break;
    }
}
```

- 修改：`int operator|` 前面加 `constexpr`

##### Example 2

```cpp
struct Point {
    int x,y;
    constexpr Point(int xx, int yy) : x(xx), y(yy) { }
};
int main() {
    constexpr Point origo(0,0);
    constexpr int z = origo.x;

    constexpr Point a[] = {Point(0,0), Point(1,1), Point(2,2) };
    constexpr int x = a[1].x; // x becomes 1
}
```

- All evaluation can be done at compile time. Hence runtime efficiency is raised.

##### Example 3

```cpp
constexpr int sqr(int x) { return x * x; }
constexpr int A = sqr(10);
int y = 3; 
int B = sqr(y); // constexpr 也可以运行时求值

consteval int pow2(int n) { return 1 << n; }
constexpr int M = pow2(8);   // ✅
// int r = pow2(y);          // ❌ y 非常量表达式
int C = pow2(8); // ✅
```

留意最后一条代码：

- consteval 函数的返回值在编译期已经确定
- 所以 C 会被初始化为编译期计算出的常量值（256）
- 但 C 本身不是 constexpr 变量（即它在运行期可以被修改，只是初始值由编译期确定）

## 4 友元

友元的目的就是让一个函数或者类，**访问另一个类的私有成员和保护成员**

友元的关键字为 `friend`

友元的三种实现：

- 全局函数做友元
- 类做友元
- 成员函数做友元

### 4.1 全局函数做友元

```cpp
class Building
{
    // 告诉编译器 goodGuy 是全局函数，可以访问类的私有成员
    friend void goodGuy(Building *building);
    string bedRoom; // 私有成员
public:
    string sittingRoom;
    Building()
    {
        bedRoom = "bedroom";
        sittingRoom = "sittingroom";
    }
};
// 全局函数
void goodGuy(Building *building)
{
    cout << "Good Guy is entering " << building->sittingRoom << endl;
    cout << "Good Guy is entering " << building->bedRoom << endl; // 访问私有成员
}

void test1()
{
    Building building;
    goodGuy(&building);
}
```

### 4.2 类做友元

```cpp
class Building; // 可以这样写，先告诉编译器有这东西，后面再实现

class GoodGuy{
    Building *building;
public:
    GoodGuy();
    void visit();
};

class Building
{
    friend class GoodGuy; // 可以访问本类的私有成员
    
    string bedRoom; // 私有成员
public:
    string sittingRoom;
    Building();
};

// 可以类外实现成员函数
Building::Building()
{
    sittingRoom = "sittingRoom";
    bedRoom = "bedRoom";
}

GoodGuy::GoodGuy()
{
    building = new Building;
}
void GoodGuy::visit()
{
    cout << "Good Guy is entering " << building->sittingRoom << endl;
    cout << "Good Guy is entering " << building->bedRoom << endl;
}

void test1()
{
    GoodGuy gg;
    gg.visit();
}
```

### 4.3 成员函数做友元

```cpp
class Building;
class GoodGuy{
    Building *building;
public:
    GoodGuy();
    void visit1(); // 让 1 可以访问 Building 私有成员
    void visit2(); // 让 2 不可以访问 Building 私有成员
};

class Building
{
    friend void GoodGuy::visit1();

    string bedRoom; // 私有成员
public:
    string sittingRoom;
    Building();
};

Building::Building()
{
    sittingRoom = "sittingRoom";
    bedRoom = "bedRoom";
}

GoodGuy::GoodGuy()
{
    building = new Building;
}
void GoodGuy::visit1()
{
    cout << "visit1 " << building->sittingRoom << endl;
    cout << "visit2 " << building->bedRoom << endl;
}
void GoodGuy::visit2()
{
    cout << "Good Guy is entering " << building->sittingRoom << endl;
    // cout << "Good Guy is entering " << building->bedRoom << endl; //访问不到
}

void test1()
{
    GoodGuy gg;
    gg.visit1();
}
```

> 看着这么复杂是有原因的，对 GoodGuy 类来说，Building 未定义，只能用对象成员指针；而也是因为 Building 未定义，成员函数类外实现，放在 Building 的定义之后

总结：

```cpp
class Building
{
    friend void goodGuy(Building *building); // 全局函数做友元
    friend class GoodGuy; // 类做友元
    friend void GoodGuy::visit1(); // 成员函数做友元
    // 其他代码
};
```

### 4+ 友元补充

友元关系是类级别的、非传递的 —— 即类 A 的友元，并不自动成为 A 的基类 / 派生类的友元，因此无法突破基类 / 派生类的访问权限限制

```cpp
class Base {
protected:
    int prot_mem;
};
class Sneaky : public Base
{
    friend void clobber(Sneaky&); // 能访问 Sneaky::prot_mem
    friend void clobber(Base&); // 不能访问 Base::prot_mem
    // 子类 Sneaky 的友元不能访问其父类的私有和保护成员
    int j; // private
};

void clobber(Sneaky &s) { s.j = s.prot_mem = 0; } // OK

// void clobber(Base &b) { b.prot_mem = 0; } // ERR
```

## 5 运算符重载

运算符重载：对已有的运算符重新定义，赋予其另一种功能，以适应不同的数据类型

- 可以==通过成员函数重载==
- 可以==通过全局函数重载==
- 运算符重载可以发生函数重载

### 5.1 加号运算符

```cpp
class Person
{
public:
    int A;
    int B;
    Person():A(10),B(20){}

    // 通过成员函数重载
    // Person operator+ (Person &p)
    // {
    //     Person temp;
    //     temp.A = this->A + p.A;
    //     temp.B = this->B + p.B;
    //     return temp;
    // }
};
// 通过全局函数重载
Person operator+(Person &p1, Person &p2)
{
    Person temp;
    temp.A = p1.A + p2.A;
    temp.B = p1.B + p2.B;
    return temp;
}
// 运算符重载也可以发生函数重载
Person operator+(Person &p1, int a)
{
    Person temp;
    temp.A = p1.A + a;
    temp.B = p1.B + a;
    return temp;
}

void test1()
{
    Person p1;
    Person p2;
    Person p3 = p1 + p2;

    // 成员函数重载本质调用
    // Person p3 = p1.operator+(p2);

    //全局函数重载本质调用
    // Person p3 = operator+(p1, p2);

    // 运算符重载也可以发生函数重载
    // Person p3 = p1 + 15;
}
```

注意1：对内置的数据类型表达式的运算符是不可改变的

注意2：不要滥用运算符重载

#### 补充注意

```cpp
class Person
{
public:
    int A;
    int B;
    Person():A(10),B(20){}
};

Person operator+(Person &p1, int a)
{
    Person temp;
    temp.A = p1.A + a;
    temp.B = p1.B + a;
    return temp;
}

void test1()
{
    Person p1;
    Person p2 = 5 + p1; // 错误
}
```

全局函数重载操作符，两个参数的位置有讲究

而如果第一个参数不是本类类型，则不能用成员函数重载，因为**成员函数重载本质调用 `*this.operator+(other)`，第一个参数被隐藏，是 `*this`**

### 5.2 左移运算符

```cpp
class Person
{
    friend ostream & operator<<(ostream &cout,Person &p);
    int A = 10;
    int B = 20;
public:
    // 通过成员函数重载 <<
    // p.operator<<(cout) 简化版本为 p << cout
    // 一般不通过成员函数重载 << ，因为无法实现在 cout 在左侧
    // void operator<<(cout) // cout 是一个全局对象
};
// 只能通过全局函数重载
// &cout： ostream 类的 cout 全局只有一个，传递引用
ostream & operator<<(ostream &cout,Person &p)
{
    cout << "A = " << p.A << " B = " << p.B;
    return cout;
}

// 写成这样也行，引用 & 后面是一个别名，相对应把 cout 放入 m_out
// ostream & operator<<(ostream &m_Out,Person &p)
// {
//     m_Out << "A = " << p.A << " B = " << p.B;
//     return m_Out;
// }

void test1()
{
    Person p;
    // 如果 operator<< 是 void 类型
    // cout << p 无返回值，后面无法追加，则 << endl 报错
    // 故返回值类型需要 ostream &，返回 cout
    cout << p << endl;
}
```

### 5.3 递增运算符

```cpp
class MyInteger
{
    friend ostream& operator<<(ostream& cout, const MyInteger& obj);
    int num;
public:
    MyInteger() { num = 0; }

    // 重载前置 ++
    // 为什么要返回引用？为了一直对一个数据进行递增操作
    // 否则 ++(++mI) 后 mI 结果为 1
    MyInteger& operator++()
    {
        num++; // 先自增
        return *this; // 再返回自身
    }

    // 重载后置 ++
    // int 作为占位符，用于区分前置和后置递增
    // 后置递增必须返回值，因为 temp 在执行完后即被释放
    MyInteger operator++(int)
    {
        MyInteger temp = *this;
        num++;
        return temp;
    }
};

ostream& operator<<(ostream& cout, const MyInteger& obj)
{
    cout << obj.num;
    return cout;
}

void test1()
{
    MyInteger mI;
    cout << ++(++mI) << endl; // 2
}

void test2()
{
    MyInteger mI;
    cout << mI++ << endl; // 0
    cout << ++mI << endl; // 2
}
```

总结：前置++返回引用，后置++（有占位符 int）返回值

前置和后置++是有性能差异的，前置++效率更高，具体体现在迭代器上 `++it`

### 5.4 赋值运算符

C++编译器给一个类默认添加4个函数

1. 默认构造函数（无参，函数体为空）
2. 默认析构函数（无参，函数体为空）
3. 默认拷贝构造函数，对属性进行值拷贝
4. 赋值运算符 `operator=`，对属性进行值拷贝

如果类中有属性指向堆区，做赋值操作时也会出现深浅拷贝问题

```cpp
class Person
{
public:
    int *age;
    Person(int age)
    {
        this->age = new int(age);
    }
    ~Person()
    {
        if (this->age)
        {
            delete this->age;
            this->age = nullptr;
        }
    }

    Person& operator=(Person &p)
    {
        // age = p.age; // 编译器提供的是浅拷贝
        // 应先判断自身是否有属性在堆区，若有先释放干净，再深拷贝
        if (this->age)
        {
            delete this->age;
            this->age = nullptr;
        }
        this->age = new int(*p.age); // 深拷贝
        return *this; // 返回对象本身
    }
};

void test1()
{
    Person p1(10);
    Person p2(20);
    Person p3(30);
    p3 = p2 = p1;
    cout << *p1.age << endl; // p1.age[0] 也行
    cout << *p2.age << endl;
    cout << *p3.age << endl;
}
```

### 5.4+ 赋值操作符补充

- 返回引用（如 `Person&`），支持链式赋值（右结合）
- ~~返回一般不加 const，还有骚操作 `(a=b).func()` 可以调用非常成员函数~~

#### VS 拷贝构造

- **创建一个新对象**时用另一个已存在的同类对象对其进行初始化，则调用拷贝构造函数
- 对**两个已存在的对象**，如果用其中一个对象来改变另一个对象的状态，则调用赋值操作符重载函数

```cpp
A a;
A b = a; // 调用拷贝构造函数，它等价于：A b(a);
// ...
b = a; // 调用赋值操作符重载函数
```

与拷贝构造函数的情况类似，对于赋值操作符重载函数，当用于赋值的对象是一个临时的或即将消亡的对象时，目前的赋值操作符重载函数的实现效率有时是不高的

可以在类中定义一个转移赋值操作符重载函数来实现资源的转移

```cpp
A& operator=(A&& x) // 参数类型为右值引用
{ 
    delete []p;   // 归还旧空间
    p = x.p;      // 使用参数对象的空间（资源转移）
    x.p = NULL;   // 使得参数对象不再拥有空间
    return *this;
}
```

#### 自赋值问题

```cpp
class A
{
public:
    int *p;
    explicit A(const int *p)
    {
        this->p = new int(*p);
    }
    ~A() { delete p; }

    // 考虑自赋值情况
    A& operator=(const A& another) // clion 会警告未处理自赋值
    {
        delete p; // 先删除
        p = new int(*another.p); // 再赋值，自赋值情况下为未定义
        return *this;
    }
};

int main()
{
    int *p = new int(5);
    A a(p);
    a = a;
    cout << *a.p << endl; // 输出乱数，未定义行为
}
```

为了解决这种情况，可以通过以下两种方式：

- 加判断，若为自身则不操作，返回自身：
  - `if (this == &another) return *this;`
  - 加了这一行之后 clion 也没有警告了
- 先保存再删除，任何情况都通用：

```cpp
A& operator=(const A& another)
{
    int *pOrig = p;
    p = new int(*another.p);
    delete pOrig;
    return *this;
}
```

#### 子类调用父类赋值操作符

派生类不从基类继承赋值操作

如果派生类没有提供赋值操作符重载，则系统会为它提供一个隐式的赋值操作符重载函数

其行为是：对基类成员调用基类的赋值操作符进行赋值，对派生类的成员按逐个成员赋值

如果系统提供的隐式赋值操作不能满足要求，则要在派生类中重载赋值操作符

在派生类的赋值操作符重载函数的实现中需要显式地调用基类的赋值操作符来实现基类成员的赋值

```cpp
class A {};
class B: public A
{
public:
    B& operator =(const B& b)
    {
        if (&b == this) return *this; // 防止自身赋值
        *(A*)this = b; // 调用基类的赋值操作符对基类成员进行赋值
        // this->A::operator =(b); // 也可以这样写
        return *this;
    }
};
```

### 5.5 关系运算符

**作用**：重载关系运算符，可以让两个自定义类型对象进行对比操作

```cpp
class Person
{
public:
    int age;
    string name;
    Person(int age,string name)
    {
        this->age = age;
        this->name = name;
    }

    bool operator==(Person &p) // 还有 != < <= > >=
    {
        if(this->age == p.age && this->name == p.name)
        {
            return true;
        }
        return false;
    }
};
```

### 5.6 函数调用运算符

- 函数调用运算符 `()` 也可以重载
- 由于重载后使用的方式非常像函数的调用，因此称为仿函数
- 仿函数没有固定写法，非常灵活

```cpp
class MyPrint
{
public:
    // 重载函数调用运算符
    void operator()(string text)
    {
        cout << text << endl;
    }
};

void myPrint002(string text)
{
    cout << text << endl;
}

void test1()
{
    MyPrint myPrint;
    myPrint("Hello World!"); // 由于使用非常像函数调用，故称仿函数
    myPrint002("Hello World!");
    // 匿名函数对象，类型 + ()
    MyPrint()("HW");
}

class MyAdd
{
public:
    int operator()(int a, int b) // 返回值任意，灵活性
    {
        return a + b;
    }
};

void test2()
{
    MyAdd myAdd;
    int result = myAdd(100,200);
    cout << result << endl;
    cout << MyAdd()(10,20) << endl;
}
```

### 5.6+ 函数调用运算符拓展

C++ 的一个强大之处在于：可以让一个函数返回函数指针（作为返回值），这个返回的函数指针能直接传给另一个以函数指针为参数的函数

sort 函数的第三个参数正式名称是 “比较函数”（Comparison Function），也常被简称为 “比较器”（Comparator），本质是一个 “可调用对象”（Callable），可以是函数指针、函数对象、lambda 表达式等

#### 函数指针 VS 函数对象（仿函数）

- 函数指针
  - 无法保存状态
  - 编译器无法内联优化，效率较低
- **函数对象**
  - ==可以携带成员变量（状态）==
  - 是类，编译器可以==内联优化==调用，性能高

#### Lambda 函数

也称 Lambda 表达式，是**创建匿名函数对象**的快捷方式

- Lambda 表达式是创建函数对象的语法糖（syntactic sugar）
- ==编译器自动生成一个匿名函数对象类==

```cpp
auto add5 = [base = 5](int x) { return x + base; };
cout << add5(10);   // 输出15

class __lambda_add5 {
    int base;
public:
    __lambda_add5(int _base): base(_base) {}
    int operator()(int x) const { return x + base; }
};
```

|λ演算表达式|含义（数学）|C++ 对应写法|
|:---|:---|:---|
|$λx.x+1$|定义 $f(x)=x+1$|`[](int x) { return x+1; }`|
|$(λx.x+1)(3)$|调用 $f(3)$|`[](int x) { return x+1; }(3)`|

- Lambda 捕获

|捕获方式|含义|
|:---|:---|
|`[]`|不捕获任何变量|
|`[&]`|以引用方式捕获所有在作用域内被引用的变量|
|`[=]`|以值拷贝方式捕获所有在作用域内被引用的变量|
|`[=, &a]`|以值拷贝方式捕获所有被引用的变量，但 a 变量以引用方式捕获|
|`[b]`|仅以值拷贝方式捕获 b，不捕获任何其他变量|

```cpp
vector<string> str_filter(vector<string> &vec, function<bool(string &)>matched){
    vector<string> result;
    for (string tmp : vec) {
        if (matched(tmp)) // 可以判空
            result.push_back(tmp);
    }
    return result;
}

int main(){
    vector<string> vec = {"www.baidu.com", "www.kernel.org", "www.google.com"};
    string pattern = ".com";
    // lambda 用 [&] 捕获 pattern
    vector<string> filterd = str_filter(vec, [&](string &str) {
        if (str.find(pattern) != string::npos)
            return true;
        return false;
    });
}
```

#### std::function

`std::function` 是 C++11 引入的**通用函数封装器**，核心作用是：将各种 “可调用对象”（函数、lambda、函数对象、类成员函数等）统一包装成一种 ==“类型安全”== 的对象，方便存储、传递和调用，==可存储可拷贝可判空==

用途：回调注册、事件处理、接口设计

- 使用：

```cpp
#include <functional> // 需要这个头文件
std::function<返回值类型(参数类型1, 参数类型2, ..., 参数类型N)> 变量名;
```

本质是一种静态类型安全的动态多态包装器，原理是**类型擦除**

- 隐藏具体类型：`std::function` 内部会存储一个 ==“类型无关” 的指针==（或类似结构），指向被包装的可调用对象（比如 lambda、函数对象），但会 “擦除” 该对象的具体类型信息
- 统一调用接口：`std::function` 重载了 `operator()`，对外提供固定的调用签名（比如 `bool(string&)`），用户调用 `func(args)` 时，本质是通过这个统一接口转发
- 动态调度实现：内部通过 “类型擦除” 时保留的 “调用逻辑”（比如函数指针、虚函数表指针），找到对应的可调用对象并执行 —— 虽然是静态类型擦除，但对外表现出 “同一接口适配不同实现” 的多态特性

```cpp
#include <iostream>
#include <functional>
using namespace std;

void hello() { cout << "Hello!\n"; }

int main() {
    function<void()> f1 = hello; 
    function<void()> f2 = []()
    { cout << "Hi!\n"; }; 

    f1(); // f1._ptr->call();
    f2(); // f2._ptr->call();
}

struct _Base {
    virtual void call() = 0;
    virtual ~_Base() {}
};

template<class F>
struct _Model : _Base {
    F f; // 保存可调用对象
   _Model(F func): f(func) {}
   void call() override { f(); }  // 多态调用点
};

_Base* _ptr;
```

### 5.7 类型转换运算符

#### 带一个参数的构造函数用作类型转换

带一个参数的构造函数可以用作从一个基本数据类型或其他类到一个类的转换

```cpp
class Complex
{
    double real, imag;
public:
    Complex() { real = 0; imag = 0; }
    Complex(double r) // 一个参数的构造函数可兼作类型转换用
    {
        real = r;
        imag = 0;
    }
    Complex(double r, double i) {real = r; imag = i; }
    
    friend Complex operator +(const Complex& x, const Complex& y);
};

Complex operator +(const Complex& x, const Complex& y)
{
    Complex temp;
    temp.real = x.real + y.real;
    temp.imag = x.imag + y.imag;
    return temp;
}

void test()
{
    Complex c1(1, 2), c2, c3;
    c2 = c1 + 1.7; // 1.7 隐式转换成一个复数对象 Complex(1.7)
    c3 = 2.5 + c2; // 2.5 隐式转换成一个复数对象 Complex(2.5)
}
```

#### 自定义类型转换

```cpp
class A
{
    int x, y;
public:
    operator int() { return x + y; } // 函数名是要转换的类型
};

A a;
int i = 1;
int z = i + a; // a 隐式转换成 int 型数据
```

##### 特殊情况

当在一个类中同时定义了具有一个参数（t 类型）的构造函数和 t 类型转换操作符重载函数时，将会产生歧义

```cpp
class A
{
    int x, y;
public:
    A() { x = 0; y = 0; }
    A(int i) { x = i; y = 0; }
    operator int() { return x + y; }
    friend A operator +(const A& a1, const A& a2);
};

A operator +(const A& a1, const A& a2)
{
    A temp;
    temp.x = a1.x + a2.x;
    temp.y = a1.y + a2.y;
    return temp;
}

void test()
{
    A a;
    int i = 1, z;
    z = a + i; // 是 a 转换成 int 呢，还是 i 转换成 A
}
```

对于这种情况需要显示类型转换来解决

- `z = (int)a + i;` 或 `z = a + (A)i;`
- 或者==给构造函数加 `explicit` 关键字==，禁止隐式转换（其实类型转换操作符重载函数也可以加 `explicit`）

```cpp
class A {
public:
    operator int() { return 1; }
    operator double() { return 2.0; }
};
int main() {
    A a;
    // 该转 int 还是 double？
    // 0 也会自动升级为 double 0.0
    cout << a + 0; // 报错：运算符调用不明确
}
```

正确实现应在 `operator double() { return 2.0; }` 前加 `explicit`，禁止隐式转换，必须显示调用如 `cout << static_cast<double>(a)+0;`

### 5.8 下标操作符

```cpp
class MyString
{
    char* p;
public:
    explicit MyString(char *s)
    {
        p = new char[strlen(s) + 1];
        strcpy(p, s);
    }
    ~MyString(){ delete[] p; }

    char& operator[](int i) const // 加了const
    {
        return p[i];
    }
};

int main()
{
    MyString s("Hello World!");
    cout << s[0] << endl; // H
    s[0] = 'C'; // [] 要返回引用才允许这样做
    cout << s[0] << endl; // C
}
```

> 为什么这里加了 const 的常函数（本应不可以修改成员属性）可以修改成员变量？

const 的本质是修饰 this 指针 —— 把 this 的类型从 `MyString*` 变成 `const MyString*`，此时：

- ==函数内部不能修改类的非静态成员变量（比如不能给 p 重新赋值，如 p = new char[10]）==
- ==函数内部不能调用其他非 const 成员函数（避免通过其他函数修改对象）==
- ==该函数可以被 const 对象和非 const 对象调用（而非 const 成员函数只能被非 const 对象调用）==

**const 仅限制「修改成员变量本身」，不直接限制「通过成员变量间接修改其指向的内容」**（比如 p 是 char*，const 限制不能改 p 的指向，但默认不限制改 p 指向的字符）

而在代码函数中返回 `char&`（非 const 引用）—— 外部可通过引用修改字符，正是这里破坏了 const 语义

这种情况下如果定义一个 const 对象再调用该函数，也能进行修改，但这不是预期发生的

```cpp
int main()
{
    const MyString cs("Hello World!");
    s[0] = 'C';
    cout << s[0] << endl; // C
}
```

解决方法：重载两个版本的 `operator[]`

```cpp
class MyString
{
    char* p;
public:
    // ···
    char& operator[](int i) // 允许修改就不用 const 了
    {
        return p[i];
    }
    const char& operator[](int i) const
    {
        return p[i];
    }
};

int main()
{
    MyString s("Hello World!");
    s[0] = 'C';
    cout << s[0] << endl; // C

    const MyString cs("Hello World!"); // 可以匹配到 const 版本
    // cs[0] = 'D'; // 终于给我报错了
    cout << cs[0] << endl; // H
}
```

#### 多维数组

先明确 `array2D[i][j]` 等价于 `array2D.operator[](i).operator[](j)`

若想要通过下标的方式访问自定义类型的对象

```cpp
class Array2D
{
    int row,col; // 行，列
    int *p;
public:
    Array2D(int r, int c):row(r),col(c)
    {
        p = new int[row * col];
    }
    ~Array2D(){ delete[] p; }

    int *operator[](int i)
    {
        // 返回指针，指针后面可以用[]
        // 故对于二维数组只需要重载第一个[]
        return p + i*col;
    }
};

void test()
{
    Array2D arr(5,5);
    arr[2][1] = 2; // OK
}
```

> 但如果是三维及以上多维数组呢？

指针后面还跟两个及以上个 `[]`，而 `int*` 是内置数据类型，不能重载运算符

```cpp
class Array2D
{
    int row,col; // 行，列
    int *p;
public:
    class Array1D // 也称为代理类
    {
        int *p; // 同名，但作用域不同
    public:
        Array1D(int *p)
        {
            this->p = p;
        }
        // 不需要写析构函数，因为它的内存是 A2D 的
        int &operator[](int i) // 返回引用
        {
            return p[i];
        }
    };

    Array2D(int r, int c):row(r),col(c)
    {
        p = new int[row * col];
    }
    ~Array2D(){ delete[] p; }
    // 这里不返回引用，因为返回的是临时对象，否则消毁后出现未定义
    Array1D operator[](int i) // 返回 int*
    {
        // 因构造函数单参数，该参数类型可以与类类型隐式转换
        // 但如果加了 explicit 就不能
        return p + i * col;
    }
};
```

这种实现的话，对于 `arr[2][1]` 先调用 `arr.operator[](2)`，返回一个 `Array1D` 对象（其实也是 int*），再调用 `Array1D.operator[](1)`，返回正确的引用

对于 $n(n>2)$ 维数组只需要添加 $n-1$ 个代理类

```cpp
// 三维数组示例
class A3D
{
    int h, row, col;
    int *p;
public:
    class A1D
    {
        int *p;
    public:
        A1D(int *p)
        {
            this->p = p;
        }
        int &operator[](int i)
        {
            return p[i];
        }
    };

    class A2D
    {
        int col;
        int *p;
    public:
        A2D(int *p,int col)
        {
            this->col = col;
            this->p = p;
        }
        A1D operator[](int i)
        {
            return p + i * col; // 跳过i行
        }
    };

    A3D(int h,int r,int c)
    {
        this->h = h;
        this->row = r;
        this->col = c;
        this->p = new int[h * row * col];
    }
    A2D operator[](int i)
    {
        return {p + i * row * col, col}; // 跳过i个平面
    }
};
```

当然，严谨的话应加上数组下标的合法性检查以及上面提到过的 const 版本

### 5.9 间接引用操作符

和 `[]` 一样，本身是二元操作符，但 `->` 重载时要按一元操作符重载描述

> 在成员函数操作符重载时，一元还是二元即看是否有接受参数

可以实现**把成员对象的成员函数直接拿出来用**的效果

```cpp
class Pen
{
    int color;
    int size;
public:
    void setColor(int color){ this->color = color; }
    void setSize(int size){ this->size = size; }
};

class Panel
{
    Pen pen;
    int bg;
public:
    // Pen* getPen(){ return &pen; }
    Pen* operator->()
    {
        return &pen;
    }
    void setBg(int bg){ this->bg = bg; }
};

int main()
{
    Panel panel{};
    // 两种不同的实现方式
    // panel.getPen()->setColor(16);
    // panel.getPen()->setSize(15);

    // panel.operator->()->setColor(16);
    // 实际上编译器会自动补上后面的一个原生的 ->
    panel->setColor(16);
    panel->setSize(15);
    panel.setBg(10);
}
```

#### 类智能指针用法

```cpp
class A
{
  public:
  void f();
  int g(double);
  void h(char);
};

void test()
{
    A *p = new A;
    // ……
    p->f();
    // ……
    p->g(1.1);
    // ……
    p->h(‘A’);
    // ……
    delete p;
}
```

new 出的对象很难说什么时候 delete，有很多出口，如中间 return 返回、异常等，有可能出现重复释放的情况

> 那么怎么解决裸指针释放问题？

```cpp
class Awrapper
{
    A* p;
public:
    AWrapper(A *p) { this->p = p; }
    ~AWrapper() { delete p; }
    A*operator->() { return p; }
};
```

使用上面定义的这个类，将 `A *p = new A;` 改为 `AWrapper  p(new A);` 以创建一个栈上的对象，那么即可不用手动写 delete，无论什么作用域，当 p 超出作用域时，会自动调用析构函数释放内存，确保一次释放

但也有局限性，必须要符合编译器控制的生命周期

当然，也可以使用真正的 [智能指针](../STL/5%20malloc.md)

##### 补充：RAII

Resource Acquisition Is Initialization（**资源获取即初始化**），是 C++ 管理资源的核心机制，其核心思想是 ==**将资源的生命周期与对象的生命周期绑定**== —— 通过==对象的创建（初始化）获取资源，通过对象的销毁（析构）自动释放资源==，从而避免资源泄漏、简化资源管理

原理：C++ 中栈上局部对象的生命周期是确定的：

- 当对象被创建时（进入作用域），自动调用构造函数
- 当对象离开作用域（正常退出、函数返回、异常抛出等），自动调用析构函数

RAII 正是利用这一特性，将需要手动管理的资源封装到一个类中：只要该对象是栈上对象（而非堆上动态创建的对象，堆上对象仍需手动 delete），就能保证资源在作用域结束时被自动释放，无论退出原因是正常返回还是异常抛出

#### 对象访问次数计数器

可以针对某个类重载操作符 `->`，使得该类的对象可以当指针来用，**用它访问指向的对象时能做一些额外的事情**

如果在程序执行的某个时刻想知道某个对象被访问了多少次

```cpp
class A
{ 
    int x,y;
    public:
    void f();
    void g();
};

void func(A *p)
{ 
    // ...
    p->f();
    // ...
    p->g();
    // ...
}

A a;
func(&a); // 想知道调用完 func 后访问了 a 多少次
```

- 版本一

```cpp
class A
{ 
    int x,y;
    int count;
public:
    A() { count = 0; ... }
    void f() { count++; ... }
    void g() { count++; ... }
    int num_of_access() const { return count; }
}

A a;
func(&a);
a.num_of_access();
```

- 问题
  - 要修改类 A
  - 如果类A中有外界可访问的数据成员（如 z），无法对其访问进行计数

- 版本二

```cpp
class B
{ 
    A *p_a;
    int count;
public:
    B(A *p)
    { 
        p_a = p;
        count = 0;
    }
    A *operator ->() // 操作符 "->" 的重载函数，返回一个通常的指针
    { 
        count++;
        return p_a;
    }
    int num_of_a_access() const { return count; }
};

void func(B &p)
{ 
    // ...
    p->f(); // b->f();
    // ...
    p->g(); // b->g();
    // ...
}
// ...
A a;
B b(&a);
func(b);
b.num_of_a_access(); // 获得对 a 的访问次数
```

#### 另外的

为了完全模拟普通指针的功能，针对智能指针类，还可以重载 `*`、 `[]`、`+`、`-`、`++`、`--` 等操作符

```cpp
class B // 智能指针类
{ 
    A *p_a;
public:
    B(A *p) { p_a = p; }
    A *operator ->() { return p_a; }
    A& operator *() { return *p_a; }
    A& operator [](int i) { return p_a[i]; }
};

A a[10];
B b(&a[0]); // 智能指针，可写成 B b = &a[0];
b->f();     // a[0].f();
(*b).f();   // a[0].f();
b[2].f();   // a[2].f();
```

### 5+ 运算符重载补充

#### （1）不可重载的运算符

- `.`、`.*`、`::`、`sizeof`、`typeid`：==后面跟名称，类型不确定==
- `?:`：传入三个参数，无法实现 “短路求值”
- `#`、`##`：预处理符号

#### （2）不应重载的运算符

- `&&`、`||`

考虑如下场景：

```cpp
char *p;
if ((p != 0) && (strlen(p) > 10)){}
```

重载前，`&&`、`||` 的运算讲究顺序，如果前面的条件不成立，则后面的条件不会执行，即所谓「短路求值」

重载后，`&&`、`||` 需传入两个参数，两个条件都会执行，破坏了「短路求值」的逻辑，导致潜在风险，如上场景中若 p 为空指针，strlen(p) 会报错导致程序崩溃

```cpp
if (expression1.operator&&(expression2)){}
if (operator&&(expression1, expression2)){}
```

#### （3）不可作为全局函数重载的运算符

- `=`：赋值运算符，修改当前对象（左操作数）的状态
- `()`：函数调用运算符，对象作为函数使用（函数对象）
- `[]`：下标运算符，访问对象内部的元素
- `->`：间接引用运算符，通过对象访问其指向的目标成员

> `<<` 用于 cout 的时候也不应全局函数重载

**明确前提**：运算符重载的「成员函数 vs 全局函数」核心区别

- 成员函数重载：左操作数（或调用对象）必须是当前类的实例，this 指针天然指向该对象，语义聚焦「对象自身的操作」
- 全局函数重载：左、右操作数都是显式参数，无 this 限制（可以左右互换），
  - 补充：可适配「左操作数非当前类对象」的场景（如 `cout << obj`，左操作数是 `ostream`），故可作为成员函数的补充

而 `=`、`()`、`[]`、`->` 这四个运算符，其语义本质决定了「**必须绑定当前类对象作为核心操作目标**」，全局重载会打破这种绑定，导致逻辑混乱（可以左右互换）

#### 其他补充

并非所有操作符重载函数都不能被继承，核心区别在于：操作符重载是否属于 “编译器自动合成的特殊成员函数” —— 只有赋值操作符（operator=）、移动赋值操作符（operator=(右值引用)）等少数 “特殊成员函数” 会被编译器默认屏蔽继承；而绝大多数普通操作符重载（如`+`、`-`、`*`、`<<`、`[]`等），完全遵循普通成员函数的继承规则，可以正常继承和使用

##### 关键区分：特殊成员函数 vs 普通操作符重载

C++ 中只有 6 个特殊成员函数 会被编译器自动合成（若未显式定义），这些函数的继承会被编译器特殊处理（默认屏蔽）；其他所有操作符重载都是 “普通成员函数”，继承规则和普通成员函数完全一致（可继承、可重写、可能被名字隐藏）

特殊成员函数（默认屏蔽继承，含 2 个赋值相关操作符）：

- 默认构造函数
- 拷贝构造函数
- 拷贝赋值操作符（`operator=(const T&)`）
- 移动构造函数
- 移动赋值操作符（`operator=(T&&)`）
- 析构函数

这些函数的核心特点是：编译器会为派生类自动合成，导致基类版本被 “名字隐藏”，且继承可能引发语义风险（如赋值操作符的切片问题）

除上述特殊成员函数外，其他所有操作符重载（如`+`、`-`、`*`、`/`、`<<`、`>>`、`[]`、`()`、`->`等），本质是普通成员函数，继承规则和普通成员函数完全一致：

- 基类中声明为 public/protected 的普通操作符重载，会被派生类继承
- 若派生类未定义同名操作符，可直接调用基类的版本
- 若派生类定义了同名操作符，基类版本会被 “名字隐藏”（需用 `Base::operatorXX` 显式调用或 `using` 引入）

##### 特殊成员函数的特殊用法

- `=default`：显式要求编译器生成「**默认版本**」的特殊成员函数
- `=delete`：显式==禁用某个特殊成员函数==

## 6 继承

> `C++` 面向对象三大特性：==封装、继承、多态==

### 6.1 继承的基本语法

```cpp
class BasePage
{
public:
    void header()
    {
        cout << "header content" << endl;
    }
    void footer()
    {
        cout << "footer content" << endl;
    }
};

// 语法：class 子类 : 继承方式 父类
// 子类也称派生类，父类也称基类
class Java : public BasePage
{
public:
    void content()
    {
        cout << "Jvav" << endl;
    }
};

void test1()
{
    Java ja;
    ja.header();
    ja.footer();
    ja.content();
}
```

**总结**：`class A : public B`
A 类称为 子类 或 派生类
B 类称为 父类 或 基类

派生类中的成员包含两大部分

- 一类是从父类继承过来的，一类是自己增加的成员
- 从父类继承过来的表现其共性，而新增的成员体现其个性

#### 注意

**声明（前向声明）时，不需要加继承方式**，**继承方式在定义时才加**

就如在上面那个例子中在 BasePage 上加一行 `class Java;`

但别搞混了，在 `.h` 文件声明时一定要加继承方式

另外，在定义派生类时一定要见到基类的**定义**，否则编译程序无法确定派生类对象需占多大内存空间以及派生类中对基类成员的访问是否合法

### 6.2 继承方式

继承的语法：`class 子类 : 继承方式 父类`

继承方式一共有三种：

- 公共继承
- 保护继承
- 私有继承

#### 公共继承

```cpp
class Base1
{
public:
    int A;
protected:
    int B;
private:
    int C;
};

class Son1 : public Base1
{
public:
    void func()
    {
        A = 10; // 父类中的公共成员到子类依然是公共权限
        B = 20; // 父类中的保护成员到子类依然是保护权限
        // C = 30; // 报错，父类的私有成员，子类无法访问
    }
};

void test1()
{
    Son1 s1;
    s1.A = 100;
    // s1.B = 200; // 报错，Son1 中的 B 是保护权限，类外无法访问
}
```

#### 保护继承

```cpp
class Base2
{
public:
    int A;
protected:
    int B;
private:
    int C;
};

class Son2 : protected Base2
{
public:
    void func()
    {
        A = 10; // 父类中公共成员，到子类中变成保护
        B = 20; // 父类中保护成员，到子类中依然保护
        // C = 30; // 报错，父类中的私有成员，子类无法访问
    }
};

void test2()
{
    Son2 s2;
    // s2.A = 100; // 报错，Son2 中的 A 已变为保护权限，类外无法访问
    // s2.B = 200; // 报错，Son2 中的 B 是保护权限，类外无法访问
}
```

#### 私有继承

```cpp
class Base3
{
public:
    int A;
protected:
    int B;
private:
    int C;
};

class Son3 : private Base3 // 如果不写继承方式，默认是私有
{
public:
    void func()
    {
        A = 10;
        B = 20;
        // C = 30; // 报错，父类中的私有成员，子类无法访问
    }
};

class GrandSon3 : public Son3
{
public:
    void func()
    {
        // A = 1000; // 父类 Son3 的 A, B 都变私有
        // B = 2000; // 子类无法访问
    }
};
```

总结：

![alt text](../Z_img/inheritanceAccessSpecifier.png)

#### 继承方式调整

在任何继承方式中，除了基类的 private 成员，其他成员都可以在派生类中调整其访问控制，调整时采用下面的格式：

`继承方式 : using 基类名 :: 基类成员名`

```cpp
class A
{
public:
    void f1() { cout << "f1" << endl; }
    int f2 = 2;
protected:
    void g1() { cout << "g1" << endl; }
    int g2 = 3;
};

class B : private A
{
public:
    using A::f1; // 把 f1 调整为 public
    using A::g2; // 把 g1 调整为 public。是否允许弱化基类的访问控制要视具体的实现而定
protected:
    using A::f2; // 把 f2 调整为 protected
    using A::g1; // 把 g2 调整为 protected
};
```

另外，对基类一个成员函数名的访问控制的调整，将调整基类所有具有该名的重载函数

但如果在派生类中定义了与基类同名的成员函数，则在派生类中就不能再对基类中的同名函数进行访问控制调整了

#### 公有继承补充

在 C++ 中，==public 继承方式有着特殊的意义：以 public 方式继承的派生类继承了基类的对外接口，可将它看作基类的**子类型**==

所谓子类型（subtype）是指：==对用类型 T 表达的所有程序 P，**当用类型 S 去替换程序 P 中的类型 T 时，程序 P 的功能不变**，则称类型 **S 是类型 T 的子类型**==

子类型在程序设计中发挥着重要的作用，对 C++ 程序而言，子类型的作用主要体现在：对具有 public 继承关系的两个类，对基类对象所能实施的操作也能作用于派生类对象且在需要基类对象的地方可以用派生类对象去替代

- 派生类对象可以调用基类成员函数
- ==基类指针变量可以指向派生类对象==
- ==派生类对象可以赋值给基类对象==
- ==派生类对象可以作为参数传给需要基类对象的函数==

省流：儿子可以当爸爸使用，但爸爸不能当儿子使用

#### 私有继承补充

> **私有继承在设计层面无意义，只用于实现层面**

继承的 “设计层面” 与 “实现层面” 的区别

- ==设计层面的继承：核心是表达 **“is-a” 关系**==
- 实现层面的继承：仅为了复用基类的代码或资源（如成员变量、成员函数的实现），不涉及 “类型关系” 的抽象，属于底层实现的技术手段

私有继承时，基类的所有成员在派生类中都会被隐式转为私有访问权限，这导致：

- 外部代码无法识别 “类型关系”：派生类对象不能被当作基类对象使用。因此，**它不表达 “is-a” 的设计关系，在设计层面没有意义**

```cpp
class Human{};

class Student : private Human{};

void eat(Human h)
{
    cout << "eat" << endl;
}

void test1()
{
    Human h;
    Student s;
    eat(h);
    eat(s); // 报错，只有 public继承（is-a 关系）才不报错
}
```

- 仅在派生类内部复用基类实现：派生类可以在内部访问基类的 protected 成员、重载基类的虚函数，从而复用基类的代码逻辑。这种复用是纯实现层面的技术手段，与设计层面的类型抽象无关
  
==私有继承的实现复用逻辑，其实和 “组合”（has-a 关系）非常接近== —— 都是 “利用其他类的资源来实现自身功能，而非表达类型关系”。之所以有时用私有继承而非组合，==通常是为了访问基类的 protected 成员或虚函数（这些是组合无法直接做到的）==，但这依然属于实现细节的选择，而非设计层面的抽象

### 6.3 继承中的对象模型

**问题**：从父类继承过来的成员，哪些会存储在子类对象中？

```cpp
class Base
{
public:
    int A;
protected:
    int B;
private:
    int C;
};

class Son : public Base
{
public:
    int D;
};

void test1()
{
    cout << "sizeof Son = " << sizeof(Son) << endl; // 16
    // 父类中的所有非静态成员属性都会被子类继承下来
    // 只是私有成员属性被编译器隐藏而访问不到
}
```

**结论**：父类的非静态成员属性，无论继承方式如何，都会被子类继承下来，作为子类对象的一部分。而私有成员只是被编译器隐藏了而访问不到

### 6.4 继承中的构造和析构顺序

子类继承父类后，当创建子类对象，也会调用父类的构造函数

问题：父类和子类的构造和析构顺序是谁先谁后？

```cpp
class Base
{
public:
    Base()
    {
        cout << "Base constructor" << endl;
    }
    ~Base()
    {
        cout << "Base destructor" << endl;
    }
};

class Son : public Base
{
public:
    Son()
    {
        cout << "Son constructor" << endl;
    }
    ~Son()
    {
        cout << "Son destructor" << endl;
    }
};

void test1()
{
    Son s;
    // 先构造父类，再构造子类
    // 析构与构造相反
}
```

输出

```md
Base constructor
Son constructor
Son destructor
Base destructor
```

**结论**：继承中，**先调用父类构造函数，再调用子类构造函数**，析构顺序与构造相反

另外，如果一个类既有基类又有成员对象类，则在创建该类对象时，该类的构造函数先调用基类的构造函数，再调用成员对象类的构造函数，最后执行自己的函数体。析构相反

### 6.4+ 基类构造函数的调用

在 C++ 中，构造函数是特殊成员函数，不能被继承；子类若需复用父类的构造逻辑，需通过「显式调用父类构造函数」的方式实现

#### 成员初始化列表实现

前面已经提到过，这里不再赘述

```cpp
子类构造函数(参数列表) : 父类构造函数(父类参数) {
    // 子类自己的初始化逻辑
}
```

btw，若父类有默认构造函数（无参构造，或所有参数有默认值的构造），子类可省略显式调用（编译器自动调用），也可显式调用（按上格式，参数列表为空）

#### using base::base

> *但这种方式貌似很少在实际中使用*

为 C++11 引入的 “继承基类构造函数” 语法，核心作用是：让派生类直接 “复用基类的所有构造函数”，无需在子类中手动重写与基类同名的构造函数，从而简化派生类的代码

语法拆解：

- using：C++ 中的 “名字引入” 关键字，作用是把其他作用域的名字（这里是基类的构造函数）引入当前作用域（派生类）
- base::base：第一个 base 是基类名，第二个 base 是基类的 构造函数名（构造函数名必须与类名相同），所以整体表示 “基类 base 的所有构造函数”
- 整体含义：将基类的所有构造函数 “继承” 到派生类中，派生类可以直接使用这些构造函数创建对象，无需手动实现

```cpp
class A { // 基类 A
public:
    A() { cout << "A::默认构造" << endl; } // 构造1：无参
    A(int x) : val(x) { cout << "A::带参构造(int)" << endl; } // 构造2：int参数
private:
    int val;
};

// 派生类 B（无 using A::A;，需手动重写构造）
class B : public A {
public:
    // 手动重写无参构造：调用 A 的无参构造
    B() : A() {} 
    // 手动重写带参构造：调用 A 的 int 带参构造
    B(int x) : A(x) {} 
    // 如果 A 还有其他构造函数（如 A(double)、A(string)），B 都要手动加对应的构造函数
};
```

而用 `using A::A;` 后，B 可以直接复用 A 的所有构造函数，无需手动重写

```cpp
class B : public A {
public:
    using A::A; // 一行代码，继承 A 的所有构造函数
    // 无需手动写 B()、B(int x) 等构造函数！
};

int main() {
    B b1;          // 调用 A::默认构造（通过 using 继承）
    B b2(10);      // 调用 A::带参构造(int)（通过 using 继承）
    // 如果 A 还有 A(double d)，则 B b3(3.14); 也能直接用！
    return 0;
}

// 输出：
// A::默认构造
// A::带参构造(int)
```

注意事项：

- 只继承基类的构造函数，不会继承基类的其他成员（如成员变量、普通成员函数）—— 其他成员的继承遵循正常的公有继承规则
- 派生类可添加自己的构造函数：继承基类构造函数后，B 仍可以自定义新的构造函数，不会冲突
- 如果派生类自定义了一个与基类构造函数 参数完全一致 的构造函数，则会 “隐藏” 基类的对应构造函数（优先调用派生类自己的）
- 继承的基类构造函数，其访问权限与基类中一致

### 6.5 继承同名成员处理方式

问题：当子类和父类出现同名的成员，如何通过子类对象，访问到父类或子类的同名成员？

- 访问子类同名成员 直接访问即可
- 访问父类同名成员 需要加作用域

```cpp
class Base
{
public:
    int A;
    Base()
    {
        A = 100;
    }
    void func()
    {
        cout<<"I am base"<<endl;
    }
    void func(int a) // 重载
    {
        cout<<"I am base(int a)"<<endl;
    }
};

class Son : public Base
{
public:
    int A; // 同名成员变量
    Son()
    {
        A = 200;
    }
    void func() // 同名成员函数
    {
        cout<<"I am son"<<endl;
    }
};

void test1()
{
    Son s;
    cout<<s.A<<endl; // 子类的 A 200
    cout<<s.Base::A<<endl; // 父类的 A 100
    s.func(); // I am son
    s.Base::func(); // I am base
    // s.func(100); // 报错
    // 如果子类中出现和父类同名的成员函数，子类的同名成员函数会隐藏掉父类中所有同名成员函数
    s.Base::func(100); // I am base(int a)
}
```

**总结**：

1. 子类对象可以直接访问到子类中同名成员
2. 子类对象加作用域可以访问到父类同名成员
3. 当子类和父类中出现同名的成员函数，**子类的同名成员会隐藏掉父类中所有同名成员函数**，加作用域可以访问到父类中被隐藏的同名成员函数

#### 同名成员函数补充

```cpp
class Base
{
public:
    void func()
    {
        cout << "Base" << endl;
    }
};

class Son : public Base
{
public:
    void func()
    {
        cout << "Son" << endl;
    }
};

void test1()
{
    Son* s = new Son;
    Base* son1 = s;
    son1->func(); // Base
    Son* son2 = s;
    son2->func(); // Son
}
```

原因是静态绑定，引出使用虚函数解决这个问题

### 6.6 继承同名静态成员处理方式

问题：继承中同名的静态成员在子类对象上如何进行访问？

静态成员和非静态成员出现同名，处理方式一致

- 访问子类同名成员 直接访问即可
- 访问父类同名成员 需要加作用域

```cpp
class Base
{
public:
    static int A;
    static void func()
    {
        cout << "Base" << endl;
    }
    static void func(int a) // 同名静态函数
    {
        cout << "Base(int a)" << endl;
    }
};
int Base::A = 100;

class Son : public Base
{
public:
    static int A; // 同名静态成员属性
    static void func() // 同名静态函数
    {
        cout << "Son" << endl;
    }
};
int Son::A = 200;

// 同名静态成员属性
void test1()
{
    // 1.通过对象访问
    Son s;
    cout << s.A << endl; // 200
    cout << s.Base::A << endl; // 100

    // 2.通过类名访问
    cout << Son::A << endl;
    cout << Base::A << endl;
    // 第一个 :: 表示通过类名访问，第二个 :: 表示访问父类作用域下
    cout << Son::Base::A << endl;
}
// 同名静态成员函数
void test2()
{
    // 1.通过对象访问
    Son s;
    s.func();
    s.Base::func();

    // 2.通过类名访问
    Son::func();
    Son::Base::func();
    // 子类同名函数隐藏父类所有同名函数
    Son::Base::func(100);
}
```

**结论**：同名静态成员处理方式和非静态处理方式一样，只不过有两种访问方式（通过对象和通过类名）

### 6.7 多继承语法

C++允许一个类继承多个类

语法：`class 子类 : 继承方式 父类1, 继承方式 父类2...`

> 每个父类前都要写继承方式，不然默认私有可能出现严重问题

基类的声明次序决定：
● 对基类数据成员的存储安排
● 对基类构造函数 / 析构函数的调用次序

可以把以 public 继承方式定义的多继承派生类对象的地址赋给它的任何一个基类的指针（儿子可以当爸爸）

```cpp
class A {};
class B {};
class C : public A , public B {};

int main()
{
    C c;
    A &p1 = c; // OK
    B &p2 = c; // OK
}
```

多继承可能会引发父类中有同名成员出现，需要加作用域区分

==C++实际开发中不建议使用多继承==

```cpp
class Base1
{
public:
    int A;
    Base1() { A = 100; }
};

class Base2
{
public:
    int A;
    Base2() { A = 200; }
};

// 语法：class 子类 : 继承方式 父类1, 继承方式 父类2...
class Son : public Base1, public Base2
{
public:
    int C;
    int D;
    Son()
    {
        C = 300;
        D = 400;
    }
};

void test1()
{
    cout << "sizeof Son = " << sizeof(Son) << endl; // 16
    Son s;
    // cout << s.A << endl; // 报错，二义性
    cout << s.Base1::A << " " <<  s.Base2::A <<endl;
}
```

### 6.8 菱形继承

**菱形继承概念**：

- 两个派生类继承同一个基类
- 又有某个类同时继承这两个派生类
- 这种继承被称为菱形继承，或者钻石继承

**菱形继承问题**：

- 会导致**数据冗余**和**二义性**

```cpp
class Animal
{
public:
    int age;
};

class Sheep : public Animal{};

class Camel : public Animal{};

class Cnm : public Sheep, public Camel{};

void test1()
{
    Cnm c;
    // c.age = 18; // 报错，不明确，二义性
    // 当菱形继承，两个父类有同名数据，加作用域
    c.Sheep::age = 18;
    c.Camel::age = 28;
    cout << "c.Sheep::age = " << c.Sheep::age << endl; // 18
    cout << "c.Camel::age = " << c.Camel::age << endl; // 28
    // so 羊驼年龄？
    // 这份数据我们知道只要有一份就可以了，菱形继承导致数据有两份，资源浪费
}
```

```cpp
class Animal
{
public:
    int age;
};

// 利用虚继承解决菱形继承问题
// 继承方式前加关键字 virtual 变为虚继承
// 其基类称为虚基类
class Sheep : virtual public Animal{};

class Camel : virtual public Animal{};

class Cnm : public Sheep, public Camel{};

void test1()
{
    Cnm c;
    // 三种方式都等价
    // c.age = 8;
    // c.Sheep::age = 18;
    // c.Camel::age = 28;
    // 输出都一样
    cout<< "c.age = " << c.age<<endl;
    cout << "c.Sheep::age = " << c.Sheep::age << endl;
    cout << "c.Camel::age = " << c.Camel::age << endl;
}
```

`vbptr` (virtual base pointer) 虚基指针，指向虚基表 (vbtable)，虚基表里存放着父类虚基类指针的偏移量，通过偏移量找到虚基类

**总结**：

- 菱形继承带来的主要问题是：数据冗余和二义性
- 使用虚继承可以解决菱形继承问题

对于包含虚基类的类，应注意以下两点：

- **虚基类的构造函数由该类的构造函数直接调用**
- **虚基类的构造函数优先于非虚基类的构造函数执行**

```cpp
class A
{
    int x;
public:
    A(int i) { x = i; }
};

class B : virtual public A // 包含虚基类 A
{
    int y;
public:
    B(int i) : A(1) { y = i; }
};

class C : virtual public A // 包含虚基类 A
{
    int z;
public:
    C(int i) : A(2) { z = i; }
};

class D : public B, public C // 包含虚基类 A
{
    int m;
public:
    D(int i, int j, int k) : B(i), C(j), A(3) { m = k; }
};

class E : public D // 包含虚基类 A
{
    int n;
public:
    E(int i, int j, int k, int l) : D(i, j, k), A(4) { n = l; }
};

D d(1, 2, 3); // A 的构造函数由 D 的构造函数直接调用，d.x 被初始化为 3
E e(1, 2, 3, 4); // A 的构造函数由 E 的构造函数直接调用，e.x 被初始化为 4
```

当创建 D 类对象 d 时，==虚基类 A 的构造函数由类 D 的构造函数直接调用==，在类 B 和类
C 的构造函数中就不再调用虚基类 A 的构造函数了

各个构造函数的执行次序是：

- A(3)、B(1)、C(2)、D(1,2,3)

当创建 E 类对象 e 时，==虚基类 A 的构造函数由类 E 的构造函数直接调用==，在类 B、C
和 D 的构造函数中就不再调用虚基类 A 的构造函数了。各个构造函数的执行次序是：

- A(4)、B(1)、C(2)、D(1,2,3)、E(1,2,3,4)

## 7 多态

多态性（polymorphism）是程序设计中的一个重要概念。多态性的一般含义是：某一论域中的某个元素存在多种形式和解释。在程序设计语言中，多态性通常体现为：

- **一名多用**：一名多用是指在==同一个作用域中用同一个名字为不同的程序实体命名==，它主要通过**重载**（overloading）来实现，包括函数名重载和操作符重载
- **类属**：类属（generics）是指==一个程序实体能对**多种类型的数据**进行操作或描述的特性==。具有类属性的程序实体通常有类属函数和类属类，类属函数是指一个函数能对多种类型的参数进行操作，类属类型是指一个类型可以描述多种类型的数据。在C++ 语言中，通过指针和函数模板可以实现类属函数，用联合类型以及类模板可以实现类属类型
  
在面向对象程序设计中，由于类之间可以有继承关系，因此，还存在下面的多态。

- **对象类型的多态**：==子类对象既属于子类，也属于父类==
- **对象标识的多态**：==**父类的引用或指针**既可以引用或指向父类对象，也可以引用或指向子类对象==
- **消息的多态**：==发给父类对象的消息也能发给子类对象，但它们会给出不同的解释（处理）==

### 7.1 多态的基本语法

多态分为两类：

- 静态多态：函数重载 和 运算符重载 属于静态多态，复用函数名

- 动态多态：派生类和虚函数实现运行时多态

静态多态和动态多态区别：

- 静态多态的函数地址早绑定 - **编译阶段**确定函数地址

- 动态多态的函数地址晚绑定 - **运行阶段**确定函数地址

```cpp
class Animal
{
public:
    // 加关键字 virtual 变为虚函数，那么编译器在编译时不能确定函数调用
    virtual void speak()
    {
        cout << "animal speak" << endl;
    }
};

class Cat : public Animal
{
public:
    void speak()
    {
        cout << "cat speak" << endl;
    }
};

// 我们希望传入什么对象，那么就调用什么对象的函数
// 如果函数地址在编译阶段就确定，那么静态联编
// 如果函数地址在运行阶段才确定，就是动态联编

void doSpeak(Animal &animal) // 父类的指针或引用 指向子类对象
{
    animal.speak();
}

void test1()
{
    Cat cat;
    doSpeak(cat); // cat speak
    // 如果父类 speak 不加 virtual 则输出 animal speak
}
```

再插入个 PPT 的示例代码

```cpp
class A
{    
public:
    A() { f(); }
    virtual void f();
    void g();
    void h() { f(); g(); }
};
class B: public A
{   
public:
    void f();
    void g();
};

int main(){
    B b;     // A::A(), A::f, B::B()
    A *p = &b; // 构造函数返回之后，对象才可正常使用
    p->f();  // B::f    
    p->g();  // A::g
    p->h();  // A::h, B::f, A::g
}
```

总结：

动态多态的满足条件

- **有继承关系**
- **重写父类的虚函数**

动态多态的使用：

- **父类的指针或引用 指向子类对象**

重写：函数**返回值类型、函数名、参数列表完全一致**

重载：函数名相同，**参数列表必须不同**（类型、个数、顺序），==返回值类型可以不同==

### 7.2 多态的原理剖析

对于上面的 `Animal` 类，如果 `speak` 函数未加 `virtual` ，那么 `sizeof()` 的结果为 `1` ，因为是空类

而加了 `virtual` 后，`sizeof()` 的结果为 `8` （64位机器），因为编译器为类对象添加了一个**虚函数指针**（`vfptr`，virtual function pointer），指向**虚函数表**（`vftable`，virtual function table）

虚函数指针，指向虚函数表，表内记录虚函数的地址 `&Animal::speak`

子类继承父类时，会继承父类的虚函数指针和虚函数表，但如果**子类重写了父类的虚函数**，那么子类中的虚函数表内虚函数的地址会替换成子类的函数地址 `&Cat::speak`

当父类的指针或引用指向子类对象时，发生多态

### 7.2+ 虚函数补充

#### (0) 类型相容

类型相容（也叫 “赋值相容”）是 C++ 公有继承体系中的重要规则，指==派生类对象可以在特定场景下被当作基类对象使用，是实现多态的基础之一==

假设 class B: public A：

- 对象直接赋值 `A a; B b; a = b;`
  - 合法，但存在 **“对象切片”（slicing）** 问题
  - ==派生类 B 的对象 b 赋值给基类 A 的对象 a 时，只有 B 中属于 A 的部分会被复制，B 自身新增的属性会被 “截断”==
  - 此时 a 的身份完全是基类对象，派生类的属性已不存在
- 指针赋值 `B* pb; A* pa = pb;`
  - 合法，是多态的核心场景之一
  - 基类指针 pa 可以直接指向派生类对象 pb（前提是公有继承）。此时 pa 指向的是 B 对象中属于 A 的部分，但通过虚函数可以实现 “运行时动态绑定”，调用派生类的重写方法（这也是虚函数的价值）
  - 对象的身份未发生变化，本质还是 B 对象
- 引用赋值 `B b; A &a = b;`
  - 合法，与指针场景类似
  - 基类引用 a 可以直接绑定到派生类对象 b。a 是 b 的 “别名”，指向 b 中属于 A 的部分，派生类的属性可通过合法方式访问（如公有成员）
  - 对象身份也未发生变化，本质还是 B 对象

```cpp
class A{};

class B : public A{};

int main()
{
    A  a;
    B  b;

    a = b;   //OK,
    // b = a;   //Error
    
    A &r_a = b;    //OK
    A *p_a = &b;   //OK
    
    // B &r_b = a;    //Error
    // B *p_b = &a;   //Error
}
```

#### (1) 限制

- 如果基类中被定义为虚成员函数，则派生类中对其重定义的成员函数均为虚函数（父虚子虚）
- 类的成员函数才可以是虚函数
- 静态成员函数不能是虚函数
- 内联成员函数不能是虚函数
- 只有通过基类的指针或引用访问基类的虚函数时才进行动态绑定
- 构造函数不能是虚函数，==析构函数可以（往往）是虚函数==
- **类的构造函数和析构函数中对虚函数的调用不进行动态绑定**

```cpp
class A
{
public:
    A() { f(); }
    ~A() { f(); }
    virtual void f();
    void g();
    void h() { f(); g(); }
};

class B : public A
{
public:
    B();
    ~B();
    void f();
    void g();
};

int main()
{
    A* p;      // p 是 A 类指针
    p = new A; // p 指向 A 类对象，调用 A::A() 和 A::f
    p->f();    // 调用 A::f
    p->g();    // 调用 A::g
    p->h();    // 调用 A::h、A::f 和 A::g
    delete p;  // 调用 A::~A() 和 A::f
    
    p = new B; // p 指向 B 类对象，调用 B::B()、A::A() 和 A::f（基类构造函数对虚函数调用采用静态绑定）
    p->f();    // 调用 B::f
    p->A::f(); // 调用 A::f，对基类名受限的虚函数调用采用静态绑定
    p->g();    // 调用 A::g，对非虚函数的调用采用静态绑定
    p->h();    // 调用 A::h、B::f 和 A::g
    delete p;  // 调用 A::~A() 和 A::f（基类析构函数对虚函数调用采用静态绑定），没有调用 B::~B()
}
```

#### (2) ==虚函数对访问控制 “无效”==

C++ 的访问控制是**编译时的静态检查**机制：编译器在编译阶段，会检查代码是否违反类的封装规则（例如：外部代码是否试图访问 private 成员）。若违反，直接报编译错误

虚函数的多态是**运行时的动态绑定**机制：虚函数通过 “虚函数表（vtable）” 实现运行时多态 —— 程序运行时，会根据对象的实际类型（而非指针 / 引用的声明类型），调用对应的派生类虚函数实现

因此，访问控制是纯编译期的语法检查，运行时不存在 “访问控制” 的概念 —— 程序运行时，内存中只有数据和函数的二进制指令，没有 “public/private” 的标记

而虚函数的多态是运行时的行为，它依赖于 “虚函数表” 的动态查找，因此会绕过派生类中虚函数的访问控制修饰符（只要基类的调用在编译时合法）

```cpp
class Base
{
public:
    virtual void func()
    {
        cout << "Base" << endl;
    }
};

class Son : public Base
{
private: // 修改为 private
    void func() override // 重写虚函数
    {
        cout << "Son" << endl;
    }
};

void test1()
{
    Base* son1 = new Son;
    son1->func(); // 即使 private，依然正确运行输出 Son
}
```

> 插个 ppt 代码

```cpp
struct B {
protected:
    virtual void f() {}
};
struct D : B {
public:
    void f() override {}  // 放宽为 public
};

int main() {
    D d;
    d.f(); // 直接调用，检查 D::f，是 public
    B* pb = &d;
    pb->f(); // ❌编译期按 B::f 检查，B::f 是 protected，类外不可
}
```

#### (3) 基类指针（引用）转子类

利用虚函数机制，我们可以通过基类的指针或引用来访问派生类中对基类重定义的成员函数

但==有时，我们需要通过基类的指针或引用来访问派生类中新定义的成员函数，这时，需要采用显式类型转换把基类指针或引用转换成派生类指针或引用==

```cpp
class A
{
    int x;
public:
    virtual void f() {}
};

class B : public A
{
    int y;
public:
    void f() {}
    void g() { y++; }
};

int main()
{
    A* p = new B; // OK，基类的指针可以指向派生类对象
    p->f();       // OK，调用 B 的 f（动态绑定）
    // p->g();    // Error，因为 A 中没有 g
    ((B*)p)->g(); // OK，调用 B 的 g
}
```

把基类指针或引用强制转换成派生类指针或引用有时是不安全的

如上述代码中 `((B*)p)->g();`，通过类 B 的 y 修改了不属于 A 类对象内存空间中的值

为了防止上面从基类指针到派生类指针的转换所带来的不安全性问题，我们可以采用 C++ 的动态类型转换操作（dynamic_cast）来实现从基类指针到派生类指针的转换

```cpp
B *q = dynamic_cast<B *>(p);
if (q != NULL) q->g();
```

上面的 `dynamic_cast` 类型转换操作在进行类型转换时，要根据 p 实际指向的对象类型来判断转换的合法性，如果合法，则进行转换并返回转换后的对象地址；否则，返回 NULL

### 7.3 纯虚函数和抽象类

在多态中，通常父类中虚函数的实现是毫无意义的，主要都是调用子类重写的内容

因此可以将虚函数改为**纯虚函数**

纯虚函数语法为 `virtual 返回值类型 函数名(参数列表) = 0;` （==大括号变等于零==）

当类中有了纯虚函数，这个类也称为**抽象类**

**抽象类特点**：

- ==无法实例化对象==
- ==子类必须重写抽象类中的纯虚函数==，==否则也属于抽象类==

```cpp
class Base
{
public:
    virtual void func() = 0;
};

class Son : public Base
{
public:
    virtual void func()
    {
        cout << "Son" << endl;
    };
};

void test1()
{
    // Base b;  // 报错，抽象类无法实例化对象
    // new Base; // 报错，抽象类无法实例化对象
    // Son s; // 如果无 virtual void func() {}; 同上报错
    Base* b = new Son;
    b->func(); // Son
}
```

#### 抽象类补充

因为使用类时要见到类的定义，**使用者可以通过指针的原始操作来绕过访问控制**

```cpp
// A.h
class A
{   int i,j;
public:
    A(int x,int y);
    void f(int x);
};
// B.cpp
#include "A.h"
void func(A *p)
{   p->f(2); // Ok
    p->i = 1; // Error
    p->j = 2; // Error
    *((int *)p) = 1; // Ok，访问 p 所指向的对象的成员 i
    *((int *)p+1) = 2; // Ok，访问 p 所指向的对象的成员 j
}
```

上面的问题可以通过给类 A ==提供一个抽象基类来解决==，用这个抽象基类把类 A 的数据表示隐藏起来

```cpp
// I_A.h
class I_A // A 的抽象基类，作为 A 的对外接口
{
public:
    virtual void f(int) = 0;
};

// A.cpp
#include "I_A.h"
class A: public I_A // A 的实现
{   int i,j;
public:
    A(int x,int y);
    void f(int x);
};

// B.cpp
#include "I_A.h"
void func(I_A *p)
{   p->f(2); // Ok
    // 这里不知道 p 所指向的对象有哪些数据成员，因此，无法访问它的数据成员
}
```

### 7.4 虚析构和纯虚析构

多态使用时，如果子类中有属性开辟到堆区，那么父类指针在释放时无法调用到子类的析构函数

> 当父类指针指向子类对象时，指针的 “静态类型” 是父类，而对象的 “动态类型” 是子类。
> 若父类的析构函数 不是虚函数，delete父类指针时，编译器会根据指针的 “静态类型”（父类）调用父类的析构函数，完全忽略对象的实际类型（子类）。
> 因此，子类中在堆区开辟的资源，其释放逻辑在子类析构函数中，此时无法被调用，导致内存泄漏。

解决方式：将父类中的析构函数改为**虚析构**或者**纯虚析构**

虚析构和纯虚析构共性:

- 可以解决父类指针释放子类对象
- 都需要有具体的函数实现（**纯虚析构类外实现**）

虚析构和纯虚析构的区别：

- 如果是纯虚析构，该类属于抽象类，无法实例化对象

虚析构语法：

- `virtual ~类名() {}`

纯虚析构语法：

- `virtual ~类名() = 0;`
- `类名::~类名(){}` 类外实现

```cpp
class Animal
{
public:
    Animal()
    {
        cout<<"Animal Constructor"<<endl;
    }
    virtual void speak() = 0;
    virtual ~Animal()
    {
        cout<<"Animal Destructor"<<endl;
    }
};

class Cat : public Animal
{
public:
    string *name;
    Cat(string name)
    {
        cout << "Cat constructor" << endl;
        this->name = new string(name);
    }
    void speak()
    {
        cout << *name <<" cat speak" << endl;
    }
    ~Cat()
    {
        if (name != nullptr)
        {
            cout << "Cat destructor" << endl;
            delete name;
            name = nullptr;
        }
    }
};

void test1()
{
    Animal *a = new Cat("Tom");
    a->speak();
    // 父类指针在析构时不会调用子类的析构函数，导致子类如果有堆区属性会内存泄漏
    delete a;
}
```

如果父类析构函数不加 `virtual`

```md
Animal Constructor
Cat constructor
Tom cat speak
Animal Destructor
```

如果父类析构函数加 `virtual`

```md
Animal Constructor
Cat constructor
Tom cat speak
Cat destructor
Animal Destructor
```

如果要实现为纯虚析构函数，注意要在类外实现（为什么一定要实现？父类也有可能有数据开辟到堆区）

```cpp
class Animal
{
public:
    Animal()
    {
        cout<<"Animal Constructor"<<endl;
    }
    virtual void speak() = 0;
    virtual ~Animal() = 0;
};

Animal::~Animal()
{
    cout<<"Animal Destructor"<<endl;
}
```

总结：

- ==虚析构或纯虚析构就是用来解决通过父类指针释放子类对象==
- ==如果子类中没有堆区数据，可以不写虚析构或纯虚析构==
- ==拥有纯虚析构函数的类也属于抽象类==

### 7.5 补充

#### 接口

##### “双层多态”：水路两用车

- Vehicle 类为 Car 和 Boat 的抽象基类，有一个访问权限为 protected、string 类型的成员 name
- Vehicle 类有一个 `drive()` 纯虚函数，不同子类的重写（overwrite）方式不同，详见样例
- AmphibianCar 类继承 Car 和 Boat 两个基类，满足以下要求：
  - AmphibianCar 类仍继承 Car 和 Boat 两个基类, 并额外实现 2 个方法 `driveAsCar()` 与 `driveAsBoat()`（参考样例1）
  - 当通过不同的父类指针绑定函数时，drive() 函数将根据父类的指针类型输出不同内容，以体现多态性。具体来说，当父类指针为 Car 时，`drive()` 的输出与 `driveAsCar()` 一致；为 Boat 时，与 `driveAsBoat()` 一致 （参考样例2）

```cpp
// 样例一
Vehicle* C = new Car("My car");
C->drive(); // 输出Vehicle name + " drive on road"
Vehicle* B = new Boat("My boat");
B->drive(); // 输出Vehicle name + " drive on river"
AmphibianCar* A = new AmphibianCar("My amphibian car");
A->driveAsCar(); // 输出Vehicle name + " drive on road as car"
A->driveAsBoat(); // 输出Vehicle name + " drive on river as boat"

// 样例二
AmphibianCar* A = new AmphibianCar("My amphibian car");
Car* CarMode = A;
Boat* BoatMode = A;
CarMode->drive(); // 将Car中的drive()方法重写为driveAsCar()
BoatMode->drive(); // 将Boat中的drive()方法重写为driveAsBoat()

class Vehicle // 抽象基类
{
protected:
    string name;
public:
    Vehicle(string name) : name(name){}
    virtual void drive() = 0;
};
```

对于样例一，很容易想到 Car 和 Boat 类中分别重写 `drive()` 函数，再给 AmphibianCar 类实现 `driveAsCar()` 和 `driveAsBoat()` 函数即可

而由于菱形继承，很容易会想到用虚继承，这里先暂且这样使用

```cpp
class Car : virtual public Vehicle
{
public:
    explicit Car(string s) : Vehicle(s) {}
    void drive() override
    {
        cout << name << " drive on road" << endl;
    }
};

class Boat : virtual public Vehicle
{
public:
    explicit Boat(string s) : Vehicle(s) {}
    void drive() override
    {
        cout << name << " drive on river" << endl;
    }
};

class AmphibianCar : public Car, public Boat
{
public:
    explicit AmphibianCar(const string& s) : Vehicle(s), Car(s), Boat(s) {}
    void drive() override {}
    void driveAsCar() const
    {
        cout << name << " drive on road as car" << endl;
    }
    void driveAsBoat() const
    {
        cout << name <<" drive on river as boat" << endl;
    }
};
```

而对于样例二，如果按照上述虚继承的做法，无论父类指针是 Car 还是 Boat，都会调用到子类 AmphibianCar 中的 `drive()` 函数

那么自然会想到如果能在 `drive()` 中根据父类指针类型而调用不同的函数，即可解决这个问题

实际可行吗？不可行，无法判断父类指针类型，因为父类指针的静态类型是父类，而对象的动态类型是子类，使用 `typeid()` 也只会返回 AmphibianCar

那么能不能使得 Car 和 Boat 不落入子类的同一个 `drive()`，而各干各的？

可以，取消虚继承，并且子类不重写 `dirve()`，这样父类可以调用到本身的 `drive()`，但是怎么体现子类多态性？

> 不直接重写 `drive()` 函数，而是将父类的 `drive()` 作为一个接口，子类重写父类的接口的两个函数

```cpp
class Car : public Vehicle
{
public:
    explicit Car(string s) : Vehicle(s) {}
    void drive() override
    {
        driveCar();
    }
protected:
    virtual void driveCar()
    {
        cout << name << " drive on road" << endl;
    }
};

class Boat : public Vehicle
{
public:
    explicit Boat(string s) : Vehicle(s) {}
    void drive() override
    {
        driveBoat();
    }
protected:
    virtual void driveBoat()
    {
        cout << name << " drive on river" << endl;
    }
};

class AmphibianCar : public Car, public Boat
{
public:
    explicit AmphibianCar(const string& s) : Car(s), Boat(s) {}

    void driveAsCar() const
    {
        cout << Car::name << " drive on road as car" << endl;
    }
    void driveAsBoat() const
    {
        cout << Boat::name <<" drive on river as boat" << endl;
    }
protected:
    void driveCar() override
    {
        driveAsCar();
    }
    void driveBoat() override
    {
        driveAsBoat();
    }
};
```

##### “全局函数虚化”：左移操作符重载

> 再提一下，由于第一个参数不是自定义类型，故只能全局函数重载

```cpp
class Point2D
{
    friend ostream& operator<<(ostream&, const Point2D&);
protected:
    int x, y;
public:
    Point2D(int x, int y) : x(x), y(y) {}
};

class Point3D : public Point2D
{
    friend ostream& operator<<(ostream&, const Point2D&);
    int z;
public:
    Point3D(int x, int y, int z) : Point2D(x, y), z(z) {}
};

ostream& operator<<(ostream& os, const Point2D& p)
{
    os << p.x << "," << p.y << endl;
    return os;
}

int main()
{
    cout << Point3D(4,5,6); // 4,5
}
```

那如果我再重载一个全局函数 `ostream& operator<<(ostream& os, const Point3D& p)` 作为 Point3D 的友元

```cpp
ostream& operator<<(ostream& os, const Point3D& p)
{
    os << p.x << "," << p.y << "," << p.z << endl;
    return os;
}

int main()
{
    Point3D p(4,5,6);
    Point2D& q = p;
    cout << q; // 4,5
}
```

多态性无法体现，q 输出不是子类实际指向的内容

而全局函数是不可能作为虚函数的，怎么虚化？

同样应用接口

```cpp
class Point2D
{
    friend ostream& operator<<(ostream&, const Point2D&);
protected:
    int x, y;
public:
    Point2D(int x, int y) : x(x), y(y) {}
    virtual void display(ostream& out) const
    {
        out << "(" << x << ", " << y << ")" << endl;
    }
};

class Point3D : public Point2D
{
    // 
    int z;
public:
    Point3D(int x, int y, int z) : Point2D(x, y), z(z) {}
    void display(ostream& out) const override
    {
        out << "(" << x << ", " << y << ", " << z << ")" << endl;
    }
};

ostream& operator<<(ostream& os, const Point2D& p)
{
    p.display(os);
    return os; // 可以链式使用
}
```

子类中甚至不需要写入友元函数，使用 `cout << Point3D(4,5,6)` 时子类隐式转换为父类，而 display 是虚函数，会调用到子类的 `display()`，从而实现多态

##### 构造函数虚化

```cpp
class NLComponent {};
class TextBlock : public NLComponent {};
class Graphic : public NLComponent {};
class NewsLetter
{
    list<NLComponent *> components;
public:
    explicit NewsLetter(istream& str)
    {
        while (str)
            components.push_back(readComponent(str));
    }
    NewsLetter(NewsLetter& rhs) // 拷贝构造函数
    {
        for (list<NLComponent *>::iterator it = rhs.components.begin();
                it != rhs.components.end(); ++it )
        components.push_back(...); // new TextBlock? Graphic?
    }
    static NLComponent * readComponent(istream& str);
};
```

```cpp
virtual NLComponent * clone() const = 0;

virtual TextBlock * clone() const
{  return new TextBlock(*this); }

virtual Graphic  * clone() const
{  return new Graphic (*this); }

NewsLetter::NewsLetter( const NewsLetter& rhs)
{
    for ( list<NLComponent *>::iterator it=rhs.component.begin();
       it != rhs.component.end(); ++it )
    component.push_back((*it)->clone());
}
```

##### “多态”数组

```cpp
class BST {...};

class BalancedBST : public BST {...};

void printBSTArray(ostream& s, const BST array[], int numElements)
{
    for (int i = 0; i < numElements; i++) s << array[i];
}

int main()
{
    BalancedBST bBSTArray[10];
    printBSTArray(cout, bBSTArray, 10);
}
```

非常危险，如果子类大小与父类不一致，循环中 `i++` 的偏移量按照父类的进行，出现严重错误

## 8  补充：转移构造函数

在C++中，**转移构造函数（Move Constructor）** 是 C++11 引入的特性，用于将一个对象（通常是临时对象或即将销毁的对象）的资源“转移”给另一个对象，而非进行耗时的深拷贝。其核心目的是减少不必要的资源复制，提升程序性能

### 8.1 背景知识

- 左值（lvalue）：**可以取地址、有明确内存位置（有名字）、生命周期较长**
- 右值（rvalue）：**不能取地址、无明确内存名称、生命周期短暂**
- 右值引用（Rvalue Reference）：语法为 `T&&`，专门用于绑定右值，核心目的是：
  - 延长右值（临时对象）的生命周期
  - 避免不必要的拷贝（利用 “移动语义”，复用临时对象的资源）

非常量引用可以绑定到左值，常量引用可以绑定到左值或右值

- 如果非常量引用绑定右值，可能出现“修改临时变量”这样不安全和无意义的情况
- 常量引用会将右值（临时对象）的生命周期延长至与自身一致

```cpp
class A{};

A getA()
{
    return A();
}

int main()
{
    int a = 1;
    int &b = a;          // 非常量引用绑定到左值，OK
    const A &c = getA(); // 常量绑定到右值，OK
    // A &aa = getA();   // 非常量引用绑定到右值，ERROR
    A &&aa = getA();     // 右值引用绑定到右值，OK
    A ta = getA();      // 拷贝初始化（或被编译器优化为直接构造），OK
    b = 2;
    cout << a << endl;   // 2
}
```

### 8.2 转移构造函数的定义

转移构造函数的参数是**右值引用**，语法形式为：  

```cpp
类名(类名&& 源对象) noexcept {
    // 转移源对象的资源到当前对象
    // 将源对象的资源指针置空（避免源对象析构时释放资源）
}
// 示例
A(A&& other) noexcept {
    p = other.p;
    other.p = nullptr;
}
```

- **右值引用（`&&`）**：专门用于绑定右值（临时对象或被 `std::move` 转换的对象），确保转移构造仅在“源对象生命周期即将结束”时被调用
- **`noexcept`**：通常会添加此关键字，表明转移构造不会抛出异常，这对容器（如 vector）的性能优化很重要（容器会优先选择不抛异常的转移操作）

### 8.3 核心作用

传统的**拷贝构造函数**会对资源（如动态内存、文件句柄、网络连接等）进行深拷贝（复制资源内容），而转移构造函数直接“窃取”源对象的资源所有权（仅复制资源指针），并将源对象的资源指针置空。这避免了资源的重复创建和销毁，大幅提升效率

### 8.4 应用场景

当对象管理“昂贵资源”（如大内存、文件句柄），且源对象是**临时对象**（右值）或**即将被销毁的对象**（通过 `std::move` 转换为右值）时，转移构造函数能显著优化性能。常见场景包括：  

1. 函数返回大对象（返回的临时对象会触发转移）
2. 容器（如 vector、map）插入临时对象
3. 用 `std::move` 主动转移资源所有权

### 8.5 代码示例详解

下面通过一个管理动态字符串的 `MyString` 类，对比拷贝构造和转移构造的区别，直观展示转移构造的作用。

#### 8.5.1 类定义（包含转移构造）

```cpp
class MyString {
private:
    char* data; // 管理的动态内存资源

public:
    // 普通构造函数：初始化资源
    MyString(const char* str = "") {
        cout << "普通构造函数被调用" << endl;
        if (str == nullptr) {
            data = new char[1];
            *data = '\0';
        } else {
            data = new char[strlen(str) + 1];
            strcpy(data, str); // 复制字符串内容
        }
    }

    // 拷贝构造函数：深拷贝（性能差）
    MyString(const MyString& other) {
        cout << "拷贝构造函数被调用（深拷贝）" << endl;
        data = new char[strlen(other.data) + 1];
        strcpy(data, other.data); // 复制资源内容
    }

    // 转移构造函数：转移资源（性能优）
    // 也可以使用成员初始化表实现
    MyString(MyString&& other) noexcept {
        cout << "转移构造函数被调用（资源转移）" << endl;
        // 1. 窃取源对象的资源
        data = other.data;
        // 2. 将源对象的资源指针置空（避免源对象析构时释放资源）
        other.data = nullptr;
    }

    // 析构函数：释放资源
    ~MyString() {
        cout << "析构函数被调用，释放资源" << endl;
        if (data != nullptr) {
            delete[] data;
            data = nullptr;
        }
    }

    // 打印字符串内容（辅助函数）
    void print() const {
        if (data != nullptr) {
            cout << "内容：" << data << endl;
        } else {
            cout << "内容：（空）" << endl;
        }
    }
};
```

#### 8.5.2 测试场景与输出分析

```cpp
int main() {
    // 场景1：用左值初始化（调用拷贝构造）
    MyString s1("hello"); // 普通构造
    MyString s2 = s1;     // s1是左值，调用拷贝构造（深拷贝）
    s1.print(); // 内容：hello（s1仍拥有资源）
    s2.print(); // 内容：hello（s2复制了资源）


    // 场景2：用临时对象初始化（调用转移构造）
    MyString s3 = MyString("world"); // 临时对象是右值，调用转移构造
    s3.print(); // 内容：world（s3窃取了临时对象的资源）


    // 场景3：用std::move转换左值为右值（调用转移构造）
    MyString s4 = std::move(s1); // s1被转为右值，调用转移构造
    s4.print(); // 内容：hello（s4窃取了s1的资源）
    s1.print(); // 内容：（空）（s1的资源已被转移，指针为空）
}
```

#### 8.5.3 输出结果与解释

```md
普通构造函数被调用           // s1初始化
拷贝构造函数被调用（深拷贝）  // s2 = s1（左值，深拷贝）
内容：hello                 // s1的资源未被影响
内容：hello                 // s2复制了s1的资源
普通构造函数被调用           // 临时对象MyString("world")初始化
转移构造函数被调用（资源转移）// s3 = 临时对象（右值，转移资源）
析构函数被调用，释放资源      // 临时对象析构（此时data已为空，无实际释放）
内容：world                 // s3拥有转移来的资源
转移构造函数被调用（资源转移）// s4 = std::move(s1)（s1转为右值，转移资源）
内容：hello                 // s4拥有转移来的资源
内容：（空）                // s1的资源已被转移，指针为空
析构函数被调用，释放资源     // s4析构（释放"hello"）
析构函数被调用，释放资源     // s3析构（释放"world"）
析构函数被调用，释放资源     // s2析构（释放"hello"的拷贝）
析构函数被调用，释放资源     // s1析构（data为空，无实际释放）
```

### 8.6 关键总结

1. **转移构造 vs 拷贝构造**：  
   - 拷贝构造：深拷贝资源（复制内容），源对象仍拥有资源
   - 转移构造：转移资源所有权（仅复制指针），源对象失去资源（指针为空）

2. **何时调用**：仅当源对象是**右值**时触发，如临时对象（可以是调用一个全局函数 `return` 的）或 `std::move` 转换的对象

3. **核心价值**：避免昂贵资源的重复拷贝，尤其适合大对象或高频操作场景（如容器操作、函数返回大对象），显著提升性能

### 8.7 补充之补充

#### 8.7.1 移动赋值运算符

本质是重载赋值运算符以处理 “右值” —— 核心作用是给已存在的对象赋予一个 “右值对象” 的资源，通过 “接管资源” 而非 “深拷贝” 提升效率，避免不必要的内存开销

```cpp
class MyArray {
public:
    //…
    MyArray &operator=(ArrayWrapper &&other) {
        size = other.size;
        arr = other.arr;
        other.arr = NULL;
        return *this;
    }
}

int main() {
    MyArray myArr;
    myArr = MyArr(5);
}
```

#### 8.7.2 右值的分类

- **纯右值**（prvalue）：
  - 无实体资源的纯粹数据值，仅用于提供数据
  - 无堆内存、文件句柄等可转移资源；基本类型或无资源的临时对象均属于此类
  - 主要来源
    1. 各类字面量（如 `10`、`3.14`、"`abc"`、`true`）
    2. 算术 / 比较等表达式结果（如 `a+b`、`x!=y`）
    3. 非引用返回的基础类型 / 无资源临时对象（如 `func()` 返回 `int`）
    4. 无捕获或按值捕获的 lambda 表达式
  - 不可直接修改，例如 `5=6`、`(a+b)=10` 均报错，强制修改（如 `const_cast` ）不推荐
  - 无法取地址，`&5`、`&(a+b)` 等写法均编译报错
  - 可绑定到 `const T&` 或 `T&&`，绑定到 `T&&` 时也无资源可转移
  - 移动与拷贝等价，无性能优化价值（如 `std::move(5)` 无意义）
- **将亡值**（xvalue）：
  - 持有可转移资源，且生命周期即将结束的对象
  - 有堆内存、容器数据、网络连接等可转移资源
  - 主要来源
    1. `std::move()` 转换后的对象（如 `std::move(string s)`）；
    2. 函数返回的 `T&&` 类型对象（如返回 `string&&` 的函数）；
    3. 强制转换为 `T&&` 的对象（如 `static_cast<string&&>(s)`）；
    4. 右值引用的成员访问结果
  - 可修改，例如 `std::move(s).clear()`、`std::move(vec).push_back(1)` 均合法
  - 可以取地址，`&std::move(s)`、`&static_cast<string&&>(s)` 语法合法
  - 优先绑定到 `T&&`（触发移动），也可绑定到 `const T&`（触发拷贝）
  - 移动可接管资源，大幅减少拷贝开销，是性能优化的核心场景

#### 8.7.3 右值的“退化”

> 具名的右值引用在表达式中会被视为左值，因为它们是可寻址的、有名字的、有存储空间的

```cpp
void process(int&& r) {}

void handle(int&& rv) {
    // 1. rv 的类型是 int&& (右值引用)
    // 2. 但在表达式中，rv 是一个"左值" (因为它有名字)
    
    // 你可以像操作普通变量一样操作它
    rv = 10; 
    
    // process(rv);          // 错误：无法将左值 (rv) 绑定到右值引用参数
    process(std::move(rv));  // 正确：std::move 将 rv 转换为右值 (xvalue)
}
```

严格来说，不是 “右值退化为左值”，而是 “右值引用变量本身是左值”：右值被右值引用绑定后，它的生命周期被延长，但引用变量 rv 本身是有名字、可寻址的，所以是左值

#### 8.7.4 `std::forward<T>()`

```cpp
void process(const string& s) {
    cout << "处理左值：由于 copy，比较慢" << endl;
}
void process(string&& s) {
    cout << "处理右值：直接 Move，非常快" << endl;
}

template <typename T>
void transfer(T&& arg) {
    process(arg); // 有名字，实则左值，copy
}
int main() {
    transfer(string("world")); // 全是 copy
}
```

万能引用：

- ==模板中 T&& 不是 “右值引用”，而是万能引用（也叫 “转发引用”）==，它**能接收左值和右值两种实参**
- 但万能引用有个 “坑”：函数内部，参数本身是左值 —— 因为它有名字（`void transfer(T&& arg)` 的 `arg`），编译器会将其视为左值，导致原始值类别丢失

怎么解决这个问题？

- `std::forward<T>()`：仅在模板万能引用场景中使用，目的是将参数的原始值类别完整转发给下游函数，实现 “输入是什么值类别，输出就是什么值类别”，即 “完美转发”

```cpp
void process(const string& s) {
    cout << "处理左值：由于 copy，比较慢" << endl;
}
void process(string&& s) {
    cout << "处理右值：直接 Move，非常快" << endl;
}

template <typename T>
void transfer(T&& arg) {
    process(std::forward<T>(arg));
}
int main() {
    string s = "Hello World!";
    transfer(s); // copy
    transfer(std::move(s)); // move
}
```

- 底层逻辑：**引用折叠**，这里先不展开 // todo?

#### 8.7.5 `std::move`

// todo?

## 9 override 和 final

在C++11及之后的标准中，`final`和`override`是两个用于增强类继承和虚函数重写安全性的关键字。它们的核心作用是**明确程序员的意图**，并让编译器在编译阶段就能检测出继承或重写中的错误（如拼写错误、函数签名不匹配等）

> 先插个 ppt 代码

```cpp
struct B {
    virtual void f1(int) const;
    virtual void f2 ();
    void f3 ();
    virtual void f5 (int) final;
};
struct D: B {
    void f1(int) const override; // 正确：f1 与基类中的 f1 匹配
    void f2(int) override ; // 错误：B 没有形如 f2(int) 的函数
    void f3 () override ; // 错误： f3 不是虚函数
    void f4 () override ; // 错误： B 没有名为 f4 的函数
    void f5 (int) ; // 错误： B已经将f5声明成final
}
```

### 9.1 `override`关键字  

`override`仅用于**派生类的虚函数**，作用是：**显式声明该函数是对基类中某个虚函数的重写**。  
编译器会检查：如果基类中没有与当前函数签名完全一致的虚函数，或当前函数并未真正重写基类虚函数（如函数名拼写错误、参数/返回值不匹配），则会直接报错

#### 9.1.1. 正确使用`override`（重写成功）  

```cpp
#include <iostream>
using namespace std;

class Base {
public:
    // 基类声明虚函数
    virtual void print() const {
        cout << "Base::print()" << endl;
    }

    virtual int add(int a, int b) {
        return a + b;
    }
};

class Derived : public Base {
public:
    // 用override声明：该函数重写Base的print()
    // 编译器会检查Base是否有对应的虚函数，签名是否一致
    void print() const override {  // 正确：与Base的print()签名完全一致
        cout << "Derived::print()" << endl;
    }

    // 重写Base的add()，并添加override
    int add(int a, int b) override {  // 正确：签名一致
        return (a + b) * 2;
    }
};

int main() {
    Base* ptr = new Derived();
    ptr->print();  // 多态生效：调用Derived::print()
    cout << ptr->add(1, 2) << endl;  // 调用Derived::add()，输出6
    delete ptr;
}
```

**输出**：  

```md
Derived::print()
6
```

**说明**：`Derived`中的`print()`和`add()`通过`override`明确声明重写基类函数，编译器验证通过，多态正常生效

#### 9.1.2 错误使用`override`（重写失败，编译器报错）  

如果派生类函数的签名与基类虚函数不一致，`override`会触发编译错误（这正是它的价值）：  

```cpp
class Base {
public:
    virtual void foo() { cout << "Base::foo()" << endl; }
    virtual void bar(int x) { cout << "Base::bar(" << x << ")" << endl; }
};

class Derived : public Base {
public:
    // 错误1：函数名拼写错误（foo写成fooo），基类中无fooo()虚函数
    void fooo() override {  // 编译报错：'fooo' marked 'override' but does not override any member function
        cout << "Derived::fooo()" << endl;
    }

    // 错误2：参数列表与基类bar()不一致（基类是int x，这里无参数）
    void bar() override {  // 编译报错：'bar' marked 'override' but does not override any member function
        cout << "Derived::bar()" << endl;
    }
};
```

**说明**：`override`强制编译器检查重写的有效性，避免因拼写错误或参数不匹配导致的“伪重写”（函数实际是派生类的新函数，而非重写，多态会失效）

### 9.2 `final`关键字  

`final`有两种用法：  

1. **修饰类**：表示该类**不能被继承**（即“最终类”）。  
2. **修饰虚函数**：表示该虚函数**不能被派生类进一步重写**（即“最终虚函数”）。  

#### 9.2.1 `final`修饰类（禁止继承）  

```cpp
class FinalClass final {  // 用final修饰，该类不能被继承
public:
    void func() { cout << "FinalClass::func()" << endl; }
};

// 错误：尝试继承被final修饰的类
class DerivedFromFinal : public FinalClass {  // 编译报错：cannot derive from 'final' base 'FinalClass' in derived type 'DerivedFromFinal'
};
```

**说明**：`FinalClass`被`final`标记后，任何尝试继承它的类都会触发编译错误，确保类的“最终形态”。

#### 9.2.2 `final`修饰虚函数（禁止重写）  

```cpp
class Base {
public:
    // 基类声明虚函数，并标记为final：派生类不能重写该函数
    virtual void foo() final {
        cout << "Base::foo()" << endl;
    }

    virtual void bar() {
        cout << "Base::bar()" << endl;
    }
};

class Derived : public Base {
public:
    // 错误：尝试重写被final修饰的foo()
    void foo() override {  // 编译报错：'foo' marked 'override' but is not virtual
        cout << "Derived::foo()" << endl;
    }

    // 正确：bar()未被final修饰，可以重写
    void bar() override {
        cout << "Derived::bar()" << endl;
    }
};
```

**说明**：基类的`foo()`被`final`标记后，派生类`Derived`尝试重写时会报错；而`bar()`未被标记，可正常重写。

### 9.3 总结  

| 关键字   | 作用场景                          | 核心价值                                                                 |
|----------|-----------------------------------|--------------------------------------------------------------------------|
| `override` | 派生类的虚函数                    | 确保函数确实重写了基类虚函数，编译阶段检测签名不匹配、拼写错误等问题。   |
| `final`   | 1. 修饰类（禁止继承）<br>2. 修饰虚函数（禁止重写） | 限制类的继承关系或虚函数的重写链，确保类或函数的“最终形态”，避免被意外修改。 |

**使用建议**：  

- 派生类重写基类虚函数时，尽量添加`override`，明确意图并借助编译器检查错误。  
- 当类或虚函数确定不需要被继承/重写时（如工具类、核心逻辑函数），用`final`标记，增强代码安全性。

## 10 聚合 VS 组合

类之间的**整体与部分**的关系可以分为:

聚合关系

- **被包含的对象可以脱离包含它的对象独立存在**，==被包含的对象与包含它的对象独立创建和消亡==
- ==聚合类的成员对象一般采用**对象指针**表示==，用于指向被包含的成员对象，==被包含的成员对象是在外部创建，然后加入聚合类对象中来的==

组合关系

- **被包含的对象不能脱离包含它的对象独立存在**，==被包含的对象由包含它的对象创建并随着包含它的对象的消亡而消亡==
- ==组合类的成员对象一般直接是对象==，有时也可以采用对象指针表示，但不管是什么表示形式，成员对象一定是在组合类对象内部创建并随着组合类对象消亡的

例如，一个公司与它的员工之间是聚合关系，而一个人与他的头、手和脚之间则是组合关系

```cpp
class A {};

class B // B 与 A 是聚合关系
{   A *pm; // 指向成员对象
public:
    B(A *p) { pm = p; } // 成员对象在聚合类对象外部创建，然后传入
    ~B() { pm = NULL; } // 传入的成员对象不再是聚合类对象的成员
};

class C // C 与 A 是组合关系
{   A *pm; // 指向成员对象
public:
    C() { pm = new A; } // 成员对象随组合类对象在内部创建
    ~C() { delete pm; } // 成员对象随组合类对象消亡
};


int main()
{
    A *pa = new A; // 创建一个 A 类对象
    B *pb = new B(pa); // 创建一个聚合类对象，其成员对象是 pa 指向的对象
    C *pc = new C; // 创建一个组合类对象，其成员对象在组合类对象内部创建

    delete pb; // 聚合类对象消亡了，其成员对象并没有消亡，还可以用在其他地方
    delete pc; // 组合类对象与其成员对象都消亡
    delete pa; // 聚合类对象原来的成员对象消亡
}
```

用指针表示成员对象时，既可以实现组合关系，也可以实现聚合关系，它们的区别在于：

- 在聚合关系中，成员对象不由包含它的对象创建和撤销
- 在组合关系中，成员对象是由包含它的对象创建和撤销

---

### VS 继承

例：**利用一个线性表类实现一个队列类**

```cpp
class LinearList
{   ......
public:
    bool insert( int x, int pos ); 
    bool remove( int &x,  int pos ); 
    int element( int pos ) const; 
    int search( int x ) const; 
    int length( ) const;
};
```

- Queue 的实现 1（组合）

```cpp
class Queue
{   LinearList list; //与队列对象同时创建和消亡
public:
    bool en_queue(int i) 
    {   return list.insert(i,list.length()); 
    }
    bool de_queue(int &i) 
    {   return list.remove(i,1); 
    }
};
```

- Queue 的实现 2（继承）

```cpp
class Queue: private LinearList 
{public:
    bool en_queue(int x)
    {   return insert(x,length());
    }
    bool de_queue(int &x)
    {   return remove(x,1);
    }
};
```

- 这里为什么不用 public 继承？（==首先不是 is-a，其次可以使用线性表的其他接口==）
- 实际上，private 继承已经退化成组合了！

---

在基于继承的代码复用中，一个类向外界提供两种接口：

- public：对象（实例）用户
- public+protected：派生类用户

在基于聚合/组合的代码复用中，一个类对外只需一个接口：

- public：所有用户
  - 被包含的类（LinearList）的接口被封装在内部，外部用户接触不到
  - 只有当前类（Queue）自己的 public 接口，对 “所有用户” 开放（Queue 只暴露 en_queue / de_queue）

继承的代码复用功能常常可以用组合来实现

继承更容易实现子类型：

- 在C++中，public 继承的派生类往往可以看成是基类的子类型
- 在需要基类对象的地方可以用派生类对象去替代
- 发给基类对象的消息也能发给派生类对象

具有聚合/组合关系的两个类不具有子类型关系！
