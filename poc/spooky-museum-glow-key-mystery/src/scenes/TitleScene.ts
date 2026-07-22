import Phaser from "phaser";
import { COLORS, CONTROLS, GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig";
import { GameProgress } from "../data/GameProgress";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("Title");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.nightFloor);

    // Soft atmospheric blobs (not the main visual idea — museum doors below are).
    const bg = this.add.graphics();
    bg.fillStyle(0x152038, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.fillStyle(0x243018, 0.35);
    bg.fillEllipse(720, 420, 420, 220);
    bg.fillStyle(0x1e2a4a, 0.5);
    bg.fillEllipse(220, 160, 360, 200);

    this.add
      .text(GAME_WIDTH / 2, 120, "SPOOKY MUSEUM", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "54px",
        color: "#ffe29a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 178, "Glow Key Mystery", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "28px",
        color: "#8fd3ff",
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        240,
        "Explore quiet halls, find gentle clues, and bring back the glow.",
        {
          fontFamily: "Nunito, sans-serif",
          fontSize: "16px",
          color: "#e8eefc",
          align: "center",
          wordWrap: { width: 520 },
        },
      )
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 300, CONTROLS.moveHint, {
        fontFamily: "Nunito, sans-serif",
        fontSize: "14px",
        color: "#c5d0e6",
      })
      .setOrigin(0.5);

    const start = this.add
      .text(GAME_WIDTH / 2, 380, "Enter the Museum", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "22px",
        color: "#121826",
        backgroundColor: "#7dffb3",
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: start,
      scale: 1.04,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });

    start.on("pointerdown", () => {
      GameProgress.resetAll();
      this.scene.start("Hub");
    });

    this.input.keyboard?.once("keydown-SPACE", () => {
      GameProgress.resetAll();
      this.scene.start("Hub");
    });
  }
}
