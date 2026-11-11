import { gsap } from 'gsap';
import { lock, unlock } from '../core/scroll.js';
import { motionOn } from '../core/motion.js';

const LABELS = ['Collecting the details', 'Building the scene', 'Connecting the ideas', 'Ready to explore'];
const MIN = 900, MAX = 3400, KEY = 'jl-splash';
let el, countEl, labelEl, barEl, t0, target = 0, shown = 0, ready = false, gone = false, lastK = -1;
const done = () => document.dispatchEvent(new CustomEvent('jl:splash-done'));

function leave() {
  if (gone) return;
  gone = true;
  gsap.ticker.remove(update);
  countEl.textContent = '100';
  barEl.style.setProperty('--progress', '100%');
  try { sessionStorage.setItem(KEY, '1'); } catch {}
  const slide = motionOn();
  el.classList.add(slide ? 'sp-up' : 'sp-fade');
  setTimeout(() => {
    if (el.contains(document.activeElement)) document.getElementById('main').focus({ preventScroll: true });
    el.hidden = true;
    unlock();
    document.body.classList.add('ready');
    done();
  }, slide ? 760 : 200);
}

function update(_, dt) {
  const ms = performance.now() - t0;
  shown += (Math.min(ready ? 1 : target, ms / MIN) - shown) * (1 - Math.exp((-8 * dt) / 1000));
  if (shown > 0.995) shown = 1;
  countEl.textContent = String(Math.round(shown * 100)).padStart(2, '0');
  barEl.style.setProperty('--progress', `${shown * 100}%`);
  const k = Math.min(LABELS.length - 1, Math.floor(shown * LABELS.length));
  if (k !== lastK) labelEl.textContent = LABELS[(lastK = k)];
  if ((ready && shown === 1) || ms > MAX) leave();
}

export const splash = {
  init() {
    el = document.getElementById('splash');
    let seen = false;
    try { seen = sessionStorage.getItem(KEY) === '1'; } catch {}
    if (seen) { gone = true; el.hidden = true; document.body.classList.add('ready'); setTimeout(done, 0); return; }
    el.innerHTML = `<div class="sp-shell" aria-hidden="true">
      <div class="sp-top"><span class="sp-monogram">JL<span> / 26</span></span><span class="sp-index">Portfolio / 2026<br>AI × design × code</span></div>
      <div class="sp-center"><div class="sp-orb"><i></i><b></b><span class="sp-count">00</span></div><p class="sp-label">Loading type</p><div class="sp-meter"><i></i></div></div>
      <div class="sp-bottom"><span>Jackson Lawrence</span><span>Creative technologist · Tangerang, Indonesia</span></div>
    </div><button class="btn btn--secondary sp-skip" type="button">Skip intro <span aria-hidden="true">↗</span></button>`;
    countEl = el.querySelector('.sp-count');
    labelEl = el.querySelector('.sp-label');
    barEl = el.querySelector('.sp-meter');
    el.querySelector('.sp-skip').addEventListener('click', leave);
    lock();
    t0 = performance.now();
    gsap.ticker.add(update);
  },
  setProgress(p) { target = Math.max(target, Math.min(1, p)); },
  finish() { ready = true; },
};
