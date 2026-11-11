import { WebGLRenderer, PerspectiveCamera, Scene, Group, Points, BufferGeometry, BufferAttribute } from 'three';
import { gsap } from 'gsap';
import { COUNTS } from '../config.js';
import { motionOn } from '../core/motion.js';
import { buildTargets, SIDES } from './shapes.js';
import { makeMaterial } from './shaders.js';

const phoneMQ = matchMedia('(max-width:760px)'); // same breakpoint as the CSS layout
const TAN = Math.tan((45 / 2) * (Math.PI / 180)); // half of the 45deg field of view
const DEN = [1, 0.55, 0.55, 0.55, 0.55, 0.55, 1]; // glyph density per chapter: heavy glyphs on the plain figure
const lerp = (a, b, t) => a + (b - a) * t;
let canvas, renderer, camera, scene, group, points, geo, u;
let T = [], pair = '', count = 0;
let side = 1, phone = false, motion = true, baseZ = 5, offX = 1.9, intro = null;
let chap = { i: 0, j: 0, e: 0 }; // last jl:chapter, kept so the scene can start from any scroll position
let resolveReady;
const ready = new Promise((r) => { resolveReady = r; }); // resolves true, or false when WebGL is unavailable

// Camera, pixel ratio and figure placement. Desktop: figure on `side`. Phone: centered at the top, smaller.
function layout() {
  phone = phoneMQ.matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, phone ? 1.5 : 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false); // CSS owns the canvas size
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.position.z = baseZ = camera.aspect < 1 ? 6.4 : 5;
  camera.updateProjectionMatrix();
  u.uPR.value = renderer.getPixelRatio();
  const halfW = TAN * baseZ * camera.aspect; // half of the visible width at the figure's depth
  offX = Math.min(1.9, halfW * 0.55, halfW * 0.97 - 0.95); // 0.95 = shoulder half-width: never clipped by the right edge
  place();
}

function place() {
  group.position.set(phone ? 0 : side * offX, phone ? 0.9 : -0.3, 0); // desktop y -0.3 centers the figure and keeps the mortarboard (y 1.78) below the top edge
  group.scale.setScalar(phone ? 0.72 : 1);
}

function frame(_, dt) {
  if (document.hidden) return; // paused while the tab is hidden
  if (motion) u.uTime.value += Math.min(dt, 50) / 1000; // frozen time = no drift, no sparkle
  // The figure turns toward the text. Motion off: no turn. (Stage 4 replaces this target with the gaze.)
  const k = 1 - Math.exp((-3.7 * Math.min(dt, 50)) / 1000);
  group.rotation.y = motion ? group.rotation.y + (-side * 0.35 - group.rotation.y) * k : 0;
  renderer.render(scene, camera);
}

function startIntro() {
  points.visible = true;
  if (!motion) { u.uIn.value = 1; return; }
  intro = gsap.to(u.uIn, { value: 1, duration: 2, ease: 'power4.out' }); // power4.out is the closest GSAP match to --ease-out
}

// Applies the latest (i, j, e): morph pair and mix, density, side, and how hard the points scatter on the way.
function apply() {
  if (!geo) return;
  const { i, j, e } = chap;
  gl.setTargets(i, j);
  gl.setMix(e);
  gl.setDensity(lerp(DEN[i], DEN[j], e));
  gl.setSide(lerp(SIDES[i], SIDES[j], e));
  u.uDis.value = !motion ? 0 : i === 0 || i === 5 ? 2.6 : 1; // only Home to Education and Video to Contact dissolve fully
}
document.addEventListener('jl:chapter', (ev) => { chap = ev.detail; apply(); }); // registered at import time: no event is missed

// Phones pull the objects toward the centered figure so they never clip. Same point count, new positions.
function rebuild() {
  T = buildTargets(count, phoneMQ.matches ? 0.55 : 1);
  pair = ''; // forces the next setTargets to upload
}

export const gl = {
  ready,
  // Uploads targets A = T[i] and B = T[j] only when the pair changes. T holds one target per chapter (0..6).
  setTargets(i, j) {
    if (!geo || pair === `${i}|${j}`) return;
    pair = `${i}|${j}`;
    geo.attributes.position.array.set(T[i] ?? T[0]);
    geo.attributes.aB.array.set(T[j] ?? T[0]);
    geo.attributes.position.needsUpdate = geo.attributes.aB.needsUpdate = true;
  },
  setMix(e) { if (u) u.uMix.value = e; },
  setDensity(v) { if (u) u.uDen.value = v; },
  setSpin(v) { if (u) u.uSp.value = v; },
  setSide(s) { side = s; if (group) place(); }, // -1 left, +1 right; fractions are fine
  setColor(hex) { // 6-digit hex like '#cdbfff'
    const n = parseInt(hex.trim().slice(1), 16);
    if (u) u.uC.value.set(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
  },
};

// Builds the scene on #gl. onProgress(0..1) feeds the splash. Never rejects: on failure the page runs without the canvas.
export async function initGL(onProgress = () => {}) {
  canvas = document.getElementById('gl');
  const afterSplash = document.body.classList.contains('ready')
    ? Promise.resolve()
    : new Promise((r) => document.addEventListener('jl:splash-done', r, { once: true }));
  try {
    motion = motionOn();
    phone = phoneMQ.matches;
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false });
    camera = new PerspectiveCamera(45, 1, 0.1, 100);
    scene = new Scene();
    group = new Group();
    scene.add(group);
    const material = makeMaterial();
    u = material.uniforms;
    onProgress(0.3);

    count = phone ? COUNTS.mobile : COUNTS.desktop; // fixed at start; a resize does not change the count
    T = buildTargets(count, phone ? 0.55 : 1);
    const rnd = new Float32Array(count).map(Math.random);
    geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(T[0].slice(), 3));
    geo.setAttribute('aB', new BufferAttribute(T[0].slice(), 3));
    geo.setAttribute('aR', new BufferAttribute(rnd, 1));
    points = new Points(geo, material);
    points.frustumCulled = false; // the shader moves the points far outside the original bounds
    group.add(points);
    onProgress(0.6);

    layout();
    gl.setColor(getComputedStyle(document.documentElement).getPropertyValue('--ac'));
    apply(); // start at the current scroll position (the page may load scrolled)
    await renderer.compileAsync(scene, camera);
    points.visible = false; // stays hidden until the splash is gone, then the intro flies it in
    window.addEventListener('resize', () => { layout(); renderer.render(scene, camera); });
    phoneMQ.addEventListener('change', () => { rebuild(); apply(); });
    document.addEventListener('jl:motion', (e) => { motion = e.detail; if (!motion) intro?.progress(1); apply(); });
    gsap.ticker.add(frame);
    onProgress(1);
    resolveReady(true);
    afterSplash.then(startIntro);
  } catch (err) {
    console.warn('WebGL is unavailable, continuing without the figure.', err);
    renderer?.dispose();
    document.documentElement.classList.add('no-gl');
    canvas.hidden = true;
    onProgress(1);
    resolveReady(false);
  }
}