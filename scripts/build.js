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
const matter = require('gray-matter');
const { createMd } = require('./md');
const { PlantUMLBuilder, fallbackHtml } = require('./plantuml');
const T = require('./templates');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SRC_POSTS = path.join(ROOT, 'source', '_posts');
const SRC_PAGES = path.join(ROOT, 'source', '_pages');
const ASSETS = path.join(ROOT, 'assets');

/** 年月日 → 中文日期文案 */
function dateText(iso) {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`;
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
    const date = data.date ? new Date(data.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    posts.push({
      slug: baseName,
      title: data.title || baseName,
      date,
      dateText: dateText(date),
      tags: Array.isArray(data.tags) ? data.tags : [],
      categories: Array.isArray(data.categories) ? data.categories : [],
      description: data.description || '',
      html,
      toc: buildToc(html),
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

  // 首页 / 标签 / 分类（归档页已按需求移除，如要恢复在 templates.js 中启用 archivesPage）
  await write('index.html', T.indexPage({ config, url, posts }));
  await write('tags.html', T.tagsPage({ config, url, posts }));
  await write('categories.html', T.categoriesPage({ config, url, posts }));

  // 独立页面（关于 / 友链）
  const aboutPage = pages.find(p => p.slug === 'about');
  if (aboutPage) await write('about.html', T.pagePage({ config, url, page: aboutPage }));
  for (const p of pages) {
    if (p.slug === 'about') continue;
    await write(`${p.slug}.html`, T.pagePage({ config, url, page: p }));
  }

  // 404 + 搜索索引
  await write('404.html', T.notFoundPage({ config, url }));
  await write('search.json', JSON.stringify(posts.map(p => ({
    title: p.title, url: url(`posts/${p.slug}.html`),
    tags: p.tags, categories: p.categories, description: p.description, date: p.date
  })), null, 2));

  console.log('✅ 构建完成 → dist/');
}

main().catch(e => { console.error(e); process.exit(1); });
