GardenModels.registry['squirrel'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;

  part(0, 0.34, 0, 0.3, 0.39, 0.35, 0xa47a4e);
  part(0, 0.56, 0.18, 0.28, 0.29, 0.26, 0xbc9161);
  part(0, 0.32, 0.18, 0.19, 0.23, 0.09, 0xe4cba0);
  part(0, 0.53, -0.27, 0.25, 0.55, 0.25, 0xa0784c);
  part(0, 0.81, -0.3, 0.25, 0.2, 0.28, 0xbb9161);
  for (let side of [-1, 1]) {
    part(side * 0.1, 0.8, 0.13, 0.1, 0.22, 0.1, 0x9a7044);
    part(side * 0.11, 0.61, 0.32, 0.05, 0.06, 0.03, 0x383b2f);
    part(side * 0.16, 0.11, 0.09, 0.14, 0.15, 0.19, 0x8c673f);
  }
  part(0, 0.5, 0.34, 0.075, 0.05, 0.04, 0x594734);
};
