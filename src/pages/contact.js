import { node, link, pageHeader } from './shared.js';

export function render() {
  const root = node('div', 'page-contact');
  root.append(pageHeader('07 / Contact', 'Let’s build something.', 'Open to Software Engineering, Data and AI, Web Development, Digital Marketing and Design roles.'));
  const cards = node('div', 'contact-cards');
  const email = node('a', 'contact-card', 'jacksonciek@gmail.com'); email.href = 'mailto:jacksonciek@gmail.com';
  email.append(node('span', 'meta', 'Email'), node('span', 'contact-arrow', '↗'));
  const linkedin = node('a', 'contact-card', 'LinkedIn profile'); linkedin.href = 'https://www.linkedin.com/in/jackson-lawrence-ciek/'; linkedin.target = '_blank'; linkedin.rel = 'noopener noreferrer';
  linkedin.append(node('span', 'meta', 'LinkedIn'), node('span', 'contact-arrow', '↗'));
  const cv = link('Download CV', '/cv/Jackson-Lawrence-CV.pdf', 'contact-card');
  cv.download = '';
  cv.append(node('span', 'meta', 'Resume'), node('span', 'contact-arrow', '↓'));
  cards.append(email, linkedin, cv); root.append(cards);
  root.append(node('p', 'contact-location', 'Kota Tangerang · Banten · Indonesia'));
  return root;
}
