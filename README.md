# Jackson Lawrence Portfolio

A static portfolio for Jackson Lawrence, Creative Technologist. It uses Vite, three.js, GSAP with ScrollTrigger, and Lenis. There is no application server or backend.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```text
npm install
npm run dev
```

Vite prints the local development URL in the terminal. To build and preview the static site:

```text
npm run build
npm run preview
```

## Main assets

- `public/media/3d-avatar.png` — portrait source used by the WebGL scene.
- `public/media/3d-avatar-fallback.png` — transparent silhouette fallback used when WebGL is unavailable.
- `public/media/ai-office.jpeg` — AI office image used in the contact footer.
- `public/favicon.svg` — browser icon.
- `public/icons.svg` — reusable SVG icons.
- `public/share.jpg` — social sharing image.
- `references/images/avatar-3d.png` and `references/images/ai-office.png` — original reference images.
- `references/concept.md` — content source for roles, projects, tools, and profile details.

Instrument Serif is loaded from Google Fonts. The remaining interface artwork is drawn in HTML, CSS, SVG, or WebGL.
