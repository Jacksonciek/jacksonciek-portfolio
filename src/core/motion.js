const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
export let RM = preference.matches;
export const motionOn = () => !RM;

function applyReducedMotion(reduced) {
  RM = reduced;
  document.body.classList.toggle('nm', reduced);
  document.dispatchEvent(new CustomEvent('jl:motion', { detail: !reduced }));
}

export function initMotion() {
  document.body.classList.toggle('nm', RM);
  preference.addEventListener('change', (event) => applyReducedMotion(event.matches));
}
