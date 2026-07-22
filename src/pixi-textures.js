import {
  Container,
  Graphics,
  Rectangle,
} from "https://cdn.jsdelivr.net/npm/pixi.js@8.6.6/dist/pixi.min.mjs";

export const GAME_W = 960;
export const GAME_H = 540;

const GLIDE_C = 0x6ec8e8;
const STOMP_C = 0xe88868;
const CRAWL_C = 0xa888d8;

/**
 * @param {import('pixi.js').Application} app
 * @param {import('pixi.js').Container} display
 * @param {number} width
 * @param {number} height
 * @param {number} [resolution]
 */
function bakeFromDisplay(app, display, width, height, resolution = 2) {
  const prev = display.parent;
  if (!prev) app.stage.addChild(display);
  try {
    // Prefer bounds-based bake. If a crop is needed, use a real Rectangle (not a plain object).
    void width;
    void height;
    return app.renderer.generateTexture({
      target: display,
      resolution,
      frame: new Rectangle(0, 0, width, height),
    });
  } finally {
    if (!prev && display.parent) display.parent.removeChild(display);
  }
}

/** @param {import('pixi.js').Application} app @param {number} r @param {number} color @param {number} [alpha] */
export function softCircleTexture(app, r, color, alpha = 1) {
  const g = new Graphics();
  g.circle(r, r, r).fill({ color, alpha });
  return bakeFromDisplay(app, g, r * 2, r * 2, 2);
}

/** @param {import('pixi.js').Application} app @param {number} w @param {number} h */
export function leafTexture(app, w, h) {
  const g = new Graphics();
  g.moveTo(0, h / 2)
    .quadraticCurveTo(w / 2, 0, w, h / 2)
    .quadraticCurveTo(w / 2, h, 0, h / 2)
    .closePath()
    .fill({ color: 0x6db87a, alpha: 0.9 });
  return bakeFromDisplay(app, g, w, h, 2);
}

/**
 * @param {Graphics} g
 * @param {{ leg?: number, crawl?: boolean, ability?: string, grounded?: boolean, stomping?: boolean }} opts
 */
export function paintTraveler(g, opts) {
  const leg = opts.leg ?? 0;
  const ability = opts.ability ?? "none";
  const grounded = opts.grounded ?? true;
  const stomping = opts.stomping ?? false;

  g.clear();

  const skin = 0xffd4b8;
  const hair = 0x3d2914;
  const shirt =
    ability === "glide"
      ? 0x7ec8e8
      : ability === "stomp"
        ? 0xf0a878
        : ability === "crawl"
          ? 0xc8b8e8
          : 0xf07878;
  const shorts = 0x4a6a8a;

  g.ellipse(0, 14, 11, 3).fill({ color: 0x000000, alpha: 0.12 });
  g.roundRect(-7, 6, 6, 10 + leg, 3).fill({ color: shorts });
  g.roundRect(1, 6, 6, 10 - leg, 3).fill({ color: shorts });
  g.roundRect(-9, -2, 18, 14, 6).fill({ color: shirt });
  g.circle(0, -10, 11).fill({ color: skin });
  g.ellipse(0, -18, 12, 8).fill({ color: hair });
  g.circle(-4, -11, 3.5).fill({ color: 0xffffff });
  g.circle(4, -11, 3.5).fill({ color: 0xffffff });
  g.circle(-4, -10, 1.8).fill({ color: 0x2a2830 });
  g.circle(4, -10, 1.8).fill({ color: 0x2a2830 });

  const scarf = soulTint(ability);
  g.rect(-7, -4, 4, 10).fill({ color: scarf, alpha: 0.85 });

  if (ability === "glide" && !grounded) {
    g.moveTo(-6, 0)
      .quadraticCurveTo(-26, 6, -20, 20)
      .lineTo(-2, 8)
      .closePath()
      .fill({ color: 0xffffff, alpha: 0.75 });
  }
  if (stomping) {
    g.circle(0, 18, 14).stroke({ color: STOMP_C, width: 2, alpha: 0.4 });
  }
}

function soulTint(ability) {
  if (ability === "glide") return GLIDE_C;
  if (ability === "stomp") return STOMP_C;
  if (ability === "crawl") return CRAWL_C;
  return 0xffc8a8;
}

const FRAME_PAD = 48;

/**
 * @param {import('pixi.js').Application} app
 * @returns {import('pixi.js').Texture[]}
 */
export function bakeTravelerFrames(app) {
  /** @type {import('pixi.js').Texture[]} */
  const textures = [];
  const specs = [
    { leg: 0, crawl: false },
    { leg: 3, crawl: false },
    { leg: -3, crawl: false },
    { leg: 0, crawl: true },
  ];

  for (const spec of specs) {
    const wrap = new Container();
    const g = new Graphics();
    paintTraveler(g, { ...spec, ability: "none", grounded: true });
    wrap.addChild(g);
    g.position.set(FRAME_PAD, FRAME_PAD);
    if (spec.crawl) g.scale.set(0.58);
    textures.push(bakeFromDisplay(app, wrap, FRAME_PAD * 2, FRAME_PAD * 2, 2));
  }
  return textures;
}

/** @param {import('pixi.js').Graphics} g */
export function paintSkyPlate(g) {
  const W = GAME_W;
  const H = GAME_H;
  const SKY_TOP = 0xa8d8f0;
  const SKY_MID = 0xc9e8f5;
  const SKY_HAZE = 0xe8f6fc;
  g.clear();
  const bands = [
    [0, 0.45, SKY_TOP],
    [0.45, 0.78, SKY_MID],
    [0.78, 1, SKY_HAZE],
  ];
  for (const [a, b, col] of bands) {
    g.rect(0, H * a, W, H * (b - a)).fill({ color: col });
  }
}

/** @param {import('pixi.js').Application} app */
export function bakeSkyTexture(app) {
  const g = new Graphics();
  paintSkyPlate(g);
  return bakeFromDisplay(app, g, GAME_W, GAME_H, 1);
}

/** @param {import('pixi.js').Application} app */
export function createViewTextures(app) {
  return {
    sky: bakeSkyTexture(app),
    pollen: softCircleTexture(app, 6, 0xfff8a8, 0.85),
    pollenHi: softCircleTexture(app, 3, 0xffffff, 0.7),
    dust: softCircleTexture(app, 5, 0xf5f0e8, 0.9),
    leaf: leafTexture(app, 10, 6),
    leafAlt: leafTexture(app, 8, 5),
    travelerFrames: bakeTravelerFrames(app),
  };
}

/**
 * Minimal textures that still let the game boot if baking fails.
 * Sky is drawn as a Graphics layer by the view when sky texture is null.
 * @param {import('pixi.js').Application} app
 */
export function createViewTexturesFallback(app) {
  try {
    return createViewTextures(app);
  } catch (err) {
    console.error("Full texture bake failed:", err);
    // Return empty traveler frames; particles use tiny graphics-baked circles if possible.
    let pixel = null;
    try {
      const g = new Graphics();
      g.rect(0, 0, 4, 4).fill({ color: 0xffffff });
      pixel = bakeFromDisplay(app, g, 4, 4, 1);
    } catch (e2) {
      console.error("Pixel bake also failed:", e2);
    }
    return {
      sky: null,
      pollen: pixel,
      pollenHi: pixel,
      dust: pixel,
      leaf: pixel,
      leafAlt: pixel,
      travelerFrames: [],
    };
  }
}
