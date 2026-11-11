import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Count once on chapter entry rather than scrubbing the number with scroll; a visitor who pauses
// mid-chapter should still see the complete, factual value.
const fmt = (b, v) => {
  const d = +b.dataset.dec || 0;
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) + (b.dataset.suffix || '');
};

const active = new Set();

export function addCounters(_tl, ch) {
  ch.querySelectorAll('.ct').forEach((b) => {
    const s = { v: 0 };
    b.textContent = fmt(b, 0);
    ScrollTrigger.create({
      trigger: ch,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        let tween;
        tween = gsap.to(s, { v: +b.dataset.to, duration: 1.05, ease: 'power2.out',
          onUpdate: () => { b.textContent = fmt(b, s.v); },
          onComplete: () => active.delete(tween),
        });
        active.add(tween);
      },
    });
  });
}

export function resetCounters() {
  active.forEach((tween) => tween.kill());
  active.clear();
  document.querySelectorAll('.ct').forEach((b) => { b.textContent = fmt(b, +b.dataset.to); });
}
