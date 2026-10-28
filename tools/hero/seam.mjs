// Loop seam: the last frame of hero-loop.mp4 must follow on from the first (the last shot fades into the first).
import { execFileSync } from 'node:child_process';
const v = process.argv[2], W = 160, H = 90;
const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', v, '-vf', `scale=${W}:${H},format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 29 });
const fs = W * H, n = raw.length / fs, f = (i) => raw.subarray(i * fs, (i + 1) * fs);
const d = (a, b) => { let s = 0; for (let i = 0; i < fs; i++) s += Math.abs(a[i] - b[i]); return (s / fs).toFixed(2); };
console.log(`frames ${n}; wrap step (last -> first): ${d(f(n - 1), f(0))}; ordinary step in the middle: ${d(f(300), f(301))}, ${d(f(250), f(251))}; the frame before the last -> last: ${d(f(n - 2), f(n - 1))}`);
