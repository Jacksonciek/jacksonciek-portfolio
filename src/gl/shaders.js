import { CanvasTexture, ShaderMaterial, AdditiveBlending, Vector2, Vector3 } from 'three';

const GLYPHS = '.:·+/#%▓'; // light to heavy; the vertex shader picks the cell from density (uDen)
const CELL = 64;

// 512x64 atlas, 8 cells of 64px. Only the alpha channel is read, so the glyphs are plain white.
function makeAtlas() {
  const c = document.createElement('canvas');
  c.width = CELL * GLYPHS.length;
  c.height = CELL;
  const x = c.getContext('2d');
  x.font = 'bold 52px monospace';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillStyle = '#fff';
  [...GLYPHS].forEach((g, i) => x.fillText(g, i * CELL + CELL / 2, CELL / 2 + 2));
  return new CanvasTexture(c); // mipmapped, so small glyphs stay clean
}

const vert = /* glsl */ `
attribute vec3 aB;
attribute float aR;
uniform float uMix, uIn, uPR, uDen, uDis, uSp, uPx, uPy, uTime;
uniform vec2 uMouse, uBurstPos; // NDC
uniform float uAspect, uR, uForce, uGlow, uHover, uBurst;
varying float vG;
varying float vR;
varying float vGlow;

// Random unit vector from one random number (the same point always gets the same direction).
vec3 dir(float s) {
  float a = fract(s * 7919.13) * 6.2831853;
  float z = fract(s * 104.729) * 2. - 1.;
  float r = sqrt(1. - z * z);
  return vec3(r * cos(a), r * sin(a), z);
}

void main() {
  vec3 p = mix(position, aB, uMix);
  p += dir(aR) * sin(3.14159265 * uMix) * uDis * (1.2 + aR);
  p += vec3(sin(uTime * (.4 + aR * .8) + aR * 40.), cos(uTime * (.5 + aR * .7) + aR * 70.), sin(uTime * (.3 + aR * .9) + aR * 25.)) * .015;

  // Hovering a call to action: every point drifts outward from the figure's center.
  p += normalize(p - vec3(uPx, .3, 0.) + dir(aR) * .5) * uHover * (1.5 + aR * 2.);

  // Spin about the vertical axis through the pivot (slowed by hover). A y-axis spin leaves y alone, so uPy is only kept for the pivot contract.
  float sp = uSp * (1. - .7 * uHover);
  float c = cos(sp), s = sin(sp);
  vec3 d = p - vec3(uPx, uPy, 0.);
  p = vec3(uPx + d.x * c + d.z * s, p.y, d.z * c - d.x * s);

  // Intro: every point flies in from a scattered spot. uIn arrives already eased from GSAP; the points start staggered by aR.
  vec3 sc = dir(aR + .5) * (2. + 4. * fract(aR * 57.3));
  sc.z *= .4;
  p = mix(sc, p, clamp((uIn - aR * .3) / .7, 0., 1.));

  vG = min(7., floor(aR * 4. + uDen * 4.));
  vR = aR;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_PointSize = 9. * uPR * (.7 + aR * .6) * (6. / -mv.z);
  vec4 clip = projectionMatrix * mv;

  // Pointer, in screen space (NDC with x scaled by the aspect, so distances are round): points near it swell and get pushed away.
  vec2 ndc = clip.xy / clip.w;
  vec2 dm = (ndc - uMouse) * vec2(uAspect, 1.);
  float d2 = dot(dm, dm);
  float push = exp(-d2 / (uR * uR)) * uForce;
  vGlow = exp(-d2 / (uR * uR * 1.6)) * uGlow;
  gl_PointSize *= 1. + vGlow * .9;
  ndc += dm / max(length(dm), .0001) * vec2(1. / uAspect, 1.) * push * .18 * (.5 + aR);

  // Click burst: points within about .6 of the click jump outward, then spring back as uBurst decays.
  vec2 db = (ndc - uBurstPos) * vec2(uAspect, 1.);
  float bl = length(db);
  ndc += db / max(bl, .0001) * vec2(1. / uAspect, 1.) * (1. - smoothstep(0., .6, bl)) * uBurst * (.9 + aR * 1.4) * .3;

  gl_Position = vec4(ndc * clip.w, clip.zw);
}`;

const frag = /* glsl */ `
uniform sampler2D uA;
uniform vec3 uC, uAccent;
uniform float uTime;
varying float vG;
varying float vR;
varying float vGlow;

void main() {
  float a = texture2D(uA, vec2((vG + gl_PointCoord.x) / 8., 1. - gl_PointCoord.y)).a; // 1. - y: canvas textures are flipped
  if (a < .12) discard;
  if (vR > .97) a *= .6 + .4 * sin(uTime * 4. + vR * 60.); // a few sparkles
  a *= .85 + vGlow * .5;
  float fleck = smoothstep(.91, 1., vR) * (.66 + .34 * sin(uTime * 2. + vR * 90.));
  gl_FragColor = vec4(mix(mix(uC, uAccent, fleck), vec3(1.), vGlow * .6), a * (.78 + fleck * .22));
}`;

// uC holds raw sRGB numbers on purpose: the shader writes them straight to the canvas, so the hex looks exactly like the CSS color.
export function makeMaterial() {
  return new ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uMix: { value: 0 }, uIn: { value: 0 }, uPR: { value: 1 }, uC: { value: new Vector3(1, 1, 1) },
      uAccent: { value: new Vector3(0.84, 0.95, 0.28) },
      uDen: { value: 1 }, uDis: { value: 1 }, uSp: { value: 0 }, uPx: { value: 0 }, uPy: { value: 0 },
      uTime: { value: 0 }, uA: { value: makeAtlas() },
      uMouse: { value: new Vector2() }, uBurstPos: { value: new Vector2() }, uAspect: { value: 1 }, uR: { value: 0.28 },
      uForce: { value: 0 }, uGlow: { value: 0 }, uHover: { value: 0 }, uBurst: { value: 0 },
    },
  });
}
