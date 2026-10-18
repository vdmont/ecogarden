GardenModels.registry['butterfly'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;
  part(0, 0.65, 0, 0.075, 0.2, 0.3, 0x71536d);
  for (let side of [-1, 1]) {
    part(side * 0.24, 0.72, 0, 0.38, 0.09, 0.4, 0xd596c1, side * phase * 0.4);
    part(side * 0.17, 0.62, -0.24, 0.22, 0.07, 0.25, 0xb775a5);
  }
};
