// Shared silhouettes with species-specific markings; all coordinates use the animal's local frame.
for (const [type, [name, kind, color]] of Object.entries(EcoData.VISITORS))
  GardenModels.registry[type] = function ({ a, part, phase }) {
    const scale = a.age < 0 ? 0.68 : 1,
      rest = a.sleep > 0 || a.habit === 2 ? 0.62 : a.habit === 4 ? 0.55 : 1;
    const p = (x, y, z, w, h, d, c, tilt = 0) =>
      part(x * scale, y * scale * rest, z * scale, w * scale, h * scale, d * scale, c, tilt);
    const eye = (y, z) => {
      for (const side of [-1, 1])
        p(side * 0.115, y, z, 0.045, 0.05, 0.035, type === 'ragdoll' ? 0x609dc1 : 0x253633);
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
      if (tall) {
        for (const x of [-0.09, 0.09]) p(x, 0.4, 0, 0.035, 0.65, 0.035, 0xaa806b);
        p(0, y + 0.25, 0.19, 0.09, 0.4, 0.09, color);
      }
      const hy = y + (tall ? 0.48 : 0.22);
      p(0, hy, 0.23, 0.25, 0.23, 0.24, color);
      p(
        0,
        hy - 0.04,
        0.4,
        0.09,
        0.065,
        tall ? 0.22 : 0.13,
        type === 'flamingo' ? 0x343c37 : 0xd4af69,
      );
      eye(hy + 0.02, 0.355);
      for (const side of [-1, 1])
        p(
          side * 0.21,
          y + 0.03,
          0,
          0.14,
          0.18,
          0.31,
          type === 'longtail' ? 0x65695e : color,
          side * (a.habit === 5 ? 0 : phase * 0.08),
        );
      return;
    }
    if (kind === 'dragon') {
      for (let j = 0; j < 6; j++) {
        const z = a.habit === 6 ? Math.cos(j * 0.8) * 0.38 : 0.35 - j * 0.22;
        p(
          a.habit === 6 ? Math.sin(j * 0.8) * 0.38 : Math.sin(j * 0.7) * 0.12,
          0.55 + j * 0.025,
          z,
          0.34 - j * 0.025,
          0.31,
          0.29,
          color,
        );
        if (j > 0) p(0, 0.76 + j * 0.025, z, 0.09, 0.13, 0.1, 0xd4ba75);
      }
      p(0, 0.88, 0.46, 0.42, 0.36, 0.38, color);
      p(0, 0.77, 0.73, 0.31, 0.16, 0.3, 0xc9c6a0);
      eye(0.94, 0.66);
      for (const side of [-1, 1]) {
        p(side * 0.16, 1.16, 0.4, 0.07, 0.28, 0.08, 0xd4ba75);
        p(side * 0.29, 0.4, 0.1, 0.16, 0.23, 0.14, color);
        p(side * 0.24, 0.4, -0.5, 0.13, 0.2, 0.13, color);
        p(side * 0.25, 0.78, 0.75, 0.23, 0.035, 0.035, 0xe4d5ac);
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
      for (const z of [-0.23, 0.23]) p(x, 0.17, z, 0.11, 0.3, 0.12, color);
    const hy = capy ? 0.57 : 0.76,
      hz = 0.34;
    p(0, hy, hz, capy ? 0.4 : 0.37, 0.33, capy ? 0.44 : 0.33, color);
    p(0, hy - 0.08, hz + 0.21, 0.23, 0.15, capy ? 0.26 : 0.16, capy ? color : 0xe8dcc5);
    eye(hy + 0.03, hz + 0.18);
    p(0, hy - 0.04, hz + (capy ? 0.36 : 0.31), 0.07, 0.05, 0.035, 0x41433b);
    for (const side of [-1, 1])
      p(
        side * 0.14,
        hy + (cat || myth ? 0.24 : 0.13),
        hz - 0.04,
        cat ? 0.1 : 0.13,
        cat || myth ? 0.2 : 0.17,
        0.12,
        type === 'ragdoll' ? 0x746b63 : color,
      );
    if (!capy) p(0.08, 0.55, -0.49, 0.1, cat ? 0.46 : 0.23, 0.12, color, Math.sin(phase) * 0.08);
    if (type === 'tabby' || type === 'orangeCat')
      for (let j = 0; j < 3; j++)
        p(
          0,
          0.45 + body / 2 + 0.006,
          -0.22 + j * 0.18,
          0.48,
          0.025,
          0.045,
          type === 'tabby' ? 0x494b40 : 0xb77a42,
        );
    if (type === 'borderCollie') {
      p(0, 0.69, 0.12, 0.3, 0.13, 0.25, 0xf0ebdf);
      p(0, hy + 0.04, hz + 0.175, 0.09, 0.26, 0.018, 0xf0ebdf);
    }
    if (fluffy) p(0, 0.54, 0.22, 0.54, 0.35, 0.22, 0xf1eee1);
    if (myth) {
      for (const side of [-1, 1]) {
        p(side * 0.13, 1.08, 0.27, 0.07, 0.27, 0.08, 0xd0af70);
        p(side * 0.32, 0.6, -0.04, 0.22, 0.13, 0.4, type === 'pixiu' ? 0xe3c989 : 0xc4d9cd);
      }
      p(0, 0.98, 0.37, 0.09, 0.08, 0.07, 0x82b5aa);
    }
  };
