# AGENTS.md: Jackson Lawrence portfolio

## Project
Revising a cinematic scroll portfolio, "Jackson Lawrence | Creative Technologist".
- All visible copy is English. Static site, no backend. three.js + GSAP ScrollTrigger + Lenis (add them if missing).
- "AOS" in the brief means animate-on-scroll behavior, not the AOS.js library.
- Content source of truth: the concept .md in /references. Never invent content.
- The task itself lives in BRIEF.md. Rules below apply to every phase.

## How to work (adapted from the Karpathy guidelines)
1. Think before coding. State assumptions. If a point has several readings, name them and take the default written in BRIEF.md. Ask only when truly blocked (max 5 questions, in Phase 0).
2. Simplicity first. BRIEF.md defines scope. No extra sections, features or abstractions. Write the minimum code that achieves the motion.
3. Surgical changes. Code unrelated to the brief stays untouched; match existing style; remove only what your own change orphaned; mention unrelated dead code instead of deleting it. Parts the brief says to redo (splash, hero, avatar, transitions, navbar, footer) may be rewritten.
4. Goal-driven. Every phase has "Done when" checks. Loop until they pass. Report as: step -> how verified.

## Verification (never claim "works" without evidence)
- Run the dev server and test with Playwright: screenshots at 1440, 1024, 768 and 390 and at several scroll positions; console must be clean.
- Measure FPS during the avatar morph and the MacBook transition (target 55+ on desktop). Keep live WebGL contexts to a minimum.
- Test with prefers-reduced-motion and prefers-reduced-transparency.
- If you cannot test something, say so explicitly.
- Commit locally at the end of each phase ("phase-N: ..."). Do not push unless asked.

## Reference sites
- Match feel, pacing, easing, palette and composition as closely as you can observe. Write your own code and assets. Never copy their code, text, imagery or logos.
- If you cannot open or render a reference, say so and rely only on the written descriptions in the task prompt. Never invent details.

## Precedence when sources conflict
1. tibdigital.com: global color palette and scroll-animation language (highest priority)
2. The per-section reference in BRIEF.md overrides global motion inside that section only
3. apple.com: typography, spacing, vertical rhythm
4. iOS 26 Liquid Glass: every glass surface

## Skills (in .agents/skills)
When a build step lists skills, read .agents/skills/<name>/SKILL.md for each one and follow it before writing code (invoking with $name plus a concrete task also works). A bare invocation of the Emil skills only replies "I'm ready". Name the skills you actually used in each report.

Use: apple-design, emil-design-eng, animation-performance, choreograph, animation-vocabulary, mobile-native, review-animations, ui-ux-pro-max.
Do NOT use in this project: taste-skill (its rules forbid scroll-driven reveals, parallax and copying reference effects, and it deals palettes; it contradicts the brief), remove-animations, animate-expo, write-swift, ask-sonner, pick-ui-library, prototype, gestures.

Scope rules (so skills do not fight the brief):
- Emil rules (UI motion under 300ms, no ease-in, skip animation on frequent actions) apply ONLY to micro-interactions: navbar, buttons, hover/press, the click liquid effect, glass panels. They do NOT apply to the splash, avatar morph, scroll scenes or the MacBook transition. Those follow their references.
- ui-ux-pro-max: use only for glassmorphism tokens, GSAP skeletons (--domain gsap), three.js stack guidance (--stack threejs) and UX/accessibility checks. Do not take palette or fonts from it. Find its script with: find . -name search.py -path "*ui-ux-pro-max*"; run with python3 (python on Windows).
- review-animations: run once in the final phase; fix findings that do not contradict the brief and list the rest as "kept on purpose".

## Quality checks (apply at every phase)
- Equal left/right content edges; no sideways page scroll except inside the Projects horizontal scene.
- Every visual renders at 1440, 1024, 768 and 390, with a static fallback if WebGL fails.
- No placeholder text, no lorem, no invented facts or figures; real icons for tools.
- Text contrast, visible keyboard focus, labelled controls, 44px tap targets, one heading level at a time.
- Plain, specific English copy. No filler words.
