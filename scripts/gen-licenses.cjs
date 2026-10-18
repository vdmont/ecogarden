// 生成 assets/calls/LICENSES.mjs —— 许可台账。
//
// 数据源：music/manifest.json（素材包里每条文件的许可、作者、出处、处理链）
//        + music/sfx-map.json（哪些物种用到哪条）
// 交叉核对两件事（两边对不上就直接失败）：
//   · SFXMAP 里引用了、但台账里没登记的文件  → 失败
//   · 台账里登记了、但磁盘上不存在的文件    → 失败
//
// 关于 CC BY-NC（仅限非商业）：本项目所有者已决定**全部 80 条都用**，包括这 10 条 NC。
// 理由是本项目目前完全非商业（免费、不投放、无内购），NC 在这个前提下合法。
// 但 NC 是**单向门**：将来一旦收费，这 10 条必须删掉，否则违约且补不回来。
// 所以这个生成器每次都会把它们单独列出来，并把名单写进台账文件头——
// 让"将来要删哪几条"永远是一条查得到的事实，而不是一段记忆。
//
// 用法：node scripts\gen-licenses.cjs [--check]
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const base = path.resolve(__dirname, '..');
const OUT = path.join(base, 'assets', 'calls', 'LICENSES.mjs');
const check = process.argv.includes('--check');

const manifest = JSON.parse(fs.readFileSync(path.join(base, 'music', 'manifest.json'), 'utf8'));
const sfxmap = JSON.parse(fs.readFileSync(path.join(base, 'music', 'sfx-map.json'), 'utf8'));
const manByKey = new Map(manifest.map((m) => [m.key, m]));

// 哪些物种用到哪一条
const usedBy = {};
for (const [type, s] of Object.entries(sfxmap.species)) {
  for (const k of s.files || []) (usedBy[k] = usedBy[k] || []).push(type);
}

const keys = [...new Set(Object.keys(usedBy))].sort();
const problems = [];
const rows = [];
const ncKeys = [];
const saKeys = [];
const dist = {};

for (const key of keys) {
  const m = manByKey.get(key);
  if (!m) {
    problems.push('sfx-map 用了 ' + key + '，但 manifest 里没有这一条');
    continue;
  }
  const rel = 'calls/' + key + '.mp3';
  const abs = path.join(base, 'assets', rel);
  if (!fs.existsSync(abs)) {
    problems.push('台账要登记 ' + rel + '，但文件不存在');
    continue;
  }
  dist[m.license] = (dist[m.license] || 0) + 1;
  if (/NC/i.test(m.license)) ncKeys.push(key);
  if (/SA/i.test(m.license) && !/NC/i.test(m.license)) saKeys.push(key);
  rows.push({
    file: rel,
    usedBy: usedBy[key],
    label: m.species_cn || m.species,
    title: m.title || '',
    license: m.license,
    licenseUrl: m.license_url || '',
    author: m.author || '',
    source: m.source || '',
    sourceUrl: m.source_url || '',
    modified: m.processing || '',
    durSec: m.dur,
    lufs: m.lufs,
    truePeakDb: m.true_peak,
    noiseFloorDb: m.noise,
    snrDb: m.snr,
    sha1: crypto.createHash('sha1').update(fs.readFileSync(abs)).digest('hex'),
  });
}

console.log('登记 ' + rows.length + ' 条（覆盖 ' + Object.keys(usedBy).length + ' 个素材文件）');
console.log('许可分布：' + Object.entries(dist).map(([k, v]) => k + ' × ' + v).join('、'));
if (ncKeys.length) {
  console.log('⚠ 含 ' + ncKeys.length + ' 条 CC BY-NC（仅限非商业）：');
  ncKeys.forEach((k) => console.log('     ' + k));
  console.log('   本项目目前完全非商业，用着合法。将来一旦收费/投放/内购，');
  console.log('   必须从 music/sfx-map.json 里删掉上面这 ' + ncKeys.length + ' 条并重跑两个生成器。');
}
if (saKeys.length) {
  console.log('· 含 ' + saKeys.length + ' 条 CC BY-SA：' + saKeys.join('、'));
  console.log('  音频改编版要继续用同许可共享。我们不单独分发音频（离线版是内联在游戏里的），在范围内。');
}
if (problems.length) {
  console.log('❌ 对不上：');
  problems.forEach((p) => console.log('   ' + p));
  process.exit(1);
}

const distStr = JSON.stringify(dist);
const ncNote = ncKeys.length
  ? `
// ── 非商业素材（${ncKeys.length} 条，将来收费必须删）──────────────────────────────
// 项目所有者 2026-10-18 决定：先全用。本项目完全非商业（免费、无广告、无内购），
// NC 在这个前提下合法。但 NC 是单向门——一旦收费就是违约，且删不回来。
// 要商业化时，从 music/sfx-map.json 删掉下面这些 key，然后依次跑：
//   node scripts\\gen-sfxmap.cjs && node scripts\\gen-licenses.cjs && npm run build
//
// ${ncKeys.join('\n// ')}
`
  : '';

const header = `// 许可台账：游戏里用到的每一条外部音频素材，都登记在这里。
//
// ⚠ 本文件由 scripts/gen-licenses.cjs 生成，不要手改。改素材请改 music/ 下的源文件。
//
// 字段：
//   file         相对 assets/ 的路径
//   usedBy       哪些物种会播这一条（4 种猫共用猫录音就是这么来的）
//   license      许可全名
//   licenseUrl   许可全文
//   author       作者 / 版权方（CC BY / BY-SA / BY-NC 必须署名）
//   sourceUrl    素材页面地址
//   modified     素材包对它做了什么（裁切、降噪、限幅……改了就是演绎）
//   sha1         我们这份 mp3 的哈希，任何人拿它都能复核"台账里这条就是这条"
//
// 本批 ${rows.length} 条的许可分布：${distStr}
${ncNote}
const ASSET_LICENSES = ${JSON.stringify(rows, null, 2)};

// 一眼能查的两件事：哪条是 NC（将来要删）、哪条要署名。
const NON_COMMERCIAL = ${JSON.stringify(ncKeys)};
const ATTRIBUTION_REQUIRED = ${JSON.stringify(
  rows.filter((r) => !/^CC0/i.test(r.license)).map((r) => r.file),
)};
`;

if (check) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (cur !== header) {
    console.log('❌ assets/calls/LICENSES.mjs 和 music/ 的源数据对不上，重跑一次生成器。');
    process.exit(1);
  }
  console.log('✅ LICENSES.mjs 与源数据一致。');
} else {
  fs.writeFileSync(OUT, header, 'utf8');
  console.log('写入 ' + OUT + ' ' + fs.statSync(OUT).size + ' 字节');
  console.log('要署名 ' + rows.filter((r) => !/^CC0/i.test(r.license)).length + ' 条（非 CC0）');
}
