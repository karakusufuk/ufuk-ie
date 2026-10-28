// Records the Midland Motors card for the grid from the live site (run: node midland-card.mjs).
// Still: the workshop diagram on the Audi A4 page, default selection, info open.
// Hover: pointer over the bonnet, a door, the other door, the boot lid; trimmed so frame 0 equals the still and the very next frame already moves.
// Output: ../site/img/g_midland.jpg (1440x900) and ../site/img/h_midland.mp4 (960x600, 30 fps, H.264 like the other h_*.mp4).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { chromium } from 'playwright';

const here = path.dirname(new URL(import.meta.url).pathname);
const img = path.join(here, '../site/img');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'midland-card-'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const URL_ = 'https://midland.ufuk.ie/cars/2022-audi-a4-s-line/';

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: tmp, size: { width: 1440, height: 900 } } });
const tCreated = Date.now();
const page = await ctx.newPage();
await page.goto(URL_, { waitUntil: 'networkidle' });
await sleep(800);
await page.evaluate(() => window.scrollTo(0, 1096));
await sleep(1800);
// stops along the belt line of the car (above the wheels), front to back: bonnet, front door, rear door, boot lid
const z = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('svg.iso path.hit')].map((h) => { const b = h.getBoundingClientRect(); return [h.getAttribute('data-z'), { x: b.x, y: b.y, w: b.width, h: b.height }]; })));
const at = (n, fx, fy) => ({ n, x: z[n].x + z[n].w * fx, y: z[n].y + z[n].h * fy });
const stops = [at('engine', 0.55, 0.2), at('doorFL', 0.5, 0.2), at('doorRL', 0.5, 0.2), at('rear', 0.25, 0.55)];
for (const s of stops) { const hit = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e && e.getAttribute('data-z'); }, [s.x, s.y]); if (hit !== s.n) throw new Error(`stop ${s.n} lands on ${hit}`); }
const rest = { x: stops[0].x + 50, y: stops[0].y - 75 };      // just above the bonnet, on no zone
const restHit = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e && e.getAttribute && e.getAttribute('data-z'); }, [rest.x, rest.y]);
if (restHit) throw new Error('resting point is on zone ' + restHit);
await page.mouse.move(rest.x, rest.y);
await sleep(900);
fs.writeFileSync(path.join(tmp, 'still.png'), await page.screenshot());
const tMove = Date.now();
const glide = async (to, ms) => { await page.mouse.move(to.x, to.y, { steps: Math.round(ms / 16) }); };
for (const s of stops) { await glide(s, 420); await sleep(1000); }
await sleep(400);
await ctx.close();
const webm = await page.video().path();
await browser.close();

await sharp(path.join(tmp, 'still.png')).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(img, 'g_midland.jpg'));

// find the first frame of real change near the moment the pointer started (consecutive-frame differences, 30 fps)
const fr = path.join(tmp, 'f'); fs.mkdirSync(fr);
execFileSync('ffmpeg', ['-v', 'error', '-i', webm, '-vf', 'fps=30,scale=480:-1', path.join(fr, '%05d.png')]);
const files = fs.readdirSync(fr).sort();
const px = async (i) => sharp(path.join(fr, files[i])).raw().toBuffer();
const dif = (a, b) => { let d = 0; for (let i = 0; i < a.length; i += 3) if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 24) d++; return d; };
const guess = Math.round(((tMove - tCreated) / 1000) * 30);
let start = -1, prev = await px(Math.max(1, guess - 45));
const log = [];
for (let i = Math.max(2, guess - 44); i < Math.min(files.length, guess + 60); i++) { const cur = await px(i); const d = dif(prev, cur); log.push(d); if (d > 40 && start < 0) start = i; prev = cur; }
console.log('frames', files.length, 'expected move near frame', guess, 'first change at frame', start, 'diffs', log.slice(0, 40).join(' '));
if (start < 0) throw new Error('could not locate the hover start');
const from = (start - 1) / 30;                                    // the last unchanged frame is frame 0 of the clip
const out = path.join(img, 'h_midland.mp4');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', webm, '-ss', from.toFixed(3), '-t', '6.1', '-vf', 'scale=960:600:flags=lanczos,fps=30', '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'veryfast', '-crf', '27', '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', out]);
console.log('written', out, fs.statSync(out).size, 'bytes');
fs.rmSync(tmp, { recursive: true, force: true });
