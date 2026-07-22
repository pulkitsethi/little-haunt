# Little Haunt

A **Ghibli-inspired** meadow forest platformer with **soul-swap** abilities (PixiJS).

Touch floating spirits to borrow their power — only one soul at a time:

| Soul | What it does |
| --- | --- |
| **Glide** | Hold Space in the air to float across wide gaps |
| **Crawl** | Shrink to fit through low tunnels |
| **Stomp** | Press ↓ / S in the air to slam and break cracked floors |

## Play

Rendering uses **PixiJS v8** (loaded from jsDelivr). You need a local static server (ES modules + CDN).

```bash
cd little-haunt
python3 -m http.server 8765
```

Open [http://localhost:8765](http://localhost:8765).

**Share:** deploy the repo folder to any static host (GitHub Pages, Netlify, Cloudflare Pages). No build step — just upload `index.html`, `style.css`, and `src/`.

## Layout

| File | Role |
| --- | --- |
| `src/main.js` | Game loop, physics, soul-swap, HUD |
| `src/level.js` | Level data and collision |
| `src/view.js` | Pixi scene: layers, bloom, resize, sync |
| `src/pixi-textures.js` | Baked sky + traveler sprite sheet (procedural) |
| `src/pixi-particles.js` | Leaf/pollen ambient + stomp dust sprites |
| `src/audio.js` | Web Audio SFX |

### Pixi features used

| Feature | What you get |
| --- | --- |
| **Sharp dynamic resize** | Renderer matches the frame; 960×540 game is letterboxed and stays crisp on large screens |
| **Scene graph + parallax** | Separate sky / sun / clouds / hills / world / grass layers with independent scroll |
| **Baked sprites** | Procedural sky + traveler run sheet via `generateTexture` + `Rectangle` |
| **AnimatedSprite** | Run cycle when no soul is active (vector art for glide / stomp / crawl cues) |
| **Sprite particles** | Drifting leaves & pollen; stomp dust bursts |
| **Bloom + blur filters** | Soft glow on kodama spirits, torii light, sun, and clouds |
| **Blend modes** | `add` / `screen` for sun wash, bloom, and warm haze |

Gameplay (physics, souls, level) stays in `main.js` / `level.js`; Pixi is the view only.

## Controls

| Input | Action |
| --- | --- |
| ← → / A D | Move |
| Space / W / ↑ | Jump (hold in air with Glide) |
| ↓ / S | Stomp (with Stomp soul) |
| Esc | Pause |

## Goal

Swap souls to clear each gate of the wood and reach the ember gate. Three lives.
