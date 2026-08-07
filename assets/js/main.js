/**
 * main.js — 导航 / 主题切换 / 代码块增强 / TOC 高亮
 */
(() => {
  'use strict';

  // ---- 移动端导航 ----
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navMenu.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---- 关于下拉菜单：点击展开，点外部或 ESC 关闭 ----
  const navDropdown = document.querySelector('.nav-dropdown');
  const dropdownToggle = navDropdown && navDropdown.querySelector('.nav-dropdown-toggle');
  if (navDropdown && dropdownToggle) {
    dropdownToggle.addEventListener('click', () => {
      const open = navDropdown.classList.toggle('open');
      dropdownToggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => {
      if (!navDropdown.contains(e.target)) {
        navDropdown.classList.remove('open');
        dropdownToggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        navDropdown.classList.remove('open');
        dropdownToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---- 点击当前页同名导航链接时不触发整页重载 ----
  // 归一化：忽略尾部 `/`，`/index.html` 等价于目录本身
  const normPath = (p) => p.replace(/\/+$/, '').replace(/\/index\.html$/, '');
  document.querySelectorAll('.nav-menu a[href], .nav-brand').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = new URL(link.getAttribute('href'), location.href);
      if (normPath(target.pathname) === normPath(location.pathname) && target.search === location.search) {
        e.preventDefault();
      }
    });
  });

  // ---- 毛玻璃容器入场淡入 / 离场淡出（标签 / 分类 / 归档页）----
  // 入场：JS 可用时容器先透明（body.glass-anim），双 rAF 后加 .page-loaded
  // 触发 CSS 过渡淡入；无 JS / 减弱动效时容器直接可见（CSS 默认不透明）。
  // 离场：点击站内链接先给容器加 .leaving 快速淡出（180ms），再跳转，
  // 避免生硬整页切换；排除锚点 / 外链 / 新窗口 / 下载 / 当前页链接
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('glass-anim');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add('page-loaded');
      });
    });
    const panels = document.querySelectorAll('.glass-panel');
    if (panels.length) {
      let leaving = false;
      document.addEventListener('click', (e) => {
        if (leaving) { e.preventDefault(); return; } // 淡出过程中再点：阻止二次跳转
        const a = e.target.closest('a[href]');
        if (!a) return;
        const href = a.getAttribute('href');
        if (!href || href.startsWith('#') || a.target === '_blank' || a.hasAttribute('download')) return;
        const target = new URL(href, location.href);
        if (target.origin !== location.origin || target.hash) return;
        if (normPath(target.pathname) === normPath(location.pathname) && target.search === location.search) return;
        e.preventDefault();
        leaving = true;
        panels.forEach(p => p.classList.add('leaving'));
        setTimeout(() => { location.href = href; }, 200);
      }, true); // 捕获阶段：先于链接自身的处理
    }
  }

  // ---- 主题切换（明/暗，持久化到 localStorage）----
  const themeToggle = document.getElementById('theme-toggle');
  const hljsStyle = document.getElementById('hljs-style');
  const htmlEl = document.documentElement;

  function applyHljsTheme(theme) {
    if (!hljsStyle) return;
    hljsStyle.setAttribute(
      'href',
      hljsStyle.getAttribute('href').replace(/hljs(-dark)?\.css/, theme === 'dark' ? 'hljs-dark.css' : 'hljs.css')
    );
  }
  applyHljsTheme(htmlEl.getAttribute('data-theme') || 'light');

  // ---- 首页 hero：明暗主题切换背景图 ----
  // 切换时先淡出（opacity 过渡），新图加载完成再淡入；首屏初始化不淡出
  const heroBg = document.querySelector('.hero-bg');
  function applyHeroBg(theme, { fade = false } = {}) {
    if (!heroBg) return;
    const src = theme === 'dark' ? heroBg.dataset.bgDark : heroBg.dataset.bgLight;
    if (heroBg.getAttribute('src') === src) return;
    if (fade) {
      heroBg.style.opacity = 0;
      const restore = () => { heroBg.style.opacity = ''; };
      heroBg.addEventListener('load', restore, { once: true });
      heroBg.addEventListener('error', restore, { once: true }); // 加载失败也不留黑屏
    }
    heroBg.src = src;
  }
  applyHeroBg(htmlEl.getAttribute('data-theme') || 'light');

  // ---- 首页背景模糊（Redefine 效果）----
  // 帖子条目列表顶部到达屏幕中间时切换模糊；0↔18px 的突变由
  // CSS 的 transition: filter 平滑过渡（见 style.css .hero-bg）
  if (heroBg) {
    const BLUR = 18;
    let ticking = false;
    const updateBlur = () => {
      const posts = document.getElementById('posts');
      let blur = '';
      if (posts) {
        const postsTop = posts.getBoundingClientRect().top + window.scrollY;
        if (window.scrollY + window.innerHeight * 0.5 >= postsTop) blur = BLUR;
      }
      heroBg.style.filter = blur ? `blur(${blur}px)` : '';
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(updateBlur); ticking = true; }
    }, { passive: true });
    updateBlur();
  }

  // ---- busuanzi 计数基数：显示值 = 实时值 + 旧博客累计基数（data-base）----
  // span 初始输出基数并带 .busuanzi-hide（模板生成，首帧即隐藏，不显示基数）；
  // busuanzi 脚本写入实时值带从 0 递增的计数动画，动画期间每次都重写会看到
  // 数字持续「相加跳动」——改为等写入稳定（400ms 无变化）后一次性写入最终值并显示。
  // 观察器挂载后立即评估一次：busuanzi 是 async 脚本，可能已先于本脚本写入
  document.querySelectorAll('#busuanzi_value_site_uv, #busuanzi_value_site_pv').forEach((el) => {
    const base = parseInt(el.dataset.base || '0', 10);
    if (!base) return;
    const cfg = { childList: true, characterData: true, subtree: true };
    let timer = null;
    let obs;
    const settle = () => {
      const n = parseInt(el.textContent, 10);
      // 文本仍是基数或无效（busuanzi 未写入）→ 继续等待
      if (isNaN(n) || n <= 0 || String(n) === String(base)) { obs.observe(el, cfg); return; }
      el.textContent = String(n + base); // 最终值一次写入
      el.classList.remove('busuanzi-hide'); // 一次性显示
    };
    const onChange = () => {
      obs.disconnect();
      clearTimeout(timer);
      timer = setTimeout(settle, 400); // 计数动画结束后 400ms 无变化视为稳定
    };
    obs = new MutationObserver(onChange);
    obs.observe(el, cfg);
    onChange(); // 立即评估：处理 busuanzi 已先写入的情况
    // 兜底：busuanzi 加载失败时显示当前内容，避免永久空白
    setTimeout(() => {
      clearTimeout(timer);
      const n = parseInt(el.textContent, 10);
      if (!isNaN(n) && n > 0 && String(n) !== String(base)) el.textContent = String(n + base);
      el.classList.remove('busuanzi-hide');
    }, 10000);
  });

  // ---- 已运行天数：基准时间取 config.siteStart，整日计数 ----
  const uptime = document.getElementById('uptime');
  if (uptime && uptime.dataset.start) {
    const start = new Date(uptime.dataset.start).getTime();
    const DAY = 86400000;
    const update = () => {
      const days = Math.floor((Date.now() - start) / DAY);
      uptime.textContent = days > 0 ? String(days) : '0';
    };
    update();
    setInterval(update, 60000); // 每分钟静默刷新，捕捉跨天
  }

  // ---- 首页 hero：打字机动画（打出 → 停顿 → 删除 → 下一句）----
  const typewriter = document.getElementById('typewriter');
  if (typewriter && typewriter.dataset.phrases) {
    let phrases = [];
    try { phrases = JSON.parse(typewriter.dataset.phrases); } catch (e) { /* 保持空 */ }
    if (phrases.length) {
      let pi = 0, ci = 0, deleting = false;
      const tick = () => {
        const phrase = phrases[pi];
        ci += deleting ? -1 : 1;
        typewriter.textContent = phrase.slice(0, ci);
        let delay = deleting ? 45 : 110;
        if (!deleting && ci === phrase.length) { deleting = true; delay = 2000; }
        else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 500; }
        setTimeout(tick, delay);
      };
      tick();
    }
  }

  // ---- Mermaid 图渲染（跟随明暗主题，切换时自动重渲染）----
  // 定义在模块作用域：下方主题切换回调也要调用它；
  // 若定义在 if 块内，块级作用域会让回调处抛 ReferenceError，重渲染静默失败
  const renderMermaid = async () => {
    const theme = htmlEl.getAttribute('data-theme') === 'dark' ? 'dark' : 'default';
    mermaid.initialize({ startOnLoad: false, theme, securityLevel: 'strict' });
    // 恢复此前渲染过的图，然后统一重渲染
    document.querySelectorAll('.mermaid-svg').forEach((el) => {
      const pre = document.createElement('pre');
      pre.className = 'mermaid';
      pre.textContent = el.dataset.code;
      el.replaceWith(pre);
    });
    let counter = 0;
    for (const pre of [...document.querySelectorAll('pre.mermaid')]) {
      const code = pre.textContent;
      try {
        const id = 'mmd-' + (counter++) + '-' + Math.random().toString(36).slice(2, 8);
        const { svg } = await mermaid.render(id, code);
        const holder = document.createElement('div');
        holder.className = 'mermaid-svg';
        holder.dataset.code = code;
        holder.innerHTML = svg;
        pre.replaceWith(holder);
      } catch (e) {
        const err = document.createElement('div');
        err.className = 'mermaid-error';
        err.textContent = '⚠️ Mermaid 渲染失败：' + e.message;
        pre.replaceWith(err);
      }
    }
  };
  if (window.mermaid) renderMermaid();

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      htmlEl.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      applyHljsTheme(next);
      applyHeroBg(next, { fade: true }); // 背景图跟随明暗主题切换
      if (window.mermaid) renderMermaid(); // 明暗切换后按新主题重渲染图表
    });
  }

  // ---- 代码块：语言标签 + 复制按钮 ----
  document.querySelectorAll('.markdown-body pre').forEach((pre) => {
    const code = pre.querySelector('code');
    if (!code) return; // pre.mermaid 等没有 code 子元素的块跳过，避免中断后续脚本
    const lang = (code.className.match(/language-(\w+)/) || [])[1] || 'code';

    const header = document.createElement('div');
    header.className = 'code-header';
    const langLabel = document.createElement('span');
    langLabel.className = 'code-lang';
    langLabel.textContent = lang;
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = '复制';
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent);
        copyBtn.textContent = '已复制 ✓';
        setTimeout(() => { copyBtn.textContent = '复制'; }, 1500);
      } catch (e) {
        copyBtn.textContent = '复制失败';
      }
    });
    header.appendChild(langLabel);
    header.appendChild(copyBtn);
    pre.parentNode.insertBefore(header, pre);
  });

  // ---- 目录抽屉：右侧按钮展开 / 收起 ----
  const tocToggle = document.getElementById('toc-toggle');
  if (tocToggle) {
    tocToggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('toc-open');
      tocToggle.setAttribute('aria-expanded', String(open));
    });
  }

  // ---- TOC 滚动高亮 + 目录跟随滚动 ----
  // 以视口 20% 高度为参考线：滚动文章时，高亮参考线上方最近的标题，
  // 并让目录自身滚动到该条目（当前阅读位置始终在目录中可见）
  const tocLinks = document.querySelectorAll('.toc li a');
  if (tocLinks.length) {
    const toc = document.querySelector('.toc');
    const ids = [...tocLinks].map(a => a.getAttribute('href').slice(1));
    const elMap = new Map(ids.map(id => [id, document.getElementById(id)]).filter(([, el]) => el));
    let currentId = null;

    function setActive(id) {
      if (id === currentId || !elMap.has(id)) return;
      currentId = id;
      tocLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
      const link = document.querySelector(`.toc a[href="#${id}"]`);
      if (!link || !toc) return;
      // 目录跟随滚动：活动条目保持在目录垂直中心（内容不足一屏时浏览器自动 clamp，无副作用）
      const lTop = link.offsetTop;
      const lH = link.offsetHeight;
      const tH = toc.clientHeight;
      toc.scrollTop = lTop - (tH - lH) / 2;
    }

    function onScroll() {
      const refLine = window.innerHeight * 0.2;
      let bestId = null, bestTop = -Infinity;
      for (const [id, el] of elMap) {
        const top = el.getBoundingClientRect().top;
        if (top <= refLine && top > bestTop) { bestTop = top; bestId = id; }
      }
      // 页首尚未越过参考线 → 高亮第一个条目
      if (!bestId) { setActive(ids[0]); return; }
      // 接近文末 → 高亮最后一个条目（否则末尾标题可能够不到参考线）
      const lastEl = elMap.get(ids[ids.length - 1]);
      if (lastEl && lastEl.getBoundingClientRect().top < 0
        && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
        setActive(ids[ids.length - 1]);
      } else {
        setActive(bestId);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // 初始化：定位当前章节
  }
})();
