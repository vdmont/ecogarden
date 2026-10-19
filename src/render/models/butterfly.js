GardenModels.registry['butterfly'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;
  const P = GardenModels.pose(a, t);
  // 悬停的上下起伏。吃（停在花上吸蜜）时不动 —— 吸蜜要停住才说得通。
  // 飞起来（a.flying）再往上抬一截，那才是离开了花。
  const lift =
      (P.asleep ? 0.03 : P.eat ? 0.02 : Math.abs(Math.sin(t * 0.0018)) * 0.05 + 0.02) +
      P.flyLift,
    // 翅膀：吃的时候停住（吸蜜不扇翅）；扑翼角度统一由 pose() 给
    flap = P.eat ? 0 : P.flap,
    // 睡觉 = 翅膀从「平铺」改成「竖起来」，绕前后轴转 1.35 弧度（约 77°），
    // 两片收在身子两侧，深色的身子从中间露出来。
    //
    // 以前是「把两片翅膀往中间挪」，可翅膀是 0.38 宽、0.09 厚的平铺板子，
    // 两片一叠就是一整块粉色的板，把身子整个盖住 —— 远看就是一个粉色方块，
    // 完全不像蝴蝶。真实的蝴蝶停在叶子上时翅膀是竖起来合拢的，
    // 整个剪影是「窄而高」的一竖条，不是「宽而扁」的一块。
    fold = P.asleep ? 1.35 : 0;
  const p = (dx, y, dz, w, h, d, col, tilt = 0) =>
    part(dx, y * P.bodyY + lift, dz, w, h * P.bodyY, d, col, tilt + P.tilt);
  // 身子：睡着时往下沉一截，腹部才能从合拢的翅膀底下露出来
  p(0, P.asleep ? 0.58 : 0.65, 0, 0.075, 0.2, 0.3, 0x71536d);
  for (let side of [-1, 1]) {
    // 前翅：醒着平铺在两侧扇动，睡着竖起来收在身子边上（留出中间的缝露出身子）
    p(
      side * (P.asleep ? 0.12 : 0.24),
      0.72,
      0,
      0.38,
      0.09,
      0.4,
      0xd596c1,
      side * (P.asleep ? fold : flap),
    );
    // 后翅：跟着一起立起来，位置低一点、靠后一点，从前翅后面露出来
    p(
      side * (P.asleep ? 0.085 : 0.17),
      P.asleep ? 0.64 : 0.62,
      -0.24,
      0.22,
      0.07,
      0.25,
      0xb775a5,
      side * (P.asleep ? fold * 0.9 : 0),
    );
  }
};
