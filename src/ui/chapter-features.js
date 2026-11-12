import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motionOn } from '../core/motion.js';
import { scrollToChapter } from '../core/scroll.js';
import toolkit from '../content/toolkit.json';

gsap.registerPlugin(ScrollTrigger);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
let ctx, gl;

function prepareDecorativeContent() {
  const railWindow = document.querySelector('[data-project-rail-window]');
  const rail = railWindow?.querySelector('[data-project-rail]');
  const projectInstruction = document.querySelector('[data-project-instruction]');
  const syncProjectInstructions = () => {
    if (projectInstruction) projectInstruction.textContent = motionOn() ? 'SCROLL TO MOVE THROUGH THE WORK' : 'SWIPE OR USE ARROW KEYS';
    if (railWindow) railWindow.setAttribute('aria-label', motionOn()
      ? 'Selected projects. Scroll vertically to move through the sequence.'
      : 'Selected projects. Horizontal scroll area. Use left and right arrow keys to browse.');
  };
  syncProjectInstructions();
  document.addEventListener('jl:motion', syncProjectInstructions);
  if (railWindow && rail && !railWindow.dataset.focusSync) {
    railWindow.dataset.focusSync = '1';
    railWindow.addEventListener('focusin', (event) => {
      const scene = event.target.closest('.project-scene');
      if (!scene || !motionOn()) return;
      const index = [...rail.children].indexOf(scene);
      const progress = index / Math.max(1, rail.children.length - 1);
      scrollToChapter('projects', progress);
    });
  }
  const track = document.querySelector('[data-film-track]');
  if (track && !track.children.length) {
    for (let i = 0; i < 12; i++) {
      const frame = document.createElement('div');
      frame.className = `film-frame film-frame-${i % 6}`;
      frame.innerHTML = `<span class="film-number">${String(i + 1).padStart(2, '0')}</span><i aria-hidden="true"></i><span class="film-caption">Footage not supplied</span>`;
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
  const cards = [...document.querySelectorAll('[data-experience-card]')];
  if (!cards.length) return;
  const position = clamp01(t) * (cards.length - 1);
  const cardHeight = document.querySelector('[data-experience-deck]')?.offsetHeight || innerHeight * .55;
  cards.forEach((card, i) => {
    const distance = i - position;
    let y, scale, rotation, opacity;
    if (distance >= 0) {
      const depth = Math.min(distance, 2.6);
      y = depth * 24;
      scale = 1 - depth * .045;
      rotation = depth * .8;
      opacity = Math.max(0, 1 - depth * .23);
    } else {
      const depth = Math.min(-distance, 1.4);
      y = -depth * cardHeight * 1.05;
      scale = 1 - depth * .04;
      rotation = -depth * 2;
      opacity = Math.max(0, 1 - Math.pow(depth, 1.55) * 1.05);
    }
    card.style.transform = `translate3d(0,${y}px,0) rotate(${rotation}deg) scale(${scale})`;
    card.style.opacity = String(opacity);
    card.style.visibility = opacity > .02 ? 'visible' : 'hidden';
    card.style.zIndex = String(1000 - Math.round(Math.abs(distance) * 12));
  });
  const active = Math.min(cards.length - 1, Math.floor(position + .5));
  const counter = document.querySelector('[data-role-count]');
  if (counter && counter.dataset.current !== String(active)) {
    counter.dataset.current = String(active);
    counter.textContent = `${String(active + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
  }
  const progress = document.querySelector('[data-role-progress]');
  if (progress) progress.style.transform = `scaleX(${clamp01(t)})`;
}

function revealElements(elements, t, start, finish) {
  elements.forEach((element, i) => {
    const offset = i * .018;
    const enter = smooth(start + offset, finish + offset, t);
    const leave = 1 - smooth(.88, 1, t);
    const visible = Math.min(enter, leave);
    element.style.opacity = String(visible);
    element.style.transform = `translate3d(0,${(1 - visible) * 18}px,0)`;
  });
}

function updateProjects(t) {
  const track = document.querySelector('[data-project-rail]');
  if (!track) return;
  revealElements([...document.querySelector('.project-heading').children], t, .01, .18);
  const viewport = track.parentElement;
  const distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
  const travel = clamp01(t);
  track.style.transform = `translate3d(${-travel * distance}px,0,0)`;
  const scenes = [...track.children];
  const width = viewport.clientWidth;
  let closestIndex = 0, closestDistance = Infinity;
  scenes.forEach((scene, i) => {
    const center = scene.offsetLeft + scene.offsetWidth / 2 - travel * distance;
    const offset = center - width / 2;
    const distanceFromCenter = Math.abs(offset);
    if (distanceFromCenter < closestDistance) { closestDistance = distanceFromCenter; closestIndex = i; }

    // Cards ease into and out of the frame as the rail passes them. Only
    // transform and opacity change while scrolling.
    const enter = smooth(width * .78, width * .3, offset);
    const leave = 1 - smooth(-width * .86, -width * 1.1, offset);
    const reveal = Math.min(enter, leave);
    scene.style.opacity = String(reveal);
    scene.style.transform = `translate3d(0,${(1 - reveal) * 18}px,0) scale(${.97 + reveal * .03})`;
  });
  const count = scenes.length;
  const counter = document.querySelector('[data-rail-count]');
  const label = `${String(closestIndex + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`;
  if (counter && counter.textContent !== label) counter.textContent = label;
}

function agents(t) {
  const section = document.querySelector('#agents');
  if (!section) return;
  revealElements([...section.querySelector('.agent-heading').children, section.querySelector('.agent-console')], t, .01, .2);
}

function transitionCopy(t) {
  const heading = document.querySelector('#transition-copy h2');
  if (heading) revealElements([heading], t, .04, .2);
}

function macbookTransition(t) {
  const macbook = document.querySelector('#macbook-transition [data-macbook]');
  if (!macbook) return;
  const opened = smooth(.015, .24, t);
  const push = smooth(.48, .98, t);
  const endScale = Number.parseFloat(getComputedStyle(macbook).getPropertyValue('--screen-end-scale')) || 1.2;
  macbook.style.setProperty('--lid-open', String(opened));
  macbook.style.setProperty('--screen-push', String(push));
  macbook.style.setProperty('--screen-scale', String(1 + (endScale - 1) * push));
  macbook.style.setProperty('--screen-opacity', String(1 - push * .86));
  macbook.style.setProperty('--base-opacity', String(1 - push));
  macbook.style.setProperty('--base-lift', `${push * 34}px`);
  macbook.style.setProperty('--caption-opacity', String(1 - push));
  gl?.setCameraPush(push);
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
  document.querySelector('#experience')?.classList.remove('is-scrolling');
  document.querySelectorAll('[data-experience-card]').forEach((card) => {
    card.style.removeProperty('transform');
    card.style.removeProperty('opacity');
    card.style.removeProperty('visibility');
    card.style.removeProperty('z-index');
  });
  const counter = document.querySelector('[data-role-count]');
  if (counter) { counter.dataset.current = '0'; counter.textContent = `01 / ${String(document.querySelectorAll('[data-experience-card]').length).padStart(2, '0')}`; }
  const progress = document.querySelector('[data-role-progress]');
  if (progress) progress.style.removeProperty('transform');
  const macbook = document.querySelector('#macbook-transition [data-macbook]');
  if (macbook) macbook.style.setProperty('--lid-open', motionOn() ? '0' : '1');
  if (macbook) macbook.style.setProperty('--screen-push', '0');
  if (macbook) {
    macbook.style.setProperty('--screen-scale', '1');
    macbook.style.setProperty('--screen-opacity', '1');
    macbook.style.setProperty('--base-opacity', '1');
    macbook.style.setProperty('--base-lift', '0px');
    macbook.style.setProperty('--caption-opacity', '1');
  }
  gl?.setCameraPush(0);
  const rail = document.querySelector('[data-project-rail]');
  if (rail) {
    rail.style.transform = '';
    [...rail.children].forEach((scene) => {
      scene.style.removeProperty('opacity');
      scene.style.removeProperty('transform');
    });
  }
  const railCount = document.querySelector('[data-rail-count]');
  if (railCount) railCount.textContent = `01 / ${String(rail?.children.length || 0).padStart(2, '0')}`;
  document.querySelectorAll('.project-heading > *, #agents .agent-heading > *, #agents .agent-console').forEach((element) => {
    element.style.removeProperty('opacity');
    element.style.removeProperty('transform');
  });
  document.querySelectorAll('.contact-mark span').forEach((letter, i) => {
    if (i !== 0 && i !== 8) { letter.style.maxWidth = '.72em'; letter.style.opacity = '1'; }
  });
  const track = document.querySelector('[data-film-track]');
  if (track) track.style.transform = '';
}

function build() {
  ctx = gsap.context(() => {
    document.querySelector('#experience')?.classList.add('is-scrolling');
    const add = (id, onUpdate) => ScrollTrigger.create({
      trigger: `#${id}`, start: 'top top', end: 'bottom bottom',
      onUpdate: (self) => { if (motionOn()) onUpdate(self.progress); },
      onRefresh: (self) => { if (motionOn()) onUpdate(self.progress); },
    });
    add('experience', experience);
    add('projects', updateProjects);
    add('agents', agents);
    add('transition-copy', transitionCopy);
    add('macbook-transition', macbookTransition);
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
