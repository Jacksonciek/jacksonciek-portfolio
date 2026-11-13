import { WebGLRenderer, PerspectiveCamera, Scene, Group, Points, BufferGeometry, BufferAttribute } from 'three';
import { gsap } from 'gsap';
import { COUNTS } from '../config.js';
import { motionOn } from '../core/motion.js';
import { getCurrentChapter } from '../ui/chapters.js';
import { buildTargets, loadPortraitPool, SIDES } from './shapes.js';
import { makeMaterial } from './shaders.js';
import { createInteraction } from './interaction.js';

const phoneMQ = matchMedia('(max-width:760px)'); // same breakpoint as the CSS layout
const TAN = Math.tan((45 / 2) * (Math.PI / 180)); // half of the 45deg field of view
const DEN = [1, 1, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55]; // dense avatar; lighter helix field
const lerp = (a, b, t) => a + (b - a) * t;
let canvas, renderer, camera, scene, group, points, geo, u, ptr;
let T = [], pair = '', count = 0;
let side = 1, phone = false, motion = true, baseZ = 5, cameraPush = 0, offX = 1.9, intro = null;
let chap = { i: 0, j: 0, e: 0 }; // last jl:chapter, kept so the scene can start from any scroll position
let resolveReady;
const ready = new Promise((r) => { resolveReady = r; }); // resolves true, or false when WebGL is unavailable

// Camera, pixel ratio and figure placement. Desktop: figure on `side`. Phone: centered at the top, smaller.
function layout() {
  phone = phoneMQ.matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, phone ? 1.5 : 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false); // CSS owns the canvas size
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  baseZ = camera.aspect < 1 ? 6.4 : 5;
  camera.position.z = baseZ * (1 - cameraPush * 0.34);
  camera.updateProjectionMatrix();
  u.uPR.value = renderer.getPixelRatio();
  const halfW = TAN * baseZ * camera.aspect; // half of the visible width at the figure's depth
  offX = Math.min(2.1, halfW * 0.55, halfW * 0.97 - 1.15); // preserve a wider margin around the larger shoulders
  place();
}

function place() {
  group.position.set(phone ? 0 : side * offX, phone ? 1.35 : -0.3, 0); // leave a clean text lane under the head on phones
  const width = canvas.clientWidth;
  const scale = phone ? 0.9 : width < 820 ? 0.76 : width < 980 ? 0.86 : width < 1120 ? 1 : 1.18;
  group.scale.setScalar(scale);
}

function updateAvatarAttributes() {
  if (!geo) return;
  geo.setAttribute('aHead', new BufferAttribute(T.headMask || new Float32Array(count), 1));
  geo.setAttribute('aGold', new BufferAttribute(T.portraitGold || new Float32Array(count), 1));
}

function frame(_, dt) {
  if (document.hidden) return; // paused while the tab is hidden
  if (!document.getElementById('pg')?.hidden || !document.getElementById('viewer')?.hidden) return;
  const s = Math.min(dt, 50) / 1000;
  const g = ptr.update(s, motion);
  if (motion) u.uTime.value += s;
  u.uLook.value.set(g.x, g.y);
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
  u.uHead.value = lerp(i < 2 ? 1 : 0, j < 2 ? 1 : 0, e);
  // Points travel directly between targets; the small spread adds air without a dissolve or camera pullback.
  u.uDis.value = motion ? 0.22 : 0;
}
document.addEventListener('jl:chapter', (ev) => { chap = ev.detail; apply(); }); // registered at import time: no event is missed
document.addEventListener('jl:chapter', () => gl.setColor(getComputedStyle(document.documentElement).getPropertyValue('--ac')));
document.addEventListener('jl:theme', (event) => {
  gl.setColor(event.detail.particle);
  gl.setAccent(event.detail.accent);
});

// Phones pull the objects toward the centered figure so they never clip. Same point count, new positions.
function rebuild() {
  T = buildTargets(count, phoneMQ.matches ? 0.55 : 1);
  updateAvatarAttributes();
  pair = ''; // forces the next setTargets to upload
}

export const gl = {
  ready,
  // Uploads targets A = T[i] and B = T[j] only when the pair changes. T follows the page's chapter order.
  setTargets(i, j) {
    if (!geo || pair === `${i}|${j}`) return;
    pair = `${i}|${j}`;
    geo.attributes.position.array.set(T[i] ?? T[0]);
    geo.attributes.aB.array.set(T[j] ?? T[0]);
    geo.attributes.position.needsUpdate = geo.attributes.aB.needsUpdate = true;
  },
  setMix(e) { if (u) u.uMix.value = e; },
  setDensity(v) { if (u) u.uDen.value = v; },
  setSide(s) { side = s; if (group) place(); }, // -1 left, +1 right; fractions are fine
  setCameraPush(progress) {
    cameraPush = Math.max(0, Math.min(1, progress));
    if (camera) camera.position.z = baseZ * (1 - cameraPush * 0.34);
  },
  setColor(hex) { // 6-digit hex like '#cdbfff'
    const n = parseInt(hex.trim().slice(1), 16);
    if (u) u.uC.value.set(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
  },
  setAccent(hex) {
    const n = parseInt(hex.trim().slice(1), 16);
    if (u) u.uAccent.value.set(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
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
    await loadPortraitPool();
    T = buildTargets(count, phone ? 0.55 : 1);
    chap = { ...getCurrentChapter() }; // jl:chapter may have fired before this deferred GL module loaded
    const rnd = new Float32Array(count).map(Math.random);
    geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(T[0].slice(), 3));
    geo.setAttribute('aB', new BufferAttribute(T[0].slice(), 3));
    geo.setAttribute('aR', new BufferAttribute(rnd, 1));
    updateAvatarAttributes();
    points = new Points(geo, material);
    points.frustumCulled = false; // the shader moves the points far outside the original bounds
    group.add(points);
    onProgress(0.6);

    layout();
    const lightTheme = document.documentElement.dataset.theme === 'light';
    gl.setColor(lightTheme ? '#147E41' : '#18C75F');
    gl.setAccent(lightTheme ? '#090A0F' : '#59FFA0');
    apply(); // start at the current scroll position (the page may load scrolled)
    await renderer.compileAsync(scene, camera);
    points.visible = false; // stays hidden until the splash is gone, then the intro flies it in
    window.addEventListener('resize', () => { layout(); renderer.render(scene, camera); });
    phoneMQ.addEventListener('change', () => { rebuild(); apply(); });
    document.addEventListener('jl:motion', (e) => { motion = e.detail; if (!motion) intro?.progress(1); apply(); });
    ptr = createInteraction();
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
