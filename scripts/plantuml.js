/**
 * plantuml.js — PlantUML 渲染器
 *
 * 构建时把 ```plantuml 代码块渲染为 SVG 图片：
 *   - 收集所有源码 → 写入临时 .puml 文件（按内容 hash 命名，相同图只渲染一次）
 *   - 调用 `java -jar plantuml.jar` 渲染
 *   - 本地无 Java 时降级：输出占位提示，仍保留完整流程
 */
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

/** 为 PlantUML 源码生成确定性文件名（内容 hash，无需时间戳） */
function hashOf(content) {
  return crypto.createHash('sha1').update(content).digest('hex').slice(0, 12);
}

class PlantUMLBuilder {
  constructor({ rootDir, javaCmd = 'java' }) {
    this.rootDir = rootDir;
    this.javaCmd = javaCmd;
    this.collected = new Map(); // hash → { source, fileName }
    this.svgDir = path.join(rootDir, 'dist', 'assets', 'puml');
    this.tmpDir = path.join(rootDir, '.puml-tmp');
  }

  /** 由 markdown 渲染器调用：收集源码，返回 hash 与文件名 */
  collect(source) {
    const hash = hashOf(source);
    if (!this.collected.has(hash)) {
      this.collected.set(hash, { source, fileName: `puml-${hash}.svg` });
    }
    return { hash, fileName: this.collected.get(hash).fileName };
  }

  /** 是否可用（有 Java 且找到 plantuml.jar） */
  async available() {
    if (!this.jarPath) {
      const candidates = [
        path.join(this.rootDir, 'plantuml.jar'),
        path.join(this.rootDir, 'scripts', 'plantuml.jar'),
        process.env.PLANTUML_JAR
      ].filter(Boolean);
      this.jarPath = candidates.find(p => p && fs.existsSync(p));
    }
    return Boolean(this.jarPath);
  }

  /** 执行渲染：所有收集到的图 → dist/assets/puml/*.svg；返回成功/失败的图列表 */
  async renderAll() {
    await fsp.mkdir(this.svgDir, { recursive: true });
    await fsp.mkdir(this.tmpDir, { recursive: true });
    try {
      const ok = [], failed = [];
      for (const [hash, { source, fileName }] of this.collected) {
        const out = path.join(this.svgDir, fileName);
        if (fs.existsSync(out)) { ok.push(fileName); continue; } // 增量构建：已存在则跳过
        const pumlFile = path.join(this.tmpDir, `puml-${hash}.puml`);
        await fsp.writeFile(pumlFile, '@startuml\n' + source.replace(/^\s*@startuml\s*$/i, '').trim() + '\n@enduml\n', 'utf8');
        try {
          execFileSync(this.javaCmd, ['-jar', this.jarPath, '-tsvg', '-charset', 'UTF-8', '-o', this.svgDir, pumlFile],
            { stdio: 'pipe', timeout: 60000 });
          // plantuml 输出文件名为 puml-<hash>.svg（与 puml 文件同名）
          const produced = path.join(this.svgDir, `puml-${hash}.svg`);
          if (!fs.existsSync(produced)) {
            // 文件名不一致时尝试重命名
            const files = fs.readdirSync(this.svgDir).filter(f => f.endsWith('.svg'));
            if (files.length) {
              await fsp.rename(path.join(this.svgDir, files[0]), out);
            } else { throw new Error('PlantUML 未生成输出文件'); }
          }
          ok.push(fileName);
        } catch (e) {
          failed.push({ fileName, error: e.message });
        }
      }
      return { ok, failed };
    } finally {
      // 无论成功、失败还是异常中断，都清理临时目录，不留残留
      await fsp.rm(this.tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}

/** 本地构建（无 Java）时的降级占位 HTML：显示源码 + 提示 */
function fallbackHtml(source) {
  const esc = String(source).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<div class="plantuml-fallback">
    <div class="plantuml-fallback-hint">⚠️ 本机未配置 PlantUML（需要 Java + plantuml.jar），
    部署到 GitHub Pages 后将自动渲染为图片</div>
    <pre><code class="language-plantuml">${esc}</code></pre>
  </div>`;
}

module.exports = { PlantUMLBuilder, fallbackHtml, hashOf };
