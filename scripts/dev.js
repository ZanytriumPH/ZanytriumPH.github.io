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
const watchers = ['source', 'assets', 'config.json'].map(p => {
  const target = path.join(ROOT, p);
  if (!fs.existsSync(target)) return null;
  return fs.watch(target, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(build, 300);
  });
});

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

process.on('SIGINT', () => { watchers.forEach(w => w && w.close()); process.exit(0); });
