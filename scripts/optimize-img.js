#!/usr/bin/env node
/**
 * optimize-img.js — 博文图片压缩工具（AI 搬运图片时使用）
 *
 * 用法：
 *   node scripts/optimize-img.js <源图片目录> <文章slug> [选项]
 *
 * 示例：
 *   node scripts/optimize-img.js D:/素材/某篇文章/截图 hello-world
 *
 * 选项：
 *   --mode auto|lossless|lossy   压缩模式（默认 auto）
 *   --max-width 1600             最长边上限（默认 1600，小图不放大）
 *   --out <目录>                 输出根目录（默认 assets/img/posts）
 *
 * 行为：
 *   - 递归扫描源目录下 png/jpg/jpeg，输出到 <out>/<slug>/<原名>.webp
 *   - 源目录里已有的 .webp 原样复制（视为已优化）
 *   - auto 模式：缩到 128px 采样统计颜色数，≤2048 判定为图形/截图 → WebP lossless
 *     （纯色大块 + 文字边缘无损），否则按照片处理 → 有损 q80
 *   - 不删除源文件（原图留在仓库外做备份）
 *   - 结束时打印「旧路径 → 新路径」对照表，供改写 markdown 引用
 */
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_OUT = path.join(ROOT, 'assets', 'img', 'posts');
const MAX_WIDTH = 1600;         // 最长边上限：正文容器 860px，2x 屏最多 ~1720px
const SAMPLE_SIZE = 128;        // 颜色采样边长（缩到这么小再数颜色，毫秒级）
const COLOR_THRESHOLD = 2048;   // 采样颜色数 ≤ 此值 → lossless（图形/截图），否则有损
const QUALITY_LOSSY = 80;

const EXT_PHOTO = new Set(['.png', '.jpg', '.jpeg']);
const MODES = new Set(['auto', 'lossless', 'lossy']);

function usage() {
  console.log(`用法：node scripts/optimize-img.js <源图片目录> <文章slug> [选项]
选项：
  --mode auto|lossless|lossy   压缩模式（默认 auto）
  --max-width 1600             最长边上限（默认 1600）
  --out <目录>                 输出根目录（默认 assets/img/posts）`);
}

function parseArgs(argv) {
  const args = { src: null, slug: null, mode: 'auto', maxWidth: MAX_WIDTH, out: DEFAULT_OUT };
  const rest = [];
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--mode') args.mode = argv[++i];
    else if (a === '--max-width') args.maxWidth = Number(argv[++i]);
    else if (a === '--out') args.out = path.resolve(ROOT, argv[++i]);
    else rest.push(a);
  }
  if (rest.length >= 1) args.src = path.resolve(rest[0]);
  if (rest.length >= 2) args.slug = rest[1];
  return args;
}

/** 递归收集源目录下的图片文件（png/jpg/jpeg/webp） */
async function collectImages(dir) {
  const out = [];
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await collectImages(full));
    else {
      const ext = path.extname(e.name).toLowerCase();
      if (EXT_PHOTO.has(ext) || ext === '.webp') out.push(full);
    }
  }
  return out.sort();
}

/** 采样统计颜色数（跳过透明像素），用于图形/照片判定 */
async function countColors(file) {
  const { data, info } = await sharp(file)
    .resize({ width: SAMPLE_SIZE, height: SAMPLE_SIZE, fit: 'inside' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const seen = new Set();
  const ch = info.channels;
  for (let i = 0; i < data.length; i += ch) {
    if (ch === 4 && data[i + 3] < 16) continue; // 忽略透明像素
    seen.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
  }
  return seen.size;
}

/** 决定单张图的压缩模式 */
async function decideMode(file, mode) {
  if (mode !== 'auto') return mode;
  const colors = await countColors(file);
  return colors <= COLOR_THRESHOLD ? 'lossless' : 'lossy';
}

/** 输出文件名：去扩展名 + 防重（同 slug 下重名追加序号） */
function uniqueName(base, ext, used) {
  let name = `${base}.webp`;
  let n = 2;
  while (used.has(name)) name = `${base}-${n++}.webp`;
  used.add(name);
  return name;
}

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.src || !args.slug || !MODES.has(args.mode)) {
    usage();
    process.exit(1);
  }
  if (!fs.existsSync(args.src)) {
    console.error(`✗ 源目录不存在：${args.src}`);
    process.exit(1);
  }

  const outDir = path.join(args.out, args.slug);
  await fsp.mkdir(outDir, { recursive: true });

  const files = await collectImages(args.src);
  if (files.length === 0) {
    console.log(`⚠ 源目录下没有找到图片：${args.src}`);
    return;
  }

  console.log(`📦 找到 ${files.length} 张图 → ${path.relative(ROOT, outDir)}/\n`);
  const used = new Set();
  let done = 0, failed = 0, srcBytes = 0, outBytes = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const base = path.basename(file, ext);
    const target = path.join(outDir, uniqueName(base, ext, used));
    const srcSize = (await fsp.stat(file)).size;
    srcBytes += srcSize;
    try {
      if (ext === '.webp') {
        await fsp.copyFile(file, target);
        console.log(`  [复制] ${path.basename(file)} → ${path.relative(ROOT, target)}  (${fmtSize(srcSize)})`);
        outBytes += srcSize;
      } else {
        const mode = await decideMode(file, args.mode);
        let img = sharp(file);
        const meta = await img.metadata();
        if (meta.width > args.maxWidth) {
          img = img.resize({ width: args.maxWidth, withoutEnlargement: true });
        }
        const pipe = mode === 'lossless'
          ? img.webp({ lossless: true })
          : img.webp({ quality: QUALITY_LOSSY });
        const info = await pipe.toFile(target);
        outBytes += info.size;
        console.log(`  [${mode === 'lossless' ? '无损' : '有损q80'}] ${path.basename(file)}`
          + ` → ${path.relative(ROOT, target)}  (${fmtSize(srcSize)} → ${fmtSize(info.size)}${meta.width > args.maxWidth ? `，${meta.width}px→${args.maxWidth}px` : ''})`);
      }
      done++;
    } catch (e) {
      failed++;
      console.error(`  ✗ 处理失败 ${path.basename(file)}：${e.message}`);
    }
  }

  const saved = srcBytes - outBytes;
  const pct = srcBytes > 0 ? Math.round((saved / srcBytes) * 100) : 0;
  console.log(`\n✅ 完成 ${done} 张，失败 ${failed} 张；共 ${fmtSize(srcBytes)} → ${fmtSize(outBytes)}（节省 ${fmtSize(Math.max(0, saved))}，${pct}%）`);
  console.log('\n按以下对照改写 markdown 引用（src 用根路径，不要用相对路径）：');
  console.log(`  旧：![...](<源目录里的相对路径>)`);
  console.log(`  新：![...](/assets/img/posts/${args.slug}/<文件名>.webp)`);
}

main().catch((e) => {
  console.error('✗ 运行出错：', e);
  process.exit(1);
});
