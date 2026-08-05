/**
 * md.js — Markdown 渲染引擎
 *
 * 在 markdown-it 基础上扩展三大自定义语法：
 *   1. `==文本==`          → <mark> 荧光笔高亮
 *   2. `> [!note] 标题`    → MPE 风格提示框 (callout)
 *   3. ```plantuml         → PlantUML 图（构建时渲染为 SVG 图片）
 */
const path = require('path');
const crypto = require('crypto');
const MarkdownIt = require('markdown-it');
const markdownItMark = require('markdown-it-mark');
const hljs = require('highlight.js');

/** 支持的提示框类型（与 MPE / GitHub alerts 兼容） */
const CALLOUT_TYPES = [
  'note', 'info', 'tip', 'success',
  'question', 'warning', 'example', 'quote', 'important'
];

/** 各类型提示框的图标（emoji，跨平台无字体依赖） */
const CALLOUT_ICONS = {
  note: '📝', info: 'ℹ️', tip: '💡', success: '✅',
  question: '❓', warning: '⚠️', example: '📌', quote: '💬', important: '⭐'
};

/** 为标题生成带序号防重复的锚点 id（保留中文） */
function slugify(text, used) {
  let slug = text
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\w一-龥]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  if (!slug) slug = 'section';
  let unique = slug, n = 2;
  while (used.has(unique)) unique = `${slug}-${n++}`;
  used.add(unique);
  return unique;
}

/**
 * 创建 markdown-it 实例
 * @param {object} env 构建环境（用于传递 plantuml 渲染上下文）
 */
function createMd(env) {
  const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    highlight: (code, lang) => {
      if (!lang || !hljs.getLanguage(lang)) return '';
      try {
        return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
      } catch (e) {
        return '';
      }
    }
  });

  // === 1. ==荧光笔高亮==：markdown-it-mark 官方插件 ===
  md.use(markdownItMark);

  // === 2. MPE 风格提示框：> [!note] ===
  // 拦截 blockquote，检测首行 `[!type]` 标记，转换为 callout 容器。
  // 必须挂在 'inline' 规则之后——此时段落 token 的 children 已生成
  md.core.ruler.after('inline', 'callout', (state) => {
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== 'blockquote_open') continue;

      // 找到配对关闭 token
      let depth = 0, close = -1;
      for (let j = i; j < tokens.length; j++) {
        if (tokens[j].type === 'blockquote_open') depth++;
        else if (tokens[j].type === 'blockquote_close') {
          depth--;
          if (depth === 0) { close = j; break; }
        }
      }
      if (close === -1) continue;

      // 内容第一段（blockquote 多行会合并为一个段落，以 softbreak 分隔）
      // 用整段第一行做正则匹配——行内格式（如 **粗体**）会被拆成多个 token，不能只看首个 text
      const inner = i + 1;
      const para = tokens[inner];
      if (!para || para.type !== 'paragraph_open') continue;
      const inlineTok = tokens[inner + 1];
      if (!inlineTok || inlineTok.type !== 'inline' || !inlineTok.children) continue;

      const firstLine = inlineTok.content.split('\n')[0];
      const m = firstLine.match(/^\[!(note|info|tip|success|question|warning|example|quote|important)\](?:\s+(.*))?$/i);
      if (!m) continue;

      const type = m[1].toLowerCase();
      const title = (m[2] || '').trim();

      // 转换块级 token：blockquote → callout div
      tokens[i] = new state.Token('callout_open', 'div', 1);
      tokens[i].attrs = [['class', `callout callout-${type}`]];
      tokens[close] = new state.Token('callout_close', 'div', -1);

      // 重组正文段落：丢弃标题标记行及其后的 softbreak，保留剩余正文
      const sb = inlineTok.children.findIndex(t => t.type === 'softbreak');
      if (sb !== -1) {
        inlineTok.children = inlineTok.children.slice(sb + 1);
      } else {
        // 只有标题没有正文：删除空段落
        tokens.splice(inner, 3);
      }

      if (title) {
        // `> [!note] 标题`：在段落前插入标题行（标题内可含 Markdown 格式）
        const titleOpen = new state.Token('callout_title_open', 'div', 1);
        titleOpen.attrs = [['class', 'callout-title']];
        const titleInline = new state.Token('inline', '', 0);
        const parsedTitle = state.md.parseInline(`${CALLOUT_ICONS[type] || '📝'} ${title}`, state.env);
        titleInline.children = parsedTitle[0].children;
        const titleClose = new state.Token('callout_title_close', 'div', -1);
        tokens.splice(inner, 0, titleOpen, titleInline, titleClose);
      }
    }
  });

  // === 3. PlantUML：fence 块渲染 ===
  // 渲染时收集源码交给 env.puml 处理，返回占位容器，构建完成后替换为 <img>
  const defaultFence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, idx, options, env2, self) => {
    const token = tokens[idx];
    if (token.info.trim().toLowerCase() !== 'plantuml') {
      return defaultFence(tokens, idx, options, env2, self);
    }
    const puml = env2.puml || env.puml;
    if (!puml) return '<pre><code>plantuml 渲染器未初始化</code></pre>';
    const { hash, fileName } = puml.collect(token.content);
    return `<div class="plantuml-wrap" data-plantuml="${hash}" data-file="${fileName}"></div>`;
  };

  // === 标题锚点：自动添加 id（用于 TOC 跳转） ===
  const headingOpen = md.renderer.rules.heading_open ||
    ((tokens, idx, options, env2, self) => self.renderToken(tokens, idx, options));
  md.renderer.rules.heading_open = (tokens, idx, options, env2, self) => {
    const token = tokens[idx];
    const inline = tokens[idx + 1];
    const text = inline ? inline.content : '';
    const usedSlugs = env2.usedSlugs || env.usedSlugs || (env.usedSlugs = new Set());
    const id = slugify(text, usedSlugs);
    token.attrs = token.attrs || [];
    token.attrs.push(['id', id]);
    return headingOpen(tokens, idx, options, env2, self);
  };

  return md;
}

module.exports = { createMd, CALLOUT_TYPES, CALLOUT_ICONS };
