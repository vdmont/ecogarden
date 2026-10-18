GardenModels.registry['bird'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;
  const P = GardenModels.pose(a, t);
  const sway = P.sway * 0.05;
  const p = (dx, y, dz, w, h, d, col, tilt = 0) =>
    part(dx + sway, y * P.bodyY + P.lift, dz, w, h * P.bodyY, d, col, tilt + P.tilt);
  // 脖子接在躯干上的那个点，吃的时候头绕它转（绕 X 轴，矢状面）
  const NECK_Y = 0.72,
    NECK_Z = 0.08;
  // 头：鸟睡觉会把头缩进脖子里 —— 睡着时整个头往下沉，再眯起眼
  const hd = (dx, y, dz, w, h, d, col, tilt = 0, pitch = 0) => {
    const H = P.neckAt(y, dz, NECK_Y, NECK_Z);
    part(
      dx + sway,
      H.y * P.headY - P.headDrop * 1.6 + P.lift,
      H.z - (P.asleep ? 0.05 : 0),
      w * (P.asleep ? 0.9 : 1),
      h,
      d,
      col,
      tilt + P.tilt,
      H.pitch + pitch,
    );
  };
  const eye = (dx, y, dz, w, h, d, col) => {
    const H = P.neckAt(y, dz, NECK_Y, NECK_Z);
    part(
      dx + sway,
      H.y * P.headY - P.headDrop * 1.6 + P.lift,
      H.z,
      w,
      h * P.eyeH,
      d,
      col,
      P.tilt,
      H.pitch,
    );
  };

  p(0, 0.6, 0, 0.35, 0.3, 0.42, 0x709dad);
  hd(0, 0.79, 0.18, 0.28, 0.25, 0.28, 0x87b4c5);
  hd(0, 0.72, 0.39, 0.14, 0.09, 0.16, 0xe2ad60);
  eye(-0.145, 0.83, 0.24, 0.05, 0.05, 0.06, 0x283b40);
  eye(0.145, 0.83, 0.24, 0.05, 0.05, 0.06, 0x283b40);
  // 翅膀：站着小幅扇，睡着时贴住身体完全不动
  const flap = P.asleep || a.habit === 5 ? 0 : phase * 0.4;
  p(-0.3, 0.64, 0, 0.35, 0.1, 0.3, 0x436e83, flap);
  p(0.3, 0.64, 0, 0.35, 0.1, 0.3, 0x436e83, -flap);
  p(0, 0.55, -0.3, 0.19, 0.09, 0.3, 0x416f81);
};
