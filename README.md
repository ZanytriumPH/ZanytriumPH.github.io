# Zwing's blog

完全自定义构建的静态博客，灵感来自 [hexo-theme-redefine](https://github.com/EvanNotFound/hexo-theme-redefine)，不依赖任何博客框架。

## 快速开始

```bash
npm install        # 安装依赖
npm run dev        # 本地开发（http://localhost:4000，文件变更自动重建）
npm run build      # 构建 dist/ 静态站点
```

可选：本机装有 Java 时，把 `plantuml.jar` 放到项目根目录即可在本地渲染 PlantUML 图
（否则图会降级显示为源码块）。

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
| ` ```plantuml ` 代码块 | 构建时渲染为 SVG 图片（本地无 Java 时降级显示源码块） |
| `$公式$` / `$$公式$$` | MathJax 数学公式（行内 / 块级，本地渲染无 CDN 依赖） |
| ` ```mermaid ` 代码块 | Mermaid 图（客户端渲染，跟随明暗主题） |

> [!note] 提示
> 数学公式与 Mermaid 脚本仅加载在文章页，体积较大（约 5MB），不影响首页速度。

## 部署

**本地构建 + 推送 `gh-pages` 分支**，绕过 GitHub Actions（其部署步骤曾因 GitHub
后端问题卡在 deployment_in_progress）。Pages 直接从分支发布，部署环节零依赖。

### 日常部署（改完文章 / 样式后）

```bash
npm run deploy:pages    # 一条命令：构建 dist/ → 同步到 gh-pages 分支 → 推送
```

- 产物自动提交并推送，GitHub Pages 约 1-2 分钟生效；
- 构建产物同步到仓库外同级目录 `../myBlog-gh-pages`（git worktree，增量提交，不会全量重传）；
- 源码备份照旧：`git add -A && git commit && git push`（推 `main` 分支，不影响部署）。

### 首次设置（一次性，网页操作）

仓库 **Settings → Pages** → Build and deployment → Source 改为
**Deploy from a branch** → Branch 选 **`gh-pages`** / **`(root)`** → Save。

### 注意事项

- PlantUML 图由本地渲染：根目录需有 `plantuml.jar`（见「快速开始」），没有则图降级为源码块；
- 部署不依赖任何 CI，GitHub 后端故障不影响发文章。

## 评论系统（Giscus）

默认关闭。启用步骤：

1. 仓库 Settings → 开启 **Discussions**
2. 在 [giscus.app](https://giscus.app) 配置并获取 `repoId` / `categoryId`
3. 填写 `config.json` 中的 `giscus` 字段，把 `enabled` 改为 `true`

## 博文图片与搬运

> 文章在别处写好（图片以 PNG 为主）后，搬运进本仓库部署。图片**必须先压缩再进仓库**：
> GitHub Pages 对站点有 **1GB 软上限**，300-400 张原图 PNG 很容易逼近甚至超过；
> 且 git 不压缩二进制，原图一旦提交就永久占据仓库体积。压缩后总量通常在 50-150MB。

### 图片存放位置

```
assets/img/posts/<文章slug>/<文件名>.webp
```

构建时整个 `assets/` 原样复制到 `dist/assets/`，无需其他配置。

### 压缩脚本

```bash
node scripts/optimize-img.js <源图片目录> <文章slug>
# 等价命令：npm run optimize-img -- <源图片目录> <文章slug>
```

选项：`--mode auto|lossless|lossy`（默认 auto）、`--max-width 1600`、`--out <目录>`。

行为：

- 递归扫描源目录下的 png/jpg/jpeg → 输出到 `assets/img/posts/<slug>/<原名>.webp`；
- 源目录里已有的 `.webp` 原样复制（视为已优化）；
- **auto 模式**：缩到 128px 采样统计颜色数，≤2048 判定为图形/截图 → **WebP 无损**
  （文字、纯色边缘零损失），否则按照片处理 → **有损 q80**；
- 宽度超过 1600px 自动缩到 1600（正文容器 860px，2x 屏上限 ~1720px）；
- **不删除源文件**（原图留在仓库外做备份），结束时打印新旧路径对照表。

### markdown 引用规则

```markdown
![图片描述](/assets/img/posts/<文章slug>/<文件名>.webp)
```

**必须根路径（`/` 开头）+ `.webp` 后缀**。文章页在 `/posts/` 下，相对路径会解析成
`/posts/assets/...` 而 404；正文图片已由构建自动加 `loading="lazy"` 懒加载。

### 搬运流程（AI 执行）

1. 文章 `.md` → `source/_posts/`，front matter 补全 `title / date / tags / categories / description`；
2. 运行压缩脚本：`node scripts/optimize-img.js <源图片目录> <文章slug>`；
3. 按脚本输出的对照表，把文章内图片引用全部改写为 `/assets/img/posts/<slug>/<原名>.webp`；
4. **不要**把原 PNG 复制进仓库（原图留在源目录备份）；
5. `npm run build` 验证构建通过、`dist/` 产物正常。

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
