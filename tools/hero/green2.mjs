import { execFileSync } from 'node:child_process';
const v = process.argv[2], W = 400, H = 225;
const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', v, '-vf', `scale=${W}:${H}`, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 29 });
const FS = W * H * 3, n = raw.length / FS; const ref = [220, 255, 28];
for (let f = 55; f < Math.min(n, 90); f++) {
  let ok = 0, bx0 = W, bx1 = 0, by0 = H, by1 = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const o = f * FS + (y * W + x) * 3; const good = Math.abs(raw[o] - ref[0]) < 16 && Math.abs(raw[o + 1] - ref[1]) < 16 && Math.abs(raw[o + 2] - ref[2]) < 24; if (good) ok++; else { bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); by0 = Math.min(by0, y); by1 = Math.max(by1, y); } }
  console.log(f, (f / 30).toFixed(2) + 's', (ok / (W * H)).toFixed(4), ok === W * H ? 'SOLID' : `non-green bbox x${bx0}-${bx1} y${by0}-${by1}`);
}
