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
  // 脖子接在躯干上的那个点，吃的时候头绕它转（绕 X 轴，矢状面）
  const NECK_Y = 0.24,
    NECK_Z = 0.02;
  const HEAD = P.headFrame(drawPart, NECK_Y, NECK_Z, { sway: P.sway * 0.05 });
  // 青蛙的头是矮趴趴的一坨，睡着时整个身子都在缩，所以头的高度也跟着缩（bodyY）
  const hd = (dx, y, dz, w, h, d, col) => HEAD.draw(dx, y, dz, w, h * P.bodyY, d, col);
  // 眼睛：鼓出来的眼球 + 中间的瞳。闭眼是**瞳**压扁成一条，眼球还是鼓的，
  // 所以眼球用 draw、瞳用 drawEye（它压的是高度）。
  const eye = (dx, y, dz, w, h, d, col) => HEAD.draw(dx, y, dz, w, h, d, col);
  for (const side of [-1, 1]) p(side * 0.12, 0.365, -0.04, 0.055, 0.035, 0.27, 0xe8dfa5);
  p(0, 0.295, 0.365, 0.22, 0.05, 0.035, 0x5c9293);
  p(0, 0.21, 0, 0.49, 0.27, 0.43, 0x739753);
  // 头原本画在 p()（身子部件）里，头一低它就不动 —— 挪到 hd()，跟着脖子转
  hd(0, 0.26, 0.21, 0.48, 0.22, 0.3, 0x92b669);
  hd(0, 0.14, 0.29, 0.32, 0.08, 0.19, 0xc2d79a);
  for (let side of [-1, 1]) {
    eye(side * 0.17, 0.43, 0.22, 0.17, 0.18, 0.18, 0x8fae61);
    HEAD.drawEye(side * 0.17, 0.45, 0.32, 0.085, 0.085, 0.035, 0x333f2e);
    // 后腿：跳的时候蹬地，睡着时整条腿收进身侧。
    // pitch 必须传下去：漏掉的话这条腿是「整块平移」而不是绕胯转，
    // 腿盒子又大（0.34 深），平移出去直接怼到自己脑袋上。
    const L = P.place(P.legGroup(side, side < 0), 0.215, -0.12, 0.19);
    p(side * 0.31, L.y, L.z, 0.23, L.len, 0.34, 0x5f8348, 0, L.pitch);
    p(side * 0.28, L.footY, L.footZ + 0.3, 0.22, 0.06, 0.22, 0x8ca961, 0, L.pitch);
  }
};
