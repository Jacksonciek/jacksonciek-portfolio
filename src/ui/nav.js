import { CHAPTERS, PAGES } from '../content/site.js';
import { scrollToChapter, lock, unlock } from '../core/scroll.js';
import { openQuick } from './quick.js';

const phone = matchMedia('(max-width: 760px)');

// Desktop: the pill is always open, every link is visible, nothing depends on hover.
// Phone: the pill is JL + current chapter + Quick mode, and JL opens the full-screen menu.
export function initNav() {
  const pill = document.getElementById('pill');
  const chapters = CHAPTERS.map((c, i) => `<a href="#${c.id}" data-ch="${i}">${c.name}</a>`).join('');
  const pages = PAGES.filter((p) => p.nav).map((p) => `<a data-link href="${p.path}">${p.name}</a>`).join('');
  pill.innerHTML = `<button class="pill-jl" type="button">JL</button>
    <span class="pill-cur">Home</span>
    <div class="pill-links" id="pill-links">${chapters}<span class="pill-sep" aria-hidden="true"></span>${pages}</div>
    <button class="pill-q" type="button">Quick mode</button>`;
  const menu = document.createElement('div'); // phone menu, placed right after the pill so Tab order stays natural
  menu.id = 'menu';
  menu.className = 'menu';
  menu.innerHTML = `<nav aria-label="Menu">${chapters}${pages}</nav>`;
  pill.after(menu);

  const jl = pill.querySelector('.pill-jl'), cur = pill.querySelector('.pill-cur');
  const links = [...pill.querySelectorAll('a[data-ch]')];
  let open = false, locked = false;
  const setOpen = (v) => { // only the phone menu opens and closes
    open = v && phone.matches;
    jl.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('on', open);
    if (open !== locked) { locked = open; (open ? lock : unlock)(); }
  };
  const syncJl = () => { // same button, two jobs: menu on phones, back to Home on desktop
    if (phone.matches) {
      jl.setAttribute('aria-label', 'JL menu');
      jl.setAttribute('aria-controls', 'menu');
      jl.setAttribute('aria-expanded', String(open));
    } else {
      jl.setAttribute('aria-label', 'Jackson Lawrence, back to Home');
      jl.removeAttribute('aria-controls');
      jl.removeAttribute('aria-expanded');
    }
  };
  const onLink = (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    setOpen(false);
    if (a.dataset.ch) { e.preventDefault(); scrollToChapter(+a.dataset.ch); }
  };
  jl.addEventListener('click', () => (phone.matches ? setOpen(!open) : scrollToChapter(0)));
  pill.addEventListener('click', onLink);
  menu.addEventListener('click', onLink);
  pill.querySelector('.pill-q').addEventListener('click', (e) => { setOpen(false); openQuick(e.currentTarget); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { setOpen(false); jl.focus(); } });
  document.addEventListener('pointerdown', (e) => { if (open && !pill.contains(e.target) && !menu.contains(e.target)) setOpen(false); });
  phone.addEventListener('change', () => { setOpen(false); syncJl(); });
  document.addEventListener('jl:chapter', (e) => {
    const i = e.detail.i;
    cur.textContent = CHAPTERS[i].name; // phone label
    links.forEach((a) => (+a.dataset.ch === i ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'))); // desktop highlight
  });
  syncJl();
  pill.hidden = false;
}