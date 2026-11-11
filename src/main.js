import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/chrome.css';
import './styles/motion.css';
import { initMotion } from './core/motion.js';
import { initScroll } from './core/scroll.js';
import { splash } from './ui/splash.js';
import { initQuick } from './ui/quick.js';
import { initNav } from './ui/nav.js';
import { initChapters } from './ui/chapters.js';
import { initGL } from './gl/scene.js';
import { initPalette } from './gl/palette.js';

initMotion();
initScroll();
splash.init();
initQuick();
initNav();
initPalette(); // before initChapters, so the first jl:chapter already finds the listener
initChapters();

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
requestAnimationFrame(() => setTimeout(() => initGL((p) => { glp = p; report(); }), 0));