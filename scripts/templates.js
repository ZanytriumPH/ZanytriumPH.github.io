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

// 静态资源版本号：构建时注入（build.js 传构建时间戳）。
// GitHub Pages 对同名文件默认 Cache-Control: max-age=600，HTML 更新后浏览器
// 仍可能命中旧 CSS/JS（曾致「导航下拉菜单样式缺失、条目不隐藏」的线上 bug）——
// 每次构建 URL 都带新 ?v=，强制缓存失效。
let assetVer = '';
function setAssetVer(v) { assetVer = v; }
/** 给静态资源 URL 追加版本号：有版本号时 → path?v=<ver> */
const versioned = (u) => (assetVer ? `${u}?v=${assetVer}` : u);

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** 布局骨架：导航 + 内容 + 页脚 + 暗色模式初始化（防闪烁） */
function layout({ config, url, title, description, body, isPost = false, isHome = false, current = '', heroBg = false, wide = false, heroBgHidden = false }) {
  // 导航项：current 命中时加 active 类，样式为标签下方横线；
  // 带 dropdown 的项点击展开子菜单（关于 → 我 / GitHub / 友链）
  const navItems = [
    { key: 'home', href: url(''), label: '首页' },
    { key: 'archives', href: url('archives.html'), label: '归档' },
    { key: 'tags', href: url('tags.html'), label: '标签' },
    { key: 'categories', href: url('categories.html'), label: '分类' },
    {
      key: 'about', label: '关于',
      dropdown: [
        { key: 'about', href: url('about.html'), label: '我' },
        { key: 'github', href: 'https://github.com/ZanytriumPH', label: 'GitHub', external: true },
        { key: 'friends', href: url('friends.html'), label: '友链' },
      ],
    },
  ];
  // hero 背景图（与首页共用同一文件）：heroBg=true 的页面注入 .hero-bg，
  // themeInit 的 setHeroSrc 与 main.js 的 applyHeroBg 会自动接管明暗图切换。
  // img 后紧跟内联脚本立即设置 src：不等 DOMContentLoaded，图片下载与页面解析并行，
  // 缩短导航跳转后"黑屏等背景图"的窗口（themeInit 的 setHeroSrc 兜底，幂等无害）
  const hero = config.hero || {};
  const bgLight = hero.bgLight ? url(hero.bgLight) : '';
  const bgDark = hero.bgDark ? url(hero.bgDark) : '';
  const heroImg = heroBg && bgLight
    ? `<img class="hero-bg${heroBgHidden ? ' hero-bg-hidden' : ''}" data-bg-light="${bgLight}" data-bg-dark="${bgDark || bgLight}" alt="" fetchpriority="high">
<script>(function(){var bg=document.querySelector('.hero-bg');if(bg)bg.src=(document.documentElement.getAttribute('data-theme')==='dark'?bg.dataset.bgDark:bg.dataset.bgLight);})();<\/script>`
    : '';
  // 主题初始化必须放在 <link rel="stylesheet"> 之前：CSS 应用时就已是正确主题，
  // 避免"先按白天渲染、脚本执行后再切换"的闪烁（含 hero 背景图，见 hero 模板）
  const themeInit = `<script>(function(){
  var t=localStorage.getItem('theme');
  if(!t)t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
  document.documentElement.setAttribute('data-theme',t);
  // 标记 JS 可用：CSS 的 .js 前缀规则（如 busuanzi 首帧隐藏）只对 JS 环境生效
  document.documentElement.className+=' js';
  // 文章页背景图模式恢复到上次选择（CSS 应用前设置，首帧即正确，无闪烁）
  if(localStorage.getItem('post-glass'))document.documentElement.classList.add('post-glass');
  // hero 入场动画（背景缩放淡入 + 内容上浮）只在会话首次进入时播放：
  // 导航栏跳转是整页重载会重播动画，用 sessionStorage 标记禁用后续触发
  if(sessionStorage.getItem('hero-anim-shown')){
    document.documentElement.classList.add('no-hero-anim');
  } else {
    sessionStorage.setItem('hero-anim-shown','1');
  }
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
          ${navItems.map(i => i.dropdown ? `
          <li class="nav-dropdown${i.key === current || i.dropdown.some(d => d.key === current) ? ' active' : ''}">
            <button class="nav-dropdown-toggle" id="nav-dropdown-toggle" aria-haspopup="true" aria-expanded="false">
              ${i.label}
              <svg class="nav-dropdown-caret" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <ul class="nav-dropdown-menu">
              ${i.dropdown.map(d => `<li><a href="${d.href}"${d.external ? ' target="_blank" rel="noopener"' : ''}${d.key === current ? ' class="active"' : ''}>${d.label}</a></li>`).join('')}
            </ul>
          </li>` : `<li><a href="${i.href}"${i.key === current ? ' class="active"' : ''}>${i.label}</a></li>`).join('')}
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
<link rel="stylesheet" href="${versioned(url('assets/css/style.css'))}">
<link rel="stylesheet" href="${versioned(url('assets/css/hljs.css'))}" id="hljs-style">
<link rel="icon" type="image/png" href="${versioned(url('assets/img/logo.png'))}">
</head>
<body>
${heroImg}
${nav}
<main class="${isHome ? 'main-home' : (wide ? 'container container-wide' : 'container') + (isPost ? ' container-post' : '')}">
${body}
</main>
<footer class="site-footer">
  <div class="footer-inner">${esc(config.footer)}</div>
</footer>
${isPost ? `<script defer src="${versioned(url('assets/vendor/mermaid/mermaid.min.js'))}"></script>` : ''}
<script src="${versioned(url('assets/js/main.js'))}" defer></script>
<script src="${versioned(url('assets/js/search.js'))}" defer></script>
${config.busuanzi && config.busuanzi.enabled ? `<script async src="https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"></script>` : ''}
${isPost ? `
<script>window.MathJax = { tex: { inlineMath: [['\\\\(', '\\\\)']], displayMath: [['\\\\[', '\\\\]']] } };</script>
<script defer src="${versioned(url('assets/vendor/mathjax/tex-svg.js'))}"></script>` : ''}
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
      <div class="stat-row"><span class="stat-label">访问人数</span><span class="stat-value">${bsz ? `<span id="busuanzi_value_site_uv" data-base="${uvBase}"${uvBase ? ' class="busuanzi-hide"' : ''}>${uvBase}</span>` : '0'}</span></div>
      <div class="stat-row"><span class="stat-label">总访问量</span><span class="stat-value">${bsz ? `<span id="busuanzi_value_site_pv" data-base="${pvBase}"${pvBase ? ' class="busuanzi-hide"' : ''}>${pvBase}</span>` : '0'}</span></div>
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
      <div class="hero-content">
        <p class="hero-typewriter" id="typewriter" data-phrases='${phrases}'></p>
      </div>
      <a class="hero-scroll" href="#posts" aria-label="向下滚动">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
      </a>
    </section>
    <div class="container">
      <div class="home-layout">
        ${sidebar}
        <section class="post-list" id="posts">
          ${cards || '<p class="empty">还没有文章，去 <code>source/_posts/</code> 里写一篇吧。</p>'}
        </section>
      </div>
    </div>`;
  return layout({ config, url, title: config.siteName, description: config.description, body, isHome: true, current: 'home', heroBg: true });
}

/** 文章页：标题、元信息、TOC、正文、上下篇、评论 */
function postPage({ config, url, post, prev, next }) {
  // 两个右侧浮动按钮必须放在 .post-wrap 之外：背景图模式下 post-wrap 带
  // backdrop-filter（毛玻璃），会使内部 fixed 元素的包含块从视口变成该容器，
  // 按钮会「掉进」容器内并随滚动移动——放到 main 层则始终相对视口 fixed
  const tocButtons = post.toc ? `
    <button class="toc-toggle" id="toc-toggle" aria-label="展开或收起目录" aria-expanded="false" title="目录">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
    </button>
    <button class="toc-bg-toggle" id="bg-toggle" type="button" aria-pressed="false" aria-label="背景" title="背景">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
    </button>` : '';

  const toc = post.toc ? `
    <nav class="toc">
      <div class="toc-title">目录</div>
      <div class="page-title">${esc(post.title)}</div>
      <ul>${post.toc}</ul>
    </nav>` : '';

  const pager = (prev || next) ? `
    <nav class="post-pager">
      ${prev ? `<a class="pager-prev" href="${url(prev.path)}">&lt; ${esc(prev.title)}</a>` : '<span></span>'}
      ${next ? `<a class="pager-next" href="${url(next.path)}">${esc(next.title)} &gt;</a>` : ''}
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
    ${tocButtons}
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
      ${pager}
    </div>
    ${config.giscus && config.giscus.enabled ? `<section class="post-comments" id="comments"><div id="giscus"></div></section>` : ''}`;
  // heroBgHidden: 注入 hero 背景图但默认隐藏（CSS .hero-bg-hidden），
  // 用户经 TOC 底部按钮切换（html.post-glass）后显示，样式复用关于页毛玻璃
  return layout({ config, url, title: post.title, description: post.description, body, isPost: true, heroBg: true, heroBgHidden: true });
}

/**
 * 时间线内部结构（无毛玻璃容器）：按年份分组 → 同日合并 →
 * 年份标题 + 文章数胶囊 + 竖线圆点列表。posts 需已按日期降序。
 */
function timelineInner({ url, posts }) {
  const byYear = {};
  for (const p of posts) {
    const y = p.date.slice(0, 4);
    (byYear[y] = byYear[y] || []).push(p);
  }
  const years = Object.keys(byYear).sort((a, b) => b - a);
  // 同一天的文章合并进同一条目（li），日期只显示一次（posts 已按日期降序）
  const dayItems = (list) => {
    let html = '', lastDay = '';
    for (const p of list) {
      const day = p.date.slice(5, 10); // MM-DD
      if (day !== lastDay) {
        if (lastDay) html += '</li>';
        html += `<li class="article-item" data-date="${day}">`;
        lastDay = day;
      }
      html += `<a class="article-link" href="${url(p.path)}"><span class="article-title">${esc(p.title)}</span></a>`;
    }
    return html + '</li>';
  };
  return `
    <div class="archive-list-container">
    ${years.map(y => `
      <section class="archive-year-block">
        <div class="archive-item-header">
          <span class="archive-year">${y}</span>
          <span class="archive-year-post-count count-badge">${byYear[y].length}</span>
        </div>
        <ul class="article-list">${dayItems(byYear[y])}</ul>
      </section>`).join('')}
    </div>`;
}

/** 时间线组件（归档页）：毛玻璃容器 + 内部结构 */
function timelineHtml({ url, posts }) {
  return `<div class="glass-panel timeline-panel">${timelineInner({ url, posts })}</div>`;
}

/** 面板大标题（详情页左上角）：SVG 图标 + 名称 */
function panelHeading(iconInner, name) {
  return `<h1 class="panel-heading">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconInner}</svg>
    <span>${esc(name)}</span>
  </h1>`;
}

/** 面板标题图标：标签（feather tag）/ 分类（feather folder） */
const PANEL_ICONS = {
  tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
  folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>'
};

/** 标签 → 文件名 slug（与锚点同规则，保留中文；空标签兜底），冲突由 build.js 去重 */
function tagSlug(tag) {
  const s = String(tag).toLowerCase()
    .replace(/[^\w一-龥]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return s || 'tag';
}

/** 归档页：时间线组件 */
function archivesPage({ config, url, posts }) {
  const body = timelineHtml({ url, posts });
  return layout({ config, url, title: '归档', body, current: 'archives', heroBg: true });
}

/**
 * 标签页：毛玻璃容器 + 椭圆胶囊标签云（#标签名 + 篇数徽标）。
 * slugMap 由 build.js 构建（标签 → 文件名 slug，已去重），点击跳转 tags/<slug>.html
 */
function tagsPage({ config, url, posts, slugMap }) {
  const tagMap = {};
  for (const p of posts) for (const t of p.tags) (tagMap[t] = tagMap[t] || []).push(p);
  const sorted = Object.keys(tagMap).sort((a, b) => tagMap[b].length - tagMap[a].length);
  const body = `
    <div class="glass-panel tag-panel">
      <div class="tag-cloud">
        ${sorted.map(t => `
          <a class="tag-pill" href="${url('tags/' + (slugMap.get(t) || tagSlug(t)) + '.html')}">
            <span class="tag-pill-name"># ${esc(t)}</span>
            <span class="tag-pill-count count-badge">${tagMap[t].length}</span>
          </a>`).join('')}
      </div>
    </div>`;
  return layout({ config, url, title: '标签', body, current: 'tags', heroBg: true });
}

/** 标签详情页：面板大标题（标签图标 + 标签名）+ 时间线 */
function tagPage({ config, url, tag, posts }) {
  const body = `
    <div class="glass-panel timeline-panel">
      ${panelHeading(PANEL_ICONS.tag, tag)}
      ${timelineInner({ url, posts })}
    </div>`;
  return layout({ config, url, title: `标签：${tag}`, description: `标签「${tag}」下的全部文章`, body, current: 'tags', heroBg: true });
}

/**
 * 分类页：与标签页同款的毛玻璃胶囊云，区别——每行两个分类、无 # 前缀、条目放大。
 * slugMap 由 build.js 构建（分类 → 文件名 slug，已去重），点击跳转 categories/<slug>.html
 */
function categoriesPage({ config, url, posts, slugMap }) {
  const catMap = {};
  for (const p of posts) for (const c of p.categories) (catMap[c] = catMap[c] || []).push(p);
  const sorted = Object.keys(catMap).sort();
  const body = `
    <div class="glass-panel category-panel">
      <div class="category-cloud">
        ${sorted.map(c => `
          <a class="category-pill" href="${url('categories/' + (slugMap.get(c) || tagSlug(c)) + '.html')}">
            <span class="category-pill-name">${esc(c)}</span>
            <span class="category-pill-count count-badge">${catMap[c].length}</span>
          </a>`).join('')}
      </div>
    </div>`;
  return layout({ config, url, title: '分类', body, current: 'categories', heroBg: true });
}

/** 分类详情页：面板大标题（分类图标 + 分类名）+ 时间线 */
function categoryPage({ config, url, category, posts }) {
  const body = `
    <div class="glass-panel timeline-panel">
      ${panelHeading(PANEL_ICONS.folder, category)}
      ${timelineInner({ url, posts })}
    </div>`;
  return layout({ config, url, title: `分类：${category}`, description: `分类「${category}」下的全部文章`, body, current: 'categories', heroBg: true });
}

/** 友链页：玻璃容器 + 双列胶囊（左头像 + 昵称/签名），与分类页同构 */
function friendsPage({ config, url, friends }) {
  const body = `
    <div class="glass-panel friend-panel">
      <div class="friend-cloud">
        ${friends.map(f => `
          <a class="friend-pill" href="${esc(f.url)}"${/^https?:/i.test(f.url) ? ' target="_blank" rel="noopener"' : ''}>
            ${f.avatar
              ? `<img class="friend-avatar" src="${esc(f.avatar)}" alt="${esc(f.name)}" loading="lazy">`
              : `<span class="friend-avatar friend-avatar-empty" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>`}
            <span class="friend-info">
              <span class="friend-name">${esc(f.name)}</span>
              <span class="friend-desc">${esc(f.desc || '')}</span>
            </span>
          </a>`).join('')}
      </div>
    </div>`;
  return layout({ config, url, title: '友链', description: '我的朋友们的博客', body, current: 'friends', heroBg: true });
}

/** 普通页面：关于页与其他导航页一致（毛玻璃容器 + 背景图），其余页面保持普通排版 */
function pagePage({ config, url, page }) {
  const isAbout = page.slug === 'about';
  const inner = `
      <header class="post-header">
        <h1 class="post-title">${esc(page.title)}</h1>
      </header>
      <div class="post-body markdown-body">${page.html}</div>`;
  const body = isAbout
    ? `<div class="glass-panel about-panel">${inner}</div>`
    : `<article class="post">${inner}</article>`;
  // 导航高亮：关于页对应下拉的「我」，友链页对应「友链」（友链由 friendsPage 渲染，不走这里）
  const current = { about: 'about' }[page.slug] || '';
  return layout({ config, url, title: page.title, description: page.description, body, current, heroBg: isAbout, wide: isAbout });
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

module.exports = { layout, indexPage, postPage, archivesPage, tagsPage, tagPage, categoriesPage, categoryPage, friendsPage, pagePage, notFoundPage, makeUrl, setAssetVer, esc, tagSlug };
