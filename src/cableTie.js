// src/cableTie.js
export function makeCableTie({
  strapLength = 180,
  strapWidth = 4.8,
  strapThickness = 1.3,
  headLength = 14,
  headWidth = 9.5,
  headHeight = 8,
  toothPitch = 1.5,
  toothDepth = 0.6,
  clearance = 0.25,
  showTeeth = true,
} = {}) {
  const { draw, makeBaseBox } = self.replicad;

  const tabLength = 12;
  const leadIn = 8;
  const gapBeforeHead = 4;

  let strap = makeBaseBox(strapLength, strapWidth, strapThickness)
    .translate([strapLength / 2, 0, strapThickness / 2]);

  const tab = makeBaseBox(tabLength, strapWidth + 1.6, strapThickness)
    .translate([-tabLength / 2, 0, strapThickness / 2]);
  strap = strap.fuse(tab);

  if (showTeeth && toothPitch > 0.5 && toothDepth > 0.15) {
    const teethStart = leadIn;
    const teethEnd = Math.max(leadIn, strapLength - gapBeforeHead);
    const toothLen = Math.min(toothPitch * 0.85, Math.max(0.45, toothPitch * 0.7));
    const toothWidth = Math.max(1.2, strapWidth - 0.6);
    const count = Math.floor((teethEnd - teethStart) / toothPitch);

    for (let i = 0; i < count; i++) {
      const x = teethStart + i * toothPitch;
      if (x + toothLen > teethEnd) break;

      const tooth = draw()
        .hLine(toothLen)
        .line(-toothLen * 0.28, toothDepth)
        .line(-toothLen * 0.72, -toothDepth)
        .close()
        .sketchOnPlane("XZ")
        .extrude(toothWidth)
        .translate([x, -toothWidth / 2, strapThickness]);

      strap = strap.fuse(tooth);
    }
  }

  const headX = strapLength;
  let head = makeBaseBox(headLength, headWidth, headHeight).translate([
    headX + headLength / 2,
    0,
    strapThickness / 2,
  ]);

  const slotW = strapWidth + clearance * 2;
  const slotH = strapThickness + toothDepth + clearance * 2 + 0.3;
  const slot = makeBaseBox(headLength + 0.4, slotW, slotH).translate([
    headX + headLength / 2,
    0,
    strapThickness / 2 + 0.1,
  ]);
  head = head.cut(slot);

  const leverX = headX + 2.2;
  let lever = makeBaseBox(6.2, Math.max(1, strapWidth - 0.5), 1.3).translate([
    leverX + 3.1,
    0,
    strapThickness + toothDepth + clearance + 0.7,
  ]);

  const lockTooth = makeBaseBox(
    1.5,
    Math.max(0.8, strapWidth - 1.1),
    toothDepth + 0.35
  ).translate([leverX + 1.1, 0, strapThickness + clearance]);
  lever = lever.fuse(lockTooth);

  const hinge = makeBaseBox(1.1, Math.max(0.8, strapWidth - 0.7), 0.4).translate([
    headX + headLength - 1.8,
    0,
    strapThickness + toothDepth + clearance + 0.85,
  ]);
  lever = lever.fuse(hinge);

  return strap.fuse(head).fuse(lever);
}
