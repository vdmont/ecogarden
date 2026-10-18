const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  vm = require('node:vm'),
  compact = require('./helpers.cjs').compactSource;
require('./load.cjs');
require('../src/ui/journey.js');
const E = Eco;
const p = E.defaultProfile();
p.current = p.unlocked = 5;
const s = E.makeWorld(5, 2, 42);
p.worlds[5] = s;
s.score = 1200;
const i = s.cells.findIndex((c, i) => c?.ground === 'soil' && E.nearby(s, i, 4).length > 40);
for (const j of [i, ...E.nearby(s, i, 4)]) {
  s.cells[j].ground = 'soil';
  s.cells[j].plant = null;
  s.cells[j].animal = null;
  s.cells[j].elevation = 0;
}
const j = E.nearby(s, i)[0];
let a = E.animal('ragdoll');
a.age = 70;
s.cells[i].animal = a;
assert(E.habit(s, i, a).rest);
s.cells[j].animal = E.animal('butterfly');
assert(E.habit(s, i, a).targets.includes(j));
a.hunger = 100;
assert.equal(E.habit(s, i, a).kind, 0);
s.cells[j].animal = E.animal('sheep');
a = E.animal('golden');
assert(E.habit(s, i, a).targets.includes(j));
s.cells[i].ground = 'water';
a = E.animal('capybara');
s.cells[i].animal = a;
assert(E.habit(s, i, a).rest);
assert(E.habit(s, j, E.animal('nightHeron')).rest);
s.cells[i].ground = 'mountain';
s.cells[i].elevation = 7;
a = E.animal('dragon');
assert(E.habit(s, i, a).rest);
assert(E.canWalk(s.cells[i], a, s.cells[j]));
for (const tool of ['rock', 'bush', 'mountain', 'forest']) {
  s.cells[j].plant = 'grass';
  s.cells[j].animal = null;
  s.cells[j].fire = 0;
  assert.equal(E.allow(s, tool, j, p), '', tool);
}
p.tutorial.dismiss4_island = true;
assert(E.validateProfile(p).tutorial.dismiss4_island);
const introP = E.defaultProfile(),
  first = E.makeWorld(0);
introP.tutorial.dismiss0_sow = true;
assert.equal(GardenJourney.plan(first, introP), null);
console.log(
  'PASS habits, hunger priority, mountain access, grass replacement and persisted guide dismissal',
);
// Run the real UI transaction functions in a small host, without a browser or rendering.
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/ui/app.js'), 'utf8');
// 锚点用正则找，不要写死 `xxx=` 或 `xxx(){` 这种带空格的写法——
// 一改排版（比如 prettier）indexOf 就会返回 -1，slice(start,-1) 静默切出垃圾，
// 报错还报在几百行之外（曾表现为 ReferenceError: pick is not defined），极难定位。
function sliceBetween(text, fromRe, toRe, what) {
  const a = text.search(fromRe);
  const b = text.search(toRe);
  assert(a >= 0 && b > a, `在 src/ui/app.js 里找不到「${what}」的边界（${fromRe} → ${toRe}）`);
  return text.slice(a, b);
}
const section = sliceBetween(source, /let paintReason\b/, /function inspect\b/, '落笔事务函数');
const q = E.defaultProfile(),
  w = E.makeWorld(0, 2, 42);
q.worlds[0] = w;
const ids = w.cells
  .map((c, i) => (c?.ground === 'soil' && !c.plant ? i : -1))
  .filter((i) => i >= 0)
  .slice(0, 4);
const host = {
  E,
  profile: q,
  world: w,
  tool: 'seed',
  selected: -1,
  selectedAnimal: null,
  known: new Set(),
  view: { draw() {}, selected: -1 },
  journey: { placed() {} },
  $: () => ({ checked: false }),
  performance: { now: () => 0 },
  text() {},
  toast() {},
  sound() {},
  save() {},
  inspect() {},
  update() {},
  T,
  focus() {},
};
vm.createContext(host);
vm.runInContext(
  'function loadLevel(n){world=profile.worlds[n];}' +
    section +
    ';globalThis.api={pick,strokeEnd,undo,hasUndo:()=>!!undoSnapshot};',
  host,
);
const before = JSON.stringify(host.profile);
for (const i of ids) host.api.pick(i, true);
host.api.strokeEnd();
assert(host.api.hasUndo());
assert(ids.every((i) => host.world.cells[i].plant === 'seed'));
host.api.undo();
assert.equal(JSON.stringify(host.profile), before);
assert(!host.api.hasUndo());
host.world.level = 5;
host.profile.current = host.profile.unlocked = 5;
host.profile.worlds = { 5: host.world };
host.tool = 'animal';
const animalsBefore = JSON.stringify(host.profile);
for (const i of ids) host.api.pick(i, true);
host.api.strokeEnd();
assert(ids.every((i) => host.world.cells[i].animal));
host.api.undo();
assert.equal(JSON.stringify(host.profile), animalsBefore);
console.log(
  'PASS whole seed/animal strokes undo as one transaction, including energy and progress',
);

const guideSource = fs.readFileSync(
  require('node:path').join(__dirname, '../src/ui/journey.js'),
  'utf8',
);
const guideCode = compact(guideSource);
assert(!guideCode.includes(compact("$('guideOK').hidden=true")));
assert(guideCode.includes(compact('opening?intro[s.level][1]')));
console.log('PASS every displayed guide keeps its dismissal button');

const resetSection = sliceBetween(
  source,
  /newSave\.onclick\b/,
  /const residents\b/,
  '确认重置进度的处理函数',
);
const dirty = E.defaultProfile();
dirty.unlocked = 5;
dirty.achievements.seed = 'earned';
dirty.tutorial.intro0 = true;
dirty.tutorialCounts.seed = 2;
dirty.totalScore = 900;
dirty.worlds[0] = E.makeWorld(0);
const resetHost = {
  E,
  profile: dirty,
  world: dirty.worlds[0],
  newSave: {},
  known: new Set(['seed']),
  residentCursor: { bug: 2 },
  achievementTarget: {},
  storageError: '',
  Set,
  $: () => ({ classList: { remove() {} } }),
  document: { querySelectorAll: () => [] },
  journey: {
    reset() {
      resetHost.resetCalled = true;
    },
  },
  syncSettings() {},
  loadLevel(n) {
    resetHost.world = E.makeWorld(n);
    resetHost.profile.worlds[n] = resetHost.world;
  },
  save(force) {
    resetHost.saved = force;
  },
  toast() {},
  confirmAction(t, m, fn) {
    resetHost.accept = fn;
  },
};
vm.createContext(resetHost);
vm.runInContext(resetSection, resetHost);
resetHost.newSave.onclick();
assert.equal(resetHost.profile.totalScore, 900, 'asking for confirmation must not reset progress');
resetHost.accept();
assert.equal(resetHost.profile.unlocked, 0);
assert.equal(resetHost.profile.totalScore, 0);
assert.equal(Object.keys(resetHost.profile.achievements).length, 0);
assert.equal(Object.keys(resetHost.profile.tutorial).length, 0);
assert.equal(Object.keys(resetHost.profile.tutorialCounts).length, 0);
assert(resetHost.resetCalled && resetHost.saved);
console.log(
  'PASS confirmed fresh save clears progress, achievements and tutorial, then restores welcome',
);
