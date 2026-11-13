export const FLAGS = { TILT: true, SHELF_AUTOPLAY: true, HERO_VIDEO: true };
export const HERO_VIDEO_URL = '';
export const COUNTS = { desktop: 26000, mobile: 9000 };
export const EASE = {
  out: 'cubic-bezier(.23,1,.32,1)',
  inOut: 'cubic-bezier(.77,0,.175,1)',
  drawer: 'cubic-bezier(.32,.72,0,1)',
};
// One scroll language for every chapter. Distances are estimates from the Apple reference captures.
export const MOTION_TOKENS = {
  scroll: { scrub: 0.7, pinScreens: 1 },
  reveal: { distance: 24, duration: 0.55, stagger: 0.06, ease: 'power3.out' },
  panel: { duration: 0.32, ease: 'power2.out' },
  micro: { duration: 0.18, ease: 'power1.out' },
  click: { diameter: 56, duration: 0.5, ease: 'cubic-bezier(.23,1,.32,1)' },
};

export const NAV_ITEMS = [
  { id: 'home', label: 'Home', target: 'home' },
  { id: 'education', label: 'Education', target: 'education' },
  { id: 'experience', label: 'Experience', target: 'experience' },
  { id: 'projects', label: 'Projects', target: 'projects' },
  { id: 'design', label: 'Graphic Design', target: 'design' },
  { id: 'video', label: 'Video Editing', target: 'video' },
  { id: 'skills', label: 'Skills', target: 'toolkit' },
  { id: 'contact', label: 'Contact', target: 'contact' },
  { id: 'about-me', label: 'About Me', target: null },
];
