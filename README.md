# Zwing's blog

完全自定义构建的静态博客，灵感来自 [hexo-theme-redefine](https://github.com/EvanNotFound/hexo-theme-redefine)，不依赖任何博客框架。

## 快速开始

```bash
npm install        # 安装依赖
npm run dev        # 本地开发（http://localhost:4000，文件变更自动重建）
npm run build      # 构建 dist/ 静态站点
```

可选：本机装有 Java 时，把 `plantuml.jar` 放到项目根目录即可在本地渲染 PlantUML 图
（否则图会降级显示为源码块，部署时由 GitHub Actions 自动渲染）。

## 写作

文章放在 `source/_posts/`，独立页面放在 `source/_pages/`，Markdown 文件头需包含 front matter：

```yaml
---
title: 文章标题
date: 2026-08-05
tags: [标签1, 标签2]
categories: [分类]
description: 文章摘要（显示在首页卡片和搜索索引）
---
```

### 支持的 Markdown 扩展

| 语法 | 效果 |
|---|---|
| `==文本==` | 荧光笔高亮 |
| `> [!note] 标题` | MPE 风格提示框（支持 note/info/tip/success/question/warning/example/quote/important 9 种） |
| ` ```plantuml ` 代码块 | 构建时渲染为 SVG 图片（本地无 Java 时降级显示源码，部署时自动渲染） |
| `$公式$` / `$$公式$$` | MathJax 数学公式（行内 / 块级，本地渲染无 CDN 依赖） |
| ` ```mermaid ` 代码块 | Mermaid 图（客户端渲染，跟随明暗主题） |

> [!note] 提示
> 数学公式与 Mermaid 脚本仅加载在文章页，体积较大（约 5MB），不影响首页速度。

## 部署

GitHub Actions 已配置自动部署（见 `.github/workflows/deploy.yml`）：

1. push 到 `main` 分支
2. Actions 自动执行：Node 构建 → Java + PlantUML 渲染图片 → 发布到 GitHub Pages

首次部署需在仓库 **Settings → Pages** 中把 Source 设为 **GitHub Actions**。

## 评论系统（Giscus）

默认关闭。启用步骤：

1. 仓库 Settings → 开启 **Discussions**
2. 在 [giscus.app](https://giscus.app) 配置并获取 `repoId` / `categoryId`
3. 填写 `config.json` 中的 `giscus` 字段，把 `enabled` 改为 `true`

## 站点配置

`config.json`：站点名、简介、base 路径、社交链接、页脚文案等。

## 目录结构

```
source/_posts/  文章（.md）
source/_pages/  独立页面（.md）
assets/         静态资源（CSS/JS/图片）
scripts/        构建脚本（build.js / md.js / plantuml.js / templates.js）
config.json     站点配置
```
