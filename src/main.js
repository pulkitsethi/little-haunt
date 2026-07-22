import {
  buildLevel,
  collideWorld,
  aabb,
  LEVEL_W,
  LEVEL_H,
  GROUND,
} from "./level.js";
import { createAudio } from "./audio.js";
import { createView } from "./view.js";

const VIEW_W = 960;

/** @type {Awaited<ReturnType<typeof createView>> | null} */
let view = null;

const overlay = document.getElementById("overlay");
const pauseEl = document.getElementById("pause");
const endEl = document.getElementById("end");
const endTitle = document.getElementById("end-title");
const endBlurb = document.getElementById("end-blurb");
const hud = document.getElementById("hud");
const hint = document.getElementById("hint");
const heartsEl = document.getElementById("hearts");
const abilityNameEl = document.getElementById("ability-name");
const abilityTipEl = document.getElementById("ability-tip");
const startBtn = document.getElementById("start-btn");
const resumeBtn = document.getElementById("resume-btn");
const againBtn = document.getElementById("again-btn");

/** @type {'title' | 'playing' | 'paused' | 'won' | 'lost'} */
let state = "title";

/** @typedef {'none' | 'glide' | 'stomp' | 'crawl'} Ability */

const audio = createAudio();
const keys = new Set();

const MAX_HP = 3;
const PW = 28;
const PH = 32;
const CRAWL_W = 16;
const CRAWL_H = 14;
const GLOW = "#6db87a";
const EMBER = "#e88868";
const GLIDE_C = "#6ec8e8";
const STOMP_C = "#e88868";
const CRAWL_C = "#a888d8";

const TIPS = {
  none: "Touch a spirit to borrow its soul",
  glide: "Hold SPACE in air to glide wide gaps",
  stomp: "Press ↓ / S in air to slam breakable floors",
  crawl: "Shrink to fit low tunnels",
};

let level = buildLevel();
let player = makePlayer();
let camX = 0;
let invuln = 0;
let time = 0;
let hintFaded = false;
let wasGrounded = true;
let jumpBuf = 0;
let stomping = false;
/** @type {Ability} */
let ability = "none";

/** @type {{ x: number, y: number, life: number, vx: number, vy: number, s: number }[]} */
let motes = [];
/** @type {{ x: number, y: number, life: number }[]} */
let puffs = [];

function makePlayer() {
  return {
    x: level.spawn.x,
    y: level.spawn.y,
    w: PW,
    h: PH,
    vx: 0,
    vy: 0,
    hp: MAX_HP,
    facing: 1,
    grounded: false,
  };
}

function show(el) {
  el?.classList.remove("hidden");
}
function hide(el) {
  el?.classList.add("hidden");
}

function refreshHearts() {
  if (!heartsEl) return;
  heartsEl.textContent =
    "●".repeat(Math.max(0, player.hp)) + "○".repeat(Math.max(0, MAX_HP - player.hp));
}

function refreshAbilityHud() {
  if (abilityNameEl) abilityNameEl.textContent = ability.toUpperCase();
  if (abilityTipEl) abilityTipEl.textContent = TIPS[ability];
  if (abilityNameEl) {
    const color =
      ability === "glide"
        ? GLIDE_C
        : ability === "stomp"
          ? STOMP_C
          : ability === "crawl"
            ? CRAWL_C
            : GLOW;
    abilityNameEl.style.color = color;
  }
}

function applyBodySize() {
  const cx = player.x + player.w / 2;
  const feet = player.y + player.h;
  if (ability === "crawl") {
    player.w = CRAWL_W;
    player.h = CRAWL_H;
  } else {
    player.w = PW;
    player.h = PH;
  }
  player.x = cx - player.w / 2;
  player.y = feet - player.h;
}

function setAbility(next) {
  if (ability === next) return;
  ability = next;
  stomping = false;
  applyBodySize();
  audio.swap(next === "none" ? "glide" : next);
  refreshAbilityHud();
}

function setState(next) {
  state = next;
  hide(overlay);
  hide(pauseEl);
  hide(endEl);
  hide(hud);
  endEl?.classList.remove("lose");

  switch (next) {
    case "title":
      show(overlay);
      break;
    case "playing":
      show(hud);
      audio.resume();
      break;
    case "paused":
      show(hud);
      show(pauseEl);
      break;
    case "won":
      show(endEl);
      audio.win();
      if (endTitle) endTitle.textContent = "Through";
      if (endBlurb)
        endBlurb.textContent =
          "The borrowed souls fall quiet. The gate takes you in.";
      break;
    case "lost":
      endEl?.classList.add("lose");
      show(endEl);
      audio.lose();
      if (endTitle) endTitle.textContent = "Taken";
      if (endBlurb)
        endBlurb.textContent = "The forest keeps what it catches.";
      break;
    default: {
      const _e = next;
      void _e;
      break;
    }
  }
}

function resetGame() {
  level = buildLevel();
  player = makePlayer();
  ability = "none";
  camX = 0;
  invuln = 0;
  time = 0;
  hintFaded = false;
  wasGrounded = true;
  jumpBuf = 0;
  stomping = false;
  motes = [];
  puffs = [];
  for (let i = 0; i < 50; i++) spawnMote(true);
  hint?.classList.remove("fade");
  refreshHearts();
  refreshAbilityHud();
}

startBtn?.addEventListener("click", () => {
  resetGame();
  setState("playing");
});
resumeBtn?.addEventListener("click", () => setState("playing"));
againBtn?.addEventListener("click", () => {
  resetGame();
  setState("playing");
});

window.addEventListener("keydown", (e) => {
  keys.add(e.code);
  if (e.code === "Escape") {
    if (state === "playing") setState("paused");
    else if (state === "paused") setState("playing");
  }
  if (["Space", "KeyW", "ArrowUp"].includes(e.code)) {
    if (state === "playing") jumpBuf = 0.14;
    e.preventDefault();
  }
  if (["ArrowLeft", "ArrowRight", "ArrowDown", "KeyS"].includes(e.code)) {
    e.preventDefault();
  }
});
window.addEventListener("keyup", (e) => keys.delete(e.code));

function spawnMote(anywhere = false) {
  motes.push({
    x: anywhere
      ? camX + Math.random() * VIEW_W
      : camX + VIEW_W + Math.random() * 40,
    y: 40 + Math.random() * 360,
    life: 4 + Math.random() * 6,
    vx: -12 - Math.random() * 18,
    vy: (Math.random() - 0.5) * 10,
    s: 1 + Math.random() * 2.5,
  });
}

function hurt() {
  if (invuln > 0) return;
  player.hp -= 1;
  refreshHearts();
  invuln = 1.1;
  audio.hurt();
  player.vy = -160;
  player.vx = -player.facing * 90;
  stomping = false;
  for (let i = 0; i < 8; i++) {
    puffs.push({
      x: player.x + player.w / 2,
      y: player.y + player.h / 2,
      life: 0.3 + Math.random() * 0.2,
    });
  }
  if (player.hp <= 0) setState("lost");
}

function tryBreakUnderfoot() {
  const feet = {
    x: player.x + 2,
    y: player.y + player.h,
    w: player.w - 4,
    h: 10,
  };
  for (const pl of level.platforms) {
    if (!pl.breakable || pl.broken) continue;
    if (!aabb(feet.x, feet.y, feet.w, feet.h, pl)) continue;
    pl.broken = true;
    audio.break();
    for (let i = 0; i < 12; i++) {
      puffs.push({
        x: pl.x + Math.random() * pl.w,
        y: pl.y + Math.random() * pl.h,
        life: 0.35 + Math.random() * 0.25,
      });
    }
  }
}

function updatePlayer(dt) {
  jumpBuf = Math.max(0, jumpBuf - dt);
  invuln = Math.max(0, invuln - dt);

  applyBodySize();

  let ix = 0;
  if (keys.has("ArrowLeft") || keys.has("KeyA")) ix -= 1;
  if (keys.has("ArrowRight") || keys.has("KeyD")) ix += 1;

  const crawl = ability === "crawl";
  const accel = player.grounded ? (crawl ? 700 : 980) : crawl ? 360 : 520;
  const maxRun = player.grounded ? (crawl ? 95 : 155) : crawl ? 105 : 165;
  if (ix !== 0) {
    player.vx += ix * accel * dt;
    player.facing = ix;
  } else if (player.grounded) {
    player.vx *= Math.exp(-16 * dt);
  } else {
    player.vx *= Math.exp(-2.5 * dt);
  }
  player.vx = Math.max(-maxRun, Math.min(maxRun, player.vx));

  const holdingJump =
    keys.has("Space") || keys.has("KeyW") || keys.has("ArrowUp");
  const wantStomp =
    ability === "stomp" &&
    !player.grounded &&
    (keys.has("ArrowDown") || keys.has("KeyS"));

  if (wantStomp) {
    stomping = true;
    player.vy = Math.max(player.vy, 620);
  }

  // Gravity — glide softens fall while holding jump
  let grav = 1700;
  if (ability === "glide" && !player.grounded && holdingJump && !stomping) {
    grav = 420;
    if (player.vy > 90) player.vy = 90;
    // slight forward drift while gliding
    player.vx += player.facing * 40 * dt;
  }
  if (stomping) grav = 2400;

  player.vy += grav * dt;
  player.vy = Math.min(stomping ? 780 : 500, player.vy);

  const jumpPower = crawl ? -380 : -580;
  if (jumpBuf > 0 && player.grounded) {
    jumpBuf = 0;
    player.vy = jumpPower;
    player.grounded = false;
    stomping = false;
    audio.jump();
  }

  const wasAir = !player.grounded;
  player.grounded = collideWorld(
    player,
    level.platforms,
    level.ceilings,
    dt,
  );

  if (player.grounded && wasAir) {
    if (stomping) {
      audio.stomp();
      tryBreakUnderfoot();
    } else {
      audio.land();
    }
    stomping = false;
  }
  if (player.grounded) wasGrounded = true;
  else wasGrounded = false;

  if (player.y > LEVEL_H + 40) {
    hurt();
    player.x = Math.max(level.spawn.x, camX + 60);
    let landed = false;
    for (const pl of level.platforms) {
      if (pl.broken) continue;
      if (pl.x + pl.w > camX && pl.x < camX + VIEW_W && pl.y >= GROUND - 5) {
        player.x = Math.max(pl.x + 10, Math.min(pl.x + pl.w - player.w - 10, player.x));
        player.y = pl.y - player.h;
        landed = true;
        break;
      }
    }
    if (!landed) {
      player.x = level.spawn.x;
      player.y = level.spawn.y;
    }
    player.vx = 0;
    player.vy = 0;
    stomping = false;
  }

  player.x = Math.max(10, Math.min(LEVEL_W - player.w - 10, player.x));
}

function updateSpirits() {
  const cx = player.x + player.w / 2;
  const cy = player.y + player.h / 2;
  for (const s of level.spirits) {
    if (Math.hypot(cx - s.x, cy - s.y) < 28) {
      setAbility(s.kind);
    }
  }
}

function updateHazards(dt) {
  for (const s of level.saws) {
    s.spin += s.spd * dt;
    s.y += Math.sin(time * 1.4 + s.x * 0.01) * 12 * dt;
  }

  if (invuln > 0) return;

  const pr = {
    x: player.x + 2,
    y: player.y + 2,
    w: player.w - 4,
    h: player.h - 3,
  };

  for (const sp of level.spikes) {
    if (aabb(pr.x, pr.y, pr.w, pr.h, sp)) {
      hurt();
      return;
    }
  }

  for (const s of level.saws) {
    const cx = player.x + player.w / 2;
    const cy = player.y + player.h / 2;
    if (Math.hypot(cx - s.x, cy - s.y) < s.r + 6) {
      hurt();
      return;
    }
  }
}

function updateGoal() {
  if (aabb(player.x, player.y, player.w, player.h, level.goal)) {
    setState("won");
  }
}

function updateFx(dt) {
  while (motes.length < 55) spawnMote(false);
  motes = motes.filter((m) => {
    m.life -= dt;
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    return m.life > 0 && m.x > camX - 20;
  });
  puffs = puffs.filter((p) => {
    p.life -= dt;
    p.y -= 20 * dt;
    return p.life > 0;
  });
}

function updateCamera() {
  const vw = view?.width ?? VIEW_W;
  const target = player.x - vw * 0.35;
  camX += (target - camX) * 0.1;
  camX = Math.max(0, Math.min(LEVEL_W - vw, camX));
}

function update(dt) {
  time += dt;
  updatePlayer(dt);
  updateSpirits();
  updateHazards(dt);
  updateGoal();
  updateFx(dt);
  updateCamera();

  if (!hintFaded && time > 10) {
    hintFaded = true;
    hint?.classList.add("fade");
  }
}

function render() {
  view?.sync({
    level,
    player,
    camX,
    time,
    ability,
    invuln,
    stomping,
    motes,
    puffs,
    GROUND,
    dt: lastDt,
    active: state === "playing" || state === "title",
  });
}

let last = performance.now();
let lastDt = 0;
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000 || 0);
  last = now;
  lastDt = dt;
  try {
    if (state === "playing") update(dt);
    if (state === "title") {
      camX = Math.max(0, player.x - VIEW_W * 0.35);
      time += dt;
      for (const s of level.saws) s.spin += s.spd * dt;
      updateFx(dt);
    }
    render();
  } catch (err) {
    console.error(err);
  }
  requestAnimationFrame(frame);
}

async function boot() {
  const mount = document.getElementById("game");
  if (!mount) throw new Error("Missing #game mount");
  view = await createView(mount);
  resetGame();
  setState("title");
  requestAnimationFrame(frame);
}

boot().catch((err) => {
  console.error(err);
});
