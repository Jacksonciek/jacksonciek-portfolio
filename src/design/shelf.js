import { FLAGS } from '../config.js';
import { motionOn, RM } from '../core/motion.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mod = (v, n) => ((v % n) + n) % n;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

function svgArrow(reverse = false) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 12'); svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = reverse ? '<path d="M18 1l5 5-5 5M23 6H1" />' : '<path d="M6 1L1 6l5 5M1 6h23" />';
  return svg;
}

function face(work, kind, index) {
  const el = document.createElement('span');
  el.className = kind === 'spine' ? 'shelf-sp' : 'shelf-cover';
  el.style.setProperty('--work-hue', `${(index * 53 + 27) % 360}`);
  const src = kind === 'cover' ? work.cover || work.versions?.[0]?.src : '';
  if (src) {
    const image = document.createElement('img'); image.src = src; image.alt = ''; image.loading = 'lazy'; image.decoding = 'async'; image.width = 474; image.height = 900; image.setAttribute('aria-hidden', 'true'); el.append(image);
  }
  if (kind === 'spine') {
    const title = document.createElement('span'); title.className = 'shelf-spine-title'; title.textContent = work.title;
    const number = document.createElement('span'); number.className = 'shelf-spine-no'; number.textContent = String(index + 1).padStart(2, '0');
    el.append(number, title);
  } else {
    const number = document.createElement('span'); number.className = 'shelf-cover-no'; number.textContent = String(index + 1).padStart(2, '0');
    const title = document.createElement('strong'); title.className = 'shelf-cover-title'; title.textContent = work.title;
    const kindLabel = document.createElement('span'); kindLabel.className = 'shelf-cover-kind'; kindLabel.textContent = work.kind || 'Selected work';
    el.append(number, title, kindLabel);
    if (work.placeholder || !(work.cover || work.versions?.some((version) => version.src))) {
      const status = document.createElement('span'); status.className = 'shelf-cover-status'; status.textContent = 'Preview not supplied';
      el.append(status);
    }
  }
  return el;
}

export function createShelf(root, works, opts = {}) {
  if (!root || !works?.length) return { el: root, next() {}, prev() {}, goTo() {}, destroy() {} };
  const N = works.length, copies = Math.max(4, Math.ceil(24 / N)), M = copies * N;
  const height = () => Math.max(120, root.clientHeight * (innerWidth < 768 ? .77 : .83));
  root.classList.add('shelf');
  root.setAttribute('role', 'group'); root.setAttribute('aria-roledescription', 'carousel'); root.setAttribute('aria-label', 'Design works');
  root.tabIndex = 0;
  root.innerHTML = '<div class="shelf-shadow" aria-hidden="true"></div><div class="shelf-stage3d"></div><div class="shelf-caption"><button class="shelf-arrow shelf-prev" type="button" aria-label="Previous work"></button><div class="shelf-caption-copy"><span class="shelf-caption-meta"></span><strong class="shelf-caption-title"></strong></div><button class="shelf-arrow shelf-next" type="button" aria-label="Next work"></button></div><div class="shelf-ruler" aria-label="Choose a design work"></div><span class="shelf-live" aria-live="polite" aria-atomic="true"></span>';
  const stage = root.querySelector('.shelf-stage3d'), titleEl = root.querySelector('.shelf-caption-title'), metaEl = root.querySelector('.shelf-caption-meta');
  const copiesEls = [];
  for (let c = 0; c < copies; c++) works.forEach((work, i) => {
    const original = c === 1;
    const tape = document.createElement('button');
    tape.className = 'shelf-tape';
    tape.type = 'button'; tape.dataset.index = String(i); tape.dataset.virtual = String(c * N + i);
    tape.style.setProperty('--work-hue', `${(i * 53 + 27) % 360}`);
    tape.dataset.workIndex = String(i); tape.setAttribute('aria-label', `View ${work.title}${work.placeholder || !(work.cover || work.versions?.some((version) => version.src)) ? '; artwork preview not supplied' : ''}`);
    tape.setAttribute('aria-hidden', original ? 'false' : 'true'); tape.tabIndex = original ? 0 : -1;
    tape.append(face(work, 'spine', i), face(work, 'cover', i));
    const item = { el: tape, i, virtual: c * N + i, lift: 0, liftTo: 0, original };
    stage.append(tape); copiesEls.push(item);
    tape.addEventListener('pointerenter', () => { item.liftTo = 1; start(); });
    tape.addEventListener('pointerleave', () => { item.liftTo = 0; start(); });
  });
  const ruler = root.querySelector('.shelf-ruler');
  works.forEach((work, i) => {
    const tick = document.createElement('button'); tick.type = 'button'; tick.className = 'shelf-tick';
    tick.setAttribute('aria-label', `Go to ${work.title}`); tick.addEventListener('click', () => goTo(i)); ruler.append(tick);
  });
  root.querySelector('.shelf-prev').append(svgArrow(true));
  root.querySelector('.shelf-next').append(svgArrow(false));
  let s = N, T = N, ws = 20, d = 120, H = 220, U = 280, P = 1400, gap = 8, raf = 0, last = performance.now();
  let pointer = null, drag = false, ignoreClick = false, consumedPress = false, hovered = false, pointerPresent = false, px = 0, py = 0, visible = true, idleTimer, autoTimer, pressTimer, destroyed = false;
  let active = -1, captionTimer = 0, lastRulerIndex = -1, rulerWidth = 0;
  const reduced = RM;
  const measure = () => {
    H = height(); ws = H * 142 / 840; d = H * 474 / 900; gap = H * .035; U = H * (innerWidth < 768 ? 1.05 : 1.3); P = 1400;
    rulerWidth = ruler.clientWidth; lastRulerIndex = -1;
    root.style.setProperty('--shelf-H', `${H}px`); root.style.setProperty('--shelf-spine', `${ws}px`); root.style.setProperty('--shelf-depth', `${d}px`); root.style.setProperty('--shelf-gap', `${gap}px`);
    start();
  };
  const rel = (v, target) => { const r = mod(v - target + M / 2, M) - M / 2; return r; };
  const B = (r) => Math.abs(r) < 1 ? (r + Math.sin(Math.PI * r) / Math.PI) / 2 : Math.sign(r) * .5;
  const F = (r) => r * (ws + gap) + (d - ws + 1.4 * gap) * B(r);
  const scl = (u) => 1 / (1 + (Math.abs(u) / U) ** 1.6);
  const updateCaption = (i, instant = false) => {
    if (i === active) return;
    active = i;
    const work = works[i];
    const label = [work.year && work.year !== 'TODO' ? work.year : '', work.kind || ''].filter(Boolean).join(' / ');
    clearTimeout(captionTimer);
    const swap = () => { titleEl.textContent = work.title; metaEl.textContent = label; root.querySelector('.shelf-live').textContent = `${work.title}${label ? `, ${label}` : ''}`; };
    if (instant || reduced || !motionOn()) swap();
    else { root.classList.add('caption-swap'); captionTimer = setTimeout(() => { swap(); root.classList.remove('caption-swap'); }, 210); }
    ruler.querySelectorAll('.shelf-tick').forEach((el, k) => el.classList.toggle('is-active', k === i));
  };
  const draw = (now) => {
    if (destroyed || !visible || document.hidden) { raf = 0; return; }
    const dt = Math.min(50, now - last); last = now;
    const moving = motionOn() && !reduced;
    if (moving) s += (T - s) * (1 - Math.exp(-(drag ? 18 : 5.2) * dt / 1000)); else s = T;
    let settling = Math.abs(T - s) > .01;
    if (Math.abs(s - N) > 4) { const shift = Math.trunc((s - N) / N) * N; s -= shift; T -= shift; }
    const idx = mod(Math.round(s), N); updateCaption(idx);
    const XS = [0]; for (let u = 2; u <= 3 * U; u += 2) XS.push(XS.at(-1) + 2 / (1 + (u / U) ** 1.6));
    const rect = root.getBoundingClientRect(), cx = rect.left + rect.width / 2, cy = rect.top + rect.height * .48;
    const tiltOn = FLAGS.TILT && moving && pointerPresent && Math.abs(T - s) < .3;
    const near = tiltOn && Math.abs(px - cx) < .55 * d && Math.abs(py - cy) < .55 * H;
    const nearest = new Map();
    copiesEls.forEach((item) => { const distance = Math.abs(rel(item.virtual, s)); if (!nearest.has(item.i) || distance < nearest.get(item.i).distance) nearest.set(item.i, { distance, virtual: item.virtual }); });
    copiesEls.forEach((item) => {
      const { el, virtual, i } = item;
      if (moving) item.lift += (item.liftTo - item.lift) * (1 - Math.exp(-12 * dt / 1000));
      else item.lift = item.liftTo;
      if (moving && Math.abs(item.liftTo - item.lift) > .005) settling = true;
      const visibleCopy = nearest.get(i)?.virtual === virtual;
      el.tabIndex = visibleCopy ? 0 : -1; el.setAttribute('aria-hidden', String(!visibleCopy));
    });
    copiesEls.forEach((item, at) => {
      const { el, virtual, lift } = item;
      const r = rel(virtual, s), open = 1 - smooth(0, 1, Math.abs(r)), u = F(r);
      const tiltYTo = !tiltOn ? 0 : near ? clamp((px - cx) / (.55 * d), -1, 1) * 8 : clamp((px - cx) / Math.max(1, rect.width), -1, 1) * 4;
      const tiltXTo = near ? -clamp((py - cy) / Math.max(1, H / 2), -1, 1) * 5 : 0;
      item.tiltY = moving ? (item.tiltY || 0) + (tiltYTo - (item.tiltY || 0)) * (1 - Math.exp(-7 * dt / 1000)) : tiltYTo;
      item.tiltX = moving ? (item.tiltX || 0) + (tiltXTo - (item.tiltX || 0)) * (1 - Math.exp(-7 * dt / 1000)) : tiltXTo;
      if (moving && (Math.abs(tiltYTo - item.tiltY) > .04 || Math.abs(tiltXTo - item.tiltX) > .04)) settling = true;
      const hide = Math.abs(u) > U * 1.95, sc = scl(u), k = 1 / sc;
      const z = P * (1 - k) + open * H * .1;
      const xSign = Math.sign(u), xidx = Math.min(XS.length - 1, Math.round(Math.abs(u) / 2));
      const x = xSign * XS[xidx] * k;
      const y = (H * .5 * (1 - sc) * .42 + open * H * .012 - lift * H * .05) * k;
      const rotY = xSign * Math.min(1, Math.abs(u) / U) * 26 * (1 - open) - 90 * open + item.tiltY * open;
      el.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateX(${item.tiltX * open}deg) rotateY(${rotY}deg)`;
      el.style.zIndex = String(Math.round(3000 + z));
      el.style.visibility = hide ? 'hidden' : 'visible';
      el.style.setProperty('--sp-shade', String(Math.min(.6, open * .55 + (1 - sc) * .32)));
      el.style.setProperty('--cv-shade', String((1 - open) * .82));
    });
    const dot = ruler.querySelector('.shelf-ruler-dot');
    if (dot && idx !== lastRulerIndex) {
      lastRulerIndex = idx;
      dot.style.transform = `translate3d(${((idx + .5) / N) * rulerWidth}px,0,0) translateX(-50%)`;
    }
    if (moving && settling) raf = requestAnimationFrame(draw); else raf = 0;
  };
  const start = () => { if (!raf && !destroyed && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(draw); } };
  const settle = () => { if (!motionOn() || reduced) { T = Math.round(T); s = T; start(); return; } start(); };
  const goTo = (i) => { const delta = mod(mod(i, N) - mod(T, N) + N / 2, N) - N / 2; T += delta; start(); };
  const step = (by) => { T += by; start(); };
  const open = (work, el) => {
    const cover = el.querySelector('.shelf-cover');
    opts.onOpen?.(work, cover.getBoundingClientRect(), el, works);
  };
  root.addEventListener('click', (event) => {
    const tape = event.target.closest('.shelf-tape');
    if (!tape) return;
    if (ignoreClick) { ignoreClick = false; event.preventDefault(); return; }
    if (consumedPress) { consumedPress = false; event.preventDefault(); return; }
    const i = Number(tape.dataset.index), v = Number(tape.dataset.virtual);
    const r = rel(v, T);
    if (Math.abs(r) < .48) open(works[i], tape);
    else { T += r; start(); }
  });
  root.querySelector('.shelf-prev').addEventListener('click', () => step(-1));
  root.querySelector('.shelf-next').addEventListener('click', () => step(1));
  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); step(event.key === 'ArrowLeft' ? -1 : 1); }
    if (event.key === 'Enter' && event.target === root) { event.preventDefault(); const i = mod(Math.round(T), N), el = copiesEls.find((item) => item.i === i && item.el.tabIndex === 0)?.el; if (el) open(works[i], el); }
  });
  root.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch' && pointer) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, start: T };
    drag = false;
    const tape = event.target.closest('.shelf-tape');
    clearTimeout(pressTimer);
    if (tape) pressTimer = setTimeout(() => {
      if (Math.abs(rel(Number(tape.dataset.virtual), s)) < .48) { consumedPress = true; open(works[Number(tape.dataset.index)], tape); }
    }, 450);
    root.setPointerCapture?.(event.pointerId);
  });
  root.addEventListener('pointermove', (event) => {
    px = event.clientX; py = event.clientY; pointerPresent = true;
    start();
    if (!pointer || event.pointerId !== pointer.id) return;
    clearTimeout(pressTimer);
    const dx = event.clientX - pointer.x;
    if (Math.abs(dx) > 5) { drag = true; T = pointer.start - dx / (ws + gap); start(); }
  });
  const endDrag = (event) => {
    if (!pointer || event.pointerId !== pointer.id) return;
    if (drag) { T = Math.round(T); ignoreClick = true; setTimeout(() => { ignoreClick = false; }, 80); }
    pointer = null; drag = false; settle();
  };
  root.addEventListener('pointerup', endDrag); root.addEventListener('pointercancel', endDrag);
  root.addEventListener('contextmenu', (event) => event.preventDefault());
  root.addEventListener('pointerenter', () => { hovered = true; pointerPresent = true; clearTimeout(autoTimer); start(); });
  root.addEventListener('pointerleave', () => { hovered = false; pointerPresent = false; autoTimer = setTimeout(autoplay, 6000); start(); });
  root.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault(); T += event.deltaX / (ws + gap) * .5; start(); clearTimeout(idleTimer); idleTimer = setTimeout(() => { T = Math.round(T); start(); }, 160);
  }, { passive: false });
  const autoplay = () => {
    clearTimeout(autoTimer);
    if (!FLAGS.SHELF_AUTOPLAY || reduced || !motionOn() || hovered || !visible || document.hidden || document.getElementById('viewer')?.hidden === false) return;
    step(1); autoTimer = setTimeout(autoplay, 4000);
  };
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) { start(); autoplay(); } else clearTimeout(autoTimer); });
  io.observe(root);
  const onMotion = (e) => { if (e.detail) { start(); autoplay(); } else { clearTimeout(autoTimer); T = Math.round(T); s = T; updateCaption(mod(Math.round(T), N), true); start(); } };
  document.addEventListener('jl:motion', onMotion);
  const onVisibility = () => {
    if (document.hidden) { clearTimeout(autoTimer); cancelAnimationFrame(raf); raf = 0; }
    else { start(); autoplay(); }
  };
  document.addEventListener('visibilitychange', onVisibility);
  measure(); addEventListener('resize', measure, { passive: true });
  ruler.append(Object.assign(document.createElement('i'), { className: 'shelf-ruler-dot' }));
  const controls = { el: root, next: () => step(1), prev: () => step(-1), goTo, destroy() {
    destroyed = true; cancelAnimationFrame(raf); clearTimeout(autoTimer); clearTimeout(idleTimer); clearTimeout(captionTimer); clearTimeout(pressTimer); io.disconnect();
    removeEventListener('resize', measure); document.removeEventListener('jl:motion', onMotion); document.removeEventListener('visibilitychange', onVisibility); root.innerHTML = '';
  } };
  start(); autoplay();
  return controls;
}
