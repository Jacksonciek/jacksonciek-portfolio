import { CHAPTERS, PAGES } from '../content/site.js';
import { trapFocus } from '../core/a11y.js';
import { lock, unlock, scrollToChapter } from '../core/scroll.js';

let el, opener, release;
const ul = (rows) => `<ul>${rows.join('')}</ul>`;

export function initQuick() {
  el = document.getElementById('quick');
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-labelledby', 'qk-t');
  el.innerHTML = `<div class="qk-in"><h2 id="qk-t">Quick mode</h2>
    <button class="btn btn--secondary qk-x" type="button">Close</button>
    <h3>Story</h3>${ul(CHAPTERS.map((c, i) => `<li><a href="#${c.id}" data-ch="${i}">${c.name}</a></li>`))}
    <h3>Pages</h3>${ul(PAGES.map((p) => `<li><a data-link href="${p.path}">${p.name}</a></li>`))}</div>`;
  el.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-ch]');
    if (e.target.closest('.qk-x') || a) closeQuick();
    if (e.target.closest('a[data-link]')) closeQuick();
    if (a) { e.preventDefault(); scrollToChapter(+a.dataset.ch); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !el.hidden) closeQuick(); });
}

export function openQuick(from) {
  opener = from;
  el.hidden = false;
  lock();
  release = trapFocus(el);
  el.querySelector('.qk-x').focus();
}

function closeQuick() { // no animation: this is a frequent, keyboard-friendly path
  el.hidden = true;
  release?.();
  unlock();
  opener?.focus();
}
