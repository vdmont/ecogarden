GardenModels.registry['hedgehog'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;
  const P = GardenModels.pose(a, t);
  const sway = P.sway * 0.04;
  const p = (dx, y, dz, w, h, d, col, tilt = 0) =>
    part((dx + sway) * 1, y * P.bodyY + P.lift, dz, w, h * P.bodyY, d, col, tilt + P.tilt);
  // 脖子接在躯干上的那个点，吃的时候脸绕它转（绕 X 轴，矢状面）
  const NECK_Y = 0.4,
    NECK_Z = 0.16;
  const HEAD = P.headFrame(drawPart, NECK_Y, NECK_Z, { sway: P.sway * 0.04 });
  const face = (...a) => HEAD.draw(...a);
  const eye = (dx, y, dz, w, h, d, col) => HEAD.drawEye(dx, y, dz, w, h, d, col);

  p(0, 0.27, -0.04, 0.49, 0.35, 0.52, 0x90775a);
  for (let dz of [-0.2, 0, 0.2])
    for (let dx of [-0.18, 0, 0.18])
      p(dx, 0.48 + (0.2 - Math.abs(dx)) * 0.25, dz - 0.08, 0.1, 0.16, 0.11, 0xd0bd97, 0.18);
  face(0, 0.23, 0.29, 0.29, 0.21, 0.23, 0xc8b28b);
  face(0, 0.21, 0.44, 0.11, 0.08, 0.1, 0x443f34);
  for (let side of [-1, 1])
    // 眼睛原来在 z=0.37，而脸盒（face(0, 0.23, 0.29, 0.29, 0.21, 0.23)）深 0.23，
    // 前面在 z=0.405 —— 眼睛整个埋在里面，看上去就是「刺猬没有眼睛」。
    // 放到 0.41，让它露出脸面（和卡皮巴拉同一个毛病、同一个修法）。
    eye(side * 0.1, 0.29, 0.41, 0.045, 0.045, 0.04, 0x333b30);
  // 刺猬是四足，前后各一对。之前只画了一对、而且两条都摆在身体中段（dz=0），
  // 走起路来是两脚交替，怎么看都不像刺猬。躯干 d=0.52 居中在 z=−0.04
  // （也就是 z 从 −0.30 到 0.22），所以前腿摆在 z=0.10、后腿摆在 z=−0.18。
  // legGroup(side, front) 自动把「前左+后右」「前右+后左」分成两组，对角同步。
  for (let dx of [-0.19, 0.19])
    for (let dz of [0.1, -0.18]) {
      // 腿短，睡着了整只往下一缩、腿基本收进肚子底下（P.place 自己按 asleep 处理）
      const L = P.place(P.legGroup(dx < 0 ? -1 : 1, dz > 0), 0.155, dz, 0.13);
      part(dx, L.y, L.z, 0.1, L.len, 0.12, 0x68533e, P.tilt, L.pitch);
    }
};
