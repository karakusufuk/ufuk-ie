// Mean luminance (0-255, Rec.709 on the sRGB values) of every clip, over its frames, plus the contrast of the headline pink (#F7D2DE)
// over the clip once the 70 % black overlay is on (and with no overlay).  node luma.mjs <clip names...>
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const here = path.dirname(new URL(import.meta.url).pathname);
const W = 64, H = 36, FS = W * H * 3;
const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const rl = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const PINK = rl(0xF7, 0xD2, 0xDE);
const cr = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
for (const nm of process.argv.slice(2)) {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', path.join(here, 'clips', nm + '.mp4'), '-t', '2.3', '-vf', `fps=15,scale=${W}:${H}`, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 28 });
  const n = raw.length / FS; let sum = 0, mx = 0, mn = 255, maxRel = 0, sumRel = 0;
  for (let f = 0; f < n; f++) { let s = 0, sr = 0; for (let i = 0; i < W * H; i++) { const o = f * FS + i * 3, r = raw[o], g = raw[o + 1], b = raw[o + 2]; s += 0.2126 * r + 0.7152 * g + 0.0722 * b; sr += rl(r, g, b); } s /= W * H; sr /= W * H; sum += s; mx = Math.max(mx, s); mn = Math.min(mn, s); sumRel += sr; maxRel = Math.max(maxRel, sr); }
  // mean relative luminance after a 70 % black overlay = 0.3 x (in linear light the overlay scales sRGB values, approximated on sRGB values)
  console.log(`${nm.padEnd(10)} mean luma ${(sum / n).toFixed(0).padStart(3)}  range ${mn.toFixed(0)}–${mx.toFixed(0)}   pink contrast: no overlay (brightest frame) ${cr(PINK, maxRel).toFixed(1)}:1`);
}
