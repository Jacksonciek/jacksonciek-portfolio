# R1 reference: navbar.mp4

Read from a 2 fps contact sheet and frames at 1, 4, 6 and 9 seconds. The full clip is 11.377 seconds. Only the hover panel, its spacing and image frame were considered.

## Timeline

- 0–4s: compact centered navigation pill; no panel is open.
- About 5.5–6s: hover opens a wide panel downward from the nav with a soft expansion and fade.
- 6–9s: the left side shows grouped entry titles with short labels; the right image changes while the panel remains open.
- The last sampled frame still shows the open panel. Closing timing was not captured clearly, so the return is estimated as the same path in reverse.

## Composition and colors

- At 1920×1032 capture size, the centered nav is about 50% of the viewport width. The expanded surface spans about 50% width and 34% of the visible page height.
- The left information column uses about 54% of the panel; the right image frame uses about 42%, with a narrow gutter.
- Panel surface is light, softly translucent, with rounded corners around 24–30 px at this capture size; the image is clipped inside a rounded light border.
- Sampled appearance: surface near `#F7F8F8`, primary text near `#17191B`, secondary labels near `#818489`, image border near `#DDE2E4`.
- The reference nav uses a dark pill and a vivid green action accent. The portfolio uses the separate navbar.png palette and its own content.

## Motion estimate and interaction

Opening and image changes take roughly 250–400ms by observation (estimate). The open state follows hover across entries. Keyboard focus and touch behavior are specified by the written brief and were not shown in this video. Closing is estimated to mirror the opening path.

## Must match

- Panel grows from directly beneath the nav, not from the screen center.
- Grouped labels remain on the left while a bordered image frame occupies the right.
- Moving between entries replaces the right image without closing the panel.
- Use empty bordered image frames until personal images are supplied.
