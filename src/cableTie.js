// Parametric Reusable Cable Tie – Replicad version

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

  // 1. Strap
  let strap = makeBaseBox(strapLength, strapWidth, strapThickness)
    .translate([-strapLength / 2, 0, strapThickness / 2]);

  // 2. Teeth
  if (showTeeth && toothPitch > 0.5 && toothDepth > 0.15) {
    const usableLength = strapLength - 28;
    const numTeeth = Math.floor(usableLength / toothPitch);

    for (let i = 0; i < numTeeth; i++) {
      const x = -strapLength / 2 + 18 + i * toothPitch;

      const tooth = draw()
        .hLine(toothPitch * 0.55)
        .line(-toothPitch * 0.27, toothDepth)
        .line(-toothPitch * 0.28, -toothDepth)
        .close()
        .sketchOnPlane("XY")
        .extrude(strapWidth - 0.6)
        .translate([x, -(strapWidth - 0.6) / 2, strapThickness]);

      strap = strap.fuse(tooth);
    }
  }

  // 3. Pull tab
  const tab = makeBaseBox(12, strapWidth + 1.6, strapThickness)
    .translate([-strapLength / 2 - 6, 0, strapThickness / 2]);
  strap = strap.fuse(tab);

  // 4. Head / Buckle
  let head = makeBaseBox(headLength, headWidth, headHeight)
    .translate([headLength / 2, 0, headHeight / 2 - (headHeight - strapThickness) / 2]);

  // Insertion slot
  const slotW = strapWidth + clearance * 2;
  const slotH = strapThickness + clearance * 2 + toothDepth + 0.5;
  const slot = makeBaseBox(headLength + 4, slotW, slotH)
    .translate([headLength / 2, 0, strapThickness / 2]);
  head = head.cut(slot);

  // Side relief
  const sideRelief = makeBaseBox(5, headWidth + 2, 3.8)
    .translate([5.5, 0, 3.2]);
  head = head.cut(sideRelief);

  // 5. Lever + locking tooth
  let lever = makeBaseBox(7.2, strapWidth - 0.5, 1.5)
    .translate([5.5, 0, 2.6]);

  const lockTooth = makeBaseBox(1.9, strapWidth - 0.9, 1.7)
    .translate([4.8, 0, 1.2]);
  lever = lever.fuse(lockTooth);

  const hinge = makeBaseBox(1.4, strapWidth - 0.7, 0.55)
    .translate([9.5, 0, 2.9]);
  lever = lever.fuse(hinge);

  // 6. Assembly with clearance
  let complete = strap.fuse(head);

  try {
    const gap = lever.offset(clearance * 0.7);
    complete = complete.cut(gap);
  } catch (e) {
    // continue if offset fails
  }

  complete = complete.fuse(lever);
  return complete;
}
