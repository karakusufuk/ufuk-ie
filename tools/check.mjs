// Regenerates the 11 project pages into a temp folder and compares them byte for byte with ../site.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const here = path.dirname(new URL(import.meta.url).pathname);
const site = path.join(here, '../site');
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'ufuk-check-'));
execFileSync('node', [path.join(here, 'build.mjs'), out], { stdio: 'inherit', env: { ...process.env, MEDIA: path.join(site, 'img/d') } });

let bad = 0, n = 0;
for (const f of fs.readdirSync(out).filter((f) => f.endsWith('.html'))) {
  n++;
  const a = fs.readFileSync(path.join(out, f));
  const bPath = path.join(site, f);
  if (!fs.existsSync(bPath) || !a.equals(fs.readFileSync(bPath))) { console.error('DIFFERS: ' + f); bad++; }
}
fs.rmSync(out, { recursive: true, force: true });
console.log(bad ? `${bad} of ${n} pages differ` : `OK: ${n} pages byte-identical`);
process.exit(bad ? 1 : 0);
