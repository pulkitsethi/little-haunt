import {
  Application,
  AnimatedSprite,
  BlurFilter,
  Container,
  Graphics,
  Sprite,
  Text,
  TextStyle,
} from "https://cdn.jsdelivr.net/npm/pixi.js@8.6.6/dist/pixi.min.mjs";
import { createViewTextures, createViewTexturesFallback, GAME_W, GAME_H, paintTraveler } from "./pixi-textures.js";
import { createParticleSystems } from "./pixi-particles.js";

const W = GAME_W;
const H = GAME_H;

/** Ghibli-ish forest palette */
const SKY_TOP = 0xa8d8f0;
const SKY_MID = 0xc9e8f5;
const SKY_HAZE = 0xe8f6fc;
const SUN = 0xfff4c8;
const HILL_FAR = 0x8ec99a;
const HILL_MID = 0x6db87a;
const HILL_NEAR = 0x4a9e62;
const EARTH = 0x8b6f4e;
const EARTH_DARK = 0x6b5238;
const GRASS = 0x7bc96f;
const GRASS_HI = 0x9ed88f;
const GLIDE_C = 0x6ec8e8;
const STOMP_C = 0xe88868;
const CRAWL_C = 0xa888d8;
const KODAMA = 0xf5f8f2;
const MIST = 0xb8dce8;

/**
 * @param {HTMLElement} mount
 */
export async function createView(mount) {
  const app = new Application();
  await app.init({
    width: Math.max(1, mount.clientWidth || W),
    height: Math.max(1, mount.clientHeight || H),
    background: SKY_MID,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
    preference: "webgl",
  });
  mount.replaceChildren(app.canvas);

  let tex;
  try {
    tex = createViewTextures(app);
  } catch (err) {
    console.error("Texture bake failed, using fallbacks:", err);
    tex = createViewTexturesFallback(app);
  }
  // Particles optional — never block boot
  let particles;
  try {
    particles = createParticleSystems({
      pollen: tex.pollen,
      leaf: tex.leaf,
      leafAlt: tex.leafAlt,
      dust: tex.dust,
    });
  } catch (err) {
    console.error("Particles disabled:", err);
    particles = {
      ambientLayer: new Container(),
      worldFxLayer: new Container(),
      update() {},
      destroy() {},
    };
  }

  const gameRoot = new Container();
  app.stage.addChild(gameRoot);

  /** @type {Sprite | Graphics} */
  let skyLayer;
  if (tex.sky) {
    skyLayer = new Sprite(tex.sky);
  } else {
    skyLayer = new Graphics();
    skyLayer
      .rect(0, 0, W, H * 0.45)
      .fill({ color: SKY_TOP })
      .rect(0, H * 0.45, W, H * 0.33)
      .fill({ color: SKY_MID })
      .rect(0, H * 0.78, W, H * 0.22)
      .fill({ color: SKY_HAZE });
  }
  const clouds = new Graphics();
  clouds.filters = [new BlurFilter({ strength: 3, quality: 2 })];
  const sunGlow = new Graphics();
  sunGlow.blendMode = "add";
  sunGlow.filters = [new BlurFilter({ strength: 8, quality: 2 })];
  const parallax = new Container();
  const parallaxHillsFar = new Graphics();
  const parallaxHillsMid = new Graphics();
  const parallaxTrees = new Graphics();
  parallax.addChild(parallaxHillsFar);
  parallax.addChild(parallaxHillsMid);
  parallax.addChild(parallaxTrees);

  const world = new Container();
  const worldStatic = new Container();
  const worldBloom = new Container();
  const bloomGfx = new Graphics();
  bloomGfx.blendMode = "add";
  worldBloom.addChild(bloomGfx);
  worldBloom.filters = [new BlurFilter({ strength: 10, quality: 3 })];
  worldBloom.alpha = 0.85;
  worldBloom.blendMode = "add";
  const worldDynamic = new Container();
  world.addChild(worldStatic);
  world.addChild(worldBloom);
  world.addChild(worldDynamic);

  const chasm = new Graphics();
  const fg = new Graphics();
  const haze = new Graphics();
  haze.blendMode = "screen";
  const simFx = new Graphics();
  simFx.blendMode = "add";

  gameRoot.addChild(skyLayer);
  gameRoot.addChild(sunGlow);
  gameRoot.addChild(clouds);
  gameRoot.addChild(parallax);
  gameRoot.addChild(chasm);
  gameRoot.addChild(world);
  gameRoot.addChild(fg);
  gameRoot.addChild(haze);

  world.addChild(particles.ambientLayer);
  worldDynamic.addChildAt(particles.worldFxLayer, 0);
  worldDynamic.addChild(simFx);

  /** @type {{ wrap: Container, s: { y: number, spin: number, r: number }, g: Graphics }[]} */
  let sawNodes = [];
  /** @type {{ wrap: Container, glow: Graphics, baseY: number, kind: string, sp: { x: number } }[]} */
  let spiritNodes = [];
  let goalGfx = new Graphics();
  const playerRoot = new Container();
  /** @type {AnimatedSprite | null} */
  let travelerSprite = null;
  if (tex.travelerFrames?.length > 0) {
    // Frames 0–2 = run cycle; frame 3 = crawl (handled via vector / stop)
    const runFrames = tex.travelerFrames.slice(0, Math.min(3, tex.travelerFrames.length));
    travelerSprite = new AnimatedSprite(runFrames);
    travelerSprite.anchor.set(0.5);
    travelerSprite.animationSpeed = 0.22;
    travelerSprite.stop();
    playerRoot.addChild(travelerSprite);
  }
  const playerGfx = new Graphics();
  playerRoot.addChild(playerGfx);

  worldDynamic.addChild(goalGfx);
  worldDynamic.addChild(playerRoot);

  /** @type {unknown} */
  let lastLevel = null;
  let lastStomping = false;

  /** Letterbox 960×540 into the mount; keep crisp pixels via renderer resize. */
  function layout() {
    const cw = Math.max(1, mount.clientWidth || W);
    const ch = Math.max(1, mount.clientHeight || H);
    app.renderer.resize(cw, ch);
    const scale = Math.min(cw / W, ch / H);
    gameRoot.scale.set(scale);
    gameRoot.position.set((cw - W * scale) / 2, (ch - H * scale) / 2);
  }

  layout();
  const resizeObs = new ResizeObserver(() => layout());
  resizeObs.observe(mount);
  window.addEventListener("resize", layout);

  function soulColor(kind) {
    if (kind === "glide") return GLIDE_C;
    if (kind === "stomp") return STOMP_C;
    return CRAWL_C;
  }

  /**
   * @param {ReturnType<import('./level.js').buildLevel>} level
   */
  function rebuildStatic(level) {
    worldStatic.removeChildren();
    sawNodes = [];
    spiritNodes = [];

    for (const pl of level.platforms) {
      if (pl.broken) continue;
      const g = new Graphics();
      drawPlatform(g, pl);
      g.x = pl.x;
      g.y = pl.y;
      worldStatic.addChild(g);
    }

    for (const c of level.ceilings) {
      const g = new Graphics();
      drawCeiling(g, c);
      g.x = c.x;
      g.y = c.y;
      worldStatic.addChild(g);
    }

    for (const sp of level.spikes) {
      const g = new Graphics();
      drawThornBush(g, sp);
      g.x = sp.x;
      g.y = sp.y;
      worldStatic.addChild(g);
    }

    for (const s of level.saws) {
      const wrap = new Container();
      wrap.x = s.x;
      wrap.y = s.y;
      const g = new Graphics();
      drawLeafWheel(g, s.r);
      wrap.addChild(g);
      worldStatic.addChild(wrap);
      sawNodes.push({ wrap, s, g });
    }

    const labelStyle = new TextStyle({
      fontFamily: "Nunito, system-ui, sans-serif",
      fontSize: 9,
      fontWeight: "700",
      fill: 0x3a5c48,
      letterSpacing: 1,
    });

    for (const sp of level.spirits) {
      const wrap = new Container();
      wrap.x = sp.x;
      wrap.y = sp.y;
      const glow = new Graphics();
      glow.circle(0, 0, 26).fill({ color: 0xffffff, alpha: 0.55 });
      glow.filters = [new BlurFilter({ strength: 6, quality: 2 })];
      glow.blendMode = "add";
      const body = new Graphics();
      drawKodama(body, soulColor(sp.kind));
      const label = new Text({ text: sp.kind, style: labelStyle });
      label.anchor.set(0.5, 0);
      label.y = 16;
      label.alpha = 0.85;
      wrap.addChild(glow);
      wrap.addChild(body);
      wrap.addChild(label);
      worldStatic.addChild(wrap);
      spiritNodes.push({ wrap, glow, baseY: sp.y, kind: sp.kind, sp });
    }

    goalGfx.x = level.goal.x;
    goalGfx.y = level.goal.y;
  }

  /**
   * @param {{
   *   level: ReturnType<import('./level.js').buildLevel>,
   *   player: object,
   *   camX: number,
   *   time: number,
   *   ability: string,
   *   invuln: number,
   *   stomping: boolean,
   *   motes: { x: number, y: number, life: number, s: number }[],
   *   puffs: { x: number, y: number, life: number }[],
   *   GROUND: number,
   *   dt: number,
   *   active: boolean,
   * }} snap
   */
  function sync(snap) {
    try {
      syncInner(snap);
    } catch (err) {
      console.error("view sync error:", err);
    }
  }

  function syncInner(snap) {
    if (snap.level !== lastLevel) {
      lastLevel = snap.level;
      rebuildStatic(snap.level);
    } else {
      let needRebuild = false;
      for (const pl of snap.level.platforms) {
        if (pl.breakable && pl.broken) {
          needRebuild = true;
          break;
        }
      }
      if (needRebuild) rebuildStatic(snap.level);
    }

    world.x = -snap.camX;
    parallax.x = -snap.camX * 0.12;

    drawSunHaze(sunGlow, W * 0.68 - snap.camX * 0.015);
    drawClouds(clouds, snap.camX, snap.time);
    drawHillsFar(parallaxHillsFar, snap.camX);
    drawHillsMid(parallaxHillsMid, snap.camX);
    drawGhibliTrees(parallaxTrees, snap.camX);
    drawValleyMist(chasm, snap.GROUND);
    drawTallGrass(fg, snap.camX);
    drawWarmHaze(haze);

    for (const { wrap, s, g } of sawNodes) {
      wrap.y = s.y;
      g.rotation = s.spin;
    }

    for (const node of spiritNodes) {
      const bob = Math.sin(snap.time * 2.2 + node.sp.x * 0.02) * 5;
      node.wrap.y = node.baseY + bob;
      const active = snap.ability === node.kind;
      node.glow
        .clear()
        .circle(0, 0, active ? 34 : 26)
        .fill({ color: soulColor(node.kind), alpha: active ? 0.35 : 0.22 })
        .circle(0, 0, active ? 22 : 16)
        .fill({ color: 0xffffff, alpha: active ? 0.5 : 0.35 });
    }

    const gatePulse = 0.65 + Math.sin(snap.time * 2) * 0.2;
    drawTorii(goalGfx, snap.level.goal, gatePulse);

    drawBloom(bloomGfx, snap, gatePulse);

    syncPlayer(playerRoot, travelerSprite, playerGfx, snap);

    // Sim fireflies / stomp puffs from main.js
    simFx.clear();
    for (const m of snap.motes) {
      simFx.circle(m.x, m.y, m.s).fill({ color: 0xfff8a8, alpha: Math.min(0.65, m.life * 0.18) });
    }
    for (const p of snap.puffs) {
      simFx.circle(p.x, p.y, 7).fill({ color: 0xffffff, alpha: Math.min(0.8, p.life * 1.6) });
    }

    const stompEdge = snap.stomping && !lastStomping;
    lastStomping = snap.stomping;
    particles.update(snap.dt, {
      camX: snap.camX,
      ground: snap.GROUND,
      active: snap.active,
      stompEdge,
      stompX: snap.player.x + snap.player.w / 2,
      stompY: snap.player.y + snap.player.h,
    });

    worldDynamic.addChild(playerRoot);
  }

  // Debug hook for live inspection
  // @ts-ignore
  window.__hauntView = {
    app,
    gameRoot,
    world,
    worldStatic,
    playerRoot,
    parallaxHillsMid,
  };

  return {
    width: W,
    height: H,
    sync,
    destroy() {
      resizeObs.disconnect();
      window.removeEventListener("resize", layout);
      particles.destroy();
      app.destroy(true, { children: true });
    },
  };
}

function drawBloom(g, snap, gatePulse) {
  g.clear();
  for (const node of snap.level.spirits) {
    const active = snap.ability === node.kind;
    const bob = Math.sin(snap.time * 2.2 + node.x * 0.02) * 5;
    g.circle(node.x, node.y + bob, active ? 38 : 28).fill({
      color: soulColorBloom(node.kind),
      alpha: active ? 0.45 : 0.28,
    });
  }
  const goal = snap.level.goal;
  g.ellipse(goal.x + goal.w / 2, goal.y + goal.h * 0.55, 30, 50).fill({
    color: 0xfff8c8,
    alpha: gatePulse * 0.55,
  });
}

function soulColorBloom(kind) {
  if (kind === "glide") return GLIDE_C;
  if (kind === "stomp") return STOMP_C;
  return CRAWL_C;
}

/**
 * Prefer AnimatedSprite for idle/run/crawl; fall back to vector Graphics
 * when a soul ability needs extra cues (cape, scarf tint, stomp ring).
 * @param {Container} root
 * @param {AnimatedSprite | null} sprite
 * @param {Graphics} g
 */
function syncPlayer(root, sprite, g, snap) {
  const { player, ability, invuln, stomping, time } = snap;
  const crawl = ability === "crawl";
  const f = player.facing;
  const run = player.grounded && Math.abs(player.vx) > 30;

  root.x = player.x + player.w / 2;
  root.y = player.y + player.h / 2;
  root.visible = !(invuln > 0 && Math.floor(time * 20) % 2 === 0);

  const needsVector = !sprite || ability !== "none" || stomping;

  if (needsVector) {
    if (sprite) {
      sprite.visible = false;
      sprite.stop();
    }
    g.visible = true;
    root.scale.set(f * (crawl ? 0.58 : 1), crawl ? 0.58 : 1);
    const leg = run ? Math.sin(time * 14) * 3 : 0;
    paintTraveler(g, {
      leg,
      crawl,
      ability,
      grounded: player.grounded,
      stomping,
    });
    return;
  }

  // Sprite sheet path — only when soul is NONE (idle / run)
  g.visible = false;
  sprite.visible = true;
  root.scale.set(f, 1);
  if (run) {
    if (!sprite.playing) sprite.play();
    sprite.animationSpeed = 0.18 + Math.min(0.2, Math.abs(player.vx) / 350);
  } else {
    sprite.gotoAndStop(0);
  }
}

function drawSunHaze(g, x) {
  g.clear()
    .circle(x, 75, 120)
    .fill({ color: SUN, alpha: 0.55 })
    .circle(x, 75, 55)
    .fill({ color: 0xffffff, alpha: 0.35 })
    .rect(0, H * 0.3, W, H * 0.7)
    .fill({ color: SKY_HAZE, alpha: 0.15 });
}

/** @param {Graphics} g @param {number} camX @param {number} time */
function drawClouds(g, camX, time) {
  g.clear();
  const drift = time * 8;
  for (let i = 0; i < 9; i++) {
    const base = i * 130 - camX * 0.08 + drift;
    const x = ((base % (W + 200)) + W + 200) % (W + 200) - 80;
    const y = 40 + (i % 4) * 28 + Math.sin(i * 1.7) * 12;
    puffCloud(g, x, y, 0.85 + (i % 3) * 0.1);
  }
}

/** @param {Graphics} g */
function puffCloud(g, x, y, s) {
  g.ellipse(x, y, 42 * s, 22 * s)
    .fill({ color: 0xffffff, alpha: 0.82 })
    .ellipse(x - 28 * s, y + 6, 28 * s, 18 * s)
    .fill({ color: 0xffffff, alpha: 0.75 })
    .ellipse(x + 32 * s, y + 4, 34 * s, 20 * s)
    .fill({ color: 0xffffff, alpha: 0.78 });
}

function drawHillsFar(g, _camX) {
  g.clear().rect(0, 268, W, 272).fill({ color: HILL_FAR, alpha: 0.82 });
}

function drawHillsMid(g, _camX) {
  g.clear()
    .rect(0, 318, W, 222)
    .fill({ color: HILL_MID, alpha: 0.88 })
    .rect(0, 368, W, 172)
    .fill({ color: HILL_NEAR, alpha: 0.55 });
}

function drawGhibliTrees(g, camX) {
  g.clear();
  for (let i = 0; i < 14; i++) {
    const wx = ((i * 165 - camX * 0.35) % (W + 180)) - 50;
    const base = 330 + (i % 4) * 12;
    const scale = 0.85 + (i % 5) * 0.08;
    roundTree(g, wx, base, scale);
  }
}

/** @param {Graphics} g */
function roundTree(g, x, base, scale) {
  g.roundRect(x + 10 * scale, base - 55 * scale, 8 * scale, 55 * scale, 3)
    .fill({ color: 0x6b4a32 })
    .circle(x + 14 * scale, base - 70 * scale, 32 * scale)
    .fill({ color: 0x5a9e5c })
    .circle(x - 8 * scale, base - 58 * scale, 24 * scale)
    .fill({ color: 0x6db87a })
    .circle(x + 36 * scale, base - 55 * scale, 26 * scale)
    .fill({ color: 0x4a9e62 });
}

function drawValleyMist(g, ground) {
  g.clear()
    .rect(0, ground + 4, W, H - ground)
    .fill({ color: MIST, alpha: 0.35 })
    .rect(0, ground + 20, W, H - ground - 10)
    .fill({ color: 0xffffff, alpha: 0.12 });
}

function drawTallGrass(g, camX) {
  g.clear();
  for (let i = 0; i < 36; i++) {
    const wx = ((i * 48 - camX * 1.1) % (W + 60)) - 15;
    const h = 14 + (i % 6) * 5;
    g.moveTo(wx, H)
      .quadraticCurveTo(wx + 4, H - h - 8, wx + 3, H - h)
      .lineTo(wx + 9, H)
      .closePath()
      .fill({ color: i % 2 ? 0x5faf55 : 0x7bc96f, alpha: 0.85 });
  }
}

function drawWarmHaze(g) {
  g.clear()
    .rect(0, H * 0.55, W, H * 0.45)
    .fill({ color: 0xfff8e8, alpha: 0.08 })
    .circle(W / 2, H * 0.5, H * 0.65)
    .fill({ color: 0xffffff, alpha: 0.04 });
}

/** @param {Graphics} g @param {{ w: number, h: number, breakable?: boolean }} pl */
function drawPlatform(g, pl) {
  g.clear();
  const top = pl.breakable ? 0xc9a882 : GRASS_HI;
  const soil = pl.breakable ? 0xa08060 : EARTH;
  const soilDark = pl.breakable ? 0x806848 : EARTH_DARK;

  g.rect(0, 6, pl.w, pl.h - 6)
    .fill({ color: soil })
    .rect(0, pl.h - 8, pl.w, 8)
    .fill({ color: soilDark })
    .rect(0, 0, pl.w, 10)
    .fill({ color: top });
  for (let i = 0; i < pl.w; i += 18) {
    g.moveTo(i, 10)
      .lineTo(i + 5, 0)
      .lineTo(i + 10, 10)
      .closePath()
      .fill({ color: GRASS, alpha: 0.9 });
  }

  if (pl.breakable) {
    for (let i = 12; i < pl.w - 8; i += 22) {
      g.circle(i, 4, 2).fill({ color: STOMP_C, alpha: 0.5 });
    }
  } else {
    for (let i = 10; i < pl.w - 6; i += 34) {
      g.circle(i, 3, 3)
        .fill({ color: 0xffb8c8, alpha: 0.85 })
        .rect(i - 1, 1, 2, 4)
        .fill({ color: 0xffe088 });
    }
  }
}

/** @param {Graphics} g @param {{ w: number, h: number }} c */
function drawCeiling(g, c) {
  g.clear()
    .rect(0, 0, c.w, c.h)
    .fill({ color: 0x5c4030 })
    .rect(0, c.h - 8, c.w, 8)
    .fill({ color: 0x3d2818 });
  for (let i = 0; i < c.w; i += 24) {
    g.ellipse(i + 8, c.h - 2, 14, 6).fill({ color: 0x4a9e62, alpha: 0.7 });
  }
}

/** @param {Graphics} g @param {{ w: number, h: number }} sp */
function drawThornBush(g, sp) {
  g.clear()
    .ellipse(sp.w / 2, sp.h * 0.55, sp.w * 0.48, sp.h * 0.45)
    .fill({ color: 0x3a7a48 });
  const n = Math.max(3, Math.floor(sp.w / 12));
  for (let i = 0; i < n; i++) {
    const tx = (i + 0.5) * (sp.w / n);
    g.moveTo(tx, sp.h)
      .lineTo(tx + 3, sp.h * 0.15)
      .lineTo(tx + 6, sp.h)
      .closePath()
      .fill({ color: 0x2a5a38 });
  }
}

function drawLeafWheel(g, r) {
  g.clear().circle(0, 0, r).fill({ color: 0x8b6914, alpha: 0.35 });
  const petals = 8;
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2;
    g.ellipse(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.45, r * 0.22).fill({
      color: i % 2 ? 0x6db87a : 0x4a9e62,
      alpha: 0.9,
    });
  }
  g.circle(0, 0, r * 0.28).fill({ color: 0xf5e6c8 });
}

function drawKodama(g, tint) {
  g.clear()
    .roundRect(-8, -6, 16, 18, 8)
    .fill({ color: KODAMA, alpha: 0.95 })
    .circle(-4, -2, 2.2)
    .fill({ color: 0x1a2830 })
    .circle(4, -2, 2.2)
    .fill({ color: 0x1a2830 })
    .circle(0, 4, 1.5)
    .fill({ color: tint, alpha: 0.6 });
}

/** @param {Graphics} g @param {{ w: number, h: number }} goal @param {number} pulse */
function drawTorii(g, goal, pulse) {
  g.clear();
  const w = goal.w;
  const h = goal.h;
  const post = 0xc04040;
  g.rect(w * 0.12, h * 0.15, w * 0.1, h * 0.85)
    .fill({ color: post })
    .rect(w * 0.78, h * 0.15, w * 0.1, h * 0.85)
    .fill({ color: post })
    .rect(-w * 0.05, h * 0.12, w * 1.1, h * 0.12)
    .fill({ color: post })
    .rect(-w * 0.02, h * 0.05, w * 1.04, h * 0.08)
    .fill({ color: 0x8b3030 })
    .ellipse(w / 2, h * 0.55, 22, 38)
    .fill({ color: 0xfff8c8, alpha: pulse * 0.45 })
    .ellipse(w / 2, h * 0.55, 12, 22)
    .fill({ color: 0xffffff, alpha: pulse * 0.35 });
}
