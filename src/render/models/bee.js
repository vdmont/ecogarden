GardenModels.registry['bee'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;
  const P = GardenModels.pose(a, t);
  // 蜜蜂悬在半空：睡觉就是落下来把翅膀收住；吃（停在花上）同样停住、悬停的起伏也停；
  // 被冲走对它不适用（会飞，冲不走）
  const lift = P.asleep
      ? 0.06
      : P.eat
        ? 0.03
        : Math.abs(Math.sin(t * 0.0022)) * 0.04 + 0.03,
    flap = P.asleep || P.eat ? 0 : phase * 0.45;
  const p = (dx, y, dz, w, h, d, col, tilt = 0) =>
    part(dx, y * P.bodyY + lift, dz, w, h * P.bodyY, d, col, tilt + P.tilt);
  p(0, 0.65, 0, 0.3, 0.25, 0.44, 0xe9c653);
  for (let dz of [-0.13, 0.05]) p(0, 0.655, dz, 0.31, 0.26, 0.065, 0x665138);
  p(0, 0.73, 0.25, 0.25, 0.22, 0.2, 0xe9c653);
  for (let side of [-1, 1]) {
    p(side * 0.25, 0.81, -0.03, 0.32, 0.045, 0.3, 0xe5f1e9, side * flap);
    p(side * 0.08, 0.78, 0.36, 0.05, 0.055 * P.eyeH, 0.035, 0x353e32);
  }
};
