GardenModels.registry['boar'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;

  part(0, 0.44, -0.04, 0.62, 0.46, 0.79, 0x8e7661);
  part(0, 0.5, 0.43, 0.49, 0.37, 0.4, 0xa58a6e);
  part(0, 0.41, 0.69, 0.32, 0.2, 0.2, 0xbc9d7b);
  for (let dz of [-0.2, 0, 0.2]) part(0, 0.72, dz, 0.12, 0.2, 0.16, 0x5a5145);
  for (let side of [-1, 1]) {
    part(side * 0.22, 0.75, 0.4, 0.15, 0.22, 0.14, 0x786453);
    part(side * 0.18, 0.56, 0.64, 0.055, 0.06, 0.035, 0x333c32);
    part(side * 0.2, 0.33, 0.68, 0.065, 0.18, 0.06, 0xf2e5c8);
    part(side * 0.08, 0.43, 0.805, 0.04, 0.045, 0.03, 0x6c5443);
    for (let dz of [-0.28, 0.28]) part(side * 0.23, 0.18, dz, 0.14, 0.3, 0.15, 0x665747);
  }
};
