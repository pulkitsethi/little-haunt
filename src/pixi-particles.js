import { Container, Sprite } from "https://cdn.jsdelivr.net/npm/pixi.js@8.6.6/dist/pixi.min.mjs";
import { GAME_W, GAME_H } from "./pixi-textures.js";

/**
 * @param {{
 *   pollen: import('pixi.js').Texture | null,
 *   leaf: import('pixi.js').Texture | null,
 *   leafAlt: import('pixi.js').Texture | null,
 *   dust: import('pixi.js').Texture | null,
 * }} textures
 */
export function createParticleSystems(textures) {
  const ambientLayer = new Container();
  const worldFxLayer = new Container();
  const enabled = !!(textures.pollen && textures.leaf && textures.dust);

  /** @type {{ s: Sprite, vx: number, vy: number, life: number, kind: 'leaf' | 'pollen' }[]} */
  let ambient = [];
  /** @type {{ s: Sprite, vx: number, vy: number, life: number }[]} */
  let dust = [];

  const maxAmbient = 55;
  const maxDust = 40;

  function spawnAmbient(camX, ground) {
    if (!enabled || ambient.length >= maxAmbient) return;
    const leaf = Math.random() < 0.35;
    const tex = leaf ? (Math.random() < 0.5 ? textures.leaf : textures.leafAlt) : textures.pollen;
    if (!tex) return;
    const s = new Sprite(tex);
    s.anchor.set(0.5);
    s.x = camX + Math.random() * GAME_W;
    s.y = leaf ? Math.random() * ground * 0.85 : ground * 0.2 + Math.random() * ground * 0.6;
    s.alpha = leaf ? 0.55 + Math.random() * 0.35 : 0.25 + Math.random() * 0.45;
    s.rotation = Math.random() * Math.PI * 2;
    s.scale.set(leaf ? 0.7 + Math.random() * 0.8 : 0.5 + Math.random() * 0.6);
    ambientLayer.addChild(s);
    ambient.push({
      s,
      vx: (Math.random() - 0.5) * 18,
      vy: leaf ? 8 + Math.random() * 14 : -6 - Math.random() * 10,
      life: leaf ? 6 + Math.random() * 5 : 3 + Math.random() * 3,
      kind: leaf ? "leaf" : "pollen",
    });
  }

  /** @param {number} x @param {number} y */
  function burstStomp(x, y) {
    if (!enabled || !textures.dust) return;
    const n = 10 + Math.floor(Math.random() * 6);
    for (let i = 0; i < n && dust.length < maxDust; i++) {
      const s = new Sprite(textures.dust);
      s.anchor.set(0.5);
      s.x = x + (Math.random() - 0.5) * 20;
      s.y = y + (Math.random() - 0.5) * 6;
      s.alpha = 0.85;
      s.scale.set(0.6 + Math.random() * 1.1);
      worldFxLayer.addChild(s);
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      const spd = 60 + Math.random() * 90;
      dust.push({
        s,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.35 + Math.random() * 0.35,
      });
    }
  }

  /**
   * @param {number} dt
   * @param {{ camX: number, ground: number, active: boolean, stompEdge: boolean, stompX: number, stompY: number }} ctx
   */
  function update(dt, ctx) {
    if (!enabled) return;
    if (ctx.active) {
      while (ambient.length < maxAmbient * 0.85) spawnAmbient(ctx.camX, ctx.ground);
    }
    if (ctx.stompEdge) burstStomp(ctx.stompX, ctx.stompY);

    ambient = ambient.filter((p) => {
      p.life -= dt;
      p.s.x += p.vx * dt;
      p.s.y += p.vy * dt;
      if (p.kind === "leaf") {
        p.s.rotation += dt * 0.8;
        p.vx += Math.sin(p.s.y * 0.05) * dt * 8;
      }
      p.s.alpha = Math.min(p.s.alpha, p.life * 0.35);
      if (p.life <= 0 || p.s.y > GAME_H + 20 || p.s.x < ctx.camX - 40) {
        ambientLayer.removeChild(p.s);
        p.s.destroy();
        return false;
      }
      return true;
    });

    dust = dust.filter((p) => {
      p.life -= dt;
      p.s.x += p.vx * dt;
      p.s.y += p.vy * dt;
      p.vy += 120 * dt;
      p.vx *= 1 - dt * 2.5;
      p.s.alpha = p.life * 2.2;
      if (p.life <= 0) {
        worldFxLayer.removeChild(p.s);
        p.s.destroy();
        return false;
      }
      return true;
    });
  }

  function destroy() {
    for (const p of ambient) p.s.destroy();
    for (const p of dust) p.s.destroy();
    ambient = [];
    dust = [];
  }

  return {
    ambientLayer,
    worldFxLayer,
    update,
    destroy,
  };
}
