import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig";
import { ROOM_DEFS } from "../data/roomDefs";

/** Stub room — symbol matching puzzle lands here next. */
export class EgyptGalleryScene extends Phaser.Scene {
  constructor() {
    super("EgyptGallery");
  }

  create(): void {
    const def = ROOM_DEFS.egypt;
    this.cameras.main.setBackgroundColor(0x2a2118);
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, def.title, {
        fontFamily: "Nunito, sans-serif",
        fontSize: "32px",
        color: "#ffe29a",
      })
      .setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 24, def.intro, {
        fontFamily: "Nunito, sans-serif",
        fontSize: "16px",
        color: "#e8eefc",
        align: "center",
        wordWrap: { width: 520 },
      })
      .setOrigin(0.5);

    const back = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 80, "Back to atrium", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "18px",
        color: "#121826",
        backgroundColor: `#${COLORS.clueGlow.toString(16)}`,
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    back.on("pointerdown", () => this.scene.start("Hub"));
  }
}
