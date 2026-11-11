import { node, pageHeader, section } from './shared.js';

const slots = [
  ['Reel', 'A short selection of edited work.'],
  ['Cinematography', 'Camera and moving-image work.'],
  ['Photography', 'Selected still images.'],
];

export function render() {
  const root = node('div', 'page-video');
  root.append(pageHeader('06 / Video', 'Frames, cuts, colour.', 'Video editing, cinematography and photography. Tools: Premiere Pro and After Effects.'));
  const grid = node('div', 'video-grid');
  slots.forEach(([title, description], i) => {
    const card = node('article', 'video-card');
    const viewport = node('div', `video-slot video-slot--${i + 1}`); viewport.setAttribute('role', 'img'); viewport.setAttribute('aria-label', `${title} video preview not added yet`);
    viewport.append(node('span', 'video-slot-index', `0${i + 1}`), node('span', 'video-slot-label', 'Video link not added'));
    card.append(viewport, node('h2', '', title), node('p', 'page-lede', description)); grid.append(card);
  });
  root.append(grid);
  const note = section('Edit and capture');
  note.append(node('p', '', 'Premiere Pro · After Effects'));
  root.append(note);
  return root;
}
