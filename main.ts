// Leonida Trophy Guide — the entry program (Node 22, standard library only).
//
// The guide itself is plain static files in app/: index.html, its modules and
// styles, and app/data/trophies.json with the 55 trophies and their guides.
// It needs no build step and loads nothing over the network, so handing it in
// is a copy: app/ and screenshots/ go to /output, and /output/dossier.json
// is written with the kit's vendored library, buildDossier. That library is
// the scorer's own copy, so the dossier here and the dossier there agree
// byte for byte. vendor/makefun-frontend.ts is left exactly as the kit ships it.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps: text_max_bytes shapes the dossier text; the rest
// refuse an entry the scorer would refuse anyway (more than 4 screenshots or
// one over 256 KiB; app/ past 993 files and directories or 48 MiB — app/
// counts beside /output's own 1,000-entry cap, its screenshots/ and dossier.json).
// The same caps apply when the program runs twice: both runs must write the
// same bytes, and this program writes nothing that depends on the time or
// the machine, so they do.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
