// Cursor gaze is applied only to particles in the head mask. Touch screens get a quiet automatic look.
const coarse = matchMedia('(pointer: coarse)');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function createInteraction() {
  const gaze = { x: 0, y: 0 };
  let targetX = 0, targetY = 0, x = 0, y = 0, elapsed = 0;
  let touching = false;
  const ndcX = (clientX) => (clientX / document.documentElement.clientWidth) * 2 - 1;
  const ndcY = (clientY) => 1 - (clientY / innerHeight) * 2;

  const track = (event) => {
    if (event.pointerType === 'touch' && !touching) return;
    targetX = clamp(ndcX(event.clientX), -1, 1);
    targetY = clamp(ndcY(event.clientY), -1, 1);
  };
  const center = () => { targetX = targetY = 0; touching = false; };

  window.addEventListener('pointermove', track, { passive: true });
  window.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch') { touching = true; track(event); }
  }, { passive: true });
  window.addEventListener('pointerup', (event) => { if (event.pointerType === 'touch') center(); }, { passive: true });
  window.addEventListener('pointercancel', center, { passive: true });
  document.documentElement.addEventListener('pointerleave', (event) => { if (event.pointerType !== 'touch') center(); });

  function update(dt, motion) {
    if (!motion) {
      x = y = elapsed = 0;
      gaze.x = gaze.y = 0;
      return gaze;
    }
    elapsed += dt;
    const tx = coarse.matches ? Math.sin(elapsed * 0.35) * 0.1 : targetX;
    const ty = coarse.matches ? Math.sin(elapsed * 0.23 + 0.8) * 0.055 : targetY;
    const ease = 1 - Math.exp(-5.5 * dt);
    x += (tx - x) * ease;
    y += (ty - y) * ease;
    gaze.x = x;
    gaze.y = -y;
    return gaze;
  }

  return { update };
}
