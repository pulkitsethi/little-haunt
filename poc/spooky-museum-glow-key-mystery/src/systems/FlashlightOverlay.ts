import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig";

/**
 * Full-screen night veil with a cone erased for the flashlight reveal.
 * Tune coneLength / coneHalfAngle while playtesting with a kid collaborator.
 */
export class FlashlightOverlay {
  private rt: Phaser.GameObjects.RenderTexture;
  private brush: Phaser.GameObjects.Graphics;
  private enabled = true;
  coneLength = 220;
  coneHalfAngle = Phaser.Math.DegToRad(30);
  ambientAlpha = 0.82;

  constructor(scene: Phaser.Scene) {
    this.rt = scene.add
      .renderTexture(0, 0, GAME_WIDTH, GAME_HEIGHT)
      .setOrigin(0, 0)
      .setDepth(40)
      .setScrollFactor(0)
      .setRenderMode("all");

    this.brush = scene.make.graphics({ x: 0, y: 0 });
    this.brush.setVisible(false);
  }

  setEnabled(value: boolean): void {
    this.enabled = value;
    this.rt.setVisible(value);
    if (!value) {
      this.rt.clear();
      this.rt.render();
    }
  }

  update(originX: number, originY: number, angle: number): void {
    if (!this.enabled) return;

    this.rt.clear();
    this.rt.fill(0x05070f, this.ambientAlpha);

    const left = angle - this.coneHalfAngle;
    const right = angle + this.coneHalfAngle;
    const x1 = originX + Math.cos(left) * this.coneLength;
    const y1 = originY + Math.sin(left) * this.coneLength;
    const x2 = originX + Math.cos(right) * this.coneLength;
    const y2 = originY + Math.sin(right) * this.coneLength;

    this.brush.clear();
    this.brush.fillStyle(0xffffff, 1);
    this.brush.fillTriangle(originX, originY, x1, y1, x2, y2);
    this.brush.fillCircle(originX, originY, 46);
    for (let i = 1; i <= 4; i++) {
      const t = i / 4;
      const cx = originX + Math.cos(angle) * this.coneLength * t;
      const cy = originY + Math.sin(angle) * this.coneLength * t;
      this.brush.fillCircle(cx, cy, 26 + t * 36);
    }

    this.rt.erase(this.brush);
    // Phaser 4 queues draw commands — flush so the cone appears each frame.
    this.rt.render();
  }
}
