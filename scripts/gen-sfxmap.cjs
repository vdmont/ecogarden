// 生成 assets/calls/SFXMAP.mjs —— 游戏运行时用的「物种 → 叫声素材」表。
//
// 数据源是 music/ 里的两个文件（项目所有者放进来的素材包自带）：
//   music/sfx-map.json  物种 → 变体文件、变调 rate、增益、同物种并发上限、哪些要循环
//   music/manifest.json 每条文件的许可、作者、出处、响度、处理链
//
// 为什么用生成器而不是把表抄进 audio.js：
//   1. 80 条路径手抄必然出错，而 build.cjs 是靠**正则扫源码里的字符串**来决定内联哪些
//      音频的——扫错一个字符，离线版就会少一条声音，而 npm test 全绿。
//   2. 素材包以后可能增删，改生成器 + 重跑一次就行，不用改游戏源码。
//
// 用法：node scripts\gen-sfxmap.cjs [--check]
//   --check 只核对不写文件。CI / 手改过之后用来确认「生成的表和源数据是否还对得上」。
const fs = require('fs');
const path = require('path');

const base = path.resolve(__dirname, '..');
const SRC_MAP = path.join(base, 'music', 'sfx-map.json');
const SRC_MANIFEST = path.join(base, 'music', 'manifest.json');
const OUT = path.join(base, 'assets', 'calls', 'SFXMAP.mjs');

const check = process.argv.includes('--check');

const map = JSON.parse(fs.readFileSync(SRC_MAP, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(SRC_MANIFEST, 'utf8'));
const manByKey = new Map(manifest.map((m) => [m.key, m]));

// ── 收集与核对 ────────────────────────────────────────────────────────────
const species = {};
const missingManifest = [];
const missingFile = [];
let totalRefs = 0;

for (const [type, s] of Object.entries(map.species)) {
  if (!s.files || !s.files.length) continue;
  const files = s.files.map((key) => {
    totalRefs++;
    const m = manByKey.get(key);
    if (!m) missingManifest.push(type + ' → ' + key);
    const p = path.join(base, 'assets', 'calls', key + '.mp3');
    if (!fs.existsSync(p)) missingFile.push(key);
    return 'assets/calls/' + key + '.mp3';
  });
  species[type] = {
    files,
    rate: s.rate === undefined ? 1 : s.rate,
    gain: s.gain === undefined ? 1 : s.gain,
    // 同物种最多几个声音叠在一起。包里统一给 2，这里保留但允许以后调。
    voices: s.voices === undefined ? 2 : s.voices,
    // 这些文件适合连续循环（蟋蟀、蜜蜂、狐狸那声带混响的）。
    loops: (s.loops || []).map((k) => 'assets/calls/' + k + '.mp3'),
    ...(s.note ? { note: s.note } : {}),
  };
}

// 去重后的实际文件清单（多个物种可以共用同一条，比如 4 种猫分 5 条录音）
const allFiles = [...new Set(Object.values(species).flatMap((s) => s.files))].sort();

// 许可台账：只登记**实际用到的**文件
const licenses = {};
for (const f of allFiles) {
  const key = f.slice('assets/calls/'.length, -'.mp3'.length);
  const m = manByKey.get(key);
  if (!m) continue;
  licenses[key] = {
    license: m.license,
    licenseUrl: m.license_url || '',
    author: m.author || '',
    title: m.title || '',
    source: m.source || '',
    sourceUrl: m.source_url || '',
    dur: m.dur,
    lufs: m.lufs,
    truePeak: m.true_peak,
    noise: m.noise,
    snr: m.snr,
  };
}

// ── 报问题 ────────────────────────────────────────────────────────────────
let bad = 0;
if (missingManifest.length) {
  console.log('❌ sfx-map 里有 manifest 查不到的条目：');
  missingManifest.forEach((x) => console.log('   ' + x));
  bad++;
}
if (missingFile.length) {
  console.log('❌ sfx-map 引用了 assets/calls/ 里不存在的文件：');
  missingFile.forEach((x) => console.log('   assets/calls/' + x + '.mp3'));
  console.log('   先把 music/sfx/mp3/ 下的文件拷进 assets/calls/ 再跑生成器。');
  bad++;
}

// 许可分布——这是每次都要看一眼的数字，尤其要盯住 NC（不许商用）的条数
const dist = {};
for (const v of Object.values(licenses)) dist[v.license] = (dist[v.license] || 0) + 1;

console.log('物种 ' + Object.keys(species).length + ' 种，引用 ' + totalRefs + ' 次，实际文件 ' + allFiles.length + ' 条');
console.log('许可分布：' + Object.entries(dist).map(([k, v]) => k + ' × ' + v).join('、'));

const nc = Object.entries(licenses).filter(([, v]) => /NC/i.test(v.license));
console.log(
  nc.length
    ? '⚠ 含 ' + nc.length + ' 条 NC（仅限非商业）：' + nc.map(([k]) => k).join('、')
    : '不含 NC',
);

if (bad) process.exit(1);

// ── 写文件 ────────────────────────────────────────────────────────────────
const j = (v) => JSON.stringify(v);

const body = `// 物种 → 叫声素材表。⚠ 本文件由 scripts/gen-sfxmap.cjs 生成，不要手改。
// 数据源：music/sfx-map.json（物种映射）+ music/manifest.json（许可与出处）。
//
// 为什么单独一个文件：build.cjs 是**扫源码里的字符串**来决定离线版内联哪些音频的，
// 所以路径必须原样出现在这里，扫到才会被打包。漏一个字符就是离线版少一条声音。
//
// 要改素材：改 music/ 里的源文件，然后跑 node scripts\\gen-sfxmap.cjs。
(function (root) {
  root.EcoCalls = {
    // 素材包给的全局音量。混音那层还会按远近再加权，这里是底子。
    masterGain: ${map.masterGain},
    species: ${JSON.stringify(species, null, 6).replace(/\n/g, '\n    ')},
    // 每条文件的许可与出处。人看这里，机器靠它核对有没有漏登记。
    licenses: ${JSON.stringify(licenses, null, 6).replace(/\n/g, '\n    ')},
  };
})(globalThis);
`;

if (check) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (cur !== body) {
    console.log('❌ assets/calls/SFXMAP.mjs 和 music/ 的源数据对不上，重新跑一次生成器。');
    process.exit(1);
  }
  console.log('✅ SFXMAP.mjs 与源数据一致。');
} else {
  fs.writeFileSync(OUT, body, 'utf8');
  console.log('写入 ' + OUT + ' ' + fs.statSync(OUT).size + ' 字节');
}
