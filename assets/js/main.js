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
  if (window.mermaid) {
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
    renderMermaid();
  }

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
    const lang = (code.className.match(/language-(\w+)/) || [])[1] || 'code';

    const header = document.createElement('div');
    header.className = 'code-header';
    const langLabel = document.createElement('span');
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

  // ---- TOC 滚动高亮 ----
  const tocLinks = document.querySelectorAll('.toc li a');
  if (tocLinks.length) {
    const ids = [...tocLinks].map(a => a.getAttribute('href').slice(1));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tocLinks.forEach(a => a.classList.remove('active'));
          const link = document.querySelector(`.toc a[href="#${entry.target.id}"]`);
          if (link) link.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }
})();
