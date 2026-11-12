import { HERO_VIDEO_URL, FLAGS } from '../config.js';
import { RM, motionOn } from '../core/motion.js';

const canPlayVideo = () => FLAGS.HERO_VIDEO && HERO_VIDEO_URL && !RM && motionOn()
  && innerWidth > 760 && !navigator.connection?.saveData;

function setupVideo() {
  const host = document.getElementById('hero-video');
  const video = host?.querySelector('video');
  if (!host || !video || !canPlayVideo()) return;
  video.src = HERO_VIDEO_URL;
  video.preload = 'metadata';
  video.play().catch(() => host.classList.add('video-fallback'));
  video.addEventListener('error', () => host.classList.add('video-fallback'), { once: true });
  const home = document.getElementById('home');
  const hide = () => {
    const p = Math.max(0, Math.min(1, (scrollY / Math.max(1, home.offsetHeight - innerHeight) - 0.55) / 0.4));
    host.style.setProperty('--video-wipe', `${p * 100}%`);
    if (p >= 1) video.pause();
    else if (document.body.classList.contains('ready')) video.play().catch(() => {});
  };
  addEventListener('scroll', hide, { passive: true });
  hide();
}

function clock() {
  const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' });
  const update = () => document.querySelectorAll('[data-clock]').forEach((el) => { el.textContent = `${formatter.format(new Date())} · Jakarta`; });
  update();
  setInterval(update, 20_000);
}

function entrance() {
  const items = [...document.querySelectorAll('#pill, #home .badge, #home .hero-line, #home .sub, #home .txt > .fx:not(.badge), #home .stats > li')];
  const delays = [80, 220, 420, 620, 820, 960, 1100, 1120, 1280, 1440, 1600];
  items.forEach((el, i) => {
    el.classList.add('appear');
    el.style.setProperty('--appear-delay', `${delays[Math.min(i, delays.length - 1)]}ms`);
    el.addEventListener('animationend', () => el.classList.add('is-in'), { once: true });
  });
  const reveal = () => {
    if (!motionOn()) { items.forEach((el) => el.classList.add('is-in')); return; }
    requestAnimationFrame(() => requestAnimationFrame(() => items.forEach((el) => {
      const target = el.matches('.hero-line') ? el.querySelector('.hero-line-in') : el;
      if (target && getComputedStyle(target).animationName === 'none') el.classList.add('is-in');
    })));
  };
  document.addEventListener('jl:splash-done', reveal, { once: true });
  document.addEventListener('jl:motion', (e) => { if (!e.detail) items.forEach((el) => el.classList.add('is-in')); });
  if (document.body.classList.contains('ready')) reveal();
}

export function initHero() {
  clock();
  entrance();
  setupVideo();
  document.addEventListener('jl:motion', (e) => {
    if (!e.detail) document.getElementById('hero-video')?.querySelector('video')?.pause();
  });
}
