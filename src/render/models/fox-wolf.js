GardenModels.registry['fox-wolf'] = function ({ a, part: drawPart, phase, t, i }) {
  let wolf = a.type === 'wolf';
  const original = drawPart;
  const shade = (col) =>
    wolf
      ? {
          [0xc47c40]: 0x89938e,
          [0xda9552]: 0xa4aca5,
          [0xb56e35]: 0x69756f,
          [0xd59551]: 0x929f98,
          [0xf2dfb7]: 0xd7ddd2,
          [0xe7c79c]: 0xc6d0c2,
          [0xf1e1bd]: 0xd5dcd0,
          [0x664d38]: 0x505e58,
        }[col] || col
      : col;
  const part = (...args) => {
    args[6] = shade(args[6]);
    original(...args);
  };
  const P = GardenModels.pose(a, t),
    sway = P.sway * 0.05;
  // 躯干
  const p = (dx, y, dz, w, h, d, col, tilt = 0) =>
    part(dx + sway, y * P.bodyY + P.lift, dz, w, h * P.bodyY, d, col, tilt + P.tilt);
  // 腿：睡着收进肚子底下，走路前后摆、抬起的那只离地
  const lg = (dx, y, dz, w, h, d, col, pitch = 0) =>
    part(dx + sway, y, dz, w, h, d, col, P.tilt, pitch);
  // 脖子接在躯干上的那个点，吃的时候头绕它转（绕 X 轴，矢状面）
  const NECK_Y = 0.52,
    NECK_Z = 0.2;
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

  p(0, 0.44, 0, 0.4, 0.31, 0.63, 0xc47c40);
  hd(0, 0.57, 0.34, 0.35, 0.3, 0.32, 0xda9552);
  hd(0, 0.47, 0.51, 0.27, 0.14, 0.21, 0xf2dfb7);
  hd(0, 0.5, 0.635, 0.075, 0.06, 0.045, 0x3a4138);
  for (let side of [-1, 1]) {
    hd(side * 0.12, 0.79, 0.34, 0.12, 0.23, 0.12, 0xb56e35);
    hd(side * 0.12, 0.79, 0.41, 0.06, 0.13, 0.03, 0xe7c79c);
    eye(side * 0.13, 0.6, 0.503, 0.055, 0.06, 0.035, 0x353e33);
    for (let dz of [-0.22, 0.22]) {
      // 腿挂在胯上（y=0.37 处），绕胯前后摆
      const L = P.place(P.legGroup(side, dz > 0), 0.37, dz, 0.35);
      lg(side * 0.14, L.y, L.z, 0.095, L.len, 0.1, 0x664d38, L.pitch);
    }
  }
  // 大尾巴：走着左右摇，睡着垂到地上
  const wag = P.walk ? Math.sin(a.phase * 3.1) * 0.16 : 0;
  p(wag, 0.48, -0.56, 0.25, 0.25, 0.54, 0xd59551);
  p(wag * 1.6, 0.51, -0.87, 0.23, 0.24, 0.23, 0xf1e1bd);
};
