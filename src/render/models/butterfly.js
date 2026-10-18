GardenModels.registry['butterfly'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;
  const P = GardenModels.pose(a, t);
  // 悬停的上下起伏。吃（停在花上吸蜜）时不动 —— 吸蜜要停住才说得通。
  const lift = P.asleep
      ? 0.03
      : P.eat
        ? 0.02
        : Math.abs(Math.sin(t * 0.0018)) * 0.05 + 0.02,
    // 翅膀：睡觉落下来收住，吃的时候同样停住（吸蜜不扇翅），其它时候才扇
    flap = P.asleep || P.eat ? 0 : phase * 0.4;
  const p = (dx, y, dz, w, h, d, col, tilt = 0) =>
    part(dx, y * P.bodyY + lift, dz, w, h * P.bodyY, d, col, tilt + P.tilt);
  p(0, 0.65, 0, 0.075, 0.2, 0.3, 0x71536d);
  // 睡觉 = 落下来收翅膀（翅膀贴到身体两侧）
  for (let side of [-1, 1]) {
    p(side * (P.asleep ? 0.075 : 0.24), 0.72, 0, 0.38, 0.09, 0.4, 0xd596c1, side * flap);
    p(side * (P.asleep ? 0.06 : 0.17), 0.62, -0.24, 0.22, 0.07, 0.25, 0xb775a5);
  }
};
