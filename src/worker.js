import opencascade from "replicad-opencascadejs/src/replicad_single.js";
import opencascadeWasm from "replicad-opencascadejs/src/replicad_single.wasm?url";
import { setOC, exportSTL } from "replicad";
import { expose } from "comlink";
import { makeCableTie } from "./cableTie.js";

let loaded = false;

async function init() {
  if (loaded) return;
  const OC = await opencascade({
    locateFile: () => opencascadeWasm,
  });
  setOC(OC);
  // Make replicad available inside the model
  self.replicad = await import("replicad");
  loaded = true;
}

const ready = init();

async function createMesh(params) {
  await ready;
  const shape = makeCableTie(params);
  return {
    faces: shape.mesh({ tolerance: 0.1, angularTolerance: 0.3 }),
    edges: shape.meshEdges({ tolerance: 0.1 }),
  };
}

async function createSTL(params) {
  await ready;
  const shape = makeCableTie(params);
  return shape.blobSTL({ tolerance: 0.05 });
}

expose({ createMesh, createSTL });
