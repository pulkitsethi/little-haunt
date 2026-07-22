import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig";

/** Simple bottom hint / dialogue panel. */
export class DialogueBox {
  private scene: Phaser.Scene;
  private root: Phaser.GameObjects.Container;
  private body: Phaser.GameObjects.Text;
  private hideTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const panel = scene.add
      .rectangle(0, 0, GAME_WIDTH - 48, 88, 0x121826, 0.9)
      .setStrokeStyle(2, 0xffe29a, 0.45);

    this.body = scene.add
      .text(0, 0, "", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "16px",
        color: "#f4f7ff",
        align: "center",
        wordWrap: { width: GAME_WIDTH - 100 },
      })
      .setOrigin(0.5);

    this.root = scene.add
      .container(GAME_WIDTH / 2, GAME_HEIGHT - 58, [panel, this.body])
      .setDepth(80)
      .setScrollFactor(0)
      .setVisible(false);
  }

  show(message: string, holdMs = 3200): void {
    this.body.setText(message);
    this.root.setVisible(true);
    this.hideTimer?.remove(false);
    this.hideTimer = this.scene.time.delayedCall(holdMs, () => {
      this.root.setVisible(false);
    });
  }

  hide(): void {
    this.hideTimer?.remove(false);
    this.root.setVisible(false);
  }
}
