GardenModels.registry['fox-wolf'] = function ({ a, part: drawPart, phase, t, i }) {
  const wolf = a.type === 'wolf';
  // 灰狼（Canis lupus）和赤狐（Vulpes vulpes）是两个物种，不是同一个模型换个颜色。
  // 真实差别（成年个体）：
  //   灰狼 肩高 66–90cm、体长 100–150cm、30–50kg，身厚胸深、头相对身子小、腿粗
  //   赤狐 肩高 35–40cm、体长  65–75cm、 6–10kg，身细、头相对身子大
  // 所以赤狐只有灰狼七成左右（真实比值约 0.54，再小就看不清表情了）。
  // 一眼认出是狐狸的三个特征，按辨识度从高到低：
  //   1) 耳朵又高又尖 —— 狼的耳小而圆。这条最好认
  //   2) 吻部又长又尖 —— 狼的吻短而宽
  //   3) 尾巴蓬松到接近体长、尾尖白色 —— 赤狐尾长占体长约 57%，灰狼约 31%
  // 另外赤狐的小腿是深色的「黑袜子」，狼没有。
  //
  // 全部用具名字段而不是数组下标：下标容易把「哪一项是什么」搞混
  // （第一版把耳朵的 x 写成了 y*0.87，宽度直接从 0.40 炸到 1.51）。
  //
  // 体型按「胯高 − 腿长 = 脚落回地面」配对，两条腿的 hip 和 len 不能各自随手改，
  // 否则就是青蛙那种悬空/插地（见 docs/动作表.md 里的记录）。
  const S = wolf
    ? {
        body: { y: 0.45, w: 0.42, h: 0.33, d: 0.63 }, // 厚实
        leg: { hip: 0.37, len: 0.35, w: 0.105, d: 0.11, x: 0.14, z: 0.22 }, // 粗壮
        neck: { y: 0.52, z: 0.2 },
        head: { y: 0.57, z: 0.34, w: 0.35, h: 0.3, d: 0.32 }, // 头相对身子小
        muzzle: { y: 0.47, z: 0.5, w: 0.29, h: 0.15, d: 0.18 }, // 短而宽
        nose: { y: 0.5, z: 0.615, w: 0.075, h: 0.06, d: 0.045 },
        ear: { x: 0.13, y: 0.79, z: 0.34, w: 0.14, h: 0.17, d: 0.12, iw: 0.07, ih: 0.1, id: 0.03 },
        eye: { x: 0.13, y: 0.6, z: 0.49 },
        sock: 0x664d38,
        // 尾巴长而蓬，但不该和躯干一样长（原来两段加起来 0.645、躯干才 0.63）——
        // 真实灰狼尾长约占体长 31%。收一收，才看得出躯干本身有多粗。
        tail: [
          { mul: 1, y: 0.46, z: -0.5, w: 0.22, h: 0.24, d: 0.4 },
          { mul: 1.6, y: 0.49, z: -0.78, w: 0.2, h: 0.22, d: 0.2 },
        ],
      }
    : {
        // 躯干只有灰狼的七成半（0.47 / 0.63），整体明显小一圈
        body: { y: 0.39, w: 0.31, h: 0.25, d: 0.47 },
        // 0.28 − 0.26 = 0.02，脚正好落地
        leg: { hip: 0.28, len: 0.26, w: 0.075, d: 0.08, x: 0.105, z: 0.16 }, // 腿细
        neck: { y: 0.45, z: 0.15 },
        // 头相对身子大：0.26 / 0.47 ≈ 0.55，灰狼是 0.32 / 0.63 ≈ 0.51
        head: { y: 0.5, z: 0.26, w: 0.28, h: 0.24, d: 0.26 },
        muzzle: { y: 0.43, z: 0.41, w: 0.19, h: 0.12, d: 0.25 }, // 长而尖
        nose: { y: 0.41, z: 0.53, w: 0.065, h: 0.05, d: 0.04 },
        ear: { x: 0.095, y: 0.71, z: 0.24, w: 0.09, h: 0.25, d: 0.075, iw: 0.045, ih: 0.17, id: 0.03 },
        eye: { x: 0.1, y: 0.53, z: 0.38 },
        sock: 0x3a2f26, // 赤狐小腿是深色的「黑袜子」
        // 尾巴蓬到接近躯干长度（0.485 / 0.47），比灰狼（0.455 / 0.63）明显夸张 ——
        // 赤狐尾长约占体长 57%，灰狼约 31%。这是「像狐狸」最直观的一条。
        tail: [
          { mul: 1, y: 0.33, z: -0.38, w: 0.18, h: 0.21, d: 0.38 },
          { mul: 1.6, y: 0.35, z: -0.62, w: 0.16, h: 0.19, d: 0.2 },
        ],
      };
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
    drawPart(...args);
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
  const hd = (dx, y, dz, w, h, d, col, tilt = 0, pitch = 0) => {
    const H = P.neckAt(y, dz, S.neck.y, S.neck.z);
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
    const H = P.neckAt(y, dz, S.neck.y, S.neck.z);
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

  p(0, S.body.y, 0, S.body.w, S.body.h, S.body.d, 0xc47c40);
  hd(0, S.head.y, S.head.z, S.head.w, S.head.h, S.head.d, 0xda9552);
  hd(0, S.muzzle.y, S.muzzle.z, S.muzzle.w, S.muzzle.h, S.muzzle.d, 0xf2dfb7);
  hd(0, S.nose.y, S.nose.z, S.nose.w, S.nose.h, S.nose.d, 0x3a4138);
  for (let side of [-1, 1]) {
    const E = S.ear;
    hd(side * E.x, E.y, E.z, E.w, E.h, E.d, 0xb56e35);
    hd(side * E.x, E.y, E.z + E.d * 0.5, E.iw, E.ih, E.id, 0xe7c79c);
    eye(side * S.eye.x, S.eye.y, S.eye.z, 0.055, 0.06, 0.035, 0x353e33);
    for (let dz of [-S.leg.z, S.leg.z]) {
      // 腿挂在胯上，绕胯前后摆
      const L = P.place(P.legGroup(side, dz > 0), S.leg.hip, dz, S.leg.len);
      lg(side * S.leg.x, L.y, L.z, S.leg.w, L.len, S.leg.d, S.sock, L.pitch);
    }
  }
  // 大尾巴：走着左右摇，睡着垂到地上。mul>1 的是尾尖，狼和狐狸都是白的
  const wag = P.walk ? Math.sin(a.phase * 3.1) * 0.16 : 0;
  for (const seg of S.tail)
    p(wag * seg.mul, seg.y, seg.z, seg.w, seg.h, seg.d, seg.mul > 1 ? 0xf1e1bd : 0xd59551);
};
