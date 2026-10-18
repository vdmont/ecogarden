GardenModels.registry['sheep-alpaca'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;

  let alp = a.type === 'alpaca',
    baby = a.age < 0,
    sc = baby ? 0.72 : 1,
    rest = a.sleep > 0,
    tilt = a.drunk ? Math.sin(t * 0.004) * 0.13 : 0;
  const p = (dx, y, dz, w, h, d, col) =>
    part(dx * sc, (rest ? y * 0.52 : y) * sc, dz * sc, w * sc, h * sc, d * sc, col, tilt);
  const wool = alp ? 0xf1eadb : 0xf1e8d0,
    shade = alp ? 0xdfd5c2 : 0xded5bd;
  p(0, 0.55, 0, 0.67, 0.46, 0.86, wool);
  p(-0.2, 0.76, -0.13, 0.32, 0.16, 0.38, shade);
  p(0.16, 0.79, 0.1, 0.37, 0.16, 0.4, wool);
  for (let dx of [-0.23, 0.23])
    for (let dz of [-0.29, 0.29]) {
      p(dx, 0.23, dz, 0.13, 0.42, 0.14, shade);
      p(dx, 0.07, dz, 0.15, 0.12, 0.16, 0x535147);
    }
  if (alp) p(0, 0.95, 0.33, 0.23, 0.76, 0.24, wool);
  const hy = alp ? 1.46 : 0.86,
    hz = alp ? 0.4 : 0.44;
  p(0, hy, hz, 0.4, 0.35, 0.35, alp ? 0xe9dfce : 0xd7c7ac);
  p(0, hy - 0.1, hz + 0.2, 0.29, 0.17, 0.2, alp ? 0xf6efdf : 0xe9ddc7);
  for (let side of [-1, 1]) {
    p(side * 0.115, hy + 0.045, hz + 0.185, 0.065, a.sleep ? 0.025 : 0.065, 0.035, 0x363f37);
    p(
      side * (alp ? 0.12 : 0.26),
      hy + (alp ? 0.29 : 0.02),
      hz,
      alp ? 0.09 : 0.16,
      alp ? 0.27 : 0.12,
      0.13,
      shade,
    );
  }
  p(0, hy - 0.13, hz + 0.315, 0.085, 0.045, 0.035, 0x67554b);
  p(0, 0.65, -0.48, 0.16, 0.18, 0.2, wool);
  if (a.drunk) {
    p(-0.21, hy - 0.035, hz + 0.18, 0.075, 0.05, 0.035, 0xdd9a96);
    p(0.21, hy - 0.035, hz + 0.18, 0.075, 0.05, 0.035, 0xdd9a96);
  }
};
