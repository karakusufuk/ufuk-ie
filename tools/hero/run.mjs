// node run.mjs <scene>...   records the scenes into ./clips and prints a contact sheet path for each
import path from 'node:path';
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import * as R from './recorder.mjs';
import { scenes } from './scenes.mjs';
const here = path.dirname(new URL(import.meta.url).pathname);
const out = path.join(here, 'clips');
await R.open();
for (const n of process.argv.slice(2)) {
  const r = await R.record(scenes[n], out);
  console.log(n, 'frames', r.frames, 'span', r.span.toFixed(2), 'marks', JSON.stringify(r.marks), r.errors.length ? 'ERRORS ' + r.errors : '');
  const dur = Math.round(scenes[n].seconds * 30) / 30, tiles = [];
  for (let i = 0; i < 8; i++) { const t = (dur - 0.1) * i / 7; tiles.push(await sharp(execFileSync('ffmpeg', ['-v', 'error', '-ss', t.toFixed(3), '-i', r.file, '-frames:v', '1', '-vf', 'scale=480:-1', '-f', 'image2pipe', '-vcodec', 'png', '-']), { limitInputPixels: false }).toBuffer()); }
  await sharp({ create: { width: 480 * 4, height: 270 * 2, channels: 3, background: '#000' } }).composite(tiles.map((t, i) => ({ input: t, left: (i % 4) * 480, top: Math.floor(i / 4) * 270 }))).png().toFile(path.join(out, n + '-sheet.png'));
}
await R.close();
