// Midnight Vault — entry point for the make.fun best-heist-game bounty.
//
// What this little program does, in one breath: it takes the finished game
// sitting in this repository (the `game` folder plus the `screenshots`
// folder), lays a fresh copy of both into a destination folder, and then
// asks the bundled make.fun library to describe that destination folder as
// a dossier file. Nothing here reaches the network and nothing here is
// random, so running it twice over the same repository writes the exact
// same bytes twice.
//
// Run it from the repository root like this:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Leave MAKEFUN_OUTPUT_DIR unset and the destination is /output.

import * as fs from "node:fs";
import * as path from "node:path";
import { buildDossier } from "./vendor/makefun-game.ts";

// Where the finished entry goes when the caller says nothing.
const FALLBACK_DESTINATION = "/output";

// The two folders of this repository that make up the entry.
const FOLDERS_TO_SHIP = ["game", "screenshots"] as const;

// The dossier's ceilings, written as arithmetic so the numbers read as
// what they mean instead of bare magic constants:
//   - 160 KiB of text in the dossier,
//   - at most four screenshots, each no bigger than 256 KiB,
//   - at most 993 files under game/, 48 MiB altogether,
//   - no single game path longer than a thousand bytes.
const DOSSIER_CEILINGS = {
  text_max_bytes: 160 * 1024,
  screenshots: { max: 4, max_bytes: 256 * 1024 },
  game_max_files: 1000 - 7,
  game_max_bytes: 48 * 1024 * 1024,
  game_path_max_bytes: 1000,
} as const;

// Pick the destination folder: the environment wins, otherwise the fallback.
function pickDestination(): string {
  const fromEnvironment = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnvironment !== undefined && fromEnvironment !== "") {
    return fromEnvironment;
  }
  return FALLBACK_DESTINATION;
}

// Copy one tree, entry by entry in sorted order, so the walk is the same
// on every machine and every run. Directories are made as they are met;
// files are copied byte for byte.
function mirrorTree(sourceRoot: string, targetRoot: string): void {
  fs.mkdirSync(targetRoot, { recursive: true });
  const entries = fs.readdirSync(sourceRoot, { withFileTypes: true });
  entries.sort((left, right) => (left.name < right.name ? -1 : left.name > right.name ? 1 : 0));
  for (const entry of entries) {
    const from = path.join(sourceRoot, entry.name);
    const to = path.join(targetRoot, entry.name);
    if (entry.isDirectory()) {
      mirrorTree(from, to);
    } else if (entry.isFile()) {
      fs.copyFileSync(from, to);
    }
  }
}

// Lay a fresh copy of one repository folder into the destination, clearing
// any copy an earlier run left behind first so stale files cannot linger.
function refreshFolder(repoRoot: string, destination: string, folder: string): void {
  const source = path.join(repoRoot, folder);
  if (!fs.existsSync(source)) {
    return;
  }
  const target = path.join(destination, folder);
  fs.rmSync(target, { recursive: true, force: true });
  mirrorTree(source, target);
}

function main(): void {
  const repoRoot = process.cwd();
  const destination = pickDestination();
  fs.mkdirSync(destination, { recursive: true });

  for (const folder of FOLDERS_TO_SHIP) {
    refreshFolder(repoRoot, destination, folder);
  }

  const dossierBytes = buildDossier(destination, DOSSIER_CEILINGS);
  fs.writeFileSync(path.join(destination, "dossier.json"), dossierBytes);
}

main();
