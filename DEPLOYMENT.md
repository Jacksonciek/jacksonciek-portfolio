# Deployment notes

## Cloudflare Pages

Connect the repository to Cloudflare Pages and use:

- Build command: `npm run build`
- Build output directory: `dist`

The portfolio is a static site. The AI Lab searches `src/content/kb.json` in the browser and needs no server, API key, or database.

## Domain and search metadata

The production domain has not been supplied, so the site does not publish a canonical URL or sitemap yet. After choosing a domain, add it to the Pages project, set the canonical and Open Graph URLs in `index.html`, and create a sitemap and matching `Sitemap` directive in `public/robots.txt`.

## Adding static project demos

For a project with an embedded demo, build it with `/projects/<slug>/demo/` as its base path and hash-based routing. Copy only its build output to `public/projects/<slug>/demo/`, then rebuild this portfolio. Search generated JavaScript for secrets because client bundles are public. If a project requires a server, show a recorded demo or link to its hosted version instead of adding a backend here.

## Reference

- [Cloudflare Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Cloudflare Pages headers](https://developers.cloudflare.com/pages/configuration/headers/)
