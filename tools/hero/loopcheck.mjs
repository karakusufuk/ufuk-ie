// Dark-only loop checks. node loopcheck.mjs [baseUrl]
//  1. luminance of every clip that may play after the blur, and of the loop file over time (mean luma 0-255, threshold 90)
//  2. contrast of the headline pink over every loop frame, with the overlay value the page really has at that moment
//     (0 while line 1 is typed, rising to 0.7 at the last letter, 0.7 afterwards)
//  3. the loop's restart: the step from the last to the first frame against an ordinary crossfade step
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { order } from './scenes.mjs';
const here = path.dirname(new URL(import.meta.url).pathname);
const base = (process.argv[2] || 'http://localhost:8101').replace(/\/?$/, '/');
const loopFile = path.join(here, '../../site/img/hero-loop.mp4');
let bad = 0; const ok = (c, m) => { console.log((c ? 'pass  ' : 'FAIL  ') + m); if (!c) bad++; };
const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const rl = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const PINK = rl(0xF7, 0xD2, 0xDE), cr = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

// geometry of the headline inside the hero frame and the typing timeline of the page
const br = await chromium.launch({ channel: 'chrome' });
const ctx = await br.newContext({ viewport: { width: 1440, height: 900 } }); const pg = await ctx.newPage();
await pg.addInitScript(() => { window.__tl = { blur: 0, l1: 0, done: 0 }; addEventListener('herotype', () => { window.__tl.blur = performance.now(); }); document.addEventListener('DOMContentLoaded', () => { const h = document.getElementById('headline'); new MutationObserver(() => { const c = [...h.querySelectorAll('.ln')].map((l) => l.querySelectorAll('.ch.v').length); if (!window.__tl.l1 && c[0] === 23) window.__tl.l1 = performance.now(); if (!window.__tl.done && c[0] === 23 && c[1] === 28) window.__tl.done = performance.now(); }).observe(h, { subtree: true, attributes: true, attributeFilter: ['class'] }); }); });
await pg.goto(base + 'index.html');
await pg.waitForFunction(() => window.__tl.done > 0, null, { timeout: 90000, polling: 200 });
const info = await pg.evaluate(() => { const s = document.getElementById('stage').getBoundingClientRect(), h = document.querySelector('#headline').getBoundingClientRect(); return { tl: window.__tl, fx0: (h.left - s.left) / s.width, fx1: (h.right - s.left) / s.width, fy0: (h.top - s.top) / s.height, fy1: (h.bottom - s.top) / s.height, introEnd: document.getElementById('vid').duration, green: parseFloat(document.getElementById('vid').dataset.green) }; });
await br.close();
const t1 = (info.tl.l1 - info.tl.blur) / 1000, t2 = (info.tl.done - info.tl.blur) / 1000, loopStart = info.introEnd - info.green + 0.03;   // the loop shows ~0.17-0.2 s after the blur
const overlayAt = (t) => (t <= t1 ? 0 : t >= t2 ? 0.7 : 0.7 * (t - t1) / (t2 - t1));          // t = seconds after the blur
console.log(`typing: line 1 done ${t1.toFixed(2)} s after the blur, last letter ${t2.toFixed(2)} s; the loop starts ${loopStart.toFixed(2)} s after the blur; headline box x ${(info.fx0 * 100).toFixed(0)}-${(info.fx1 * 100).toFixed(0)} % y ${(info.fy0 * 100).toFixed(0)}-${(info.fy1 * 100).toFixed(0)} % of the hero frame`);

// 1. clips and loop luminance
console.log('\n1. mean luma (0-255) of each clip that plays after the blur, and of the light-ground clips that stay in the sharp part:');
const luma = (file, extra = []) => { const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', file, ...extra, '-vf', 'fps=10,scale=64:36', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 28 }); const FS = 64 * 36 * 3, n = raw.length / FS, ls = []; for (let f = 0; f < n; f++) { let s = 0; for (let i = 0; i < 64 * 36; i++) { const o = f * FS + i * 3; s += 0.2126 * raw[o] + 0.7152 * raw[o + 1] + 0.0722 * raw[o + 2]; } ls.push(s / 2304); } return ls; };
const names = [...new Set(order.loop)];
for (const nm of names) { const l = luma(path.join(here, 'clips', nm + '.mp4'), ['-t', '2.3']); const m = l.reduce((a, b) => a + b, 0) / l.length; console.log(`   loop   ${nm.padEnd(14)} mean ${m.toFixed(0).padStart(3)}  (range ${Math.min(...l).toFixed(0)}-${Math.max(...l).toFixed(0)})`); ok(m <= 90 && Math.max(...l) <= 110, `${nm}: background is dark`); }
for (const nm of ['fennel', 'ashgrove', 'monument', 'garvey', 'garveyDark']) { const l = luma(path.join(here, 'clips', nm + '.mp4'), ['-t', '2.3']); console.log(`   excluded ${nm.padEnd(12)} mean ${(l.reduce((a, b) => a + b, 0) / l.length).toFixed(0).padStart(3)}  -> ${order.loop.includes(nm) ? 'IN THE LOOP' : 'not in the loop' + (order.intro.includes(nm) ? ' (sharp intro only)' : '')}`); ok(!order.loop.includes(nm), `${nm} is not in the loop`); }
const ll = luma(loopFile); ok(Math.max(...ll) <= 90, `every frame of hero-loop.mp4 has mean luma <= 90 (max ${Math.max(...ll).toFixed(0)}, min ${Math.min(...ll).toFixed(0)}, mean ${(ll.reduce((a, b) => a + b, 0) / ll.length).toFixed(0)})`);

// 2. headline contrast on every loop frame
console.log('\n2. contrast of the headline pink (#F7D2DE) over the blurred loop, 95th percentile of the pixels under the headline box:');
const W = 320, H = 180, FS = W * H * 3;
// the page shows the loop with filter: blur(9px) on a frame ~1340 px wide; the analysis frames are 320 px wide, so sigma = 9 x 320 / 1340 = 2.15
const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', loopFile, '-vf', `fps=10,scale=${W}:${H}:flags=lanczos,gblur=sigma=2.15:steps=3`, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 29 });
const n = raw.length / FS, X0 = Math.floor(W * (info.fx0 - 0.03)), X1 = Math.ceil(W * (info.fx1 + 0.03)), Y0 = Math.floor(H * (info.fy0 - 0.03)), Y1 = Math.ceil(H * (info.fy1 + 0.03));
const bgL = (f, o) => { const ls = []; for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) { const i = f * FS + (y * W + x) * 3; ls.push(rl(raw[i] * (1 - o), raw[i + 1] * (1 - o), raw[i + 2] * (1 - o))); } ls.sort((a, b) => a - b); return ls[Math.floor(ls.length * 0.95)]; };
let share45 = 0; let worstFirst = 99, worstFirstAt = 0, worstSteady = 99, worstSteadyAt = 0, worstNoOverlay = 99;
for (let f = 0; f < n; f++) {
  const t = f / 10;
  const first = cr(PINK, bgL(f, overlayAt(loopStart + t)));                        // first pass through the loop, overlay as typed
  const second = cr(PINK, bgL(f, overlayAt(loopStart + 10 + t)));                  // second pass
  const steady = cr(PINK, bgL(f, 0.7)), none = cr(PINK, bgL(f, 0));
  if (first >= 4.5) share45 += 1 / n;
  if (Math.min(first, second) < worstFirst) { worstFirst = Math.min(first, second); worstFirstAt = t; }
  if (steady < worstSteady) { worstSteady = steady; worstSteadyAt = t; }
  worstNoOverlay = Math.min(worstNoOverlay, none);
}
console.log(`   frames checked: ${n} (every 0.1 s of the ${(n / 10).toFixed(0)} s loop)`);
console.log(`   worst contrast while the headline is typed (overlay as at that moment, passes 1 and 2): ${worstFirst.toFixed(1)}:1 at loop t=${worstFirstAt.toFixed(1)} s`);
console.log(`   worst contrast once the overlay is at 70 %: ${worstSteady.toFixed(1)}:1 at loop t=${worstSteadyAt.toFixed(1)} s   (no overlay at all, worst case: ${worstNoOverlay.toFixed(1)}:1)`);
ok(worstFirst >= 3, `headline contrast >= 3:1 (WCAG AA for large text; the headline is 54-84 px) over every loop frame while it is typed; ${(100 * share45).toFixed(0)} % of the frames are >= 4.5:1`);
ok(worstSteady >= 7, 'headline contrast >= 7:1 over every loop frame with the 70 % overlay');

// 3. restart
const step = (a, b) => { let s = 0; for (let i = 0; i < W * H * 3; i += 3) s += Math.abs(raw[a * FS + i] - raw[b * FS + i]); return s / (W * H); };
const rawFull = execFileSync('ffmpeg', ['-v', 'error', '-i', loopFile, '-vf', 'scale=160:90,format=gray', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 28 }); const G = 160 * 90, nf = rawFull.length / G;
const d = (a, b) => { let s = 0; for (let i = 0; i < G; i++) s += Math.abs(rawFull[a * G + i] - rawFull[b * G + i]); return s / G; };
const steps = []; for (let i = 1; i < nf; i++) steps.push(d(i - 1, i)); const wrap = d(nf - 1, 0);
const fadeSteps = steps.slice().sort((a, b) => b - a).slice(0, 12), maxStep = steps.reduce((a, b) => Math.max(a, b), 0);
console.log(`\n3. restart: last -> first frame step ${wrap.toFixed(2)}; the largest ordinary step inside the file (a crossfade frame) ${maxStep.toFixed(2)}; median step ${steps.slice().sort((a, b) => a - b)[steps.length >> 1].toFixed(2)}`);
ok(wrap <= maxStep * 1.05, 'the restart is no bigger a step than the crossfade steps inside the file (no visible jump)');
await br.close().catch(() => {});
console.log(bad ? '\n' + bad + ' FAILED' : '\nall loop checks passed');
process.exit(bad ? 1 : 0);
