// 松鼠是站着的两足动物：两条后腿撑地、胸前抱着一对小前爪、大尾巴在身后拱过头顶。
GardenModels.registry['squirrel'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;
  const P = GardenModels.pose(a, t);
  const sway = P.sway * 0.05;
  // 躯干：睡着时整只压到贴地（大尾巴还立着，像一团毛球靠在身子后面）
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
  // 头/耳朵/吻：睡着时低下来；吃的时候绕脖子转（绕 X 轴，矢状面）
  const NECK_Y = 0.5,
    NECK_Z = 0.12;
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
      tilt + P.earTilt + P.tilt + H.pitch,
      pitch,
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

  // 两条后腿撑地：腿立着而不是横在身下，这是"站着"和"四足爬"的区别
  for (let side of [-1, 1]) {
    // 腿挂在胯上（y=0.185 处），绕胯前后摆
    const L = P.place(P.legGroup(side, side < 0), 0.185, 0.09, 0.15);
    part(side * 0.16, L.y, L.z, 0.14, L.len, 0.19, 0x8c673f, P.tilt, L.pitch);
  }
  p(0, 0.34, 0, 0.3, 0.39, 0.35, 0xa47a4e);
  hd(0, 0.56, 0.18, 0.28, 0.29, 0.26, 0xbc9161);
  hd(0, 0.32, 0.18, 0.19, 0.23, 0.09, 0xe4cba0);
  // 尾巴四节：站着时往上拱，睡着时往身前拢过来盖住爪子
  const curl = P.asleep ? -0.22 : 0;
  p(0, 0.53, -0.27 + curl, 0.25, 0.55, 0.25, 0xa0784c);
  p(0, 0.81, -0.3 + curl * 1.5, 0.25, 0.2, 0.28, 0xbb9161);
  for (let side of [-1, 1]) {
    hd(side * 0.1, 0.8, 0.13, 0.1, 0.22, 0.1, 0x9a7044);
    eye(side * 0.11, 0.61, 0.32, 0.05, 0.06, 0.03, 0x383b2f);
    // 一对小前爪：本来只有两条后腿、没有前肢，站着的时候胸前是空的，看着像四足爬
    // 走路时和后腿错开摆（一组前腿一组后腿），看着才像真的在走。
    // pitch 必须传下去：不传的话这对前爪是整块平移，看着像在往前滑而不是在迈步。
    // 腿长必须和后腿一样（0.15）：步长是按腿长算的、同一只动物只有一份，
    // 前爪用 0.13 的话会被甩到 55°。胯从 0.465 抬到 0.485，是为了让爪子落点不变。
    // 前爪跟身子走，不是头的部件 —— 用 p() 而不是 hd()。
    // 之前画在 hd() 里，「低头吃」的时候爪子会跟着脑袋一起被拉下去。
    const F = P.place(P.legGroup(side, side > 0), 0.485, 0.33, 0.15);
    p(side * 0.09, F.y, F.z, 0.1, F.len, 0.12, 0xe4cba0, 0, F.pitch);
  }
  hd(0, 0.5, 0.34, 0.075, 0.05, 0.04, 0x594734);
};
