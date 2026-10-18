// 验 AGENTS.md 第 9.0 节那张表：「删掉 10 条 NC 之后每个属还剩几条」。
//
// 这类"删了会怎样"的预测很容易写错，而且写错了没人会发现——等到真要商业化的
// 那天才发现某个属一条都不剩，就晚了。所以每次改素材包都该重跑一次。
//
// 用法：node scripts\check-nc-removal.cjs
const fs = require('fs');
const path = require('path');

const base = path.resolve(__dirname, '..');
const map = JSON.parse(fs.readFileSync(path.join(base, 'music', 'sfx-map.json'), 'utf8'));

const NC = [
  'capybara_076', 'capybara_078', 'cat_067', 'dog_073', 'flamingo_124',
  'frog_084', 'longtail_112', 'nightHeron_101', 'nightHeron_102', 'squirrel_049',
];

// NC 名单是从 manifest.json 的 license 字段读出来的，不是手抄的这份。
const manifest = JSON.parse(fs.readFileSync(path.join(base, 'music', 'manifest.json'), 'utf8'));
const realNC = manifest.filter((m) => /NC/i.test(m.license)).map((m) => m.key).sort();
const hardNC = [...NC].sort();
if (JSON.stringify(realNC) !== JSON.stringify(hardNC)) {
  console.log('❌ 这份脚本里的 NC 名单和 manifest 对不上');
  console.log('   manifest: ' + realNC.join(', '));
  console.log('   脚本里写: ' + hardNC.join(', '));
  process.exit(1);
}
console.log('✅ NC 名单与 manifest 一致（' + realNC.length + ' 条）\n');

const ncSet = new Set(NC);
const rows = [];
let empty = [];
for (const [type, s] of Object.entries(map.species)) {
  const before = s.files.length;
  const after = s.files.filter((f) => !ncSet.has(f)).length;
  rows.push({ type, before, after, lost: s.files.filter((f) => ncSet.has(f)) });
  if (after === 0) empty.push(type);
}

rows.sort((a, b) => a.after - b.after || a.type.localeCompare(b.type));
console.log('删掉 NC 之后各物种还剩的变体条数：');
for (const r of rows) {
  if (!r.lost.length) continue;
  console.log(
    '  ' + r.type.padEnd(14) + r.before + ' → ' + r.after +
      (r.after ? '' : '   ← ⚠ 归零') +
      '   删掉: ' + r.lost.join(', '),
  );
}
console.log('');

// 「还有录音的物种总数」在删之前/之后各是多少——这才是决定要不要重录的数
const speciesAll = Object.keys(map.species);
console.log('物种共 ' + speciesAll.length + ' 种');
console.log(empty.length
  ? '⚠ 删完之后会归零的物种：' + empty.join('、')
  : '✅ 没有任何物种会归零');

process.exit(empty.length ? 1 : 0);
