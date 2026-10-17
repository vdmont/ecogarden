const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  compact = require('./helpers.cjs').compactSource;
require('./load.cjs');
const E = Eco;
let passed = 0;
function test(name, fn) {
  fn();
  console.log('PASS ' + name);
  passed++;
}
function setup(l = 5, seed = 42) {
  const p = E.defaultProfile();
  p.current = p.unlocked = l;
  const s = E.makeWorld(l, undefined, seed);
  s.rng = seed;
  p.worlds[l] = s;
  return [p, s];
}
function ticks(p, s, n) {
  for (let k = 0; k < n; k++) E.step(s, p);
}
function empty(s) {
  return s.cells.findIndex((c) => c && c.ground === 'soil' && !c.plant && !c.animal);
}
function clear(s) {
  s.cells.forEach((c) => {
    if (c) {
      c.plant = null;
      c.animal = null;
      c.ground = 'soil';
      c.moist = 0;
    }
  });
}
function patch(s, cx, cy, type, r = 3) {
  for (let y = cy - r; y <= cy + r; y++)
    for (let x = cx - r; x <= cx + r; x++) {
      const c = s.cells[y * s.w + x];
      if (c) {
        c.plant = type;
        c.age = 50;
        c.fert = 0.3;
      }
    }
}
function interior(s) {
  return s.cells.findIndex((c, i) => {
    if (!c || c.ground !== 'soil' || c.plant || c.animal) return false;
    const x = i % s.w,
      y = Math.floor(i / s.w);
    return x > 4 && y > 4 && x < s.w - 5 && y < s.h - 5;
  });
}
test('six chapters, early tools and unified late animal pool', () => {
  for (let l = 0; l < 6; l++) {
    let [p, s] = setup(l);
    assert.equal(E.LEVELS[l].tools.includes('animal'), l >= 3);
    if (l >= 3) for (const type of Object.keys(E.LIFE)) assert(!E.LEVELS[l].tools.includes(type));
  }
  assert(!E.LEVELS[3].goals.some((g) => g[0] === 'drunk'));
});
test('first island sprouts, flowers and grows trees', () => {
  let [p, s] = setup(0);
  for (let i = 0; i < s.cells.length; i++)
    if (s.cells[i]?.ground === 'soil' && s.cells[i].moist >= 0.6) {
      s.cells[i].plant = 'grass';
      s.cells[i].age = 60;
    }
  ticks(p, s, 300);
  assert(p.seen.flower);
  assert(p.seen.tree);
  assert(!p.seen.bird);
});
test('natural bugs appear without any manual animal placement', () => {
  let [p, s] = setup(0);
  for (const c of s.cells)
    if (c?.moist >= 0.6 && c.ground === 'soil') {
      c.plant = 'grass';
      c.age = 30;
    }
  ticks(p, s, 120);
  assert(p.seen.bug);
  assert(s.metrics.arrivals > 0);
});
test('natural arrivals require food and habitat, are chapter gated', () => {
  let [p, s] = setup(0);
  clear(s);
  for (let n = 0; n < 100; n++) assert.equal(E.arrive(s, p), false);
  assert(!s.cells.some((c) => c?.animal));
  patch(s, 8, 6, 'bush', 2);
  for (let n = 0; n < 100; n++) E.arrive(s, p);
  assert(!s.cells.some((c) => c?.animal));
});
test('trees and insects invite birds; bushes and meadow invite mammals', () => {
  let [p, s] = setup(3);
  patch(s, 14, 10, 'grass', 5);
  for (const i of [6 * s.w + 10, 6 * s.w + 11, 6 * s.w + 12, 6 * s.w + 13, 6 * s.w + 14])
    s.cells[i].plant = 'tree';
  for (const i of [7 * s.w + 10, 7 * s.w + 11, 7 * s.w + 12]) {
    s.cells[i].plant = 'bush';
    s.cells[i].age = 100;
  }
  for (const i of [8 * s.w + 10, 8 * s.w + 11, 8 * s.w + 12]) s.cells[i].animal = E.animal('bug');
  for (let n = 0; n < 300; n++) E.arrive(s, p);
  const c = E.census(s);
  assert(c.bird);
  assert(c.rabbit || c.sheep || c.alpaca);
  assert(s.metrics.arrivals > 0);
});
test('terrain stamps cover low vegetation and create real areas', () => {
  let [p, s] = setup();
  s.score = 1000;
  let i = interior(s);
  patch(s, i % s.w, Math.floor(i / s.w), 'grass', 4);
  assert(E.place(s, 'lake', i, p).ok);
  assert(E.largestLake(s) >= 12);
  let j = interior(s);
  patch(s, j % s.w, Math.floor(j / s.w), 'flower', 4);
  assert(E.place(s, 'mountain', j, p).ok);
  assert(s.cells.filter((c) => c?.ground === 'mountain').length >= 5);
  assert.equal(s.cells[j].elevation, 7);
  assert(E.place(s, 'forest', empty(s), p).ok);
});
test('terrain tools preserve existing animals and mature trees', () => {
  let [p, s] = setup(),
    i = interior(s);
  s.score = 1000;
  patch(s, i % s.w, Math.floor(i / s.w), 'grass', 3);
  s.cells[i + 1].animal = E.animal('rabbit');
  s.cells[i - 1].plant = 'tree';
  assert(E.place(s, 'lake', i, p).ok);
  assert.equal(s.cells[i + 1].animal.type, 'rabbit');
  assert.equal(s.cells[i + 1].ground, 'soil');
  assert.equal(s.cells[i - 1].plant, 'tree');
});
test('fifth chapter cannot be skipped by three stamps', () => {
  let [p, s] = setup(4);
  s.score = 1000;
  for (const tool of ['lake', 'mountain', 'forest']) assert(E.place(s, tool, empty(s), p).ok);
  ticks(p, s, 4);
  assert(!s.complete);
  assert.equal(s.metrics.stableSeconds, 0);
  assert(E.LEVELS[4].goals.some((g) => g[0] === 'births'));
});
test('fifth chapter requires all objectives and continuity resets', () => {
  let [p, s] = setup(4);
  for (const [k, n] of E.LEVELS[4].goals) s.metrics[k] = n;
  E.check(s, p);
  assert(s.complete);
  assert.equal(p.unlocked, 5);
  [p, s] = setup(4);
  s.metrics.stableSeconds = 59;
  clear(s);
  E.step(s, p);
  assert.equal(s.metrics.stableSeconds, 0);
});
test('mountain alpacas and forest deer have distinct habitat access', () => {
  let [p, s] = setup(),
    i = empty(s);
  s.cells[i].ground = 'mountain';
  s.cells[i].elevation = 2.8;
  assert(E.canWalk(s.cells[i], E.animal('alpaca')));
  assert(!E.canWalk(s.cells[i], E.animal('sheep')));
  assert.equal(E.surfaceHeight(s.cells[i]), 2.8);
  assert(E.habitat(s, i, 'alpaca') > 0);
  s.cells[i].ground = 'soil';
  s.cells[i].plant = 'tree';
  assert(E.canWalk(s.cells[i], E.animal('deer')));
  assert(E.habitat(s, i, 'deer') > 0);
  assert(!E.canWalk(s.cells[i], E.animal('sheep')));
  assert(E.canWalk(s.cells[i], E.animal('rabbit')));
});
test('boars have longer cooldown, more food and a bounded capacity', () => {
  assert(E.BREED.boar.cool >= 240);
  assert(E.BREED.boar.food > E.BREED.rabbit.food);
  let [p, s] = setup();
  clear(s);
  patch(s, 15, 15, 'grass', 8);
  s.cells[15 * s.w + 15].animal = E.animal('boar');
  ticks(p, s, 1800);
  assert((E.census(s).boar || []).length <= 12);
});
test('frog reproduction requires wet ground', () => {
  let [p, s] = setup();
  clear(s);
  let i = empty(s),
    a = E.animal('frog');
  s.cells[i].animal = a;
  a.full = 10;
  a.age = 80;
  s.tick = 140;
  E.step(s, p);
  assert.equal(s.metrics.births, 0);
});
test('weighted placement remains exact and rejects occupied cells without charging', () => {
  let [p, s] = setup(),
    i = empty(s),
    counts = {};
  assert.equal(
    Object.values(E.WEIGHTS).reduce((a, b) => a + b),
    100,
  );
  for (let n = 0; n < 10000; n++) {
    s.cells[i].animal = null;
    let r = E.place(s, 'animal', i, p);
    assert(r.ok);
    counts[r.type] = (counts[r.type] || 0) + 1;
  }
  for (const [k, w] of Object.entries(E.WEIGHTS)) assert(Math.abs(counts[k] / 100 - w) < 1.5, k);
  const rng = s.rng;
  assert(!E.place(s, 'animal', i, p).ok);
  assert.equal(s.rng, rng);
});
test('all pets, secret clues and exact achievement locations', () => {
  let [p, s] = setup(3),
    i = empty(s);
  for (const type of Object.keys(E.LIFE)) {
    s.cells[i].animal = E.animal(type);
    assert(E.pet(s, i, p).ok);
    assert(!E.pet(s, i, p).ok);
    assert(p.achievements['pet' + type]);
  }
  assert(p.achievements.petAll);
  assert.equal(p.achievementPlaces.petalpaca.i, i);
  assert.equal(new Set(Object.values(GardenCopy.secrets).map((v) => v[0])).size, 3);
});
test('fire cooldown and recovery still prevent instant forest', () => {
  let [p, s] = setup(2),
    i = s.cells.findIndex((c) => c?.plant === 'grass' && c.moist >= 0.6);
  assert(E.place(s, 'fire', i, p).ok);
  ticks(p, s, 10);
  assert(s.cells[i].ash > 0);
  assert(!E.place(s, 'seed', i, p).ok);
  ticks(p, s, 25);
  assert.equal(s.cells[i].plant, null);
  ticks(p, s, 80);
  assert(s.metrics.reborn > 0);
  assert.notEqual(s.cells[i].plant, 'tree');
});
test('lifetimes and starvation return nutrients', () => {
  for (const type of Object.keys(E.LIFE)) {
    let [p, s] = setup(),
      i = empty(s);
    s.cells[i].animal = E.animal(type);
    s.cells[i].animal.age = E.LIFE[type] - 1;
    E.step(s, p);
    assert.equal(s.cells[i].animal, null);
    assert(s.cells[i].fert >= 0.35);
  }
  let [p, s] = setup();
  clear(s);
  s.cells[empty(s)].animal = E.animal('wolf');
  ticks(p, s, 310);
  assert(!E.census(s).wolf);
});
test('new state persists with deterministic continuation', () => {
  let [p, s] = setup(3);
  patch(s, 14, 10, 'grass', 4);
  s.cells[empty(s)].animal = E.animal('alpaca');
  ticks(p, s, 80);
  let q = E.validateProfile(JSON.parse(JSON.stringify(p)));
  ticks(p, s, 150);
  ticks(q, q.worlds[3], 150);
  assert.deepEqual(q.worlds[3].cells, s.cells);
  assert.deepEqual(q.worlds[3].metrics, s.metrics);
  assert.equal(q.worlds[3].rng, s.rng);
});
test('old v0.7 demo migrates without replacing achievements or islands', () => {
  const f = path.resolve(__dirname, 'fixtures/v0.7.json');
  assert(fs.existsSync(f), 'legacy fixture must exist');
  let input = JSON.parse(fs.readFileSync(f, 'utf8'));
  let p = E.validateProfile(input);
  assert.equal(p.current, input.current);
  assert.equal(p.unlocked, input.unlocked);
  assert(p.seen.sheep);
  assert(p.worlds[3].cells.every((c) => !c || Number.isFinite(c.variant)));
});
test('replaying preserves records and earned achievements', () => {
  let [p, s] = setup(3),
    i = empty(s);
  s.cells[i].animal = E.animal('alpaca');
  E.pet(s, i, p);
  s.score = 1234;
  E.check(s, p);
  p.worlds[3] = E.makeWorld(3);
  E.check(p.worlds[3], p);
  assert(p.achievements.petalpaca);
  assert.equal(p.records[3].bestScore, 1234);
});
test('corrupt saves rejected rather than silently clearing data', () => {
  let [p, s] = setup();
  assert.throws(() => E.validateProfile({ ...p, version: 5 }));
  p.worlds[5].cells[empty(s)].elevation = -4;
  assert.throws(() => E.validateProfile(p));
});
test('foreground UI no longer pauses from zoom or dialogs', () => {
  const app = fs.readFileSync(path.resolve(__dirname, '../src/ui/app.js'), 'utf8');
  const focus = app.slice(app.indexOf('function focus('), app.indexOf('function loadLevel'));
  assert(!compact(focus).includes(compact('setSpeed(0)')));
  assert(
    compact(app).includes(
      compact('const paused=document.hidden||!journey.active()||!!strokeSnapshot;'),
    ),
  );
  assert(!compact(app).includes(compact('document.hidden||!!document.querySelector')));
});
test('score achievements without a location do not stop the animation loop', () => {
  const code = fs.readFileSync(path.resolve(__dirname, '../src/ui/app.js'), 'utf8');
  let snippet = code.slice(
    code.indexOf('function locateAchievement('),
    code.indexOf('function renderResidents'),
  );
  const [p, world] = setup();
  const locate = Function('profile', 'world', snippet + ';return locateAchievement;')(p, world);
  assert.equal(locate('p500'), null);
  assert.equal(locate('fire'), null);
});
test('garden JSON import entry is restored and goes through the save validator', () => {
  const app = fs.readFileSync(path.resolve(__dirname, '../src/ui/app.js'), 'utf8');
  const code = compact(app);
  assert(code.includes(compact("$('importSave').onchange=")), '导入按钮必须接到处理函数');
  assert(!code.includes(compact("$('importSave').remove()")), '导入按钮不能被移除');
  assert(
    code.includes(compact('E.validateProfile(JSON.parse(await f.text()))')),
    '导入的存档必须经过校验器',
  );
  assert(code.includes(compact('toast(T.m405')), '导入失败必须给出提示');
});
test('camera controls: no pan arrows, tilt in the footer bar, real import button', () => {
  const shell = globalThis.GardenText.shell;
  assert(!/panLeft|panUp|panDown|panRight/.test(shell), '屏幕上的平移方向键应该已经移除');
  assert(shell.includes('id="tiltRange"'), '观察模式要有相机倾角滑杆');
  assert(
    /<footer>[\s\S]*cameraControls[\s\S]*<\/footer>/.test(shell),
    '相机控件应该放进底栏，别悬在舞台上',
  );
  assert(
    /<button id="importSaveBtn" class="accentBtn">导入存档</.test(shell),
    '导入要是真按钮（和另外两个同款），文案为「导入存档」',
  );
  assert(!shell.includes('for="importSave"'), '导入不该再用 label 包文件框');
});
console.log(passed + ' behavioral checks passed');
