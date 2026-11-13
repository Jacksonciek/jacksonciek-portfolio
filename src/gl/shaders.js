import { CanvasTexture, ShaderMaterial, AdditiveBlending, Vector2, Vector3 } from 'three';

const GLYPHS = ' .:·+/#%'; // light to heavy; the vertex shader picks the cell from density (uDen)
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
attribute float aHead;
attribute float aGold;
attribute float aFace;
uniform float uMix, uIn, uPR, uDen, uDis, uTime, uHead;
uniform float uRepel;
uniform vec2 uLook, uPointer, uViewport;
varying float vG;
varying float vR;
varying float vGold;
varying float vFace;

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

  // Rotate only head and cap points around the neck. The torso follows the scroll morph directly.
  vec3 hp = p - vec3(0., .16, 0.);
  float hy = clamp(uLook.x, -1., 1.) * .28;
  float hx = clamp(uLook.y, -1., 1.) * .12;
  float cy = cos(hy), sy = sin(hy), cx = cos(hx), sx = sin(hx);
  vec3 turnedHead = vec3(hp.x * cy + hp.z * sy, hp.y * cx - hp.z * sx, -hp.x * sy + hp.z * cy);
  p = mix(p, vec3(0., .16, 0.) + turnedHead, aHead * uHead);

  // Intro: every point flies in from a scattered spot. uIn arrives already eased from GSAP; the points start staggered by aR.
  vec3 sc = dir(aR + .5) * (2. + 4. * fract(aR * 57.3));
  sc.z *= .4;
  p = mix(sc, p, clamp((uIn - aR * .3) / .7, 0., 1.));

  vG = min(7., floor(aR * 4. + uDen * 4.));
  vR = aR;
  vGold = aGold;
  vFace = aFace * uHead;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_PointSize = 4.6 * uPR * (.72 + aR * .55) * (6. / -mv.z) * (1. + aFace * uHead * .45);
  vec4 clip = projectionMatrix * mv;
  vec2 screen = clip.xy / clip.w;
  vec2 away = (screen - uPointer) * uViewport * .5;
  float distanceToPointer = length(away);
  float influence = (1. - smoothstep(0., 112., distanceToPointer)) * uRepel;
  vec2 direction = away / max(distanceToPointer, .001);
  clip.xy += direction * influence * (72. / uViewport) * 2. * clip.w;
  gl_Position = clip;
}`;

const frag = /* glsl */ `
uniform sampler2D uA;
uniform vec3 uC, uAccent, uFace;
uniform float uTime;
varying float vG;
varying float vR;
varying float vGold;
varying float vFace;

void main() {
  float a = texture2D(uA, vec2((vG + gl_PointCoord.x) / 8., 1. - gl_PointCoord.y)).a; // 1. - y: canvas textures are flipped
  float faceDot = 1. - smoothstep(.28, .5, length(gl_PointCoord - vec2(.5)));
  a = max(a, faceDot * vFace);
  if (a < .12) discard;
  if (vR > .97) a *= .6 + .4 * sin(uTime * 4. + vR * 60.); // a few sparkles
  float fleck = max(smoothstep(.94, 1., vR) * (.66 + .34 * sin(uTime * 2. + vR * 90.)), vGold * .9);
  vec3 bodyTone = mix(uC, vec3(.68, .94, .8), .36);
  vec3 baseTone = mix(bodyTone, uAccent, fleck);
  vec3 faceTone = mix(baseTone, uFace, smoothstep(.3, 1., vFace));
  gl_FragColor = vec4(faceTone, a * (.88 + fleck * .2 + vFace * .08));
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
      uAccent: { value: new Vector3(0.35, 1, 0.63) }, uFace: { value: new Vector3(0.91, 0.94, 0.94) },
      uDen: { value: 1 }, uDis: { value: 1 }, uHead: { value: 1 },
      uTime: { value: 0 }, uA: { value: makeAtlas() }, uLook: { value: new Vector2() },
      uPointer: { value: new Vector2() }, uViewport: { value: new Vector2(1, 1) }, uRepel: { value: 0 },
    },
  });
}
