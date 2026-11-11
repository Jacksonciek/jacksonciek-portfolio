// Pointer effects. The visual work happens in the vertex shader; this module only feeds its uniforms:
// uMouse (smoothed, NDC), uForce (pointer speed), uGlow (pointer present), uBurst + uBurstPos (click burst), uHover.
// update() also returns the gaze (x and y in -.5..+.5) that scene.js turns into a head turn.
const fine = matchMedia('(hover:hover) and (pointer:fine)');
const SKIP = 'a,button,input,textarea,select,nav,dialog,[role="dialog"],.shelf,#quick,#pg,#viewer,#splash'; // clicks here never burst
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function createInteraction(u) {
  const gaze = { x: 0, y: 0 }; // one object, reused every frame
  let tx = 0, ty = 0, mx = 0, my = 0; // pointer in NDC: target and smoothed
  let lx = 0, ly = 0, moved = 0, has = false; // last pointer position, pixels moved since the last frame
  let force = 0, glow = 0, glowTo = 0, burst = 0, hover = 0, hoverTo = 0;
  let on = true, touching = false;
  const ndcX = (x) => (x / document.documentElement.clientWidth) * 2 - 1;
  const ndcY = (y) => 1 - (y / innerHeight) * 2;

  const track = (e) => {
    if (e.pointerType === 'touch' && !touching) return; // a finger only counts while it is down
    tx = ndcX(e.clientX);
    ty = ndcY(e.clientY);
    if (has) moved += Math.hypot(e.clientX - lx, e.clientY - ly);
    else { mx = tx; my = ty; has = true; } // first sample: start under the pointer, no sweep from the center
    lx = e.clientX;
    ly = e.clientY;
    glowTo = 1;
  };
  const off = () => { glowTo = 0; tx = ty = 0; has = false; touching = false; }; // glow fades, gaze returns to center

  window.addEventListener('pointermove', track, { passive: true });
  window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') { touching = true; has = false; track(e); } }, { passive: true });
  window.addEventListener('pointerup', (e) => { if (e.pointerType === 'touch') off(); }, { passive: true });
  window.addEventListener('pointercancel', off, { passive: true }); // the browser took the touch over for scrolling
  document.documentElement.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') off(); });

  // Click or tap burst: Home only, and never on controls.
  window.addEventListener('click', (e) => {
    if (!on || !document.body.classList.contains('ready') || scrollY > innerHeight * 0.8 || e.target.closest?.(SKIP)) return;
    u.uBurstPos.value.set(ndcX(e.clientX), ndcY(e.clientY));
    burst = 1;
  });

  // Hover over a [data-disperse] control: fine pointers only. Delegated, so controls added later work too.
  const setHover = (v) => { hoverTo = v ? 1 : 0; };
  document.addEventListener('pointerover', (e) => { if (fine.matches && e.target.closest?.('[data-disperse]')) setHover(true); });
  document.addEventListener('pointerout', (e) => {
    const el = e.target.closest?.('[data-disperse]');
    if (el && !el.contains(e.relatedTarget)) setHover(false);
  });

  // Called once per frame with dt in seconds. Motion off: everything is zero, nothing reacts.
  function update(dt, motion) {
    on = motion;
    if (!motion) {
      mx = my = force = glow = burst = hover = moved = 0;
      u.uForce.value = u.uGlow.value = u.uBurst.value = u.uHover.value = 0;
      gaze.x = gaze.y = 0;
      return gaze;
    }
    const k = 1 - Math.exp(-16 * dt);
    mx += (tx - mx) * k;
    my += (ty - my) * k;
    const want = clamp(moved / (Math.max(dt, 0.001) * 60) / 16, 0, 1); // pixels per 60 Hz frame; 16 px per frame = full push
    moved = 0;
    force = want > force ? force + (want - force) * (1 - Math.exp(-30 * dt)) : force * Math.pow(0.9, dt * 60); // up fast, down about 0.9 per frame
    glow += (glowTo - glow) * (1 - Math.exp(-8 * dt)); // about 400 ms to fade out
    burst *= Math.exp(-3.7 * dt);
    hover += (hoverTo - hover) * (1 - Math.exp(-6 * dt));
    u.uMouse.value.set(mx, my);
    u.uForce.value = force;
    u.uGlow.value = glow;
    u.uBurst.value = burst;
    u.uHover.value = hover;
    gaze.x = mx * 0.5;
    gaze.y = -my * 0.5; // NDC y points up, the gaze y points down (mouse below the figure = look down)
    return gaze;
  }

  return { update, setHover };
}