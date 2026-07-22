/** Shared sizes and colors — tweak here with a kid collaborator. */
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const COLORS = {
  nightFloor: 0x1b2438,
  museumWall: 0x2a3348,
  warmGlow: 0xffe29a,
  clueGlow: 0x8fd3ff,
  spookBody: 0xb8a6ff,
  playerBody: 0xf4d35e,
  keyGlow: 0x7dffb3,
  dangerSoft: 0xff9aa2,
  uiPanel: 0x121826,
  restoredFloor: 0x33415f,
} as const;

export const CONTROLS = {
  interactKey: "E",
  moveHint: "WASD / arrows move · E interact · mouse aims flashlight",
} as const;

export const PLAYER_SPEED = 160;
export const SPOOK_SPEED = 55;
export const CATCH_COOLDOWN_MS = 1400;
