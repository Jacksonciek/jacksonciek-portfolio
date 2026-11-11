import projects from '../content/projects.json';
import { node, link, pageHeader, section, badge } from './shared.js';

const valid = (value) => value && value !== 'TODO';
const tags = ['All', 'AI', 'Web', 'Mobile', 'Design', 'Video'];

function projectCard(project) {
  const card = link('', `/projects/${project.slug}`, 'project-card');
  const visual = node('span', `project-visual project-visual--${project.tags[0]?.toLowerCase() || 'default'}`);
  visual.setAttribute('aria-hidden', 'true');
  if (project.thumb) { const img = node('img', 'project-thumb'); img.src = project.thumb; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async'; img.width = 800; img.height = 600; visual.append(img); }
  const content = node('span', 'project-card-copy');
  const meta = node('span', 'project-card-meta meta', `${project.tags.join(' / ')}${valid(project.year) ? ` · ${project.year}` : ''}`);
  const title = node('strong', '', project.title);
  const summary = node('span', 'project-card-summary', project.summary);
  const action = node('span', 'project-card-link', 'View project ↗');
  content.append(meta, title, summary, action); card.append(visual, content);
  if (import.meta.env.DEV && project.placeholder) card.append(badge('Content to confirm'));
  return card;
}

function listPage(query) {
  const root = node('div', 'page-projects');
  root.append(pageHeader('Selected work / 2022 — 2026', 'Projects', 'AI research, web products, mobile apps and product design. Each project opens with its role, tools and demo status.'));
  const currentTag = query.get('tag') || 'All', tool = query.get('tool');
  const filters = node('nav', 'filter-row'); filters.setAttribute('aria-label', 'Filter projects');
  tags.forEach((tag) => {
    const href = tag === 'All' ? '/projects' : `/projects?tag=${encodeURIComponent(tag)}`;
    const a = link(tag, href, `filter-chip${tag === currentTag ? ' is-active' : ''}`);
    a.setAttribute('aria-current', String(tag === currentTag)); filters.append(a);
  });
  if (tool) filters.append(link(`Tool: ${tool} ×`, '/projects', 'filter-chip is-active'));
  root.append(filters);
  const grid = node('div', 'project-grid');
  const filtered = projects.filter((item) => {
    const byTag = currentTag === 'All' || item.tags.includes(currentTag);
    const byTool = !tool || item.stack.some((name) => name.toLowerCase() === tool.toLowerCase());
    return byTag && byTool;
  });
  filtered.forEach((item) => grid.append(projectCard(item)));
  if (!filtered.length) grid.append(node('p', 'empty-state', `No projects are tagged with ${tool || currentTag} yet.`));
  root.append(grid);
  return root;
}

function detailPage(project) {
  const root = node('article', 'project-detail');
  const hero = node('div', `project-detail-visual project-visual--${project.tags[0]?.toLowerCase() || 'default'}`);
  if (project.thumb) { const img = node('img', 'project-thumb'); img.src = project.thumb; img.alt = ''; img.loading = 'eager'; img.decoding = 'async'; img.width = 1600; img.height = 900; hero.append(img); }
  hero.setAttribute('aria-hidden', 'true');
  const intro = node('header', 'project-detail-head');
  intro.append(node('p', 'tag', `${project.tags.join(' / ')}${valid(project.year) ? ` · ${project.year}` : ''}`));
  const title = node('h1', '', project.title); title.id = 'page-title'; intro.append(title);
  intro.append(node('p', 'page-lede', project.summary));
  if (import.meta.env.DEV && project.placeholder) intro.append(badge('Project details to confirm'));
  const body = node('div', 'project-detail-grid');
  const facts = section('Project details');
  const fields = [['Role', project.role], ['Year', project.year]];
  fields.forEach(([label, value]) => {
    if (valid(value)) { const row = node('p', 'detail-fact'); row.append(node('span', 'meta', label), node('strong', '', value)); facts.append(row); }
    else if (import.meta.env.DEV) facts.append(node('p', 'meta', `${label}: TODO`));
  });
  const stack = node('div', 'detail-stack'); stack.append(node('p', 'meta', 'Stack'));
  project.stack.filter(valid).forEach((tool) => stack.append(link(tool, `/projects?tool=${encodeURIComponent(tool)}`, 'chip')));
  if (import.meta.env.DEV && project.stack.some((value) => !valid(value))) stack.append(badge('Stack to confirm'));
  facts.append(stack); body.append(facts);
  const actions = node('div', 'detail-actions');
  if (project.demoMode === 'embedded') actions.append(link('Open live demo ↗', `/projects/${project.slug}/demo/`, 'btn btn--primary'));
  else if (project.demoMode === 'external' && valid(project.links?.demo)) { const a = link('Open live demo ↗', project.links.demo, 'btn btn--primary'); a.target = '_blank'; a.rel = 'noopener noreferrer'; a.removeAttribute('data-link'); actions.append(a); }
  else if (project.demoMode === 'recorded') actions.append(node('div', 'slot', 'A recorded walkthrough will appear here when a video link is added.'));
  if (valid(project.links?.repo)) { const a = link('Source code ↗', project.links.repo, 'btn btn--secondary'); a.target = '_blank'; a.rel = 'noopener noreferrer'; a.removeAttribute('data-link'); actions.append(a); }
  if (!actions.children.length) actions.append(node('p', 'meta', 'Demo and source links are not listed yet.'));
  body.append(actions); root.append(hero, intro, body);
  const back = link('← All projects', '/projects', 'text-link'); root.append(back);
  document.title = `${project.title} | Projects | Jackson Lawrence`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', project.summary);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', project.summary);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', document.title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', project.summary);
  return root;
}

export function render({ path, query }) {
  const slug = path.split('/').filter(Boolean)[1];
  const project = slug ? projects.find((item) => item.slug === slug) : null;
  const root = project ? detailPage(project) : listPage(query);
  return root;
}
