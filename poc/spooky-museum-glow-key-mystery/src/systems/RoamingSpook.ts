import Phaser from "phaser";
import { COLORS, SPOOK_SPEED } from "../config/gameConfig";

type Point = { x: number; y: number };

/** Soft purple ghost that patrols waypoints — no combat, just a gentle "caught" trigger. */
export class RoamingSpook {
  readonly sprite: Phaser.Physics.Arcade.Image;
  private path: Point[];
  private pathIndex = 0;
  private paused = false;
  private bobTween: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, path: Point[]) {
    this.path = path.length > 0 ? path : [{ x: 400, y: 240 }];
    const start = this.path[0];
    this.sprite = scene.physics.add.image(start.x, start.y, "tex-spook");
    this.sprite.setImmovable(true);
    this.sprite.setCircle(16, 2, 2);
    this.sprite.setDepth(9);
    this.sprite.setAlpha(0.9);

    this.bobTween = scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.08,
      scaleY: 0.94,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
  }

  setPaused(value: boolean): void {
    this.paused = value;
    if (value) {
      this.sprite.setVelocity(0, 0);
    }
  }

  /** Brief distract: freeze in place so kids can sneak past. */
  distract(scene: Phaser.Scene, ms = 2200): void {
    this.setPaused(true);
    this.sprite.setTint(0xffffff);
    scene.time.delayedCall(ms, () => {
      this.sprite.clearTint();
      this.setPaused(false);
    });
  }

  update(): void {
    if (this.paused || this.path.length === 0) {
      this.sprite.setVelocity(0, 0);
      return;
    }

    const target = this.path[this.pathIndex];
    const dx = target.x - this.sprite.x;
    const dy = target.y - this.sprite.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 8) {
      this.pathIndex = (this.pathIndex + 1) % this.path.length;
      return;
    }

    this.sprite.setVelocity((dx / dist) * SPOOK_SPEED, (dy / dist) * SPOOK_SPEED);
  }

  destroy(): void {
    this.bobTween.stop();
    this.sprite.destroy();
  }
}

export function generateSpookTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists("tex-spook")) return;
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(COLORS.spookBody, 1);
  g.fillEllipse(18, 16, 28, 32);
  g.fillStyle(0xffffff, 0.95);
  g.fillCircle(12, 14, 3.5);
  g.fillCircle(24, 14, 3.5);
  g.fillStyle(0x3d348b, 1);
  g.fillCircle(12, 14, 1.6);
  g.fillCircle(24, 14, 1.6);
  g.fillStyle(COLORS.spookBody, 0.8);
  g.fillTriangle(6, 30, 12, 36, 16, 30);
  g.fillTriangle(16, 30, 22, 36, 28, 30);
  g.generateTexture("tex-spook", 36, 40);
  g.destroy();
}
