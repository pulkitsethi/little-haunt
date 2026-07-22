# Little Haunt — Pixi upgrade backlog

Follow-ups after the PixiJS v8 view migration. Gameplay stays in `main.js` / `level.js`; these are view/feel upgrades.

## Done (baseline)

- [x] Pixi scene graph + parallax layers
- [x] Sharp dynamic resize (letterboxed 960×540)
- [x] Baked sky + traveler run sheet (`generateTexture` + `Rectangle`)
- [x] `AnimatedSprite` run cycle when soul is `NONE`
- [x] Sprite particles (leaves, pollen, stomp dust)
- [x] Sim motes / puffs drawn in the view
- [x] Bloom + blur filters (spirits, torii, sun, clouds)
- [x] Blend modes (`add` / `screen`)

## High impact

- [ ] **Traveler sprite sheet** — run, jump, glide cape, crawl frames; load via `Assets.load` (or keep procedural bake until art exists)
- [ ] **Painted background plates** — 1–2 parallax PNGs instead of procedural hills/trees
- [ ] **Event particles** — denser leaf wind, spirit pollen, land dust, soul-swap sparkles
- [ ] **Camera juice** — look-ahead, landing squash, soft shake on stomp / hurt
- [ ] **Screen transitions** — fade/wipe for title → play → death / win

## Medium impact

- [ ] **Post filters (light touch)** — warm `ColorMatrixFilter`, optional vignette
- [ ] **Nine-slice / tiled platforms** — stretch grass tops without unique Graphics per platform
- [ ] **Sound-synced FX** — flash / burst on swap, break, goal (tie to `audio.js`)
- [ ] **Pixi HUD (optional)** — hearts / soul label as sprites so they scale with the canvas

## Low priority / skip unless needed

- [ ] Tilemaps
- [ ] Spine / skeletal animation
- [ ] Custom GLSL shaders / normal-mapped lighting
- [ ] `ParticleContainer` micro-opts (only if particle counts get huge)
- [ ] Moving physics into Pixi (keep sim in `main.js`)

## Suggested order

1. Traveler sprite sheet  
2. Painted far background  
3. Soul-swap / stomp / land particle moments  
4. Camera squash + look-ahead  
5. Title / death / win transitions  

## Notes

- Prefer real art assets under something like `assets/` once available; wire with Pixi `Assets.load`.
- Until then, procedural textures in `src/pixi-textures.js` are fine placeholders.
- Avoid stacking too many full-screen filters — they cost GPU and can blank the scene if misconfigured.
