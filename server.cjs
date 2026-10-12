// 生态花园 · ecogarden —— 开发/试玩服务器：服务仓库根目录
// 入口：http://127.0.0.1:8877/  →  仓库根 index.html（工程入口，按 src/ 分层加载模块）
// 用法：node server.cjs [端口]     （等价于 npm run dev）
const path = require('node:path');
const { serve } = require('./scripts/static-server.cjs');

serve(path.resolve(__dirname), Number(process.argv[2] || 8877));
