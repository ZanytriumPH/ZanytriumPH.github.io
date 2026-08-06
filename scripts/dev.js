/**
 * dev.js — 本地开发服务器
 * 监听 source/、assets/、config.json 变化自动重新构建，http 静态服务 dist/
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PORT = process.env.PORT || 4000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function build() {
  try {
    execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'build.js')],
      { stdio: 'inherit', encoding: 'utf8' });
    console.log(`[${new Date().toLocaleTimeString()}] ✓ 构建完成，刷新浏览器查看`);
  } catch (e) {
    console.error('✗ 构建失败，修正后保存文件自动重试');
  }
}

build();

// 文件监听：防抖 300ms
let timer = null;
const watchers = ['source', 'assets'].map(p => {
  const target = path.join(ROOT, p);
  if (!fs.existsSync(target)) return null;
  return fs.watch(target, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(build, 300);
  });
});

// config.json 改用 mtime 轮询监听（每 2s 一次 stat）：
// Windows 上 fs.watch 对单个文件监听有个已知缺陷——文件被读取（构建每次读 config）
// 也会误报 change，导致“构建 → 触发重建 → 再构建”的无限循环；
// 而 stat 的 mtime 只在真正修改时变化，读取不影响
const configPath = path.join(ROOT, 'config.json');
let configMtime = fs.existsSync(configPath) ? fs.statSync(configPath).mtimeMs : 0;
const configTimer = setInterval(() => {
  if (!fs.existsSync(configPath)) return;
  const m = fs.statSync(configPath).mtimeMs;
  if (m !== configMtime) {
    configMtime = m;
    clearTimeout(timer);
    timer = setTimeout(build, 300);
  }
}, 2000);

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = path.join(DIST, urlPath === '/' ? 'index.html' : urlPath);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(DIST, '404.html');
    res.statusCode = 404;
  }
  const ext = path.extname(file);
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`🚀 开发服务器: http://localhost:${PORT}   （Ctrl+C 停止）`);
  console.log('📝 修改 source/ 或 assets/ 后自动重建，手动刷新浏览器');
});

process.on('SIGINT', () => {
  watchers.forEach(w => w && w.close());
  clearInterval(configTimer);
  process.exit(0);
});
