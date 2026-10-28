// Finds the full-green frames of a video: node green.mjs <video>   (lime = the Tierney green)
import { execFileSync } from 'node:child_process';
const v = process.argv[2], W = 160, H = 90;
const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', v, '-vf', `scale=${W}:${H}`, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 29 });
const FS = W * H * 3, n = raw.length / FS;
const ref = [raw[(n - 1) * FS], raw[(n - 1) * FS + 1], raw[(n - 1) * FS + 2]];       // the last frame is solid green
let first = -1; const frac = [];
for (let f = 0; f < n; f++) { let ok = 0; for (let i = 0; i < W * H; i++) { const o = f * FS + i * 3; if (Math.abs(raw[o] - ref[0]) < 14 && Math.abs(raw[o + 1] - ref[1]) < 14 && Math.abs(raw[o + 2] - ref[2]) < 14) ok++; } frac.push(ok / (W * H)); if (first < 0 && ok === W * H) first = f; }
console.log('green colour', ref.join(','), 'frames', n);
console.log('fraction of green pixels every 3rd frame:', frac.filter((_, i) => i % 3 === 0).map((x) => x.toFixed(2)).join(' '));
console.log('first fully solid frame:', first, first >= 0 ? (first / 30).toFixed(3) + ' s' : 'NONE', '| solid frames:', frac.filter((x) => x === 1).length);
