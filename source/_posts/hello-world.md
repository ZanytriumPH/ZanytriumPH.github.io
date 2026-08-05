---
title: 欢迎来到我的博客
date: 2026-08-05
tags: [博客, 教程]
categories: [随记]
description: 第一篇博客，顺便演示这个博客支持的三种 Markdown 扩展语法。
---

这是我的第一篇博客！这个站点是**完全自定义构建**的静态博客，不依赖任何博客框架。

## 荧光笔高亮

用 `==` 包裹文本即可实现荧光笔效果，例如：

- 这是 ==重要的内容==，请重点关注
- 代码里有一处 ==bug== 需要修复
- ==任何你想强调的句子== 都会变成荧光笔样式

## 提示框（MPE 风格）

支持 `[!note]` 等 9 种提示框类型，用 blockquote 语法书写：

> [!note] 备注
> 这是一个 note 类型的提示框，适合放补充说明。

> [!info]
> 没有标题的提示框也可以，正文直接写在标记下面。

> [!tip] 小技巧
> tip 类型通常用于给读者提供有用的建议。

> [!warning] 注意
> warning 类型用于提醒潜在的风险或注意事项。

> [!success] 完成
> 表示某个操作成功了。

> [!question] 疑问
> 提出问题或值得思考的点。

> [!example] 示例
> 展示一个具体例子。

> [!quote] 引用
> 放名人名言或需要强调的原话。

> [!important] 重要
> 非常重要的信息，比如安全提示。

## PlantUML 图

用 ` ```plantuml ` 代码块写 PlantUML 图，部署后会自动渲染为图片：

```plantuml
@startuml
skinparam backgroundColor transparent
actor 读者
participant "博客" as Blog
读者 -> Blog: 打开文章
Blog --> 读者: 返回渲染好的页面
@enduml
```

再画一个流程图：

```plantuml
@startuml
start
if (构建成功?) then (yes)
  :部署到 GitHub Pages;
else (no)
  :输出错误日志;
  :修正后重新构建;
endif
stop
@enduml
```

## 普通代码块

```js
function hello(name) {
  console.log(`Hello, ${name}!`);
}
```

## 数学公式（纯文本示例）

行内公式 `E = mc^2`，块级公式：

$$ E = mc^2 $$

> [!note] 说明
> 如需 MathJax 数学公式渲染，可以在后续迭代中接入，构建脚本已预留扩展位。
