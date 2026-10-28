// Records one scene of a live site as a constant-30fps clip (high-quality intermediate, H.264 CRF 12).
// Frames come from Chrome's screencast (JPEG, with timestamps) and are laid out on a 30 fps timeline with ffmpeg.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

export const W = 1600, H = 900, FPS = 30;
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let browser;
export async function open() { browser = await chromium.launch({ channel: 'chrome' }); return browser; }
export async function close() { if (browser) await browser.close(); }

/**
 * scene = { name, url, setup(page), act(page, mark), seconds }
 *   setup: runs before recording (load, scroll, wait until the scene is ready and still)
 *   act:   runs while recording; call mark(label) to note the moment of an event
 * returns { file, frames, marks }
 */
export async function record(scene, outDir, { quality = 94 } = {}) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, serviceWorkers: 'block', ignoreHTTPSErrors: !!scene.ignoreHTTPSErrors });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(scene.url, { waitUntil: 'networkidle' }).catch(async () => { await page.goto(scene.url, { waitUntil: 'load' }); });
  if (!scene.keepScroll) await page.addStyleTag({ content: 'html,body{scroll-snap-type:none!important;scroll-behavior:auto!important}' });
  await scene.setup(page);
  const frames = [];
  await page.screencast.start({ onFrame: (f) => frames.push({ t: f.timestamp / 1000, data: f.data }), size: { width: W, height: H }, quality });
  const t0 = Date.now();
  const marks = {};
  const mark = (label) => { marks[label] = (Date.now() - t0) / 1000; };
  await scene.act(page, mark);
  const total = scene.total || scene.seconds;
  const left = total * 1000 - (Date.now() - t0);
  if (left > 0) await sleep(left);
  await page.screencast.stop();
  await ctx.close();
  if (!frames.length) throw new Error('no frames for ' + scene.name);
  // lay the frames on a 30 fps timeline
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rec-'));
  const base = frames[0].t;
  const list = [];
  frames.forEach((f, i) => { const file = path.join(dir, String(i).padStart(5, '0') + '.jpg'); fs.writeFileSync(file, f.data); const next = i + 1 < frames.length ? frames[i + 1].t : base + total; list.push(`file '${file}'\nduration ${Math.max(0.001, next - f.t).toFixed(4)}`); });
  list.push(`file '${path.join(dir, String(frames.length - 1).padStart(5, '0') + '.jpg')}'`);
  fs.writeFileSync(path.join(dir, 'list.txt'), list.join('\n'));
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, scene.name + '.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'list.txt'), '-vf', `fps=${FPS},scale=${W}:${H}:flags=lanczos,format=yuv420p`, '-t', String(total), '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-r', String(FPS), file + '.full.mp4']);
  // trim to the wanted length; scene.trim(marks) says where the shot starts inside the recording
  const start = scene.trim ? Math.max(0, scene.trim(marks)) : 0;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', start.toFixed(3), '-i', file + '.full.mp4', '-frames:v', String(Math.round(scene.seconds * FPS)), '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-r', String(FPS), '-pix_fmt', 'yuv420p', file]);
  fs.rmSync(file + '.full.mp4', { force: true });
  fs.rmSync(dir, { recursive: true, force: true });
  return { file, frames: frames.length, marks, errors, span: frames[frames.length - 1].t - base, start };
}
