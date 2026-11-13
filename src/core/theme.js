const clamp = (value) => Math.max(0, Math.min(1, Number(value) || 0));
const smooth = (a, b, value) => {
  const t = clamp((value - a) / (b - a));
  return t * t * (3 - 2 * t);
};

let progress = 0;
let theme = null;

const hexMix = (from, to, amount) => {
  const a = Number.parseInt(from.slice(1), 16), b = Number.parseInt(to.slice(1), 16);
  const channels = [16, 8, 0].map((shift) => Math.round(((a >> shift) & 255) + (((b >> shift) & 255) - ((a >> shift) & 255)) * amount));
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
};

function publishTheme(next, colors) {
  const root = document.documentElement;
  if (theme !== next) {
    theme = next;
    root.dataset.theme = next;
    root.style.colorScheme = next === 'light' ? 'light' : 'dark';
  }
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
  const gutter = hexMix(hexMix('#090A0F', '#147E41', green), '#E9EBEB', white);
  root.style.setProperty('--gutter-bg', gutter);
  root.style.backgroundColor = gutter;
  root.style.setProperty('--green-offset', (1 - green) * 100 + '%');
  root.style.setProperty('--white-offset', (1 - white) * 100 + '%');
  root.style.setProperty('--line-opacity', String(lines * 0.8));
  root.style.setProperty('--line-shift', (progress * -14) + 'vw');
  root.style.setProperty('--line-drift', (progress * 8) + 'vh');
  root.style.setProperty('--final-white-scale', String(smooth(0.94, 1, progress)));
  root.style.setProperty('--welcome-ink', progress < 0.72 ? '#E9EBEB' : '#090A0F');
  root.style.setProperty('--welcome-kicker-ink', progress < 0.88 ? '#E9EBEB' : '#090A0F');
  root.style.setProperty('--welcome-heading-ink', progress < 0.88 ? '#E9EBEB' : '#090A0F');
  root.style.setProperty('--welcome-heading-stroke', progress >= 0.88 && progress < 0.90 ? '#E9EBEB' : 'transparent');
  root.style.setProperty('--welcome-heading-stroke-width', progress >= 0.88 && progress < 0.90 ? '1px' : '0px');
  root.style.setProperty('--welcome-em-ink', progress < 0.82 ? '#E9EBEB' : '#090A0F');
  root.style.setProperty('--welcome-prompt-ink', progress < 0.66 ? '#E9EBEB' : '#090A0F');

  const next = progress < 0.42 ? 'dark' : progress < 0.76 ? 'green' : 'light';
  root.dataset.navTheme = progress >= 0.995 ? 'light' : 'dark';
  const palette = smooth(0.72, 1, progress);
  const accentProgress = smooth(0.6, 0.92, progress);
  publishTheme(next, {
    particle: hexMix('#18C75F', '#090A0F', palette),
    accent: hexMix('#59FFA0', '#18C75F', accentProgress),
    face: hexMix('#E9EBEB', '#18C75F', accentProgress),
  });
  return { progress, theme: next };
}

export function getThemeProgress() { return progress; }

export function initTheme() {
  setThemeProgress(0);
}
