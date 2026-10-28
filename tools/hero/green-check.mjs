// Browser checks of the green curtain (Chrome, fresh context, 1440x900). node green-check.mjs [baseUrl]
//  A: per presented video frame (requestVideoFrameCallback) the blur state: sharp before the full-green frame, blurred from it; overlay/typing start on that moment.
//  B: screenshots around the green, with a sharpness number for each.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { chromium } from 'playwright';
const here = path.dirname(new URL(import.meta.url).pathname), out = path.join(here, '../../docs/green-check');
const base = (process.argv[2] || 'http://localhost:8101').replace(/\/?$/, '/');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let bad = 0; const ok = (c, m) => { console.log((c ? 'pass  ' : 'FAIL  ') + m); if (!c) bad++; };
const b = await chromium.launch({ channel: 'chrome' });

// ---------------------------------------------------------------- A
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
  await p.addInitScript(() => {
    window.__f = []; window.__t = {};
    addEventListener('herotype', () => { window.__t.herotype = performance.now(); });
    document.addEventListener('DOMContentLoaded', () => {
      const v = document.getElementById('vid'), st = document.getElementById('stage'), caret = document.querySelector('#headline .caret'), dim = document.getElementById('dim');
      const cb = (now, md) => { const cs = getComputedStyle(v); window.__f.push([md.mediaTime, st.classList.contains('blur'), cs.filter, st.classList.contains('loop'), now]); v.requestVideoFrameCallback(cb); };
      v.requestVideoFrameCallback(cb);
      new MutationObserver(() => { if (st.classList.contains('blur') && !window.__t.blur) window.__t.blur = performance.now(); if (st.classList.contains('loop') && !window.__t.loop) window.__t.loop = performance.now(); }).observe(st, { attributes: true, attributeFilter: ['class'] });
      new MutationObserver(() => { if (caret.classList.contains('live') && !window.__t.caret) window.__t.caret = performance.now(); }).observe(caret, { attributes: true, attributeFilter: ['class'] });
      new MutationObserver(() => { if (!window.__t.firstChar && document.querySelector('#headline .ch.v')) window.__t.firstChar = performance.now(); }).observe(document.getElementById('headline'), { subtree: true, attributes: true, attributeFilter: ['class'] });
    });
  });
  await p.goto(base + 'index.html');
  await p.waitForFunction(() => document.querySelector('#headline .caret').classList.contains('done'), null, { timeout: 90000, polling: 200 });
  const r = await p.evaluate(() => ({ f: window.__f, t: window.__t, green: parseFloat(document.getElementById('vid').dataset.green), dur: document.getElementById('vid').duration }));
  const g = r.green, frames = r.f;
  console.log(`video duration ${r.dur.toFixed(3)} s, data-green ${g}, ${frames.length} presented frames logged`);
  const before = frames.filter((x) => x[0] < g - 0.002), from = frames.filter((x) => x[0] >= g - 0.002 && !x[3]);
  ok(before.length > 300, `${before.length} frames before the full-green frame were logged`);
  ok(before.every((x) => !x[1] && x[2] === 'none'), 'every frame before the full-green frame is sharp (no .blur, filter none)');
  ok(from.length >= 1 && from[0][1] && /blur\(9px\)/.test(from[0][2]), `the first frame from the full-green frame on (mediaTime ${from[0] && from[0][0].toFixed(4)}) is blurred: ${from[0] && from[0][2]}`);
  ok(from.every((x) => x[1] && /blur\(9px\)/.test(x[2])), `all ${from.length} frames from the green frame to the end of the intro are blurred`);
  ok(Math.abs(from[0][0] - g) < 0.04, `the blur starts on the video's own full-green timestamp: ${from[0][0].toFixed(4)} vs ${g}`);
  const t = r.t;
  ok(Math.abs(t.herotype - t.blur) < 15, `typing is started in the same instant as the blur (${(t.herotype - t.blur).toFixed(1)} ms apart)`);
  ok(t.caret - t.blur < 40, `the headline caret goes live with the blur (${(t.caret - t.blur).toFixed(1)} ms later); first letter ${(t.firstChar - t.blur).toFixed(0)} ms after the blur`);
  ok(t.loop >= t.blur, `the loop video is shown after the blur started (${(t.loop - t.blur).toFixed(0)} ms later, when the intro ended)`);
  console.log(`      intro ended ${(r.dur - g).toFixed(3)} s after the full-green frame (hold)`);
  await ctx.close();
}
// ---------------------------------------------------------------- B
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
  await p.goto(base + 'index.html');
  const g = await p.evaluate(() => parseFloat(document.getElementById('vid').dataset.green));
  // sharpness of the picture itself: edge energy of two bands of the hero frame that hold no headline and no menu
  const edge = async (buf) => { let tot = 0; for (const [top, h] of [[110, 250], [650, 240]]) { const { data, info } = await sharp(buf).extract({ left: 110, top, width: 1320, height: h }).resize(660).greyscale().raw().toBuffer({ resolveWithObject: true }); let s = 0, n = 0; for (let y = 1; y < info.height - 1; y++) for (let x = 1; x < info.width - 1; x++) { const i = y * info.width + x; const l = 4 * data[i] - data[i - 1] - data[i + 1] - data[i - info.width] - data[i + info.width]; s += l * l; n++; } tot += Math.sqrt(s / n); } return tot / 2; };
  // times: ['intro', t] waits for the intro video's currentTime, ['loop', t] for the loop video's (the loop is 10 s long)
  const marks = [[['intro', 13.2], 'shot7-monument'], [['intro', 14.9], 'shot8-lanes-1'], [['intro', 15.4], 'shot8-lanes-2'], [['intro', 15.9], 'shot8-lanes-3'], [['intro', g - 0.12], 'just-before-green'], [['intro', g + 0.04], 'full-green'], [['loop', 0.9], 'after-green-1'], [['loop', 2.6], 'after-green-2'], [['loop', 6.0], 'after-green-3'], [['loop', 8.5], 'after-green-4']];
  const rows = [];
  for (const [[which, t], name] of marks) {
    await p.waitForFunction(([which, t]) => { const v = document.getElementById('vid'), l = document.getElementById('vloop'); return which === 'intro' ? (v.currentTime >= t || document.getElementById('stage').classList.contains('loop')) : (document.getElementById('stage').classList.contains('loop') && l.currentTime >= t); }, [which, t], { timeout: 90000, polling: 8 });
    const buf = await p.screenshot({ path: path.join(out, name + '.png') });
    const s = await p.evaluate(() => { const v = document.getElementById('vid'), l = document.getElementById('vloop'), st = document.getElementById('stage'); return { vt: v.currentTime, lt: l.currentTime, blur: st.classList.contains('blur'), loop: st.classList.contains('loop'), f: getComputedStyle(st.classList.contains('loop') ? l : v).filter }; });
    const e = await edge(buf); rows.push({ name, e, ...s });
    console.log(`  ${name.padEnd(18)} intro t ${s.vt.toFixed(2)} loop t ${s.lt.toFixed(2)}  blur=${s.blur} ${s.f.padEnd(10)} picture edge energy ${e.toFixed(1)}`);
  }
  const lanesSharp = rows.filter((r) => /lanes|before/.test(r.name)).every((r) => r.e > 6 && !r.blur), afterBlur = rows.filter((r) => /after-green/.test(r.name)).every((r) => r.blur);
  ok(lanesSharp, 'screenshots in the lane shot and just before the green are sharp (edge energy > 6, no blur)');
  ok(rows.find((r) => r.name === 'full-green').e < 1.5, 'the full-green screenshot is a flat colour (edge energy < 1.5)');
  ok(afterBlur && rows.filter((r) => /after-green/.test(r.name)).every((r) => r.e < 0.35 * rows.find((x) => x.name === 'shot7-monument').e), 'every screenshot after the green is blurred and softer than the sharp ones');
  await ctx.close();
}
await b.close();
console.log(bad ? bad + ' FAILED' : 'all green-curtain browser checks passed');
process.exit(bad ? 1 : 0);
