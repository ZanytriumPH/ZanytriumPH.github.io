/**
 * build.js — 构建主流程
 *
 * source/_posts/*.md  → 文章页（含 TOC / 标签 / 上下篇 / 评论挂载）
 * source/_pages/*.md  → 独立页面（关于、友链…）
 * 输出 dist/ 静态站点，同时生成 search.json 供前端模糊搜索
 */
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { execFileSync } = require('child_process');
const matter = require('gray-matter');
const { createMd } = require('./md');
const { PlantUMLBuilder, fallbackHtml } = require('./plantuml');
const T = require('./templates');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SRC_POSTS = path.join(ROOT, 'source', '_posts');
const SRC_PAGES = path.join(ROOT, 'source', '_pages');
const ASSETS = path.join(ROOT, 'assets');

/** 时间文案：统一格式 YYYY-MM-DD HH:mm:ss；输入仅有日期时补 00:00:00 */
function dateText(v) {
  // 纯日期字符串按 UTC 解析会偏移时区（如东八区变 08:00:00），直接补 00:00:00
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v} 00:00:00`;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} `
    + `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** 本地时区的 YYYY-MM-DD（仅日期，按年/月/日拼接避免 UTC 跨天） */
function isoDateOf(v) {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * 预计阅读时间（分钟）：依据词数估算。
 * 阅读速度按中文约 300 字/分钟（countWords 为「中文字符数 + 英文单词数」的混合统计，
 * 本博客以中文为主，统一按 300 计）；向上取整，最少 1 分钟。
 */
function estimateReadMinutes(words) {
  return Math.max(1, Math.ceil(words / 300));
}

/** 取 git 最后修改该文件的提交时间（ISO 8601，含时分秒与时区）；非 git 仓库或文件未提交时返回 null */
function gitLastModified(file) {
  try {
    const out = String(execFileSync('git', ['log', '-1', '--format=%cI', '--', file],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })).trim();
    return out && !Number.isNaN(new Date(out).getTime()) ? out : null;
  } catch {
    return null;
  }
}

/** 取 git 首次提交该文件的提交时间（ISO 8601，含时分秒与时区）；非 git 仓库或文件未提交时返回 null */
function gitFirstCommitted(file) {
  try {
    // 注意不能写 --reverse -1：git 的 -1（max-count）在反转前就截取了最新一条，
    // --reverse -1 返回的其实是最后提交。改为全量反向输出（旧→新）后取首行。
    const out = String(execFileSync('git', ['log', '--format=%cI', '--reverse', '--', file],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })).trim();
    const first = out.split('\n')[0] || '';
    return first && !Number.isNaN(new Date(first).getTime()) ? first : null;
  } catch {
    return null;
  }
}

/** 统计字数：中文按字符计、英文/数字按单词计；剔除代码块、行内代码与链接语法 */
function countWords(mdText) {
  let t = mdText
    .replace(/```[\s\S]*?```/g, ' ')          // 代码围栏块
    .replace(/`[^`]*`/g, ' ')                  // 行内代码
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')     // 图片
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')      // 链接
    .replace(/[*_#>~|]/g, ' ');                // markdown 标记符
  const cjk = (t.match(/[一-鿿㐀-䶿]/g) || []).length;
  const words = (t.match(/[A-Za-z0-9]+/g) || []).length;
  return cjk + words;
}

/** 从渲染后的 HTML 提取 h2/h3 标题生成 TOC */
function buildToc(html) {
  const lines = [];
  const re = /<h([23]) id="([^"]+)">(.*?)<\/h\1>/g;
  let m;
  while ((m = re.exec(html))) {
    const [, level, id, title] = m;
    lines.push(`<li class="toc-l${level}"><a href="#${id}">${title}</a></li>`);
  }
  return lines.join('');
}

async function main() {
  const config = JSON.parse(await fsp.readFile(path.join(ROOT, 'config.json'), 'utf8'));
  const url = T.makeUrl(config.base);
  // 静态资源版本号：每次构建换新时间戳 → 部署后浏览器必取新 CSS/JS，不再命中旧缓存
  T.setAssetVer(Date.now());

  console.log('🗑  清理 dist/…');
  await fsp.rm(DIST, { recursive: true, force: true });

  // --- 渲染上下文 ---
  const puml = new PlantUMLBuilder({ rootDir: ROOT });
  const md = createMd({ puml, usedSlugs: new Set() });

  // --- 读取文章 ---
  const postFiles = (await fsp.readdir(SRC_POSTS)).filter(f => f.endsWith('.md'));
  const posts = [];
  for (const file of postFiles) {
    const raw = await fsp.readFile(path.join(SRC_POSTS, file), 'utf8');
    const { data, content } = matter(raw);
    const baseName = file.replace(/\.md$/, '');
    const html = md.render(content, { puml, usedSlugs: new Set() });
    // 是否含时分秒：以 front matter 原文判断（gray-matter 会把裸日期解析成 UTC 午夜 Date，
    // 不能靠值判断）。仅日期 → 天级 ISO（本地时区，避免 UTC 跨天）；含时分秒 → 完整 ISO
    const dateHasTime = /T\d{2}:| \d{2}:\d{2}/.test((raw.match(/^date:\s*(.+)$/m) || [])[1] || '');
    const updatedHasTime = /T\d{2}:| \d{2}:\d{2}/.test((raw.match(/^updated:\s*(.+)$/m) || [])[1] || '');
    // 创建时间：front matter 显式 date 优先；否则自动取 git 首次提交该文件的提交时间（均含秒判定）
    const date = data.date
      ? (dateHasTime ? new Date(data.date).toISOString() : isoDateOf(data.date))
      : (gitFirstCommitted(path.join(SRC_POSTS, file)) || isoDateOf(new Date()));
    // 修改时间：front matter 显式 updated 优先（可精确到秒）；否则自动取 git 提交时间（含时分秒）
    const updated = data.updated
      ? (updatedHasTime ? new Date(data.updated).toISOString() : isoDateOf(data.updated))
      : gitLastModified(path.join(SRC_POSTS, file));
    const words = countWords(content);
    posts.push({
      slug: baseName,
      title: data.title || baseName,
      date,
      updated,
      dateText: dateText(date),
      updatedText: updated ? dateText(updated) : null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      categories: Array.isArray(data.categories) ? data.categories : [],
      priority: Number.isInteger(data.priority) ? data.priority : 0, // 可选置顶权重，默认 0，越大越靠前
      description: data.description || '',
      cover: data.cover || '', // 可选封面（front matter cover，根路径），用于首页卡片与文章页
      html,
      toc: buildToc(html),
      words,
      readMinutes: estimateReadMinutes(words),
      path: `posts/${baseName}.html`
    });
  }
  posts.sort((a, b) => b.date.localeCompare(a.date));

  console.log(`📄 共 ${posts.length} 篇文章`);

  // --- 读取独立页面 ---
  const pages = [];
  for (const file of (await fsp.readdir(SRC_PAGES)).filter(f => f.endsWith('.md'))) {
    const raw = await fsp.readFile(path.join(SRC_PAGES, file), 'utf8');
    const { data, content } = matter(raw);
    const baseName = file.replace(/\.md$/, '');
    pages.push({
      slug: baseName,
      title: data.title || baseName,
      description: data.description || '',
      data,
      html: md.render(content, { puml, usedSlugs: new Set() })
    });
  }

  // --- 复制静态资源 ---
  await fsp.cp(ASSETS, path.join(DIST, 'assets'), { recursive: true });
  // highlight.js 主题样式（构建时从 node_modules 复制，保证离线可用）
  const hljsSrc = path.join(ROOT, 'node_modules', 'highlight.js', 'styles', 'github.css');
  const hljsDarkSrc = path.join(ROOT, 'node_modules', 'highlight.js', 'styles', 'github-dark.css');
  if (fs.existsSync(hljsSrc)) await fsp.copyFile(hljsSrc, path.join(DIST, 'assets', 'css', 'hljs.css'));
  if (fs.existsSync(hljsDarkSrc)) await fsp.copyFile(hljsDarkSrc, path.join(DIST, 'assets', 'css', 'hljs-dark.css'));
  // --- 渲染 PlantUML ---
  console.log('📊 渲染 PlantUML 图…');
  if (await puml.available()) {
    const { ok, failed } = await puml.renderAll();
    console.log(`   ✅ ${ok.length} 张渲染成功${failed.length ? `，❌ ${failed.length} 张失败` : ''}`);
    if (failed.length) console.log('   ' + failed.map(f => `${f.fileName}: ${f.error}`).join('\n   '));
  } else {
    console.log('   ⚠️  本地无 Java/plantuml.jar，图将降级为代码块（部署后自动渲染）');
  }

  // --- 生成页面 ---
  await fsp.mkdir(path.join(DIST, 'posts'), { recursive: true });

  const write = async (file, html) => {
    const p = path.join(DIST, file);
    await fsp.mkdir(path.dirname(p), { recursive: true });
    await fsp.writeFile(p, html, 'utf8');
  };

  // 文章页（含 PlantUML 占位替换）
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    let html = post.html;
    // 替换 plantuml 占位：有 SVG → <img>；否则降级为源码块
    if (html.includes('data-plantuml=')) {
      html = html.replace(/<div class="plantuml-wrap" data-plantuml="([^"]+)" data-file="([^"]+)"><\/div>/g,
        (match, hash, fileName) => {
          const svgPath = path.join(DIST, 'assets', 'puml', fileName);
          return fs.existsSync(svgPath)
            ? `<figure class="plantuml-figure"><img src="${url('assets/puml/' + fileName)}" alt="PlantUML 图" loading="lazy"></figure>`
            : fallbackHtml(puml.collected.get(hash)?.source || '');
        });
      post.html = html;
    }
    const page = T.postPage({
      config, url, post,
      prev: posts[i - 1] || null,
      next: posts[i + 1] || null
    });
    await write(`posts/${post.slug}.html`, page);
  }

  // 首页 / 归档 / 标签 / 分类
  await write('index.html', T.indexPage({ config, url, posts }));
  await write('archives.html', T.archivesPage({ config, url, posts }));

  // 标签独立页：tags/<slug>.html，slug 冲突时加 -2/-3 去重
  const slugMap = new Map();
  const usedSlugs = new Set();
  for (const p of posts) for (const t of p.tags) {
    if (slugMap.has(t)) continue;
    let s = T.tagSlug(t), u = s, n = 2;
    while (usedSlugs.has(u)) u = `${s}-${n++}`;
    usedSlugs.add(u);
    slugMap.set(t, u);
  }
  for (const [tag, slug] of slugMap) {
    const list = posts.filter(p => p.tags.includes(tag));
    await write(`tags/${slug}.html`, T.tagPage({ config, url, tag, posts: list }));
  }
  await write('tags.html', T.tagsPage({ config, url, posts, slugMap }));

  // 分类独立页：categories/<slug>.html（slug 冲突处理同标签）
  const catSlugMap = new Map();
  const usedCatSlugs = new Set();
  for (const p of posts) for (const c of p.categories) {
    if (catSlugMap.has(c)) continue;
    let s = T.tagSlug(c), u = s, n = 2;
    while (usedCatSlugs.has(u)) u = `${s}-${n++}`;
    usedCatSlugs.add(u);
    catSlugMap.set(c, u);
  }
  for (const [cat, slug] of catSlugMap) {
    const list = posts.filter(p => p.categories.includes(cat));
    await write(`categories/${slug}.html`, T.categoryPage({ config, url, category: cat, posts: list }));
  }
  await write('categories.html', T.categoriesPage({ config, url, posts, slugMap: catSlugMap }));

  // 独立页面（关于走富文本；友链走胶囊列表，front matter 的 friends 数组为数据源）
  const aboutPage = pages.find(p => p.slug === 'about');
  if (aboutPage) await write('about.html', T.pagePage({ config, url, page: aboutPage }));
  const friendsPage = pages.find(p => p.slug === 'friends');
  if (friendsPage) await write('friends.html', T.friendsPage({ config, url, friends: friendsPage.data.friends || [] }));
  for (const p of pages) {
    if (p.slug === 'about' || p.slug === 'friends') continue;
    await write(`${p.slug}.html`, T.pagePage({ config, url, page: p }));
  }

  // 404 + 搜索索引
  await write('404.html', T.notFoundPage({ config, url }));
  await write('search.json', JSON.stringify(posts.map(p => ({
    title: p.title, url: url(`posts/${p.slug}.html`),
    tags: p.tags, categories: p.categories, description: p.description, date: p.date.slice(0, 10)
  })), null, 2));

  console.log('✅ 构建完成 → dist/');
}

main().catch(e => { console.error(e); process.exit(1); });
