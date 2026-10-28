// Picks the loop order that keeps the headline readable while the overlay is still low (brute force over the 5 clips).
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const here = path.dirname(new URL(import.meta.url).pathname);
const names = (process.argv[2] || 'bawn,midland,reilly,brennockNight,lear').split(',');
const T1 = +(process.argv[3] || 3.9), T2 = +(process.argv[4] || 12.3), LOOP0 = 0.2;
const W = 320, H = 180, FS = W * H * 3;
const fx0 = 0.17, fx1 = 0.83, fy0 = 0.40, fy1 = 0.60;           // the headline box inside the hero frame (as measured by loopcheck)
const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const rl = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const PINK = rl(0xF7, 0xD2, 0xDE);
const overlayAt = (t) => (t <= T1 ? 0 : t >= T2 ? 0.7 : 0.7 * (t - T1) / (T2 - T1));
const clipFrames = {};
for (const nm of names) {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-ss', '0.15', '-i', path.join(here, 'clips', nm + '.mp4'), '-t', '2.0', '-vf', `fps=10,scale=${W}:${H}:flags=lanczos,gblur=sigma=2.15:steps=3`, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 28 });
  const n = raw.length / FS, fr = [];
  for (let f = 0; f < n; f++) { const px = []; for (let y = Math.floor(H * fy0); y < Math.ceil(H * fy1); y++) for (let x = Math.floor(W * fx0); x < Math.ceil(W * fx1); x++) { const i = f * FS + (y * W + x) * 3; px.push([raw[i], raw[i + 1], raw[i + 2]]); } fr.push(px); }
  clipFrames[nm] = fr;
}
const p95 = (px, o) => { const l = px.map(([r, g, b]) => rl(r * (1 - o), g * (1 - o), b * (1 - o))).sort((a, b) => a - b); return l[Math.floor(l.length * 0.95)]; };
const worst = (order) => { let w = 99, at = ''; for (let pass = 0; pass < 2; pass++) order.forEach((nm, k) => clipFrames[nm].forEach((px, f) => { const t = pass * order.length * 2 + k * 2 + f / 10 + LOOP0; const c = (PINK + 0.05) / (p95(px, overlayAt(t)) + 0.05); if (c < w) { w = c; at = `${nm} @${t.toFixed(1)}s`; } })); return { w, at }; };
const perms = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p])));
const res = perms(names).map((o) => ({ o, ...worst(o) })).sort((a, b) => b.w - a.w);
for (const r of res.slice(0, 6)) console.log(r.w.toFixed(2) + ':1', r.o.join(' > '), '  worst at', r.at);
console.log('current:', worst(names).w.toFixed(2) + ':1', names.join(' > '));
