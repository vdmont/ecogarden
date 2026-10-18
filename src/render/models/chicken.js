GardenModels.registry['chicken'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;

  part(0, 0.36, 0, 0.43, 0.42, 0.46, 0xf3d786);
  part(0, 0.63, 0.17, 0.3, 0.3, 0.29, 0xffe6a4);
  part(0, 0.84, 0.18, 0.11, 0.16, 0.16, 0xc56e58);
  part(0, 0.58, 0.38, 0.13, 0.08, 0.17, 0xd38d40);
  for (let side of [-1, 1]) {
    part(side * 0.11, 0.1, 0, 0.07, 0.18, 0.16, 0xbc8744);
    part(side * 0.13, 0.69, 0.31, 0.04, 0.055, 0.04, 0x414535);
    part(side * 0.24, 0.42, -0.01, 0.12, 0.21, 0.3, 0xd9b76b);
  }
  part(0, 0.51, -0.3, 0.18, 0.3, 0.19, 0xe6c471);
};
