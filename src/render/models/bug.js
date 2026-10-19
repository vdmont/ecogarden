GardenModels.registry['bug'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;
  const P = GardenModels.pose(a, t);
  const sway = P.sway * 0.03;
  // 脖子接在躯干上的那个点（第三节身子和脑袋之间）。幼虫没有脖子，
  // 但「吃的时候脑袋压下去」是同一个道理：绕连接点在矢状面里转，不是整块往下挪。
  const NECK_Y = 0.18,
    NECK_Z = -0.1;
  // 头 = 一个刚体：脑袋这一节和两只眼睛全部走它。
  // 幼虫睡觉是整条缩成一团，所以往下压用身子的比例（pressWith: 'body'）。
  const HEAD = P.headFrame(drawPart, NECK_Y, NECK_Z, { sway: P.sway * 0.03, pressWith: 'body' });
  // 幼虫睡觉就是缩成一团：整条往下沉、变矮；被冲走对它不适用（它不会走）
  for (let k = -1; k <= 1; k++) {
    const y = 0.25 + (k === 0 ? 0.018 : 0);
    // 最前面那一节是脑袋，跟着脖子走；其余两节是身子，不动
    if (k === 1)
      HEAD.draw(k * 0.18, y, 0, 0.172, 0.2, 0.25 * (P.asleep ? 0.85 : 1), 0xe6b26b);
    else
      part(
        k * 0.18 + sway,
        y * P.bodyY + P.lift,
        0,
        0.172,
        0.2 * P.bodyY,
        0.25,
        0xc99053,
        P.tilt,
      );
  }
  // 眼睛跟着脑袋一起沉、一起转、一起歪，睡着时眯起来。
  // 位置在脑袋这一节的前脸（x=0.30）：放在 0.24 的话睡觉时整个埋进脑袋里
  // （脑袋缩到 0.172 宽、位置也跟着压下去），看上去就是幼虫没有眼睛。
  for (let dz of [0.08, -0.08]) HEAD.drawEye(0.3, 0.3, dz, 0.055, 0.055, 0.045, 0x373b32);
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
