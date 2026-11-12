import { CHAPTERS } from '../content/site.js';
import { scrollToChapter, lock, unlock } from '../core/scroll.js';

const compact = matchMedia('(max-width: 900px)');

// Keep the chapter list visible on wide screens; the brand opens the same
// labeled list on compact screens so navigation never depends on hover.
export function initNav() {
  const pill = document.getElementById('pill');
  const chapters = CHAPTERS.map((c) => `<a href="#${c.id}" data-ch="${c.id}">${c.name}</a>`).join('');
  pill.innerHTML = `<button class="pill-jl" type="button" aria-label="Jackson Lawrence, back to Home"><span class="pill-brand-mark" aria-hidden="true">JL</span><span class="pill-brand-name">Jackson Lawrence</span></button>
    <span class="pill-cur">Home</span>
    <div class="pill-links" id="pill-links">${chapters}</div>`;
  const menu = document.createElement('div');
  menu.id = 'menu';
  menu.className = 'menu';
  menu.innerHTML = `<nav aria-label="Menu">${chapters}</nav>`;
  pill.after(menu);

  const brand = pill.querySelector('.pill-jl'), cur = pill.querySelector('.pill-cur');
  const links = [...pill.querySelectorAll('a[data-ch]')];
  let open = false, locked = false;
  const setOpen = (value) => {
    open = value && compact.matches;
    brand.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('on', open);
    if (open !== locked) { locked = open; (open ? lock : unlock)(); }
  };
  const syncBrand = () => {
    if (compact.matches) {
      brand.setAttribute('aria-label', 'Jackson Lawrence, open navigation');
      brand.setAttribute('aria-controls', 'menu');
      brand.setAttribute('aria-expanded', String(open));
    } else {
      brand.setAttribute('aria-label', 'Jackson Lawrence, back to Home');
      brand.removeAttribute('aria-controls');
      brand.removeAttribute('aria-expanded');
    }
  };
  const onLink = (event) => {
    const anchor = event.target.closest('a[data-ch]');
    if (!anchor) return;
    event.preventDefault();
    setOpen(false);
    scrollToChapter(anchor.dataset.ch);
  };

  brand.addEventListener('click', () => (compact.matches ? setOpen(!open) : scrollToChapter(0)));
  pill.addEventListener('click', onLink);
  menu.addEventListener('click', onLink);
  document.querySelectorAll('a[data-chapter-jump]').forEach((anchor) => anchor.addEventListener('click', (event) => {
    event.preventDefault();
    scrollToChapter(anchor.dataset.chapterJump);
  }));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && open) { setOpen(false); brand.focus(); }
  });
  document.addEventListener('pointerdown', (event) => {
    if (open && !pill.contains(event.target) && !menu.contains(event.target)) setOpen(false);
  });
  compact.addEventListener('change', () => { setOpen(false); syncBrand(); });
  document.addEventListener('jl:chapter', (event) => {
    const id = event.detail.id || CHAPTERS[event.detail.i]?.id;
    const chapter = document.getElementById(id);
    const navItem = CHAPTERS.find((item) => item.id === id);
    cur.textContent = navItem?.name || chapter?.dataset.navLabel || 'Jackson Lawrence';
    links.forEach((anchor) => (anchor.dataset.ch === id
      ? anchor.setAttribute('aria-current', 'true')
      : anchor.removeAttribute('aria-current')));
  });
  syncBrand();
  pill.hidden = false;
}
