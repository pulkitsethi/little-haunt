import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig";
import { ROOM_DEFS } from "../data/roomDefs";

/** Stub room — light-beam redirect puzzle lands here next. */
export class OceanHallScene extends Phaser.Scene {
  constructor() {
    super("OceanHall");
  }

  create(): void {
    const def = ROOM_DEFS.ocean;
    this.cameras.main.setBackgroundColor(0x102536);
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, def.title, {
        fontFamily: "Nunito, sans-serif",
        fontSize: "32px",
        color: "#8fd3ff",
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
        backgroundColor: `#${COLORS.keyGlow.toString(16)}`,
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    back.on("pointerdown", () => this.scene.start("Hub"));
  }
}
