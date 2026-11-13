import { MOTION_TOKENS } from '../config.js';

let overlay;

function bloom(x, y) {
  const ring = document.createElement('i');
  ring.className = 'click-ring';
  ring.style.setProperty('--click-duration', String(MOTION_TOKENS.click.duration) + 's');
  ring.setAttribute('aria-hidden', 'true');
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  ring.style.width = `${MOTION_TOKENS.click.diameter}px`;
  ring.style.height = `${MOTION_TOKENS.click.diameter}px`;
  overlay.append(ring);
  ring.addEventListener('animationend', () => ring.remove(), { once: true });
}

export function initLiquid() {
  overlay = document.createElement('div');
  overlay.id = 'liquid-effect';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.append(overlay);

  document.addEventListener('click', (event) => {
    if (event.clientX || event.clientY) {
      bloom(event.clientX, event.clientY);
      return;
    }
    const rect = event.target instanceof Element
      ? event.target.getBoundingClientRect()
      : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    bloom(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }, { passive: true });
}
