// 涌现式玩法第一例：水有流向、动物有属性，两者相遇自动产生结果。
const assert = require('node:assert/strict');
require('./load.cjs');
const E = globalThis.Eco,
  WATERY = ['water', 'spring'];

let passed = 0;
function test(name, fn) {
  fn();
  console.log('PASS ' + name);
  passed++;
}
function profile(level = 5) {
  const p = E.defaultProfile();
  p.unlocked = p.current = level;
  return p;
}
// 造一条从高处通向岛外的阶梯水道，返回从高到低的格子索引
function buildStream(s, len = 9) {
  let edge = -1,
    dir = null;
  for (let i = 0; i < s.cells.length && edge < 0; i++) {
    if (!s.cells[i]) continue;
    const x = i % s.w,
      y = Math.floor(i / s.w);
    for (const d of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const xx = x + d[0],
        yy = y + d[1];
      const outside = xx < 0 || yy < 0 || xx >= s.w || yy >= s.h || !s.cells[yy * s.w + xx];
      if (!outside) continue;
      let ok = true;
      for (let k = 1; k <= len; k++) {
        const px = x - d[0] * k,
          py = y - d[1] * k;
        if (px < 1 || py < 1 || px >= s.w - 1 || py >= s.h - 1 || !s.cells[py * s.w + px]) {
          ok = false;
          break;
        }
      }
      if (ok) {
        edge = i;
        dir = d;
        break;
      }
    }
  }
  if (edge < 0) return null;
  const path = [];
  for (let k = 0; k < len; k++) {
    const x = (edge % s.w) - dir[0] * k,
      y = Math.floor(edge / s.w) - dir[1] * k,
      i = y * s.w + x,
      c = s.cells[i];
    c.ground = 'water';
    c.plant = null;
    c.animal = null;
    c.flow = 0;
    c.elevation = Math.round((0.2 + k * 0.4) * 100) / 100;
    path.push(i);
  }
  return path.reverse();
}
function streamWorld() {
  const p = profile();
  const s = E.makeWorld(5, 2, 42);
  s.score = 1000;
  s.rng = 12345;
  p.worlds[5] = s;
  return { p, s, path: buildStream(s) };
}

// ---------- 1. 有落差的水自己会流，方向定下就不再改 ----------
test('water with a drop picks a flow direction once and keeps it', () => {
  const { p, s, path } = streamWorld();
  assert(path && path.length >= 6, '需要一条能造出来的水道');
  E.step(s, p);
  const first = path.map((i) => s.cells[i].flow);
  assert(
    first.every((f) => f >= 1 && f <= 8),
    '每一格有落差的水都应该有流向：' + first.join(','),
  );
  const dirs = new Set(first);
  assert(dirs.size >= 1, '流向是 1..8 的方向编号');
  for (let t = 0; t < 60; t++) E.step(s, p);
  assert.deepEqual(
    path.map((i) => s.cells[i].flow),
    first,
    '流向一旦定下就不能再改变',
  );
  // 流向必须是「落差最大」的那个方向（水往最低处流，而不是随机挑）
  for (const i of path) {
    const x = i % s.w,
      y = Math.floor(i / s.w),
      here = E.surfaceHeight(s.cells[i]);
    const drops = E.FLOW_DIR.map(([dx, dy]) => {
      const xx = x + dx,
        yy = y + dy,
        outside = xx < 0 || yy < 0 || xx >= s.w || yy >= s.h;
      const d = outside ? null : s.cells[yy * s.w + xx];
      return outside || !d ? here + 1 : here - E.surfaceHeight(d);
    });
    const chosen = s.cells[i].flow - 1;
    assert(Math.abs(drops[chosen] - Math.max(...drops)) < 1e-9, '水必须流向落差最大的方向');
  }
  // 流向必须指向一个更低的邻居或岛外
  for (const i of path) {
    const d = E.FLOW_DIR[s.cells[i].flow - 1],
      x = (i % s.w) + d[0],
      y = Math.floor(i / s.w) + d[1];
    const inside = x >= 0 && y >= 0 && x < s.w && y < s.h && s.cells[y * s.w + x];
    if (inside)
      assert(E.surfaceHeight(s.cells[y * s.w + x]) < s.cells[i].elevation, '水只能往低处流');
  }
});

// ---------- 1b. 改地形能把水引到想去的地方 ----------
test('the water follows the terrain the player shapes', () => {
  const { p, s } = streamWorld();
  // 手工造一格高处的静水：把它四周垫得更高，水就没法流
  const spot = s.cells.findIndex((c, k) => {
    if (!c || c.ground !== 'soil' || c.plant || c.animal) return false;
    const x = k % s.w,
      y = Math.floor(k / s.w);
    return x > 3 && y > 3 && x < s.w - 4 && y < s.h - 4;
  });
  assert(spot >= 0, '需要一格内陆空地');
  const x = spot % s.w,
    y = Math.floor(spot / s.w);
  s.cells[spot].ground = 'water';
  s.cells[spot].plant = null;
  s.cells[spot].elevation = 2;
  for (const [dx, dy] of E.FLOW_DIR) {
    const n = s.cells[(y + dy) * s.w + x + dx];
    if (n) {
      n.plant = null;
      n.elevation = 2.2;
    }
  }
  E.step(s, p);
  assert.equal(s.cells[spot].flow, 0, '四周更高时是静水');
  // 只把东边挖低 → 水必须朝东
  const east = s.cells[y * s.w + x + 1];
  east.elevation = 0.5;
  E.step(s, p);
  const dir = E.FLOW_DIR[s.cells[spot].flow - 1];
  assert(
    dir && dir[0] === 1 && dir[1] === 0,
    '把东边挖低之后，水应该朝东流（实际 ' + JSON.stringify(dir) + '）',
  );
});

// ---------- 2. 静水不流 ----------
test('still water stays still', () => {
  const { p, s } = streamWorld();
  const i = s.cells.findIndex((c, k) => {
    if (!c || c.ground !== 'soil' || c.plant || c.animal) return false;
    const x = k % s.w,
      y = Math.floor(k / s.w);
    if (x < 2 || y < 2 || x >= s.w - 2 || y >= s.h - 2) return false;
    // 注意：水流看的是 8 个方向（含斜角），这里必须同样检查 8 个方向
    return E.FLOW_DIR.every(([dx, dy]) => {
      const xx = x + dx,
        yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= s.w || yy >= s.h) return true;
      const n = s.cells[yy * s.w + xx];
      return n && E.surfaceHeight(n) >= c.elevation;
    });
  });
  assert(i >= 0, '需要一格四周都不低的平地');
  s.cells[i].ground = 'water';
  s.cells[i].plant = null;
  for (let t = 0; t < 20; t++) E.step(s, p);
  assert.equal(s.cells[i].flow, 0, '四周都不低＝静水，不该有流向');
});

// ---------- 3. 属性相撞：走兽被冲走，会飞的不会 ----------
test('walkers get washed downstream, flyers do not', () => {
  // 机制：站在活水上的走兽，位移值会被水推起来（drift>0），或被直接冲走
  {
    const { p, s, path } = streamWorld();
    E.step(s, p);
    const wet = path.find((i) => s.cells[i].flow > 0);
    s.cells[wet].animal = E.animal('rabbit');
    let pushed = false;
    for (let t = 0; t < 40 && !pushed; t++) {
      E.step(s, p);
      const at = s.cells.findIndex((c) => c && c.animal && c.animal.type === 'rabbit');
      if (at < 0) {
        pushed = true;
        break;
      } // 已经被冲下岛
      const c = s.cells[at];
      if (c.flow > 0 && c.animal.drift > 0) pushed = true; // 正被水推着走
    }
    assert(pushed, '走兽站在活水上应该被推着走（drift>0），或者直接被冲走');
  }
  // 结果：走兽一路冲到岛外就消失（放在靠近岛外的水道格上，几步之内就会被冲下去）
  {
    const { p, s, path } = streamWorld();
    s.cells[path[path.length - 2]].animal = E.animal('rabbit');
    for (let t = 0; t < 300; t++) E.step(s, p);
    assert(
      s.metrics.washed >= 1,
      '水道里的兔子最终应该被冲下岛（washed=' + s.metrics.washed + '）',
    );
    assert(
      Object.keys(s.notified).some((k) => k.startsWith('washed')),
      '应该留下一条「被水冲走」的记录',
    );
  }
  // 会飞的：同样泡在水里，一拍都不会被推动
  {
    const { p, s, path } = streamWorld();
    const fly = E.animal('bird');
    s.cells[path[path.length - 2]].animal = fly;
    for (let t = 0; t < 300; t++) E.step(s, p);
    // 别的动物可能自己游荡进水里被冲走，但鸟绝不会
    assert(!s.notified.washedbird, '会飞的鸟不该被冲走');
    assert(
      s.cells.some((c) => c && c.animal === fly),
      '会飞的鸟应该还在岛上',
    );
  }
  // 属性直接决定结果：会飞的一律推 0，不会飞的一定会被推
  const { p, s, path } = streamWorld();
  E.step(s, p);
  const wet = path.find((i) => s.cells[i].flow > 0);
  for (const type of Object.keys(E.WEIGHTS)) {
    const push = E.flowPush(s, wet, { type });
    if (E.TRAITS[type].move === 'fly') assert.equal(push, 0, type + ' 会飞，不该被水冲');
    else assert(push > 0, type + ' 不会飞，应该会被活水推');
  }
});

// ---------- 4. 体重越大越抗冲 ----------
test('heavier or swimming animals resist the current', () => {
  const { p, s, path } = streamWorld();
  E.step(s, p);
  const wet = path.find((i) => s.cells[i].flow > 0);
  const push = (type) => E.flowPush(s, wet, { type });
  assert(push('bug') > push('rabbit'), '虫子该比兔子更容易被冲走');
  assert(push('rabbit') > push('sheep'), '兔子该比绵羊更容易被冲走');
  assert(push('sheep') > push('boar'), '绵羊该比野猪更容易被冲走');
  assert(push('frog') < push('rabbit'), '会游的青蛙应该比不会游的兔子抗冲');
  assert(push('bug') <= 1 && push('boar') > 0, '概率要被夹在 0..1 之间');
});

// ---------- 5. 水流状态能存档，坏值被拒 ----------
test('flow, drift and drift direction survive saving', () => {
  const { p, s, path } = streamWorld();
  s.cells[path[3]].animal = E.animal('rabbit');
  for (let t = 0; t < 12; t++) E.step(s, p);
  const back = E.validateProfile(JSON.parse(JSON.stringify(p)));
  assert(back.worlds[5].cells[path[3]].flow === s.cells[path[3]].flow, '流向必须随存档保留');
  const a = back.worlds[5].cells.find((c) => c && c.animal);
  assert(
    a && Number.isFinite(a.animal.drift) && a.animal.driftDir >= -1 && a.animal.driftDir <= 7,
    '位移属性必须随存档保留',
  );
  // 坏值必须被拒绝
  const bad = JSON.parse(JSON.stringify(p));
  bad.worlds[5].cells[path[3]].flow = 9;
  assert.throws(() => E.validateProfile(bad), '流向越界必须被拒绝');
  const bad2 = JSON.parse(JSON.stringify(p));
  const withA = bad2.worlds[5].cells.find((c) => c && c.animal);
  withA.animal.driftDir = 8;
  assert.throws(() => E.validateProfile(bad2), '位移方向越界必须被拒绝');
});

console.log(passed + ' emergent flow checks passed');
