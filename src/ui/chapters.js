import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motionOn } from '../core/motion.js';
import { addCounters, resetCounters } from './counters.js';

gsap.registerPlugin(ScrollTrigger);
const GAPS = [0.010, 0.022, 0.014, 0.019, 0.012]; // uneven delays between .fx items, in progress units
let ctx = null;
let chapterState = { i: 0, j: 1, e: 0, id: 'home', progress: 0 };

export function getCurrentChapter() { return chapterState; }

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// Wraps every word of a headline as .w > .wi (clipped mask + mover). Idempotent.
// The heading keeps its accessible name through aria-label; the word spans are aria-hidden.
function splitWords(h) {
  if (!h.dataset.split) {
    if (!h.hasAttribute('aria-label')) h.setAttribute('aria-label', (h.innerText || h.textContent).replace(/\s+/g, ' ').trim());
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 1) return walk(n);
      if (n.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).filter(Boolean).forEach((part) => {
        if (!part.trim()) return frag.append(part);
        const w = document.createElement('span'), wi = document.createElement('span');
        w.className = 'w'; wi.className = 'wi'; wi.textContent = part;
        w.setAttribute('aria-hidden', 'true'); w.append(wi); frag.append(w);
      });
      n.replaceWith(frag);
    });
    walk(h);
    h.dataset.split = '1';
  }
  return [...h.querySelectorAll('.wi')];
}

function build() {
  ctx = gsap.context(() => {
    document.querySelectorAll('.ch').forEach((ch, i, all) => {
      const words = [...ch.querySelectorAll('.rv')].flatMap(splitWords);
      const fx = ch.querySelectorAll('.fx');
      const notifyEducation = (self) => {
        if (ch.id === 'education') document.dispatchEvent(new CustomEvent('jl:education-progress', { detail: { progress: self.progress } }));
      };
      const tl = gsap.timeline({
        defaults: { ease: 'none' }, // scrubbed motion has no curve; Lenis does the smoothing
        scrollTrigger: { trigger: ch, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: notifyEducation, onRefresh: notifyEducation },
      });
      if (i > 0) { // enter over 0 to .18 (Home is already in place at progress 0; Stage 5 owns its entrance)
        if (words.length) tl.fromTo(words, { yPercent: 130 }, { yPercent: 0, duration: 0.07, stagger: 0.008 }, 0);
        let at = 0.02;
        fx.forEach((el, k) => { tl.fromTo(el, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.07 }, at); at += GAPS[k % GAPS.length]; });
      }
      if (i < all.length - 1) { // leave over .8 to .95 (Contact stays, so its buttons remain clickable)
        if (words.length) tl.to(words, { yPercent: -130, duration: 0.1, stagger: 0.006 }, 0.8);
        if (fx.length) tl.to(fx, { y: -20, opacity: 0, duration: 0.1, stagger: 0.007 }, 0.8);
      }
      addCounters(tl, ch);
      tl.call(() => {}, [], 1); // keep progress normalized to the full chapter without a dummy GSAP target
    });
  });
}

// One ScrollTrigger over <main> emits jl:chapter {i, j, e}. It runs in every motion mode (the nav label needs it).
function initEmitter() {
  const secs = [...document.querySelectorAll('.ch')];
  let tops = [], hs = [], last = '';
  const emit = (s) => {
    let i = 0;
    while (i < secs.length - 1 && s >= tops[i + 1]) i++;
    const j = Math.min(i + 1, secs.length - 1);
    const progress = Math.max(0, Math.min(1, (s - tops[i]) / Math.max(1, hs[i] - innerHeight)));
    const e = i === j ? 0 : smooth(0.7, 1, progress);
    const key = `${i}|${j}|${e.toFixed(3)}`;
    chapterState = { i, j, e, id: secs[i]?.id, progress };
    if (key === last) return;
    last = key;
    document.dispatchEvent(new CustomEvent('jl:chapter', { detail: chapterState }));
  };
  const measure = (s = scrollY) => {
    tops = secs.map((section) => section.getBoundingClientRect().top + scrollY);
    hs = secs.map((section) => section.offsetHeight);
    emit(s);
  };
  ScrollTrigger.create({
    trigger: 'main', start: 'top top', end: 'bottom bottom',
    onRefresh: (self) => measure(self.scroll()),
    onUpdate: (self) => emit(self.scroll()),
  });
  // Browser scroll restoration can happen after the first ScrollTrigger refresh.
  // Measure again after paint so the GL scene starts on the chapter actually in view.
  const syncRestoredScroll = () => [0, 120, 450].forEach((delay) => {
    setTimeout(() => requestAnimationFrame(() => measure(scrollY)), delay);
  });
  requestAnimationFrame(syncRestoredScroll);
  window.addEventListener('pageshow', syncRestoredScroll);
  window.addEventListener('load', syncRestoredScroll, { once: true });
}

// Routed project pages can leave the scroll-scrubbed Home exit styles inline.
// Clear them on return so the hero is readable again at scroll position zero.
document.addEventListener('jl:home-return', () => {
  document.querySelectorAll('#home .fx').forEach((el) => {
    el.style.removeProperty('opacity');
    el.style.removeProperty('transform');
    el.classList.add('is-in');
  });
});

export function initChapters() {
  initEmitter();
  const sync = () => {
    if (motionOn() && !ctx) build();
    else if (!motionOn() && ctx) { ctx.revert(); ctx = null; resetCounters(); }
  };
  sync();
  document.addEventListener('jl:motion', sync);
}
