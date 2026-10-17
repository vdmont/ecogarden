// 生态花园 · ecogarden —— 构建：把模块化工程内联成单文件离线版 dist/index.html
// 输入：根 index.html + src/ui/style.css + scripts/files.json 列出的每个脚本
//       + src/ui/audio.js 曲库里点名的背景音乐 + style.css 里 @font-face 引用的字体
// 输出：dist/index.html —— 一个文件，代码、样式、音乐、字体全在里面，拷走就能玩
// 用法：node scripts/build.cjs [输出目录]
//
// 关于「单文件」：产物不许依赖旁边的任何东西，双击就能玩，所以代码、样式、音频、
// 字体统统转成 data URI 内联。代价是体积会涨（base64 比原文大三分之一），
// 而且产物本身变得没法直接读、git diff 会很难看。所以真正的规矩是**别把没必要的
// 字节塞进来**：
//   · 音乐只放曲库里点名的几首，不要整包丢进去；
//   · 字体必须先裁剪到"源码里实际用到的字"。整份中文字库内联能到 30 MB 以上，
//     裁完只有 0.4 MB。超过 FONT_INLINE_MAX_BYTES 就直接构建失败，
//     而不是默默产出一个没人打得开的巨型 html。
//
// 曾经踩过的坑（别改回去）：这条规矩一度写成"必须无任何外部请求"，理由是
// "base64 会把几 MB 的音乐撑成 4 MB 的庞然大物"。实测 3 次取中位数，
// 音乐外部 0.8 MB html 与音乐内联 4 MB html 的打开耗时互相上下、测不出差别
// （file:// 238ms vs 202ms，http:// 290ms vs 313ms）。那个理由是夸大的，
// 真实理由是"大文件不该进单文件"，跟"能不能打开"无关。
//
// 注意：本脚本要求 scripts/files.json 与根 index.html 的 <script src> 列表完全一致。
// 两者不一致时直接报错退出，而不是静默丢掉一段代码后仍然"构建成功"。
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const base = path.resolve(__dirname, '..');
const out = path.resolve(process.argv[2] || path.join(base, 'dist'));

const AUDIO_MIME = {
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.oga': 'audio/ogg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.flac': 'audio/flac',
};
const FONT_MIME = { '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff2': 'font/woff2' };
// 超过这个大小就不内联。裁过的中文字体 0.4 MB，整份 24 MB —— 中间没有"差不多"的余地。
const FONT_INLINE_MAX_BYTES = 2 * 1024 * 1024;

const scripts = JSON.parse(fs.readFileSync(path.join(base, 'scripts/files.json'), 'utf8'));
const stylePath = path.join(base, 'src/ui/style.css');
let html = fs.readFileSync(path.join(base, 'index.html'), 'utf8');
let css = fs.readFileSync(stylePath, 'utf8');

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
      '\n  files.json : ' +
      JSON.stringify(scripts),
  );
}

// ── 收集要内联的二进制资源 ──────────────────────────────────────────────
// 一律在替换发生前先算好 URI，再一次性改写源码；这样任何一个资源出问题都是构建失败，
// 不会出现"构建成功但游戏里没声音"。

// 1) 背景音乐：曲库写在 src/ui/audio.js 的 MUSIC_TRACKS 里，路径相对仓库根
//    （开发时页面就在仓库根，所以 dev 与离线版共用同一串字符）。
const audioSrc = fs.readFileSync(path.join(base, 'src/ui/audio.js'), 'utf8');
const listMatch = audioSrc.match(/MUSIC_TRACKS\s*=\s*\[([\s\S]*?)\]/);
if (!listMatch) throw new Error('src/ui/audio.js 里找不到 MUSIC_TRACKS');
const tracks = [...listMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
if (!tracks.length) throw new Error('src/ui/audio.js 里的 MUSIC_TRACKS 是空的');

const musicUris = new Map();
let musicBytes = 0;
for (const t of tracks) {
  const mime = AUDIO_MIME[path.extname(t).toLowerCase()];
  if (!mime) throw new Error('曲库里的音频格式不认识：' + t);
  const from = path.join(base, t);
  if (!fs.existsSync(from)) throw new Error('曲库里的音频不存在：' + t);
  const buf = fs.readFileSync(from);
  musicBytes += buf.length;
  musicUris.set(t, 'data:' + mime + ';base64,' + buf.toString('base64'));
}

// 2) 字体：CSS 里 @font-face 的 src 指向仓库内文件时一并内联。
//    CSS 的 url() 是相对**样式表自己**解析的，所以基准目录是 src/ui/。
//    这里在扫到的当场就替换掉，不留到后面做字符串查找——url() 可以带引号也可以不带，
//    靠找 "'路径'" 会漏掉不带引号的那种，然后误报成"出现 0 次"。
const fontUris = new Map();
let fontBytes = 0;
css = css.replace(
  /@font-face\s*{[^}]*?src:\s*url\(\s*(['"]?)([^'")]+)\1\s*\)/g,
  (whole, _q, url) => {
    if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return whole; // 外链或已是内联
    const mime = FONT_MIME[path.extname(url).toLowerCase()];
    if (!mime) throw new Error('CSS 里 @font-face 指向的文件格式不认识：' + url);
    const from = path.resolve(path.dirname(stylePath), url);
    if (!fs.existsSync(from)) throw new Error('@font-face 指向的字体不存在：' + url);
    const buf = fs.readFileSync(from);
    if (buf.length > FONT_INLINE_MAX_BYTES)
      throw new Error(
        '字体 ' +
          url +
          ' 有 ' +
          Math.round(buf.length / 1024) +
          ' KB，超过 ' +
          Math.round(FONT_INLINE_MAX_BYTES / 1024) +
          ' KB 的内联上限。\n' +
          '  整份中文字库 base64 之后能到 30 MB 以上，而裁到源码实际用到的字只有 0.4 MB。\n' +
          '  请先跑子集化（见 AGENTS.md 第 7 节）再构建。',
      );
    fontBytes += buf.length;
    const uri = 'data:' + mime + ';base64,' + buf.toString('base64');
    fontUris.set(url, uri);
    return whole.replace(url, uri);
  },
);

// 改写源码里被引号包住的曲库路径。要求每个路径恰好出现一次：0 次说明曲库写了条
// 没人用的路径，多出来几次说明被别处复用，两种都该在构建时就报出来而不是留给玩家。
const rewriteRefs = (code, map, label) => {
  let out = code;
  for (const [from, to] of map) {
    const needle = "'" + from + "'";
    const n = out.split(needle).length - 1;
    if (n !== 1) throw new Error(label + ' 里 "' + from + '" 出现 ' + n + ' 次，预期恰好 1 次');
    out = out.replace(needle, "'" + to + "'");
  }
  return out;
};

let replaced = 0;
// 所有替换都走这个函数：要求恰好命中一次，否则报错（避免标记写错却仍然构建"成功"）
const replaceOnce = (needle, make) => {
  const hit = html.split(needle).length - 1;
  if (hit !== 1)
    throw new Error('index.html 中 "' + needle + '" 出现 ' + hit + ' 次，预期恰好 1 次');
  html = html.replace(needle, make);
  replaced++;
};

// 3) 内联样式（字体的 data URI 已经在上面扫 @font-face 时替换掉了）
replaceOnce('<link rel="stylesheet" href="src/ui/style.css">', () => '<style>' + css + '</style>');

// 4) 按 files.json 的顺序内联脚本，并逐个做语法检查（曲库在 audio.js 这一步改写）
for (const file of scripts) {
  let code = fs.readFileSync(path.join(base, file), 'utf8');
  if (file === 'src/ui/audio.js') code = rewriteRefs(code, musicUris, file);
  new vm.Script(code, { filename: file });
  replaceOnce(
    '<script src="' + file + '"></script>',
    () => '<script>' + code.replace(/<\/script/gi, '<\\/script') + '</script>',
  );
}

// 5) 收尾校验：内联数量与外部引用
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

// 产物里不该再出现任何指向仓库资源的路径。这里查的是"真的在引用外部文件"
// （src= 或 url( 后面跟的路径），而不是"源码里出现过这段字符串"——后者会误伤注释和文案。
// 正则刻意允许路径带 ../ 以及 url() 不带引号，两种写法都会被抓到。
const strays = [...html.matchAll(/(?:src=|url\()\s*['"]?((?:\.\.\/)*assets\/[\w.\-/]+)/g)].map(
  (m) => m[1],
);
if (strays.length)
  throw new Error('产物里仍引用仓库文件（应当已内联）：' + [...new Set(strays)].join(', '));
for (const t of tracks) {
  if (html.includes("'" + t + "'"))
    throw new Error('曲库路径 ' + t + ' 没被改写成 data URI，离线版会听不到音乐');
}

fs.mkdirSync(out, { recursive: true });
// 旧版本构建会把音乐拷到 dist/assets/bgm/。产物已经是单文件了，留着它只会让人
// 多拷 2 MB 死文件。只在那个目录里全是这类 mp3 时才删——否则宁可报错也不动来路不明的东西。
const stale = path.join(out, 'assets');
if (fs.existsSync(stale)) {
  const staleFiles = [];
  const walk = (d, rel) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      const r = rel ? rel + '/' + e.name : e.name;
      if (e.isDirectory()) walk(p, r);
      else staleFiles.push(r);
    }
  };
  walk(stale, '');
  const allOldMusic =
    staleFiles.length > 0 && staleFiles.every((f) => /^bgm\/[\w.-]+\.mp3$/.test(f));
  if (allOldMusic) fs.rmSync(stale, { recursive: true });
  else
    throw new Error(
      '输出目录里有来路不明的 dist/assets（' +
        staleFiles.slice(0, 5).join(', ') +
        '），不敢自动删。请自己确认后清掉。',
    );
}

fs.writeFileSync(path.join(out, 'index.html'), html);

const kb = (n) => Math.round(n / 1024);
console.log(
  'Built single-file offline game ' +
    kb(Buffer.byteLength(html)) +
    ' KB（' +
    tracks.length +
    ' 首音乐 ' +
    kb(musicBytes) +
    ' KB' +
    (fontUris.size ? ' + ' + fontUris.size + ' 份字体 ' + kb(fontBytes) + ' KB' : '') +
    '） → ' +
    out,
);
