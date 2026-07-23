import Phaser from "phaser";
import { COLORS } from "../config/gameConfig";

const BONE_ORDER = ["skull", "ribs", "tail"] as const;
type BoneId = (typeof BONE_ORDER)[number];

const BONE_LABEL: Record<BoneId, string> = {
  skull: "Skull",
  ribs: "Ribs",
  tail: "Tail",
};

/**
 * Tiny cycle puzzle: stand near a slot and press E to cycle bone pieces
 * until skull → ribs → tail. Readable for a child co-designer.
 */
export class BonePuzzle {
  readonly root: Phaser.GameObjects.Container;
  private slots: BoneId[] = ["tail", "skull", "ribs"];
  private slotTexts: Phaser.GameObjects.Text[] = [];
  private solved = false;
  private readonly onSolved: () => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    onSolved: () => void,
  ) {
    this.onSolved = onSolved;

    const stand = scene.add
      .rectangle(0, 0, 160, 200, 0x3a2f24, 1)
      .setStrokeStyle(3, COLORS.warmGlow, 0.7);

    const title = scene.add
      .text(0, -110, "Bone Stand", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "14px",
        color: "#ffe29a",
      })
      .setOrigin(0.5);

    this.root = scene.add.container(x, y, [stand, title]).setDepth(5);

    BONE_ORDER.forEach((_, index) => {
      const slotY = -60 + index * 55;
      const plate = scene.add
        .rectangle(0, slotY, 120, 40, 0x2b2118, 1)
        .setStrokeStyle(2, 0xcfc1a7, 0.8);
      const label = scene.add
        .text(0, slotY, "", {
          fontFamily: "Nunito, sans-serif",
          fontSize: "16px",
          color: "#fff7e8",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      this.root.add([plate, label]);
      this.slotTexts.push(label);
    });

    this.refreshLabels();
  }

  isSolved(): boolean {
    return this.solved;
  }

  /** Cycle the focused slot (0 top, 1 mid, 2 bottom). */
  cycleSlot(slotIndex: number): boolean {
    if (this.solved) return true;
    const current = this.slots[slotIndex];
    const at = BONE_ORDER.indexOf(current);
    this.slots[slotIndex] = BONE_ORDER[(at + 1) % BONE_ORDER.length];
    this.refreshLabels();

    if (this.slots.every((bone, i) => bone === BONE_ORDER[i])) {
      this.solved = true;
      this.root.iterate((child: Phaser.GameObjects.GameObject) => {
        if (child instanceof Phaser.GameObjects.Rectangle) {
          child.setStrokeStyle(3, COLORS.keyGlow, 1);
        }
      });
      this.onSolved();
      return true;
    }
    return false;
  }

  getSlotWorldPositions(): { x: number; y: number }[] {
    return [0, 1, 2].map((index) => ({
      x: this.root.x,
      y: this.root.y - 60 + index * 55,
    }));
  }

  private refreshLabels(): void {
    this.slots.forEach((bone, index) => {
      this.slotTexts[index].setText(BONE_LABEL[bone]);
    });
  }
}
