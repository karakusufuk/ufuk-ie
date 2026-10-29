// Records a scene of a live demo site as a constant-30fps mp4 for a detail page (node rec/run.mjs <scene>...).
// Frames come from Chrome's screencast (JPEG with timestamps) and are laid out on a 30 fps timeline with ffmpeg.
// A scene is { name, slug, url, width = 1440, height = 900, seconds, trimStart, setup(page), act(page, mark, ctx) }.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const here = path.dirname(new URL(import.meta.url).pathname);
export const SITE_IMG = path.join(here, '../../site/img/d');
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FPS = 30;

/** a calm, eased pointer move: from the current position to (x, y) in `ms` milliseconds */
export async function glideMouse(page, from, to, ms) {
  const t0 = Date.now(); const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  for (;;) {
    const t = Math.min(1, (Date.now() - t0) / ms), e = ease(t);
    await page.mouse.move(from.x + (to.x - from.x) * e, from.y + (to.y - from.y) * e);
    if (t >= 1) break;
    await sleep(8);
  }
  return to;
}

/** scroll the page smoothly from `from` to `to` px in `ms` ms (instant jumps, eased, driven inside the page) */
export const glideScroll = (page, from, to, ms, ease = 'inout') => page.evaluate(([from, to, ms, ease]) => new Promise((res) => {
  const f = ease === 'linear' ? (t) => t : (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const t0 = performance.now();
  (function s(now) { const t = Math.min(1, (now - t0) / ms); window.scrollTo({ top: from + (to - from) * f(t), behavior: 'instant' }); if (t < 1) requestAnimationFrame(s); else res(); })(t0);
}), [from, to, ms, ease]);

let browser;
export async function open() { browser = await chromium.launch({ channel: 'chrome' }); return browser; }
export async function close() { if (browser) await browser.close(); }

export async function record(scene, { outDir = path.join(SITE_IMG, scene.slug), quality = 92, crf = 26 } = {}) {
  const W = scene.width || 1440, H = scene.height || 900;
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, serviceWorkers: 'block', ignoreHTTPSErrors: !!scene.ignoreHTTPSErrors, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  if (!scene.fromLoad) {
    await page.goto(scene.url, { waitUntil: 'networkidle' }).catch(async () => { await page.goto(scene.url, { waitUntil: 'load' }); });
    await page.addStyleTag({ content: 'html{scroll-snap-type:none!important;scroll-behavior:auto!important}' });
  }
  await scene.setup(page);
  const frames = [];
  await page.screencast.start({ onFrame: (f) => frames.push({ t: f.timestamp / 1000, data: f.data }), size: { width: W, height: H }, quality });
  const t0 = Date.now(); const marks = {};
  const mark = (label) => { marks[label] = (Date.now() - t0) / 1000; };
  await scene.act(page, mark);
  const total = scene.total || scene.seconds;
  const left = total * 1000 - (Date.now() - t0); if (left > 0) await sleep(left);
  await page.screencast.stop(); await ctx.close();
  if (!frames.length) throw new Error('no frames for ' + scene.name);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rec-'));
  const base = frames[0].t, list = [];
  frames.forEach((f, i) => { const file = path.join(dir, String(i).padStart(5, '0') + '.jpg'); fs.writeFileSync(file, f.data); const next = i + 1 < frames.length ? frames[i + 1].t : base + total; list.push(`file '${file}'\nduration ${Math.max(0.001, next - f.t).toFixed(4)}`); });
  list.push(`file '${path.join(dir, String(frames.length - 1).padStart(5, '0') + '.jpg')}'`);
  fs.writeFileSync(path.join(dir, 'list.txt'), list.join('\n'));
  fs.mkdirSync(outDir, { recursive: true });
  const even = (n) => n - (n % 2);
  const full = path.join(dir, 'full.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'list.txt'), '-vf', `fps=${FPS},scale=${even(W)}:${even(H)}:flags=lanczos,format=yuv420p`, '-t', String(total), '-c:v', 'libx264', '-preset', 'slow', '-crf', '10', '-r', String(FPS), full]);
  const start = scene.trim ? Math.max(0, scene.trim(marks)) : (scene.trimStart || 0);
  const file = path.join(outDir, scene.name + '.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', start.toFixed(3), '-i', full, '-frames:v', String(Math.round(scene.seconds * FPS)), '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', String(crf), '-r', String(FPS), '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', file]);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-frames:v', '1', '-q:v', '4', path.join(outDir, scene.name + '.jpg')]);
  fs.rmSync(dir, { recursive: true, force: true });
  return { file, frames: frames.length, marks, errors };
}
