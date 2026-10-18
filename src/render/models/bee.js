GardenModels.registry['bee'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;

  part(0, 0.65, 0, 0.3, 0.25, 0.44, 0xe9c653);
  for (let dz of [-0.13, 0.05]) part(0, 0.655, dz, 0.31, 0.26, 0.065, 0x665138);
  part(0, 0.73, 0.25, 0.25, 0.22, 0.2, 0xe9c653);
  for (let side of [-1, 1]) {
    part(side * 0.25, 0.81, -0.03, 0.32, 0.045, 0.3, 0xe5f1e9, side * phase * 0.45);
    part(side * 0.08, 0.78, 0.36, 0.05, 0.055, 0.035, 0x353e32);
  }
};
