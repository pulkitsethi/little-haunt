import Phaser from "phaser";
import { GAME_WIDTH } from "../config/gameConfig";

export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

/** Top-right checklist for the current room goals. */
export class ChecklistHud {
  private container: Phaser.GameObjects.Container;
  private lines: Phaser.GameObjects.Text[] = [];
  private titleText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, title: string) {
    const panel = scene.add
      .rectangle(0, 0, 250, 150, 0x121826, 0.82)
      .setOrigin(1, 0)
      .setStrokeStyle(2, 0x8fd3ff, 0.35);

    this.titleText = scene.add
      .text(-12, 10, title, {
        fontFamily: "Nunito, sans-serif",
        fontSize: "15px",
        color: "#ffe29a",
        fontStyle: "bold",
      })
      .setOrigin(1, 0);

    this.container = scene.add
      .container(GAME_WIDTH - 16, 16, [panel, this.titleText])
      .setDepth(70)
      .setScrollFactor(0);
  }

  setItems(items: ChecklistItem[]): void {
    for (const line of this.lines) line.destroy();
    this.lines = [];

    items.forEach((item, index) => {
      const mark = item.done ? "✓" : "○";
      const color = item.done ? "#7dffb3" : "#e8eefc";
      const text = this.container.scene.add
        .text(-12, 36 + index * 24, `${mark}  ${item.label}`, {
          fontFamily: "Nunito, sans-serif",
          fontSize: "14px",
          color,
        })
        .setOrigin(1, 0);
      this.container.add(text);
      this.lines.push(text);
    });
  }
}
