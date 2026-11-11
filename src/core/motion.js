const KEY = 'jl-motion';
export const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const motionOn = () => !document.body.classList.contains('nm');

function apply(on, btn) {
  document.body.classList.toggle('nm', !on);
  btn?.setAttribute('aria-pressed', String(on));
  if (btn) btn.textContent = on ? 'Motion: on' : 'Motion: off';
}

export function initMotion() {
  const btn = document.getElementById('motion-toggle');
  let on = !RM; // default follows prefers-reduced-motion
  try { on = { on: true, off: false }[sessionStorage.getItem(KEY)] ?? on; } catch (e) {}
  apply(on, btn);
  btn?.addEventListener('click', () => {
    on = !motionOn();
    apply(on, btn);
    try { sessionStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {}
    document.dispatchEvent(new CustomEvent('jl:motion', { detail: on }));
  });
}