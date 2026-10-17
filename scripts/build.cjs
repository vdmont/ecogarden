// 生态花园 · ecogarden —— 构建：把模块化工程内联成单文件离线版 dist/index.html
// 输入：根 index.html + src/ui/style.css + scripts/files.json 列出的每个脚本
// 输出：完全自包含的 index.html（无任何外部请求），默认落到仓库根 dist/
// 用法：node scripts/build.cjs [输出目录]
//
// 注意：本脚本要求 scripts/files.json 与根 index.html 的 <script src> 列表完全一致。
// 两者不一致时直接报错退出，而不是静默丢掉一段代码后仍然"构建成功"。
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const base = path.resolve(__dirname, '..');
const out = path.resolve(process.argv[2] || path.join(base, 'dist'));

const scripts = JSON.parse(fs.readFileSync(path.join(base, 'scripts/files.json'), 'utf8'));
let html = fs.readFileSync(path.join(base, 'index.html'), 'utf8');

// 0) 动手之前先校验清单：入口引用的脚本列表必须与 files.json 完全一致（含顺序）。
//    目的：维持「files.json 是加载顺序唯一事实来源」这一不变式，并防止只改其中一处
//    造成的静默漂移。注意顺序**不影响**产物字节（替换是按名字定位的，输出顺序由
//    index.html 决定），但顺序在运行时有真实影响——例如 species.js 依赖 text.js 先定义
//    globalThis.T，顺序调换会在浏览器里直接 ReferenceError。所以这里前置拦截。
const declared = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
if (declared.length !== scripts.length || declared.some((f, i) => f !== scripts[i])) {
  throw new Error(
    'index.html 的 script 列表与 scripts/files.json 不一致（顺序或内容）\n' +
      '  index.html : ' +
      JSON.stringify(declared) +
      '\n' +
      '  files.json : ' +
      JSON.stringify(scripts),
  );
}

let replaced = 0;
// 所有替换都走这个函数：要求恰好命中一次，否则报错（避免标记写错却仍然构建"成功"）
const replaceOnce = (needle, make) => {
  const hit = html.split(needle).length - 1;
  if (hit !== 1)
    throw new Error('index.html 中 "' + needle + '" 出现 ' + hit + ' 次，预期恰好 1 次');
  html = html.replace(needle, make);
  replaced++;
};

// 1) 内联样式
replaceOnce(
  '<link rel="stylesheet" href="src/ui/style.css">',
  () => '<style>' + fs.readFileSync(path.join(base, 'src/ui/style.css'), 'utf8') + '</style>',
);

// 2) 按 files.json 的顺序内联脚本，并逐个做语法检查
for (const file of scripts) {
  const code = fs.readFileSync(path.join(base, file), 'utf8');
  new vm.Script(code, { filename: file });
  replaceOnce(
    '<script src="' + file + '"></script>',
    () => '<script>' + code.replace(/<\/script/gi, '<\\/script') + '</script>',
  );
}

// 3) 收尾校验：内联数量与外部引用
if (replaced !== scripts.length + 1) {
  throw new Error(
    '内联 ' +
      replaced +
      ' 处，预期 ' +
      (scripts.length + 1) +
      ' 处（' +
      scripts.length +
      ' 个脚本 + 1 个样式）',
  );
}
const leftover = html.match(/<script[^>]+src=|<link[^>]+stylesheet/g);
if (leftover) throw new Error('构建产物仍存在外部引用：' + leftover.join(', '));

fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'index.html'), html);
console.log(
  'Built offline game ' + Buffer.byteLength(html) + ' bytes → ' + path.join(out, 'index.html'),
);
