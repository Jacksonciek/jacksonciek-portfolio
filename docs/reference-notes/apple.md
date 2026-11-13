# R1 reference: apple.com

Opened the live homepage in Playwright using installed Microsoft Edge. Captured the page at 1440×900 at scroll positions 0, 650 and 1450 px. Only scroll staging, typography, spacing and product placement were considered.

## Observed sequence

- At the top, a persistent, low-contrast navigation strip sits above broad product panels.
- Scrolling 650 px reveals the next full-width product stage: centered title, short subtitle, two compact pill buttons and a large product visual with broad whitespace.
- Around 1450 px, the page advances to a dark MacBook stage. The headline sits near the top center; the laptop occupies roughly 66% of the viewport width and 48% of its height, with keyboard details visible near the lower edge.
- Changes between product panels occur as the scroll advances. The screenshots do not expose exact easing, pin distance or durations.

## Layout and style

- Large centered headings occupy about 40–55 px at 1440 px width; supporting text is about half that size. Body copy is short and spaced well apart.
- Product panels use near-full viewport width and substantial vertical padding. Controls sit directly below the heading; the main visual anchors the lower half.
- Sampled visible colors: near-black `#000000`, warm-white `#F5F5F7`, and interface blue approximately `#0071E3`.
- Scroll distance is native and continuous; a single screenshot cannot establish animation duration or easing. Later motion tokens are therefore estimates, labeled in code and this report.

## Interaction and must match

Hover and click details were outside the reference focus. Keep type crisp, sparse, centered within each product stage, and let the visual carry most of the screen. Use a single shared easing/scrub token rather than unrelated section timings.
