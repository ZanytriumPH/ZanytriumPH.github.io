# posts 图片目录

每篇文章的图片按文章分目录存放，例如：

```
assets/img/posts/hello-world/架构图.png
```

markdown 中引用（**必须根路径**，文章页在 `/posts/` 下，相对路径会解析成 `/posts/assets/...` 而 404）：

```markdown
![图片描述](/assets/img/posts/hello-world/架构图.png)
```

- 构建时 `assets/` 会原样复制到 `dist/assets/`，无需其他配置
- 正文图片会由构建脚本自动加上 `loading="lazy"` 懒加载
- 大图请先压缩（建议 WebP），避免拖慢页面
