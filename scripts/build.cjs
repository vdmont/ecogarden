// 生态花园 · ecogarden —— 构建：把模块化工程内联成单文件离线版 dist/index.html
// 输入：根 index.html + src/ui/style.css + scripts/files.json 列出的每个脚本
//       + assets/ 下 src/ui/audio.js 曲库里点名的背景音乐
// 输出：dist/index.html（代码与样式完全自包含）+ dist/bgm/*.mp3
// 用法：node scripts/build.cjs [输出目录]
//
// 关于「单文件」：代码和样式必须内联，音乐不内联。曲子是几 MB 的真实录音，
// 转成 base64 会再涨三分之一，把一个能秒开的离线版撑成 4 MB 的庞然大物；
// 而离线版本来就是整个文件夹一起拷走的，多带一个 bgm/ 目录没有任何成本。
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
  () =>
    '<style>' +
    fs
      .readFileSync(path.join(base, 'src/ui/style.css'), 'utf8')
      .replace('../../assets/fonts/LXGWWenKai-Medium.ttf', 'assets/fonts/LXGWWenKai-Medium.ttf') +
    '</style>',
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
fs.mkdirSync(path.join(out, 'assets/fonts'), { recursive: true });
for (const file of ['LXGWWenKai-Medium.ttf', 'OFL.txt'])
  fs.copyFileSync(path.join(base, 'assets/fonts', file), path.join(out, 'assets/fonts', file));
const fontLicense = fs.readFileSync(path.join(base, 'assets/fonts/OFL.txt'), 'utf8');
html = html.replace(
  '</body>',
  '<script type="text/plain" id="font-license">' + fontLicense + '</script></body>',
);
fs.writeFileSync(path.join(out, 'FONT-LICENSE.txt'), fontLicense);
fs.writeFileSync(path.join(out, 'index.html'), html);

// 4) 背景音乐：按 src/ui/audio.js 里的 MUSIC_TRACKS 逐个拷到 dist/ 下同名相对路径。
//    曲库里的路径是相对仓库根的（开发时页面就在仓库根，所以两边能共用同一个路径），
//    这里原样搬过去，产物里的相对引用因此不需要改一个字。
//    缺一个就直接报错，而不是构建出一个「打开游戏一片安静」的离线版。
const audioSrc = fs.readFileSync(path.join(base, 'src/ui/audio.js'), 'utf8');
const listMatch = audioSrc.match(/MUSIC_TRACKS\s*=\s*\[([\s\S]*?)\]/);
if (!listMatch) throw new Error('src/ui/audio.js 里找不到 MUSIC_TRACKS');
const tracks = [...listMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
if (!tracks.length) throw new Error('src/ui/audio.js 里的 MUSIC_TRACKS 是空的');

let musicBytes = 0;
for (const t of tracks) {
  const from = path.join(base, t);
  if (!fs.existsSync(from)) throw new Error('曲库里的音频不存在：' + t);
  const to = path.join(out, t);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  musicBytes += fs.statSync(to).size;
}

console.log(
  'Built offline game ' +
    Buffer.byteLength(html) +
    ' bytes + ' +
    tracks.length +
    ' 首背景音乐 ' +
    Math.round(musicBytes / 1024) +
    ' KB → ' +
    out,
);
