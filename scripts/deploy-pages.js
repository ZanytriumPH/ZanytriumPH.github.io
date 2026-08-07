/**
 * deploy-pages.js — 本地构建并推送到 gh-pages 分支部署 GitHub Pages
 *
 * 绕过 GitHub Actions（deploy-pages 曾因 GitHub 后端问题卡在 deployment_in_progress）：
 *   本地 npm run build → 同步 dist 到 gh-pages 分支 → git push
 *   配合仓库 Settings → Pages → Source: Deploy from a branch（gh-pages / (root)）
 *
 * 首次运行自动创建 gh-pages 孤儿分支（仅含构建产物，无源码历史）与 worktree；
 * 之后为增量提交推送。
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
// worktree 放仓库外同级目录，避免与主仓库文件相互干扰
const WT = path.join(path.dirname(ROOT), `${path.basename(ROOT)}-gh-pages`);

const sh = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'inherit' });
const ok = (cmd, cwd) => { try { execSync(cmd, { cwd, stdio: 'ignore' }); return true; } catch { return false; } };

/** 清空目录内容（保留 .git 文件），用于把 dist 干净地同步进 worktree */
function wipe(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git') continue;
    fs.rmSync(path.join(dir, e.name), { recursive: true, force: true });
  }
}

// 1. 构建
console.log('🏗  构建 dist/…');
sh('npm run build', ROOT);

// 2. 首次使用：创建 gh-pages 孤儿分支（无 main 历史）并关联 worktree
const hasBranch = ok('git rev-parse --verify -q refs/heads/gh-pages', ROOT);
if (!fs.existsSync(WT)) {
  console.log('🌱 首次部署：创建 gh-pages 分支 + worktree…');
  sh(`git worktree add --detach "${WT}" HEAD`, ROOT);
  if (hasBranch) {
    sh('git checkout gh-pages', WT);
  } else {
    sh('git checkout --orphan gh-pages', WT);
    ok('git rm -rf . --quiet', WT); // 孤儿分支清空 main 的内容（无内容时忽略报错）
  }
} else if (!hasBranch) {
  // worktree 目录残留但分支丢失（罕见）：重建孤儿分支
  sh('git checkout --orphan gh-pages', WT);
  ok('git rm -rf . --quiet', WT);
}

// 3. 同步 dist → worktree
console.log('📦 同步 dist/ → gh-pages 分支…');
wipe(WT);
for (const e of fs.readdirSync(DIST, { withFileTypes: true })) {
  fs.cpSync(path.join(DIST, e.name), path.join(WT, e.name), { recursive: true });
}

// 4. 提交并推送（无变更则跳过）
sh('git add -A', WT);
if (!ok('git diff --cached --quiet', WT)) {
  const stamp = new Date().toLocaleString('zh-CN', { hour12: false });
  sh(`git commit -m "deploy: ${stamp}"`, WT);
  console.log('🚀 推送 gh-pages…');
  sh('git push origin gh-pages', WT);
  console.log('✅ 已推送。GitHub Pages（Deploy from a branch）将在 1-2 分钟内更新');
} else {
  console.log('ℹ️  产物无变化，跳过提交与推送');
}
