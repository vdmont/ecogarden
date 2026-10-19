GardenModels.registry['bird'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;
  const P = GardenModels.pose(a, t);
  const sway = P.sway * 0.05;
  const p = (dx, y, dz, w, h, d, col, tilt = 0) =>
    part(dx + sway, y * P.bodyY + P.lift + P.flyLift, dz, w, h * P.bodyY, d, col, tilt + P.tilt);
  // 脖子接在躯干上的那个点，吃的时候头绕它转（绕 X 轴，矢状面）
  const NECK_Y = 0.72,
    NECK_Z = 0.08;
  // 头 = 一个刚体：头、喙、两只眼睛全部走它。
  //
  // 鸟睡觉会把头缩进脖子里 —— 那是**整个头**一起往后缩一点、宽度收一点，
  // 所以这两个数放在 opt 里（整头统一生效），不是写在某个部件上。
  // 以前这里是 `H.z - (P.asleep ? 0.05 : 0)` 只写在 hd() 上、eye() 上漏了，
  // 于是头往后缩了、眼睛没缩 —— 又是「头和眼睛各走各的」。
  const HEAD = P.headFrame(drawPart, NECK_Y, NECK_Z, {
    sway: P.sway * 0.05,
    sleepDrop: 1.6,
    sleepZ: -0.05,
    sleepW: 0.9,
  });
  const hd = (...a) => HEAD.draw(...a);
  const eye = (dx, y, dz, w, h, d, col) => HEAD.drawEye(dx, y, dz, w, h, d, col);

  p(0, 0.6, 0, 0.35, 0.3, 0.42, 0x709dad);
  hd(0, 0.79, 0.18, 0.28, 0.25, 0.28, 0x87b4c5);
  hd(0, 0.72, 0.39, 0.14, 0.09, 0.16, 0xe2ad60);
  eye(-0.145, 0.83, 0.24, 0.05, 0.05, 0.06, 0x283b40);
  eye(0.145, 0.83, 0.24, 0.05, 0.05, 0.06, 0x283b40);
  // 翅膀：扑翼角度统一由 pose() 给（P.flap）—— 站着小幅慢扇，飞起来大幅快扇，
  // 睡着时是 0（贴住身体完全不动）。习惯 5「停在旁边」时翅膀僵住。
  const flap = a.habit === 5 ? 0 : P.flap;
  p(-0.3, 0.64, 0, 0.35, 0.1, 0.3, 0x436e83, flap);
  p(0.3, 0.64, 0, 0.35, 0.1, 0.3, 0x436e83, -flap);
  p(0, 0.55, -0.3, 0.19, 0.09, 0.3, 0x416f81);
};
