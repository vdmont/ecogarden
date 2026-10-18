GardenModels.registry['frog'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;
  for (const side of [-1, 1]) part(side * 0.12, 0.365, -0.04, 0.055, 0.035, 0.27, 0xe8dfa5);
  part(0, 0.295, 0.365, 0.22, 0.05, 0.035, 0x5c9293);
  part(0, 0.21, 0, 0.49, 0.27, 0.43, 0x739753);
  part(0, 0.26, 0.21, 0.48, 0.22, 0.3, 0x92b669);
  part(0, 0.14, 0.29, 0.32, 0.08, 0.19, 0xc2d79a);
  for (let side of [-1, 1]) {
    part(side * 0.17, 0.43, 0.22, 0.17, 0.18, 0.18, 0x8fae61);
    part(side * 0.17, 0.45, 0.32, 0.085, 0.085, 0.035, 0x333f2e);
    part(side * 0.31, 0.12, -0.12, 0.23, 0.19, 0.34, 0x5f8348);
    part(side * 0.28, 0.07, 0.27, 0.22, 0.06, 0.22, 0x8ca961);
  }
};
