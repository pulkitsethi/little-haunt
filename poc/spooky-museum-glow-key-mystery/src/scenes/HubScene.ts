import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig";
import { GameProgress, type RoomId } from "../data/GameProgress";
import { ROOM_DEFS } from "../data/roomDefs";
import { DialogueBox } from "../systems/DialogueBox";

const DOORS: { roomId: RoomId; x: number; y: number }[] = [
  { roomId: "dinosaur", x: 220, y: 280 },
  { roomId: "egypt", x: 480, y: 280 },
  { roomId: "ocean", x: 740, y: 280 },
];

export class HubScene extends Phaser.Scene {
  constructor() {
    super("Hub");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.museumWall);
    this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.museumWall)
      .setOrigin(0);

    this.add
      .text(GAME_WIDTH / 2, 56, "Museum Atrium", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "34px",
        color: "#ffe29a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const keys = GameProgress.keysCollected();
    this.add
      .text(GAME_WIDTH / 2, 100, `Glow Keys: ${keys} / 3`, {
        fontFamily: "Nunito, sans-serif",
        fontSize: "18px",
        color: "#7dffb3",
      })
      .setOrigin(0.5);

    const dialogue = new DialogueBox(this);
    dialogue.show("Pick a hall. Start with Dinosaur Hall — it's ready to explore!", 4000);

    for (const door of DOORS) {
      const def = ROOM_DEFS[door.roomId];
      const progress = GameProgress.rooms[door.roomId];
      const doorColor = progress.restored
        ? COLORS.keyGlow
        : def.playable
          ? COLORS.clueGlow
          : 0x6b7280;

      const panel = this.add
        .rectangle(door.x, door.y, 180, 160, 0x1a2236, 1)
        .setStrokeStyle(3, doorColor, 1)
        .setInteractive({ useHandCursor: true });

      this.add
        .text(door.x, door.y - 24, def.title, {
          fontFamily: "Nunito, sans-serif",
          fontSize: "16px",
          color: "#fff7d6",
          align: "center",
          wordWrap: { width: 160 },
        })
        .setOrigin(0.5);

      const status = progress.keyCollected
        ? "Key found!"
        : def.playable
          ? "Open"
          : "Coming soon";

      this.add
        .text(door.x, door.y + 28, status, {
          fontFamily: "Nunito, sans-serif",
          fontSize: "14px",
          color: def.playable ? "#8fd3ff" : "#9aa3b5",
        })
        .setOrigin(0.5);

      panel.on("pointerdown", () => {
        if (!def.playable) {
          dialogue.show(def.intro, 2800);
          return;
        }
        this.scene.start(def.sceneKey);
      });

      this.tweens.add({
        targets: panel,
        alpha: { from: 0.92, to: 1 },
        duration: 1200 + DOORS.indexOf(door) * 200,
        yoyo: true,
        repeat: -1,
      });
    }

    if (GameProgress.allKeysCollected()) {
      this.time.delayedCall(400, () => this.scene.start("Win"));
    }

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 36, "Click a door to enter", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "14px",
        color: "#c5d0e6",
      })
      .setOrigin(0.5);
  }
}
