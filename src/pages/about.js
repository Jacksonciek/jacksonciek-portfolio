import toolkit from '../content/toolkit.json';
import { node, link, pageHeader, section, badge } from './shared.js';

const events = [
  { date: '2017–2019', year: 2018, kind: 'identity', title: 'Math olympiad medals', text: 'HKIMO, TIMO, SEAMO and AIMO.' },
  { date: '2019', year: 2019, kind: 'creative', title: 'South Korea exchange', text: 'Student exchange programme.' },
  { date: 'Aug 2022', year: 2022.6, kind: 'identity', title: 'Computer Science at UMN', text: 'Full merit-based scholarship.' },
  { date: '2023', year: 2023.5, kind: 'creative', title: 'UMN Marketing + Campus Visit', text: 'Campus Visit MC, PIC and marketing.' },
  { date: '2024', year: 2024.35, kind: 'engineer', title: 'Web Developer, UMN ECO + Infinite', text: 'React, Laravel and PIC of PPIF 2024.' },
  { date: 'Nov 2024', year: 2024.86, kind: 'creative', title: 'Digital Marketing Consultant', text: 'Bangsar Heights Pavilion · remote.' },
  { date: 'Feb 2025', year: 2025.12, kind: 'engineer', title: 'AI Engineer Intern', text: 'AI.DECE · LLM and RAG systems.' },
  { date: 'Feb–Apr 2025', year: 2025.28, kind: 'engineer', title: 'R&D Intern', text: 'PT Quantum Infra Solusindo.' },
  { date: 'Aug 2026', year: 2026.64, kind: 'identity', title: 'Computer Science graduate', text: 'Universitas Multimedia Nusantara · 4.00 CGPA.' },
  { date: 'Oct 2026', year: 2026.82, kind: 'identity', title: 'MBA, Project Management', text: 'GBS Malta · Oct 2026 to Oct 2027.' },
];

function drawHelix(root, svg, dots) {
  const height = Math.max(900, root.clientHeight);
  const x = (y, strand) => 36 + strand * 22 * Math.sin(y / 150 * Math.PI * 2);
  const d = (strand) => {
    const parts = [];
    for (let y = 0; y <= height; y += 6) parts.push(`${y ? 'L' : 'M'} ${x(y, strand).toFixed(2)} ${y}`);
    return parts.join(' ');
  };
  svg.setAttribute('viewBox', `0 0 72 ${height}`); svg.setAttribute('preserveAspectRatio', 'none');
  svg.querySelector('.helix-engineer').setAttribute('d', d(1));
  svg.querySelector('.helix-creative').setAttribute('d', d(-1));
  dots.forEach(({ circle, event, card }, index) => {
    const y = 38 + index * ((height - 76) / Math.max(1, dots.length - 1)), strand = event.kind === 'creative' ? -1 : 1;
    circle.setAttribute('cx', x(y, strand)); circle.setAttribute('cy', y);
    card.style.setProperty('--event-y', `${y}px`); card.dataset.side = String(strand);
  });
}

export function render() {
  const root = node('div', 'page-about');
  root.append(pageHeader('About / Jackson Lawrence', 'I build the model and the product around it.', 'Computer Science graduate, AI engineer and designer based in Kota Tangerang, Banten, Indonesia.'));

  const timeline = section('A timeline across code and campaigns');
  const helix = node('div', 'helix');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.classList.add('helix-svg'); svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = '<path class="helix-engineer"/><path class="helix-creative"/>';
  const eventsRoot = node('div', 'helix-events'), dots = [];
  events.forEach((event) => {
    const card = node('article', 'timeline-event');
    const date = node('span', 'meta', event.date), title = node('h3', '', event.title), text = node('p', '', event.text);
    card.append(date, title, text); eventsRoot.append(card);
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', '5.5'); circle.setAttribute('class', `helix-dot helix-dot--${event.kind}`); svg.append(circle);
    dots.push({ circle, event, card });
  });
  helix.append(svg, eventsRoot); timeline.append(helix); root.append(timeline);
  let observer;
  const update = () => drawHelix(helix, svg, dots);
  requestAnimationFrame(update);
  if ('ResizeObserver' in window) { observer = new ResizeObserver(update); observer.observe(helix); }
  else addEventListener('resize', update, { passive: true });

  const school = section('Education and certificates'); school.classList.add('about-two-col');
  const education = node('article', 'about-card');
  education.append(node('p', 'meta', 'Aug 2022 — Aug 2026'), node('h3', '', 'BSc Computer Science'), node('p', '', 'Universitas Multimedia Nusantara · 4.00 CGPA across all eight semesters · Full merit-based scholarship.'));
  education.append(node('p', 'meta', 'Oct 2026 — Oct 2027'), node('h3', '', 'MBA Project Management'), node('p', '', 'GBS Malta.'));
  education.append(node('p', 'about-note', 'Thesis: hate speech span identification in Indonesian-English code-mixed text, using multi-task learning with BLOOM-560M.'));
  const teaching = node('div', 'teaching-detail'); teaching.append(node('h3', '', 'Lab assistant · 4 courses · 200+ students'), node('p', '', 'Student satisfaction ranged from 93.71 to 98.85 out of 100.'));
  const courses = node('ul', 'credential-list');
  ['Object Oriented Programming (Java) · 80 students', 'Database Systems (SQL) · 40 students', 'Algorithms and Data Structures (C) · 40 students', 'IF 110 · 40 students'].forEach((item) => courses.append(node('li', '', item)));
  teaching.append(courses);
  if (import.meta.env.DEV) teaching.append(badge('IF 110 course title needs verification'));
  education.append(teaching);
  const credentials = node('article', 'about-card'); credentials.append(node('h3', '', 'Certificates and exchange'));
  const list = node('ul', 'credential-list');
  ['IT Specialist (Artificial Intelligence)', 'Huawei HCIA-AI V3.5', 'Python Intermediate', 'Competitive Programming', 'Introduction to Programming Using Python', 'South Korea student exchange, 2019', 'Math olympiad medals: HKIMO, TIMO, SEAMO and AIMO (2017–2019)'].forEach((item) => list.append(node('li', '', item)));
  credentials.append(list); school.append(education, credentials); root.append(school);

  const kit = section('The tools behind the work'); kit.id = 'toolkit'; kit.classList.add('toolkit-section');
  const allTools = toolkit.groups.flatMap((group) => group.tools);
  kit.append(node('p', 'page-lede', `${allTools.length} tools across ${toolkit.groups.length} disciplines.`));
  const groups = node('div', 'toolkit-groups');
  toolkit.groups.forEach((group) => {
    const card = node('article', 'toolkit-group'); card.dataset.kind = group.kind;
    card.append(node('h3', '', group.name));
    const chips = node('div', 'chips'); group.tools.forEach((tool) => chips.append(link(tool, `/projects?tool=${encodeURIComponent(tool)}`, 'chip')));
    card.append(chips); groups.append(card);
  });
  kit.append(groups);
  const marquee = node('div', 'about-marquee'); marquee.setAttribute('aria-hidden', 'true');
  const line = allTools.map((tool) => `<span>${tool}</span><i>✳</i>`).join('');
  marquee.innerHTML = `<div><div>${line}</div><div>${line}</div></div>`; kit.append(marquee); root.append(kit);

  const languages = section('Languages');
  languages.append(node('p', 'language-line', 'Indonesian and Hokkien (native) · English (full professional) · Chinese (limited working) · Korean and Japanese (elementary).'));
  const cv = link('Download CV ↗', '/cv/Jackson-Lawrence-CV.pdf', 'btn btn--primary'); cv.download = ''; languages.append(cv); root.append(languages);
  return { el: root, destroy() { observer?.disconnect(); if (!observer) removeEventListener('resize', update); } };
}
