import { gsap } from 'gsap';
import { lock, unlock } from '../core/scroll.js';
import { motionOn } from '../core/motion.js';

const MIN = 900, MAX = 3200, KEY = 'jl-splash';
let el, countEl, labelEl, barEl, t0, target = 0, shown = 0, ready = false, gone = false;
const done = () => document.dispatchEvent(new CustomEvent('jl:splash-done'));

function leave(reason) {
  if (gone) return;
  gone = true;
  gsap.ticker.remove(update);
  if (reason === 'complete') {
    shown = 1;
    labelEl.textContent = 'Ready to enter';
  } else if (reason === 'fallback') {
    labelEl.textContent = 'Entering with available assets';
  } else {
    labelEl.textContent = 'Entering the portfolio';
  }
  countEl.textContent = String(Math.round(shown * 100)).padStart(3, '0');
  barEl.style.setProperty('--progress', String(shown));
  try { sessionStorage.setItem(KEY, '1'); } catch {}
  const slide = motionOn();
  el.classList.add(slide ? 'sp-up' : 'sp-fade');
  setTimeout(() => {
    if (el.contains(document.activeElement)) document.getElementById('main').focus({ preventScroll: true });
    el.hidden = true;
    unlock();
    document.body.classList.add('ready');
    done();
  }, slide ? 760 : 180);
}

function update(_, dt) {
  const ms = performance.now() - t0;
  const cap = ready ? 1 : Math.min(target, ms / MIN);
  shown += (cap - shown) * (1 - Math.exp((-8 * dt) / 1000));
  if (ready && shown > 0.995) shown = 1;
  countEl.textContent = String(Math.round(shown * 100)).padStart(3, '0');
  barEl.style.setProperty('--progress', String(shown));
  if (ready && shown === 1) leave('complete');
  else if (ms > MAX) leave('fallback');
}

export const splash = {
  init() {
    el = document.getElementById('splash');
    let seen = false;
    try { seen = sessionStorage.getItem(KEY) === '1'; } catch {}
    if (seen) {
      gone = true;
      el.hidden = true;
      document.body.classList.add('ready');
      setTimeout(done, 0);
      return;
    }
    el.innerHTML = `<div class="sp-shell" aria-hidden="true">
      <div class="sp-top"><span class="sp-monogram">JL<span> / 26</span></span><span class="sp-index">PORTFOLIO<br>AI × DESIGN × CODE</span></div>
      <div class="sp-center"><p class="sp-kicker">Jackson Lawrence · Creative Technologist</p><div class="sp-count-wrap"><span class="sp-count">000</span><span class="sp-unit">%</span></div><div class="sp-meter"><i></i></div><p class="sp-label">Preparing type</p></div>
      <div class="sp-bottom"><span>Jackson Lawrence</span><span>Creative technologist · Tangerang, Indonesia</span></div>
    </div><button class="btn btn--secondary sp-skip" type="button">Skip intro <span aria-hidden="true">↗</span></button>`;
    countEl = el.querySelector('.sp-count');
    labelEl = el.querySelector('.sp-label');
    barEl = el.querySelector('.sp-meter');
    el.classList.add('sp-active');
    el.querySelector('.sp-skip').addEventListener('click', () => leave('skip'));
    lock();
    t0 = performance.now();
    gsap.ticker.add(update);
  },
  setProgress(progress, label) {
    target = Math.max(target, Math.min(1, progress));
    if (labelEl && label) labelEl.textContent = label;
  },
  finish() { ready = true; },
};
