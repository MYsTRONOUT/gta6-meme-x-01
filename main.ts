// GTA 6 meme entry for make.fun (gta6-meme-x-01), Node 22, standard library only.
// The entry is the X post itself: this program only hands the house the post's
// address. It reads POST.json from the repository root, checks that it names an
// X post, and writes those exact bytes to /output/POST.json, where the gate
// reads them. The house then reads the post from X (its first picture and its
// text) and hands that to the judge. Nothing written here is judged.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand
// in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const botRoot = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outRoot = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const sourcePath = join(botRoot, 'POST.json');
const targetPath = join(outRoot, 'POST.json');

if (!existsSync(sourcePath)) {
  console.error(`no POST.json found in ${botRoot}`);
  process.exit(1);
}

const raw = readFileSync(sourcePath);
let parsed: unknown;
try {
  parsed = JSON.parse(raw.toString('utf8'));
} catch {
  console.error('POST.json is not valid JSON');
  process.exit(1);
}

const url = (parsed as { url?: unknown }).url;
if (typeof url !== 'string' || !/^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\//.test(url)) {
  console.error('POST.json must name an X post address in its url field');
  process.exit(1);
}

// The address's last path segment is the post's id, digits only; a query or
// fragment after it is read past by the gate, so strip those first.
const bare = url.split(/[?#]/)[0];
const statusId = bare.split('/').filter(Boolean).pop() ?? '';
if (!/^\d+$/.test(statusId)) {
  console.error('POST.json url must end in the post id (digits only)');
  process.exit(1);
}

mkdirSync(outRoot, { recursive: true });
// Write the exact bytes from the repository, not a re-serialised copy, so the
// file the gate reads is byte for byte the file that was entered.
writeFileSync(targetPath, raw);
