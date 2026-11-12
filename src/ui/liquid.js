let overlay;

function bloom(x, y) {
  const drop = document.createElement('i');
  drop.className = 'liquid-drop';
  drop.setAttribute('aria-hidden', 'true');
  drop.style.setProperty('--liquid-x', `${x}px`);
  drop.style.setProperty('--liquid-y', `${y}px`);
  overlay.append(drop);
  drop.addEventListener('animationend', () => drop.remove(), { once: true });
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
