# R3 reference: About Me composition

## Sources and how they were read

- `references/images/about_me.png` was opened directly. The filename maps to the brief's `about-me.png`.
- The live About Us area at [wearestokt.com/#about-us](https://wearestokt.com/#about-us) was opened with Playwright for Edge at 1440×900. Captures are in the ignored `.ref-cache/` folder. Only the About Us area informed this note; its wording, logos, image and artwork are excluded.
- R3 reuses the cached `background.mp4` and tibdigital home observations in [background.md](background.md) and [tibdigital-home.md](tibdigital-home.md); those references were not re-analyzed.

## Timeline and composition

- The supplied PNG is a static composition, so it provides no motion timeline. At the top, three framed zones share one row: a narrow stack of three stat tiles at left (about 14% of the width), a tall feature tile beside it (about 29%), and a globe panel spanning the remaining 55%. The globe is the largest visual and sits low in the upper-right panel.
- The next row uses a wide portrait tile at left, a text panel in the middle, and a tall object tile at right. These three align to one shared baseline and use thin rounded borders.
- A full-width horizontal tool strip sits below the profile row. Its label stays at the left; framed tool tiles continue across the rest of the row.
- Playwright showed the same dark, bordered grid in the live section. The lower capture confirms the profile row and the horizontal tool strip. The exact autoplay and drag behavior was not measured from the reference, so the brief's explicit auto-rotation and draggable interactions govern our implementation.

## Layout and colors

- Overall content uses nearly the full viewport width with about 2.5–3% side margins. The three-zone upper row occupies roughly 50% of the visible section; the profile row about 43%; the tool strip about 17%. Rounded rectangles have small gaps and align edge to edge.
- Sampled visual estimates: near-black background `#0A0A0A`; panel fill `#0B0B0B`; border `#2A2A2A`; primary text `#F2F2F2`; secondary text `#A9B6C1`; globe strokes are white. These are estimates from the rendered captures.
- No hover or click state was observed. The source PNG has none.

## Timing estimates and must match

- Duration and easing are not present in the static image and were not inferred from the brief's unrelated animation references.
- Keep the grid hierarchy: stacked facts at upper left, largest globe upper right, profile and concise summary across the middle, and a draggable horizontal toolbox below. Rebuild visuals and copy from Jackson's own content. The global brief's glass overlay governs the modal surface; the source's dark grid informs the content composition.
