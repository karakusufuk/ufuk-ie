// Measures a hero video: finds every crossfade (a run of frames whose blend with the next shot is changing), reports its
// centre, width and the on-screen length of every shot, and flags frames that are not part of a clean fade.
import { execFileSync } from 'node:child_process';
const [video, expectArg] = process.argv.slice(2);
const W = 96, H = 54;
const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', video, '-vf', `scale=${W}:${H},format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 29 });
const fs = W * H, n = raw.length / fs;
const fr = (i) => raw.subarray(i * fs, (i + 1) * fs);
const diff = (a, b) => { let s = 0; for (let i = 0; i < fs; i++) s += Math.abs(a[i] - b[i]); return s / fs; };
// 1) per-frame diff to the previous frame
const d = [0]; for (let i = 1; i < n; i++) d.push(diff(fr(i - 1), fr(i)));
// 2) a crossfade is detected by the "cut distance": difference between frame i-4 and i+4 is large while the neighbours inside the shots are alike;
//    simpler and robust: for each frame, distance to frame k frames earlier vs later; the join centre maximises min(dist(i-9,i), dist(i,i+9)) ... use A/B reference frames
const FADEF = Math.round(0.3 * 30);                               // 9 frames
const score = []; for (let i = 0; i < n; i++) { const a = Math.max(0, i - FADEF), b = Math.min(n - 1, i + FADEF); score.push(Math.min(diff(fr(a), fr(i)), diff(fr(i), fr(b)))); }
const peaks = []; for (let i = 2; i < n - 2; i++) if (score[i] > 12 && score[i] >= score[i - 1] && score[i] >= score[i + 1] && !peaks.some((p) => Math.abs(p - i) < 30)) peaks.push(i);
console.log(`${video.split('/').pop()}: ${n} frames, ${(n / 30).toFixed(3)} s`);
console.log('join centres (s):', peaks.map((p) => (p / 30).toFixed(2)).join(' '));
const cut = [0, ...peaks, n]; const lens = []; for (let i = 1; i < cut.length; i++) lens.push((cut[i] - cut[i - 1]) / 30);
console.log('shot lengths (s):', lens.map((l) => l.toFixed(2)).join(' '));
// 3) frame-to-frame jumps: any single-frame change much larger than its neighbours' (a hard cut or a stray frame) outside real in-shot motion
const med = [...d].sort((a, b) => a - b)[Math.floor(n / 2)];
const jumps = []; for (let i = 2; i < n - 1; i++) if (d[i] > 14 && d[i] > 3.2 * Math.max(d[i - 1], d[i + 1], 1)) jumps.push(`${(i / 30).toFixed(2)}s(${d[i].toFixed(1)})`);
console.log('single-frame jumps (hard cuts / stray frames):', jumps.length ? jumps.join(' ') : 'none', '| median frame diff', med.toFixed(2));
const first = d.slice(1).reduce((m, v) => Math.max(m, v), 0); console.log('largest frame-to-frame change', first.toFixed(1));
