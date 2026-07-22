export type RoomId = "dinosaur" | "egypt" | "ocean";

export type RoomProgress = {
  cluesFound: string[];
  puzzleSolved: boolean;
  keyCollected: boolean;
  restored: boolean;
};

const emptyRoom = (): RoomProgress => ({
  cluesFound: [],
  puzzleSolved: false,
  keyCollected: false,
  restored: false,
});

/** Tiny singleton so scenes can share progress without a big state library. */
class GameProgressStore {
  rooms: Record<RoomId, RoomProgress> = {
    dinosaur: emptyRoom(),
    egypt: emptyRoom(),
    ocean: emptyRoom(),
  };

  resetAll(): void {
    this.rooms = {
      dinosaur: emptyRoom(),
      egypt: emptyRoom(),
      ocean: emptyRoom(),
    };
  }

  markClue(roomId: RoomId, clueId: string): boolean {
    const room = this.rooms[roomId];
    if (room.cluesFound.includes(clueId)) return false;
    room.cluesFound.push(clueId);
    return true;
  }

  keysCollected(): number {
    return (Object.keys(this.rooms) as RoomId[]).filter(
      (id) => this.rooms[id].keyCollected,
    ).length;
  }

  allKeysCollected(): boolean {
    return this.keysCollected() >= 3;
  }
}

export const GameProgress = new GameProgressStore();
