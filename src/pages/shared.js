export const node = (tag, className = '', text = '') => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== '') el.textContent = text;
  return el;
};

export const link = (label, href, className = '') => {
  const el = node('a', className, label); el.href = href;
  if (href.startsWith('/') && !href.startsWith('/cv/') && !href.includes('/demo/')) el.dataset.link = '';
  return el;
};

export const pageHeader = (eyebrow, title, lede = '') => {
  const header = node('header', 'page-heading');
  header.append(node('p', 'tag', eyebrow));
  const h1 = node('h1', '', title); h1.id = 'page-title'; header.append(h1);
  if (lede) header.append(node('p', 'page-lede', lede));
  return header;
};

export const section = (title, description = '') => {
  const el = node('section', 'page-section');
  if (title) { const h2 = node('h2', '', title); el.append(h2); }
  if (description) el.append(node('p', 'page-lede', description));
  return el;
};

export const badge = (text, kind = '') => {
  const el = node('span', `chip${kind ? ` chip--${kind}` : ''}`, text);
  if (kind === 'creative') el.dataset.g = 'cre';
  return el;
};
