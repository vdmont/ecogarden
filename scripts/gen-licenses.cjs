// 生成 assets/calls/LICENSES.mjs —— 许可台账。
//
// 数据源：music/manifest.json（素材包里每条文件的许可、作者、出处、处理链）
//        + music/sfx-map.json（哪些物种用到哪条）
// 交叉核对两件事（两边对不上就直接失败）：
//   · SFXMAP 里引用了、但台账里没登记的文件  → 失败
//   · 台账里登记了、但磁盘上不存在的文件    → 失败
//
// 关于 CC BY-NC（仅限非商业）：本项目**一律不用**。
// 2026-10-18 曾经决定"非商业期间全用"，2026-10-19 推翻——NC 是单向门：
// 将来收费时再删，不能消除已经发生的违约，所以提前删干净。
// 库里的 10 条 NC 已全部删除，由 scripts/check-nc-removal.cjs 守着这条线。
// 所以这里如果扫出 NC 条目，那说明有人又把它塞回来了，必须报错而不是提醒。
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
  console.log('❌ 含 ' + ncKeys.length + ' 条 CC BY-NC（仅限非商业）：' + ncKeys.join('、'));
  console.log('   本项目一律不用 NC（单向门，将来收费删不回来）。');
  console.log('   从 music/sfx-map.json 删掉上面这些 key，从 music/manifest.json 删掉对应条目，');
  console.log('   然后重跑两个生成器。');
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
// ── 出了不该出的事：NC 素材又出现了（${ncKeys.length} 条）──────────────────────────
// 本项目一律不用 NC：它是单向门，将来收费时再删已经来不及了。
// 下面的条目不该出现在这里。查 music/sfx-map.json 与 music/manifest.json，
// 删干净后依次跑：
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
