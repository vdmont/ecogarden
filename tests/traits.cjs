// 属性化护栏：物种名单与捕食关系必须仍然可以从属性推出，并且行为和以前的写死版本完全一致。
const assert = require('node:assert/strict');
require('./load.cjs');
const E = globalThis.Eco, D = globalThis.EcoData;

let passed = 0;
function test(name, fn) { fn(); console.log('PASS ' + name); passed++; }
const set = a => [...a].sort().join(',');
const norm = o => JSON.stringify(Object.fromEntries(Object.entries(o).map(([k, v]) => [k, [...v].sort()])));
function world(level = 5, seed = 42) { const p = E.defaultProfile(); p.unlocked = p.current = level; const s = E.makeWorld(level, 2, seed); s.score = 1000; p.worlds[level] = s; return { p, s }; }

// ---------- 1. 名单由属性推出，且与旧版写死的名单一致 ----------
test('role lists are derived from traits and match the old hardcoded ones', () => {
  assert.equal(set(D.HERBS), set(['sheep', 'alpaca', 'rabbit', 'deer', 'boar', 'squirrel']), 'HERBS 应等于 diet=plant 的物种');
  assert.equal(set(D.HUNTERS), set(['bird', 'chicken', 'frog', 'hedgehog']), 'HUNTERS 应等于 diet=insect 的物种');
  assert.equal(set(D.POLLINATORS), set(['butterfly', 'bee']), 'POLLINATORS 应等于 diet=nectar 的物种');
  const oldPrey = { bird: ['bug'], chicken: ['bug'], frog: ['bug', 'bee'], hedgehog: ['bug'], fox: ['rabbit', 'chicken', 'squirrel'], wolf: ['rabbit', 'sheep', 'deer', 'boar'] };
  assert.equal(norm(D.PREY), norm(oldPrey), '捕食关系应等于各物种 eats 属性的并集');
  // 名单必须真的来自属性，而不是又写了一遍
  assert.equal(set(D.HERBS), set(Object.keys(D.TRAITS).filter(k => D.TRAITS[k].diet === 'plant')));
  // 每个物种的每个属性都在预期范围内
  for (const [type, t] of Object.entries(D.TRAITS)) {
    assert(['walk', 'fly', 'swim'].includes(t.move), type + ' 的 move 非法');
    assert(typeof t.mass === 'number' && t.mass > 0 && t.mass <= 10, type + ' 的 mass 非法');
    assert(Number.isInteger(t.climb) && t.climb >= 0 && t.climb <= 3, type + ' 的 climb 非法');
    assert(typeof t.diet === 'string' && t.diet.length > 0, type + ' 的 diet 非法');
    assert(Array.isArray(t.plants), type + ' 的 plants 必须是数组');
    if (t.eats) for (const prey of t.eats) assert(D.TRAITS[prey], type + ' 的食谱里有不存在的物种 ' + prey);
  }
});

// ---------- 2. 吃植物的判定与旧版逐格完全一致 ----------
test('plant menu reproduces the old hardcoded eating rules exactly', () => {
  const POLL = ['butterfly', 'bee'];
  const oldRule = (d, type) => {
    if (['wolf', 'frog', 'hedgehog'].includes(type)) return false;
    if (['fox', 'bird', 'chicken'].includes(type)) return d.plant === 'seed' || d.plant === 'bush' && d.age >= 80;
    if (POLL.includes(type)) return d.plant === 'flower' || d.plant === 'bush' && d.age >= 50;
    if (type === 'squirrel') return d.plant === 'tree' && d.age % 24 < 3 || d.plant === 'seed' || d.plant === 'bush' && d.age >= 80;
    return d.plant === 'grass' && d.age >= 12 || d.plant === 'flower' || d.plant === 'bush' && d.age >= 80;
  };
  const { s } = world();
  // 造一批各种状态的植物，覆盖所有分支
  const kinds = ['seed', 'grass', 'flower', 'tree', 'bush'];
  let k = 0;
  for (const c of s.cells) {
    if (!c || c.ground !== 'soil') continue;
    c.plant = kinds[k % kinds.length];
    c.age = [0, 8, 11, 12, 40, 50, 79, 80, 149, 200][(k * 7) % 10];
    k++;
  }
  let compared = 0;
  for (const type of Object.keys(D.TRAITS)) {
    for (let i = 0; i < s.cells.length; i += 23) {
      if (!s.cells[i]) continue;
      const got = E.eatPlants(s, i, { type }).sort((a, b) => a - b);
      const want = [i, ...E.nearby(s, i)].filter(j => oldRule(s.cells[j], type)).sort((a, b) => a - b);
      assert.deepEqual(got, want, type + ' 在格子 ' + i + ' 的食谱判定与旧版不一致');
      compared++;
    }
  }
  assert(compared > 500, '应该比较足够多的样本，实际 ' + compared);
});

// ---------- 3. 爬坡：陡坡挡住腿脚差的，飞的不受影响 ----------
test('steep steps block poor climbers but never flyers', () => {
  const { s } = world();
  const flat = s.cells.findIndex(c => c && c.ground === 'soil' && !c.plant && !c.animal);
  const from = s.cells[flat];
  const step = e => ({ ground: 'soil', plant: null, animal: null, fire: 0, elevation: from.elevation + e });
  assert(E.canWalk(step(0.5), { type: 'rabbit' }, from), '小台阶兔子应该能上');
  assert(!E.canWalk(step(1.5), { type: 'rabbit' }, from), '大台阶兔子应该上不去');
  assert(E.canWalk(step(1.5), { type: 'deer' }, from), '鹿爬坡能力强，应该能上');
  assert(!E.canWalk(step(2.5), { type: 'deer' }, from), '太高的坎鹿也上不去');
  assert(E.canWalk(step(3), { type: 'bird' }, from), '会飞的直接越过');
  assert(E.canWalk(step(3), { type: 'butterfly' }, from), '会飞的直接越过');
  // 水里不算坡度（被水冲着走）
  const water = { ground: 'water', plant: null, animal: null, fire: 0, elevation: from.elevation - 3 };
  assert(E.canWalk(water, { type: 'sheep' }, from), '水路不该被坡度挡住');
  // 不给来处时不做坡度判定（迁入、繁殖找位置用）
  assert(E.canWalk(step(3), { type: 'rabbit' }), '没有来处时不判坡度');
});

// ---------- 4. 坡度规则不能把岛切得走不动 ----------
test('normal terrain stays walkable for low-climb animals', () => {
  for (const level of [3, 5]) {
    const { s } = world(level);
    let pairs = 0, blocked = 0;
    for (let i = 0; i < s.cells.length; i++) {
      const c = s.cells[i];
      if (!c || !['soil', 'ash'].includes(c.ground) || c.plant) continue;
      for (const j of E.nearby(s, i)) {
        const d = s.cells[j];
        if (!d || !['soil', 'ash'].includes(d.ground) || d.plant) continue;
        pairs++;
        if (!E.canWalk(d, { type: 'rabbit' }, c)) blocked++;
      }
    }
    assert(pairs > 100, '样本太少');
    assert(blocked / pairs < .2, `关卡 ${level + 1} 有 ${(blocked / pairs * 100).toFixed(0)}% 的相邻格被坡度挡住，会把动物困住`);
  }
});

console.log(passed + ' trait checks passed');
