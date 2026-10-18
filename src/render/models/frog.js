GardenModels.registry['frog'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;
  const P = GardenModels.pose(a, t);
  const sway = P.sway * 0.04;
  const p = (dx, y, dz, w, h, d, col, tilt = 0, pitch = 0) =>
    part(
      dx + sway,
      y * P.bodyY + P.lift,
      dz,
      w,
      h * P.bodyY,
      d,
      col,
      tilt + P.tilt,
      pitch,
    );
  // 眼睛：睡着时眼睛往后缩进脑袋（青蛙闭眼是眼皮盖住，不是变瞎）
  const eye = (dx, y, dz, w, h, d, col) =>
    part(dx + sway, y * P.headY - P.headDrop + P.lift, dz, w, h, d, col, P.tilt);
  for (const side of [-1, 1]) p(side * 0.12, 0.365, -0.04, 0.055, 0.035, 0.27, 0xe8dfa5);
  p(0, 0.295, 0.365, 0.22, 0.05, 0.035, 0x5c9293);
  p(0, 0.21, 0, 0.49, 0.27, 0.43, 0x739753);
  p(0, 0.26, 0.21, 0.48, 0.22, 0.3, 0x92b669);
  p(0, 0.14, 0.29, 0.32, 0.08, 0.19, 0xc2d79a);
  for (let side of [-1, 1]) {
    eye(side * 0.17, 0.43, 0.22, 0.17, 0.18, 0.18, 0x8fae61);
    eye(side * 0.17, 0.45, 0.32, 0.085 * P.eyeH, 0.085, 0.035, 0x333f2e);
    // 后腿：跳的时候蹬地，睡着时整条腿收进身侧。
    // pitch 必须传下去：漏掉的话这条腿是「整块平移」而不是绕胯转，
    // 腿盒子又大（0.34 深），平移出去直接怼到自己脑袋上。
    const L = P.place(P.legGroup(side, side < 0), 0.215, -0.12, 0.19);
    p(side * 0.31, L.y, L.z, 0.23, L.len, 0.34, 0x5f8348, 0, L.pitch);
    p(side * 0.28, L.footY, L.footZ + 0.3, 0.22, 0.06, 0.22, 0x8ca961, 0, L.pitch);
  }
};
