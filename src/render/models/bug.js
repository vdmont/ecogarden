GardenModels.registry['bug'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;
  const P = GardenModels.pose(a, t);
  const sway = P.sway * 0.03;
  // 幼虫睡觉就是缩成一团：整条往下沉、变矮；被冲走对它不适用（它不会走）
  for (let k = -1; k <= 1; k++)
    part(
      k * 0.18 + sway,
      (0.25 + (k === 0 ? 0.018 : 0)) * P.bodyY + P.lift,
      0,
      0.172,
      0.2 * P.bodyY,
      0.25 * (P.asleep ? 0.85 : 1),
      k === 1 ? 0xe6b26b : 0xc99053,
      P.tilt,
    );
  // 眼睛跟着脑袋一起沉，睡着时眯起来
  for (let dz of [0.08, -0.08])
    part(
      0.24 + sway,
      0.36 * P.bodyY - P.headDrop + P.lift,
      dz,
      0.055,
      0.055 * P.eyeH,
      0.045,
      0x373b32,
      P.tilt,
    );
  for (let k = -1; k <= 1; k++)
    for (let side of [-1, 1])
      part(
        k * 0.17 + sway,
        0.14 * P.legY + P.lift,
        side * 0.15,
        0.06,
        0.09 * P.legY,
        0.09,
        0x62523b,
        P.tilt,
      );
};
