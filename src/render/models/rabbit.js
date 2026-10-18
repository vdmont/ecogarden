GardenModels.registry['rabbit'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;

  const scale = a.age < 0 ? 0.7 : 1,
    p = (dx, y, dz, w, h, d, col) =>
      part(dx * scale, y * scale, dz * scale, w * scale, h * scale, d * scale, col);
  p(0, 0.31, -0.04, 0.43, 0.36, 0.5, 0xd8c4aa);
  p(0, 0.49, 0.25, 0.36, 0.32, 0.32, 0xe5d2bb);
  p(0, 0.27, -0.36, 0.22, 0.22, 0.22, 0xf7eddc);
  for (let side of [-1, 1]) {
    p(side * 0.11, 0.89, 0.23, 0.1, 0.5, 0.12, 0xe5d2bb);
    p(side * 0.11, 0.91, 0.303, 0.05, 0.34, 0.035, 0xc89187);
    p(side * 0.095, 0.53, 0.425, 0.055, 0.055, 0.03, 0x3d4036);
    p(side * 0.18, 0.12, 0.12, 0.19, 0.13, 0.25, 0xc5ad90);
  }
  p(0, 0.43, 0.435, 0.07, 0.045, 0.045, 0xc48579);
};
