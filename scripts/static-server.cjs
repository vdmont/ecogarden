// 生态花园 · ecogarden —— 零依赖静态文件服务器（不引入任何 npm 依赖）
// 用途：本地试玩（服务仓库根）与构建产物预览（服务 dist/）。
// 行为与 v0.8 的 scripts/server.cjs 一致：仅监听 127.0.0.1、Cache-Control: no-cache、
// 只提供白名单扩展名的常规文件，并拒绝任何以 "." 开头的路径段（防止读到 .git、.env 等）。
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jsonl': 'application/x-ndjson; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

// root: 要对外提供的目录（绝对路径）；port: 监听端口；host: 仅本机
function serve(root, port, host = '127.0.0.1') {
  const base = path.resolve(root);
  const server = http.createServer((req, res) => {
    let rel;
    let rawPath;
    let normPath;
    try {
      // WHATWG URL 解析器会静默消掉 "." / ".." 点段（/../package.json → /package.json，/%2e%2e/ 同理），
      // 所以必须把「原始 request-target 的路径」与「解析后的 pathname」对照：两者不一致即说明发生了
      // 点段规范化，直接拒绝。否则点段类穿越在到达下面的包含性检查前就已经被折叠成根内路径。
      const target = String(req.url || '/');
      rawPath = target.split(/[?#]/)[0];
      const parsed = new URL(target, 'http://127.0.0.1');
      normPath = parsed.pathname;
      rel = decodeURIComponent(parsed.pathname);
    } catch {
      res.writeHead(400).end();
      return;
    }
    if (rawPath !== normPath) {
      res.writeHead(403).end();
      return;
    }
    if (rel.endsWith('/')) rel += 'index.html';
    const file = path.resolve(base, '.' + rel);
    // 路径穿越防护：必须仍位于 base 之内，且任何以 "." 开头的路径段一律拒绝
    if (!file.startsWith(base + path.sep) || rel.split('/').some((x) => x.startsWith('.'))) {
      res.writeHead(403).end();
      return;
    }
    fs.stat(file, (err, stat) => {
      if (err || !stat.isFile() || !TYPES[path.extname(file).toLowerCase()]) {
        res.writeHead(404).end();
        return;
      }
      res.writeHead(200, {
        'Content-Type': TYPES[path.extname(file).toLowerCase()],
        'Cache-Control': 'no-cache',
      });
      fs.createReadStream(file).pipe(res);
    });
  });
  server.listen(port, host, () => console.log('ecogarden: http://' + host + ':' + port + '/'));
  return server;
}

module.exports = { serve, TYPES };
