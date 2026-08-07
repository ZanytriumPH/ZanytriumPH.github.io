# Zwing's blog — 项目规范

自定义构建的静态博客（markdown-it + 自写 Node 脚本，无 Hexo 框架）。完整说明见 README.md。

## 常用命令

- `npm run dev` — 本地开发（端口 4000；只监听 `source/`、`assets/`、`config.json`，改 `scripts/` 后需重启）
- `npm run build` — 构建 `dist/`
- `npm run optimize-img` — 博文图片压缩

## AI 搬运博文流程（用户的核心工作流）

用户先在别处写文章（图片以 PNG 为主），由 AI 搬运进本仓库部署。**必须遵守：**

1. 文章 `.md` → `source/_posts/`，front matter 补全 `title / date / tags / categories / description`；
   `cover` 可选（文章封面，根路径图片，如 `/assets/img/posts/<slug>/xx.webp`；有则显示在首页卡片顶部 150px 与文章页标题上方）；
   `date` / `updated` 均可自动判定，无需手写：date 自动取 git 首次提交时间，updated 自动取 git 最后提交时间（含时分秒；显式写了则以 front matter 为准；`date: 2026-08-06 10:30:00` 可精确到秒）；
2. **同分类编号系列文章需显式写 `date` 保证排列顺序**：当多篇新文章属于同一分类、同一系列的不同章节编号时
   （如「软件工程 II 复习笔记(一)/(二)/(三)」），主页按 priority 降序、同权再按创建时间排——
   同一批搬运的首次提交时间相同，顺序不定，必须显式 `date` 锁定。
   以搬运时刻为基准**逆序分配**：编号最小的文章拿最新时间（≈搬运时刻），编号最大的拿最早时间（向前推）；
   建议逐篇递减 1 分钟，保证严格递减，使主页从上往下恰好按编号从小到大排列；
3. 图片先压缩再进仓库：`node scripts/optimize-img.js <源图片目录> <文章slug> <文章md路径>`
   （传入文章路径后**只压缩文章引用的图片，未被引用的孤儿图片自动跳过**、不进仓库；
   auto 模式：图形/截图 → WebP 无损，照片 → 有损 q80；超 1600px 自动缩放；源文件不删除）；
4. markdown 图片引用**必须根路径 + .webp**：`![描述](/assets/img/posts/<slug>/<文件名>.webp)`
   ——文章页在 `/posts/` 下，相对路径会 404；
5. **禁止**把原 PNG 直接复制进仓库（Pages 有 1GB 软上限，git 不压缩二进制）；
6. 搬运完运行 `npm run build` 验证，确认 `dist/` 产物正常。

## 文章自定义语法

`==文本==` 高亮；`> [!note] 标题` 提示框（9 种类型）；` ```plantuml `（构建时 SVG）；
`$..$` / `$$..$$` MathJax（本地 tex-svg.js）；` ```mermaid `（客户端渲染，跟随明暗主题）。
