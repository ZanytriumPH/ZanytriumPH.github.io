/**
 * templates.js — 页面 HTML 模板
 * 手写模板字符串，无模板引擎依赖。所有 URL 统一经 url() 拼接 base 路径。
 */

/** base 路径拼接工具：base="/" → "/css/style.css" */
function makeUrl(base) {
  const b = (base || '/').replace(/\/+$/, '/');
  return (p) => {
    const clean = String(p).replace(/^\/+/, '');
    return b + clean;
  };
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** 布局骨架：导航 + 内容 + 页脚 + 暗色模式初始化（防闪烁） */
function layout({ config, url, title, description, body, isPost = false }) {
  const themeInit = `<script>(function(){var t=localStorage.getItem('theme');if(!t)t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);})();</script>`;
  const nav = `
    <nav class="navbar">
      <div class="nav-inner">
        <a class="nav-brand" href="${url('')}">${esc(config.siteName)}</a>
        <button class="nav-toggle" id="nav-toggle" aria-label="菜单" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
        <ul class="nav-menu" id="nav-menu">
          <li><a href="${url('')}">首页</a></li>
          <li><a href="${url('archives.html')}">归档</a></li>
          <li><a href="${url('tags.html')}">标签</a></li>
          <li><a href="${url('categories.html')}">分类</a></li>
          <li><a href="${url('about.html')}">关于</a></li>
          <li class="nav-actions">
            <button class="icon-btn" id="theme-toggle" aria-label="切换明暗模式">🌓</button>
            <button class="icon-btn" id="search-toggle" aria-label="搜索">🔍</button>
          </li>
        </ul>
      </div>
    </nav>
    <div class="search-panel" id="search-panel" data-base="${config.base}" hidden>
      <div class="search-box">
        <input type="search" id="search-input" placeholder="搜索文章…" autocomplete="off">
      </div>
      <ul class="search-results" id="search-results"></ul>
    </div>`;

  const giscus = config.giscus && config.giscus.enabled && isPost ? `
    <section class="post-comments" id="comments">
      <h2 class="comments-title">评论</h2>
      <script src="https://giscus.app/client.js"
        data-repo="${esc(config.giscus.repo)}"
        data-repo-id="${esc(config.giscus.repoId)}"
        data-category="${esc(config.giscus.category)}"
        data-category-id="${esc(config.giscus.categoryId)}"
        data-mapping="${esc(config.giscus.mapping)}"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="${esc(config.giscus.lang)}"
        crossorigin="anonymous"
        async></script>
    </section>` : '';

  return `<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}${title === config.siteName ? '' : ' · ' + esc(config.siteName)}</title>
<meta name="description" content="${esc(description || config.description)}">
<link rel="stylesheet" href="${url('assets/css/style.css')}">
<link rel="stylesheet" href="${url('assets/css/hljs.css')}" id="hljs-style">
<link rel="icon" type="image/svg+xml" href="${url('assets/img/favicon.svg')}">
${themeInit}
</head>
<body>
${nav}
<main class="container">
${body}
</main>
<footer class="site-footer">
  <div class="footer-inner">${esc(config.footer)}</div>
</footer>
<script src="${url('assets/js/main.js')}" defer></script>
<script src="${url('assets/js/search.js')}" defer></script>
</body>
</html>`;
}

/** 首页：hero + 文章卡片列表 */
function indexPage({ config, url, posts }) {
  const cards = posts.map(p => `
    <article class="post-card">
      <div class="post-card-meta">
        <time datetime="${p.date}">${p.dateText}</time>
        ${p.tags.map(t => `<a class="tag-chip" href="${url('tags.html')}#${esc(t)}"># ${esc(t)}</a>`).join('')}
      </div>
      <h2 class="post-card-title"><a href="${url(p.path)}">${esc(p.title)}</a></h2>
      <p class="post-card-excerpt">${esc(p.description || '')}</p>
    </article>`).join('');

  const body = `
    <section class="hero">
      <h1 class="hero-title">${esc(config.siteName)}</h1>
      <p class="hero-subtitle">${esc(config.description)}</p>
      <div class="hero-social">
        ${config.social && config.social.github
          ? `<a class="social-link" href="${esc(config.social.github)}" target="_blank" rel="noopener">GitHub</a>` : ''}
      </div>
      <div class="hero-scroll">↓</div>
    </section>
    <section class="post-list">
      ${cards || '<p class="empty">还没有文章，去 <code>source/_posts/</code> 里写一篇吧。</p>'}
    </section>`;
  return layout({ config, url, title: config.siteName, description: config.description, body });
}

/** 文章页：标题、元信息、TOC、正文、上下篇、评论 */
function postPage({ config, url, post, prev, next }) {
  const toc = post.toc ? `
    <nav class="toc">
      <div class="toc-title">目录</div>
      <ul>${post.toc}</ul>
    </nav>` : '';

  const pager = (prev || next) ? `
    <nav class="post-pager">
      ${prev ? `<a class="pager-prev" href="${url(prev.path)}">← ${esc(prev.title)}</a>` : '<span></span>'}
      ${next ? `<a class="pager-next" href="${url(next.path)}">${esc(next.title)} →</a>` : ''}
    </nav>` : '';

  const body = `
    <article class="post">
      <header class="post-header">
        <h1 class="post-title">${esc(post.title)}</h1>
        <div class="post-meta">
          <time datetime="${post.date}">${post.dateText}</time>
          ${post.categories.map(c => `<a class="meta-link" href="${url('categories.html')}#${esc(c)}">${esc(c)}</a>`).join(' ')}
          ${post.tags.map(t => `<a class="tag-chip" href="${url('tags.html')}#${esc(t)}"># ${esc(t)}</a>`).join('')}
        </div>
      </header>
      <div class="post-body markdown-body">${post.html}</div>
      ${toc}
    </article>
    ${pager}
    ${config.giscus && config.giscus.enabled ? `<section class="post-comments" id="comments"><div id="giscus"></div></section>` : ''}`;
  return layout({ config, url, title: post.title, description: post.description, body, isPost: true });
}

/** 归档页：按年份分组 */
function archivesPage({ config, url, posts }) {
  const byYear = {};
  for (const p of posts) {
    const y = p.date.slice(0, 4);
    (byYear[y] = byYear[y] || []).push(p);
  }
  const years = Object.keys(byYear).sort((a, b) => b - a);
  const body = `
    <h1 class="page-title">归档</h1>
    <p class="page-subtitle">共 ${posts.length} 篇文章</p>
    ${years.map(y => `
      <section class="archive-year">
        <h2 class="archive-year-title">${y}</h2>
        <ul class="archive-list">
          ${byYear[y].map(p => `
            <li class="archive-item">
              <time>${p.dateText}</time>
              <a href="${url(p.path)}">${esc(p.title)}</a>
            </li>`).join('')}
        </ul>
      </section>`).join('')}`;
  return layout({ config, url, title: '归档', body });
}

/** 标签页：标签云 + 每个标签的文章列表 */
function tagsPage({ config, url, posts }) {
  const tagMap = {};
  for (const p of posts) for (const t of p.tags) (tagMap[t] = tagMap[t] || []).push(p);
  const sorted = Object.keys(tagMap).sort((a, b) => tagMap[b].length - tagMap[a].length);
  const body = `
    <h1 class="page-title">标签</h1>
    <div class="tag-cloud">
      ${sorted.map(t => `<a class="tag-cloud-item" href="#${esc(t)}">${esc(t)} <span class="tag-count">${tagMap[t].length}</span></a>`).join('')}
    </div>
    ${sorted.map(t => `
      <section class="tag-group" id="${esc(t)}">
        <h2 class="tag-group-title">${esc(t)}</h2>
        <ul class="archive-list">
          ${tagMap[t].map(p => `
            <li class="archive-item">
              <time>${p.dateText}</time>
              <a href="${url(p.path)}">${esc(p.title)}</a>
            </li>`).join('')}
        </ul>
      </section>`).join('')}`;
  return layout({ config, url, title: '标签', body });
}

/** 分类页 */
function categoriesPage({ config, url, posts }) {
  const catMap = {};
  for (const p of posts) for (const c of p.categories) (catMap[c] = catMap[c] || []).push(p);
  const sorted = Object.keys(catMap).sort();
  const body = `
    <h1 class="page-title">分类</h1>
    ${sorted.map(c => `
      <section class="category-group" id="${esc(c)}">
        <h2 class="category-group-title">${esc(c)} <span class="tag-count">${catMap[c].length}</span></h2>
        <ul class="archive-list">
          ${catMap[c].map(p => `
            <li class="archive-item">
              <time>${p.dateText}</time>
              <a href="${url(p.path)}">${esc(p.title)}</a>
            </li>`).join('')}
        </ul>
      </section>`).join('')}`;
  return layout({ config, url, title: '分类', body });
}

/** 普通页面（关于、友链等） */
function pagePage({ config, url, page }) {
  const body = `
    <article class="post">
      <header class="post-header">
        <h1 class="post-title">${esc(page.title)}</h1>
      </header>
      <div class="post-body markdown-body">${page.html}</div>
    </article>`;
  return layout({ config, url, title: page.title, description: page.description, body });
}

/** 404 页面 */
function notFoundPage({ config, url }) {
  const body = `
    <section class="nf">
      <h1 class="nf-code">404</h1>
      <p class="nf-text">页面不存在或已被移动</p>
      <a class="nf-link" href="${url('')}">← 回到首页</a>
    </section>`;
  return layout({ config, url, title: '404', body });
}

module.exports = { layout, indexPage, postPage, archivesPage, tagsPage, categoriesPage, pagePage, notFoundPage, makeUrl, esc };
