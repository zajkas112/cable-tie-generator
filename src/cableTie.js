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
  tipLength = 14,
  leadIn = 8,
  collarLength = 10,
} = {}) {
  const { draw, makeBaseBox } = self.replicad;

  const gapBeforeHead = 4;

  // The strap joins the head through a floor. The passage sits above that
  // floor, so the root no longer fills the hole the free end has to enter.
  const floor = strapThickness;
  const passageH = strapThickness + toothDepth + clearance * 2 + 0.5;
  const roof = Math.max(1.8, headHeight - floor - passageH);
  const totalH = floor + passageH + roof;

  const slotW = strapWidth + clearance * 2;
  const headW = Math.max(headWidth, slotW + 2.8);

  // makeBaseBox is centered in X/Y and sits on z = 0. Pass the bottom, not the center.
  let strap = makeBaseBox(strapLength, strapWidth, strapThickness)
    .translate([strapLength / 2, 0, 0]);

  const tip = draw([0, strapWidth / 2])
    .line(0, -strapWidth)
    .line(-tipLength, strapWidth / 2)
    .close()
    .sketchOnPlane("XY")
    .extrude(strapThickness);
  strap = strap.fuse(tip);

  // Wider neck on the strap only. It stops at the head face and stays below the passage.
  const collarW = Math.min(headW, strapWidth + 3.2);
  const collar = makeBaseBox(collarLength, collarW, strapThickness)
    .translate([strapLength - collarLength / 2, 0, 0]);
  strap = strap.fuse(collar);

  if (showTeeth && toothPitch > 0.5 && toothDepth > 0.15) {
    const teethStart = leadIn;
    const teethEnd = Math.max(leadIn, strapLength - collarLength - gapBeforeHead);
    const toothLen = Math.min(toothPitch * 0.85, Math.max(0.45, toothPitch * 0.7));
    const toothWidth = Math.max(1.2, strapWidth - 0.6);
    const count = Math.floor((teethEnd - teethStart) / toothPitch);

    for (let i = 0; i < count; i++) {
      const x = teethStart + i * toothPitch;
      if (x + toothLen > teethEnd) break;

      const tooth = makeBaseBox(toothLen, toothWidth, toothDepth).translate([
        x + toothLen / 2,
        0,
        strapThickness,
      ]);

      strap = strap.fuse(tooth);
    }
  }

  const headX = strapLength;
  // Bury the strap in the head floor so the two solids overlap. A face-only
  // join leaves a gap, and this root stays under the passage.
  const rootEmbed = Math.min(6, Math.max(2.5, headLength * 0.4));
  const root = makeBaseBox(rootEmbed + 0.4, strapWidth, floor).translate([
    headX + rootEmbed / 2 - 0.2,
    0,
    0,
  ]);
  strap = strap.fuse(root);

  const head = makeBaseBox(headLength, headW, totalH).translate([
    headX + headLength / 2,
    0,
    0,
  ]);

  // Past both faces, starting at the top of the floor, so the tunnel is open
  // and the buried root is left intact.
  const slot = makeBaseBox(headLength + 2, slotW, passageH).translate([
    headX + headLength / 2,
    0,
    floor,
  ]);

  const body = strap.fuse(head).cut(slot);

  const gapUnderRoof = Math.max(0.35, clearance);
  const pawlT = Math.max(0.55, Math.min(1.2, passageH - gapUnderRoof - 0.5));
  const pawlW = Math.max(0.8, slotW - clearance * 2 - 0.4);
  const hingeLen = 1.4;
  const pawlLen = Math.max(3.2, Math.min(7, headLength - hingeLen - 2.2));

  const slotTop = floor + passageH;
  const outerX = headX + headLength - 0.45;
  const hingeX = outerX - hingeLen / 2;
  const pawlBottom = slotTop - gapUnderRoof - pawlT;
  const pawlX = outerX - hingeLen + 0.45 - pawlLen / 2;

  const hingeBottom = pawlBottom + pawlT - 0.35;
  const hingeH = slotTop + 0.6 - hingeBottom;
  const hinge = makeBaseBox(hingeLen, pawlW * 0.72, hingeH).translate([
    hingeX,
    0,
    hingeBottom,
  ]);

  const pawl = makeBaseBox(pawlLen, pawlW, pawlT).translate([
    pawlX,
    0,
    pawlBottom,
  ]);

  const toothTop = pawlBottom + 0.25;
  const toothBottom = Math.max(floor + 0.35, Math.min(floor + strapThickness * 0.5, toothTop - 0.45));
  const lockTooth = makeBaseBox(1.35, Math.max(0.6, pawlW - 0.35), toothTop - toothBottom).translate([
    pawlX - pawlLen / 2 + 0.95,
    0,
    toothBottom,
  ]);

  return body.fuse(hinge).fuse(pawl).fuse(lockTooth);
}
