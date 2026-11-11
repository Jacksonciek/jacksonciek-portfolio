import { lock, unlock } from '../core/scroll.js';
import { motionOn, RM } from '../core/motion.js';
import { trapFocus } from '../core/a11y.js';

const EASE = 'cubic-bezier(.77,0,.175,1)';
const cleanVersions = (work) => (work.versions || []).filter((v) => v?.label).length ? work.versions.filter((v) => v?.label) : [{ label: 'Final', src: work.cover || '' }];

function art(work, version) {
  const frame = document.createElement('div'); frame.className = 'viewer-art';
  frame.style.setProperty('--work-hue', `${(String(work.id).length * 41 + 29) % 360}`);
  frame.dataset.kind = work.kind || 'Selected work';
  const src = version?.src || work.cover;
  if (src) { const img = document.createElement('img'); img.src = src; img.alt = `${work.title} — ${version?.label || 'Final'} version`; img.loading = 'eager'; img.decoding = 'async'; img.width = 474; img.height = 900; frame.append(img); }
  else {
    const number = document.createElement('span'); number.className = 'viewer-art-index'; number.textContent = String((String(work.id).length * 7) % 99 + 1).padStart(2, '0');
    const title = document.createElement('strong'); title.textContent = work.title;
    const meta = document.createElement('span'); meta.textContent = version?.label || 'Selected work';
    frame.append(number, title, meta);
  }
  return frame;
}

export function createWorkSheet(root = document.getElementById('viewer')) {
  let opener = null, sourceRect = null, releaseTrap = null, isOpen = false, current = null, animation = null;
  root.hidden = true; root.setAttribute('aria-label', 'Design work details');

  const build = (work, workList, index) => {
    current = { work, workList, index, version: 0 };
    root.replaceChildren();
    const close = document.createElement('button'); close.className = 'viewer-close'; close.type = 'button'; close.textContent = 'Close'; close.addEventListener('click', () => closeSheet());
    const layout = document.createElement('div'); layout.className = 'viewer-layout';
    const copy = document.createElement('div'); copy.className = 'viewer-copy';
    const label = document.createElement('p'); label.className = 'meta viewer-kind'; label.textContent = work.kind || 'Selected work';
    const title = document.createElement('h2'); title.id = 'viewer-title'; title.textContent = work.title;
    const meta = document.createElement('p'); meta.className = 'viewer-meta'; meta.textContent = [work.year && work.year !== 'TODO' ? work.year : '', work.kind || ''].filter(Boolean).join(' / ');
    const description = document.createElement('p'); description.className = 'viewer-description';
    description.textContent = work.description || 'A campaign visual from Jackson’s design practice. Add the artwork files to show every version here.';
    const versionLabel = document.createElement('p'); versionLabel.className = 'meta viewer-version-label'; versionLabel.textContent = 'Versions';
    const versions = document.createElement('div'); versions.className = 'viewer-versions'; versions.setAttribute('role', 'group'); versions.setAttribute('aria-label', 'Artwork versions');
    const artwork = document.createElement('div'); artwork.className = 'viewer-artwork';
    const other = document.createElement('div'); other.className = 'viewer-other';
    const otherLabel = document.createElement('span'); otherLabel.className = 'meta'; otherLabel.textContent = 'Other works'; other.append(otherLabel);
    const otherList = document.createElement('div'); otherList.className = 'viewer-other-list'; other.append(otherList);
    copy.append(label, title, meta, description, versionLabel, versions);
    layout.append(copy, artwork); root.append(close, layout, other);

    const list = cleanVersions(work);
    const showVersion = (n, animate = false) => {
      current.version = n;
      versions.replaceChildren();
      list.forEach((v, i) => {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'chip viewer-chip';
        button.textContent = v.label; button.setAttribute('aria-pressed', String(i === n));
        button.addEventListener('click', () => showVersion(i, true)); versions.append(button);
      });
      const next = art(work, list[n]); next.classList.add('viewer-reveal');
      if (animate && motionOn() && !RM) {
        next.style.clipPath = 'inset(0 100% 0 0)'; artwork.append(next);
        requestAnimationFrame(() => { next.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 480, easing: EASE, fill: 'forwards' }); });
        artwork.querySelectorAll('.viewer-art:not(:last-child)').forEach((old) => old.remove());
      } else { artwork.replaceChildren(next); next.style.clipPath = ''; }
    };
    showVersion(0);
    workList.forEach((item, i) => {
      if (item.id === work.id) return;
      const button = document.createElement('button'); button.type = 'button'; button.textContent = item.title;
      button.addEventListener('click', () => { build(item, workList, i); if (motionOn() && !RM) layout.animate([{ opacity: .35, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.23,1,.32,1)' }); });
      otherList.append(button);
    });
    root.setAttribute('aria-labelledby', 'viewer-title');
    root.querySelector('.viewer-close').focus({ preventScroll: true });
  };

  const closeSheet = async () => {
    if (!isOpen) return;
    isOpen = false;
    const currentRect = opener?.querySelector?.('.shelf-cover')?.getBoundingClientRect()
      || (opener?.querySelector?.('.work-grid-art') ? opener.querySelector('.work-grid-art').getBoundingClientRect() : null)
      || sourceRect;
    animation?.cancel();
    if (motionOn() && !RM && currentRect) {
      const clip = `inset(${currentRect.top}px ${innerWidth - currentRect.right}px ${innerHeight - currentRect.bottom}px ${currentRect.left}px round 3px)`;
      animation = root.animate([{ clipPath: 'inset(0 0 0 0 round 0px)' }, { clipPath: clip }], { duration: 520, easing: EASE, fill: 'forwards' });
      try { await animation.finished; } catch {}
    } else {
      animation = root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' });
      try { await animation.finished; } catch {}
    }
    root.hidden = true; root.classList.remove('viewer-open'); root.style.clipPath = ''; root.style.opacity = '';
    releaseTrap?.(); releaseTrap = null; unlock();
    opener?.focus?.({ preventScroll: true }); opener = null;
  };

  const onKey = (event) => { if (event.key === 'Escape' && isOpen) { event.preventDefault(); closeSheet(); } };
  document.addEventListener('keydown', onKey);

  return {
    open(work, rect, element, list = [work]) {
      if (isOpen) { build(work, list, list.indexOf(work)); return; }
      opener = element || document.activeElement;
      sourceRect = rect || opener?.getBoundingClientRect?.() || { top: innerHeight * .3, right: innerWidth * .6, bottom: innerHeight * .7, left: innerWidth * .4 };
      root.hidden = false; root.classList.add('viewer-open'); root.style.opacity = '';
      build(work, list, list.indexOf(work));
      lock(); isOpen = true; releaseTrap = trapFocus(root);
      root.querySelector('.viewer-close')?.focus({ preventScroll: true });
      const r = sourceRect;
      if (motionOn() && !RM) {
        const clip = `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round 3px)`;
        root.style.clipPath = clip;
        animation = root.animate([{ clipPath: clip }, { clipPath: 'inset(0 0 0 0 round 0px)' }], { duration: 1050, easing: EASE, fill: 'forwards' });
        const lines = [...root.querySelectorAll('.viewer-kind,.viewer-copy h2,.viewer-meta,.viewer-description,.viewer-version-label,.viewer-versions')];
        lines.forEach((line, i) => line.animate([{ opacity: 0, transform: 'translateY(34px)' }, { opacity: 1, transform: 'translateY(0)' }], { delay: 620 + i * 75, duration: 750, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'both' }));
      } else { root.style.clipPath = ''; root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: 'forwards' }); }
    },
    close: closeSheet,
    destroy() { closeSheet(); document.removeEventListener('keydown', onKey); },
  };
}
