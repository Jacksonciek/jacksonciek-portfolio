import { CanvasTexture, ShaderMaterial, AdditiveBlending, Vector3 } from 'three';

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
varying float vG;
varying float vR;

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

  // Spin about the vertical axis through the pivot. A y-axis spin leaves y alone, so uPy is only kept for the pivot contract.
  float c = cos(uSp), s = sin(uSp);
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
  gl_Position = projectionMatrix * mv;
}`;

const frag = /* glsl */ `
uniform sampler2D uA;
uniform vec3 uC;
uniform float uTime;
varying float vG;
varying float vR;

void main() {
  float a = texture2D(uA, vec2((vG + gl_PointCoord.x) / 8., 1. - gl_PointCoord.y)).a; // 1. - y: canvas textures are flipped
  if (a < .12) discard;
  if (vR > .97) a *= .6 + .4 * sin(uTime * 4. + vR * 60.); // a few sparkles
  gl_FragColor = vec4(uC, a * .95);
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
      uDen: { value: 1 }, uDis: { value: 1 }, uSp: { value: 0 }, uPx: { value: 0 }, uPy: { value: 0 },
      uTime: { value: 0 }, uA: { value: makeAtlas() },
    },
  });
}