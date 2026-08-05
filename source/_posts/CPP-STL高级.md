---
title: C++ STL高级
mathjax: true
date: 2026-03-20 15:35:21
categories: C++
tags: C++
---

## 1 variant

### 1.1 union

union 的所有成员 **共享同一块内存的起始地址**，不存在独立的内存空间。具体来说：

- 所有成员的内存起始地址完全相同
- union 的总大小 = 最大成员的大小（内存对齐）
- 对任意一个成员赋值，会覆盖其他成员的内存数据（因为共用一块空间）

#### 1.1.1 经典用法示例

```cpp
union Matrix
{
    struct
    {
        double a11, a12, a13, a21, a22, a23, a31, a32, a33;
    };
    double elem[3][3];
    // 结构体与数组共用内存，故既可按结构体成员访问，也可按数组索引
};

int main()
{
    Matrix matrix{};
    for (int i = 0; i < 3; i++)
    {
        for (int j = 0; j < 3; j++)
        {
            matrix.elem[i][j] = i*j;
        }
    }
    cout << &matrix.elem << endl; 
    cout << &matrix.a11 << endl; // 地址相同

    cout << matrix.a22 << endl; // elem[1][1]
}
```

共享内存可以带来便捷，以下这个例子对共享内存的应用更为犀利

```cpp
enum FIGURE_TYPE { LINE, RECTANGLE, ELLIPSE };

struct Line
{
    FIGURE_TYPE t;
    int x1, y1, x2, y2;
};

struct Rectangle
{
    FIGURE_TYPE t;
    int lef, top, rig, bot;
};

struct Ellipse
{
    FIGURE_TYPE t;
    int x, y, r;
};

union FIGURE
{
    FIGURE_TYPE t;
    Line line;
    Rectangle rect;
    Ellipse ellipse;
};

void input(FIGURE fig[], const int size)
{
    int t;
    for (int k = 0; k < size; k++)
    {
        cin >> t;
        switch (t)
        {
        case LINE:
            fig[k].t = LINE;
            cin >> fig[k].line.x1 >> fig[k].line.y1
                >> fig[k].line.x2 >> fig[k].line.y2;
            break;
        case RECTANGLE:; // 略
        case ELLIPSE:; // 略
        }
    }
}

void draw(const FIGURE& figure)
{
    switch (figure.t)
    {
    case LINE: cout << figure.line.x1 << endl; break;// 示意性，具体略
    case RECTANGLE: cout << figure.rect.lef << endl; break;
    case ELLIPSE: cout << figure.ellipse.x << endl; break;
    }
}

int main()
{
    FIGURE fig[100];
    input(fig, 100);
    for (const auto & f : fig) draw(f);
}
```

> 为什么各个结构体与联合体中第一个元素均为 `FIGURE_TYPE t` ?

- 初始化时，先给联合体赋类型，再 “实例化” 为某个结构体的时候，因为**这个类型变量的内存地址与结构体中类型变量的地址相同**，故并未被 “覆盖” 而是继续保存了下来，并且后续可以直接调用 `figure.t` （而非结构体的类型变量，如 `figure.Line.t`）来获取类型

> *多态的味道：“一个接口，多种形态” —— 消除调用者对具体类型的依赖，实现代码的通用性*

如果还要加一个 color 与 size 的属性怎么办？

类似类型参数，必须每个结构体与联合体中保证内存一致的前提下再加一个 color 与 size 的变量，此时代码显得冗杂，不如使用类的继承

#### 1.1.2 union 的局限

```cpp
union variant_t { int i; double d; };

int main()
{
    variant_t v{};
    v.i = 6;
    std::cout << v.d << std::endl; // UB
}
```

- 1、类型不安全
- 2、无法知道当前存储的类型

> 往联合体中塞一个用索引表示类型的结构体变量，再使用某种复杂的嵌套结构来发挥其作用？

```cpp
struct Variant {
    int m_index;
public:
    Variant() : m_index(-1) {}
};

union variant_t
{
    int i;
    double d;
    char c;
    Variant v;
};
```

但实际上是无法使用的，由于 Variant 修改了默认构造函数，编译器无法为包含 non-trivial 成员的联合体生成合法的构造 / 析构函数

- 3、类型局限性
- 4、any 是运行时检查
- 5、继承与多态也有局限性

### 1.2 variant

variant 是 C++17 标准库引入的，其作用与 union 类似，但解决了 union 的局限性，并且是类型安全的、编译时检查的

- `std::get<>()` 一种模板函数，尖括号 <> 中是「索引（整数）」或「类型」

```cpp
#include <variant>
using namespace std;
int main()
{
    variant<int,double,string> v;
    v = 42;
    v = 3.14;
    v = "hello";
    try
    {
        cout << get<string>(v) << endl;
        // cout << get<float>(v) << endl; // 编译器报错
        // cout << get<int>(v) << endl; // 运行时异常，会被捕获
    }
    catch (bad_variant_access& e)
    {
        cout << "Wrong type acess: " << e.what() << endl;
    }
}
```

当然也有避免异常处理的做法：

- varian 的 `index()` 方法获取当前 variant 中存储的类型索引
- `holds_alternative<T>(v)` 检查 variant 中是否包含类型 T 的值

```cpp
    cout << "Current index: " << v.index() << endl; // 0-based，2

    if (holds_alternative<int>(v)) 
        cout << "Holds an int: " << get<int>(v) << endl;
    else if (holds_alternative<double>(v)) 
        cout << "Holds a double" << endl;
```

### 1.3 Visitor 模式

#### 1.3.1 场景

- 开发者正在维护一个矢量图形库（Graphics Library），其中包含稳定的基础图形类（如 Circle, Rectangle）。这些类目前主要负责几何计算（如 area()）

新增需求

- 现在的业务方提出新要求：需要将画布上的所有图形导出为 XML 格式，以便保存或传输

设计挑战与约束

- 单一职责原则 (SRP)：Shape 类应该只关注几何属性（半径、长宽），不应该包含复杂的 IO 或格式化逻辑（如 XML 生成代码）
- 开闭原则 (OCP)：我们预见到未来还会有导出 JSON、PDF 或进行压缩的需求，我们不希望每次增加新操作都去修改稳定的 Shape 基类

#### 1.3.2 传统实现

每个操作都作为虚函数直接添加到 Shape 基类中

- 违背单一职责原则：图形类里塞满了业务逻辑
- 违背开闭原则：每次增加新操作，都需要修改基类和所有子类

#### 1.3.3 类继承与 Visitor 模式

```Mermaid
classDiagram
    class Shape {
        <<Abstract>>
        +accept(IShapeVisitor*)
    }

    class Circle {
        +radius: double
        +accept(v)
    }

    class Rectangle {
        +width: double
        +height: double
        +accept(v)
    }

    class IShapeVisitor {
        <<Abstract>>
        +visitCircle(Circle*)
        +visitRectangle(Rectangle*)
    }

    class DrawVisitor {
        +visitCircle(Circle*)
        +visitRectangle(Rectangle*)
    }

    class XMLVisitor {
        +visitCircle(Circle*)
        +visitRectangle(Rectangle*)
    }

    class CompressVisitor {
        +visitCircle(Circle*)
        +visitRectangle(Rectangle*)
    }

    %% 继承关系
    Shape <|-- Circle
    Shape <|-- Rectangle
    
    IShapeVisitor <|-- DrawVisitor
    IShapeVisitor <|-- XMLVisitor
    IShapeVisitor <|-- CompressVisitor

    %% 依赖关系与伪代码注释
    Circle ..> IShapeVisitor : v->visitCircle(this)
    Rectangle ..> IShapeVisitor : v->visitRectangle(this)
```

```cpp
class Circle;
class Rectangle;

class ShapeVisitor
{
public:
    virtual ~ShapeVisitor() = default;
    virtual void visitCircle(Circle *circle) = 0;
    virtual void visitRectangle(Rectangle *rectangle) = 0;
};

class Shape // Shape 基类（只负责结构，不负责操作）
{
public:
    virtual ~Shape() = default;
    virtual void accept(ShapeVisitor *v) = 0;
    virtual double area() = 0;
};

class Circle : public Shape
{
public:
    double radius;
    explicit Circle(double r) : radius(r) {}
    void accept(ShapeVisitor *v) override
    {
        v->visitCircle(this); // 双重分发
    }
    double area() override { return this->radius * this->radius * 3.14; }
};

class Rectangle : public Shape
{
public:
    int width, height;
    Rectangle(int w, int h) : width(w), height(h) {}
    void accept(ShapeVisitor *v) override
    {
        v->visitRectangle(this); // 双重分发
    }
    double area() override { return this->width * this->height; }
};

class DrawVisitor : public ShapeVisitor
{
public:
    void visitCircle(Circle *c) override
    {
        std::cout << "Draw circle(r=" << c->radius << ")\n";
    }
    void visitRectangle(Rectangle *r) override
    {
        std::cout << "Draw rectangle\n";
    }
};

class XMLVisitor : public ShapeVisitor
{
public:
    void visitCircle(Circle *c) override
    {
        std::cout << "Exporting Circle (r=" << c->radius << ") to XML\n";
    }
    void visitRectangle(Rectangle *r) override
    {
        std::cout << "Exporting Rectangle to XML\n";
    }
};


int main() {
    const std::vector<Shape *> shapes = {
        new Circle{5.0},
        new Rectangle{10, 20}
    };

    XMLVisitor xmlExporter;
    for (auto s : shapes) {
        s->accept(&xmlExporter); // 通过 Visitor 执行操作
    }
    DrawVisitor drawExporter;
    for (auto s : shapes)
    {
        s->accept(&drawExporter);
    }
}
```

访问者模式 (Visitor Pattern) 是一种行为型设计模式，它允许你在不改变对象结构的前提下，定义作用于这些对象的新操作

核心思想：

- 将数据结构与数据操作分离
- 通过"双重分发" (Double Dispatch) 机制实现多态
- 遵循"开闭原则"：对扩展开放，对修改关闭

双重分发：

- 单分发（普通多态）：

```cpp
Shape * s = new Circle();
s->draw(); // 只根据 s 的类型决定调用哪个 draw
```

- 双重分发（Visitor 模式）：

```cpp
Shape * s = new Circle();
Visitor * v = new DrawVisitor();
s->accept(v); 
// 第一次分发：根据 s 的类型
// 第二次分发：根据 v 的类型
```

Visitor 需要知道每个具体 Element 的信息来创建 visit 函数

Element 需要知道 Visitor 来调用 visit 函数，将自己传给 Visitor

| 对比项   | 传统虚函数方式       | Visitor模式         |
|----------|----------------------|---------------------|
| 添加新操作 | 需修改基类和所有子类 | 只需添加新的Visitor类 |
| 添加新类型 | 只需添加新子类       | 需修改所有Visitor类  |
| 代码耦合   | 操作与结构耦合       | 操作与结构解耦       |
| 编译影响   | 修改基类影响大       | 新操作不影响现有代码 |
| 适用场景   | 操作类型稳定         | 操作类型频繁变化     |

- ❌ 破坏封装：要求元素公开内部状态
- ❌ 增加新元素类困难
- ❌ 对象结构变化会影响所有访问者

#### 1.3.4 variant 与 Visitor 模式

对于 variant 简单来说，就是将 variant 的类型信息作为参数传递给一个函数，由函数根据类型信息来处理 variant 中的值

优势

- 不需要基类 Shape
- 不需要虚函数
- 类型安全（编译期检查）

#### 1.3.5 访问方式 std::visit

```cpp
std::visit(Visitor visitor, Variant v);
```

核心功能

- std::visit 是 C++ 标准库提供的函数模板，用于将一个访问器（Visitor）应用到 std::variant 内部存储的具体数据上

工作原理

- 自动识别：检查 variant 当前存的是哪个类型
- 自动匹配：去 Visitor 里找对应的重载函数如：operator() (Circle) 或 operator() (Rectangle)。
- 编译期安全：如果少写了某种类型的处理逻辑，编译器会直接报错

```cpp
// 纯数据类 (无需继承，无需 accept)
struct Circle { double radius; };
struct Rectangle { double w, h; };

//  定义类型集合
using Shape = variant<Circle, Rectangle>;

// 定义访问者 (使用 struct 重载 () 操作符)
struct DrawVisitor {
    void operator()(const Circle &c) {
        cout << "Drawing Circle r=" << c.radius << "\n";
    }
    void operator()(const Rectangle&r)
    {
        cout << "Drawing Rectangle r=" << r.w << " " << r.h << "\n";
    }
};
struct XMLVisitor {
    void operator()(const Circle &c) {}
    void operator()(const Rectangle&r) {}
};

int main() {
    vector<Shape> shapes = {
        Circle{5.0},
        Rectangle{10, 20}
    };

    //  使用 std::visit
    DrawVisitor draw;
    XMLVisitor xml;
    for (const auto& s : shapes) {
        visit(draw, s);
        visit(xml, s);
    }
    return 0;
}
```

```cpp
#include <variant>
using namespace std;

using MyVariant = variant<int, double, string>;

struct Visitor
{
    void operator()(const int i) const
    {
        std::cout << "Got int: " << i << std::endl;
    }
    void operator()(const double d) const
    {
        std::cout << "Got double: " << d << std::endl;
    }
    void operator()(const std::string& s) const
    {
        std::cout << "Got string: " << s << std::endl;
    }
};

void handleVariant(const MyVariant& v)
{
    visit([](const auto& arg)
    {
        using T = std::decay_t<decltype(arg)>;
        if constexpr (std::is_same_v<T, int>)
        {
            std::cout << "Got an int: " << arg << '\n';
        }
        else if constexpr (std::is_same_v<T, double>)
        {
            std::cout << "Got a double: " << arg << '\n';
        }
        else if constexpr (std::is_same_v<T, std::string>)
        {
            std::cout << "Got a string: " << arg << '\n';
        }
    }, v);
}

int main()
{
    MyVariant v1 = 42;
    MyVariant v2 = 3.14;
    MyVariant v3 = "hello";
    Visitor visitor;
    std::visit(visitor, v1);
    std::visit(visitor, v2);
    std::visit(visitor, v3);

    handleVariant(v1);
    handleVariant(v2);
    handleVariant(v3);
}
```

## 2 any

```cpp
#include <any>
using namespace std;
int main() {
    any a = 1;
    a = any_cast<int>(a) + 1;
    cout << any_cast<int>(a) << endl;
    a = 1.5;
    cout << any_cast<double>(a) << endl;
    a = string("hello");
    cout << any_cast<string>(a) << endl;
}
```

- 类型安全（type-safe）
  - 可以安全封装任意类型的单个值
  - 通过 std::any_cast 进行类型安全的取值
- 运行时多态
  - 值的类型在运行时确定，而不是编译期固定
- 语义与限制
  - 支持空值状态（默认构造时为空）
  - 值必须可拷贝构造
  - 支持拷贝、移动拷贝、移动赋值

### 2.1 .type()

`const type_info& t = a.type();`

```cpp
void print_any(const any& a)
{
    if (a.type() == typeid(int))
    {
        std::cout << std::any_cast<int>(a) << std::endl;
    }
    else if (a.type() == typeid(double))
    {
        std::cout << std::any_cast<double>(a) << std::endl;
    }
    else if (a.type() == typeid(std::string))
    {
        std::cout << std::any_cast<std::string>(a) << std::endl;
    }
    else
    {
        std::cout << "Unkonw" << std::endl;
    }
}
```

### 2.2 any_cast

- `std::any_cast<T>(any_obj)`

不匹配时抛出 `std::bad_any_cast`

```cpp
any obj = 42;
try
{
    double d = any_cast<int>(obj);
    // double d = any_cast<double>(obj); // bad_any_cast异常
    cout << "succeed: " << d << "\n";
}
catch (const bad_any_cast& e)
{
    cout << "type error: " << e.what() << endl;
}
```

- `std::any_cast<T>(&any_obj)`

当使用取指针的方式调用 any_cast 时，如果类型不匹配，并不会抛出异常，而是返回 nullptr

```cpp
any obj = 42;
auto p = std::any_cast<int>(&obj);
// auto p = std::any_cast<double>(&obj); //type error
if (p != nullptr)
{
    std::cout << "succeed: " << *p << "\n";
}
else
{
    std::cout << "type error\n";
}
```

### 2.3 reset & has_value

- 默认构造为空值
- has_value() 判断是否有值
- reset() 清空内容

```cpp
any obj;
cout << "obj type: " << obj.type().name() << endl; // v
cout << "has value: " << obj.has_value() << endl;  // 0
obj = 42;
cout << "obj type: " << obj.type().name() << endl; // i
cout << "has value: " << obj.has_value() << endl;  // 1
obj.reset();
cout << "obj type: " << obj.type().name() << endl; // v
cout << "has value: " << obj.has_value() << endl;  // 0
```

注意：不要使用 `typeid(obj).name()` 来判断 any 的类型，否则只会返回编译器生成的类型名 `St3any`，而不是实际存储的类型名

### 2.4 any 的结构

![any struct](../Z_img/AnyStruct.png)

> 细节（包括 variant 的结构）暂不展开，直接看 ppt

### 2.5 any vs. variant

Type

- std::any
  - 编译期未确定，运行时检查
- std::variant
  - 编译期确定、检查
  - 运行时仅检查当前存放数据的激活索引是否匹配

Visit

- std::any
  - 需通过 any_cast，即调用 handler，并通过 typeid 检查确认类型是否匹配
  - 含一次函数调用开销和类型比较开销
- std::variant
  - `std::get<T>(v)` 或 `std::get<I>(v)`
  - 类型 T /索引 I 在编译期已知，内部直接转换为索引访问（调用 `__get_alt<I>(...)`，直接返回存储对象的引用）

### 2.6 补充：struct 的内存对齐

```cpp
struct A { char c; short s; int i; float f; };
struct B { char c; int i; short s; float f; };
```

struct A - 较优的排序

成员顺序：char c (1字节) -> short s (2字节) -> int i (4字节) -> float f (4字节)

内存布局：

- char 占 1 字节
- short 需要从偶数地址开始，所以中间补了 1 个填充字节
- 后续 int 和 float 均自然对齐

总大小：1 + 1(Padding) + 2 + 4 + 4 = 12 字节

---

struct B - 较差的排序

成员顺序：char c (1字节) -> int i (4字节) -> short s (2字节) -> float f (4字节)

内存布局：

- char 占 1 字节
- int 需要从 4 的倍数地址开始，所以中间必须补 3个填充字节
- short 占 2 字节。

float 需要 4 字节对齐，short 之后可能还需要填充

总大小：16 字节

## 3 tuple

`std::tuple`（元组）是一个**固定大小的、可以包含不同类型数据的集合**

可以把它看作是一个**没有名字的结构体 (Struct)**，或者是 `std::pair` 的升级版（`pair` 只能存 2 个元素，`tuple` 可以存 N 个）

以下是 `std::tuple` 的主要用途和核心场景：

### 3.1 函数返回多个值 (最常见的用法)

```cpp
// m1
void func1(int &i, float &f) { i = 1; f = 3.0f;}
void test1()
{
    int i; float f;
    func1(i,f);
    cout << i << f;
}

// m2
struct Rtn { int i; float f; };
Rtn func2() { return { 1, 3.0f }; }
void test2()
{
    auto r = func2();
    cout << r.i << r.f;
}

// m3
tuple<int,float> func3() { return { 1, 3.0f }; }
void test3()
{
    auto r = func3();
    // cout << get<0>(r) << get<1>(r); // 丑且 magic number

    // int i; float f;
    // std::tie(i,f) = r; // 可用 std::tie 解包，但不如结构化绑定
    // cout << i << f << endl;

    auto [i,f] = r; // 结构化绑定，C++ 17
    cout << i << f << endl;
}
```

### 3.2 临时组合相关数据

当你需要将几个不同类型的数据放在一起传递，但又不想专门为此定义一个 `struct` 时，`tuple` 非常好用

- 场景：你在一个容器中存储数据，比如 `std::vector`
- 例子：存储一系列的三维坐标点 $(x, y, z)$

```cpp
std::vector<std::tuple<int, int, int>> points;
points.emplace_back(1, 2, 3);
points.emplace_back(4, 5, 6);
```

### 3.3 作为 `std::map` 的 Key

`std::tuple` 自带了比较运算符（它会按顺序比较元素：先比第一个，如果相等再比第二个……）

这使得它非常适合作为 `std::map` 或 `std::set` 的键值（Key），而不需要你需要自己重载 `<` 运算符

示例：需要根据坐标来索引地图上的物体

```cpp
#include <map>
#include <tuple>

std::map<std::tuple<int, int>, std::string> mapData;

mapData[{10, 20}] = "Treasure";
mapData[{5, 5}] = "Trap";

// 自动支持查找
if (mapData.count({10, 20})) {
    // 找到了宝藏
}
```

> 但如果是 unordered_map 则不允许这样用，只能 `unordered_map<int,unordered_map<int,string>>`

### 3.4 批量赋值与解包 (`std::tie`)

在 C++17 之前，如果你想把 tuple 的值解包给现有的变量，或者是为了实现某些排序逻辑，`std::tie` 很有用

```cpp
int myInt;
double myDouble;
std::tuple<int, double> t(10, 3.14);

// 将 tuple 中的值“系”到变量上
std::tie(myInt, myDouble) = t;
// 现在 myInt = 10, myDouble = 3.14

std::tie(std::ignore, myInt) = t;
cout << myInt << endl; // 3，把 3.14 绑到了 int
```

*注：C++17 引入结构化绑定后，`std::tie` 的使用频率降低了，但在只想要部分返回值时配合 `std::ignore` 还是很有用*

#### 3.4.1 Tuple vs Struct：什么时候用哪个？

这是很多开发者困惑的地方。既然 `tuple` 能存不同类型，`struct` 也能，怎么选？

| 特性 | std::tuple | struct / class |
| :--- | :--- | :--- |
| **可读性** | **差**。成员通过 `get<0>`, `get<1>` 访问，没有语义名字 | **好**。成员有名字（如 `user.name`, `user.age`） |
| **定义便捷性** | **高**。不需要预先声明类型，直接写 `tuple<int, float>` | **低**。需要先写 `struct MyData {...};` |
| **用途** | 适合**临时**的数据组合、函数多返回值、通用编程 | 适合**长期**使用、业务逻辑核心的数据结构 |
| **比较操作** | **自动支持** (Lexicographical comparison) | 需要手动重载 `operator<` 或 `operator==` |

#### 3.4.2 总结

`std::tuple` 就像是一个**通用的、临时的容器包**

- 用它：当你只是想快速把几个数据绑在一起传给别人，或者从函数丢出来，且不想费劲去给这个组合起名字的时候
- 不用它：如果这个数据组合在你的代码里到处都要用，还是老老实实定义一个 `struct` 吧，否则几个月后你自己都忘了 `get<2>` 到底是 “分数” 还是 “身高”

## 4 optional

`std::optional` (C++17 引入) 是一个 **“可能为空” 的容器**

它专门用来表示一个值要么存在，要么不存在（std::nullopt）

它的出现是为了解决 C++ 中长期存在的一个痛点：如何优雅地表示 “没有值” 或 “失败” 的情况？

```cpp
unordered_map<string, int> userData;

int findUserID1(const string& username)
{
    if (userData.contains(username))
    {
        return userData[username];
    }
    return -1; // 用 -1 表示“未找到”
}

int* findUserID2(const string& username)
{
    if (userData.contains(username))
    {
        return new int(userData[username]);
    }
    return nullptr; // 用空指针表示“未找到”
}

bool findUserID3(const string& username, int& outID)
{
    if (userData.contains(username))
    {
        outID = userData[username];
        return true;
    }
    return false;
}
```

- 方法1：magic number
- 方法2：memory leak
- 方法3：addiotnal  parameter

> 都不够优雅

### `std::optional<T>` 用法

```cpp
#include <optional>
optional<int> findUserID4(const string& username)
{
    if (userData.contains(username))
    {
        return userData[username];
    }
    return nullopt;
}
```

在主程序中

- 可以当指针一样使用

```cpp
auto opt = findUserID4("Tom");
if (opt) // 这里也可以使用 opt.has_value() 作判断条件
{
    cout << "Success " << *opt  << endl; // 解引用
}
else
{
    cout << "Fail" << endl;
}
```

- 使用 `.value()` 方法获取值，如果为空则抛出异常

```cpp
auto opt = findUserID4("Tom");
try
{
    int id = opt.value();
}
catch (const bad_optional_access& e)
{
    cout << e.what() << endl;
}
```

- `.value_or()` 若为空则返回默认值，一行代码即可，推荐

```cpp
auto opt = findUserID4("Tom");
int id = opt.value_or(-1); // 若为空则 -1
```

## 5 malloc

~~*并非 C 语言的 malloc*~~

### 5.1 RAII

RAII（Resource Acquisition Is Initialization，==**资源获取即初始化**==）是 C++ 核心的编程范式，核心思想是**利用对象的生命周期自动管理资源**，从根本上解决资源泄漏问题

```cpp
void old_use(Args a) {
    auto q = new Blob(a); 
    // ... 
    if (foo) throw Bad();  // 会泄漏
    if (bar) return; // 会泄漏
    // ... 
    delete q; // 容易忘 
} 
```

```cpp
class int_ptr
{
    int* ptr;
public:
    int_ptr(int *p = 0) : ptr(p) {}
    ~int_ptr() { delete ptr; }
    int* operator->() const { return ptr;}
    int& operator *() const { return *ptr; }
};

void newer_use(Args a) { 
    auto p = int_ptr(new Blob(a)); // 栈上对象
    // ... 
    if (foo) throw Bad(); // 不会泄漏 
    if (bar) return; // 不会泄漏 
    // ... 
} 
```

### 5.2 auto_ptr（已弃用）

auto_ptr 是 C++98 标准 引入的第一个智能指针，定义在 `<memory>` 头文件的 std 命名空间中，核心目的是解决动态内存泄漏问题

但由于设计存在严重缺陷，C++11 已弃用，C++17 完全移除

```cpp
template<typename T>
class auto_ptr {
    T* ptr;
public:
    explicit auto_ptr(T* p = nullptr) : ptr(p) {}
    ~auto_ptr() { delete ptr; }
    T& operator*() const { return *ptr; }
    T* operator->() const { return ptr; }

    auto_ptr(auto_ptr& other) : ptr(other.release()) {}
    auto_ptr& operator=(auto_ptr& other) {
        if (this != &other) {
            delete ptr;
            ptr = other.release();
            // 反直觉的拷贝，实则转移
        }
        return *this;
    }

    T* release() {
        T* old_ptr = ptr;
        ptr = nullptr;
        return old_ptr;
    }
};

int main()
{
    auto_ptr<int> p1(new int(8)); // p1 拥有 10
    auto_ptr<int> p2 = p1; // 所有权从 p1 转移到 p2
    cout << *p2 << endl; // 8
    cout << *p1 << endl; // 崩溃，对 null 解引用
}
```

缺陷：

- 拷贝 / 赋值时的 “隐式所有权转移”
- 不能管理动态数组
  - 析构函数仅调用 delete，如果用来管理 new[] 分配的数组，会导致内存泄漏 + 未定义行为
- 无法安全放入 STL 容器
  - STL 容器（如 vector）的拷贝、排序等操作会触发元素的拷贝，而 auto_ptr 的拷贝会转移所有权，导致容器内的元素失效

### 5.3 unique_ptr

> auto_ptr 的最佳替代品，定义在 `<memory>` 头文件的 std 命名空间中

#### 5.3.1 禁止隐式拷贝（编译期拦截）

```cpp
// Deep Copy is denied
unique_ptr(const unique_ptr&) = delete;
unique_ptr& operator=(const unique_ptr&) = delete;
// ...
unique_ptr<int> p1(new int(8));
unique_ptr<int> p2 = p1; // 编译错误
```

#### 5.3.2 引入移动语义

```cpp
unique_ptr(unique_ptr&& other) noexcept : ptr(other.release()) {}
unique_ptr& operator=(unique_ptr&& other) noexcept {
    if (this != &other) {
        reset(other.release());
    }
    return *this;
}
// ...
unique_ptr<int> p1(new int(8));
unique_ptr<int> p2 = move(p1);
// 尽管编译器不报错，但显式 move 程序员也心中有数
cout << *p1 << endl; // 崩溃
```

#### 5.3.3 其他补充

两种初始化方式，优先用 `std::make_unique`

```cpp
// 方式 1：直接初始化
unique_ptr<int> p1(new int(42)); // 接管 int 类型的动态内存
// 方式 2：make_unique 初始化（C++14 推荐，避免裸 new，更安全）
auto p2 = make_unique<int>(100); // auto 自动推导
```

常用成员函数（核心操作）

|函数|作用|
|---|---|
|get()|返回管理的裸指针（仅查看，不要手动 delete）|
|reset()|释放当前内存，若传新指针则接管新内存；传 nullptr 仅释放当前内存|
|release()|释放所有权（返回裸指针，unique_ptr 变为空，需手动 delete 裸指针）|
|swap()|交换两个 unique_ptr 管理的内存|
|empty()|判断是否管理空指针（等价于 get() == nullptr）|

### 5.4 shared_ptr

C++11 引入的共享式智能指针，核心目标是解决 “多个对象需要共享同一块动态内存” 的场景，弥补 unique_ptr 独占所有权的不足

核心特性：

- 共享所有权：多个 shared_ptr 可以同时管理同一块动态内存
- 引用计数：内部维护一个 “引用计数器”，记录当前有多少个 shared_ptr 指向该内存
  - 拷贝 / 赋值时，引用计数 +1
  - shared_ptr 析构 / 释放所有权时，引用计数 -1
  - 当引用计数变为 0 时，自动调用 delete 释放内存（RAII 机制）

```cpp
shared_ptr<int> p1 = make_shared<int>(10);
cout << "p1 count: " << p1.use_count() << endl; // 1

auto p2 = p1;
cout << "p1 count: " << p1.use_count() << endl; // 2
*p2 = 100;
cout << *p1 << endl; // 100

shared_ptr<int> p3 = p2;
cout << "p3 count: " << p3.use_count() << endl; // 3
cout << "p1 count: " << p1.use_count() << endl; // 3
```

但 shared_ptr 也有其局限性：

- 循环引用：多个 shared_ptr 互相引用，导致引用计数无法归零，内存泄漏

```cpp
struct B; // 前置声明
struct A {
    shared_ptr<B> b_ptr; // A 持有 B 的共享指针
    ~A() { cout << "A 析构" << endl; } // 析构函数（验证是否释放）
};
struct B {
    shared_ptr<A> a_ptr; // B 持有 A 的共享指针
    ~B() { cout << "B 析构" << endl; }
};

int main() {
    {
        auto a = make_shared<A>();
        auto b = make_shared<B>();
        a->b_ptr = b; // A 指向 B
        b->a_ptr = a; // B 指向 A

        cout << a.use_count() << endl; // 输出 2（a 自己 + b->a_ptr）
        cout << b.use_count() << endl; // 输出 2（b 自己 + a->b_ptr）
    } // 出作用域，a 和 b 析构
    // 但实际上析构函数未执行！内存泄漏！
}
```

#### 补充：make_shared

shared_ptr是 C++ 里管理动态对象（比如new出来的对象）的智能指针，靠 “引用计数” 记录有多少个指针在用这个对象（计数为 0 就自动释放对象）。但它的问题是：

**引用计数的空间是单独分配的** —— 比如你写 `shared_ptr<int> p(new int(10))` 时，系统会分两次内存：

1. 给 `int(10)` 分配动态对象空间
2. 单独分配一块空间存 “引用计数”（初始是 1）

这两块空间是分开的，会多一次内存分配的开销

make_shared 的解决办法（==让动态对象 “自带” 引用计数==）

==make_shared是 C++ 标准库的模板函数，它的作用是把 “动态对象的空间” 和 “引用计数的空间” 合并成一块分配==：

比如写 **`auto p = make_shared<int>(10)`时，系统只分配一次内存，里面既存 `int(10)` 这个对象，也存对应的引用计数**

好处是：引用计数只占一份空间，所有指向这个对象的 shared_ptr 都共享它，同时少了一次内存分配，效率更高

### 5.5 weak_ptr

C++11 引入的弱引用智能指针，不能单独使用，核心作用是配合 shared_ptr 解决循环引用问题，不能单独管理任何资源

- 无所有权：weak_ptr 不拥有所指向的动态内存，仅作为 “观察者” 观察 shared_ptr 管理的资源
- 不影响引用计数：构造、拷贝、赋值 weak_ptr 时，不会增加 / 减少 shared_ptr 的引用计数
- 安全检测：可检测所观察的资源是否已被释放（避免访问已释放的内存）
- 间接访问：不能直接解引用访问资源，需先通过 `lock()` 转为 shared_ptr 后才能安全访问

#### 5.5.1 初始化

```cpp
// 步骤 1：创建 shared_ptr（必须先有 “所有者”）
auto sp = make_shared<int>(100);

// 方式 1：从 shared_ptr 初始化 weak_ptr（最常用）
weak_ptr<int> wp1 = sp; 
// wp1 仅观察 sp，sp 的引用计数仍为 1（关键！）
cout << "sp 的计数：" << sp.use_count() << endl; // 输出 1

// 方式 2：从另一个 weak_ptr 初始化
weak_ptr<int> wp2 = wp1;
cout << "sp 的计数仍为：" << sp.use_count() << endl; // 还是 1

// ❌ 错误：不能用裸指针初始化
// int* raw = new int(10);
// weak_ptr<int> wp3(raw);

// ❌ 错误：不能直接用 unique_ptr 初始化（需先转 shared_ptr）
// unique_ptr<int> up = make_unique<int>(20);
// weak_ptr<int> wp4 = up;
```

#### 5.5.2 常用成员函数

|函数|作用|
|---|---|
|lock()|返回一个 shared_ptr，资源未释放 → 返回有效 shared_ptr（计数 + 1）；资源已释放 → 返回空 shared_ptr|
|expired()|判断资源是否已被释放|
|use_count()|返回观察的 shared_ptr 当前的引用计数|
|reset()|清空 weak_ptr，不再观察任何资源|

- 注意：不能直接解引用 weak_ptr

#### 5.5.3 解决循环引用

```cpp
struct B;
struct A {
    shared_ptr<B> b_ptr; // A 仍持有 B 的强引用
    ~A() { cout << "A 析构" << endl; }
};
struct B {
    weak_ptr<A> a_ptr; // B 改为持有 A 的弱引用
    ~B() { cout << "B 析构" << endl; }
};

int main() {
    {
        auto a = make_shared<A>(); // a 计数 = 1
        auto b = make_shared<B>(); // b 计数 = 1
        a->b_ptr = b; // a 指向 b → b 计数 = 2
        b->a_ptr = a; // b 指向 a → a 计数仍为 1（弱引用不增加计数！）

        cout << a.use_count() << endl; // 输出 1
        cout << b.use_count() << endl; // 输出 2

        // （可选）B 中访问 A 的资源：通过 lock() 转 shared_ptr
        if (auto temp_a = b->a_ptr.lock()) {
            cout << "B 成功访问 A 的资源" << endl;
            cout << a.use_count() << endl; // 2
        } // temp_a 析构
    } // a 和 b 正常析构
}
```

- b->a_ptr 是 weak_ptr，绑定 a 后不会增加 a 的引用计数（a 计数始终为 1）
- 出作用域时，a 先析构 → 计数归 0 → A 内存释放
- a 释放后，a->b_ptr 也被销毁 → b 的计数从 2 减为 1，接着 b 析构 → 计数归 0 → B 内存释放
- 整个循环被打破，资源正常释放

#### 5.5.4 应用场景

##### 缓存

```cpp
using Key = std::string;
class Resource {
public:
    Resource() { std::cout << "Resource acquired\n"; }
    ~Resource() { std::cout << "Resource destroyed\n"; }
    void doSomething() { std::cout << "Doing something with Resource\n"; }
};

class Cache {
    unordered_map<Key, std::shared_ptr<Resource>> m_cache;
public:
    Cache() { std::cout << "Cache created\n"; }
    void clear() { m_cache.clear(); }
    ~Cache() { clear(); std::cout << "Cache destroyed\n"; }

    void addResource(Key key, std::shared_ptr<Resource> resource) {
        m_cache[key] = resource;
    }
    std::shared_ptr<Resource> getResource(Key key) {
        // ... Serach / create resource
        return m_cache[key]; // 调用者共享所有权
    }
    Cache(const Cache&) = delete;
    Cache& operator=(const Cache&) = delete;
    Cache(Cache&&) = delete;
    Cache& operator=(Cache&&) = delete;
};


int main() {
    Cache cache;
    Key key1 = "key1";
    {
        auto ptr = make_shared<Resource>();
        cache.addResource(key1, ptr);
        if(auto cached_ptr = cache.getResource(key1)) {
            cached_ptr->doSomething();
        }
    } // ptr 离开作用域，Resource 应析构

    if (auto cached_ptr = cache.getResource(key1)) {
        cout << "获取成功" << endl;
    } else {
        cout << "获取失败：资源已不存在" << endl;
    }
}
```

但却输出获取成功，原因是只要 Cache 对象存在，它里面存的所有 Resource 永远不会被释放，即使外部已经没有任何人使用该资源了，引用计数也至少是 1

- cache 应该持有 weak_ptr，只是 “观测” 资源，不干扰资源的生命周期

```cpp
class Cache {
    unordered_map<Key, std::weak_ptr<Resource>> m_cache; // 修改
public:
    Cache() { std::cout << "Cache created\n"; }
    void clear() { m_cache.clear(); }
    ~Cache() { clear(); std::cout << "Cache destroyed\n"; }

    void addResource(Key key, std::shared_ptr<Resource> resource) {
        m_cache[key] = resource;
    }
    std::shared_ptr<Resource> getResource(Key key) {
        // ... Serach / create resource
        return m_cache[key].lock(); // 修改
    }
    Cache(const Cache&) = delete;
    Cache& operator=(const Cache&) = delete;
    Cache(Cache&&) = delete;
    Cache& operator=(Cache&&) = delete;
};
```

输出获取失败：资源已不存在，符合预期

##### 双向链表

```cpp
struct Node { 
    std::string name;
    std::shared_ptr<Node> next; // next 持有 Node 的强引用
    std::weak_ptr<Node> prev; // prev 持有 Node 的弱引用
    
    Node(const std::string& n) : name(n) {}
    ~Node() {}
};
```

不多解释了，否则循环引用无法析构

##### 观察者模式

如果是 “从属” 关系，从属者指向拥有者时，应该用 weak_ptr

```cpp
class Teacher {
    std::vector<std::shared_ptr<Student>> student_;  // Teacher持有Student的强引用
};
class Student {
    std::weak_ptr<Teacher> teacher_;  // Student持有Teacher的弱引用
};
```

- Student 不 “控制” Teacher 的生命周期

### 5.6 shared_ptr 与 weak_ptr 的底层原理

> // todo? *去看 ppt 的动画*
