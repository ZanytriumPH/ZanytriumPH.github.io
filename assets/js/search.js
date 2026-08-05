/**
 * search.js — 本地全文搜索（零依赖）
 * 构建时生成 search.json 索引，查询时按字段权重做子串匹配：
 *   title(权重最高) > tags > description > categories
 */
(() => {
  'use strict';

  const panel = document.getElementById('search-panel');
  const toggle = document.getElementById('search-toggle');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  if (!panel || !input) return;

  let index = null;
  let indexLoaded = false;

  function loadIndex() {
    if (indexLoaded) return;
    indexLoaded = true;
    const base = panel.getAttribute('data-base') || '';
    fetch(base + 'search.json')
      .then(r => r.json())
      .then(data => { index = data; })
      .catch(() => {});
  }

  function open() {
    panel.hidden = false;
    loadIndex();
    setTimeout(() => input.focus(), 50);
  }
  function close() {
    panel.hidden = true;
    input.value = '';
    results.innerHTML = '';
  }

  /** 简单分词：中文按字符、英文按单词，全部小写 */
  function tokens(q) {
    return q.toLowerCase().split(/\s+/).filter(Boolean);
  }

  /** 计算一篇文章对查询词的匹配得分；不匹配返回 0 */
  function score(item, qs) {
    const title = item.title.toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const tags = (item.tags || []).join(' ').toLowerCase();
    const cats = (item.categories || []).join(' ').toLowerCase();
    let s = 0;
    for (const q of qs) {
      if (title.includes(q)) s += 100;
      if (tags.includes(q)) s += 30;
      if (desc.includes(q)) s += 10;
      if (cats.includes(q)) s += 10;
    }
    return s;
  }

  input.addEventListener('input', () => {
    const q = input.value.trim();
    results.innerHTML = '';
    if (!q || !index) return;
    const qs = tokens(q);
    const hits = index
      .map(item => ({ item, s: score(item, qs) }))
      .filter(h => h.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 10);

    hits.forEach(({ item }) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.url;
      a.innerHTML = `<span>${escapeHtml(item.title)}</span><span class="sr-date">${item.date}</span>`;
      li.appendChild(a);
      results.appendChild(li);
    });
  });

  toggle && toggle.addEventListener('click', () => {
    panel.hidden ? open() : close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) close();
    if (e.key === '/' && document.activeElement !== input) {
      e.preventDefault();
      panel.hidden ? open() : input.focus();
    }
  });

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
})();
