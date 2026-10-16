// 生成「水流演示」存档：一条从高处通向岛外的阶梯水道上站着几种动物，
// 导入后能看到走兽被水冲走、会飞的留在原地。
const fs = require('node:fs'), path = require('node:path');
require('../tests/load.cjs');
const E = Eco, p = E.defaultProfile();
p.unlocked = 5; p.current = 5; p.settings.sound = false;
const s = E.makeWorld(5, 2, 20260116);
s.rng = 20260116;
p.worlds[5] = s;
const at = (x, y) => s.cells[y * s.w + x];

// 1) 挑一处「朝岛外、并且往内陆有足够长度」的边缘，铺一条阶梯水道（越靠内陆越高 → 有落差）
const LEN = 11;
let edge = -1, dir = null;
for (let i = 0; i < s.cells.length; i++) {
  if (!s.cells[i]) continue;
  const x = i % s.w, y = Math.floor(i / s.w);
  for (const d of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
    const xx = x + d[0], yy = y + d[1];
    const outside = xx < 0 || yy < 0 || xx >= s.w || yy >= s.h || !s.cells[yy * s.w + xx];
    if (!outside) continue;
    let ok = true;
    for (let k = 1; k <= LEN; k++) {
      const px = x - d[0] * k, py = y - d[1] * k;
      if (px < 1 || py < 1 || px >= s.w - 1 || py >= s.h - 1 || !s.cells[py * s.w + px]) { ok = false; break; }
    }
    // 尽量选靠中间的边缘，画面更居中
    if (ok && (edge < 0 || Math.abs(x - s.w / 2) < Math.abs(edge % s.w - s.w / 2))) { edge = i; dir = d; }
  }
}
if (edge < 0) { console.error('这座岛找不到合适的边缘，换个种子'); process.exit(1); }
const ex = edge % s.w, ey = Math.floor(edge / s.w), stream = [];
for (let k = 0; k < LEN; k++) {
  const x = ex - dir[0] * k, y = ey - dir[1] * k, i = y * s.w + x, c = s.cells[i];
  c.ground = 'water'; c.plant = null; c.animal = null; c.flow = 0; c.elevation = Math.round((0.2 + k * 0.3) * 100) / 100;
  stream.push(i);
}
stream.reverse();                                            // 从高处排到岛外
// 水道两侧垫成缓坡，免得水悬在空中
for (const i of stream) {
  const x = i % s.w, y = Math.floor(i / s.w), e = s.cells[i].elevation;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const c = at(x + dx, y + dy);
    if (c && ['soil', 'ash'].includes(c.ground) && !c.plant && !c.animal) c.elevation = Math.max(0, Math.round((e - 0.35) * 100) / 100);
  }
}

// 2) 岸边种点草和浆果，画面不那么荒
for (let y = Math.max(1, ey - LEN - 4); y < Math.min(s.h - 1, ey + 3); y++)
  for (let x = Math.max(1, ex - 6); x < Math.min(s.w - 1, ex + 7); x++) {
    const c = at(x, y);
    if (c && c.ground === 'soil' && !c.plant) { c.plant = (x + y) % 7 === 0 ? 'bush' : 'grass'; c.age = 60; c.fert = .4; }
  }

// 3) 水道里站几种动物：走兽会被冲走，会飞的不会；体重越大越抗冲
const stand = [
  [stream[4], 'bug'], [stream[5], 'rabbit'], [stream[6], 'chicken'], [stream[7], 'sheep'], [stream[8], 'boar'],
  [stream[2], 'bird'], [stream[9], 'butterfly']
];
for (const [i, type] of stand) {
  const c = s.cells[i];
  if (!c) continue;
  if (c.animal) continue;                                    // 一格只能站一只
  const a = E.animal(type); a.variant = i % 5; a.dir = Math.atan2(dir[0], dir[1]); c.animal = a;
}
// 水口再放两只，方便对比
for (const [x, y] of [[ex - 3, ey - 2], [ex + 2, ey - 3]]) {
  const c = at(x, y);
  if (c && c.ground === 'soil' && !c.animal) { c.ground = 'water'; c.plant = null; c.elevation = 0.2; c.animal = E.animal('sheep'); }
}

E.updateMoisture(s); E.refreshTerrain(s); E.check(s, p); s.score = 1000; s.energy = 100;
s.events = [{ id: 'flowDemo', title: '水往低处走', text: '高处的水会自己找低处流，方向一旦定下就不再改变。站在活水里的走兽会被冲下去，会飞的留在原地。', i: stream[5], tick: 0 }];
s.notified.flowDemo = true;
E.validateProfile(p);
const out = process.argv[2] || path.resolve(__dirname, '../docs/水流演示.json');
fs.writeFileSync(out, JSON.stringify(p));
console.log('Generated water flow demo →', out);
console.log('水道长度', stream.length, '高程', stream.map(i => s.cells[i].elevation.toFixed(2)).join(' > '));
console.log('水里站的动物', stand.map(([i, t]) => t + '@' + (i % s.w) + ',' + Math.floor(i / s.w)).join(' '));
