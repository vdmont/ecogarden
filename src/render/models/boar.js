GardenModels.registry['boar'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;
  const P = GardenModels.pose(a, t);
  const sway = P.sway * 0.04;
  const p = (dx, y, dz, w, h, d, col, tilt = 0) =>
    part(dx + sway, y * P.bodyY + P.lift, dz, w, h * P.bodyY, d, col, tilt + P.tilt);
  // 脖子接在躯干上的那个点，吃的时候头绕它转（绕 X 轴，矢状面）
  const NECK_Y = 0.6,
    NECK_Z = 0.28;
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
      P.earTilt + P.tilt,
      H.pitch,
    );
  };

  p(0, 0.44, -0.04, 0.62, 0.46, 0.79, 0x8e7661);
  hd(0, 0.5, 0.43, 0.49, 0.37, 0.4, 0xa58a6e);
  hd(0, 0.41, 0.69, 0.32, 0.2, 0.2, 0xbc9d7b);
  for (let dz of [-0.2, 0, 0.2]) p(0, 0.72, dz, 0.12, 0.2, 0.16, 0x5a5145);
  for (let side of [-1, 1]) {
    hd(side * 0.22, 0.75, 0.4, 0.15, 0.22, 0.14, 0x786453);
    eye(side * 0.18, 0.56, 0.64, 0.055, 0.06, 0.035, 0x333c32);
    // 獠牙：睡着时也露着，只是整体往下沉
    hd(side * 0.2, 0.33, 0.68, 0.065, 0.18, 0.06, 0xf2e5c8);
    hd(side * 0.08, 0.43, 0.805, 0.04, 0.045, 0.03, 0x6c5443);
    for (let dz of [-0.28, 0.28]) {
      // 腿挂在胯上（y=0.33 处），绕胯前后摆
      const L = P.place(P.legGroup(side, dz > 0), 0.33, dz, 0.3);
      part(side * 0.23, L.y, L.z, 0.14, L.len, 0.15, 0x665747, P.tilt, L.pitch);
    }
  }
};
