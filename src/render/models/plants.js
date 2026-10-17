globalThis.GardenModels = globalThis.GardenModels || {};
GardenModels.plants = function ({ b, c, i, x, z, variant, wet, labelList }) {
  const box = b;
  if (c.plant === 'seed') {
    b(x, 0.15, z, 0.21, 0.17, 0.22, 0xb77540);
    b(x - 0.13, 0.31, z, 0.22, 0.125, 0.14, 0x8ccc6a, 0, 0.2);
    b(x + 0.11, 0.41, z, 0.18, 0.125, 0.14, 0x64a45a, 0, -0.2);
    labelList.push([i, '种', 0xb8d386, 0.6]);
  }
  if (c.plant === 'grass') {
    b(x, 0.11, z, 1, 0.1, 1, wet ? 0x719b55 : 0x8ca864);
    if (c.animal?.type !== 'bug')
      for (let k = 0; k < 2 + (variant % 3); k++)
        b(
          x + (k - 1) * 0.2,
          0.18 + variant * 0.008,
          z + (k % 2) * 0.18 - 0.09,
          0.11,
          0.19 + variant * 0.016,
          0.11,
          GardenPalette.leaves[variant][1],
        );
  }
  if (c.plant === 'flower') {
    b(x, 0.09, z, 0.75, 0.1, 0.75, 0x83a55e);
    b(x, 0.3, z, 0.125, 0.45, 0.125, 0x4e8847);
    for (let [dx, dz] of [
      [-0.15, 0],
      [0.15, 0],
      [0, 0.15],
      [0, -0.15],
    ])
      b(x + dx, 0.54, z + dz, 0.22, 0.14, 0.22, GardenPalette.flowers[variant]);
    b(x, 0.63, z, 0.14, 0.1, 0.14, 0xba804a);
  }
  if (c.plant === 'tree') {
    const base = box;
    const b = (dx, y, dz, w, h, d, col) => {
      const scale = 0.88 + variant * 0.06;
      const color = [0x609252, 0x78a75c, 0x6f9e53, 0x8bb965, 0x87b162, 0x65934d].includes(col)
        ? GardenPalette.leaves[variant][y > 1.5 ? 1 : 0]
        : col;
      base(dx, y * scale, dz, w * (variant === 1 ? 0.82 : 1), h * scale, d, col);
    };
    if (variant === 1) {
      b(x, 0.55, z, 0.2, 1.1, 0.2, 0x7f5c42);
      for (let k = 0; k < 4; k++)
        b(x, 0.85 + k * 0.36, z, 1.1 - k * 0.22, 0.29, 1.1 - k * 0.22, k % 2 ? 0x8bb965 : 0x609252);
      return;
    }
    if (variant === 3) {
      b(x, 0.6, z, 0.23, 1.2, 0.23, 0x7f5c42);
      for (const [dx, dz, y] of [
        [-0.35, 0, 1.15],
        [0.35, 0, 1.18],
        [0, -0.33, 1.33],
        [0, 0.33, 1.36],
        [0, 0, 1.66],
      ])
        b(x + dx, y, z + dz, 0.69, 0.4, 0.65, y > 1.5 ? 0x8bb965 : 0x609252);
      return;
    }
    b(x, 0.58, z, 0.25, 1.1, 0.25, 0x7f5c42);
    b(x - 0.2, 0.9, z, 0.5, 0.18, 0.18, 0x8c6a45);
    b(x + 0.15, 1.12, z + 0.05, 0.18, 0.36, 0.16, 0x8c6a45);
    for (let [dx, dy, dz, w, h, d, col] of [
      [0, 1.25, 0, 1.05, 0.52, 0.95, 0x609252],
      [-0.32, 1.56, 0.03, 0.66, 0.42, 0.7, 0x78a75c],
      [0.31, 1.53, -0.18, 0.64, 0.52, 0.67, 0x6f9e53],
      [0, 1.87, -0.02, 0.71, 0.39, 0.66, 0x8bb965],
      [0.1, 1.49, 0.37, 0.7, 0.39, 0.5, 0x87b162],
      [-0.34, 1.22, -0.32, 0.46, 0.36, 0.51, 0x65934d],
    ])
      b(x + dx, dy, z + dz, w, h, d, col);
  }
  if (c.plant === 'bush') {
    for (let [dx, dy, dz, w] of [
      [0, 0.3, 0, 0.58],
      [-0.39, 0.23, 0.08, 0.19],
      [0.4, 0.26, 0.06, 0.21],
      [-0.11, 0.61, -0.12, 0.31],
      [0.27, 0.57, -0.16, 0.22],
    ])
      b(x + dx, dy, z + dz, w, 0.36, w, GardenPalette.leaves[variant][dy > 0.4 ? 1 : 0]);
    if (c.age >= 80) {
      let col = c.age >= 150 ? 0x8d588e : 0xcd6c62;
      for (let [dx, dy, dz] of [
        [-0.28, 0.52, 0.36],
        [0.25, 0.61, 0.33],
        [0.07, 0.81, -0.02],
        [-0.25, 0.79, -0.17],
      ].slice(0, 2 + (variant % 3)))
        b(x + dx, dy, z + dz, 0.13, 0.13, 0.13, col);
      if (c.age >= 150) labelList.push([i, '紫浆果', 0xc6a0cc, 0.95]);
    }
  }
};
