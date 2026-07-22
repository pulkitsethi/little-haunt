import Phaser from "phaser";
import {
  CATCH_COOLDOWN_MS,
  COLORS,
  CONTROLS,
  GAME_HEIGHT,
  GAME_WIDTH,
} from "../config/gameConfig";
import { GameProgress } from "../data/GameProgress";
import { ROOM_DEFS } from "../data/roomDefs";
import { BonePuzzle } from "../puzzles/BonePuzzle";
import { ChecklistHud } from "../systems/ChecklistHud";
import { DialogueBox } from "../systems/DialogueBox";
import { FlashlightOverlay } from "../systems/FlashlightOverlay";
import {
  InteractionSystem,
  makeCircleZone,
} from "../systems/InteractionSystem";
import { PlayerController } from "../systems/PlayerController";
import { RoamingSpook } from "../systems/RoamingSpook";

const ROOM = ROOM_DEFS.dinosaur;

export class DinosaurHallScene extends Phaser.Scene {
  private player!: PlayerController;
  private spook!: RoamingSpook;
  private flashlight!: FlashlightOverlay;
  private interactions!: InteractionSystem;
  private checklist!: ChecklistHud;
  private dialogue!: DialogueBox;
  private puzzle!: BonePuzzle;
  private keySprite?: Phaser.GameObjects.Image;
  private floor!: Phaser.GameObjects.Rectangle;
  private catchLockedUntil = 0;
  private pointerWorld = new Phaser.Math.Vector2();

  constructor() {
    super("DinosaurHall");
  }

  create(): void {
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.cameras.main.setBackgroundColor(COLORS.nightFloor);

    this.floor = this.add
      .rectangle(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        GAME_WIDTH,
        GAME_HEIGHT,
        COLORS.nightFloor,
      )
      .setDepth(0);

    this.drawDecor();

    this.player = new PlayerController(this, ROOM.spawn.x, ROOM.spawn.y);
    this.spook = new RoamingSpook(this, ROOM.spookPath);
    this.flashlight = new FlashlightOverlay(this);
    this.interactions = new InteractionSystem(this);
    this.checklist = new ChecklistHud(this, ROOM.title);
    this.dialogue = new DialogueBox(this);

    this.dialogue.show(ROOM.intro, 4200);

    this.add
      .text(16, GAME_HEIGHT - 22, CONTROLS.moveHint, {
        fontFamily: "Nunito, sans-serif",
        fontSize: "12px",
        color: "#c5d0e6",
      })
      .setDepth(70)
      .setScrollFactor(0);

    this.setupClues();
    this.setupDistractToy();
    this.setupPuzzle();
    this.setupExit();
    this.refreshChecklist();

    this.physics.add.overlap(
      this.player.sprite,
      this.spook.sprite,
      () => this.onCaught(),
    );

    // If the room was already finished, show restored state.
    if (GameProgress.rooms.dinosaur.restored) {
      this.applyRestoredLook(false);
    }
  }

  update(): void {
    this.input.activePointer.updateWorldPoint(this.cameras.main);
    this.pointerWorld.set(
      this.input.activePointer.worldX,
      this.input.activePointer.worldY,
    );

    this.player.update(this.pointerWorld);
    this.spook.update();
    this.interactions.update(this.player.sprite.x, this.player.sprite.y);

    if (!GameProgress.rooms.dinosaur.restored) {
      this.flashlight.update(
        this.player.sprite.x,
        this.player.sprite.y,
        this.player.facingAngle,
      );
    }
  }

  private drawDecor(): void {
    // Walls / exhibit platforms as placeholder shapes.
    const walls = this.add.graphics().setDepth(1);
    walls.lineStyle(4, 0x3d4a66, 1);
    walls.strokeRect(24, 24, GAME_WIDTH - 48, GAME_HEIGHT - 48);

    this.add
      .text(GAME_WIDTH / 2, 40, "DINOSAUR HALL — after hours", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "18px",
        color: "#ffe29a",
      })
      .setOrigin(0.5)
      .setDepth(2);

    // Fossil mural silhouette
    const mural = this.add.graphics().setDepth(1);
    mural.fillStyle(0x2a3348, 1);
    mural.fillRoundedRect(80, 80, 200, 90, 12);
    mural.fillStyle(0x4a5568, 1);
    mural.fillEllipse(140, 120, 40, 28);
    mural.fillRect(155, 112, 90, 14);
    mural.fillTriangle(240, 110, 260, 120, 240, 130);
  }

  private setupClues(): void {
    const progress = GameProgress.rooms.dinosaur;

    for (const clue of ROOM.clues) {
      const already = progress.cluesFound.includes(clue.id);
      const sprite = this.add
        .image(clue.x, clue.y, "tex-clue")
        .setDepth(4)
        .setAlpha(already ? 0.35 : 1);

      if (!already) {
        this.tweens.add({
          targets: sprite,
          alpha: { from: 0.65, to: 1 },
          duration: 700,
          yoyo: true,
          repeat: -1,
        });
      }

      const zone = makeCircleZone(this, clue.x, clue.y, 22);
      this.interactions.add({
        id: `clue-${clue.id}`,
        zone,
        prompt: already ? "Already found" : `Look at ${clue.label}`,
        isActive: () => !GameProgress.rooms.dinosaur.cluesFound.includes(clue.id),
        onInteract: () => {
          const found = GameProgress.markClue("dinosaur", clue.id);
          if (!found) return;
          sprite.setAlpha(0.35);
          this.tweens.killTweensOf(sprite);
          this.dialogue.show(clue.hint, 3600);
          this.refreshChecklist();

          if (GameProgress.rooms.dinosaur.cluesFound.length >= 3) {
            this.time.delayedCall(900, () => {
              this.dialogue.show(
                "All clues found! Visit the Bone Stand and press E on each shelf to cycle bones.",
                4000,
              );
            });
          }
        },
      });
    }
  }

  private setupDistractToy(): void {
    const x = 360;
    const y = 420;
    this.add.image(x, y, "tex-distract").setDepth(4);
    const zone = makeCircleZone(this, x, y, 24);
    this.interactions.add({
      id: "distract-toy",
      zone,
      prompt: "Rattle toy (distract ghost)",
      onInteract: () => {
        this.spook.distract(this, 2400);
        this.dialogue.show("The soft ghost pauses to listen. Tip-toe past!", 2200);
      },
    });
  }

  private setupPuzzle(): void {
    this.puzzle = new BonePuzzle(this, 520, 250, () => {
      GameProgress.rooms.dinosaur.puzzleSolved = true;
      this.dialogue.show("The fossil hums happily! A Glow Key appears!", 3200);
      this.spawnKey();
      this.refreshChecklist();
    });

    // If already solved from a previous visit in this session.
    if (GameProgress.rooms.dinosaur.puzzleSolved) {
      this.spawnKey();
    }

    const slots = this.puzzle.getSlotWorldPositions();
    slots.forEach((pos, index) => {
      const zone = makeCircleZone(this, pos.x, pos.y, 28);
      this.interactions.add({
        id: `bone-slot-${index}`,
        zone,
        prompt: "Cycle bone piece",
        isActive: () => !GameProgress.rooms.dinosaur.puzzleSolved,
        onInteract: () => {
          if (GameProgress.rooms.dinosaur.cluesFound.length < 3) {
            this.dialogue.show(
              "Find all 3 clues before rebuilding the fossil.",
              2400,
            );
            return;
          }
          this.puzzle.cycleSlot(index);
        },
      });
    });
  }

  private spawnKey(): void {
    if (this.keySprite || GameProgress.rooms.dinosaur.keyCollected) {
      if (GameProgress.rooms.dinosaur.keyCollected && !GameProgress.rooms.dinosaur.restored) {
        this.offerRestore();
      }
      return;
    }

    const x = 520;
    const y = 140;
    this.keySprite = this.add.image(x, y, "tex-key").setDepth(6);
    this.tweens.add({
      targets: this.keySprite,
      y: y - 8,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });

    const zone = makeCircleZone(this, x, y, 26);
    this.interactions.add({
      id: "glow-key",
      zone,
      prompt: "Collect Glow Key",
      isActive: () => !GameProgress.rooms.dinosaur.keyCollected,
      onInteract: () => {
        GameProgress.rooms.dinosaur.keyCollected = true;
        this.keySprite?.destroy();
        this.keySprite = undefined;
        this.dialogue.show("Glow Key collected! Restore the hall to finish.", 3000);
        this.refreshChecklist();
        this.offerRestore();
      },
    });
  }

  private offerRestore(): void {
    const zone = makeCircleZone(this, 520, 250, 50);
    this.interactions.add({
      id: "restore-room",
      zone,
      prompt: "Restore the hall",
      isActive: () =>
        GameProgress.rooms.dinosaur.keyCollected &&
        !GameProgress.rooms.dinosaur.restored,
      onInteract: () => {
        GameProgress.rooms.dinosaur.restored = true;
        this.applyRestoredLook(true);
        this.refreshChecklist();
        this.dialogue.show(
          "The Dinosaur Hall feels safe again. Head back to the atrium!",
          3600,
        );
      },
    });
  }

  private applyRestoredLook(animate: boolean): void {
    this.flashlight.setEnabled(false);
    this.spook.setPaused(true);
    this.spook.sprite.setAlpha(0.25);
    this.floor.setFillStyle(COLORS.restoredFloor, 1);
    this.cameras.main.setBackgroundColor(COLORS.restoredFloor);

    if (animate) {
      this.cameras.main.flash(500, 125, 255, 179);
    }
  }

  private setupExit(): void {
    const door = this.add
      .rectangle(60, 480, 70, 50, 0x8fd3ff, 0.35)
      .setStrokeStyle(2, COLORS.clueGlow, 1)
      .setDepth(3);
    this.add
      .text(60, 480, "EXIT", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "12px",
        color: "#e8eefc",
      })
      .setOrigin(0.5)
      .setDepth(4);

    const zone = makeCircleZone(this, door.x, door.y, 36);
    this.interactions.add({
      id: "exit",
      zone,
      prompt: "Return to atrium",
      onInteract: () => this.scene.start("Hub"),
    });
  }

  private onCaught(): void {
    const now = this.time.now;
    if (now < this.catchLockedUntil) return;
    if (GameProgress.rooms.dinosaur.restored) return;

    this.catchLockedUntil = now + CATCH_COOLDOWN_MS;
    this.player.setFrozen(true);
    this.player.resetTo(ROOM.spawn.x, ROOM.spawn.y);
    this.cameras.main.shake(180, 0.004);
    this.dialogue.show(
      "Whoops! The soft ghost startled you. Back to the door — try again!",
      2400,
    );
    this.time.delayedCall(500, () => this.player.setFrozen(false));
  }

  private refreshChecklist(): void {
    const room = GameProgress.rooms.dinosaur;
    this.checklist.setItems([
      {
        id: "clues",
        label: `Find 3 clues (${room.cluesFound.length}/3)`,
        done: room.cluesFound.length >= 3,
      },
      {
        id: "puzzle",
        label: "Solve the bone puzzle",
        done: room.puzzleSolved,
      },
      {
        id: "key",
        label: "Collect the Glow Key",
        done: room.keyCollected,
      },
      {
        id: "restore",
        label: "Restore the hall",
        done: room.restored,
      },
    ]);
  }
}
