// Counters count with their chapter's scroll progress (.05 to .4). The final values stay in the HTML,
// so without JS (or with Motion off) the numbers are simply static.
const fmt = (b, v) => {
  const d = +b.dataset.dec || 0;
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) + (b.dataset.suffix || '');
};

export function addCounters(tl, ch) {
  ch.querySelectorAll('.ct').forEach((b) => {
    const s = { v: 0 };
    b.textContent = fmt(b, 0);
    tl.to(s, { v: +b.dataset.to, duration: 0.35, onUpdate: () => { b.textContent = fmt(b, s.v); } }, 0.05);
  });
}

export function resetCounters() {
  document.querySelectorAll('.ct').forEach((b) => { b.textContent = fmt(b, +b.dataset.to); });
}