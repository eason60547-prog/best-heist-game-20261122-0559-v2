# Midnight Vault — Design Notes

An original 2D top-down heist game. One thief, one bank, four floors, one
getaway van. Everything in the game — maps, AI, sound — is written for this
bounty; no asset, name, or level is copied from another game.

## The fantasy

You are the crew's inside hand. The bank is dark, the guards are bored, and
the vault is full. The job is not a shootout: it is a route. Every floor asks
the same three questions — *which way in, what do I grab, how do I leave* —
and punishes a wrong answer with a rising alarm, not a health bar.

## The loop

1. **Read the room.** Guards patrol fixed routes with visible vision cones;
   cameras sweep theirs. Standing still and watching costs nothing and is the
   strongest move in the game.
2. **Take the loot.** Cash $250, gold $500, jewel $1,000. Walk over it to grab
   it. The exit stays locked until the floor's target is met, so the player
   must choose a route that collects enough without crossing every cone.
3. **Leave.** Reach the green EXIT before the countdown ends. Clearing a floor
   pays a time bonus ($10 per second left) and a $500 ghost bonus if nobody
   ever spotted the player on that floor.

Three lives. Get grabbed and the floor restarts with one life gone. Run out
of time and the job is blown the same way.

## Floors and the difficulty curve

| Floor | Target | Time | Guards | Cameras | Lasers | What changes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 — Lobby | $1,000 | 2:00 | 2 | 1 | — | Learn to move, sneak, and read cones. Wide corridors, loot in the open. |
| 2 — Vault Hall | $2,000 | 2:30 | 3 | 2 | — | Two cameras cover the middle; patrols cross, so waiting matters. |
| 3 — The Vault | $3,000 | 3:00 | 3 | 3 | 2 | **Lasers arrive.** Beams cycle on/off; the player must time crossings. |
| 4 — The Rooftop Vault | $4,000 | 3:30 | 4 | 3 | 3 | Everything at once: four guards, three cameras, three laser grids, and only $500 of slack loot — nearly every grab is mandatory. |

Difficulty rises on four axes at once, never on one alone: more eyes
(guards + cameras), faster patrols (1.5 → 2.4 tiles/s), tighter loot slack
($3,500 → $500), and a new system per late floor. Floor 3 teaches lasers
with two short beams in wide corridors; Floor 4 puts a beam across the
corridor that guards the jewel, so the player must cross it or go the long
way around through two more cones. The timer is generous on purpose — the
pressure should come from the patrols, not the clock.

## Guard AI: patrol, hear, chase

Guards have three states, and the player can read all three at a glance:
patrol (red `!`, dim cone), investigate (amber `?`, amber cone), chase
(bright red `!`, bright cone).

- **Patrol.** Walk a fixed waypoint loop, pausing 0.7 s at each corner. The
  pause is deliberate: it is the window the player uses to slip behind.
- **Hear / investigate.** Running footsteps are loud. Every half-second of
  running emits a noise pulse (radius ~150 px, drawn as an expanding gold
  ring). Any guard inside the radius leaves patrol and walks to the exact
  spot the sound came from, at 1.3× patrol speed. On arrival the guard
  stands and scans — rotating in place for 1.4 s — then gives up and returns
  to the *nearest* waypoint of its route, not the one it left, so patrols
  desynchronise after every investigation and no two runs play the same.
  If the guard cannot reach the noise at all (walled off), it gives up after
  4 s instead of standing there forever.
  Grabbing a jewel makes the same kind of noise (a clink, radius ~130 px):
  the most valuable loot is also the loudest. Sneaking (hold Shift) makes
  no noise at all and shrinks the player's detection radius — slow, silent,
  safe.
- **Chase.** A guard whose cone actually sees the player chases at 1.55×
  patrol speed and updates its target to the player's position every frame.
  It gives up if the player gets 260 px away or the alert falls below 25.
  Being caught is a grab, not damage: one life, floor restarts.

This makes sound a real resource. Sprinting across an empty corridor is
free; sprinting past a guard's back is a gamble the player chose. The `?`
state is the game's fair warning: the guard is suspicious, not omniscient,
and a player who freezes or breaks line of sight can still ghost the floor.

## Cameras and lasers

- **Cameras** are fixed posts with a sweeping cone (sine sweep, per-camera
  base angle, sweep width, and speed). They cannot chase, but they raise the
  alert just like a guard's eyes, and at 100% alert every guard hunts. Their
  cones are purple so the player can tell machine vision from guard vision
  instantly.
- **Laser grids** (Floors 3–4) are beams between two emitter posts. Each
  beam cycles on a fixed period (2.2–2.8 s) with its own phase, live about
  half the time. A live beam is bright red with a glow; a dark beam is a
  faint dashed line with visible emitters, so the player can plan the
  crossing while it is safe. Crossing a live beam adds +30 alert, flashes
  the screen red, plays a zap, voids the ghost bonus, and sends the nearest
  guard to investigate the beam. There is a 1.2 s per-beam cooldown so one
  crossing is one mistake, not a death spiral. Lasers never kill: they cost
  stealth, which is the game's real currency.

## The alert meter

One shared meter, 0–100, shown in the HUD as CALM / SUSPICIOUS / HUNTED /
ALARM!. Vision adds to it in proportion to closeness (closer = faster);
silence drains it at 14/s. At 100 the alarm sounds and all guards chase
until it falls back under 40. The meter is the game's memory: a player who
is seen once and hides is punished briefly; a player who keeps blundering
into cones is punished permanently.

## Look: readable before pretty

Dark navy floors, pale walls, and four colours that each mean one thing:
gold is the player and the loot, red is guard vision, purple is camera
vision, green is the exit. Nothing else competes with those four. Vision
cones are drawn under everything so the threat is visible before the guard
is. A radial vignette keeps the edges dark and the player's attention in
the middle of the room. Sneaking draws a dashed ring around the thief so
the player always knows which mode they are in.

## Sound

All sound is synthesized with the Web Audio API (oscillator beeps, no audio
files, no network): coin, gold arpeggio, spot sting, alarm, exit fanfare,
laser zap, and a soft blip when a guard hears something. `M` mutes.

## Structure

`game/index.html` is the whole game (vanilla canvas, no libraries): ASCII
level maps at the top, then state, audio, movement/collision, hearing and
laser systems, guard AI, rendering, and a `?shot=` staging hook the
screenshots were taken with. `main.ts` hands the entry in. `DESIGN.md`
(this file) is the design record.
