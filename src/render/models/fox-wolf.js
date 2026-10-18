GardenModels.registry['fox-wolf'] = function ({ a, part: drawPart, phase, t, i }) {
  let wolf = a.type === 'wolf';
  const original = drawPart;
  const shade = (col) =>
    wolf
      ? {
          [0xc47c40]: 0x89938e,
          [0xda9552]: 0xa4aca5,
          [0xb56e35]: 0x69756f,
          [0xd59551]: 0x929f98,
          [0xf2dfb7]: 0xd7ddd2,
          [0xe7c79c]: 0xc6d0c2,
          [0xf1e1bd]: 0xd5dcd0,
          [0x664d38]: 0x505e58,
        }[col] || col
      : col;
  const part = (...args) => {
    args[6] = shade(args[6]);
    original(...args);
  };
  part(0, 0.44, 0, 0.4, 0.31, 0.63, 0xc47c40);
  part(0, 0.57, 0.34, 0.35, 0.3, 0.32, 0xda9552);
  part(0, 0.47, 0.51, 0.27, 0.14, 0.21, 0xf2dfb7);
  part(0, 0.5, 0.635, 0.075, 0.06, 0.045, 0x3a4138);
  for (let side of [-1, 1]) {
    part(side * 0.12, 0.79, 0.34, 0.12, 0.23, 0.12, 0xb56e35);
    part(side * 0.12, 0.79, 0.41, 0.06, 0.13, 0.03, 0xe7c79c);
    part(side * 0.13, 0.6, 0.503, 0.055, 0.06, 0.035, 0x353e33);
    for (let dz of [-0.22, 0.22]) part(side * 0.14, 0.19, dz, 0.095, 0.35, 0.1, 0x664d38);
  }
  part(0, 0.48, -0.56, 0.25, 0.25, 0.54, 0xd59551);
  part(0, 0.51, -0.87, 0.23, 0.24, 0.23, 0xf1e1bd);
};
