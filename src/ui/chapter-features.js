import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motionOn } from '../core/motion.js';
import toolkit from '../content/toolkit.json';

gsap.registerPlugin(ScrollTrigger);
const TAU = Math.PI * 2;
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
let ctx, gl;

function prepareDecorativeContent() {
  const track = document.querySelector('[data-film-track]');
  if (track && !track.children.length) {
    for (let i = 0; i < 12; i++) {
      const frame = document.createElement('div');
      frame.className = `film-frame film-frame-${i % 6}`;
      frame.innerHTML = `<span class="film-number">${String(i + 1).padStart(2, '0')}</span><i aria-hidden="true"></i><span class="film-caption">Frame ${String(i + 1).padStart(2, '0')}</span>`;
      track.append(frame);
    }
  }
  const mark = document.querySelector('.contact-mark span');
  if (mark && !mark.children.length) [...'Jackson Lawrence'].forEach((char) => {
    const letter = document.createElement('span'); letter.textContent = char === ' ' ? '\u00a0' : char; letter.setAttribute('aria-hidden', 'true'); mark.append(letter);
  });
  const names = toolkit.groups.flatMap((group) => group.tools);
  const summary = `${names.length} tools across ${toolkit.groups.length} disciplines`;
  document.querySelectorAll('[data-toolkit-summary]').forEach((el) => { el.textContent = summary; });
  const marquee = document.querySelector('.tool-marquee');
  if (marquee && !marquee.children.length) {
    const list = names.map((name) => `<span>${name}</span>`).join('<i aria-hidden="true">✳</i>');
    marquee.innerHTML = `<div class="marquee-track"><div>${list}</div><div aria-hidden="true">${list}</div></div>`;
  }
}

function experience(t) {
  const steps = [...document.querySelectorAll('#experience .step')];
  if (steps.length < 2) return;
  const consolePanel = document.querySelector('.agent-console');
  if (consolePanel && matchMedia('(max-width:760px)').matches) {
    const reveal = smooth(.5, .68, t);
    consolePanel.style.opacity = String(reveal);
    consolePanel.style.visibility = reveal > .02 ? 'visible' : 'hidden';
    consolePanel.style.transform = `translateY(${(1 - reveal) * 14}px)`;
  }
  const a = 1 - smooth(.4, .55, t), b = smooth(.45, .6, t);
  steps[0].style.setProperty('--step-opacity', String(a));
  steps[1].style.setProperty('--step-opacity', String(b));
  steps[0].setAttribute('aria-hidden', String(a < .1));
  steps[1].setAttribute('aria-hidden', String(b < .1));
  const counter = document.querySelector('[data-step-count]');
  if (counter) counter.textContent = t < .5 ? '01 / 02' : '02 / 02';
  const line = document.querySelector('[data-mini-ui]');
  if (!line) return;
  const question = '> Which tools did Jackson use for RAG?';
  if (t < .52) line.textContent = question;
  else line.textContent = `queue depth ${Math.max(1, Math.round(smooth(.55, .95, t) * 128))} msgs`;
}

function updateProjects(t) {
  const track = document.querySelector('[data-project-rail]');
  if (!track) return;
  const viewport = track.parentElement;
  const distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
  const travel = smooth(.28, .98, t);
  track.style.transform = motionOn() ? `translate3d(${-travel * distance}px,0,0)` : '';
  const count = track.children.length;
  const index = Math.min(count, Math.max(1, Math.round(1 + travel * (count - 1))));
  const counter = document.querySelector('[data-rail-count]');
  if (counter) counter.textContent = `${String(index).padStart(2, '0')} / ${String(count).padStart(2, '0')}`;
}

function design(t) {
  const macbook = document.querySelector('[data-macbook]');
  if (!macbook) return;
  const opened = smooth(.015, .2, t);
  macbook.style.setProperty('--lid-open', String(opened));
  macbook.style.setProperty('--screen-arrive', String(smooth(.13, .34, t)));
}

function video(t) {
  const track = document.querySelector('[data-film-track]');
  if (!track) return;
  const film = track.closest('.film');
  const distance = Math.max(0, track.scrollWidth - film.clientWidth);
  track.style.transform = motionOn() ? `translate3d(${-smooth(.1, .9, t) * distance}px,0,0)` : '';
  const seconds = Math.floor(t * 90), mm = String(Math.floor(seconds / 60)).padStart(2, '0'), ss = String(seconds % 60).padStart(2, '0');
  const time = film.querySelector('[data-timecode]');
  if (time) time.textContent = `00:${mm}:${ss}`;
}

function contact(t) {
  const letters = [...document.querySelectorAll('.contact-mark span')];
  const amount = smooth(.3, .8, t);
  letters.forEach((letter, i) => {
    if (i === 0 || i === 8) { letter.style.maxWidth = '.85em'; letter.style.opacity = '1'; }
    else { letter.style.maxWidth = `${.72 * (1 - amount)}em`; letter.style.opacity = String(1 - amount); }
  });
}

function resetStatic() {
  gl.setSpin(0);
  const steps = [...document.querySelectorAll('#experience .step')];
  steps.forEach((step) => { step.style.removeProperty('--step-opacity'); step.removeAttribute('aria-hidden'); });
  const counter = document.querySelector('[data-step-count]'); if (counter) counter.textContent = '02 / 02';
  const line = document.querySelector('[data-mini-ui]'); if (line) line.textContent = 'queue depth 128 msgs';
  const consolePanel = document.querySelector('.agent-console');
  if (consolePanel) {
    if (motionOn() && matchMedia('(max-width:760px)').matches) {
      consolePanel.style.opacity = '0'; consolePanel.style.visibility = 'hidden'; consolePanel.style.transform = 'translateY(14px)';
    } else {
      consolePanel.style.removeProperty('opacity'); consolePanel.style.removeProperty('visibility'); consolePanel.style.removeProperty('transform');
    }
  }
  const macbook = document.querySelector('[data-macbook]');
  if (macbook) macbook.style.setProperty('--lid-open', motionOn() ? '0' : '1');
  if (macbook) macbook.style.setProperty('--screen-arrive', motionOn() ? '0' : '1');
  const rail = document.querySelector('[data-project-rail]'); if (rail) rail.style.transform = '';
  const railCount = document.querySelector('[data-rail-count]'); if (railCount) railCount.textContent = '01 / 06';
  document.querySelectorAll('.contact-mark span').forEach((letter, i) => {
    if (i !== 0 && i !== 8) { letter.style.maxWidth = '.72em'; letter.style.opacity = '1'; }
  });
  const track = document.querySelector('[data-film-track]');
  if (track) track.style.transform = '';
}

function build() {
  ctx = gsap.context(() => {
    const add = (id, onUpdate) => ScrollTrigger.create({
      trigger: `#${id}`, start: 'top top', end: 'bottom bottom',
      onUpdate: (self) => { if (motionOn()) onUpdate(self.progress); },
      onRefresh: (self) => { if (motionOn()) onUpdate(self.progress); },
    });
    add('education', (t) => { gl.setSpin(smooth(.1, .8, t) * TAU); });
    add('experience', experience);
    add('projects', updateProjects);
    add('design', design);
    add('video', video);
    add('contact', contact);
    const officeReveal = gsap.utils.toArray('.office-intro > *, .office-scene, .foot-connect-copy > *, .social-tile');
    gsap.fromTo(officeReveal, { y: 24, opacity: 0 }, {
      y: 0, opacity: 1, duration: .75, stagger: .055, ease: 'power3.out',
      scrollTrigger: { trigger: '.ai-office', start: 'top 82%', once: true },
    });
  });
}

export function initChapterFeatures() {
  prepareDecorativeContent();
  import('../gl/scene.js').then((scene) => {
    gl = scene.gl;
    resetStatic();
    if (motionOn()) build();
    document.addEventListener('jl:motion', (e) => {
      if (e.detail && !ctx) { build(); ScrollTrigger.refresh(); }
      else if (!e.detail && ctx) { ctx.revert(); ctx = null; resetStatic(); }
    });
    addEventListener('resize', () => { if (motionOn()) ScrollTrigger.refresh(); }, { passive: true });
  });
}
