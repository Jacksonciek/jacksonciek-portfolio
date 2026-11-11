import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motionOn } from './motion.js';

gsap.registerPlugin(ScrollTrigger);
let lenis = null, locks = 0;
const tick = (t) => lenis && lenis.raf(t * 1000);

function sync() { // Lenis only smooths; it exists only while Motion is on
  if (motionOn() && !lenis) {
    lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    if (locks) lenis.stop();
  } else if (!motionOn() && lenis) {
    gsap.ticker.remove(tick);
    lenis.destroy();
    lenis = null;
  }
}
export function initScroll() { sync(); document.addEventListener('jl:motion', sync); }

export function lock() { locks++; lenis?.stop(); document.documentElement.classList.add('is-locked'); }
export function unlock() {
  if (--locks > 0) return;
  locks = 0;
  lenis?.start();
  document.documentElement.classList.remove('is-locked');
}

export function scrollToChapter(i) {
  const el = document.querySelectorAll('.ch')[i];
  if (!el) return;
  const y = i === 0 ? 0 : el.getBoundingClientRect().top + scrollY + 0.22 * (el.offsetHeight - innerHeight);
  if (lenis) lenis.scrollTo(y, { duration: 1.2, force: true });
  else window.scrollTo({ top: y, behavior: 'auto' });
}