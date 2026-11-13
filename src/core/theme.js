const clamp = (value) => Math.max(0, Math.min(1, Number(value) || 0));
const smooth = (a, b, value) => {
  const t = clamp((value - a) / (b - a));
  return t * t * (3 - 2 * t);
};

let progress = 0;
let theme = '';

function publishTheme(next) {
  const root = document.documentElement;
  if (theme === next) return;
  theme = next;
  root.dataset.theme = next;
  root.style.colorScheme = next === 'light' ? 'light' : 'dark';
  const colors = next === 'light'
    ? { particle: '#147E41', accent: '#090A0F' }
    : { particle: '#18C75F', accent: '#59FFA0' };
  document.dispatchEvent(new CustomEvent('jl:theme', {
    detail: { theme: next, progress, ...colors },
  }));
}

export function setThemeProgress(value) {
  progress = clamp(value);
  const root = document.documentElement;
  const green = smooth(0.16, 0.72, progress);
  const white = smooth(0.66, 1, progress);
  const lines = smooth(0.18, 0.38, progress) * (1 - smooth(0.76, 0.98, progress));

  root.style.setProperty('--theme-progress', progress.toFixed(4));
  root.style.setProperty('--green-offset', (1 - green) * 100 + '%');
  root.style.setProperty('--white-offset', (1 - white) * 100 + '%');
  root.style.setProperty('--line-opacity', String(lines * 0.8));
  root.style.setProperty('--line-shift', (progress * -4) + 'vw');
  root.style.setProperty('--final-white-scale', String(smooth(0.94, 1, progress)));

  const next = progress < 0.42 ? 'dark' : progress < 0.76 ? 'green' : 'light';
  root.dataset.navTheme = progress >= 0.995 ? 'light' : 'dark';
  publishTheme(next);
  return { progress, theme: next };
}

export function getThemeProgress() { return progress; }

export function initTheme() {
  setThemeProgress(0);
}
