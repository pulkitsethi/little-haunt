import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig";
import { GameProgress } from "../data/GameProgress";

export class WinScene extends Phaser.Scene {
  constructor() {
    super("Win");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.restoredFloor);

    this.add
      .text(GAME_WIDTH / 2, 160, "Museum Restored!", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "42px",
        color: "#ffe29a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        230,
        "You collected every Glow Key and chased the spooky hush away.\nThe exhibits shine for tomorrow's visitors.",
        {
          fontFamily: "Nunito, sans-serif",
          fontSize: "18px",
          color: "#e8eefc",
          align: "center",
          wordWrap: { width: 560 },
        },
      )
      .setOrigin(0.5);

    const again = this.add
      .text(GAME_WIDTH / 2, 340, "Play again", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "20px",
        color: "#121826",
        backgroundColor: "#7dffb3",
        padding: { x: 16, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: again,
      scale: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    again.on("pointerdown", () => {
      GameProgress.resetAll();
      this.scene.start("Title");
    });

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 48, "Thanks for being a brave museum helper", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "14px",
        color: "#c5d0e6",
      })
      .setOrigin(0.5);
  }
}
