// Checks that the intro opens on the truck with its headlights OFF and that they come ON during the first shot.
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
const video = process.argv[2];
const frame = async (t) => sharp(execFileSync('ffmpeg', ['-v', 'error', '-ss', String(t), '-i', video, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], { maxBuffer: 1 << 26 })).removeAlpha();
const late = await (await frame(2.3)).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = late.info;
// lamps = the brightest small spots in the lower front of the truck in the late frame
const box = { x0: 700, x1: 1300, y0: 470, y1: 700 };
let best = [];
for (let y = box.y0; y < box.y1; y += 2) for (let x = box.x0; x < box.x1; x += 2) { const i = (y * W + x) * 3; const l = 0.299 * late.data[i] + 0.587 * late.data[i + 1] + 0.114 * late.data[i + 2]; best.push([l, x, y]); }
best.sort((a, b) => b[0] - a[0]);
const spots = []; for (const b of best) { if (spots.length >= 2) break; if (spots.every((s) => Math.hypot(s[1] - b[1], s[2] - b[2]) > 120)) spots.push(b); }
console.log('lamp spots (late frame):', spots.map((s) => `(${s[1]},${s[2]}) L=${s[0].toFixed(0)}`).join('  '));
const lum = async (t, s) => { const { data, info } = await (await frame(t)).raw().toBuffer({ resolveWithObject: true }); let sum = 0, n = 0; for (let y = s[2] - 14; y <= s[2] + 14; y++) for (let x = s[1] - 14; x <= s[1] + 14; x++) { const i = (y * info.width + x) * 3; sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]; n++; } return sum / n; };
for (const t of [0, 0.4, 0.8, 1.2, 1.6, 2.0, 2.3]) console.log('t=' + t.toFixed(1).padStart(3), 'lamp luminance', (await Promise.all(spots.map((s) => lum(t, s)))).map((v) => v.toFixed(0)).join(' / '));
