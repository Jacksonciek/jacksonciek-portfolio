// Gaze tracks the pointer; a separate smoothed screen-space field repels nearby particles.
const coarse = matchMedia('(pointer: coarse)');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function createInteraction() {
  const state = { x: 0, y: 0, pointerX: 0, pointerY: 0, active: 0 };
  let targetX = 0, targetY = 0, x = 0, y = 0, elapsed = 0;
  let targetPointerX = 0, targetPointerY = 0, pointerX = 0, pointerY = 0;
  let touching = false, targetActive = 0, active = 0;
  const ndcX = (clientX) => (clientX / document.documentElement.clientWidth) * 2 - 1;
  const ndcY = (clientY) => 1 - (clientY / innerHeight) * 2;

  const track = (event) => {
    if (event.pointerType === 'touch' && !touching) return;
    targetX = clamp(ndcX(event.clientX), -1, 1);
    targetY = clamp(ndcY(event.clientY), -1, 1);
    targetPointerX = targetX;
    targetPointerY = targetY;
    targetActive = 1;
  };
  const center = () => {
    targetX = targetY = 0;
    targetActive = 0;
    touching = false;
  };

  window.addEventListener('pointermove', track, { passive: true });
  window.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch') { touching = true; track(event); }
  }, { passive: true });
  window.addEventListener('pointerup', (event) => { if (event.pointerType === 'touch') center(); }, { passive: true });
  window.addEventListener('pointercancel', center, { passive: true });
  document.documentElement.addEventListener('pointerleave', (event) => { if (event.pointerType !== 'touch') center(); });

  function update(dt, motion) {
    if (!motion) {
      x = y = active = elapsed = 0;
      state.x = state.y = state.active = 0;
      return state;
    }
    elapsed += dt;
    const tx = coarse.matches && !touching ? Math.sin(elapsed * 0.35) * 0.1 : targetX;
    const ty = coarse.matches && !touching ? Math.sin(elapsed * 0.23 + 0.8) * 0.055 : targetY;
    const ease = 1 - Math.exp(-5.5 * dt);
    const pointerEase = 1 - Math.exp(-9 * dt);
    x += (tx - x) * ease;
    y += (ty - y) * ease;
    pointerX += (targetPointerX - pointerX) * pointerEase;
    pointerY += (targetPointerY - pointerY) * pointerEase;
    active += (targetActive - active) * pointerEase;
    state.x = x;
    state.y = -y;
    state.pointerX = pointerX;
    state.pointerY = pointerY;
    state.active = touching || !coarse.matches ? active : 0;
    return state;
  }

  return { update };
}
