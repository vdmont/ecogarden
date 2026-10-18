GardenModels.registry['bug'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;
  const P = GardenModels.pose(a, t);
  const sway = P.sway * 0.03;
  // 脖子接在躯干上的那个点（第三节身子和脑袋之间）。幼虫没有脖子，
  // 但「吃的时候脑袋压下去」是同一个道理：绕连接点在矢状面里转，不是整块往下挪。
  const NECK_Y = 0.18,
    NECK_Z = -0.1;
  // 幼虫睡觉就是缩成一团：整条往下沉、变矮；被冲走对它不适用（它不会走）
  for (let k = -1; k <= 1; k++) {
    const y = 0.25 + (k === 0 ? 0.018 : 0);
    // 最前面那一节是脑袋，跟着脖子转；其余两节是身子，不动
    const H = k === 1 ? P.neckAt(y, 0, NECK_Y, NECK_Z) : { y, z: 0, pitch: 0 };
    part(
      k * 0.18 + sway,
      H.y * P.bodyY + P.lift,
      H.z,
      0.172,
      0.2 * P.bodyY,
      0.25 * (P.asleep ? 0.85 : 1),
      k === 1 ? 0xe6b26b : 0xc99053,
      P.tilt,
      H.pitch,
    );
  }
  // 眼睛跟着脑袋一起沉、一起转，睡着时眯起来
  for (let dz of [0.08, -0.08]) {
    const H = P.neckAt(0.36, dz, NECK_Y, NECK_Z);
    part(
      0.24 + sway,
      H.y * P.bodyY - P.headDrop + P.lift,
      H.z,
      0.055,
      0.055 * P.eyeH,
      0.045,
      0x373b32,
      P.tilt,
      H.pitch,
    );
  }
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
