'use strict';

/**
 * Hexo mark extension: ==text== → <mark>text</mark>
 *
 * Registers a custom marked.js inline extension that tokenizes the
 * Obsidian/Typora-style ==highlight== syntax at the parser level.
 * This means code blocks (both fenced and inline) are automatically
 * skipped.
 *
 * Supports nested inline formatting inside the highlight, e.g.:
 *   ==text with **bold** inside==  → both highlight + bold
 *
 * CSS for <mark> is already configured in _config.redefine.yml
 * under the `inject.head` section.
 */

hexo.extend.filter.register('marked:extensions', function (extensions) {
  extensions.push({
    name: 'highlightMark',
    level: 'inline',
    start(src) {
      return src.indexOf('==');
    },
    tokenizer(src) {
      const match = /^==([^=\n]+?)==/.exec(src);
      if (!match) return;

      const token = {
        type: 'highlightMark',
        raw: match[0],
        text: match[1]
      };

      // Tokenize the inner content so nested formatting (e.g. **bold**)
      // inside the highlight is properly rendered
      try {
        token.tokens = this.lexer.inlineTokens(match[1]);
      } catch (_) {
        // Fall back to plain text if inline tokenization fails
      }

      return token;
    },
    renderer(token) {
      const inner = token.tokens
        ? this.parser.parseInline(token.tokens)
        : token.text;
      return '<mark>' + inner + '</mark>';
    }
  });

  return extensions;
}, 9);
