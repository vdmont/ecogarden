const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');

// 这些是**故意不加载**的，理由要写清楚，不然过两年就没人知道为什么：
//   mount.js / journey.js / app.js  要真实 DOM，测试里没有
//   audio.js                        要 document + AudioContext 桩；
//                                    只有 tests/audio.cjs 自己准备好，
//                                    由它在 require 之前先装好环境
// files.json 是页面真正加载的顺序；这里是它的子集。
const SKIP = new Set([
  'src/ui/mount.js',
  'src/ui/journey.js',
  'src/ui/app.js',
  'src/ui/audio.js',
]);

const base = path.resolve(__dirname, '..');
const listed = JSON.parse(fs.readFileSync(path.join(base, 'scripts', 'files.json'), 'utf8'));
const wanted = listed.filter((f) => !SKIP.has(f));

for (const f of wanted) require(path.join(base, f));

// 防止 scripts/files.json 加了新文件、这里忘了加：那样测试会**安静地**用不到那份代码，
// 而 npm test 照样全绿——比直接报错更难查。
for (const f of listed) {
  assert.ok(
    SKIP.has(f) || wanted.includes(f),
    'scripts/files.json 里的 ' + f + ' 没被 tests/load.cjs 加载。' +
      '页面会跑它、测试不会，请想清楚是不是要故意排除；不是就把它加进上面那个列表。',
  );
}
