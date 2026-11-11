import works from '../content/works.json';
import { createShelf } from '../design/shelf.js';
import { node, pageHeader } from './shared.js';

export function render({ sheet }) {
  const root = node('div', 'page-design');
  root.append(pageHeader('05 / Design', 'Campaigns people actually watched.', 'Bangsar Heights Pavilion campaigns across Indonesia and Malaysia. Select a work to open its available versions.'));
  const gallery = node('div', 'design-page-shelf'); root.append(gallery);
  const shelf = createShelf(gallery, works, { onOpen: (work, rect, opener, list) => sheet?.open(work, rect, opener, list) });
  const gridSection = node('section', 'page-section work-grid-section');
  gridSection.append(node('h2', '', 'Selected visual work'));
  const grid = node('div', 'work-grid');
  works.forEach((work, i) => {
    const button = node('button', `work-grid-card work-grid-card--${i % 6}`); button.type = 'button';
    const art = node('span', 'work-grid-art'); art.setAttribute('aria-hidden', 'true');
    if (work.cover) { const img = node('img', 'work-grid-image'); img.src = work.cover; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async'; img.width = 700; img.height = 900; art.append(img); }
    art.append(node('span', 'work-grid-number', String(i + 1).padStart(2, '0')));
    const copy = node('span', 'work-grid-copy'); copy.append(node('strong', '', work.title), node('span', 'meta', work.kind || 'Selected work'));
    button.append(art, copy); button.setAttribute('aria-label', `View ${work.title}`);
    button.addEventListener('click', () => sheet?.open(work, art.getBoundingClientRect(), button, works));
    grid.append(button);
  });
  gridSection.append(grid); root.append(gridSection);
  return { el: root, destroy: () => shelf.destroy() };
}
