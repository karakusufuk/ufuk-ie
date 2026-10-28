// Frame-by-frame view of every join: node joins.mjs <video> <centre1,centre2,...> <out.png>
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
const [video, centres, out] = process.argv.slice(2);
const cs = centres.split(',').map(Number), N = 13, W = 220, Hh = 124;
const dur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video]).toString();
const rows = [];
for (const c of cs) {
  const t0 = c - 0.2;                                                  // 6 frames before, the centre, 6 after (30 fps)
  const tiles = [];
  for (let i = 0; i < N; i++) { const t = t0 + i / 30; const buf = execFileSync('ffmpeg', ['-v', 'error', '-ss', Math.max(0, t).toFixed(4), '-i', video, '-frames:v', '1', '-vf', `scale=${W}:${Hh}`, '-f', 'image2pipe', '-vcodec', 'png', '-'], { maxBuffer: 1 << 26 });
    // past the end of the file the loop continues with its first frames (seamless wrap)
    const wrapped = buf.length ? buf : execFileSync('ffmpeg', ['-v', 'error', '-ss', (t - dur).toFixed(4), '-i', video, '-frames:v', '1', '-vf', `scale=${W}:${Hh}`, '-f', 'image2pipe', '-vcodec', 'png', '-'], { maxBuffer: 1 << 26 });
    tiles.push(await sharp(wrapped).toBuffer()); }
  rows.push(tiles);
}
await sharp({ create: { width: N * W, height: rows.length * Hh, channels: 3, background: '#f0f' } }).composite(rows.flatMap((r, y) => r.map((t, x) => ({ input: t, left: x * W, top: y * Hh })))).png().toFile(out);
console.log(out, rows.length, 'joins x', N, 'frames');
