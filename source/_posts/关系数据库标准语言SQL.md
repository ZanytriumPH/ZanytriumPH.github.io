---
title: "第3章 关系数据库标准语言SQL"
date: 2026-08-08 11:04:00
tags: [数据库, SQL]
categories: [数据管理基础]
description: "第3章 关系数据库标准语言SQL"
---
## 1 SQL 概述

> 结构化查询语言，关系数据库的标准语言

包含：数据定义语言（DDL），数据操纵语言（DML），数据控制语言（DCL）

- 以分号 `;` 作为结束符
- 字符（串）或日期/时间类型的常量使用单引号 `‘’` 作为定界符

## 2 SQL 数据定义*

SQL 的数据定义功能: 模式定义、表定义、视图和索引的定义

| 操作对象 | 创建 | 删除 | 修改 |
| :--- | :--- | :--- | :--- |
| 模式 | `CREATE SCHEMA` | `DROP SCHEMA` | |
| 表 | `CREATE TABLE` | `DROP TABLE` | `ALTER TABLE` |
| 视图 | `CREATE VIEW` | `DROP VIEW` | |
| 索引 | `CREATE INDEX` | `DROP INDEX` | `ALTER INDEX` |

❑ **`CREATE SCHEMA`** <模式名> `AUTHORIZATION` <用户名> [<表定义子句>|<视图定义子句>|<授权定义子句>]

【例2.1】 为用户 WANG 定义一个学生-课程模式 S-T

- `CREATE SCHEMA S_T AUTHORIZATION WANG;`

【例2.2】 `CREATE SCHEMA AUTHORIZATION WANG;`

- 该语句没有指定<模式名>，<模式名>隐含为<用户名>
 
【例2.3】 为用户 ZHANG 创建了一个模式 TEST，并且在其中定义一个表 TAB1
```sql
CREATE SCHEMA TEST AUTHORIZATION ZHANG
    CREATE TABLE TAB1 (
        COL1 SMALLINT,
        COL2 INT,
        COL3 CHAR(20),
        COL4 NUMERIC(10,3),
        COL5 DECIMAL(5,2)
    );
```

❑ **`DROP SCHEMA`** <模式名> <CASCADE|RESTRICT>

- `CASCADE`（级联）
  - 删除模式的同时把该模式中所有的数据库对象（如表）全部删除
- `RESTRICT`（限制）
  - 如果该模式中定义了下属的数据库对象（如表、视图等），则拒绝该删除语句的执行
  - 仅当该模式中没有任何下属的对象时才能执行

❑ **`CREATE TABLE`** <表名>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(<列名> <数据类型>[<列级完整性约束条件>]
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [,<列名> <数据类型>[<列级完整性约束条件>]]
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; …
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [,<表级完整性约束条件>]);

【例2.4】建立一个学生选课表SC
```sql
CREATE TABLE SC (
    Sno CHAR(9),
    Cno CHAR(4),
    Grade SMALLINT,
    PRIMARY KEY (Sno,Cno),
    /* 主码由两个属性构成，必须作为表级完整性进行定义*/
    FOREIGN KEY (Sno) REFERENCES Student(Sno),
    /* 表级完整性约束条件，Sno是外码，被参照表是Student*/
    FOREIGN KEY (Cno) REFERENCES Course(Cno)
    /* 表级完整性约束条件，Cno是外码，被参照表是Course*/
);
```

| 数据类型 | 含义 |
| :--- | :--- |
| ``CHAR(n)``, ``CHARACTER(n)`` | 长度为 $n$ 的定长字符串 |
| ``VARCHAR(n)``, ``CHARACTERVARYING(n)`` | 最大长度为 $n$ 的变长字符串 |
| ``CLOB`` | 字符串大对象 |
| ``BLOB`` | 二进制大对象 |
| ``INT``, ``INTEGER`` | 长整数（4字节） |
| ``SMALLINT`` | 短整数（2字节） |
| ``BIGINT`` | 大整数（8字节） |
| ``NUMERIC(p, d)`` | 定点数，由 $p$ 位数字（不包括符号、小数点）组成，小数后面有 `$d$` 位数字 |
| ``DECIMAL(p, d)``, ``DEC(p, d)`` | 同 ``NUMERIC`` |
| ``REAL`` | 取决于机器精度的单精度浮点数 |
| ``DOUBLE PRECISION`` | 取决于机器精度的双精度浮点数 |
| ``FLOAT(n)`` | 可选精度的浮点数，精度至少为 $n$ 位数字 |
| ``BOOLEAN`` | 逻辑布尔量 |
| ``DATE`` | 日期，包含年、月、日，格式为 ``YYYY-MM-DD`` |
| ``TIME`` | 时间，包含一日的时、分、秒，格式为 ``HH:MM:SS`` |
| ``TIMESTAMP`` | 时间戳类型 |
| ``INTERVAL`` | 时间间隔类型 |

**常用的日期函数**：

- `GETDATE()` 返回当前的系统日期时间
- `DAY(...)` `MONTH(...)` `YEAR(...)` 返回给定日期的年月日

❑ **`ALTER TABLE`** <表名>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ ADD [COLUMN] <新列名> <数据类型> [ 完整性约束 ] ]
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ ADD <表级完整性约束>]
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ DROP [COLUMN] <列名> [CASCADE | RESTRICT] ]
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ DROP CONSTRAINT <完整性约束名> [RESTRICT | CASCADE] ]
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ ALTER COLUMN <列名> <数据类型> ];

【例2.5】向 Student 表增加 “入学时间” 列，其数据类型为日期型

- `ALTER TABLE Student ADD S_entrance DATE;`

【例2.6】将年龄的数据类型由字符型（假设原来的数据类型是字符型）改为整数

- `ALTER TABLE Student ALTER COLUMN Sage INT;`

【例2.7】增加课程名称必须取唯一值的约束条件

- `ALTER TABLE Course ADD UNIQUE(Cname);` 

❑ `DROP TABLE` <表名>[RESTRICT| CASCADE];

> 索引略

## 3 SQL 数据查询

```sql
SELECT [distinct] column_name_list|expressions|*
FROM table_name_list
[ WHERE search_condition ]
[ GROUP BY colname { , colname... }
  [ HAVING group_condition ] ]
[ ORDER BY colname [ASC| DESC] {, colname [ASC | DESC] ... } ];
```

### 3.1 单表查询

#### 3.1.1 SELECT

- 可以对 常量、表达式、内置函数 的计算结果进行投影
- 使用列别名改变查询结果的列标题
- 指定 `DISTINCT` 关键词，去掉查询结果表中重复的行

#### 3.1.2 WHERE

| 查询条件 | 谓词 |
| --- | --- |
| ① 比较 | `=`, `>`, `<`, `>=`, `<=`, `!=`, `<>`, `!>`, `!<` |
| ② 确定范围 | `BETWEEN ... AND ...`, `NOT BETWEEN ... AND ...` |
| ③ 确定集合 | `IN`, `NOT IN` |
| ④ 字符匹配 | `LIKE`, `NOT LIKE` |
| ⑤ 空值 | `IS NULL`, `IS NOT NULL` |
| ⑥ 多重条件（逻辑运算） | `AND`, `OR`, `NOT` |


**通配符：`%`（任意长度）、`_`（单个字符）**

- `a%b` 表示以 `a` 开头，以 `b` 结尾的任意长度的字符串
- `a_b` 表示以 `a` 开头，以 `b` 结尾的长度为 3 的任意字符串
> 一个汉字占两个字节，所以用连续两个通配符 `_` 来匹配任意一个汉字

**转义需要用 ESCAPE '\'**

【例3.1】查询以 "DB_" 开头，且倒数第 3 个字符为 i 的课程的详细情况

```sql
SELECT *
FROM Course
WHERE Cname LIKE 'DB\_%i__' ESCAPE '\'
```

**`IS NULL`、`IS NOT NULL` 中的 `IS` 不能用 `=` 代替**

#### 3.1.3 ORDER BY

- 升序：`ASC`；降序：`DESC`；缺省顺序为升序

#### 3.1.4 聚集函数

| 聚集函数 | 功能描述 |
| :--- | :--- |
| `COUNT(*)` | 统计元组个数 |
| `COUNT([DISTINCT\|ALL] <列名>)` | 统计一列中非空值的个数 |
| `SUM([DISTINCT\|ALL] <列名>)` | 计算一列值的总和（此列必须为数值型） |
| `AVG([DISTINCT\|ALL] <列名>)` | 计算一列值的平均值（此列必须为数值型） |
| `MAX([DISTINCT\|ALL] <列名>)` | 求一列值中的最大值 |
| `MIN([DISTINCT\|ALL] <列名>)` | 求一列值中的最小值 |

- 保留字 `DISTINCT` 可以用在 `SELECT` 子句和统计函数中
- 调用 `SUM`, `AVG`, `MAX`, `MIN` 聚集函数时，将首先剔除掉集合的空值元素，然后再进行统计计算

> [!note] 聚集函数：只能用在 SELECT 子句或 HAVING 子句中使用
> 在 `SELECT` 中将返回单条结果

#### 3.1.5 GROUP BY / HAVING

**在用 `GROUP BY` 对查询结果进行分组时，目标属性**

- 必须包含所有的分组属性
- 可以有、也可以没有聚集函数
- 除了上述两种目标属性外，不能再有其他的目标属性

【例3.2】 查询平均成绩大于等于 90 分的学生学号和平均成绩

> [!bug] WHERE 子句中不能用聚集函数作为条件表达式

```sql
SELECT Sno, AVG(Grade)
FROM SC
GROUP BY Sno
HAVING AVG(Grade)>=90;
```

#### 3.1.6 执行顺序

1. `FROM`：笛卡尔积 `FROM` 子句中的表
2. `WHERE`：抛弃不满足条件的元组
3. `GROUP BY`：根据子句对保留下来的元组进行分组
4. `HAVING`：对分组后的元组集合进行选择
5. `SELECT`：进行统计计算，一个分组对应一个结果
6. `ORDER BY`

### 3.2 连接查询

普通连接

```sql
SELECT Student.Sno, Sname
FROM Student, SC
WHERE Student.Sno = SC.Sno AND
  SC.Cno = '2' AND SC.Grade > 90;
```

自连接：在 `FROM` 中对表起别名

```sql
SELECT FIRST.Cno, SECOND.Cpno
FROM Course FIRST, Course SECOND
WHERE FIRST.Cpno = SECOND.Cno;
```

外连接：左外连接、右外连接

```sql
SELECT Student.Sno,Sname,Ssex,Sage,Sdept,Cno,Grade
FROM Student LEFT OUTER JOIN SC ON (Student.Sno=SC.Sno);
```

### 3.3 嵌套查询

> 一个 SELECT-FROM 语句称为一个查询块

- **不允许子查询中使用 `ORDER BY` 子句**

`WHERE` 子句中与嵌套查询有关的查询谓词主要有

1. `IN` 谓词：标量与集合量之间的属于比较

- expr [ NOT ] IN ( subquery )

2. 限定比较谓词：标量与集合中元素之间的量化比较

- expr 比较谓词 SOME|ANY|ALL ( subquery )

3. `EXISTS` 谓词：是否为空集的判断谓词
  
- [ NOT ] EXISTS ( subquery )


使用 `ANY` 或 `ALL` 谓词时必须同时使用比较运算（`SOME` 与 `ANY` 是同义词）

| 谓词 | 语义 | 谓词 | 语义 |
| :--- | :--- | :--- | :--- |
| `> ANY` | 大于子查询结果中的某个值 | `> ALL` | 大于子查询结果中的所有值 |
| `< ANY` | 小于子查询结果中的某个值 | `< ALL` | 小于子查询结果中的所有值 |
| `>= ANY` | 大于等于子查询结果中的某个值 | `>= ALL` | 大于等于子查询结果中的所有值 |
| `<= ANY` | 小于等于子查询结果中的某个值 | `<= ALL` | 小于等于子查询结果中的所有值 |
| `= ANY` | 等于子查询结果中的某个值 | `= ALL` | 等于子查询结果中的所有值 () |
| `!= ANY` | 不等于子查询结果中的某个值 | `!= ALL` | 不等于子查询结果中的任何一个值 |
| `<> ANY` | 不等于子查询结果中的某个值 | `<> ALL` | 不等于子查询结果中的任何一个值 |

> `= ALL` 与 `!= ANY` 通常没有实际使用价值

带有 `EXISTS` 谓词的子查询不返回任何数据，只产生逻辑真值或逻辑假值

- 若内层查询结果非空，则外层的 `WHERE` 子句返回真值
- 若内层查询结果为空，则外层的 `WHERE` 子句返回假值

【例3.3】查询没有选修 1 号课程的学生姓名

```sql
SELECT Sname
FROM Student S
WHERE NOT EXISTS (
    SELECT *
    FROM SC
    WHERE SC.Sno=S.Sno AND Cno='1');
```

> “没有达到什么条件”，不能使用连接查询，只能用子查询

- 一些带 `EXISTS` 或 `NOT EXISTS` 谓词的子查询不能被其他形式的子查询等价替换
- 所有带 `IN` 谓词、比较运算符、`ANY`、`ALL` 谓词的子查询都能用带 `EXISTS` 谓词的子查询等价替换

> 差运算可用 `NOT IN` 或 `NOT EXISTS` 子查询表示

- 可以把带有全称量词的谓词转换为等价的带有存在量词的谓词：

$$(\forall x) P \equiv \neg (\exists x (\neg P))$$

【例3.4】查询至少修读了学号为 S4 的学生所修读过的所有课程的学生的学号

- 不存在学号为 S4 的学生所修读过的一门课，使得该学生没有修读

> 注意 “中间者” 不是最终查询目标（课程），且否定语义已写在 `NOT EXISTS` 中

```sql
SELECT S.sno
FROM S
WHERE NOT EXISTS (
  SELECT *
  FROM SC x
  WHERE x.sno='S4' # S4 的学生所修读过的一门课
  and NO EXISTS (
    SELECT *
    FROM SC y
    WHERE y.sno = S.sno and y.cno = x.con
  )
)
```

### 3.4 集合操作

- 并操作 `UNION` [`ALL`]
- 交操作 `INTERSECT` [`ALL`]
- 差操作 `EXCEPT` [`ALL`]

```sql
SELECT *
FROM Student
WHERE Sdept = 'CS'
  UNION # INTERSECT、EXCEPT
SELECT *
FROM Student
WHERE Sage <= 19;
```

> 集合操作可选项 `ALL` 表示不去重，无则默认去重

### 3.5 基于派生表的查询

子查询不仅可以出现在 `WHERE` 子句中，还可以出现在 `FROM` 子句中，这时子查询生成的临时派生表成为主查询的查询对象

【例3.5】找出每个学生超过他自己选修课程平均成绩的课程号

```sql
SELECT Sno, Cno
FROM SC, (SELECT Sno, Avg(Grade)
          FROM SC
          GROUP BY Sno)
          AS Avg_sc(avg_sno, avg_grade)
WHERE SC.Sno = Avg_sc.avg_sno
  and SC.Grade >= Avg_sc.avg_grade;
```

- 派生表必须指定别名

## 4 SQL 数据更新*

### 4.1 插入

❑ 插入新元组
```sql
INSERT
INTO <表名> [(<属性列1>[,<属性列2>…])]
VALUES (<常量1> [,<常量2>]… );

INSERT
INTO SC(Sno,Cno)
VALUES ('201215128','1');
```

❑ 插入子查询结果
```sql
INSERT
INTO <表名> [(<属性列1>[,<属性列2>…])]
子查询;
```

### 4.2 修改

```sql
UPDATE <表名>
SET <列名> = <表达式>[, <列名> = <表达式>] …
[WHERE <条件>];
```

> 如果省略 `WHERE` 子句，表示要修改表中的所有元组

### 4.3 删除

```sql
DELETE
FROM <表名>
[WHERE <条件>];
```

## 5 事务

### 5.1 事务的概念*

> 用户定义的一个数据库操作序列，这些操作要么全做，要么全不做，是一个不可分割的工作单位

为了确保数据库的数据完整性而引入，影响数据完整性的三个因素

- concurrency 多用户的并发访问
- abort 放弃一个事务
- crash 系统故障

一个事务的运行必须满足**原子性**、**一致性**、**隔离性**、**持久性**

### 5.2 有关事务的 SQL 语句

❑ 事务**结束命令**
- ==事务提交命令：`COMMIT`==
- ==事务放弃命令：`ROLLBACK`==

❑ 事务设置命令
1. 设置事务的自动提交命令：`SET AUTOCOMMIT ON | OFF`
2. 设置事务的类型：`SET TRANSACTION READONLY | READWRITE`
3. 设置事务的隔离级别：`SET TRANSACTION ISOLATION LEVEL ...`

> READUNCOMMITTED：未提交读，不申请锁，可能读到脏值，但禁止写
> READCOMMITTED：提交读，需要用锁，但读完立即释放
> READREPEATABLE：可重复读，需要用锁，直到事务结束释放
> SERIALIZABLE：可序列化（可串行化），调度策略防止并发事物间的干扰

<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>隔离级别与锁机制</title>
<style>
    table {
        border-collapse: collapse;
        width: 100%;
        max-width: 800px;
        margin: 20px auto;
        font-family: sans-serif;
        text-align: center;
    }
    th, td {
        border: 1px solid #000;
        padding: 12px 8px;
    }
    /* 表头和第一列的背景色 */
    th, .bg-gray {
        background-color: #ebebeb;
    }
    /* 红色字体样式 */
    .text-red {
        color: red;
    }
    /* 隔离级别列特定样式 */
    .level-cell {
        font-weight: bold;
        font-size: 16px;
    }
    .level-cell .cn-text {
        font-weight: normal;
        font-size: 14px;
    }
    /* 第一行特定英文字体加粗 */
    .bold-text {
        font-weight: bold;
    }
</style>
</head>
<body>

<table>
    <thead>
        <tr>
            <th rowspan="2" class="bg-gray"></th>
            <th colspan="2" class="text-red">Read 操作</th>
            <th colspan="2" class="text-red">Write 操作</th>
        </tr>
        <tr>
            <th class="text-red">锁类型</th>
            <th class="text-red">封锁时间</th>
            <th class="text-red">锁类型</th>
            <th class="text-red">封锁时间</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td class="bg-gray text-red level-cell">
                READUNCOMMITTED<br>
                <span class="cn-text">未提交读</span>
            </td>
            <td class="bold-text">No Lock</td>
            <td class="bold-text" style="font-size: 20px;">—</td>
            <td colspan="2">不允许执行<br><b>Write</b> 操作</td>
        </tr>
        <tr>
            <td class="bg-gray text-red level-cell">
                READCOMMITTED<br>
                <span class="cn-text">提交读</span>
            </td>
            <td>共享锁</td>
            <td>读操作</td>
            <td rowspan="3">排它锁</td>
            <td rowspan="3">事务</td>
        </tr>
        <tr>
            <td class="bg-gray text-red level-cell">
                READREPEATABLE<br>
                <span class="cn-text">可重复读</span>
            </td>
            <td>共享锁</td>
            <td>事务</td>
        </tr>
        <tr>
            <td class="bg-gray text-red level-cell">
                SERIALIZABLE<br>
                <span class="cn-text">可串行化</span>
            </td>
            <td>共享锁</td>
            <td>事务</td>
        </tr>
    </tbody>
</table>

</body>
</html>

❑ 在`MySQL`数据库中，设置事务自动提交功能的`SQL`命令格式是
- `SET AUTOCOMMIT = 0; /*关闭事务自动提交功能*/`
- `SET AUTOCOMMIT = 1; /*打开事务自动提交功能*/`

## 6 SQL 中的空值

只能用 `IS NULL` 或 `IS NOT NULL` 来判断

**空值参与比较运算的结果为逻辑假 FALSE**

## 7 视图

- 虚表，是从一个或几个基本表（或视图）导出的表
- 只存放视图的定义，不存放视图对应的数据
- 基表中的数据发生变化，从视图中查询出的数据也随之改变

### 7.1 建立视图

```sql
CREATE VIEW <视图名> [(<列名>[,<列名>]…)]
AS <子查询>
[WITH CHECK OPTION];
```

组成视图的属性列名：全部省略 或 全部指定

```sql
CREATE VIEWS_G(Sno, Gavg)
AS
  SELECT Sno, AVG(Grade)
  FROM SC
  GROUP BY Sno;
```

- 全部省略
  - 由子查询中 `SELECT` 目标列中的诸字段的名字作为视图中对应列的列名
- 当出现下列情况时，必须明确指定视图的所有列名
  - 某个目标列是聚集函数或列表达式
  - 多表连接时选出了几个同名列作为视图的字段
  - 需要在视图中为某个列启用新的更合适的名字

在标准 SQL 中，**视图对应的子查询中不允许有 `ORDER BY` 子句**，但可以使用 `DISTINCT` 短语

```sql
CREATE VIEW IS_Student
AS
  SELECT Sno, Sname, Sage
  FROM Student
  WHERE Sdept = 'IS';
  WITH CHECK OPTION; # 可选项
```

**`WITH CHECK OPTION`**：

- ==对视图进行 `INSERT`，`UPDATE` 和 `DELETE` 操作时要保证满足视图定义中的谓词条件（即子查询中的条件表达式）==
- ==但不影响直接在基本表上的元组插入和修改操作的执行==

### 7.2 删除视图

```sql
DROP VIEW <视图名> [CASCADE];
```

- 如果该视图上还导出了其他视图，使用 `CASCADE` 则把该视图和由它导出的所有视图一起删除
- 否则，系统将拒绝当前的视图删除操作（要先显示 `DROP VIEW` 删除其他相关视图）

### 7.3 查询视图

- `FROM` 中使用视图即可

```sql
SELECT Sno,Sage
FROM IS_Student
WHERE Sage<20;
```

- 视图消解法：从对视图的操作转换成对基表的操作

```sql
# 视图消解转换后的查询语句
SELECT Sno,Sage
FROM Student
WHERE Sdept= 'IS' AND Sage<20;
```

### 7.4 更新视图

一般不允许执行视图上的更新操作，只有满足以下条件才可以：

1. 视图的每一行必须对应基表的惟一一行
2. 视图的每一列必须对应基表的惟一一列

> 保证对视图的更新可以唯一有意义地转换为对基表的更新

使用也同理，`INSERT INTO` 后、`UPDATE ... SET` 中间、`DELETE FROM` 后表名改用视图名