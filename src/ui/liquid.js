function bloom(target, x, y) {
  target.style.setProperty('--liquid-x', `${x}px`);
  target.style.setProperty('--liquid-y', `${y}px`);
  target.classList.remove('liquid-active');
  void target.offsetWidth;
  target.classList.add('liquid-active');
  target.addEventListener('animationend', () => target.classList.remove('liquid-active'), { once: true });
}

export function initLiquid() {
  document.addEventListener('pointerdown', (event) => {
    const target = event.target.closest('.btn, .pill-jl, .pill-q, .project-mini-card, .project-scene, .design-board, .text-link, .contact-card, .social-tile');
    if (!target) return;
    const rect = target.getBoundingClientRect();
    bloom(target, event.clientX - rect.left, event.clientY - rect.top);
  }, { passive: true });

  document.addEventListener('click', (event) => {
    if (event.detail !== 0) return;
    const target = event.target.closest('.btn, .pill-jl, .pill-q, .project-mini-card, .project-scene, .design-board, .text-link, .contact-card, .social-tile');
    if (!target) return;
    const rect = target.getBoundingClientRect();
    bloom(target, rect.width / 2, rect.height / 2);
  });
}
