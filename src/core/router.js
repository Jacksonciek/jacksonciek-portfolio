import { lock, unlock, scrollToChapter } from './scroll.js';
import { trapFocus } from './a11y.js';

const routes = {
  '/projects': () => import('../pages/projects.js'),
  '/design': () => import('../pages/design.js'),
  '/about': () => import('../pages/about.js'),
  '/video': () => import('../pages/video.js'),
  '/contact': () => import('../pages/contact.js'),
  '/ai-lab': () => import('../pages/ailab.js'),
};
const titles = {
  '/': ['Jackson Lawrence | Creative technologist', 'AI engineer × designer. Computer Science graduate, 4.00 CGPA, open to roles.'],
  '/projects': ['Projects | Jackson Lawrence', 'Selected AI, web, mobile and design projects by Jackson Lawrence.'],
  '/design': ['Design | Jackson Lawrence', 'Campaign design, visual systems and digital marketing work by Jackson Lawrence.'],
  '/about': ['About | Jackson Lawrence', 'Education, experience, languages and toolkit.'],
  '/video': ['Video | Jackson Lawrence', 'Video editing, cinematography and photography.'],
  '/contact': ['Contact | Jackson Lawrence', 'Contact Jackson Lawrence about software engineering, data, AI, web, marketing and design roles.'],
  '/ai-lab': ['AI lab | Jackson Lawrence', 'Ask the portfolio about Jackson Lawrence’s projects and experience.'],
};

const normalPath = (path) => path.length > 1 ? path.replace(/\/+$/, '') : '/';

export function initRouter({ sheet } = {}) {
  const panel = document.getElementById('pg');
  let current = '', currentPage = null, releaseTrap = null, locked = false, opener = null, routeSeq = 0;
  const closeSheet = () => { if (!document.getElementById('viewer')?.hidden) sheet?.close(); };
  const meta = (path) => {
    const [title, description] = titles[path] || ['Page not found | Jackson Lawrence', 'The page could not be found.'];
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', `${location.origin}${location.pathname}${location.search}`);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = `${location.origin}${location.pathname}${location.search}`;
  };
  const dispose = () => {
    closeSheet();
    currentPage?.destroy?.(); currentPage = null;
    releaseTrap?.(); releaseTrap = null;
  };

  async function render() {
    const seq = ++routeSeq, path = normalPath(location.pathname), routePath = path === '/' ? '/' : path;
    const isProjectDetail = /^\/projects\/[^/]+$/.test(path);
    if (path.includes('/demo/')) return;
    meta(routePath === '/projects' || isProjectDetail ? '/projects' : routePath);
    document.dispatchEvent(new CustomEvent('jl:route', { detail: { path: location.pathname } }));
    if (path === '/') {
      const wasPage = current !== '/';
      dispose(); current = '/'; panel.hidden = true; panel.classList.remove('pg-open');
      document.body.classList.remove('panel-open');
      if (locked) { unlock(); locked = false; }
      if (location.hash) requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      else if (wasPage || scrollY > innerHeight * .5) scrollToChapter(0);
      opener?.focus?.({ preventScroll: true }); opener = null;
      return;
    }
    panel.hidden = false; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.tabIndex = -1;
    panel.setAttribute('aria-labelledby', 'page-title');
    panel.classList.add('pg-open'); document.body.classList.add('panel-open');
    if (!locked) { lock(); locked = true; }
    dispose();
    panel.replaceChildren();
    const shell = document.createElement('div'); shell.className = 'pg-shell';
    const top = document.createElement('div'); top.className = 'pg-topbar';
    const back = document.createElement('a'); back.href = '/'; back.dataset.link = ''; back.className = 'pg-back'; back.textContent = '← Back to the story';
    const context = document.createElement('span'); context.className = 'meta'; context.textContent = path === '/ai-lab' ? 'Interactive demo' : 'Jackson Lawrence / Portfolio';
    top.append(back, context); shell.append(top);
    const mount = document.createElement('div'); mount.className = 'pg-content'; shell.append(mount); panel.append(shell);
    let routeKey = path;
    if (isProjectDetail) routeKey = '/projects';
    const load = routes[routeKey];
    try {
      if (!load) throw new Error('This page is not available.');
      const module = await load();
      if (seq !== routeSeq) return;
      const result = await module.render({ path, query: new URLSearchParams(location.search), sheet });
      if (seq !== routeSeq) { result?.destroy?.(); return; }
      currentPage = result?.el ? result : { el: result };
      mount.append(currentPage.el);
    } catch (error) {
      const fallback = document.createElement('section'); fallback.className = 'page-heading';
      fallback.innerHTML = '<p class="tag">Not found</p><h1 id="page-title">This page is not available.</h1><p class="page-lede">Use the navigation to return to the portfolio.</p>';
      mount.append(fallback);
    }
    if (!locked) { lock(); locked = true; }
    releaseTrap = trapFocus(panel);
    panel.focus({ preventScroll: true });
    if (location.hash) setTimeout(() => panel.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    panel.animate([{ opacity: 0, transform: document.body.classList.contains('nm') ? 'none' : 'translateY(22px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: document.body.classList.contains('nm') ? 140 : 420, easing: 'cubic-bezier(.32,.72,0,1)' });
    current = routePath;
  }

  const navigate = (href, source) => {
    opener = source || document.activeElement;
    const url = new URL(href, location.href);
    if (url.pathname.includes('/demo/')) { location.assign(url.href); return; }
    history.pushState({ jl: true }, '', `${url.pathname}${url.search}${url.hash}`);
    render();
  };
  document.addEventListener('click', (event) => {
    const a = event.target.closest('a[data-link]');
    if (!a || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || a.target === '_blank') return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname.includes('/demo/')) return;
    event.preventDefault(); navigate(url.href, a);
  });
  addEventListener('popstate', () => { render(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden && document.getElementById('viewer')?.hidden !== false) {
      history.pushState({ jl: true }, '', '/'); render();
    }
  });
  if (normalPath(location.pathname) !== '/') render(); else meta('/');
  return { navigate };
}
