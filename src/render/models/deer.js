GardenModels.registry['deer'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;
  const P = GardenModels.pose(a, t);
  // 躯干/脖子/头/耳朵/鹿角在睡着时一起压低，腿收进肚子底下，眼睛眯成一条
  const body = (dx, y, dz, w, h, d, col) =>
    part(dx, y * P.bodyY + P.lift, dz, w, h * P.bodyY, d, col, P.tilt);
  const head = (dx, y, dz, w, h, d, col, tilt = 0) =>
    part(
      dx,
      y * P.headY - P.headDrop + P.lift,
      dz,
      w,
      h * (P.asleep ? 1 : P.eyeH),
      d,
      col,
      tilt + P.earTilt + P.tilt,
    );
  const eye = (dx, y, dz, w, h, d, col) => head(dx, y, dz, w, h * P.eyeH, d, col);

  body(0, 0.68, 0, 0.43, 0.37, 0.8, 0xad8057);
  body(0, 0.61, 0.18, 0.28, 0.2, 0.36, 0xe1caa3);
  // 对角的两条腿同步：前左+后右一组，前右+后左一组
  for (let side of [-1, 1])
    for (let dz of [-0.28, 0.28]) {
      // 腿挂在胯上（y=0.58 处），绕胯前后摆。0.12 = 蹄子多高
      const L = P.place(P.legGroup(side, dz > 0), 0.58, dz, 0.58, 0.12);
      part(side * 0.16, L.y, L.z, 0.08, 0.58, 0.09, 0x9a6d48, P.tilt, L.pitch);
      part(side * 0.16, L.footY, L.footZ, 0.1, L.footH, 0.11, 0x52483b, P.tilt, L.pitch);
    }
  head(0, 1.03, 0.29, 0.19, 0.64, 0.23, 0xbb9066);
  head(0, 1.33, 0.42, 0.31, 0.3, 0.38, 0xc5a174);
  head(0, 1.24, 0.65, 0.21, 0.13, 0.21, 0xdfc5a1);
  head(0, 1.27, 0.77, 0.09, 0.065, 0.045, 0x493f36);
  for (let side of [-1, 1]) {
    eye(side * 0.15, 1.37, 0.54, 0.045, 0.06, 0.07, 0x363c31);
    head(side * 0.24, 1.43, 0.38, 0.2, 0.09, 0.14, 0xbb9066, side * 0.2);
    head(side * 0.1, 1.63, 0.36, 0.07, 0.48, 0.07, 0x7a5d3f);
    head(side * 0.2, 1.75, 0.36, 0.25, 0.06, 0.06, 0x7a5d3f);
    head(side * 0.29, 1.85, 0.36, 0.055, 0.24, 0.055, 0x8a6b49);
  }
  body(0, 0.77, -0.47, 0.14, 0.17, 0.2, 0xe4cbaa);
};
