import type { RoomId } from "./GameProgress";

export type ClueDef = {
  id: string;
  x: number;
  y: number;
  label: string;
  hint: string;
};

export type RoomDef = {
  id: RoomId;
  title: string;
  sceneKey: string;
  playable: boolean;
  intro: string;
  checklist: string[];
  clues: ClueDef[];
  spawn: { x: number; y: number };
  spookPath: { x: number; y: number }[];
  puzzleLabel: string;
};

export const ROOM_DEFS: Record<RoomId, RoomDef> = {
  dinosaur: {
    id: "dinosaur",
    title: "Dinosaur Hall",
    sceneKey: "DinosaurHall",
    playable: true,
    intro:
      "The bones are jumbled! Find 3 clues, dodge the soft ghost, then rebuild the fossil.",
    checklist: [
      "Find 3 glowing clues",
      "Solve the bone puzzle",
      "Collect the Glow Key",
      "Restore the hall",
    ],
    clues: [
      {
        id: "plaque",
        x: 180,
        y: 160,
        label: "Night Plaque",
        hint: "Clue 1: The skull belongs at the TOP of the stand.",
      },
      {
        id: "footprint",
        x: 760,
        y: 140,
        label: "Glow Footprint",
        hint: "Clue 2: Ribs sit in the MIDDLE — like a cozy sweater.",
      },
      {
        id: "tail-tag",
        x: 700,
        y: 400,
        label: "Tail Tag",
        hint: "Clue 3: The long tail goes at the BOTTOM.",
      },
    ],
    spawn: { x: 120, y: 420 },
    spookPath: [
      { x: 420, y: 180 },
      { x: 680, y: 220 },
      { x: 520, y: 360 },
      { x: 300, y: 300 },
    ],
    puzzleLabel: "Bone Stand",
  },
  egypt: {
    id: "egypt",
    title: "Egypt Gallery",
    sceneKey: "EgyptGallery",
    playable: false,
    intro: "Coming soon: match glowing symbols before the soft mummy drifts by.",
    checklist: [
      "Find 3 glowing clues",
      "Match the symbols",
      "Collect the Glow Key",
      "Restore the gallery",
    ],
    clues: [],
    spawn: { x: 140, y: 400 },
    spookPath: [],
    puzzleLabel: "Symbol Gate",
  },
  ocean: {
    id: "ocean",
    title: "Ocean Hall",
    sceneKey: "OceanHall",
    playable: false,
    intro: "Coming soon: redirect friendly light beams through the deep blue.",
    checklist: [
      "Find 3 glowing clues",
      "Redirect the light beams",
      "Collect the Glow Key",
      "Restore the hall",
    ],
    clues: [],
    spawn: { x: 140, y: 400 },
    spookPath: [],
    puzzleLabel: "Light Table",
  },
};
