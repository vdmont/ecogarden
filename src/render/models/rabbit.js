GardenModels.registry['rabbit'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;
  const P = GardenModels.pose(a, t);
  const sc = 1; // 幼崽缩放统一在 GardenModels.animals 里做，这里不用再缩一遍
  sway = P.sway * 0.05;
  const p = (dx, y, dz, w, h, d, col, tilt = 0) =>
    part(
      (dx + sway) * sc,
      y * P.bodyY * sc + P.lift * sc,
      dz * sc,
      w * sc,
      h * P.bodyY * sc,
      d * sc,
      col,
      tilt + P.tilt,
    );
  const lg = (dx, y, dz, w, h, d, col, pitch = 0) =>
    part(
      (dx + sway) * sc,
      y * sc + P.lift * sc,
      dz * sc,
      w * sc,
      h * sc,
      d * sc,
      col,
      P.tilt,
      pitch,
    );
  // 脖子接在躯干上的那个点。吃的时候头绕它转（绕 X 轴，矢状面），不是整块上下挪。
  const NECK_Y = 0.5,
    NECK_Z = 0.16;
  // 头 = 一个刚体：头、两只耳朵、两只眼睛、鼻子全部走它。
  // 睡觉歪头、吃的时候低头、睡着压低都在 animals.js 里算一次，模型不再自己算。
  const HEAD = P.headFrame(drawPart, NECK_Y, NECK_Z, { sway: P.sway * 0.05 });
  const hd = (...a) => HEAD.draw(...a);
  const eye = (dx, y, dz, w, h, d, col) => HEAD.drawEye(dx, y, dz, w, h, d, col);
  p(0, 0.31, -0.04, 0.43, 0.36, 0.5, 0xd8c4aa);
  // 头原本画在 p()（身子部件）里，头一低它就不动 —— 挪到 hd()，跟着脖子转
  hd(0, 0.49, 0.25, 0.36, 0.32, 0.32, 0xe5d2bb);
  p(0, 0.27, -0.36, 0.22, 0.22, 0.22, 0xf7eddc);
  for (let side of [-1, 1]) {
    hd(side * 0.11, 0.89, 0.23, 0.1, 0.5, 0.12, 0xe5d2bb);
    hd(side * 0.11, 0.91, 0.303, 0.05, 0.34, 0.035, 0xc89187);
    eye(side * 0.095, 0.53, 0.425, 0.055, 0.055, 0.03, 0x3d4036);
    // 兔子两条后腿都在身子后侧，一前一后蹬
    const L = P.place(P.legGroup(side, false), 0.185, 0.12, 0.13);
    lg(side * 0.18, L.y, L.z, 0.19, L.len, 0.25, 0xc5ad90, L.pitch);
  }
  hd(0, 0.43, 0.435, 0.07, 0.045, 0.045, 0xc48579);
};
