import { gsap } from 'gsap';
import { lock, unlock } from '../core/scroll.js';
import { motionOn } from '../core/motion.js';

const LABELS = ['Embeddings', 'Prompts', 'Frames', 'Layers', 'Color grading', 'Runtime'];
const MIN = 900, MAX = 3000, KEY = 'jl-splash'; // ms: the counter never outruns MIN, the splash never outlasts MAX
let el, countEl, labelEl, t0, target = 0, shown = 0, ready = false, gone = false, lastK = -1;
const done = () => document.dispatchEvent(new CustomEvent('jl:splash-done'));

function leave() {
  if (gone) return;
  gone = true;
  gsap.ticker.remove(update);
  countEl.textContent = 100;
  try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
  const slide = motionOn();
  el.classList.add(slide ? 'sp-up' : 'sp-fade');
  setTimeout(() => {
    if (el.contains(document.activeElement)) document.getElementById('main').focus({ preventScroll: true });
    el.hidden = true;
    unlock();
    document.body.classList.add('ready');
    done();
  }, slide ? 700 : 200);
}

function update(_, dt) {
  const ms = performance.now() - t0;
  shown += (Math.min(ready ? 1 : target, ms / MIN) - shown) * (1 - Math.exp((-8 * dt) / 1000));
  if (shown > 0.995) shown = 1;
  countEl.textContent = Math.round(shown * 100);
  const k = Math.min(LABELS.length - 1, Math.floor(shown * LABELS.length));
  if (k !== lastK) labelEl.textContent = LABELS[(lastK = k)];
  if ((ready && shown === 1) || ms > MAX) leave();
}

export const splash = {
  init() {
    el = document.getElementById('splash');
    let seen = false;
    try { seen = sessionStorage.getItem(KEY) === '1'; } catch (e) {}
    if (seen) { gone = true; el.hidden = true; document.body.classList.add('ready'); setTimeout(done, 0); return; }
    el.innerHTML = '<div class="sp-in" aria-hidden="true"><p class="sp-label"></p><p class="sp-count">0</p></div>'
      + '<button class="btn btn--secondary sp-skip" type="button">Skip</button>';
    countEl = el.querySelector('.sp-count');
    labelEl = el.querySelector('.sp-label');
    el.querySelector('.sp-skip').addEventListener('click', leave);
    lock();
    t0 = performance.now();
    gsap.ticker.add(update);
  },
  setProgress(p) { target = Math.max(target, Math.min(1, p)); }, // real progress, 0..1, only grows
  finish() { ready = true; }, // all real work is done: the splash may leave once the counter reaches 100
};