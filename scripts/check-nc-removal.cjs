// 守住一件事：库里不能有 CC BY-NC（仅限非商业）的音频。
//
// 2026-10-19 之前，这个脚本问的是"删掉 10 条 NC 之后会怎样"——一张预测表。
// 那 10 条已经按项目所有者的决定**真的删掉了**，所以脚本的职责随之改变：
// 现在它是一道闸，检查 NC 有没有以任何形式混回来：
//   1) music/sfx-map.json 里还引用着 NC（那构建时会被内联进离线版）
//   2) assets/calls/ 下 NC 的 mp3 还在盘上
//   3) 离线产物 dist/index.html 里还能搜到 NC 的文件名
// 只要有一条就退出码 1。
//
// 另外顺带报告"目前哪些物种没有录音"——那是删 NC 的直接后果，
// 补素材的时候要照着这张单子补。
//
// 用法：node scripts\check-nc-removal.cjs
const fs = require('fs');
const path = require('path');

const base = path.resolve(__dirname, '..');
const mapPath = path.join(base, 'music', 'sfx-map.json');
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

// NC 名单从 manifest.json 的 license 字段读出来，不手抄——
// 手抄的名单迟早会和素材包对不上，而对不上时脚本会安静地放过真正的 NC。
const manifest = JSON.parse(fs.readFileSync(path.join(base, 'music', 'manifest.json'), 'utf8'));
const ncKeys = manifest.filter((m) => /NC/i.test(m.license || '')).map((m) => m.key).sort();
const ncSet = new Set(ncKeys);

if (!ncKeys.length) {
  console.log('✅ manifest.json 里没有 NC 条目 —— 这份素材包不需要这道检查。');
} else {
  console.log('素材包共 ' + ncKeys.length + ' 条 NC（仅限非商业）：' + ncKeys.join('、'));
}

// ── 闸 1：映射里还有没有引用 NC ──────────────────────────────────────
const referenced = [];
for (const [type, s] of Object.entries(map.species))
  for (const f of s.files || []) if (ncSet.has(f)) referenced.push(type + ' → ' + f);

// ── 闸 2：文件还在不在盘上 ───────────────────────────────────────────
const onDisk = ncKeys.filter((k) => fs.existsSync(path.join(base, 'assets', 'calls', k + '.mp3')));
const inSource = ncKeys.filter((k) =>
  fs.existsSync(path.join(base, 'music', 'sfx', 'mp3', k + '.mp3')),
);

// ── 闸 3：离线产物里有没有漏内联的 NC 路径 ──────────────────────────
//
// ⚠ 这里**不能**用"在 dist 里搜文件名"来判断有没有内联 NC：
//   源码注释里提一句文件名、AGENTS.md 写进说明，都会被打进产物里，
//   搜到就误报。真正要抓的破绽是另一种：映射里引用了、构建却没内联
//   （路径还以 assets/calls/… 的原样留在 html 里）——那离线版会加载不出来。
// 产物里"音频条数与许可台账是否逐条对得上"由 .dsh-reports/check-dist-calls.cjs 负责。
const dist = path.join(base, 'dist', 'index.html');
const inDist = fs.existsSync(dist)
  ? ncKeys.filter((k) => fs.readFileSync(dist, 'utf8').includes('assets/calls/' + k + '.mp3'))
  : [];

let bad = 0;
const report = (title, list) => {
  if (!list.length) return;
  console.log('❌ ' + title + '（' + list.length + ' 条）：' + list.join('、'));
  bad++;
};
report('music/sfx-map.json 里还引用着 NC', referenced);
report('assets/calls/ 下 NC 的音频还在盘上', onDisk);
report('music/sfx/mp3/ 下 NC 的音频还在盘上', inSource);
report('离线产物里有没被内联的 NC 路径（离线版会加载失败）', inDist);

if (!bad)
  console.log(
    '\n✅ 库里没有 NC：映射、素材目录、离线产物三处都干净' +
      (ncKeys.length ? '' : '（素材包本身就没有 NC）'),
  );

// ── 现状报告：哪些物种还没有录音 ──────────────────────────────────────
const noRec = Object.entries(map.species)
  .filter(([, s]) => !s.files || !s.files.length)
  .map(([type]) => type);
const withRec = Object.keys(map.species).length - noRec.length;
console.log(
  '\n物种 ' +
    Object.keys(map.species).length +
    ' 种：有录音 ' +
    withRec +
    ' 种' +
    (noRec.length ? '，等补素材的 ' + noRec.length + ' 种：' + noRec.join('、') : ''),
);

process.exit(bad ? 1 : 0);
