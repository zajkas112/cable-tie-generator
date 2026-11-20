import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { wrap } from "comlink";
import { syncFaces, syncLines } from "replicad-threejs-helper";

const worker = wrap(new Worker(new URL("./worker.js", import.meta.url), { type: "module" }));

// ---------- Three.js setup ----------
const canvas = document.getElementById("viewer");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf4f4f5);

const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 2000);
camera.position.set(120, 80, 140);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const ambient = new THREE.AmbientLight(0xffffff, 0.6);
const dir = new THREE.DirectionalLight(0xffffff, 0.9);
dir.position.set(50, 100, 80);
scene.add(ambient, dir);

let meshGroup = new THREE.Group();
scene.add(meshGroup);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

// ---------- UI ----------
const statusEl = document.getElementById("status");
const form = document.getElementById("params");

const defaultParams = {
  strapLength: 180,
  strapWidth: 4.8,
  strapThickness: 1.3,
  headLength: 14,
  headWidth: 9.5,
  headHeight: 8,
  toothPitch: 1.5,
  toothDepth: 0.6,
  clearance: 0.25,
  showTeeth: true,
};

function getParams() {
  const data = new FormData(form);
  return {
    strapLength: +data.get("strapLength"),
    strapWidth: +data.get("strapWidth"),
    strapThickness: +data.get("strapThickness"),
    headLength: +data.get("headLength"),
    headWidth: +data.get("headWidth"),
    headHeight: +data.get("headHeight"),
    toothPitch: +data.get("toothPitch"),
    toothDepth: +data.get("toothDepth"),
    clearance: +data.get("clearance"),
    showTeeth: data.get("showTeeth") === "on",
  };
}

let debounceTimer;
async function updateModel() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    statusEl.textContent = "Building model…";
    statusEl.className = "loading";

    try {
      const params = getParams();
      const meshData = await worker.createMesh(params);

      // Clear previous
      while (meshGroup.children.length) {
        const child = meshGroup.children.pop();
        child.geometry?.dispose();
        child.material?.dispose();
      }

      // Faces
      const faceGeom = new THREE.BufferGeometry();
      syncFaces(faceGeom, meshData.faces);
      const faceMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        metalness: 0.1,
        roughness: 0.6,
      });
      meshGroup.add(new THREE.Mesh(faceGeom, faceMat));

      // Edges
      const edgeGeom = new THREE.BufferGeometry();
      syncLines(edgeGeom, meshData.edges);
      const edgeMat = new THREE.LineBasicMaterial({ color: 0x1e3a8a });
      meshGroup.add(new THREE.LineSegments(edgeGeom, edgeMat));

      statusEl.textContent = "Ready";
      statusEl.className = "ready";
    } catch (err) {
      console.error(err);
      statusEl.textContent = "Error – check console";
      statusEl.className = "error";
    }
  }, 220);
}

form.addEventListener("input", updateModel);

// Download STL
document.getElementById("download").addEventListener("click", async () => {
  statusEl.textContent = "Generating STL…";
  try {
    const blob = await worker.createSTL(getParams());
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reusable-cable-tie.stl";
    a.click();
    URL.revokeObjectURL(url);
    statusEl.textContent = "STL downloaded";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Download failed";
  }
});

// First render
updateModel();
