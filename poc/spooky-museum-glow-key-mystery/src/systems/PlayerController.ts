import Phaser from "phaser";
import { COLORS, PLAYER_SPEED } from "../config/gameConfig";

/** Top-down player with keyboard move + facing for the flashlight. */
export class PlayerController {
  readonly sprite: Phaser.Physics.Arcade.Image;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  facingAngle = 0;
  private frozen = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.image(x, y, "tex-player");
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setCircle(14, 2, 2);
    this.sprite.setDepth(10);

    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      throw new Error("Keyboard plugin missing — enable input.keyboard in config.");
    }

    this.cursors = keyboard.createCursorKeys();
    this.wasd = {
      W: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  setFrozen(value: boolean): void {
    this.frozen = value;
    if (value) {
      this.sprite.setVelocity(0, 0);
    }
  }

  update(pointerWorld: Phaser.Math.Vector2): void {
    if (this.frozen) {
      this.sprite.setVelocity(0, 0);
      return;
    }

    let vx = 0;
    let vy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) vy += 1;

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy);
      vx = (vx / len) * PLAYER_SPEED;
      vy = (vy / len) * PLAYER_SPEED;
      body.setVelocity(vx, vy);
      this.facingAngle = Math.atan2(vy, vx);
    } else {
      body.setVelocity(0, 0);
    }

    // Mouse aim wins when the pointer is away from the player.
    const dx = pointerWorld.x - this.sprite.x;
    const dy = pointerWorld.y - this.sprite.y;
    if (Math.hypot(dx, dy) > 8) {
      this.facingAngle = Math.atan2(dy, dx);
    }
  }

  resetTo(x: number, y: number): void {
    this.sprite.setPosition(x, y);
    this.sprite.setVelocity(0, 0);
  }
}

/** Draw a simple kid-friendly explorer circle into a texture. */
export function generatePlayerTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists("tex-player")) return;
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(COLORS.playerBody, 1);
  g.fillCircle(16, 16, 14);
  g.fillStyle(0x2b2d42, 1);
  g.fillCircle(11, 13, 2.5);
  g.fillCircle(21, 13, 2.5);
  g.fillStyle(0xffffff, 0.85);
  g.fillCircle(22, 8, 3);
  g.generateTexture("tex-player", 32, 32);
  g.destroy();
}
