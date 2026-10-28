// Independent measurement of on-screen shot lengths: every frame of the final video is matched to the nearest frame of
// the source clips; the clip a frame resembles most is its shot. Crossfade frames switch at their middle.
// Usage: node shotlen.mjs <video> <intro|loop>
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { order } from './scenes.mjs';
const here = path.dirname(new URL(import.meta.url).pathname);
const [video, kind] = process.argv.slice(2);
const W = 48, H = 27, FS = W * H;
const grab = (file, extra = []) => execFileSync('ffmpeg', ['-v', 'error', '-i', file, ...extra, '-vf', `fps=30,scale=${W}:${H},format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 29 });
const vid = grab(video), n = vid.length / FS;
const names = order[kind], CLIP = 2.3;
const clips = names.map((nm) => { const b = grab(path.join(here, 'clips', nm + '.mp4'), ['-t', String(CLIP)]); return { nm, b, n: b.length / FS }; });
const label = [], resid = [];
for (let i = 0; i < n; i++) {
  const f = vid.subarray(i * FS, (i + 1) * FS); let best = Infinity, who = -1;
  clips.forEach((c, ci) => { for (let j = 0; j < c.n; j++) { let s = 0; const o = j * FS; for (let k = 0; k < FS; k++) s += Math.abs(f[k] - c.b[o + k]); if (s < best) { best = s; who = ci; } } });
  label.push(who); resid.push(best / FS);
}
// a crossfade frame matches no single clip (it is a blend of two), so its residual is high: runs of high residual are the fades,
// their middle is the join. Shot length = distance between two consecutive join centres (the first shot starts at 0, the last ends at the file's end).
const TH = 4.0, fades = [];
resid.forEach((r, i) => { if (r > TH) { const l = fades[fades.length - 1]; if (l && i - l.to <= 2) l.to = i; else fades.push({ from: i, to: i }); } });
const centres = fades.filter((f) => f.to - f.from >= 2).map((f) => ({ c: (f.from + f.to + 1) / 2 / 30, w: (f.to - f.from + 1) / 30 }));
console.log(`${video.split('/').pop()}: ${n} frames = ${(n / 30).toFixed(2)} s; residual of clean frames: median ${[...resid].sort((a, b) => a - b)[n >> 1].toFixed(2)}`);
console.log('crossfades (centre s, width s):', centres.map((c) => `${c.c.toFixed(2)} (${c.w.toFixed(2)})`).join('  '));
const edges = [0, ...centres.map((c) => c.c), n / 30];
const lens = []; for (let i = 1; i < edges.length; i++) lens.push(edges[i] - edges[i - 1]);
console.log('on-screen shot lengths (s):', lens.map((l) => l.toFixed(2)).join(' '));
// which clip is on screen in each shot (clean frames only)
const who = []; for (let i = 1; i < edges.length; i++) { const f0 = Math.round(edges[i - 1] * 30) + 6, f1 = Math.round(edges[i] * 30) - 6, cnt = {}; for (let j = f0; j < f1; j++) if (resid[j] <= TH) cnt[names[label[j]]] = (cnt[names[label[j]]] || 0) + 1; who.push(Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]?.[0]); }
console.log('shots:', who.join(' > '));
