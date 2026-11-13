import { NAV_ITEMS, MOTION_TOKENS } from '../config.js';
import { scrollToChapter } from '../core/scroll.js';

export function initNav() {
  const shell = document.getElementById('nav-shell');
  const pill = document.getElementById('pill');
  const panel = document.getElementById('nav-panel');
  const list = panel.querySelector('.nav-panel-list');
  const links = new Map();
  let open = false;
  let closeTimer = 0;
  let suppressFocusOpen = false;
  const hoverInput = matchMedia('(hover: hover) and (pointer: fine)');

  pill.innerHTML = '<button class="pill-toggle" type="button" aria-label="Open navigation" aria-controls="nav-panel" aria-expanded="false"><span class="pill-current">Home</span><svg class="pill-mark" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 5.5h12M3 9h12M3 12.5h12"/></svg></button>';
  list.innerHTML = NAV_ITEMS.map((item, index) => {
    const start = item.target
      ? '<a role="listitem" href="#' + item.target + '" data-target="' + item.target + '">'
      : '<button role="listitem" type="button" data-about-me aria-haspopup="dialog">';
    const end = item.target ? '</a>' : '</button>';
    const separator = item.target ? '' : '<span class="nav-divider" role="separator" aria-orientation="horizontal"></span>';
    return separator + start + '<span class="nav-number">' + String(index + 1).padStart(2, '0') + '</span><span>' + item.label + '</span>' + end;
  }).join('');
  list.setAttribute('role', 'list');
  list.querySelectorAll('[data-target]').forEach((link) => links.set(link.dataset.target, link));

  const toggle = pill.querySelector('.pill-toggle');
  const current = pill.querySelector('.pill-current');
  document.documentElement.style.setProperty('--d-panel', (MOTION_TOKENS.panel.duration * 1000) + 'ms');
  document.documentElement.style.setProperty('--d-hover', (MOTION_TOKENS.micro.duration * 1000) + 'ms');
  const close = () => {
    open = false;
    shell.classList.remove('nav-open');
    panel.inert = true;
    panel.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
  };
  const show = () => {
    clearTimeout(closeTimer);
    open = true;
    shell.classList.add('nav-open');
    panel.inert = false;
    panel.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation');
  };
  const deferClose = () => {
    clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      if (!shell.contains(document.activeElement)) close();
    }, 180);
  };

  panel.hidden = false;
  close();
  shell.hidden = false;
  toggle.addEventListener('click', () => (open ? close() : show()));
  shell.addEventListener('pointerenter', (event) => { if (hoverInput.matches && event.pointerType === 'mouse') show(); });
  shell.addEventListener('pointerleave', deferClose);
  shell.addEventListener('focusin', (event) => {
    if (!suppressFocusOpen && event.target.matches(':focus-visible')) show();
  });
  shell.addEventListener('focusout', deferClose);
  panel.addEventListener('click', (event) => {
    const link = event.target.closest('[data-target]');
    if (link) {
      event.preventDefault();
      close();
      scrollToChapter(link.dataset.target);
      return;
    }
    const about = event.target.closest('[data-about-me]');
    if (about) {
      close();
      document.dispatchEvent(new CustomEvent('jl:about-open', { detail: { trigger: about } }));
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (open && !shell.contains(event.target)) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && open) {
      close();
      suppressFocusOpen = true;
      toggle.focus();
      requestAnimationFrame(() => { suppressFocusOpen = false; });
    }
  });
  document.querySelectorAll('a[data-chapter-jump]').forEach((anchor) => anchor.addEventListener('click', (event) => {
    event.preventDefault();
    scrollToChapter(anchor.dataset.chapterJump);
  }));
  document.addEventListener('jl:chapter', (event) => {
    const id = event.detail.id || 'home';
    const item = NAV_ITEMS.find((entry) => entry.target === id);
    current.textContent = item?.label || document.getElementById(id)?.dataset.navLabel || 'Home';
    links.forEach((link, target) => target === id
      ? link.setAttribute('aria-current', 'page')
      : link.removeAttribute('aria-current'));
  });
}
