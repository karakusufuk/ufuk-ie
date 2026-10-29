// Behaviour checks for section 2 of the brief. Plain Node + Playwright, no test runner.
// Usage: node behaviour.spec.mjs [baseUrl] [chromium|webkit|firefox] [1440x900] [only]
//   chromium uses the installed Chrome (H.264 playback); `only` is an optional substring of a test name.
import fs from 'node:fs';
import path from 'node:path';
import { chromium, webkit, firefox } from 'playwright';

const base = (process.argv[2] || 'http://localhost:8101').replace(/\/?$/, '/');
const bname = process.argv[3] || 'chromium';
const [W, H] = (process.argv[4] || '1440x900').split('x').map(Number);
const only = process.argv[5] || '';
const here = path.dirname(new URL(import.meta.url).pathname);
const type = { chromium, webkit, firefox }[bname];
const slugs = ['brennock', 'reilly', 'bawn', 'fennel', 'kenilworth', 'garvey', 'tierney', 'midland', 'monument', 'lear', 'ashgrove'];
const appSlugs = ['kus', 'master-id', 'passpath', 'match-id'];   // hand-built project pages (kus.html) and the three made by apps.mjs
const live = (s) => ({ garvey: 'garveylennon', midland: 'midland' }[s] || s) + '.ufuk.ie';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let browser, failed = 0, passed = 0;
const ok = (c, msg) => { if (!c) throw new Error(msg); };
const getComputedStyleOk = (d) => parseFloat(d) >= 1.2;
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b} (±${tol})`);

async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, ...opts });
  // live demo sites are never contacted by the tests
  await ctx.route(/^https:\/\/[a-z]+\.ufuk\.ie\/.*/, (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<title>demo</title>' }));
  await ctx.route(/^https:\/\/www\.instagram\.com\/.*/, (r) => r.fulfill({ status: 200, contentType: 'text/html', body: 'ig' }));
  await ctx.route(/^https:\/\/wa\.me\/.*/, (r) => r.fulfill({ status: 200, contentType: 'text/html', body: 'wa' }));
  const page = await ctx.newPage();
  page.errors = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon/.test(m.location().url || '')) page.errors.push(m.text() + ' ' + (m.location().url || '')); });
  page.on('pageerror', (e) => page.errors.push('pageerror ' + e.message));
  page.on('response', (r) => { if (r.status() >= 400 && !/favicon/.test(r.url())) page.errors.push(r.status() + ' ' + r.url()); });
  page.ctx = ctx;
  return page;
}
const go = (page, file, wait = 'load') => page.goto(base + file, { waitUntil: wait });
const wheel = async (page, dy = 120) => { await page.mouse.move(W / 2, H / 2); await page.mouse.wheel(0, dy); };
const dots = (page, i) => page.evaluate((i) => document.querySelectorAll('.show')[i].querySelectorAll('.show-steps i.on').length, i);

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

/* ---------------------------------------------------------------- homepage */
test('home: no headline at 2 s, headline starts typing by 8 s over the still-playing film, typed in full', async () => {
  const page = await newPage();
  const t0 = Date.now();
  await go(page, 'index.html');
  await page.waitForFunction(() => document.getElementById('vid').currentTime > 0, null, { timeout: 1200 }).catch(() => {});
  await sleep(Math.max(0, 2000 - (Date.now() - t0)));
  // some automation browsers (this WebKit) refuse autoplay; the page then skips the intro on purpose and goes to the dark loop
  const refused = await page.evaluate(() => document.getElementById('vid').paused && document.getElementById('vid').currentTime === 0);
  if (refused) console.log('      (autoplay refused by this browser: the page skips the intro by design, so the 2 s / intro checks are skipped)');
  else {
    ok(await page.evaluate(() => document.querySelectorAll('#headline .ch.v').length) === 0, 'headline visible at 2 s');
    ok(await page.evaluate(() => !document.getElementById('stage').classList.contains('loop')), 'loop shown before the intro ended');
  }
  await page.waitForFunction(() => document.getElementById('stage').classList.contains('blur'), null, { timeout: 30000 });
  const blurAt = (Date.now() - t0) / 1000;
  if (!refused) {
    // the headline must not wait for the end of the film: the first letter is on screen no later than 8 s after load
    await page.waitForFunction(() => document.querySelectorAll('#headline .ch.v').length > 0, null, { timeout: 8000 });
    const firstAt = (Date.now() - t0) / 1000;
    ok(firstAt <= 8, 'first letter of the headline at ' + firstAt.toFixed(1) + ' s (expected <= 8 s)');
    ok(await page.evaluate(() => !document.getElementById('stage').classList.contains('loop')), 'the film was still playing when the headline started');
    console.log('      first letter of the headline at ' + firstAt.toFixed(1) + ' s after load');
  }
  await sleep(3400);
  const filter = await page.evaluate(() => getComputedStyle(document.getElementById('vloop')).filter);
  ok(/blur\(9px\)/.test(filter) && !/brightness/.test(filter), 'loop video should be blurred (9px) with no static brightness(): ' + filter);
  // the darkening overlay follows the typing: 0.55 from the start (the film is still playing under the headline), 0.7 exactly when the last letter of line 2 appears
  await page.evaluate(() => { window.__dim = []; const dim = document.getElementById('dim'), chars = [...document.querySelectorAll('#headline .ln')].map((l) => [...l.querySelectorAll('.ch')]);
    const snap = () => { const l1 = chars[0].filter((c) => c.classList.contains('v')).length, l2 = chars[1].filter((c) => c.classList.contains('v')).length; window.__dim.push([performance.now(), l1, l2, parseFloat(getComputedStyle(dim).opacity)]); };
    new MutationObserver(snap).observe(document.getElementById('headline'), { subtree: true, attributes: true, attributeFilter: ['class'] }); });
  await page.waitForFunction(() => document.querySelector('#headline .caret').classList.contains('done'), null, { timeout: 60000 });
  const doneAt = (Date.now() - t0) / 1000;
  const dimLog = await page.evaluate(() => window.__dim);
  const l1done = dimLog.find((r) => r[1] === 23), last = dimLog.filter((r) => r[2] === 28).pop();
  ok(l1done && Math.abs(l1done[3] - 0.55) < 0.02, 'overlay is ' + (l1done && l1done[3]) + ' when line 1 has just been typed (expected 0.55)');
  ok(dimLog.filter((r) => r[2] === 0 && r[3] > 0.57).length === 0, 'overlay darkened beyond 0.55 before line 2 started');
  const mid = dimLog.find((r) => r[2] === 14);
  ok(mid && mid[3] > 0.57 && mid[3] < 0.69, 'overlay mid line 2 is ' + (mid && mid[3]) + ' (expected partial)');
  ok(last && Math.abs(last[3] - 0.7) < 0.015, 'overlay is ' + (last && last[3]) + ' when the last letter appears (expected 0.70)');
  ok(Math.abs(parseFloat(await page.evaluate(() => getComputedStyle(document.getElementById('dim')).opacity)) - 0.7) < 0.001, 'overlay does not stay at 0.70');
  console.log(`      overlay: ${l1done[3].toFixed(3)} after line 1, ${mid[3].toFixed(3)} mid line 2, ${last[3].toFixed(3)} at the last letter`);
  const typed = await page.evaluate(() => [...document.querySelectorAll('#headline .ln')].map((l) => [...l.querySelectorAll('.ch.v')].map((c) => c.textContent).join('')).join(' '));
  ok(typed === 'You know your business. I know what it needs online.', 'typed text is "' + typed + '"');
  const caretStopped = await page.evaluate(() => getComputedStyle(document.querySelector('#headline .caret')).animationIterationCount);
  console.log(`      blur at ${blurAt.toFixed(1)} s, headline done at ${doneAt.toFixed(1)} s, caret animation-iteration-count ${caretStopped}`);
  ok(page.errors.length === 0, 'console: ' + page.errors.join(' | '));
  await page.ctx.close();
});

test('home: header bar hides in the hero, returns on scroll up, hides on scroll down', async () => {
  const page = await newPage();
  await go(page, 'index.html'); await sleep(800);
  ok(await page.evaluate(() => !document.getElementById('bar').classList.contains('on')), 'bar visible in hero');
  const hero = await page.evaluate(() => document.querySelector('.hero').offsetHeight);
  await page.evaluate((y) => window.scrollTo(0, y), hero * 1.3); await sleep(300);
  await page.evaluate(() => window.scrollBy(0, -80)); await sleep(400);
  ok(await page.evaluate(() => document.getElementById('bar').classList.contains('on')), 'bar did not return when scrolling up');
  await page.evaluate(() => window.scrollBy(0, 200)); await sleep(400);
  ok(await page.evaluate(() => !document.getElementById('bar').classList.contains('on')), 'bar stayed when scrolling down');
  ok(page.errors.length === 0, 'console: ' + page.errors.join(' | '));
  await page.ctx.close();
});

test('home: no showcase holds or steers the scroll (wheel down and up through the whole page)', async () => {
  const page = await newPage();
  await go(page, 'index.html'); await sleep(1000);
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  await page.mouse.move(W / 2, H / 2);
  let y = 0;
  for (let i = 0; i < 120; i++) {
    await page.mouse.wheel(0, 300); await sleep(110);
    const ny = await page.evaluate(() => Math.round(scrollY));
    ok(ny - y >= 290 || ny >= max - 5, 'scrolling down got stuck at ' + y + ' -> ' + ny);
    y = ny; if (ny >= max - 1) break;
  }
  ok(y >= max - 5, 'never reached the bottom');
  for (let i = 0; i < 120; i++) {
    await page.mouse.wheel(0, -300); await sleep(110);
    const ny = await page.evaluate(() => Math.round(scrollY));
    ok(y - ny >= 290 || ny <= 5, 'scrolling up got stuck at ' + y + ' -> ' + ny);
    y = ny; if (ny <= 0) break;
  }
  ok(y <= 5, 'never got back to the top');
  ok(await page.evaluate(() => !document.querySelector('.show-steps') && getComputedStyle(document.querySelector('.show-pin')).position !== 'sticky'), 'a step indicator or a sticky pin is still there');
  ok(page.errors.length === 0, 'console: ' + page.errors.join(' | '));
  await page.ctx.close();
});

test('home: Brennock loop: first frame 2 s, truck moving 2 s, back to the first frame, the same every time', async () => {
  const page = await newPage();
  await go(page, 'index.html'); await sleep(800);
  await page.evaluate(() => { const e = document.getElementById('brennock'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY); });
  const log = await page.evaluate(() => new Promise((res) => {
    const f = document.getElementById('brennockLoop'), v = f.querySelector('video'), st = f.querySelector('.loop-still'), out = []; let last = '', t0 = null;
    const iv = setInterval(() => {
      const k = st.classList.contains('on') ? 'still' : 'moving';
      if (k !== last) { const t = performance.now(); if (t0 === null && k === 'moving') t0 = t; out.push([k, t0 === null ? 0 : (t - t0) / 1000]); last = k; }
      if (t0 !== null && performance.now() - t0 > 12500) { clearInterval(iv); res(out); }
    }, 20);
  }));
  const moving = log.filter((r) => r[0] === 'moving').map((r) => r[1]), still = log.filter((r) => r[0] === 'still').map((r) => r[1]);
  // the truck starts moving at 0, 4, 8, 12 s and the picture goes back to the first frame 2 s into each moving phase (2, 6, 10 s)
  ok(moving.length >= 3, 'moving phases: ' + moving.join(','));
  moving.slice(1).forEach((t, i) => near(t, 4 * (i + 1), 0.15, 'start of moving phase ' + (i + 2)));
  still.filter((t) => t > 0).forEach((t, i) => near(t, 4 * i + 2, 0.15, 'return to the first frame ' + (i + 1)));
  console.log('      loop phases (s): ' + log.map((r) => r[0] + '@' + r[1].toFixed(2)).join('  '));
  ok(!(await page.evaluate(() => document.querySelector('#brennockLoop video:nth-of-type(2)'))), 'a second (third-state) video is still in the Brennock frame');
  await page.ctx.close();
});

test('home: KUS plays cover > home > profile > shift and break times, turning right to left all the way, no scroll lock', async () => {
  const page = await newPage();
  await go(page, 'index.html'); await sleep(800);
  await page.evaluate(() => { const e = document.getElementById('kus'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY); });
  const snap = () => page.evaluate(() => {
    const m = (el, y) => { const t = getComputedStyle(el).transform; if (t === 'none') return 0; const v = t.match(/matrix(3d)?\(([^)]+)\)/)[2].split(',').map(Number); return v.length === 16 ? v[y ? 13 : 12] : v[y ? 5 : 4]; };
    const solo = document.getElementById('kusSolo'), t = getComputedStyle(solo).transform, mm = t === 'none' ? [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] : t.match(/matrix3d\(([^)]+)\)/)[1].split(',').map(Number);
    const ang = Math.atan2(mm[2], mm[0]) * 180 / Math.PI * -1;   // rotateY(+a) -> m13 = sin(a)... sign flipped so positive = facing right
    const w = document.querySelector('.ks-home').getBoundingClientRect().width || 1;
    return { ang, cover: Math.round(m(document.querySelector('.ks-cover'))), home: Math.round(m(document.querySelector('.ks-home'))), prof: Math.round(m(document.querySelector('.ks-prof'))), strip: Math.round(m(document.getElementById('kusStrip'), true)) };
  });
  const rows = []; const t0 = Date.now();
  while (Date.now() - t0 < 12800) { rows.push([Date.now() - t0, await snap()]); await sleep(250); }
  const at = (ms) => rows.reduce((b, r) => (Math.abs(r[0] - ms) < Math.abs(b[0] - ms) ? r : b))[1];
  // order: cover alone, then home, then profile, then the profile scrolled
  ok(at(900).home > 100 && at(900).prof > 100, 'at 0.9 s home/profile should still be waiting to the right: ' + JSON.stringify(at(900)));
  ok(at(2900).home === 0 && at(2900).prof > 100, 'at 2.9 s the home page should be showing: ' + JSON.stringify(at(2900)));
  ok(at(5200).prof === 0 && at(5200).strip === 0, 'at 5.2 s the profile should be showing, not yet scrolled: ' + JSON.stringify(at(5200)));
  ok(at(6200).strip < -100 && at(6200).strip > -800, 'at 6.2 s the profile should be scrolling: ' + JSON.stringify(at(6200)));
  ok(at(12000).strip === -1175 || Math.abs(at(12000).strip + 1175) < 3, 'at the end the profile should be on the shift and break times: ' + JSON.stringify(at(12000)));
  // rotation: starts facing right (+), ends facing left (-), strictly decreasing, no jumps
  const angs = rows.map((r) => r[1].ang);
  ok(angs[0] > 15 && angs[angs.length - 1] < -15, 'rotation should run from right-facing to left-facing: ' + angs[0].toFixed(1) + ' -> ' + angs[angs.length - 1].toFixed(1));
  for (let i = 1; i < angs.length; i++) ok(angs[i] <= angs[i - 1] + 0.05 && angs[i - 1] - angs[i] < 3.5, 'rotation not continuous at ' + rows[i][0] + ' ms: ' + angs[i - 1].toFixed(2) + ' -> ' + angs[i].toFixed(2));
  console.log('      rotation ' + angs[0].toFixed(1) + '° -> ' + angs[angs.length - 1].toFixed(1) + '° (monotonic, steps <= 3.5°)');
  const y0 = await page.evaluate(() => scrollY); await page.mouse.move(W / 2, H / 2); await page.mouse.wheel(0, 300); await sleep(300);
  ok(await page.evaluate(() => scrollY) > y0 + 250, 'the page did not scroll freely while KUS was on screen');
  await page.ctx.close();
});

for (const [kind, slug] of [['kus', 'kus'], ['master', 'master-id'], ['match', 'match-id'], ['pass', 'passpath']]) {
  for (const file of kind === 'kus' ? ['work.html'] : ['index.html', 'work.html']) {
    test('app card hover (' + file + '): ' + slug + ' plays its screens, only the top half shows, mouse-out returns to rest', async () => {
      const page = await newPage();
      await go(page, file); await sleep(1200);
      const card = page.locator('.card:has(.ac[data-ac="' + kind + '"])').first();
      await card.scrollIntoViewIfNeeded(); await sleep(400);
      const geo = await card.evaluate((c) => { const a = c.querySelector('.acs').getBoundingClientRect(), u = c.querySelector('.acui').getBoundingClientRect(); return { w: a.width, h: a.height, uiH: u.height, hasPhone: !!c.querySelector('.phone') }; });
      ok(!geo.hasPhone, 'a phone mock-up is still in the card');
      ok(geo.uiH / geo.h > 1.9 && geo.uiH / geo.h < 2.2, 'the card should show about the top half of the screen, got ' + (geo.h / geo.uiH * 100).toFixed(0) + ' %');
      const box = await card.locator('.card-img').boundingBox();
      const state = () => card.evaluate((c, k) => {
        const m = (el, y) => { const t = getComputedStyle(el).transform; if (t === 'none') return 0; const v = t.match(/matrix(3d)?\(([^)]+)\)/)[2].split(',').map(Number); return v.length === 16 ? v[y ? 13 : 12] : v[y ? 5 : 4]; };
        const q = (s) => c.querySelector(s), r = q('.acr');
        const o = { rest: +getComputedStyle(r).opacity };
        if (k === 'kus') Object.assign(o, { home: Math.round(m(q('.k-home'))), prof: Math.round(m(q('.k-prof'))), strip: Math.round(m(q('.kstrip'), true)) });
        if (k === 'master') Object.assign(o, { fb: Math.round(m(q('.m-fb'))), q: Math.round(m(q('.m-q'))) });
        if (k === 'match') Object.assign(o, { t: +q('video').currentTime.toFixed(1), paused: q('video').paused });
        if (k === 'pass') Object.assign(o, { t: +q('video').currentTime.toFixed(1), smoke: +getComputedStyle(q('.acfade')).opacity });
        return o;
      }, kind);
      const rest0 = await state(); ok(rest0.rest > 0.99, 'at rest the resting screen is not showing: ' + JSON.stringify(rest0));
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await sleep(1300); const s1 = await state();
      await sleep(5600); const s2 = await state();
      ok(s1.rest < 0.01 && s2.rest < 0.01, 'the resting overlay stayed on during the hover');
      if (kind === 'kus') { ok(s1.home === 0, 'KUS: home page not showing at 1.3 s ' + JSON.stringify(s1)); ok(s2.prof === 0 && Math.abs(s2.strip + 1320) < 3, 'KUS: profile should end on the shift and break times ' + JSON.stringify(s2)); }
      if (kind === 'master') { ok(s1.fb === 0 && s1.q > 100, 'Master ID: Premier League screen not showing at 1.3 s ' + JSON.stringify(s1)); ok(s2.q === 0, 'Master ID: question start screen not showing at the end ' + JSON.stringify(s2)); }
      if (kind === 'match') { ok(s1.t > 0.8 && !s1.paused, 'Match ID: the duel recording is not playing ' + JSON.stringify(s1)); ok(s2.t >= 4 && s2.t < 5 && s2.paused, 'Match ID: the recording should hold the snowy screen ' + JSON.stringify(s2)); }
      if (kind === 'pass') { ok(s1.t > 0.8 && s1.smoke < 0.2, 'PassPath: the dial recording should be playing ' + JSON.stringify(s1)); ok(s2.smoke > 0.99, 'PassPath: the smoky screen should have faded in ' + JSON.stringify(s2)); }
      await page.mouse.move(5, 5); await sleep(700); const s3 = await state();
      ok(s3.rest < 0.01 && (kind !== 'kus' || (s3.home === 402 && s3.prof === 402 && s3.strip === 0)) && (kind !== 'master' || (s3.fb === 402 && s3.q === 402)) && (kind !== 'match' || s3.t === 0) && (kind !== 'pass' || (s3.t === 0 && s3.smoke === 0)), 'mouse-out did not return to rest ' + JSON.stringify(s3));
      ok(page.errors.length === 0, 'console: ' + page.errors.join(' | '));
      await page.ctx.close();
    });
  }
}

for (const slug of slugs) {
  test('project ' + slug + ': every recording starts from its first frame when its block comes into view; covers play once; next-project bar image loads', async () => {
    const page = await newPage();
    await page.addInitScript(() => {
      window.__v = [];
      document.addEventListener('playing', (e) => { if (e.target.tagName === 'VIDEO') window.__v.push([e.target.getAttribute('data-src') || e.target.currentSrc, e.target.currentTime, e.target.loop]); }, true);
    });
    await go(page, slug + '.html'); await sleep(900);
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.mouse.move(W / 2, H / 2 > 400 ? 400 : H / 2);
    // real wheel gestures (the first one opens the page), down to the footer and back up to the top
    for (let i = 0; i < 200; i++) { await page.mouse.wheel(0, 260); await sleep(140); if (await page.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2)) break; }
    await sleep(300);
    // back up through the page: every recording that comes into view again starts from the beginning again
    for (let i = 0; i < 200; i++) { await page.mouse.wheel(0, -260); await sleep(140); if (await page.evaluate(() => scrollY <= 0)) break; }
    await sleep(500);
    const ev = await page.evaluate(() => window.__v), n = await page.evaluate(() => document.querySelectorAll('video[data-src]').length);
    ok(ev.length >= n, 'only ' + ev.length + ' of ' + n + ' recordings ever started');
    const late = ev.filter((e) => e[1] > 0.4);
    ok(late.length === 0, 'recordings that started halfway: ' + late.map((e) => e[0].split('/').pop() + '@' + e[1].toFixed(2)).join(', '));
    const cover = await page.evaluate(() => { const v = document.querySelector('.cover video'); return v ? { loop: v.loop, once: v.hasAttribute('data-once') } : null; });
    const still = await page.evaluate(() => !!document.querySelector('.cover img'));
    ok(still || (cover && cover.loop === false && cover.once), 'the cover should play once (or be a still): ' + JSON.stringify(cover));
    const nx = await page.evaluate(() => { const i = document.querySelector('.next img'); return i ? { w: i.naturalWidth, h: i.naturalHeight, src: i.getAttribute('src') } : null; });
    await page.evaluate(() => document.querySelector('.next img').scrollIntoView()); await sleep(600);
    const nx2 = await page.evaluate(() => { const i = document.querySelector('.next img'); return { w: i.naturalWidth, h: i.naturalHeight }; });
    ok(nx2.w > 1000 && nx2.h > 500, 'the next-project image did not load: ' + JSON.stringify(nx2));
    ok(page.errors.length === 0, 'console: ' + page.errors.join(' | '));
    await page.ctx.close();
  });
}

test('kenilworth: page-specific cover and emergency frames are hero height, every other cover keeps its own shape', async () => {
  const page = await newPage();
  await go(page, 'kenilworth.html'); await sleep(800);
  const k = await page.evaluate(() => [...document.querySelectorAll('.frame')].slice(0, 4).map((f) => { const r = f.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), f.querySelector('video')?.getAttribute('data-src') || '']; }));
  const cover = k[0], brings = k[1], emerg = k.find((f) => /emergency/.test(f[2]));
  near(cover[0] / cover[1], 1440 / 720, 0.03, 'Kenilworth cover shape'); near(emerg[0] / emerg[1], 1440 / 720, 0.03, 'Emergency frame shape');
  const reg = k.find((f) => /register/.test(f[2])); near(reg[0] / reg[1], 1440 / 900, 0.03, 'the registration frame keeps its height');
  const pw = await page.evaluate(() => { const v = [...document.querySelectorAll('.frame video')].find((x) => /trust/.test(x.getAttribute('data-src'))); const r = v.parentElement.getBoundingClientRect(); return [r.width, r.height]; });
  ok(pw[0] / pw[1] < 2.4, 'People we trust frame is still a strip: ' + (pw[0] / pw[1]).toFixed(2));
  const other = await page.evaluate(async () => { const r = await fetch('work.css'); return (await r.text()).length; }); ok(other > 1000, 'work.css missing');
  await page.ctx.close();
  const p2 = await newPage(); await go(p2, 'brennock.html'); await sleep(600);
  const bc = await p2.evaluate(() => { const r = document.querySelector('.cover .frame').getBoundingClientRect(); return r.width / r.height; }); near(bc, 1.6, 0.02, 'Brennock cover keeps 16:10'); await p2.ctx.close();
});

test('kus: the profile card comes forward and goes back as the day-off card, and only then switches to the working day', async () => {
  const page = await newPage();
  await go(page, 'kus.html'); await sleep(900);
  await page.evaluate(() => window.scrollTo(0, document.getElementById('b-profile').getBoundingClientRect().top + scrollY - 80));
  await sleep(300);
  const log = await page.evaluate(() => new Promise((res) => {
    const b = document.getElementById('b-profile'), out = []; const t0 = performance.now();
    const iv = setInterval(() => {
      const lifts = [...b.querySelectorAll('.lifts .lift')].filter((l) => getComputedStyle(l).visibility === 'visible');
      const alt = b.querySelector('img.alt'); out.push([Math.round(performance.now() - t0), lifts.map((l) => l.getAttribute('src').split('/').pop()).join('|'), +(+getComputedStyle(alt).opacity).toFixed(2)]);
      if (performance.now() - t0 > 9000) { clearInterval(iv); res(out); }
    }, 60);
  }));
  const liftOn = log.filter((r) => r[1]), names = [...new Set(liftOn.map((r) => r[1]))];
  ok(liftOn.length > 5 && names.join() === 'c-profile-off.png', 'the card in front should only ever be the day-off card: ' + names.join());
  ok(!log.some((r) => r[1] && r[2] > 0.02), 'the page switched to the working day while the card was in front');
  const lastLift = Math.max(...liftOn.map((r) => r[0])), switched = log.find((r) => r[2] > 0.5);
  ok(switched && switched[0] > lastLift, 'the working day should appear only after the card has settled');
  console.log('      card in front ' + liftOn[0][0] + '–' + lastLift + ' ms (day off); working day shown from ' + switched[0] + ' ms');
  ok(page.errors.length === 0, 'console: ' + page.errors.join(' | '));
  await page.ctx.close();
});

test('match-id: the loading bar fills once and stops', async () => {
  const page = await newPage();
  await go(page, 'match-id.html'); await sleep(500);
  await page.evaluate(() => { const c = document.getElementById('b-cover'); window.scrollTo(0, c.getBoundingClientRect().top + scrollY - 40); });
  const widths = []; const t0 = Date.now();
  while (Date.now() - t0 < 12000) { widths.push(await page.evaluate(() => { const i = document.querySelector('#b-cover .bar i'); return Math.round(parseFloat(getComputedStyle(i).width)) + '/' + getComputedStyle(i).opacity; })); await sleep(150); }
  const full = widths.indexOf('190/1');
  ok(full >= 0, 'the bar never filled: ' + [...new Set(widths)].join(' '));
  ok(widths.slice(full).every((w) => w === '190/1'), 'the bar emptied or restarted after it filled: ' + [...new Set(widths.slice(full))].join(' '));
  ok(widths.slice(0, full).every((w) => w !== '0/0'), 'the bar emptied while filling');
  console.log('      bar full after ' + (full * 0.15).toFixed(1) + ' s and stayed full for ' + ((widths.length - full) * 0.15).toFixed(1) + ' s');
  await page.ctx.close();
});

test('home: Reilly showcase has one step and the page moves on', async () => {
  const page = await newPage();
  await go(page, 'index.html'); await sleep(1000);
  const n = await page.evaluate(() => document.querySelectorAll('.show').length);
  const top = await page.evaluate(() => document.querySelectorAll('.show')[2].getBoundingClientRect().top + scrollY);
  await page.evaluate((y) => window.scrollTo(0, y), top); await sleep(400);
  ok(n === 3, 'expected 3 showcases');
  await wheel(page); await sleep(900);
  ok(await page.evaluate(() => scrollY) > top + 5, 'page did not move on after the single-step showcase');
  await page.ctx.close();
});

test('home: grid hover fades the video in from frame 0, leaving fades it out', async () => {
  const page = await newPage();
  await go(page, 'index.html'); await sleep(1500);
  const card = page.locator('.col.l .card').first();
  await card.scrollIntoViewIfNeeded(); await sleep(400);
  const box = await card.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await sleep(150);
  ok(await card.evaluate((c) => c.classList.contains('hv-on')), 'hv-on missing');
  const t = await card.evaluate((c) => c.querySelector('video.hv').currentTime);
  ok(t < 0.6, 'hover video started at ' + t);
  await page.mouse.move(5, 5); await sleep(450);
  ok(await card.evaluate((c) => !c.classList.contains('hv-on')), 'hv-on stayed after leaving');
  await page.ctx.close();
});

test('home: right column drifts (parallax) and starts half a card lower', async () => {
  const page = await newPage();
  await go(page, 'index.html'); await sleep(1500);
  const info = await page.evaluate(() => { const r = document.querySelector('.col.r'), l = document.querySelector('.col.l .card'); return { pad: parseFloat(r.style.paddingTop), half: l.offsetHeight / 2 }; });
  near(info.pad, info.half, 1, 'right column offset');
  await page.evaluate(() => document.querySelector('.cols').scrollIntoView({ block: 'center' })); await sleep(400);
  const tr = await page.evaluate(() => document.querySelector('.col.r').style.transform);
  ok(/translate3d\(0px?, ?-?[\d.]+px, 0/.test(tr) && !/\(0px?, ?0px/.test(tr), 'no drift transform: ' + tr);
  await page.ctx.close();
});

/* ---------------------------------------------------------------- work page */
test('work: filters show the right counts and re-deal the columns', async () => {
  const page = await newPage();
  await go(page, 'work.html'); await sleep(800);
  const expect = { all: 15, site: 11, app: 4, case: 4 };
  for (const [f, n] of Object.entries(expect)) {
    await page.click(`.filters button[data-f="${f}"]`); await sleep(200);
    const r = await page.evaluate(() => ({ l: document.querySelectorAll('.col.l .card').length, r: document.querySelectorAll('.col.r .card').length, pressed: [...document.querySelectorAll('.filters button')].map((b) => b.getAttribute('aria-pressed')) }));
    ok(r.l + r.r === n, `${f}: ${r.l + r.r} cards, expected ${n}`);
    ok(r.l === Math.ceil(n / 2) && r.r === Math.floor(n / 2), `${f}: columns ${r.l}/${r.r} not dealt alternately`);
    ok(r.pressed.filter((x) => x === 'true').length === 1, f + ': aria-pressed wrong');
    const ring = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle + ' ' + getComputedStyle(document.activeElement).outlineWidth);
    ok(/none|0px/.test(ring), f + ': focus ring after a mouse click: ' + ring);
  }
  ok(await page.evaluate(() => document.querySelectorAll('.tag').length) === 4, 'case-study pills');
  ok(await page.evaluate(() => document.querySelector('#bar').classList.contains('on')), 'header bar not visible');
  await page.keyboard.press('Tab');
  ok(page.errors.length === 0, 'console: ' + page.errors.join(' | '));
  await page.ctx.close();
});

test('work: hover and parallax work like the homepage', async () => {
  const page = await newPage();
  await go(page, 'work.html'); await sleep(1200);
  const card = page.locator('.col.l .card').first();
  await card.scrollIntoViewIfNeeded(); await sleep(300);
  const box = await card.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await sleep(150);
  ok(await card.evaluate((c) => c.classList.contains('hv-on')), 'hv-on missing on Work');
  await page.evaluate(() => document.querySelector('.cols').scrollIntoView({ block: 'center' })); await sleep(300);
  ok(/translate3d/.test(await page.evaluate(() => document.querySelector('.col.r').style.transform)), 'no drift on Work');
  await page.ctx.close();
});

/* ---------------------------------------------------------------- project pages */
test('project: hidden until settled, line below the summary, one wheel opens it without moving the page', async () => {
  const page = await newPage();
  await page.addInitScript(() => { window.__bad = 0; const f = () => { const h = document.documentElement; if (h && !h.classList.contains('pre') && scrollY > 0 && !window.__opened) window.__bad++; requestAnimationFrame(f); }; requestAnimationFrame(f); });
  await go(page, 'brennock.html', 'commit');
  await page.waitForFunction(() => !document.documentElement.classList.contains('pre'), null, { timeout: 5000 });
  ok(await page.evaluate(() => scrollY) === 0, 'page revealed away from the top');
  await sleep(2500);
  const m = await page.evaluate(() => { const s = document.querySelector('.open .sum').getBoundingClientRect(), l = document.querySelector('.laser').getBoundingClientRect(); return { sumBottom: s.bottom, line: l.top, vh: innerHeight, opened: document.body.classList.contains('opened') }; });
  ok(!m.opened, 'page opened without a gesture');
  ok(m.line >= m.sumBottom + 30 && m.line <= m.sumBottom + 60, `line ${m.line} not ~44 px under the summary (${m.sumBottom})`);
  await wheel(page, 200);
  for (let i = 0; i < 6; i++) { await sleep(100); await page.mouse.wheel(0, 80); }   // trailing inertia of the same gesture
  await sleep(1100);
  const a = await page.evaluate(() => ({ y: scrollY, opened: document.body.classList.contains('opened'), line: document.querySelector('.laser').getBoundingClientRect().top, vh: innerHeight }));
  ok(a.opened, 'wheel did not open the page');
  near(a.y, 0, 1, 'scrollY after the opening wheel');
  near(a.line, a.vh - 36, 3, 'line did not drop to 36 px above the bottom');
  ok(await page.evaluate(() => window.__bad) === 0, 'page was visible away from the top');
  ok(page.errors.length === 0, 'console: ' + page.errors.join(' | '));
  await page.ctx.close();
});

test('project: dock hidden until the second scroll; first click on "Visit the live site" docks, second opens the live site', async () => {
  const page = await newPage();
  await go(page, 'brennock.html'); await sleep(1800);
  await wheel(page, 200); await sleep(1600);
  ok(await page.evaluate(() => !document.querySelector('.dock').classList.contains('on')), 'dock visible before the second scroll');
  await wheel(page, 500); await sleep(900);
  ok(await page.evaluate(() => scrollY) > 240, 'second scroll did not move the page');
  ok(await page.evaluate(() => document.querySelector('.dock').classList.contains('on')), 'dock hidden after the second scroll');
  await page.ctx.close();

  const p2 = await newPage();
  await go(p2, 'brennock.html'); await sleep(1800);
  let popups = 0; p2.ctx.on('page', () => popups++);
  await p2.click('.live-top'); await sleep(1200);
  ok(popups === 0, 'first click opened a new page');
  ok(await p2.evaluate(() => document.querySelector('.dock').classList.contains('on')), 'dock not shown after the first click');
  ok(await p2.evaluate(() => getComputedStyle(document.querySelector('.live-top')).visibility === 'hidden'), 'text still visible after it flew to the dock');
  const edges = await p2.evaluate(() => ({ dock: document.querySelector('.dock .btn').getBoundingClientRect().right, text: document.querySelector('.live-top').getBoundingClientRect().right }));
  near(edges.dock, edges.text, 2, 'dock right edge vs text right edge');
  const [pop] = await Promise.all([p2.ctx.waitForEvent('page'), p2.click('.dock .btn')]);
  await pop.waitForLoadState().catch(() => {});
  ok(pop.url().startsWith('https://brennock.ufuk.ie'), 'popup went to ' + pop.url());
  ok(p2.errors.length === 0, 'console: ' + p2.errors.join(' | '));
  await p2.ctx.close();
});

test('project: on all 11 pages the text link never opens the live site; it scrolls and becomes the pink button, which opens the right URL', async () => {
  const { pages } = await import('./content.mjs');
  for (const pg of pages) {
    const page = await newPage();
    await go(page, pg.slug + '.html'); await sleep(1800);
    let popups = 0; page.ctx.on('page', () => popups++);
    ok(await page.evaluate(() => !document.querySelector('.live-top').hasAttribute('href')), pg.slug + ': text link still has an address');
    const from = await page.evaluate(() => { const r = document.querySelector('.live-top').getBoundingClientRect(); return { x: r.left, y: r.top, right: r.right }; });
    await page.click('.live-top'); await sleep(250);
    // the text flies: a ghost exists while it travels
    await page.click('.live-top', { button: 'middle', force: true, timeout: 500 }).catch(() => {});
    await sleep(2600);
    ok(popups === 0, pg.slug + ': clicking the text link opened ' + popups + ' new page(s)');
    const st = await page.evaluate(() => { const d = document.querySelector('.dock'), b = d.querySelector('.btn').getBoundingClientRect(); return { y: scrollY, on: d.classList.contains('on'), op: getComputedStyle(d.querySelector('.btn')).opacity, vis: getComputedStyle(d).visibility, right: b.right, top: b.top, h: innerHeight, textVis: getComputedStyle(document.querySelector('.live-top')).visibility, ghost: !!document.querySelector('.live-ghost'), arrow: getComputedStyle(document.querySelector('.live-top i')).animationName, dockLinks: d.querySelectorAll('a').length, href: d.querySelector('.btn').href }; });
    ok(st.y > 100, pg.slug + ': page did not scroll (scrollY ' + st.y + ')');
    ok(st.on && st.vis === 'visible' && st.op === '1', pg.slug + ': pink button not shown in place');
    ok(st.textVis === 'hidden' && !st.ghost, pg.slug + ': text link still visible or ghost left over');
    ok(st.dockLinks === 1, pg.slug + ': dock has ' + st.dockLinks + ' links (expected only the pink button)');
    ok(st.href.replace(/\/$/, '') === pg.live, pg.slug + ': pink button points to ' + st.href);
    ok(popups === 0, pg.slug + ': new page before the pink button was clicked');
    const [pop] = await Promise.all([page.ctx.waitForEvent('page'), page.click('.dock .btn')]);
    ok(pop.url().replace(/\/$/, '') === pg.live, pg.slug + ': pink button opened ' + pop.url());
    ok(page.errors.length === 0, pg.slug + ' console: ' + page.errors.join(' | '));
    await page.ctx.close();
  }
});

test('project: line locks at the footer and hides; pins drawn; recordings load only near the viewport', async () => {
  const page = await newPage();
  await go(page, 'brennock.html'); await sleep(1800);
  const pins = await page.evaluate(() => [...document.querySelectorAll('.blk[data-pin] svg.pin line')].length);
  ok(pins > 0, 'no note pins drawn');
  const loaded = await page.evaluate(() => ({ total: document.querySelectorAll('video[data-src]').length, withSrc: [...document.querySelectorAll('video[data-src]')].filter((v) => v.getAttribute('src')).length }));
  ok(loaded.withSrc < loaded.total, `all ${loaded.total} recordings loaded at the top`);
  await wheel(page, 200); await sleep(1600);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await sleep(900);
  ok(await page.evaluate(() => getComputedStyle(document.querySelector('.laser')).opacity) === '0', 'line still visible at the footer');
  ok(await page.evaluate(() => !document.querySelector('.dock').classList.contains('on')), 'dock still visible at the footer');
  const foot = await page.evaluate(() => ({ mail: document.querySelector('.mail').textContent, hasMailto: !!document.querySelector('a[href^="mailto:"]'), wa: document.querySelector('.foot .btn').href }));
  ok(foot.mail === 'hello@ufuk.ie' && !foot.hasMailto, 'footer mail wrong');
  ok(/^https:\/\/wa\.me\/353832079387/.test(foot.wa), 'WhatsApp link wrong');
  await page.evaluate(() => window.scrollTo(0, 0)); await sleep(500);
  await page.ctx.close();
});

test('project: reduced motion opens the page at once and the recordings still start', async () => {
  const page = await newPage({ reducedMotion: 'reduce' });
  await go(page, 'brennock.html'); await sleep(1500);
  ok(await page.evaluate(() => document.body.classList.contains('opened')), 'page not open in reduced motion');
  ok(await page.evaluate(() => scrollY) === 0, 'not at the top');
  await page.ctx.close();
});

test('navigation: every project page opens at the top (Work card, Next project, back, forward)', async () => {
  const page = await newPage();
  await page.addInitScript(() => {
    window.__bad = []; const f = () => { const h = document.documentElement; if (/\/(brennock|reilly|bawn|fennel|kenilworth|garvey|tierney|midland|monument|lear|ashgrove)\.html/.test(location.pathname) && h && !h.classList.contains('pre') && scrollY > 0) window.__bad.push(scrollY); requestAnimationFrame(f); }; requestAnimationFrame(f);
  });
  const settled = async (s, how) => {
    await page.waitForURL(new RegExp(s + '\\.html'), { timeout: 8000 });
    await page.waitForFunction(() => !document.documentElement.classList.contains('pre'), null, { timeout: 6000 });
    ok(await page.evaluate(() => scrollY) === 0, `${s} via ${how}: opened at scrollY ${await page.evaluate(() => scrollY)}`);
    ok((await page.evaluate(() => window.__bad)).length === 0, `${s} via ${how}: page was visible away from the top`);
  };
  // from the Work page, scrolled to the bottom
  for (const s of [...slugs, ...appSlugs]) {
    await go(page, 'work.html'); await sleep(500);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await sleep(250);
    await page.locator(`a.card[href="${s}.html"]`).first().scrollIntoViewIfNeeded();
    await page.locator(`a.card[href="${s}.html"]`).first().click();
    await settled(s, 'Work card');
  }
  // from the homepage grid
  await go(page, 'index.html'); await sleep(800);
  const homeSlugs = await page.evaluate(() => [...document.querySelectorAll('a.card')].map((a) => a.getAttribute('href').replace('.html', '')));
  for (const s of homeSlugs) {
    await go(page, 'index.html'); await sleep(500);
    await page.locator(`a.card[href="${s}.html"]`).first().scrollIntoViewIfNeeded(); await sleep(200);
    await page.locator(`a.card[href="${s}.html"]`).first().click();
    await settled(s, 'home card');
  }
  // along the Next project chain, from the bottom of each page
  await go(page, 'brennock.html');
  const seen = ['brennock'];
  for (let i = 0; i < slugs.length + appSlugs.length - 1; i++) {
    await page.waitForFunction(() => !document.documentElement.classList.contains('pre'));
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await sleep(500);
    const next = await page.evaluate(() => document.querySelector('.next a').getAttribute('href').replace('.html', ''));
    await page.locator('.next a').click();
    await settled(next, 'Next project'); seen.push(next);
  }
  ok(new Set(seen).size === seen.length, 'chain repeats: ' + seen.join(' > '));
  // back and forward
  for (let i = 0; i < 3; i++) { await page.goBack(); await page.waitForFunction(() => !document.documentElement.classList.contains('pre'), null, { timeout: 6000 }).catch(() => {}); ok(await page.evaluate(() => scrollY) === 0, 'back: scrollY ' + await page.evaluate(() => scrollY)); }
  for (let i = 0; i < 3; i++) { await page.goForward(); await page.waitForFunction(() => !document.documentElement.classList.contains('pre'), null, { timeout: 6000 }).catch(() => {}); ok(await page.evaluate(() => scrollY) === 0, 'forward: scrollY ' + await page.evaluate(() => scrollY)); }
  ok((await page.evaluate(() => window.__bad)).length === 0, 'page was visible away from the top after back/forward');
  ok(page.errors.length === 0, 'console: ' + page.errors.join(' | '));
  await page.ctx.close();
});

test('reload: every kind of page starts at the top', async () => {
  for (const f of ['index', 'work', 'about', 'brennock', 'midland']) {
    const page = await newPage();
    await go(page, f + '.html'); await sleep(2200);
    if (/brennock|midland/.test(f)) { await wheel(page, 200); await sleep(1500); }
    await page.evaluate(() => window.scrollTo(0, 1800)); await sleep(500);
    ok(await page.evaluate(() => scrollY) > 1000, f + ': could not scroll down for the test');
    await page.reload(); await sleep(2500);
    ok(await page.evaluate(() => scrollY) === 0, f + ': reload kept scrollY ' + await page.evaluate(() => scrollY));
    await page.ctx.close();
  }
});

test('back: returns to the card the visitor came from (homepage grid, Work, Work with a filter)', async () => {
  const cases = [['index.html', 'garvey', null], ['work.html', 'midland', null], ['work.html', 'tierney', 'site']];
  for (const [file, slug, filter] of cases) {
    const page = await newPage();
    await go(page, file); await sleep(1800);
    if (filter) { await page.click(`.filters button[data-f="${filter}"]`); await sleep(300); }
    const card = page.locator(`a.card[href="${slug}.html"]`).first();
    await card.evaluate((c) => c.scrollIntoView({ block: 'center' })); await sleep(500);
    const before = { y: await page.evaluate(() => scrollY), top: await card.evaluate((c) => c.getBoundingClientRect().top) };
    ok(before.y > 500, file + ': card was not below the fold');
    await card.click();
    await page.waitForURL(new RegExp(slug + '\\.html')); await sleep(1500);
    await page.goBack(); await sleep(2200);
    const after = { y: await page.evaluate(() => scrollY), top: await page.locator(`a.card[href="${slug}.html"]`).first().evaluate((c) => c.getBoundingClientRect().top) };
    near(after.y, before.y, 3, `${file} ${slug}${filter ? ' (' + filter + ')' : ''}: scrollY after Back`);
    near(after.top, before.top, 3, `${file} ${slug}: card position after Back`);
    if (filter) ok(await page.evaluate((f) => document.querySelector(`.filters button[data-f="${f}"]`).getAttribute('aria-pressed') === 'true', filter), 'filter lost after Back');
    ok(page.errors.length === 0, 'console: ' + page.errors.join(' | '));
    await page.ctx.close();
  }
});

test('contact: every header "Contact" link opens contact.html; the Instagram link opens the profile; hello@ufuk.ie is plain text', async () => {
  const page = await newPage();
  for (const f of ['index', 'work', 'about', 'contact', ...slugs, ...appSlugs]) {
    await go(page, f + '.html'); await sleep(f === 'index' ? 500 : 300);
    const links = await page.evaluate(() => [...document.querySelectorAll('header a, nav a')].filter((a) => a.textContent.trim() === 'Contact').map((a) => a.getAttribute('href')));
    ok(links.length > 0 && links.every((h) => h === 'contact.html'), f + ': Contact links ' + JSON.stringify(links));
  }
  await go(page, '404.html'); ok(await page.evaluate(() => [...document.querySelectorAll('header a')].filter((a) => a.textContent === 'Contact').every((a) => a.getAttribute('href') === '/contact.html')), '404: Contact link');
  for (const f of ['index', 'brennock', 'about']) {
    await go(page, f + '.html'); await sleep(f === 'brennock' ? 1800 : 600);
    if (f === 'index') { await page.locator('.bar nav a', { hasText: 'Contact' }).evaluate((a) => a.click()); }
    else { await page.locator('header a', { hasText: 'Contact' }).first().evaluate((a) => a.click()); }
    await page.waitForURL(/contact\.html$/, { timeout: 6000 });
    ok(await page.title() === 'Contact · ufuk.ie', f + ': landed on ' + await page.title());
  }
  ok(await page.evaluate(() => !document.querySelector('a[href^="mailto:"]') && document.querySelector('.mail').textContent === 'hello@ufuk.ie' && document.querySelectorAll('form').length === 0), 'mail must be plain text and the page has no form');
  const [pop] = await Promise.all([page.ctx.waitForEvent('page'), page.click('.ig-link')]);
  ok(pop.url() === 'https://www.instagram.com/ufukkarakus/', 'Instagram link opened ' + pop.url());
  ok(await page.evaluate(() => document.querySelector('.ig-link').getAttribute('rel').includes('noopener') && document.querySelector('.ig-link').target === '_blank'), 'link must open in a new tab');
  ok(page.errors.length === 0, 'console: ' + page.errors.join(' | '));
  await page.ctx.close();
});

test('contact: grid layout (3x5, link row, posts in the given cells) and the link row lines up with the top of the heading', async () => {
  for (const [w, h] of [[1440, 900], [1920, 1080]]) {
    const page = await newPage({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    for (const f of ['index', 'work', 'about', 'contact', 'brennock', 'midland']) {
      await go(page, f + '.html'); await sleep(f === 'index' ? 800 : 500);
      if (/brennock|midland/.test(f)) { await wheel(page, 200); await sleep(1500); }
      const m = await page.evaluate(() => {
        const g = document.querySelector('.ig'), r = g.getBoundingClientRect(), cell = (r.width - 1) / 3;
        const ph = [...g.querySelectorAll('.ph')].map((p) => { const b = p.getBoundingClientRect(); return { n: +p.dataset.n, row: Math.round((b.top - r.top) / cell), col: Math.round((b.left - r.left) / cell), w: b.width, h: b.height, op: getComputedStyle(p).opacity, src: p.querySelector('img').getAttribute('src').split('/').pop() }; });
        const l = g.querySelector('.ig-link').getBoundingClientRect(), hd = document.querySelector('.contact h2, .foot h2').getBoundingClientRect();
        const mail = document.querySelector('.contact-mail, .mail'), lk = getComputedStyle(g.querySelector('.ig-link'));
        return { cell, h: r.height, ph, link: { row: Math.round((l.top - r.top) / cell), left: l.left - r.left, w: l.width, hgt: l.height }, linkTop: l.top, h2Top: hd.top, fs: lk.fontSize, mailFs: getComputedStyle(mail).fontSize, anim: lk.transitionDuration + ' ' + lk.animationName, hs: document.documentElement.scrollWidth - innerWidth, foot: document.querySelector('.contact, .end .foot').getBoundingClientRect() };
      });
      const want = { 1: [0, 0], 2: [0, 1], 3: [0, 2], 7: [2, 0], 8: [2, 1], 9: [2, 2], 11: [3, 1], 14: [4, 1] };
      ok(m.ph.length === 8, f + ': ' + m.ph.length + ' photo cells');
      for (const p of m.ph) { ok(p.row === want[p.n][0] && p.col === want[p.n][1], `${f}: post ${p.n} is at row ${p.row + 1} col ${p.col + 1}`); near(p.w, p.h, 0.6, f + ': photo cell is not square'); ok(p.src === String(p.n).padStart(2, '0') + '.jpg', f + ': cell for post ' + p.n + ' shows ' + p.src); ok(p.op === '1', f + ': photo not shown with reduced motion'); }
      near(m.cell * 5, m.h - 1, 1.2, f + ': five rows of equal height'); ok(m.link.row === 1 && m.link.left < 1 && Math.abs(m.link.w - m.cell * 3) < 2, f + ': link row spans the grid in row 2');
      near(m.linkTop, m.h2Top, 0.6, `${w} ${f}: link row top vs heading top`);
      ok(m.fs === m.mailFs, `${f}: link font ${m.fs} vs mail ${m.mailFs}`); ok(/^0s none$/.test(m.anim), f + ': link row animates: ' + m.anim); ok(m.hs <= 0, f + ': horizontal scroll');
      if (f !== 'contact') ok(m.foot.height > 0, 'foot present');
      console.log(`      ${w}x${h} ${f.padEnd(9)} link top ${m.linkTop.toFixed(1)} = heading top ${m.h2Top.toFixed(1)}, cell ${m.cell.toFixed(0)} px, font ${m.fs}`);
    }
    await page.ctx.close();
  }
});

test('contact: Instagram grid cycle (slow fade-in one by one, the tall building last and late, hold, fade-out, rest, repeat; no shuffling) and it pauses when out of view', async () => {
  const page = await newPage();
  await page.addInitScript(() => {
    window.__ig = []; const start = () => { const g = document.querySelector('.ig'); if (!g) return setTimeout(start, 20); const t0 = performance.now(); const cells = [...g.querySelectorAll('.ph')];
      new MutationObserver((ms) => ms.forEach((m) => { const i = cells.indexOf(m.target.closest ? m.target.closest('.ph') : m.target); if (i < 0) return; if (m.attributeName === 'class') window.__ig.push([performance.now() - t0, 'class', i, m.target.classList.contains('on')]); else if (m.attributeName === 'src') window.__ig.push([performance.now() - t0, 'src', i, m.target.getAttribute('src').split('/').pop()]); })).observe(g, { subtree: true, attributes: true, attributeFilter: ['class', 'src'] }); };
    document.addEventListener('DOMContentLoaded', start);
  });
  await go(page, 'contact.html'); await sleep(27500);
  const ev = await page.evaluate(() => window.__ig);
  const on = ev.filter((e) => e[1] === 'class' && e[3]), off = ev.filter((e) => e[1] === 'class' && !e[3] && e[0] > 800);
  ok(on.length >= 9, 'expected the first cycle and the start of the second, got ' + on.length + ' fades in');
  const wave1 = on.slice(0, 8), idx = wave1.map((e) => e[2]);
  ok(idx.join() === '0,1,2,3,4,5,7,6', 'fade-in order is ' + idx.join() + ' (cells 1,2,3,7,8,9,14, and the tall building 11 last)');
  const gaps = wave1.slice(1).map((e, i) => e[0] - wave1[i][0]);
  ok(gaps.slice(0, 6).every((g) => g > 800 && g < 1050), 'the first seven arrive one every ~0.9 s: ' + gaps.map(Math.round).join(' '));
  ok(gaps[6] > 3800 && gaps[6] < 4500, 'the tall building should come in noticeably late (~4.1 s after the one before it): ' + Math.round(gaps[6]) + ' ms');
  ok(getComputedStyleOk(await page.evaluate(() => getComputedStyle(document.querySelector('.ig .ph')).transitionDuration)), 'fade is not slow');
  ok(ev.filter((e) => e[1] === 'src').length === 0, 'photos were swapped (' + ev.filter((e) => e[1] === 'src').length + ' src changes): the shuffling must be gone');
  const allOn = wave1[7][0];
  const out1 = off.slice(0, 8), oi = out1.map((e) => e[2]);
  ok(oi.join() === '0,1,2,3,4,5,7,6', 'fade-out order is ' + oi.join());
  near(out1[0][0] - allOn, 5200 + 900, 500, 'hold with every photo shown');
  const og = out1.slice(1).map((e, i) => e[0] - out1[i][0]); ok(og.every((g) => g > 380 && g < 560), 'fade-out steps: ' + og.map(Math.round).join(' '));
  ok(on[8][0] - out1[7][0] > 1900 && on[8][0] - out1[7][0] < 2700, 'rest with the empty grid before the next cycle: ' + Math.round(on[8][0] - out1[7][0]) + ' ms');
  console.log(`      fade-in steps ${gaps.map(Math.round).join('/')} ms; hold ${Math.round(out1[0][0] - allOn)} ms; fade-out steps ${og.map(Math.round).join('/')} ms; second cycle starts ${Math.round(on[8][0])} ms`);
  // paused when out of view: scroll away, the grid resets and nothing moves any more
  const p2 = await newPage();
  await go(p2, 'index.html'); await sleep(1200);
  await p2.evaluate(() => document.querySelector('.ig').scrollIntoView({ block: 'center' })); await sleep(3000);
  ok(await p2.evaluate(() => document.querySelectorAll('.ig .ph.on').length) > 2, 'animation did not start in view');
  await p2.evaluate(() => window.scrollTo(0, 0)); await sleep(800);
  ok(await p2.evaluate(() => document.querySelectorAll('.ig .ph.on').length) === 0, 'grid kept showing after leaving the view');
  await p2.evaluate(() => { window.__m = 0; new MutationObserver((m) => { window.__m += m.length; }).observe(document.querySelector('.ig'), { subtree: true, attributes: true }); }); await sleep(4000);
  ok(await p2.evaluate(() => window.__m) === 0, 'grid kept animating while out of view (' + await p2.evaluate(() => window.__m) + ' changes)');
  await p2.evaluate(() => document.querySelector('.ig').scrollIntoView({ block: 'center' })); await sleep(1200);
  ok(await p2.evaluate(() => document.querySelectorAll('.ig .ph.on').length) > 1, 'animation did not resume');
  ok(page.errors.length + p2.errors.length === 0, 'console: ' + page.errors.concat(p2.errors).join(' | '));
  await page.ctx.close(); await p2.ctx.close();
});

test('contact: with reduced motion the photos are simply shown and nothing moves', async () => {
  const page = await newPage({ reducedMotion: 'reduce' });
  await go(page, 'contact.html'); await sleep(1000);
  await page.evaluate(() => { window.__m = 0; new MutationObserver((m) => { window.__m += m.length; }).observe(document.querySelector('.ig'), { subtree: true, attributes: true }); });
  await sleep(5000);
  ok(await page.evaluate(() => window.__m) === 0, 'grid changed under reduced motion');
  ok(await page.evaluate(() => [...document.querySelectorAll('.ig .ph')].every((p) => getComputedStyle(p).opacity === '1')), 'photos not all shown');
  await page.ctx.close();
});

/* ---------------------------------------------------------------- about + KUS slot */
test('about: print line reveals the page and lands on the footer; no console errors', async () => {
  const page = await newPage();
  await go(page, 'about.html'); await sleep(1500);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await sleep(1200);
  ok(page.errors.length === 0, 'console: ' + page.errors.join(' | '));
  const kus = await page.evaluate(() => { const e = [...document.querySelectorAll('*')].find((n) => n.children.length === 0 && n.textContent.trim() === 'KUS'); return e ? getComputedStyle(e).color : ''; });
  console.log('      About "KUS" colour: ' + kus);
  await page.ctx.close();
});

test('every page loads without console errors or failed requests', async () => {
  const page = await newPage();
  for (const f of ['index', 'work', 'about', 'contact', ...slugs, ...appSlugs]) { await go(page, f + '.html'); await sleep(1200); }
  ok(page.errors.length === 0, 'console: ' + page.errors.join(' | '));
  await page.ctx.close();
});

/* the chain of project pages: ... → Brennock → KUS → Master ID → PassPath → Match ID → Reilly → ... */
const CHAIN = [['brennock', 'kus'], ['kus', 'master-id'], ['master-id', 'passpath'], ['passpath', 'match-id'], ['match-id', 'reilly']];
test('app pages: chain, cards and links', async () => {
  const page = await newPage();
  for (const f of appSlugs) ok(fs.existsSync(path.join(here, '../site', f + '.html')), f + '.html does not exist');
  for (const [from, to] of CHAIN) {
    await go(page, from + '.html'); await sleep(400);
    ok(await page.evaluate(() => document.querySelector('.next a').getAttribute('href')) === to + '.html', `${from}: next is not ${to}`);
    if (appSlugs.includes(from)) ok(await page.evaluate((t) => [...document.querySelectorAll('.dock a')].some((a) => a.getAttribute('href') === t), to + '.html'), `${from}: the dock does not link to ${to}`);
    ok(await page.evaluate(() => { const i = document.querySelector('.next img'); return i && i.getAttribute('src'); }), from + ': no next picture');
  }
  for (const f of ['work.html', 'index.html']) {   // the homepage has KUS as a showcase button (checked below), the other three as cards
    await go(page, f); await sleep(500);
    for (const s of f === 'work.html' ? ['kus', 'master-id', 'match-id', 'passpath'] : ['master-id', 'match-id', 'passpath']) ok(await page.evaluate((h) => !!document.querySelector(`a.card[href="${h}"]`), s + '.html'), `${f}: no card links to ${s}.html`);
    ok(!(await page.evaluate(() => document.body.innerHTML.includes('Passpad'))), f + ' still says Passpad');
  }
  await go(page, 'index.html'); await sleep(500);
  ok(await page.evaluate(() => !!document.querySelector('#kus a.show-link[href="kus.html"]')), 'homepage KUS button does not point to kus.html');
  await page.ctx.close();
});

test('app pages: live head, no placeholders, no outside requests, no empty buttons', async () => {
  const page = await newPage(); const outside = [];
  page.on('request', (r) => { const u = new URL(r.url()); if (u.hostname !== new URL(base).hostname) outside.push(r.url()); });
  for (const f of appSlugs) {
    await go(page, f + '.html'); await sleep(1500);
    const r = await page.evaluate(() => ({
      title: document.title, canonical: document.querySelector('link[rel=canonical]').href,
      desc: document.querySelector('meta[name=description]').content, sum: document.querySelector('.open .sum').textContent,
      lang: document.documentElement.lang, hash: [...document.querySelectorAll('a')].filter((a) => a.getAttribute('href') === '#').length,
      empty: [...document.querySelectorAll('a')].filter((a) => !a.getAttribute('href')).length,
      text: document.body.innerText, wa: !!document.querySelector('.foot a[href^="https://wa.me/"]'), mail: document.querySelector('.foot .mail').textContent,
      current: document.querySelector('.top nav a[aria-current=page]').getAttribute('href'), ig: document.querySelectorAll('.foot .ig .ph').length,
    }));
    ok(r.lang === 'en', f + ': lang'); ok(/ · ufuk\.ie$/.test(r.title), f + ': title ' + r.title);
    ok(r.canonical === `https://ufuk.ie/${f}.html`, f + ': canonical ' + r.canonical);
    ok(r.desc === r.sum, f + ': description is not the summary sentence');
    ok(r.hash === 0 && r.empty === 0, f + ': a link with href="#" or no href');
    ok(!/Screen to come/i.test(r.text), f + ': placeholder text on the page');
    ok(r.wa && r.mail === 'hello@ufuk.ie' && r.ig === 8 && r.current === 'work.html', f + ': header or footer is not the live one');
    ok(await page.evaluate(() => [...document.querySelectorAll('.scr')].every((s) => s.querySelector('img,video') || s.querySelector('.bar'))), f + ': a screen without a picture');
  }
  ok(outside.length === 0, 'requests to other hosts: ' + [...new Set(outside)].slice(0, 5).join(' | '));
  ok(page.errors.length === 0, 'console: ' + page.errors.join(' | '));
  await page.ctx.close();
});

/* ---------------------------------------------------------------- run */
// PIN_DNS=1: map ufuk.ie to a GitHub Pages address (Chrome only), so a stale local DNS cache cannot hide the live result
const pin = process.env.PIN_DNS ? ['--host-resolver-rules=MAP ufuk.ie 185.199.108.153, MAP www.ufuk.ie 185.199.108.153'] : [];
browser = await type.launch(bname === 'chromium' ? { channel: 'chrome', args: pin } : {});
console.log(`behaviour: ${base} ${bname} ${W}x${H}`);
for (const [name, fn] of tests) {
  if (only && !name.includes(only)) continue;
  const t = Date.now();
  try { await fn(); passed++; console.log(`pass   ${name} (${((Date.now() - t) / 1000).toFixed(1)} s)`); }
  catch (e) { failed++; console.log(`FAIL   ${name}\n       ${String(e.message).split('\n')[0]}`); }
}
await browser.close();
console.log(failed ? `${failed} failed, ${passed} passed` : `all ${passed} passed`);
process.exit(failed ? 1 : 0);
