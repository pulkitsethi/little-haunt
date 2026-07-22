import Phaser from "phaser";
import { generatePlayerTexture } from "../systems/PlayerController";
import { generateSpookTexture } from "../systems/RoamingSpook";
import { COLORS } from "../config/gameConfig";

/** Generate placeholder textures once, then jump to the title. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create(): void {
    generatePlayerTexture(this);
    generateSpookTexture(this);
    this.generateSharedTextures();
    this.scene.start("Title");
  }

  private generateSharedTextures(): void {
    if (!this.textures.exists("tex-clue")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(COLORS.clueGlow, 1);
      g.fillCircle(12, 12, 10);
      g.lineStyle(2, 0xffffff, 0.9);
      g.strokeCircle(12, 12, 10);
      g.generateTexture("tex-clue", 24, 24);
      g.destroy();
    }

    if (!this.textures.exists("tex-key")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(COLORS.keyGlow, 1);
      g.fillCircle(10, 10, 8);
      g.fillRect(16, 7, 16, 6);
      g.fillRect(26, 7, 4, 12);
      g.fillRect(22, 13, 4, 6);
      g.generateTexture("tex-key", 36, 24);
      g.destroy();
    }

    if (!this.textures.exists("tex-distract")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffd166, 1);
      g.fillRoundedRect(0, 0, 28, 28, 6);
      g.fillStyle(0x333333, 1);
      g.fillCircle(14, 14, 5);
      g.generateTexture("tex-distract", 28, 28);
      g.destroy();
    }
  }
}
