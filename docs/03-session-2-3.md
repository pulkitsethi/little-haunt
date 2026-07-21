# Sessions 2–3: One scare + win / lose

**Goal:** One threat (chase **or** jump scare), then escape / caught endings and a scary sound. Still one small map.

Pick **one** scare for Session 2. Add win/lose in Session 3. Don’t build both chase and jump scare until she’s hungry for more.

---

## Session 2 (30–45 min): The monster

### Opening

“What should chase you — or what jumps out?”

Name the monster together. Draw it (or remix a ghost from Scratch’s library and recolor it).

### Path A — Chase (recommended first horror mechanic)

Select the **monster** sprite:

```text
when green flag clicked
forever
  point towards [Hero v]
  move (3) steps
```

Tune:

- Too hard → `move (2) steps` or add `wait (0.1) seconds` in the loop
- Too easy → `move (4) steps`

**Play.** Laugh if the ghost spins or gets stuck. Fix one funny bug.

### Path B — Jump scare (door / closet)

1. Paint a **Door** or **Closet** sprite
2. Paint a scary costume on the monster (or second costume on the door)
3. On the door:

```text
when green flag clicked
forever
  if <touching [Hero v]?> then
    broadcast (boo)
```

On the monster (start hidden — size 0 or `hide`):

```text
when I receive [boo]
show
set size to (150) %
play sound [scream v] until done
```

Use Scratch’s sound library (Effects / Animal / Electronic) or record a silly “boo.”

### End Session 2 when…

She can play and either get chased or trigger one scare. Save. Show someone if she wants.

---

## Session 3 (30–45 min): Escape or caught

### Win — reach the exit

1. Paint an **Exit** sprite (glowing door, window, “SAFE”)
2. On the **hero** (or exit):

```text
when green flag clicked
forever
  if <touching [Exit v]?> then
    broadcast (escaped)
    stop [all v]
```

On the Stage (or a text sprite):

```text
when I receive [escaped]
switch backdrop to [you escaped v]
```

Paint a backdrop that says **YOU ESCAPED** (green-ish, relieved).

### Lose — monster touches hero

On the **hero** or **monster**:

```text
when green flag clicked
forever
  if <touching [Monster v]?> then
    broadcast (caught)
    stop [all v]
```

```text
when I receive [caught]
switch backdrop to [it got you v]
play sound [scary v]
```

Paint **IT GOT YOU** backdrop (dark red or stark white text on black).

### Reset for replay

Under green flag on Stage:

```text
when green flag clicked
switch backdrop to [haunted v]
```

And show/hide sprites as needed so a new game starts clean.

### Atmosphere extras (only if time)

- Loop a quiet drone under green flag: `play sound […] until done` in a `forever`
- Footsteps: when key pressed → play short sound
- Flicker: `repeat (6) { hide; wait (0.05); show; wait (0.05) }` on monster when game starts

### End Session 3 when…

Full loop works: move → threat → escape **or** caught → green flag to try again.

---

## Mentoring script

- During: “What should happen when you touch the door?”
- Stuck: “Want me to find the block, or want a hint?”
- Closing: “Want to scare someone with what you made?”

## Stretch (Session 4+)

Only if she asks: title screen “Do you dare…?”, second room (second backdrop + teleport), both chase **and** jump scare.

Next: [Share with family](04-share.md)
