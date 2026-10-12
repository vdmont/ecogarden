// 生态花园 · ecogarden —— 构建产物预览：服务 dist/（离线单文件版）
// 入口：http://127.0.0.1:4173/  →  dist/index.html
// 用法：node scripts/preview.cjs [端口]     （等价于 npm run preview）
// 注意：dist/ 是构建产物且已在 .gitignore 中忽略，需要先运行 npm run build 生成。
const fs = require('node:fs');
const path = require('node:path');
const { serve } = require('./static-server.cjs');

const root = path.resolve(__dirname, '..', 'dist');
const entry = path.join(root, 'index.html');

if (!fs.existsSync(entry)) {
  console.error('未找到 ' + entry);
  console.error('请先运行 npm run build 生成离线单文件版，再运行 npm run preview。');
  process.exit(1);
}

serve(root, Number(process.argv[2] || 4173));
