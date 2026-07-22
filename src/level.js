/**
 * Soul-swap forest course (Badland look).
 * @typedef {'glide' | 'stomp' | 'crawl'} SoulKind
 * @typedef {{ x: number, y: number, w: number, h: number, breakable?: boolean, broken?: boolean }} Rect
 * @typedef {{ x: number, y: number, kind: SoulKind }} Spirit
 * @typedef {{ x: number, y: number, r: number, spin: number, spd: number }} Saw
 * @typedef {{ x: number, y: number, w: number, h: number }} Spike
 */

export const LEVEL_W = 5200;
export const LEVEL_H = 540;
export const GROUND = 480;

/** @returns {{ platforms: Rect[], spikes: Spike[], saws: Saw[], spirits: Spirit[], goal: Rect, spawn: { x: number, y: number }, ceilings: Rect[] }} */
export function buildLevel() {
  /** @type {Rect[]} */
  const platforms = [
    // 1) Intro ground
    { x: 0, y: GROUND, w: 640, h: 80 },

    // 2) After small pit
    { x: 720, y: GROUND, w: 420, h: 80 },

    // 3) Approach to glide gap
    { x: 1180, y: GROUND, w: 280, h: 80 },
    // Far landing after wide chasm (needs glide)
    { x: 1680, y: GROUND, w: 360, h: 80 },

    // 4) Crawl section — low tunnel over a raised floor
    { x: 2120, y: GROUND, w: 520, h: 80 },
    // Crawl floor inside tunnel (player must be tiny)
    { x: 2240, y: GROUND - 36, w: 280, h: 20 },

    // 5) Stomp section — smash the cracked cork
    { x: 2720, y: GROUND, w: 200, h: 80 },
    { x: 2880, y: GROUND - 90, w: 110, h: 24 },
    { x: 3000, y: GROUND - 72, w: 90, h: 72, breakable: true, broken: false },
    { x: 3120, y: GROUND, w: 340, h: 80 },

    // 6) Mixed finale — need right souls again
    { x: 3540, y: GROUND, w: 200, h: 80 },
    { x: 3820, y: GROUND - 56, w: 120, h: 24 },
    // Second wide gap (glide)
    { x: 4180, y: GROUND, w: 240, h: 80 },
    // Breakable cork before goal
    { x: 4480, y: GROUND - 90, w: 110, h: 24 },
    { x: 4600, y: GROUND - 72, w: 90, h: 72, breakable: true, broken: false },
    { x: 4720, y: GROUND, w: 480, h: 80 },
  ];

  /** Low roofs — only crawl fits under these. */
  /** @type {Rect[]} */
  const ceilings = [
    { x: 2240, y: GROUND - 78, w: 280, h: 24 },
  ];

  /** @type {Spike[]} */
  const spikes = [
    { x: 760, y: GROUND - 18, w: 44, h: 18 },
    { x: 1780, y: GROUND - 18, w: 44, h: 18 },
    // Punish standing tall in tunnel mouth
    { x: 2200, y: GROUND - 18, w: 36, h: 18 },
    { x: 3280, y: GROUND - 18, w: 44, h: 18 },
    { x: 4280, y: GROUND - 18, w: 40, h: 18 },
  ];

  /** @type {Saw[]} */
  const saws = [
    { x: 1480, y: GROUND - 110, r: 30, spin: 0, spd: 2.6 },
    { x: 2400, y: GROUND - 130, r: 26, spin: 1, spd: -2.8 },
    { x: 3080, y: GROUND - 120, r: 28, spin: 0.4, spd: 2.5 },
    { x: 4000, y: GROUND - 100, r: 30, spin: 2, spd: -2.7 },
  ];

  /** Spirit stations — touch to swap soul. */
  /** @type {Spirit[]} */
  const spirits = [
    { x: 1080, y: GROUND - 70, kind: "glide" },
    { x: 2040, y: GROUND - 70, kind: "crawl" },
    { x: 2840, y: GROUND - 70, kind: "stomp" },
    // Reminder / swap points for finale
    { x: 3480, y: GROUND - 70, kind: "glide" },
    { x: 4380, y: GROUND - 70, kind: "stomp" },
    { x: 2360, y: GROUND - 100, kind: "crawl" },
  ];

  const goal = { x: 5000, y: GROUND - 110, w: 70, h: 110 };
  const spawn = { x: 80, y: GROUND - 40 };

  return { platforms, spikes, saws, spirits, ceilings, goal, spawn };
}

/**
 * @param {number} px
 * @param {number} py
 * @param {number} pw
 * @param {number} ph
 * @param {Rect} r
 */
export function aabb(px, py, pw, ph, r) {
  return px < r.x + r.w && px + pw > r.x && py < r.y + r.h && py + ph > r.y;
}

/**
 * @param {{ x: number, y: number, w: number, h: number, vx: number, vy: number }} p
 * @param {Rect[]} platforms
 * @param {Rect[]} ceilings
 * @param {number} dt
 */
export function collideWorld(p, platforms, ceilings, dt) {
  let grounded = false;
  const solids = [
    ...platforms.filter((pl) => !pl.broken),
    ...ceilings,
  ];

  const dx = p.vx * dt;
  const dy = p.vy * dt;

  p.x += dx;
  for (const pl of solids) {
    if (!aabb(p.x, p.y, p.w, p.h, pl)) continue;
    if (dx > 0) p.x = pl.x - p.w;
    else if (dx < 0) p.x = pl.x + pl.w;
    p.vx = 0;
  }

  p.y += dy;
  for (const pl of solids) {
    if (!aabb(p.x, p.y, p.w, p.h, pl)) continue;
    if (dy > 0) {
      p.y = pl.y - p.h;
      p.vy = 0;
      grounded = true;
    } else if (dy < 0) {
      p.y = pl.y + pl.h;
      p.vy = 0;
    }
  }
  return grounded;
}
