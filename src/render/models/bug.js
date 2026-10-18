GardenModels.registry['bug'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;
  for (let k = -1; k <= 1; k++)
    part(
      k * 0.18,
      0.25 + (k === 0 ? 0.018 : 0),
      0,
      0.172,
      0.2,
      0.25,
      k === 1 ? 0xe6b26b : 0xc99053,
    );
  part(0.24, 0.36, 0.08, 0.055, 0.055, 0.045, 0x373b32);
  part(0.24, 0.36, -0.08, 0.055, 0.055, 0.045, 0x373b32);
  for (let k = -1; k <= 1; k++)
    for (let side of [-1, 1]) part(k * 0.17, 0.14, side * 0.15, 0.06, 0.09, 0.09, 0x62523b);
};
