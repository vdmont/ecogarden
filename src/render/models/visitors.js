// Shared silhouettes with species-specific markings; all coordinates use the animal's local frame.
for (const [type, [name, kind, color]] of Object.entries(EcoData.VISITORS))
  GardenModels.registry[type] = function ({ a, part, phase, t }) {
    const P = GardenModels.pose(a, t);
    const scale = 1; // 幼崽缩放统一在 GardenModels.animals 里做
    ((rest = a.habit === 2 ? 0.62 : a.habit === 4 ? 0.55 : 1), // 晒太阳压低 / 泡水半沉
      (sway = P.sway * 0.05),
      (wide = type === 'abyssinian' ? 0.76 : 1));
    // 躯干
    const p = (x, y, z, w, h, d, c, tilt = 0) =>
      part(
        (x + sway) * scale * wide,
        y * scale * rest * P.bodyY + (P.lift + P.flyLift) * scale,
        z * scale,
        w * scale * wide,
        h * scale * rest * P.bodyY,
        d * scale,
        c,
        tilt + P.tilt,
      );
    // 腿：睡着收进肚子底下，走路前后摆、抬起的那只离地
    const lg = (x, y, z, w, h, d, c, pitch = 0) =>
      part(
        (x + sway) * scale * wide,
        y,
        z * scale,
        w * scale * wide,
        h,
        d * scale,
        c,
        P.tilt,
        pitch,
      );
    // 头：睡着时低下来枕着；吃的时候绕脖子转（绕 X 轴，矢状面），不是整块往下挪。
    // 连接点按 kind 分别给（有的脖子长有的短），性质和腿的胯高一样。
    let neckY = 0.66,
      neckZ = 0.2;
    const hd = (x, y, z, w, h, d, c, tilt = 0, pitch = 0) => {
      const H = P.neckAt(y, z, neckY, neckZ);
      part(
        (x + sway) * scale * wide,
        (H.y * P.headY - P.headDrop) * scale * rest + P.lift * scale,
        H.z * scale,
        w * scale * wide,
        h * scale,
        d * scale,
        c,
        tilt + P.earTilt + P.tilt,
        H.pitch + pitch,
      );
    };
    const eye = (y, z) => {
      for (const side of [-1, 1])
        hd(
          side * 0.115,
          y,
          z,
          0.045,
          0.05 * P.eyeH,
          0.035,
          type === 'ragdoll' ? 0x609dc1 : 0x253633,
        );
    };
    if (kind === 'bird') {
      const tall = type === 'flamingo' || type === 'nightHeron',
        y = tall ? 0.95 : 0.54;
      p(0, y, 0, 0.34, 0.32, 0.48, color);
      p(
        0,
        y + 0.06,
        -0.28,
        0.17,
        0.08,
        type === 'longtail' ? 0.5 : 0.24,
        type === 'redstart' ? 0xc96b45 : color,
      );
      if (tall)
        for (const x of [-0.09, 0.09]) {
          const L = P.place(P.legGroup(x < 0 ? -1 : 1, true), 0.72, 0, 0.65);
          lg(x, L.y, L.z, 0.035, L.len, 0.035, 0xaa806b, L.pitch);
        }
      if (tall) p(0, y + 0.25, 0.19, 0.09, 0.4, 0.09, color);
      neckY = tall ? 1.02 : 0.7; // 高脚鸟脖子长，连接点就高
      neckZ = 0.1;
      const hy = y + (tall ? 0.48 : 0.22);
      // 鸟睡觉缩脖子：头往下沉
      hd(0, hy, 0.23, 0.25, 0.23, 0.24, color);
      hd(
        0,
        hy - 0.04,
        0.4,
        0.09,
        0.065,
        tall ? 0.22 : 0.13,
        type === 'flamingo' ? 0x343c37 : 0xd4af69,
      );
      eye(hy + 0.02, 0.355);
      for (const side of [-1, 1]) {
        // 扑翼角度统一由 pose() 给（P.flap）；习惯 5「停在旁边」时翅膀僵住
        const flap = a.habit === 5 ? 0 : P.flap;
        p(
          side * 0.21,
          y + 0.03,
          0,
          0.14,
          0.18,
          0.31,
          type === 'longtail' ? 0x65695e : color,
          side * flap,
        );
      }
      return;
    }
    if (kind === 'dragon') {
      neckY = 0.7;
      neckZ = 0.2;
      for (let j = 0; j < 6; j++) {
        const z = a.habit === 6 ? Math.cos(j * 0.8) * 0.38 : 0.35 - j * 0.22;
        p(
          a.habit === 6 ? Math.sin(j * 0.8) * 0.38 : Math.sin(j * 0.7) * 0.12,
          (0.55 + j * 0.025) * P.bodyY + P.lift,
          z,
          0.34 - j * 0.025,
          0.31 * P.bodyY,
          0.29,
          color,
        );
        if (j > 0) p(0, 0.76 + j * 0.025, z, 0.09, 0.13 * P.bodyY, 0.1, 0xd4ba75);
      }
      hd(0, 0.88, 0.46, 0.42, 0.36, 0.38, color);
      hd(0, 0.77, 0.73, 0.31, 0.16, 0.3, 0xc9c6a0);
      eye(0.94, 0.66);
      for (const side of [-1, 1]) {
        hd(side * 0.16, 1.16, 0.4, 0.07, 0.28, 0.08, 0xd4ba75);
        // 前后腿必须用同一个腿长：步长是按腿长算的、同一只动物只有一份，
        // 两边不一样的话后腿会被甩得更狠（实测 54° vs 45°）而且和前腿走岔。
        // 胯从 0.5 抬到 0.53，是为了让脚仍然落在原来那个高度（0.30），别把造型改了。
        const f = P.place(P.legGroup(side, true), 0.515, 0.1, 0.23),
          b = P.place(P.legGroup(side, false), 0.53, -0.5, 0.23);
        lg(side * 0.29, f.y, f.z, 0.16, f.len, 0.14, color, f.pitch);
        lg(side * 0.24, b.y, b.z, 0.13, b.len, 0.13, color, b.pitch);
        hd(side * 0.25, 0.78, 0.75, 0.23, 0.035, 0.035, 0xe4d5ac);
      }
      return;
    }
    const cat = kind === 'cat',
      dog = kind === 'dog',
      capy = kind === 'capy',
      myth = kind === 'myth',
      fluffy = ['ragdoll', 'samoyed', 'baize'].includes(type),
      body = fluffy ? 0.58 : 0.46;
    p(0, 0.45, 0, 0.48, body, 0.66, color);
    for (const x of [-0.16, 0.16])
      for (const z of [-0.23, 0.23]) {
        // 腿挂在胯上（y=0.32 处），绕胯前后摆
        const L = P.place(P.legGroup(x < 0 ? -1 : 1, z > 0), 0.32, z, 0.3);
        lg(x, L.y, L.z, 0.11, L.len, 0.12, color, L.pitch);
      }
    const hy = capy ? 0.57 : cat ? 0.82 : 0.76,
      hz = 0.34;
    neckY = capy ? 0.62 : 0.66; // 卡皮巴拉身子矮，脖子接得也低
    neckZ = 0.2;
    hd(0, hy, hz, capy ? 0.4 : 0.37, 0.33, capy ? 0.44 : 0.33, color);
    hd(
      0,
      hy - 0.08,
      hz + (cat ? 0.165 : 0.21),
      cat ? 0.21 : 0.23,
      cat ? 0.1 : 0.15,
      capy ? 0.26 : cat ? 0.055 : 0.16,
      capy ? color : cat ? 0xe8dcc5 : 0xf2eee6,
    );
    // 卡皮巴拉的头更深（d=0.44，前面在 z=0.56），眼睛原来的 z=0.52 整个埋在头里面 ——
    // 看上去就是「卡皮巴拉没有眼睛」。所以它的眼睛要单独往前挪到头面外面。
    eye(hy + 0.03, hz + (capy ? 0.24 : 0.18));
    hd(0, hy - 0.04, hz + (capy ? 0.36 : cat ? 0.205 : 0.31), 0.07, 0.05, 0.035, 0x41433b);
    for (const side of [-1, 1]) {
      if (cat) {
        for (let tier = 0; tier < 4; tier++) {
          const width = 0.16 - tier * 0.038;
          hd(
            side * 0.135,
            hy + 0.19 + tier * 0.047,
            hz - 0.015,
            width,
            0.052,
            0.11,
            type === 'ragdoll' ? 0x746b63 : color,
          );
          if (tier < 3)
            hd(
              side * 0.135,
              hy + 0.19 + tier * 0.047,
              hz + 0.043,
              width * 0.5,
              0.04,
              0.012,
              0xd4a093,
            );
        }
        for (let dy of [-0.025, 0.025])
          hd(side * 0.215, hy - 0.055 + dy, hz + 0.18, 0.12, 0.015, 0.02, 0xeee4cc);
      } else
        hd(side * 0.14, hy + (myth ? 0.24 : 0.13), hz - 0.04, 0.13, myth ? 0.2 : 0.17, 0.12, color);
    }
    // 尾巴：走着左右摇，睡着垂到地上。
    const wag = P.walk ? Math.sin(a.phase * 3.1) * 0.12 : 0;
    // 追蝴蝶（习惯 1）时猫把尾巴整个竖起来 —— 竖尾巴的猫一眼就是「锁定猎物了」，
    // 不管它在不在走都成立；跟随羊群（习惯 3）时狗把尾巴翘起来、摇得更欢。
    // 这两个习惯以前渲染层根本收不到（模拟只在 rest 时才写 a.habit），现在收到了。
    const chase = a.habit === 1,
      follow = a.habit === 3;
    if (!capy) {
      // 三条姿态共用同一根尾巴：z 和厚度都一样，只有高度/长度不同。
      // 这样「追蝴蝶 → 平常 → 跟随羊群」之间切换时是尾巴抬起来，不是换了一根。
      // z=−0.34、厚 0.18：躯干 d=0.66 居中，后缘在 z=−0.33，所以尾巴前端埋进去
      // 0.08 格、后端伸出 0.10 格。之前 z=−0.49、厚 0.12，前端只到 −0.43，
      // 中间空 0.10 格，侧视角下就是「屁股后面贴了块浮板」。
      if (chase)
        p(0, 0.6 * P.bodyY + P.lift, -0.34, 0.1, 0.54 * P.bodyY, 0.18, color);
      else if (follow)
        p(Math.sin(a.phase * 5.2) * 0.15, 0.58 * P.bodyY + P.lift, -0.34, 0.1, 0.46 * P.bodyY, 0.18, color);
      else
        p(wag, 0.55 * P.bodyY + P.lift, -0.34, 0.1, (cat ? 0.46 : 0.23) * P.bodyY, 0.18, color);
    }
    if (type === 'tabby' || type === 'orangeCat')
      for (let j = 0; j < 3; j++)
        p(
          0,
          0.45 + (body / 2) * P.bodyY + 0.006,
          -0.22 + j * 0.18,
          0.48,
          0.025,
          0.045,
          type === 'tabby' ? 0x494b40 : 0xb77a42,
        );
    if (type === 'borderCollie') {
      p(0, 0.69, 0.12, 0.3, 0.13, 0.25, 0xf0ebdf);
      hd(0, hy + 0.04, hz + 0.175, 0.09, 0.26, 0.018, 0xf0ebdf);
    }
    if (fluffy) p(0, 0.54, 0.22, 0.54, 0.35, 0.22, 0xf1eee1);
    if (myth) {
      for (const side of [-1, 1]) {
        hd(side * 0.13, 1.08, 0.27, 0.07, 0.27, 0.08, 0xd0af70);
        // 翅膀在身后、贴着身侧，跟着身子走而不是跟着头：之前画在 hd() 里，
        // 「低头吃」的时候翅膀会被一起拉到脑袋的高度。
        p(side * 0.32, 0.6, -0.04, 0.22, 0.13, 0.4, type === 'pixiu' ? 0xe3c989 : 0xc4d9cd);
      }
      hd(0, 0.98, 0.37, 0.09, 0.08, 0.07, 0x82b5aa);
    }
  };
