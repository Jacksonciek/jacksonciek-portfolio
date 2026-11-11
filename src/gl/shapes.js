// Surface samplers. Each one is a function (out, o) that writes x, y, z into out[o], out[o+1], out[o+2].
// Signature: primitive(size args, then x, y, z of its center). Stage 3b builds the chapter objects from these.
const TAU = Math.PI * 2;
const rand = Math.random;

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
  [0.35, sph(0.5, 0, 1, 0)],
  [0.05, cyl(0.18, 0.4, 0, 0.45, 0)],
  [0.6, sph(1, 0, -0.25, 0, 0.95, 0.62, 0.45)],
];

// ---- Stage 3b: chapter objects and the seven targets ----
// Chapter order: home, education, experience, projects, design, video, contact.
// Side per chapter: +1 = figure on the right (text on the left), -1 = figure on the left.
export const SIDES = [1, -1, 1, -1, 1, -1, 1];

// One recipe per chapter object, as a [weight, sampler] list. Every x is multiplied by m (the chapter's side,
// scaled down on phones), so the object always sits on the screen-center side of the figure.
const edu = (m) => [
  [3, box(1.3, 0.07, 1.3, 0, 1.78, 0)], // mortarboard
  [2, cyl(0.42, 0.26, 0, 1.6, 0)], // cap band
  [1, cyl(0.02, 0.55, 0.62 * m, 1.4, 0)], // tassel
  [2, box(1.1, 0.16, 0.16, -1 * m, -0.4, 0.6)], // diploma
];
const exp = (m) => [
  [3, box(1.3, 0.06, 0.9, -1.3 * m, -0.6, 0.5)], // laptop base
  [3, box(1.3, 0.85, 0.05, -1.3 * m, -0.15, 0.1)], // laptop screen
  [2, cyl(0.3, 0.45, -1.5 * m, 0.9, 0)], // database, lower disc
  [2, cyl(0.3, 0.45, -1.5 * m, 1.4, 0)], // database, upper disc
  [2, box(0.7, 0.45, 0.05, -0.9 * m, 1.7, 0)], // envelope
];
const prj = (m) => [
  [4, rect(1.7, 1.15, -1.4 * m, 0.7, 0.5, true)], // browser window outline
  [1, rect(1.7, 1.15, -1.4 * m, 0.7, 0.5)], // window fill
  [1, rect(1.7, 0.18, -1.4 * m, 1.18, 0.5)], // title bar
];
const dsn = (m) => [
  [2, cyl(0.06, 1.5, -1.5 * m, 0.4, 0.5)], // stylus
  [1, cone(0.07, 0.25, -1.5 * m, -0.45, 0.5)], // stylus tip
  [3, rect(1, 1.4, -1.1 * m, 1, 0.3, true)], // canvas outline
  [1, rect(1, 1.4, -1.1 * m, 1, 0.3)], // canvas fill
];
const vid = (m) => [
  [4, box(1.1, 0.7, 0.6, -1.3 * m, 0.3, 0.4)], // camera body
  [2, sph(0.28, -1.3 * m, 0.3, 0.8, 1, 1, 0.7)], // lens
  [2, box(0.3, 1.3, 0.03, -2 * m, -0.2, 0.2)], // film strip
];
const OBJECTS = [null, edu, exp, prj, dsn, vid, null]; // home and contact: the plain figure

// One Float32Array (n points) per chapter. The first 60% of the points are the SAME body samples in every chapter,
// so the figure holds still and only the object morphs. The last 40% are the chapter's object (Home and Contact
// use more body there). compress < 1 pulls the objects toward the figure (phones: centered figure, narrow screen).
export function buildTargets(n, compress = 1) {
  const body = sample(n, pick(BODY)), nb = Math.round(n * 0.6);
  return OBJECTS.map((make, c) => {
    const t = body.slice();
    if (make) {
      const obj = pick(make(SIDES[c] * compress));
      for (let k = nb; k < n; k++) obj(t, k * 3);
    }
    return t;
  });
}
