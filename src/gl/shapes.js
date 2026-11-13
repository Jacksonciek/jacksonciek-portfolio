// Surface samplers. Each one is a function (out, o) that writes x, y, z into out[o], out[o+1], out[o+2].
// Signature: primitive(size args, then x, y, z of its center). Stage 3b builds the chapter objects from these.
const TAU = Math.PI * 2;
const rand = Math.random;
let portraitPool = null;

// The uploaded silhouette is a visual seed, not a live photograph shown to visitors.
// White pixels are the source background; dark and gold pixels become the particle field.
export async function loadPortraitPool(src = '/media/3d-avatar.png') {
  try {
    const image = new Image();
    image.src = src;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = Math.round(240 * image.height / image.width);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = [], headPixels = [], bodyPixels = [];
    for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const luma = r * .2126 + g * .7152 + b * .0722;
      const gold = r > 105 && g > 90 && b < 125 && r > g * 1.08;
      if (luma < 150 || gold) {
        const point = [x, y, luma, gold ? 1 : 0];
        pixels.push(...point);
        if (y / canvas.height < 0.51) headPixels.push(...point);
        if (y / canvas.height > 0.43) bodyPixels.push(...point);
      }
    }
    if (pixels.length > 1200) portraitPool = {
      pixels, headPixels, bodyPixels, width: canvas.width, height: canvas.height,
    };
  } catch (error) {
    console.warn('Portrait particles unavailable; using the procedural figure.', error);
  }
  return portraitPool;
}

// Ellipsoid surface; (sx, sy, sz) scale the radius per axis.
export const sph = (r, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => (out, o) => {
  const u = rand() * 2 - 1, a = rand() * TAU, s = Math.sqrt(1 - u * u);
  out[o] = x + r * sx * s * Math.cos(a);
  out[o + 1] = y + r * sy * u;
  out[o + 2] = z + r * sz * s * Math.sin(a);
};

// Box surface, faces weighted by area.
export const box = (w, h, d, x = 0, y = 0, z = 0) => {
  const area = [w * h, w * h, h * d, h * d, w * d, w * d];
  const sum = area.reduce((s, a) => s + a, 0);
  return (out, o) => {
    let t = rand() * sum, f = 0;
    while (f < 5 && (t -= area[f]) > 0) f++;
    const side = f & 1 ? 0.5 : -0.5, axis = f >> 1, p = rand() - 0.5, q = rand() - 0.5; // axis 0: z faces, 1: x faces, 2: y faces
    out[o] = x + (axis === 1 ? side : p) * w;
    out[o + 1] = y + (axis === 2 ? side : axis === 0 ? q : p) * h;
    out[o + 2] = z + (axis === 0 ? side : q) * d;
  };
};

// Cylinder along y: side and both caps, weighted by area.
export const cyl = (r, h, x = 0, y = 0, z = 0) => {
  const side = TAU * r * h, cap = Math.PI * r * r, sum = side + 2 * cap;
  return (out, o) => {
    const t = rand() * sum, a = rand() * TAU, onSide = t < side;
    const rr = onSide ? r : r * Math.sqrt(rand());
    out[o] = x + rr * Math.cos(a);
    out[o + 1] = y + (onSide ? rand() - 0.5 : t < side + cap ? 0.5 : -0.5) * h;
    out[o + 2] = z + rr * Math.sin(a);
  };
};

// Cone along y with the apex pointing DOWN (a stylus tip); the flat base is at the top.
export const cone = (r, h, x = 0, y = 0, z = 0) => {
  const lat = Math.PI * r * Math.hypot(r, h), base = Math.PI * r * r, pLat = lat / (lat + base);
  return (out, o) => {
    const a = rand() * TAU, onSide = rand() < pLat;
    const v = Math.sqrt(rand()); // 0 at the apex, 1 at the base; sqrt keeps the area uniform
    const rr = onSide ? r * v : r * Math.sqrt(rand());
    out[o] = x + rr * Math.cos(a);
    out[o + 1] = y + (onSide ? v - 0.5 : 0.5) * h;
    out[o + 2] = z + rr * Math.sin(a);
  };
};

// Flat rectangle facing +z: filled, or only its outline.
export const rect = (w, h, x = 0, y = 0, z = 0, outline = false) => {
  const per = 2 * (w + h);
  return (out, o) => {
    let px, py;
    if (!outline) { px = (rand() - 0.5) * w; py = (rand() - 0.5) * h; }
    else {
      let t = rand() * per;
      if (t < w) { px = t - w / 2; py = h / 2; }
      else if ((t -= w) < h) { px = w / 2; py = h / 2 - t; }
      else if ((t -= h) < w) { px = w / 2 - t; py = -h / 2; }
      else { px = -w / 2; py = -h / 2 + (t - w); }
    }
    out[o] = x + px; out[o + 1] = y + py; out[o + 2] = z;
  };
};

// pick([[weight, sampler], ...]) returns one sampler that draws from the list by weight.
export const pick = (list) => {
  const sum = list.reduce((s, [w]) => s + w, 0);
  return (out, o) => {
    let t = rand() * sum, i = 0;
    while (i < list.length - 1 && (t -= list[i][0]) > 0) i++;
    list[i][1](out, o);
  };
};

// n points from one sampler, as a flat Float32Array (x, y, z per point).
export const sample = (n, sampler) => {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) sampler(out, i * 3);
  return out;
};

// The figure: head, neck, shoulders.
export const BODY = [
  [0.27, sph(0.54, 0, 1.03, 0, 0.82, 1.14, 0.72)], // skull and jaw
  [0.045, sph(0.15, -0.39, 1.02, 0.04, 1.15, 0.46, 0.48)], // quiet profile cue
  [0.08, sph(0.19, 0.42, 1.02, 0.02, 0.48, 0.78, 0.44)], // ear
  [0.08, cyl(0.19, 0.42, 0, 0.42, 0)], // neck
  [0.28, sph(0.9, 0, -0.13, 0, 1.12, 0.62, 0.54)], // shoulders
  [0.21, sph(0.76, 0, -0.73, 0, 0.83, 0.82, 0.48)], // torso
  [0.035, sph(0.43, -0.78, -0.38, 0, 0.6, 1.15, 0.58)], // left upper arm
  [0.035, sph(0.43, 0.78, -0.38, 0, 0.6, 1.15, 0.58)], // right upper arm
];

// Home and Education share a fixed head group, so the neck pivot can turn the head without moving the torso.
export const HEAD_RATIO = 0.38;
export const SIDES = [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0];

// The sample image is split at the neck before sampling. This preserves its profile while keeping head points
// contiguous for the GPU mask. compress < 1 keeps the scene inside narrow phone viewports.
function samplePortrait(n, pool, segment = 'pixels', compress = 1, gold = new Float32Array(n)) {
  const out = new Float32Array(n * 3);
  const source = pool[segment]?.length > 1200 ? pool[segment] : pool.pixels;
  const step = 4;
  for (let i = 0; i < n; i++) {
    const k = Math.floor(rand() * (source.length / step)) * step;
    const x = source[k], y = source[k + 1], luma = source[k + 2];
    // Give the portrait a softly rounded volume so it still reads when the head turns.
    // The uploaded image remains the silhouette map; depth is inferred from its horizontal profile.
    const across = ((x / pool.width) - .5) * 2;
    const depth = Math.sqrt(Math.max(0, 1 - across * across)) * .36;
    const z = (rand() * 2 - 1) * depth + (.5 - luma / 255) * .28;
    out[i * 3] = ((x / pool.width) - .5) * 2.35 * compress;
    out[i * 3 + 1] = (.5 - y / pool.height) * 2.52 * compress;
    out[i * 3 + 2] = z;
    gold[i] = source[k + 3];
  }
  return out;
}

function sampleGraduation(n, base, compress = 1) {
  const out = base.slice();
  const headEnd = Math.round(n * HEAD_RATIO);
  const capEnd = Math.round(n * 0.21);
  const cap = pick([
    [7, box(1.62, 0.07, 1.16, 0, 1.56, 0)],
    [2, box(0.64, 0.24, 0.64, 0, 1.42, 0)],
    [1, cyl(0.014, 0.5, 0.68, 1.27, 0)],
  ]);
  const gown = pick([
    [7, cone(0.86, 1.82, 0, -0.68, 0)],
    [2, sph(0.72, 0, -0.1, 0, 1.18, 0.43, 0.68)],
    [1, box(1.5, 0.1, 0.48, 0, -1.43, 0)],
  ]);
  const stole = rect(0.2, 1.42, 0.15, -0.48, 0.47);
  const diploma = pick([
    [3, cyl(0.1, 0.43, 0.78, -0.1, 0.52)],
    [1, box(0.24, 0.12, 0.16, 0.78, -0.1, 0.52)],
  ]);
  for (let i = 0; i < n; i++) {
    const o = i * 3;
    if (i < capEnd) cap(out, o);
    else if (i >= headEnd) {
      const r = (i - headEnd) / Math.max(1, n - headEnd);
      (r < 0.78 ? gown : r < 0.9 ? stole : diploma)(out, o);
    }
    if (i < capEnd || i >= headEnd) {
      out[o] *= compress;
      out[o + 1] *= compress;
      out[o + 2] *= compress;
    }
  }
  return out;
}

function sampleHelix(n, compress = 1, phase = 0) {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const strand = i & 1;
    const t = i / Math.max(1, n - 1);
    const a = t * Math.PI * 12 + phase + strand * Math.PI;
    const radius = 0.45 + 0.14 * Math.sin(t * Math.PI * 2);
    out[i * 3] = (Math.cos(a) * radius + (rand() - 0.5) * 0.16) * compress;
    out[i * 3 + 1] = ((t - 0.5) * 3.1 + (rand() - 0.5) * 0.16) * compress;
    out[i * 3 + 2] = (Math.sin(a) * radius + (rand() - 0.5) * 0.16) * compress;
  }
  return out;
}

export function buildTargets(n, compress = 1, pool = portraitPool) {
  const tone = new Float32Array(n);
  const headCount = Math.round(n * HEAD_RATIO);
  const body = new Float32Array(n * 3);
  if (pool) {
    samplePortrait(headCount, pool, 'headPixels', compress, tone.subarray(0, headCount)).forEach((v, i) => { body[i] = v; });
    samplePortrait(n - headCount, pool, 'bodyPixels', compress, tone.subarray(headCount)).forEach((v, i) => { body[(i + headCount * 3)] = v; });
  } else {
    const head = sample(headCount, pick([[1, sph(0.54, 0, 0.78, 0, 0.82, 1.14, 0.72)]]));
    const torso = sample(n - headCount, pick(BODY.slice(3)));
    body.set(head);
    body.set(torso, headCount * 3);
  }
  const education = sampleGraduation(n, body, compress);
  const field = Array.from({ length: 9 }, (_, i) => sampleHelix(n, compress, i * 0.045));
  const targets = [body, education, ...field];
  targets.headMask = new Float32Array(n);
  targets.headMask.fill(1, 0, headCount);
  targets.portraitGold = tone;
  targets.faceMask = new Float32Array(n);
  // Keep the small facial points out of the cap range and preserve them in the Education morph.
  const detailStart = Math.round(n * 0.21);
  const detailCount = Math.min(Math.max(45, Math.round(n * 0.0022)), headCount - detailStart);
  for (let j = 0; j < detailCount; j++) {
    const section = Math.floor((j / detailCount) * 3);
    const t = (j - Math.floor((j / detailCount) * 3) * (detailCount / 3)) / (detailCount / 3);
    let x, y;
    if (section === 0) { // one softly arched eye, read in the profile view
      x = -0.42 + t * 0.14;
      y = 0.75 + Math.sin(t * Math.PI) * 0.012;
    } else if (section === 1) { // bridge to tip of the nose
      x = -0.51 - t * 0.13;
      y = 0.68 - t * 0.1;
    } else { // a short mouth line
      x = -0.51 + t * 0.11;
      y = 0.45 + Math.sin(t * Math.PI) * 0.004;
    }
    const index = detailStart + j, o = index * 3;
    body[o] = targets[1][o] = x * compress;
    body[o + 1] = targets[1][o + 1] = y * compress;
    body[o + 2] = targets[1][o + 2] = 0.34 * compress;
    targets.portraitGold[index] = 0;
    targets.faceMask[index] = 1;
  }
  return targets;
}
