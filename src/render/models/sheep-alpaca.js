GardenModels.registry['sheep-alpaca'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;
  const P = GardenModels.pose(a, t);
  const alp = a.type === 'alpaca',
    sc = 1, // 幼崽缩放统一在 GardenModels.animals 里做，这里不用再缩一遍
    sway = P.sway * 0.05;
  // 躯干：睡着时压到贴地；站着/走着时随呼吸轻轻起伏，喝醉了左右晃
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
  // 腿：位置与转角由 P.place 算好（绕胯转），这里只负责缩放和上色
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
  // 头/脖子：睡着时低下来枕在地上
  const hd = (dx, y, dz, w, h, d, col, tilt = 0) =>
    part(
      (dx + sway) * sc,
      (y * P.headY - P.headDrop) * sc + P.lift * sc,
      dz * sc,
      w * sc,
      h * sc,
      d * sc,
      col,
      tilt + P.earTilt + P.tilt,
    );
  // 眼睛：睡着时眯成一条
  const eye = (dx, y, dz, w, h, d, col) =>
    part(
      (dx + sway) * sc,
      (y * P.headY - P.headDrop) * sc + P.lift * sc,
      dz * sc,
      w * sc,
      h * P.eyeH * sc,
      d * sc,
      col,
      P.tilt,
    );
  const wool = alp ? 0xf1eadb : 0xf1e8d0,
    shade = alp ? 0xdfd5c2 : 0xded5bd;
  p(0, 0.55, 0, 0.67, 0.46, 0.86, wool);
  p(-0.2, 0.76, -0.13, 0.32, 0.16, 0.38, shade);
  p(0.16, 0.79, 0.1, 0.37, 0.16, 0.4, wool);
  for (let dx of [-0.23, 0.23])
    for (let dz of [-0.29, 0.29]) {
      // 腿挂在胯上（y=0.44 处），绕胯前后摆。0.12 = 蹄子多高，
      // 交给 place() 算蹄子的位置，它才会正好盖在腿末端（自己写死偏移会浮起来）
      const L = P.place(P.legGroup(dx < 0 ? -1 : 1, dz > 0), 0.44, dz, 0.42, 0.12);
      lg(dx, L.y, L.z, 0.13, L.len, 0.14, shade, L.pitch);
      lg(dx, L.footY, L.footZ, 0.15, L.footH, 0.16, 0x535147, L.pitch);
    }
  if (alp) hd(0, 0.95, 0.33, 0.23, 0.76, 0.24, wool);
  const hy = alp ? 1.46 : 0.86,
    hz = alp ? 0.4 : 0.44;
  hd(0, hy, hz, 0.4, 0.35, 0.35, alp ? 0xe9dfce : 0xd7c7ac);
  hd(0, hy - 0.1, hz + 0.2, 0.29, 0.17, 0.2, alp ? 0xf6efdf : 0xe9ddc7);
  for (let side of [-1, 1]) {
    eye(side * 0.115, hy + 0.045, hz + 0.185, 0.065, 0.065, 0.035, 0x363f37);
    hd(
      side * (alp ? 0.12 : 0.26),
      hy + (alp ? 0.29 : 0.02),
      hz,
      alp ? 0.09 : 0.16,
      alp ? 0.27 : 0.12,
      0.13,
      shade,
    );
  }
  hd(0, hy - 0.13, hz + 0.315, 0.085, 0.045, 0.035, 0x67554b);
  p(0, 0.65, -0.48, 0.16, 0.18, 0.2, wool);
  if (a.drunk) {
    eye(-0.21, hy - 0.035, hz + 0.18, 0.075, 0.05, 0.035, 0xdd9a96);
    eye(0.21, hy - 0.035, hz + 0.18, 0.075, 0.05, 0.035, 0xdd9a96);
  }
};
