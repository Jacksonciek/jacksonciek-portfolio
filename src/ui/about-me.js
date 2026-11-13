import { gsap } from 'gsap';
import { lock, unlock } from '../core/scroll.js';
import { motionOn } from '../core/motion.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function initAboutMe() {
  const dialog = document.getElementById('about-me-dialog');
  if (!dialog) return;
  const panel = dialog.querySelector('.about-panel');
  const closeButton = dialog.querySelector('[data-about-close]');
  let opener = null;
  let isOpen = false;
  let isLocked = false;
  let transition = null;

  const focusable = () => [...dialog.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')]
    .filter((el) => !el.hidden && el.getAttribute('aria-hidden') !== 'true');

  const finishClose = () => {
    dialog.hidden = true;
    isOpen = false;
    document.documentElement.classList.remove('about-open');
    if (isLocked) { unlock(); isLocked = false; }
    const returnTarget = opener?.isConnected && !opener.closest('[inert],[hidden]')
      ? opener
      : document.querySelector('.pill-toggle');
    returnTarget?.focus({ preventScroll: true });
  };

  const open = (trigger) => {
    if (isOpen) return;
    opener = trigger instanceof HTMLElement ? trigger : document.activeElement;
    isOpen = true;
    if (!isLocked) { lock(); isLocked = true; }
    document.documentElement.classList.add('about-open');
    dialog.hidden = false;
    transition?.kill();
    if (!motionOn()) {
      gsap.set(dialog, { autoAlpha: 1 });
      gsap.set(panel, { y: 0, scale: 1, autoAlpha: 1 });
      closeButton.focus({ preventScroll: true });
      return;
    }
    transition = gsap.timeline();
    transition.fromTo(dialog, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.24, ease: 'power2.out' }, 0);
    transition.fromTo(panel, { y: 12, scale: 0.988, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.26, ease: 'power2.out' }, 0);
    requestAnimationFrame(() => closeButton.focus({ preventScroll: true }));
  };

  const close = () => {
    if (!isOpen) return;
    transition?.kill();
    if (!motionOn()) { finishClose(); return; }
    transition = gsap.timeline({ onComplete: finishClose });
    transition.to(panel, { y: 8, scale: 0.99, autoAlpha: 0, duration: 0.2, ease: 'power2.in' }, 0);
    transition.to(dialog, { autoAlpha: 0, duration: 0.22, ease: 'power2.in' }, 0);
  };

  document.addEventListener('click', (event) => {
    const trigger = event.target instanceof Element ? event.target.closest('[data-about-me-open]') : null;
    if (trigger) open(trigger);
  });
  document.addEventListener('jl:about-open', (event) => open(event.detail?.trigger));
  closeButton.addEventListener('click', close);
  document.addEventListener('keydown', (event) => {
    if (!isOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = focusable();
    if (!items.length) { event.preventDefault(); closeButton.focus(); return; }
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
      event.preventDefault(); first.focus();
    }
  });

  const globe = dialog.querySelector('[data-globe-drag]');
  const globeTurn = globe?.querySelector('.about-globe-turn');
  let pointer = null, yaw = 0, pitch = 0;
  const setGlobeRotation = () => { if (globe) globe.style.transform = `perspective(560px) rotateX(${pitch}deg) rotateY(${yaw}deg)`; };
  globe?.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    globe.classList.add('is-dragging');
    globe.setPointerCapture(event.pointerId);
  });
  globe?.addEventListener('pointermove', (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    yaw += (event.clientX - pointer.x) * 0.42;
    pitch = clamp(pitch - (event.clientY - pointer.y) * 0.32, -24, 24);
    pointer.x = event.clientX; pointer.y = event.clientY;
    setGlobeRotation();
  });
  const endGlobeDrag = (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    pointer = null;
    globe.classList.remove('is-dragging');
  };
  globe?.addEventListener('pointerup', endGlobeDrag);
  globe?.addEventListener('pointercancel', endGlobeDrag);
  globe?.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 12 : 5;
    if (event.key === 'ArrowLeft') yaw -= step;
    else if (event.key === 'ArrowRight') yaw += step;
    else if (event.key === 'ArrowUp') pitch = clamp(pitch - step, -24, 24);
    else if (event.key === 'ArrowDown') pitch = clamp(pitch + step, -24, 24);
    else return;
    event.preventDefault(); setGlobeRotation();
  });

  const toolbox = dialog.querySelector('[data-toolbox-drag]');
  let toolboxPointer = null, x = 0, y = 0;
  const setToolboxPosition = () => { toolbox.style.translate = `${x}px ${y}px`; };
  toolbox?.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    toolboxPointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    toolbox.classList.add('is-dragging');
    toolbox.setPointerCapture(event.pointerId);
  });
  toolbox?.addEventListener('pointermove', (event) => {
    if (!toolboxPointer || toolboxPointer.id !== event.pointerId) return;
    x = clamp(x + event.clientX - toolboxPointer.x, -26, 26);
    y = clamp(y + event.clientY - toolboxPointer.y, -18, 18);
    toolboxPointer.x = event.clientX; toolboxPointer.y = event.clientY;
    setToolboxPosition();
  });
  const endToolboxDrag = (event) => {
    if (!toolboxPointer || toolboxPointer.id !== event.pointerId) return;
    toolboxPointer = null;
    toolbox.classList.remove('is-dragging');
  };
  toolbox?.addEventListener('pointerup', endToolboxDrag);
  toolbox?.addEventListener('pointercancel', endToolboxDrag);
  toolbox?.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 20 : 8;
    if (event.key === 'ArrowLeft') x = clamp(x - step, -26, 26);
    else if (event.key === 'ArrowRight') x = clamp(x + step, -26, 26);
    else if (event.key === 'ArrowUp') y = clamp(y - step, -18, 18);
    else if (event.key === 'ArrowDown') y = clamp(y + step, -18, 18);
    else return;
    event.preventDefault(); setToolboxPosition();
  });
  if (globeTurn) globeTurn.setAttribute('aria-hidden', 'true');
}
