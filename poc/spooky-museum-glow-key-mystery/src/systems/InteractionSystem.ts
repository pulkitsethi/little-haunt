import Phaser from "phaser";
import { CONTROLS } from "../config/gameConfig";

export type Interactable = {
  id: string;
  zone: Phaser.GameObjects.Zone;
  prompt: string;
  onInteract: () => void;
  isActive?: () => boolean;
};

/**
 * Press E near a zone to trigger it.
 * Keeps interaction logic out of each room scene.
 */
export class InteractionSystem {
  private items: Interactable[] = [];
  private promptText: Phaser.GameObjects.Text;
  private key: Phaser.Input.Keyboard.Key;
  private justPromptedId: string | null = null;

  constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      throw new Error("Keyboard plugin missing.");
    }
    this.key = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.promptText = scene.add
      .text(0, 0, "", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "14px",
        color: "#fff7d6",
        backgroundColor: "#121826cc",
        padding: { x: 8, y: 4 },
      })
      .setDepth(60)
      .setOrigin(0.5, 1)
      .setVisible(false);
  }

  add(item: Interactable): void {
    this.items.push(item);
  }

  clear(): void {
    this.items = [];
    this.promptText.setVisible(false);
  }

  update(playerX: number, playerY: number): void {
    let nearest: Interactable | null = null;
    let nearestDist = Infinity;

    for (const item of this.items) {
      if (item.isActive && !item.isActive()) continue;
      const bounds = item.zone.getBounds();
      const cx = bounds.centerX;
      const cy = bounds.centerY;
      const dist = Phaser.Math.Distance.Between(playerX, playerY, cx, cy);
      const inRange =
        dist < Math.max(bounds.width, bounds.height) * 0.65 + 28;
      if (inRange && dist < nearestDist) {
        nearest = item;
        nearestDist = dist;
      }
    }

    if (!nearest) {
      this.promptText.setVisible(false);
      this.justPromptedId = null;
      return;
    }

    this.promptText
      .setText(`${CONTROLS.interactKey}: ${nearest.prompt}`)
      .setPosition(nearest.zone.x, nearest.zone.y - 28)
      .setVisible(true);

    if (Phaser.Input.Keyboard.JustDown(this.key)) {
      // Prevent double-fire on the same frame when kids mash E.
      if (this.justPromptedId === nearest.id) return;
      this.justPromptedId = nearest.id;
      nearest.onInteract();
      this.justPromptedId = null;
    }
  }
}

export function makeCircleZone(
  scene: Phaser.Scene,
  x: number,
  y: number,
  radius: number,
): Phaser.GameObjects.Zone {
  return scene.add.zone(x, y, radius * 2, radius * 2);
}
