# Spooky Museum: Glow Key Mystery

Kid-friendly spooky museum adventure built with **Phaser + TypeScript**.

Explore quiet halls at night, find gentle clues, dodge one soft roaming ghost, solve a simple exhibit puzzle, collect a **Glow Key**, and restore the room.

## Play (Room 1 ready)

```bash
cd poc/spooky-museum-glow-key-mystery
npm install
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`).

## Controls

| Input | Action |
| --- | --- |
| WASD / Arrow keys | Move |
| Mouse | Aim flashlight cone |
| E | Interact |
| Click | Hub doors / menus |

## Rooms

1. **Dinosaur Hall** (playable) — find 3 clues, rearrange bones, collect key, restore hall
2. **Egypt Gallery** (stub) — match glowing symbols
3. **Ocean Hall** (stub) — redirect light beams

Win state triggers after all 3 Glow Keys are collected (Rooms 2–3 still need gameplay).

## Layout

```
src/
  main.ts                 Game boot
  config/gameConfig.ts    Sizes, colors, speeds
  data/                   Progress + room definitions
  systems/                Player, flashlight, spook, interact, UI
  puzzles/BonePuzzle.ts   Dinosaur Hall puzzle
  scenes/                 Title, Hub, rooms, Win
```

Placeholder shapes/textures are generated in `BootScene` so you can iterate without art files.

## Design notes

- Soft fail only: getting caught resets you to the room door with a short hint
- No combat, gore, or realistic violence
- Room logic stays data-driven in `roomDefs.ts` where practical
