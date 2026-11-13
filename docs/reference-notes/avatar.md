# R2 reference: avatar.mp4 and avatar-3d.png

The avatar video is 14.442 seconds. I sampled a 1 fps contact sheet and frames at 0, 2, 4, 6, 8, 10, 12 and 14 seconds. I also opened the mapped avatar image and the live ALLER Studio home hero at 1440×900; only its particle bust was considered.

## Shape and pose

- The figure is a head-and-shoulders bust, large on the right side of the desktop hero and cropped below the chest.
- The head is bald and smooth, with a clean nose, lip, chin and ear silhouette in profile. It turns through a front-facing view as the pointer moves.
- The torso remains a broad, quiet mass; the neck connects cleanly to the shoulders. The head moves independently from the body.
- On the live reference, the avatar canvas occupies roughly 740×910 px in the 1440×900 view.

## Particle appearance and response

- Dense, small points make the face and body read as near-black silhouettes against a pale background. Fine loose grains trail around the head and outer shoulders.
- Cursor movement changes the head angle and pushes points away around the nearby face or torso area; the loosened points draw back into the silhouette as the cursor moves away.
- Side views reveal the nose and chin edge; the front view is nearly featureless. Eye and mouth particles are not clearly resolved in the supplied image or video.
- The source has yellow-green flecks. The project’s higher-priority black/green/white palette takes precedence, so only the fine grain and sparse accent distribution carry over.

## Inspection limits and implementation target

- The live page loaded in Playwright and rendered the avatar canvas. One optional silhouette.bin request was aborted, but the visible particle figure remained available for inspection.
- The source face has silhouette legibility rather than readable eyes, nose and mouth. The project’s explicit final checks ask for those features to read at 1440 and 390, so our particle mask needs a small, restrained facial detail pass while keeping the same bust and grain.
- Keep one THREE.Points object backed by BufferGeometry and typed arrays; the current 26,000 desktop / 9,000 mobile counts remain below the UI Pro Max 50,000 point warning, pending device FPS checks.

## Must match

- Preserve the bust silhouette, frontal turn, head-only cursor tracking and near-field particle repulsion.
- Keep the torso stable when the head turns, and let displaced points return without adding per-particle scene objects.
- Make facial landmarks readable through particle density/value changes, not solid drawn features or invented identity detail.

## R2 implementation and verification

- The featureless source silhouette has 45–57 reserved face points for an eye, nose and mouth, shared by the Home and Education targets and scaled with the mobile figure. They stay in the existing `THREE.Points` geometry.
- Pointer repulsion uses a smoothed screen-space field with a 112 px radius and up to 72 px displacement. The existing head-only look rotation remains intact; the torso does not rotate.
- Edge Playwright checks passed at 1440, 1024, 768 and 390 px with WebGL active and no console errors. The 390 px reduced-motion capture shows the three particle landmarks.
- Desktop interaction sample averaged 144 FPS (7.4 ms worst sampled frame) in headless Edge. This is a desktop browser measurement, not a physical-device result.
- Reduced motion was exercised at 390 px. Edge reports `prefers-reduced-transparency` as unsupported, so that preference could not be emulated here.
