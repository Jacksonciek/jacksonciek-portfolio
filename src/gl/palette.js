// Background and accent follow the scroll. Each chapter has a color group (data-g on its section, tokens in
// tokens.css); (i, j, e) from jl:chapter blends the current group into the next one. Runs even without WebGL.
const root = document.documentElement;
let groups = [], last = '';

const rgb = (hex) => { const n = parseInt(hex.trim().slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
const blend = (a, b, e) => hex(a.map((v, k) => Math.round(v + (b[k] - v) * e)));

function paint({ i, j, e }) {
  const bg = blend(groups[i].bg, groups[j].bg, e), ac = blend(groups[i].ac, groups[j].ac, e);
  if (bg + ac === last) return; // write only when a hex changes: a :root style change restyles the whole page
  last = bg + ac;
  root.style.setProperty('--bg', bg);
  root.style.setProperty('--ac', ac);
}

export function initPalette() {
  const css = getComputedStyle(root);
  groups = [...document.querySelectorAll('.ch')].map((ch) => ({
    bg: rgb(css.getPropertyValue(`--g-${ch.dataset.g}-bg`)),
    ac: rgb(css.getPropertyValue(`--g-${ch.dataset.g}-ac`)),
  }));
  document.addEventListener('jl:chapter', (ev) => paint(ev.detail));
}
