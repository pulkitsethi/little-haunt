# Session 1 (30–45 min): Name it, draw it, move

**Goal:** A named haunted game with a dark backdrop and a hero she can walk around with the arrow keys. End by playing it and showing someone.

**You:** co-pilot. **She:** drives the mouse.

## Opening questions (2 min)

1. “What’s scary in your game?”
2. “Who are we?”
3. “What are we running from?” (monster name can wait until Session 2)

Write on paper or in Scratch notes:

| Field | Her answer |
| --- | --- |
| Game title | ________________ |
| Hero name | ________________ |
| Place | hallway / house / forest / ______ |

## Step A — Dark backdrop (8 min)

1. Open Scratch → **Create**
2. Click the **Stage** (white box bottom-right)
3. Open the **Backdrops** tab → paint a dark scene:
   - Fill with near-black or deep green
   - Add a hallway, door, or trees with lighter gray
4. Rename the backdrop: `haunted`

Play vibe check: “Does this feel spooky yet?”

## Step B — Draw the hero (10 min)

1. Delete the default cat if she wants (trash can on sprite) — or keep it and “hauntify” it
2. Paint a new sprite: her hero
3. Rename the sprite to the hero’s name
4. Keep the size readable (not tiny)

## Step C — Arrow-key movement (12 min)

Select the **hero** sprite. Build this (she snaps blocks; you point):

```text
when green flag clicked
forever
  if <key (up arrow) pressed?> then
    change y by (5)
  if <key (down arrow) pressed?> then
    change y by (-5)
  if <key (left arrow) pressed?> then
    change x by (-5)
  if <key (right arrow) pressed?> then
    change x by (5)
```

Block colors:

- `when green flag clicked` — Events (yellow)
- `forever` / `if` — Control (orange)
- `key … pressed?` — Sensing (light blue)
- `change x/y by` — Motion (blue)

**Play after every direction works.** Celebrate the first walk across the haunted hall.

## Step D — Save + name the project (3 min)

1. Click the top title (“Untitled”) → type her **game title**
2. File → **Save now** (if signed in, it autosaves to My Stuff)

## Closing (2 min)

- “Want to show Mom/Dad/your brother that you can walk through the haunted place?”
- Stop while it’s still fun. Monster comes next time.

## If you get stuck

| Problem | Fix |
| --- | --- |
| Hero doesn’t move | Green flag clicked? Blocks attached under the flag? |
| Moves too fast/slow | Change `5` to `3` or `8` |
| She’s bored of coding | Let her redraw the backdrop or add a second costume |

## Pride test

Can she say “I made [title]” and walk the hero without you touching the mouse? You’re done.

Next: [Sessions 2–3](03-session-2-3.md)
