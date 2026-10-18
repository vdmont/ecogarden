GardenModels.registry['hedgehog'] = function ({ a, part, phase, t, i }) {
  const drawPart = part;
  const P = GardenModels.pose(a, t);
  const sway = P.sway * 0.04;
  const p = (dx, y, dz, w, h, d, col, tilt = 0) =>
    part((dx + sway) * 1, y * P.bodyY + P.lift, dz, w, h * P.bodyY, d, col, tilt + P.tilt);
  // 脸：睡着时低下来贴地，眼睛眯成一条
  const face = (dx, y, dz, w, h, d, col, tilt = 0) =>
    part(dx + sway, y * P.headY - P.headDrop + P.lift, dz, w, h, d, col, tilt + P.earTilt + P.tilt);
  const eye = (dx, y, dz, w, h, d, col) =>
    part(dx + sway, y * P.headY - P.headDrop + P.lift, dz, w, h * P.eyeH, d, col, P.tilt);

  p(0, 0.27, -0.04, 0.49, 0.35, 0.52, 0x90775a);
  for (let dz of [-0.2, 0, 0.2])
    for (let dx of [-0.18, 0, 0.18])
      p(dx, 0.48 + (0.2 - Math.abs(dx)) * 0.25, dz - 0.08, 0.1, 0.16, 0.11, 0xd0bd97, 0.18);
  face(0, 0.23, 0.29, 0.29, 0.21, 0.23, 0xc8b28b);
  face(0, 0.21, 0.44, 0.11, 0.08, 0.1, 0x443f34);
  for (let side of [-1, 1]) {
    eye(side * 0.1, 0.29, 0.37, 0.045, 0.045, 0.04, 0x333b30);
    // 刺猬腿短，睡着了整只往下一缩，腿基本收进肚子底下
    const L = P.place(P.legGroup(side, side < 0), 0.155, 0, 0.13);
    part(side * 0.19, L.y, L.z, 0.1, L.len, 0.12, 0x68533e, P.tilt, L.pitch);
  }
};
