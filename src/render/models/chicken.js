GardenModels.registry['chicken'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;
  const P = GardenModels.pose(a, t);
  const sway = P.sway * 0.05;
  const p = (dx, y, dz, w, h, d, col, tilt = 0) =>
    part(dx + sway, y * P.bodyY + P.lift, dz, w, h * P.bodyY, d, col, tilt + P.tilt);
  // 脖子接在躯干上的那个点，吃的时候头绕它转（绕 X 轴，矢状面）
  const NECK_Y = 0.5,
    NECK_Z = 0.1;
  const hd = (dx, y, dz, w, h, d, col, tilt = 0, pitch = 0) => {
    const H = P.neckAt(y, dz, NECK_Y, NECK_Z);
    part(
      dx + sway,
      H.y * P.headY - P.headDrop + P.lift,
      H.z,
      w,
      h,
      d,
      col,
      tilt + P.earTilt + P.tilt,
      H.pitch + pitch,
    );
  };
  const eye = (dx, y, dz, w, h, d, col) => {
    const H = P.neckAt(y, dz, NECK_Y, NECK_Z);
    part(
      dx + sway,
      H.y * P.headY - P.headDrop + P.lift,
      H.z,
      w,
      h * P.eyeH,
      d,
      col,
      P.tilt,
      H.pitch,
    );
  };

  p(0, 0.36, 0, 0.43, 0.42, 0.46, 0xf3d786);
  hd(0, 0.63, 0.17, 0.3, 0.3, 0.29, 0xffe6a4);
  hd(0, 0.84, 0.18, 0.11, 0.16, 0.16, 0xc56e58);
  hd(0, 0.58, 0.38, 0.13, 0.08, 0.17, 0xd38d40);
  for (let side of [-1, 1]) {
    // 鸡单腿交替往前迈
    const L = P.place(P.legGroup(side, side > 0), 0.19, 0, 0.18);
    part(side * 0.11, L.y, L.z, 0.07, L.len, 0.16, 0xbc8744, P.tilt, L.pitch);
    eye(side * 0.13, 0.69, 0.31, 0.04, 0.055, 0.04, 0x414535);
    // 翅膀：睡着时收在身侧（不张开）
    p(side * 0.24, 0.42, -0.01, 0.12, 0.21, 0.3, 0xd9b76b, side * P.earTilt * 0.5);
  }
  p(0, 0.51, -0.3, 0.18, 0.3, 0.19, 0xe6c471);
};
