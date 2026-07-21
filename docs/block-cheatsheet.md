# Scratch block cheat sheet (horror)

Quick finds while she drives the mouse.

## Motion (blue)

| Block | Use |
| --- | --- |
| `change x by` / `change y by` | Arrow-key walking |
| `point towards [Hero]` | Chase |
| `move (3) steps` | Chase speed |
| `go to x: y:` | Reset positions on green flag |

## Looks (purple)

| Block | Use |
| --- | --- |
| `switch backdrop to` | Haunted / escaped / caught |
| `show` / `hide` | Jump scare appear |
| `set size to (150) %` | Boo moment |
| `say (Help!) for (2) seconds` | Optional dialogue |

## Sound (pink)

| Block | Use |
| --- | --- |
| `play sound […] until done` | Scream, drone |
| `start sound […]` | Footsteps while moving |

## Events (yellow)

| Block | Use |
| --- | --- |
| `when green flag clicked` | Start / reset |
| `broadcast (boo)` / `when I receive (boo)` | Jump scare signal |
| `broadcast (escaped)` / `(caught)` | Endings |

## Control (orange)

| Block | Use |
| --- | --- |
| `forever` | Always check keys / chase |
| `if < > then` | Key pressed / touching |
| `wait (0.1) seconds` | Slow a chase |
| `stop [all]` | Freeze on win/lose |
| `repeat (6)` | Light flicker |

## Sensing (light blue)

| Block | Use |
| --- | --- |
| `key (arrow) pressed?` | Movement |
| `touching [Monster]?` | Caught |
| `touching [Exit]?` | Escaped |

## Suggested first build order

1. Hero movement  
2. Chase **or** jump scare  
3. Exit win  
4. Touch monster lose  
5. Sounds + ending backdrops  
