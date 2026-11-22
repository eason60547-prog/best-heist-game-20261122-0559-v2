# Midnight Vault — a 2D top-down heist game

[![make.fun](https://make.fun/badge.svg)](https://make.fun/c/best-heist-game-20261122-0559)

**Midnight Vault** is an original 2D top-down heist game that runs offline in a
desktop browser. You are the crew's inside hand: slip into the bank after dark,
lift the loot, stay out of the guards' vision cones and the sweeping security
cameras, and reach the getaway exit before the alarm — or the clock — catches you.

## Play

Open `game/index.html` in a desktop browser (or run `node serve.ts` and open
http://localhost:8080). No install, no network, no account.

## How to play

- **Goal:** on each of the 4 floors, steal at least the target amount, then reach
  the green **EXIT**. The exit stays locked until you hit the target.
- **Loot:** cash **$250**, gold **$500**, jewel **$1,000** — walk over it to grab it.
- **Guards** patrol set routes and chase you when they spot you. **Cameras** sweep
  their vision cones back and forth. Getting spotted raises the **alert meter**;
  at 100% the alarm sounds and every guard hunts you.
- **Laser grids** (Floors 3–4) cycle on and off — cross only while the beam is
  dark. Tripping a live beam adds +30 alert and sends the nearest guard to
  investigate.
- **Sound matters:** running is loud — guards hear your footsteps and come to
  investigate the noise ("?"). Sneak (hold Shift) to move slower, silently, and
  shrink your detection radius. Grabbing a jewel clinks loudly too.
- **Timer:** each floor has a countdown. Run out of time and the job is blown.
- **Lives:** 3. Get grabbed by a guard and you lose a life and restart the floor.
- **Score:** loot + a time bonus per floor + a **$500 ghost bonus** if nobody ever
  spots you on that floor. Clear all 4 floors for the clean getaway.

## Controls

| Key | Action |
| --- | --- |
| W A S D / Arrow keys | Move |
| Shift (hold) | Sneak — slower, harder to spot |
| R | Restart the current floor |
| P | Pause |
| M | Mute sound |
| Enter | Start (from the title screen) |

## Floors

1. **Lobby** — target $1,000, 2:00, 2 guards, 1 camera
2. **Vault Hall** — target $2,000, 2:30, 3 guards, 2 cameras
3. **The Vault** — target $3,000, 3:00, 3 guards, 3 cameras, 2 laser grids
4. **The Rooftop Vault** — target $4,000, 3:30, 4 guards, 3 cameras, 3 laser grids

See [DESIGN.md](DESIGN.md) for the design notes: difficulty curve, guard AI
(patrol / hear-and-investigate / chase), laser and alert systems.

## What's inside

- `game/index.html` — the whole game: vanilla canvas, no libraries, no network
- `DESIGN.md` — design notes: level design, difficulty curve, guard AI
- `main.ts` — the make.fun entry program (Node 22): copies `game/` and
  `screenshots/` to the output and writes `dossier.json`
- `screenshots/` — 4 gameplay screenshots (the first is the cover)
- `serve.ts` — tiny local server for play-testing

## License

MIT — see [LICENSE](LICENSE).
