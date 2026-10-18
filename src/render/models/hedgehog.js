GardenModels.registry['hedgehog'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;

  part(0, 0.27, -0.04, 0.49, 0.35, 0.52, 0x90775a);
  for (let dz of [-0.2, 0, 0.2])
    for (let dx of [-0.18, 0, 0.18])
      part(dx, 0.48 + (0.2 - Math.abs(dx)) * 0.25, dz - 0.08, 0.1, 0.16, 0.11, 0xd0bd97, 0.18);
  part(0, 0.23, 0.29, 0.29, 0.21, 0.23, 0xc8b28b);
  part(0, 0.21, 0.44, 0.11, 0.08, 0.1, 0x443f34);
  for (let side of [-1, 1]) {
    part(side * 0.1, 0.29, 0.37, 0.045, 0.045, 0.04, 0x333b30);
    part(side * 0.19, 0.09, 0, 0.1, 0.13, 0.12, 0x68533e);
  }
};
