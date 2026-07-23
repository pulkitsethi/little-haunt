import Phaser from "phaser";
import "./style.css";
import { GAME_HEIGHT, GAME_WIDTH } from "./config/gameConfig";
import { BootScene } from "./scenes/BootScene";
import { TitleScene } from "./scenes/TitleScene";
import { HubScene } from "./scenes/HubScene";
import { DinosaurHallScene } from "./scenes/DinosaurHallScene";
import { EgyptGalleryScene } from "./scenes/EgyptGalleryScene";
import { OceanHallScene } from "./scenes/OceanHallScene";
import { WinScene } from "./scenes/WinScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-root",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#0b1020",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene,
    TitleScene,
    HubScene,
    DinosaurHallScene,
    EgyptGalleryScene,
    OceanHallScene,
    WinScene,
  ],
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
