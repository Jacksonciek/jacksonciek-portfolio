# Deployment notes

## Cloudflare Pages

Connect the GitHub repository to Cloudflare Pages and use:

- Build command: `npm run build`
- Build output directory: `dist`

Keep the repository's top-level `functions/` folder outside `dist`; it provides `/api/ask`. Use Git integration or Wrangler to deploy it. A dashboard drag-and-drop static upload does not deploy Pages Functions, so the portfolio would render while the AI lab uses its local notes fallback.

## AI lab secrets and limits

In the Pages project settings, add `OPENAI_API_KEY` as a secret and `OPENAI_MODEL` as a text variable. Do not put either value in browser code or commit a `.dev.vars` file. In the OpenAI API project's Limits settings, set a monthly spend limit and turn on **Enforce a hard limit**; an alert alone does not stop requests, and enforcement may allow slight overshoot.

For the included per-IP daily limit, create a Cloudflare KV namespace and bind it to the Pages project using the variable name `RL`. The Function allows up to 20 requests per IP per UTC day when this binding exists. If you do not bind KV, add a Cloudflare rate-limiting rule before sharing the AI lab publicly.

To try the Function locally, create an ignored `.dev.vars` file in the repository root:

```dotenv
OPENAI_API_KEY=your-secret-key
OPENAI_MODEL=your-model-id
```

Then run:

```powershell
npm run build
npx wrangler pages dev dist
```

The Cloudflare dashboard exposes secrets and bindings under the Pages project's settings. KV bindings need a redeploy before they are available to the Function.

## Domain and search metadata

The production domain has not been supplied. Before launch, replace `https://your-domain.example` in `index.html`, `public/robots.txt`, and `public/sitemap.xml` with the final HTTPS domain. Add that domain to the Pages project, then confirm the canonical URL and sitemap use it.

## Adding static project demos

For a project with an embedded demo, build that demo with `/projects/<slug>/demo/` as its base path and hash-based routing. Copy only its build output to `public/projects/<slug>/demo/`, then rebuild this portfolio. Search the generated JavaScript for secrets; anything in a client build is public. If the demo needs a paid API, route requests through its own server-side Function. After deployment, open the demo URL and a deep link inside the demo.

## References

- [Cloudflare Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Pages Functions API reference](https://developers.cloudflare.com/pages/functions/api-reference/)
- [Create and deploy Pages Functions](https://developers.cloudflare.com/pages/functions/get-started/)
- [Pages Functions bindings](https://developers.cloudflare.com/pages/functions/bindings/)
- [Cloudflare Pages headers](https://developers.cloudflare.com/pages/configuration/headers/)
- [OpenAI Responses API reference](https://developers.openai.com/api/reference/resources/responses/methods/create)
- [OpenAI API project spend limits](https://help.openai.com/en/articles/9186755-managing-projects-in-the-api-platform)
