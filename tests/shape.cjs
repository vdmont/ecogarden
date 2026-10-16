// 形态与渲染护栏：岛屿轮廓与随机种子、地形内容、可玩性、拾取、模型盒数、实例预算、
// 方块重叠（缩放时闪烁的根因）、以及存档里的数值上限。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
require('./load.cjs');
const E = globalThis.Eco, GardenView = globalThis.GardenView, GardenModels = globalThis.GardenModels;

let passed = 0;
function test(name, fn) { fn(); console.log('PASS ' + name); passed++; }
function footprint(w, h, shape, seed) {
  let land = 0, hash = 2166136261 >>> 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const inside = E.islandMask(x, y, w, h, shape, seed);
    if (inside) land++;
    hash = Math.imul(hash ^ (inside ? 1 : 0), 16777619) >>> 0;
  }
  return [land, hash.toString(16).padStart(8, '0')];
}
function largestComponent(s) {
  const seen = new Set(); let best = 0;
  for (let i = 0; i < s.cells.length; i++) {
    if (!s.cells[i] || seen.has(i)) continue;
    const q = [i]; seen.add(i);
    for (let n = 0; n < q.length; n++) {
      const x = q[n] % s.w, y = Math.floor(q[n] / s.w);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= s.w || yy >= s.h) continue;
        const j = yy * s.w + xx;
        if (s.cells[j] && !seen.has(j)) { seen.add(j); q.push(j); }
      }
    }
    best = Math.max(best, q.length);
  }
  return best;
}
const mesh = () => ({ count: 0, instanceMatrix: {}, instanceColor: {} });
function boxView(s) {
  const v = Object.create(GardenView.prototype);
  v.world = s; v.showLabels = true; v.motion = new WeakMap(); v.lastAnimalFrame = 0;
  v.mesh = mesh(); v.rings = mesh(); v.flames = mesh(); v.fireCores = mesh(); v.waterfalls = mesh(); v.animals = mesh();
  v.boxes = [];
  v.put = (m, x, y, z, w, h, d, c, ry = 0, rz = 0) => v.boxes.push([x, y, z, w, h, d, c, ry, rz]);
  return v;
}
function usableRatio(s, level) {
  const p = E.defaultProfile(); p.unlocked = p.current = level;
  let n = 0;
  for (let i = 0; i < s.cells.length; i++) if (E.allow(s, 'seed', i, p) === '') n++;
  return n / s.cells.filter(Boolean).length;
}

// ---------- 1. 两条海岸线基线 ----------
// 第 1 版 = 老存档当年的圆岛，永久冻结，否则老存档会读不进来（save.js 报 m264）。
// 第 2 版 = 现在新世界的轮廓（测试用固定种子 42）；有意调整时同步更新，并确认存档兼容。
const SHAPE1 = [[144, 'eb7328cd'], [222, '4f2e237f'], [382, 'ff9c9e83'], [460, '779beee1'], [790, '655c7997'], [1128, '4ed2a885']];
const SHAPE2_SEED42 = [[144, '51ba3b27'], [216, 'db61e90d'], [374, 'fa218c3f'], [446, '8119b251'], [764, 'b5cb9a2f'], [1083, '39f47162']];
test('both island shapes match their recorded baselines', () => {
  for (let l = 0; l < 6; l++) {
    const w = E.LEVELS[l].w, h = E.LEVELS[l].h;
    assert.deepEqual(footprint(w, h, 1, 0), SHAPE1[l], `关卡 ${l + 1} 的第 1 版海岸线变了：老存档会读不进来（见 save.js m264）`);
    assert.deepEqual(footprint(w, h, 2, 42), SHAPE2_SEED42[l], `关卡 ${l + 1} 的第 2 版海岸线变了：请确认是有意改动并同步更新基线`);
  }
  const src = fs.readFileSync(path.resolve(__dirname, '../src/sim/core.js'), 'utf8');
  assert(/islandMask\(x,y,s\.w,s\.h,sh,sd\)/.test(src), 'makeWorld 必须按世界的 shape 与 seed 生成格子');
  assert(/function maskV1\(/.test(src), '第 1 版轮廓必须保留，老存档依赖它');
});

// ---------- 2. 每局的岛形都不一样 ----------
test('every new island gets its own coastline and terrain', () => {
  const seen = new Set();
  for (const seed of [1, 42, 777, 12345, 999983]) {
    const [land, hash] = footprint(E.LEVELS[5].w, E.LEVELS[5].h, 2, seed);
    assert(!seen.has(hash), `种子 ${seed} 与别的种子撞出了同样的海岸线`);
    seen.add(hash);
    assert(land > 900, `种子 ${seed} 的陆地太少：${land}`);
  }
  // 不传种子时，连续两次新建世界也必须不同
  const a = E.makeWorld(5), b = E.makeWorld(5);
  assert(a.seed !== b.seed, '连续新建的两个世界拿到了同一个种子');
  assert(a.seed >= 0 && a.seed <= 4294967295 && Number.isInteger(a.seed), '世界种子必须是 32 位整数');
  const hashOf = s => s.cells.map(c => c ? 1 : 0).join('');
  assert(hashOf(a) !== hashOf(b), '连续新建的两个世界海岸线一样，玩家看不到随机化');
});

// ---------- 3. 还是一整座岛 ----------
test('every island is still one connected piece', () => {
  for (const shape of [1, 2]) for (const seed of [42, 777]) for (let l = 0; l < 6; l++) {
    const s = E.makeWorld(l, shape, seed);
    const land = s.cells.filter(Boolean).length;
    const big = largestComponent(s);
    assert(big / land >= .995, `关卡 ${l + 1}（第 ${shape} 版，种子 ${seed}）出现孤立碎格：${land - big} 格脱离主岛`);
  }
});

// ---------- 4. 开局地形有内容，但岛是荒芜的、且能种能放 ----------
test('new worlds have hills, peaks and a lake, but start barren and workable', () => {
  const stat = l => {
    const s = E.makeWorld(l, 2, 42);
    const land = s.cells.filter(Boolean);
    const mountains = land.filter(c => c.ground === 'mountain');
    return {
      land: land.length,
      hilly: land.filter(c => c.elevation > 0).length / land.length,
      mountains: mountains.length,
      peak: Math.max(0, ...mountains.map(c => c.elevation)),
      water: land.filter(c => ['water', 'spring'].includes(c.ground)).length,
      trees: land.filter(c => c.plant === 'tree').length,
      animals: land.filter(c => c.animal).length,
      usable: usableRatio(s, l)
    };
  };
  for (const l of [2, 3, 4, 5]) {
    const s = stat(l);
    assert(s.hilly >= .4, `关卡 ${l + 1} 只有 ${(s.hilly * 100).toFixed(0)}% 的格子有起伏：又变成大平原了`);
    assert(s.mountains >= 10, `关卡 ${l + 1} 只生成了 ${s.mountains} 格山`);
    assert(s.peak >= 2.4, `关卡 ${l + 1} 的山峰只有 ${s.peak} 格高`);
    assert(s.water >= 15, `关卡 ${l + 1} 只生成了 ${s.water} 格水面`);
    // 开局荒芜：树必须为 0，小动物最多几只虫子，剩下的都靠玩家养
    assert.equal(s.trees, 0, `关卡 ${l + 1} 开局自带了 ${s.trees} 棵树：玩家没东西可种，森林还会堵路`);
    assert(s.animals <= 3, `关卡 ${l + 1} 开局自带了 ${s.animals} 只动物`);
    // 可玩性：绝大多数格子必须能种能放（山只占一小片）
    assert(s.usable >= .7, `关卡 ${l + 1} 只有 ${(s.usable * 100).toFixed(0)}% 的格子能种能放，玩家会被地形卡住`);
  }
  // 前两关也要有起伏和小山，但不能把小岛塞满
  for (const l of [0, 1]) {
    const s = stat(l);
    assert(s.hilly >= .3, `关卡 ${l + 1} 还是大平原`);
    assert(s.mountains >= 2, `关卡 ${l + 1} 没有生成山`);
    assert(s.peak <= 4.1, `关卡 ${l + 1} 的山太高了（${s.peak}），会挡住新手引导`);
    assert(s.usable >= .65, `关卡 ${l + 1} 只有 ${(s.usable * 100).toFixed(0)}% 的格子能种能放`);
  }
  // 山顶不能种、山脚能种：这才是「高度不影响游玩」的分界
  const s = E.makeWorld(5, 2, 42), p = E.defaultProfile(); p.unlocked = p.current = 5;
  const high = s.cells.findIndex(c => c && c.ground === 'mountain');
  assert(high >= 0 && E.allow(s, 'seed', high, p) !== '', '高耸的石头山不应允许种东西');
  const foot = s.cells.findIndex(c => c && c.ground === 'soil' && !c.plant && c.elevation > .5);
  s.cells[foot].ground = 'mountain'; s.cells[foot].elevation = 1.6;   // 玩家造山时最外圈的低山坡
  assert(E.allow(s, 'seed', foot, p) === '', '低矮山坡（不超过 2.2 格）应该照样能种能放');
  assert(E.canWalk(s.cells[foot], E.animal('sheep')), '低矮山坡应该能走上去');
  assert(!E.canWalk(s.cells[high], E.animal('sheep')), '高石头山应该挡住大个子动物');
});

// ---------- 5. 老存档照样能玩 ----------
test('old saves keep their own coastline and still validate', () => {
  const mk = (shape, seed) => { const p = E.defaultProfile(); p.unlocked = p.current = 5; p.worlds[5] = E.makeWorld(5, shape, seed); return p; };
  const old = mk(1, 0), raw = JSON.parse(JSON.stringify(old));
  delete raw.worlds[5].shape; delete raw.worlds[5].seed;
  const back = E.validateProfile(raw);
  assert.equal(back.worlds[5].shape, 1, '老存档应被认定为第 1 版轮廓');
  assert.equal(back.worlds[5].seed, 0, '老存档没有种子，按 0 处理');
  assert.equal(back.worlds[5].cells.filter(Boolean).length, 1128, '老存档的岛屿面积不应被改动');
  const liar = JSON.parse(JSON.stringify(old));
  liar.worlds[5].shape = 2;
  assert.throws(() => E.validateProfile(liar), '海岸线与 shape 版本不符的存档必须被拒绝');
  // 新世界连种子一起往返
  const fresh = E.validateProfile(JSON.parse(JSON.stringify(mk(2, 20260116))));
  assert.equal(fresh.worlds[5].shape, 2);
  assert.equal(fresh.worlds[5].seed, 20260116);
  assert.equal(fresh.worlds[5].cells.filter(Boolean).length, 1083);
  // 换一个种子的存档也要能存能读，且地形与存档一致
  const other = mk(2, 777), otherBack = E.validateProfile(JSON.parse(JSON.stringify(other)));
  assert.equal(otherBack.worlds[5].cells.filter(Boolean).length, 1075);
  // 老存档还能继续玩：跑一段模拟不报错，并且能再次保存
  for (let k = 0; k < 60; k++) E.step(back.worlds[5], back);
  assert.doesNotThrow(() => E.validateProfile(JSON.parse(JSON.stringify(back))), '老存档玩过之后必须还能保存');
});

// ---------- 6. 方块不能共面重叠（缩放时闪烁的根因）----------
test('no two boxes fight over the same faces', () => {
  // 再加一个「在高低不同的坡地上放水与石头」的场景，确保新的堆叠方式也不重叠
  const built = E.makeWorld(5, 2, 42);
  built.score = 1000;
  const bp = E.defaultProfile(); bp.unlocked = bp.current = 5;
  let placed = 0;
  for (let i = 0; i < built.cells.length && placed < 40; i++) {
    const c = built.cells[i];
    if (!c || c.ground !== 'soil' || c.plant || c.animal || c.elevation < .12) continue;
    E.place(built, placed % 2 ? 'water' : 'rock', i, bp);
    placed++;
  }
  assert(placed >= 20, '测试场景应能在坡地上放下足够多的水与石头');
  const scenes = [[5, 42], [4, 777], [0, 42]].map(([level, seed]) => E.makeWorld(level, 2, seed));
  scenes.push(built);
  for (const s of scenes) {
    const level = s.level;
    let n = 0;
    s.cells.forEach(c => { if (c && c.plant && n++ < 6) c.fire = 10; });   // 顺带把火焰效果算进来
    const view = boxView(s);
    view.draw(0); view.drawAnimals(0); view.drawEffects(1000);
    for (const box of view.cliffBoxes(s)) view.boxes.push(box);
    const groups = new Map();
    for (const [x, y, z, w, h, d, c, ry, rz] of view.boxes) {
      const key = [x, z, w, d, ry, rz].map(v => Number(v).toFixed(4)).join('|');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push([y - h / 2, y + h / 2, c]);
    }
    let bad = 0, worst = 0;
    for (const list of groups.values()) {
      if (list.length < 2) continue;
      list.sort((a, b) => a[0] - b[0]);
      for (let i = 1; i < list.length; i++) {
        const overlap = Math.min(list[i - 1][1], list[i][1]) - Math.max(list[i - 1][0], list[i][0]);
        if (overlap > 1e-9) { bad++; worst = Math.max(worst, overlap); }
      }
    }
    assert.equal(bad, 0, `关卡 ${level + 1} 有 ${bad} 对同位置同尺寸的方块在高度上重叠（最大 ${worst.toFixed(3)}），缩放时这些面会闪烁`);
    assert(view.boxes.length > 200, '方块数量异常偏少，检查是否真的绘制了');
  }
});

// ---------- 7. 高度感知拾取 ----------
const pickView = world => { const v = Object.create(GardenView.prototype); v.world = world; return v; };
test('picking follows the terrain instead of a flat plane', () => {
  const s = E.makeWorld(4, 2, 42), w = s.w;
  const A = 8, AX = 18;
  const peak = { x: AX - w / 2 + .5, z: A - s.h / 2 + .5 };
  s.cells[A * w + AX].ground = 'mountain';
  s.cells[A * w + AX].elevation = 8;
  const view = pickView(s);
  const dir = { x: 0, y: -0.4472, z: 0.8944 };
  const origin = { x: peak.x, y: 10, z: peak.z - 5 };
  const hit = view.rayCell(origin, dir);
  assert.equal(hit, A * w + AX, '抬高的山峰必须遮挡其身后的格子');
  const tFlat = (0 - origin.y) / dir.y;
  const flat = Math.floor(origin.z + dir.z * tFlat + s.h / 2) * w + Math.floor(origin.x + s.w / 2);
  assert.notEqual(flat, hit, '该用例应能区分「平面求交」与「高度感知」两种实现');

  const flatCell = s.cells.findIndex(c => c && c.ground === 'soil' && c.elevation < 2);
  const fx = flatCell % w, fz = Math.floor(flatCell / w);
  assert.equal(pickView(s).rayCell({ x: fx - w / 2 + .5, y: 10, z: fz - s.h / 2 + .5 }, { x: 0, y: -1, z: 0 }), flatCell, '平地拾取应命中正下方格子');

  const hole = s.cells.findIndex(c => !c);
  if (hole >= 0) {
    const hx = hole % w, hz = Math.floor(hole / w);
    assert.equal(pickView(s).rayCell({ x: hx - w / 2 + .5, y: 5, z: hz - s.h / 2 + .5 }, { x: 0, y: -1, z: 0 }), -1, '空位不应被拾取');
  }
  assert.equal(pickView(s).rayCell({ x: 0, y: 5, z: 0 }, { x: 0, y: 0, z: 1 }), -1, '水平射线不应命中');
  assert.equal(pickView(null).rayCell({ x: 0, y: 5, z: 0 }, { x: 0, y: -1, z: 0 }), -1, '无世界时应返回 -1');

  const yaw = .72, cam = { x: Math.sin(yaw) * 45, y: 36, z: Math.cos(yaw) * 45 };
  const aim = to => { const dx = to.x - cam.x, dy = to.y - cam.y, dz = to.z - cam.z, L = Math.hypot(dx, dy, dz); return { x: dx / L, y: dy / L, z: dz / L }; };
  const centerHit = pickView(s).rayCell(cam, aim({ x: 0, y: 0, z: 0 }));
  assert(centerHit >= 0 && Math.abs(centerHit % w - w / 2) <= 3 && Math.abs(Math.floor(centerHit / w) - s.h / 2) <= 3, '射向岛心的相机射线应落在岛心附近');
  assert.equal(pickView(s).rayCell(cam, aim({ x: peak.x, y: 8, z: peak.z })), A * w + AX, '射向峰顶的相机射线必须命中峰本身');
});

// ---------- 7. 水与石头跟着格子高度 ----------
test('water and rock sit at the height of the cell they are placed on', () => {
  const mk = () => { const p = E.defaultProfile(); p.unlocked = p.current = 5; const s = E.makeWorld(5, 2, 42); s.score = 1000; return { p, s }; };
  const find = (s, pred) => s.cells.findIndex(c => c && pred(c));
  {
    const { p, s } = mk();
    const high = find(s, c => c.ground === 'soil' && !c.plant && !c.animal && c.elevation > .7);
    const low = find(s, c => c.ground === 'soil' && !c.plant && !c.animal && c.elevation < .15);
    const hiE = s.cells[high].elevation, loE = s.cells[low].elevation;
    assert(E.place(s, 'water', high, p).ok && E.place(s, 'water', low, p).ok, '坡地上应该能放水');
    assert.equal(s.cells[high].elevation, hiE, '放水不应改动地面高度');
    assert.equal(s.cells[low].elevation, loE, '放水不应改动地面高度');
    assert.equal(E.surfaceHeight(s.cells[high]), hiE, '高处的水平面必须停在高处');
    assert.equal(E.surfaceHeight(s.cells[low]), loE, '低处的水平面必须在低处');
    assert(Math.abs(hiE - loE) > .4, '这组用例需要明显落差才有意义');
  }
  {
    const { p, s } = mk();
    const rock = find(s, c => c.ground === 'soil' && !c.plant && !c.animal && c.elevation > .5);
    const e = s.cells[rock].elevation;
    assert(E.place(s, 'rock', rock, p).ok);
    assert.equal(s.cells[rock].elevation, e, '放石头不应改动地面高度');
    assert(Math.abs(E.surfaceHeight(s.cells[rock]) - (e + .65)) < 1e-9, '石头顶面 = 地面高度 + 石头自身高度');
  }
  {
    const { p, s } = mk();
    const hill = find(s, c => c.ground === 'soil' && !c.plant && !c.animal && c.elevation > .4);
    const e = s.cells[hill].elevation;
    assert(E.place(s, 'forest', hill, p).ok);
    assert.equal(s.cells[hill].elevation, e, '种森林不该把山坡压平');
  }
  {
    const { p, s } = mk();
    const spot = find(s, c => c.ground === 'soil' && !c.plant && !c.animal && c.elevation > .4);
    const level0 = s.cells[spot].elevation;
    assert(E.place(s, 'lake', spot, p).ok);
    const tops = new Set(s.cells.filter(c => c && ['water', 'spring'].includes(c.ground)).map(c => E.surfaceHeight(c).toFixed(2)));
    assert([...tops].some(v => Math.abs(Number(v) - level0) < .01), '人工湖的水面应落在点击处的高度');
    assert(tops.size >= 1, '湖面高度应有效');
  }
});

// ---------- 8. 模型盒数与实例预算 ----------
test('every species stays within the model box budget', () => {
  let maxBoxes = 0;
  for (const type of Object.keys(E.WEIGHTS)) {
    for (let variant = 0; variant < 5; variant++) {
      let boxes = 0;
      GardenModels.animals({
        a: { type, variant, dir: 0 }, phase: 0, t: 0, i: 0, labelList: [],
        part: (...args) => {
          boxes++;
          assert(args.length >= 6 && args.slice(0, 7).every(Number.isFinite), `${type} 的 part 参数必须是有限数值`);
          assert(Number.isInteger(args[6]) && args[6] >= 0 && args[6] <= 0xffffff, `${type} 的颜色必须是合法 24 位整数`);
        }
      });
      assert(boxes >= 5, `${type} 至少要有 5 个盒子（render.cjs 的既有断言）`);
      assert(boxes <= 64, `${type} 用了 ${boxes} 个盒子，超出 64 盒的设计上限`);
      maxBoxes = Math.max(maxBoxes, boxes);
    }
  }
  assert(maxBoxes * 1500 <= GardenView.BUDGET.animals, `最复杂物种 ${maxBoxes} 盒 × 1500 只超出动物实例预算 ${GardenView.BUDGET.animals}`);
});

test('worst-case terrain stays inside the instance budget', () => {
  const count = s => { const v = boxView(s); v.draw(0); return v.boxes.length; };
  const check = (level, name, mutate) => {
    const s = E.makeWorld(level, 2, 42);
    const land = s.cells.map((c, i) => (c ? i : -1)).filter(i => i >= 0);
    mutate(s, land);
    const n = count(s);
    assert(n <= GardenView.BUDGET.terrain, `${name} 用了 ${n} 个实例，超出地形预算 ${GardenView.BUDGET.terrain}（scene.js 的 put 会直接抛错）`);
    assert(n <= 25000, `${name} 用了 ${n} 个实例，超出 25000 的预期余量：地形加密后请复核预算`);
  };
  for (const level of [4, 5]) {
    check(level, `关卡 ${level + 1} 出厂地形`, () => {});
    check(level, `关卡 ${level + 1} 全岛森林`, (s, land) => land.forEach(i => { s.cells[i].plant = 'tree'; s.cells[i].ground = 'soil'; s.cells[i].age = 200; }));
    check(level, `关卡 ${level + 1} 全岛高山(8.5 格)`, (s, land) => land.forEach(i => { s.cells[i].plant = null; s.cells[i].ground = 'mountain'; s.cells[i].elevation = 8.5; }));
  }
});

// ---------- 9. 地形数值上限 ----------
test('terrain numeric caps are single-sourced and validated', () => {
  assert(E.TERRAIN, 'EcoData.TERRAIN 必须存在');
  assert(E.TERRAIN.MAX_ELEVATION >= 8, 'MAX_ELEVATION 应为更高的山峰留出余量');
  assert.equal(E.TERRAIN.MAX_VARIANT, 4, '变体上限沿用 0..4');
  const mk = () => { const p = E.defaultProfile(); p.unlocked = p.current = 5; p.worlds[5] = E.makeWorld(5, 2, 42); p.version = E.VERSION; return p; };
  const at = mk(), cell = at.worlds[5].cells.find(c => c && c.ground === 'soil');
  cell.elevation = E.TERRAIN.MAX_ELEVATION;
  assert.doesNotThrow(() => E.validateProfile(JSON.parse(JSON.stringify(at))), '上限内的 elevation 必须被接受');
  cell.elevation = E.TERRAIN.MAX_ELEVATION + 1;
  assert.throws(() => E.validateProfile(JSON.parse(JSON.stringify(at))), '超出上限的 elevation 必须被拒绝');
  const v = mk(), vcell = v.worlds[5].cells.find(c => c && c.ground === 'soil');
  vcell.variant = E.TERRAIN.MAX_VARIANT + 1;
  assert.throws(() => E.validateProfile(JSON.parse(JSON.stringify(v))), '超出上限的 variant 必须被拒绝');
  for (let l = 0; l < 6; l++) for (const c of E.makeWorld(l, 2, 42).cells) if (c) assert(c.elevation <= E.TERRAIN.MAX_ELEVATION, '生成的地形高程超出上限');
});

console.log(passed + ' shape and render checks passed');
