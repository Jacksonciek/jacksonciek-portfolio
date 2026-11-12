import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/chrome.css';
import './styles/motion.css';
import './styles/showcase.css';
import './styles/experience.css';
import './styles/refinement.css';
import { initMotion } from './core/motion.js';
import { initScroll } from './core/scroll.js';
import { splash } from './ui/splash.js';
import { initNav } from './ui/nav.js';
import { initChapters } from './ui/chapters.js';
import { initPalette } from './gl/palette.js';
import { initHero } from './ui/hero.js';
import { initLiquid } from './ui/liquid.js';
import { initChapterFeatures } from './ui/chapter-features.js';
import { createShelf } from './design/shelf.js';
import { createWorkSheet } from './design/sheet.js';
import { initRouter } from './core/router.js';
import works from './content/works.json';

initMotion();
initScroll();
splash.init();
initHero();
initLiquid();
initNav();
const sheet = createWorkSheet();
createShelf(document.getElementById('shelf-slot'), works, { onOpen: (work, rect, opener, list) => sheet.open(work, rect, opener, list) });
initPalette(); // before initChapters, so the first jl:chapter already finds the listener
initChapters();
initChapterFeatures();
initRouter({ sheet });

// Splash progress is real: fonts ready, window load and the GL scene, one third each.
let fonts = 0, load = 0, glp = 0;
const report = () => {
  splash.setProgress((fonts + load + glp) / 3);
  if (fonts && load && glp === 1) splash.finish();
};
document.fonts.ready.then(() => { fonts = 1; report(); });
if (document.readyState === 'complete') { load = 1; report(); }
else window.addEventListener('load', () => { load = 1; report(); }, { once: true });
// GL starts after the first paint, so the splash shows before the GPU process spins up.
requestAnimationFrame(() => setTimeout(() => {
  import('./gl/scene.js').then(({ initGL }) => initGL((p) => { glp = p; report(); }))
    .catch(() => { glp = 1; report(); });
}, 0));
