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
function layout({ config, url, title, description, body, isPost = false, isHome = false }) {
  // 主题初始化必须放在 <link rel="stylesheet"> 之前：CSS 应用时就已是正确主题，
  // 避免"先按白天渲染、脚本执行后再切换"的闪烁（含 hero 背景图，见 hero 模板）
  const themeInit = `<script>(function(){
  var t=localStorage.getItem('theme');
  if(!t)t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
  document.documentElement.setAttribute('data-theme',t);
  // hero 背景图按主题提前就位：img 初始无 src，DOM 解析完成后立即设好，
  // 图片加载与首次绘制并行，不显示白天版背景图
  function setHeroSrc(){
    var bg=document.querySelector('.hero-bg');
    if(bg&&bg.dataset.bgDark)bg.src=(t==='dark'?bg.dataset.bgDark:bg.dataset.bgLight);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setHeroSrc);
  else setHeroSrc();
})();</script>`;
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
            <button class="icon-btn" id="theme-toggle" aria-label="切换明暗模式" title="切换明暗模式">
              <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            </button>
            <button class="icon-btn" id="search-toggle" aria-label="搜索" title="搜索">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
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
${themeInit}
<link rel="stylesheet" href="${url('assets/css/style.css')}">
<link rel="stylesheet" href="${url('assets/css/hljs.css')}" id="hljs-style">
<link rel="icon" type="image/png" href="${url('assets/img/logo.png')}">
</head>
<body>
${nav}
<main class="${isHome ? 'main-home' : 'container'}">
${body}
</main>
<footer class="site-footer">
  <div class="footer-inner">${esc(config.footer)}</div>
</footer>
${isPost ? `<script defer src="${url('assets/vendor/mermaid/mermaid.min.js')}"></script>` : ''}
<script src="${url('assets/js/main.js')}" defer></script>
<script src="${url('assets/js/search.js')}" defer></script>
${config.busuanzi && config.busuanzi.enabled ? `<script async src="https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"></script>` : ''}
${isPost ? `
<script>window.MathJax = { tex: { inlineMath: [['\\\\(', '\\\\)']], displayMath: [['\\\\[', '\\\\]']] } };</script>
<script defer src="${url('assets/vendor/mathjax/tex-svg.js')}"></script>` : ''}
</body>
</html>`;
}

/** 首页：全屏 hero（背景图 + 打字机动画）+ 文章卡片列表 */
function indexPage({ config, url, posts }) {
  const cards = posts.map(p => `
    <article class="post-card">
      ${p.cover ? `<a class="post-card-cover" href="${url(p.path)}" tabindex="-1" aria-hidden="true"><img src="${url(p.cover)}" alt="${esc(p.title)}" loading="lazy"></a>` : ''}
      <h2 class="post-card-title"><a href="${url(p.path)}">${esc(p.title)}</a></h2>
      <p class="post-card-excerpt">${esc(p.description || '')}</p>
      <div class="post-card-meta">
        <time class="card-meta-item" datetime="${p.date}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>${p.date.slice(0, 10)}</time>
        ${p.categories.length ? `<span class="card-meta-item"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>${p.categories.map(c => `<a class="card-cat" href="${url('categories.html')}#${esc(c)}">${esc(c)}</a>`).join(' ')}</span>` : ''}
        ${p.tags.length ? `<span class="card-meta-item card-tags"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>${p.tags.map(t => `<a class="card-tag" href="${url('tags.html')}#${esc(t)}">${esc(t)}</a>`).join('')}</span>` : ''}
        <a class="card-read-more" href="${url(p.path)}">进入阅读 →</a>
      </div>
    </article>`).join('');

  const hero = config.hero || {};
  const bgLight = hero.bgLight ? url(hero.bgLight) : '';
  const bgDark = hero.bgDark ? url(hero.bgDark) : '';
  const phrases = JSON.stringify(hero.phrases || ['欢迎来到我的博客']);

  // 首页侧栏：作者卡片 + 标签云 + 分类列表（Redefine 风格）
  const side = config.sidebar || {};
  const sideAvatar = side.avatar ? url(side.avatar) : '';
  const announcement = side.announcement || config.description || '';
  const tagCounts = {}, catCounts = {};
  for (const p of posts) {
    for (const t of p.tags) tagCounts[t] = (tagCounts[t] || 0) + 1;
    for (const c of p.categories) catCounts[c] = (catCounts[c] || 0) + 1;
  }
  const gh = config.social && config.social.github;
  const totalWords = posts.reduce((s, p) => s + (p.words || 0), 0);
  // 访问人数 / 总访问量由不蒜子 busuanzi 统计（config.busuanzi.enabled 关闭时显示 0）；
  // siteUvBase / sitePvBase 为旧博客累计基数：初始即显示基数，实时值由 main.js 累加上去
  const bsz = config.busuanzi && config.busuanzi.enabled;
  const uvBase = (config.busuanzi && config.busuanzi.siteUvBase) || 0;
  const pvBase = (config.busuanzi && config.busuanzi.sitePvBase) || 0;
  const statCard = `
    <div class="side-card side-stats-card">
      <div class="stat-row"><span class="stat-label">文章总字数</span><span class="stat-value">${totalWords.toLocaleString('zh-CN')}</span></div>
      <div class="stat-row"><span class="stat-label">访问人数</span><span class="stat-value">${bsz ? `<span id="busuanzi_value_site_uv" data-base="${uvBase}">${uvBase}</span>` : '0'}</span></div>
      <div class="stat-row"><span class="stat-label">总访问量</span><span class="stat-value">${bsz ? `<span id="busuanzi_value_site_pv" data-base="${pvBase}">${pvBase}</span>` : '0'}</span></div>
      <div class="stat-row"><span class="stat-label">已运行天数</span><span class="stat-value uptime" id="uptime" data-start="${esc(config.siteStart || '')}">--</span></div>
    </div>`;
  const stats = `
    <div class="side-stats">
      <a class="side-stat" href="${url('tags.html')}" title="跳转标签页">
        <span class="side-stat-num">${Object.keys(tagCounts).length}</span>
        <span class="side-stat-label">标签</span>
      </a>
      <a class="side-stat" href="${url('categories.html')}" title="跳转分类页">
        <span class="side-stat-num">${Object.keys(catCounts).length}</span>
        <span class="side-stat-label">分类</span>
      </a>
      <a class="side-stat" href="${url('archives.html')}" title="跳转归档页">
        <span class="side-stat-num">${posts.length}</span>
        <span class="side-stat-label">文章</span>
      </a>
    </div>`;
  const sidebar = `
    <aside class="sidebar">
      <div class="side-card side-profile">
        ${sideAvatar ? `<img class="side-avatar" src="${sideAvatar}" alt="${esc(config.author)}">` : ''}
        <div class="side-name">${esc(config.author)}</div>
        <p class="side-announcement">${esc(announcement)}</p>
        ${stats}
        ${gh ? `<a class="side-link" href="${esc(gh)}" target="_blank" rel="noopener">GitHub ↗</a>` : ''}
      </div>
      ${statCard}
    </aside>`;

  const body = `
    <section class="hero">
      ${bgLight ? `<img class="hero-bg" data-bg-light="${bgLight}" data-bg-dark="${bgDark || bgLight}" alt="" fetchpriority="high">` : ''}
      <div class="hero-content">
        <p class="hero-typewriter" id="typewriter" data-phrases='${phrases}'></p>
      </div>
      <a class="hero-scroll" href="#posts" aria-label="向下滚动">↓</a>
    </section>
    <div class="container">
      <div class="home-layout">
        ${sidebar}
        <section class="post-list" id="posts">
          ${cards || '<p class="empty">还没有文章，去 <code>source/_posts/</code> 里写一篇吧。</p>'}
        </section>
      </div>
    </div>`;
  return layout({ config, url, title: config.siteName, description: config.description, body, isHome: true });
}

/** 文章页：标题、元信息、TOC、正文、上下篇、评论 */
function postPage({ config, url, post, prev, next }) {
  const toc = post.toc ? `
    <button class="toc-toggle" id="toc-toggle" aria-label="展开或收起目录" aria-expanded="false" title="目录">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
    </button>
    <nav class="toc">
      <div class="toc-title">目录</div>
      <div class="page-title">${esc(post.title)}</div>
      <ul>${post.toc}</ul>
    </nav>` : '';

  const pager = (prev || next) ? `
    <nav class="post-pager">
      ${prev ? `<a class="pager-prev" href="${url(prev.path)}">← ${esc(prev.title)}</a>` : '<span></span>'}
      ${next ? `<a class="pager-next" href="${url(next.path)}">${esc(next.title)} →</a>` : ''}
    </nav>` : '';

  // 文章末尾版权声明（blockquote 格式，更新于缺失时回退为创建日期）
  const siteUrl = config.url.replace(/\/+$/, '');
  const postUrl = `${siteUrl}${url(post.path)}`;
  const copyright = `
    <div class="post-copyright-sep"></div>
    <blockquote class="post-copyright">
      <p><strong>标题</strong>：${esc(post.title)}</p>
      <p><strong>作者</strong>：${esc(config.author)}</p>
      <p><strong>创建于</strong>：${esc(post.dateText)}</p>
      <p><strong>更新于</strong>：${esc(post.updatedText || post.dateText)}</p>
      <p><strong>链接</strong>：${postUrl}</p>
      <p><strong>版权声明</strong>：本文章采用 CC BY-NC-SA 4.0 进行许可</p>
    </blockquote>`;

  const body = `
    <div class="post-wrap">
      <article class="post">
        <header class="post-header">
          ${post.cover ? `<img class="post-cover" src="${url(post.cover)}" alt="${esc(post.title)}" loading="lazy">` : ''}
          <h1 class="post-title">${esc(post.title)}</h1>
          <div class="post-meta">
            <time class="meta-item" datetime="${post.date}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>${post.dateText}</time>
            ${post.updated ? `<time class="meta-item" datetime="${post.updated}" title="最近修改时间"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><polyline points="21 3 21 9 15 9"/></svg>更新于 ${post.updatedText}</time>` : ''}
            <span class="meta-item" title="文章字数"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>约 ${post.words} 字</span>
            <span class="meta-item" title="预计阅读时间（按约 300 字/分钟估算）"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>预计阅读 ${post.readMinutes} 分钟</span>
            ${config.busuanzi && config.busuanzi.enabled ? `<span class="meta-views meta-item"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>本文访问量 <span id="busuanzi_value_page_pv">0</span></span>` : ''}
            <span class="meta-group">
              ${post.categories.map(c => `<a class="meta-link" href="${url('categories.html')}#${esc(c)}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>${esc(c)}</a>`).join(' ')}
              ${post.tags.map(t => `<a class="tag-chip" href="${url('tags.html')}#${esc(t)}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>${esc(t)}</a>`).join(' ')}
            </span>
          </div>
        </header>
        <div class="post-body markdown-body">${post.html}</div>
        ${copyright}
      </article>
      ${toc}
    </div>
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
