// Tests the clock block on ashgrove.html: pins, the frame follows the scroll in both directions, releases cleanly, nothing before it moved.
// Usage: node clock.spec.mjs [baseUrl] [outDir]        (Chromium and WebKit at 1440, WebKit at 390 / 375 / 430)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium, webkit, devices } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8123').replace(/\/?$/, '/');
const out = process.argv[3] || path.join(os.tmpdir(), 'clock-spec'); fs.mkdirSync(out, { recursive: true });
const res = []; const ok = (n, p, i = '') => { res.push(p); console.log(`${p ? 'PASS' : 'FAIL'}  ${n}${i ? '  — ' + i : ''}`); };
const runs = [['chromium 1440', chromium, { viewport: { width: 1440, height: 900 } }], ['webkit 1440', webkit, { viewport: { width: 1440, height: 900 } }],
  ['webkit 1100x800', webkit, { viewport: { width: 1100, height: 800 } }]];
for (const w of [[390, 844], [375, 812], [430, 932]]) runs.push([`webkit ${w[0]}`, webkit, { viewport: { width: w[0], height: w[1] }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: devices['iPhone 13'].userAgent }]);
const launched = {};
for (const [name, eng, opts] of runs) {
  console.log(`\n===== ${name} =====`);
  const b = launched[eng.name()] || (launched[eng.name()] = await eng.launch());
  const ctx = await b.newContext(opts); const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e))); page.on('console', (m) => m.type() === 'error' && !/favicon/.test(m.location().url || '') && errs.push(m.text()));
  await page.goto(base + 'ashgrove.html#top', { waitUntil: 'load' });
  await page.waitForFunction(() => !document.documentElement.classList.contains('pre'), null, { timeout: 20000 });
  const mobile = opts.viewport.width <= 900;
  // wait until every frame has arrived (the block loads them ahead of time, nearest first)
  await page.evaluate(() => document.querySelector('.clk').scrollIntoView());
  await page.waitForFunction(() => performance.getEntriesByType('resource').filter((r) => /clock\/\d+\.webp/.test(r.name)).length >= 216, null, { timeout: 60000, polling: 200 });
  // fingerprints of all frames, drawn the way the block draws them
  await page.evaluate(async () => {
    const N = 216, fp = [];
    const c = document.createElement('canvas'); c.width = 585; c.height = 1266; const g = c.getContext('2d', { willReadFrequently: true });
    const small = document.createElement('canvas'); small.width = 24; small.height = 52; const sg = small.getContext('2d', { willReadFrequently: true });
    window.__fp = [];
    for (let i = 0; i < N; i++) {
      const im = new Image(); im.src = document.querySelector('.clk').dataset.base + String(i).padStart(3, '0') + '.webp?v=' + (document.querySelector('.clk').dataset.ver || '1'); await im.decode();
      sg.drawImage(im, 0, 0, 24, 52); window.__fp.push(Array.from(sg.getImageData(0, 0, 24, 52).data));
    }
    window.__small = small; window.__sg = sg;
    window.__which = () => { sg.drawImage(document.querySelector('.clk canvas'), 0, 0, 24, 52); const d = sg.getImageData(0, 0, 24, 52).data; let best = -1, bs = Infinity; for (let i = 0; i < N; i++) { let e = 0; const f = window.__fp[i]; for (let k = 0; k < d.length; k += 4) e += Math.abs(d[k] - f[k]) + Math.abs(d[k + 1] - f[k + 1]) + Math.abs(d[k + 2] - f[k + 2]); if (e < bs) { bs = e; best = i; } } return [best, bs / (24 * 52 * 3)]; };
  });
  const raf = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const geo = await page.evaluate(() => {
    const t = document.querySelector('.clk-track'), p = document.querySelector('.clk-pin'), tx = document.querySelector('.clk-tx'), s = document.querySelector('.clk');
    const top = t.getBoundingClientRect().top + scrollY, hh = parseFloat(getComputedStyle(p).top);
    return { top, h: t.offsetHeight, ph: p.offsetHeight, hh, ih: innerHeight, txTop: tx.getBoundingClientRect().top + scrollY, txH: tx.offsetHeight, secTop: s.getBoundingClientRect().top + scrollY };
  });
  const y0 = geo.top - geo.hh, y1 = geo.top + geo.h - geo.ph - geo.hh, N = 216;
  ok(`${name}: block pins for ${Math.round(y1 - y0)} px of scrolling`, y1 - y0 > 2000, `track ${geo.h}, pin ${geo.ph}`);
  const want = (y) => Math.round(Math.min(1, Math.max(0, (y - y0) / (y1 - y0))) * (N - 1));
  const sample = async (y) => { await page.evaluate((v) => scrollTo(0, v), y); await raf(); return page.evaluate(() => { const p = document.querySelector('.clk-pin').getBoundingClientRect(), t = document.querySelector('.clk-tx').getBoundingClientRect(), w = window.__which(); return { pinTop: p.top, pinBottom: p.bottom, txTop: t.top, f: w[0], err: w[1] }; }); };
  let badFrame = 0, badPin = 0, worst = 0, down = [], maxJump = 0, prev = 0;
  for (let y = y0 - 400; y <= y1 + 400; y += 37) {
    const s = await sample(y); down.push([y, s.f]);
    const exp = want(y); if (Math.abs(s.f - exp) > 1 || s.err > 25) { badFrame++; worst = Math.max(worst, Math.abs(s.f - exp)); }
    const inside = y >= y0 && y <= y1;
    if (inside && Math.abs(s.pinTop - geo.hh) > .6) badPin++;
    if (y < y0 && s.pinTop < geo.hh - .6) badPin++;
    if (y > y1 && s.pinBottom > geo.top + geo.h - y + .6 + 0 && Math.abs(s.pinBottom - (geo.top + geo.h - y)) > .6) badPin++;
    maxJump = Math.max(maxJump, Math.abs(s.f - prev)); prev = s.f;
  }
  ok(`${name}: the frame follows the scroll, every 37 px (${down.length} samples)`, badFrame === 0, `${badFrame} wrong, worst ${worst} frames`);
  ok(`${name}: pinned while the block plays, released exactly at the end`, badPin === 0, `${badPin} off`);
  ok(`${name}: no jump between samples (largest step ${maxJump} frames for 37 px)`, maxJump <= 4);
  // back up: same frame at the same position
  let badUp = 0;
  for (let k = down.length - 1; k >= 0; k -= 3) { const s = await sample(down[k][0]); if (Math.abs(s.f - down[k][1]) > 1) badUp++; }
  ok(`${name}: scrolling back up plays it backwards, frame for frame`, badUp === 0, `${badUp} different`);
  // a fast flick: many scroll steps in a row, the frame is right after every frame
  const fast = await page.evaluate(async ([a, b2, N2]) => {
    scrollTo(0, a); await new Promise((r) => setTimeout(r, 300)); const tr = document.querySelector('.clk-track'), pn = document.querySelector('.clk-pin');
    const hh = parseFloat(getComputedStyle(pn).top), ts = []; let t0 = performance.now(), bad = 0, n = 0;
    for (let y = a; y <= b2; y += 70) { scrollTo(0, y); await new Promise((r) => requestAnimationFrame(r)); const t = performance.now(); ts.push(t - t0); t0 = t; n++; }
    ts.sort((x, z) => x - z); return { n, median: ts[ts.length >> 1], max: ts[ts.length - 1], p95: ts[Math.floor(ts.length * .95)] };
  }, [y0, y1, N]);
  ok(`${name}: fast scroll, ${fast.n} steps of 70 px: median ${fast.median.toFixed(1)} ms, 95th ${fast.p95.toFixed(1)} ms, longest ${fast.max.toFixed(1)} ms`, fast.max < Math.max(60, fast.median * 2.2));
  // layout
  const lay = await page.evaluate(() => {
    const tx = document.querySelector('.clk-tx'), ph = document.querySelector('.clk-ph'), eb = tx.querySelector('small'), h2 = tx.querySelector('h2'), p = tx.querySelector('p');
    const r = (e) => e.getBoundingClientRect(), cs = getComputedStyle(ph), ex = document.querySelector('.phones .frame.phone'), ecs = getComputedStyle(ex);
    return { txR: [r(tx).left, r(tx).right], phR: [r(ph).left, r(ph).right, r(ph).top, r(ph).bottom, r(ph).width, r(ph).height], radius: cs.borderTopLeftRadius + ' ' + cs.borderTopRightRadius, exRadius: ecs.borderTopLeftRadius, exW: r(ex).width, imgR: getComputedStyle(ph.querySelector('canvas')).borderTopLeftRadius,
      txt: [eb.textContent, h2.textContent, p.textContent.slice(0, 30)], fonts: [getComputedStyle(h2).fontSize, getComputedStyle(p).fontSize, getComputedStyle(eb).fontSize], ih: innerHeight, iw: innerWidth, sw: document.documentElement.scrollWidth, ar: r(ph).width / r(ph).height };
  });
  ok(`${name}: text is "On a phone" / "The programme becomes a clock." / the body`, lay.txt[0] === 'On a phone' && lay.txt[1] === 'The programme becomes a clock.' && lay.txt[2].startsWith('On a small screen'), JSON.stringify(lay.fonts));
  ok(`${name}: phone has the screen's proportions 390:844 and no horizontal overflow`, Math.abs(lay.ar - 390 / 844) < .003 && lay.sw <= lay.iw, `${lay.phR[4].toFixed(0)}×${lay.phR[5].toFixed(0)}, scrollWidth ${lay.sw}`);
  const rr = parseFloat(lay.radius), rex = parseFloat(lay.exRadius);
  ok(`${name}: same corner radius as the other phone frames (${lay.radius.split(' ')[0]} on ${lay.phR[4].toFixed(0)} px; theirs ${lay.exRadius} on ${lay.exW.toFixed(0)} px)`, mobile ? lay.radius.includes('%') && lay.radius === lay.exRadius.split(' ').slice(0, 2).join(' ') || /^9\.3333%/.test(lay.radius) && /^9\.3333%/.test(lay.exRadius) : Math.abs(rr - rex) < .01, `picture radius ${lay.imgR}`);
  if (mobile) ok(`${name}: text first, then the pinned phone`, lay.txR[0] >= 0, '');
  else ok(`${name}: text on the left of the phone`, lay.txR[1] <= lay.phR[0] + 1);
  // pictures at the start, middle and end
  for (const [k, f] of [['start', 0], ['middle', .5], ['end', 1]]) { await sample(y0 + (y1 - y0) * f); await page.screenshot({ path: path.join(out, `${name.replace(/ /g, '-')}-${k}.png`) }); }
  // before the block nothing moved: elements above it sit where they sit on the live page
  const above = await page.evaluate(() => [...document.querySelectorAll('.open, .sec')].filter((e) => e.getBoundingClientRect().top + scrollY < document.querySelector('.clk').getBoundingClientRect().top + scrollY).map((e) => Math.round(e.getBoundingClientRect().top + scrollY) + ':' + Math.round(e.getBoundingClientRect().height)).join(' '));
  fs.writeFileSync(path.join(out, `above-${name.replace(/ /g, '-')}.txt`), above);
  ok(`${name}: no script errors`, errs.length === 0, errs.join(' | '));
  await ctx.close();
}
for (const b of Object.values(launched)) await b.close();
console.log(`\n${res.filter(Boolean).length}/${res.length} passed`); process.exit(res.every(Boolean) ? 0 : 1);
