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
const live = (s) => ({ garvey: 'garveylennon', midland: 'midland' }[s] || s) + '.ufuk.ie';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let browser, failed = 0, passed = 0;
const ok = (c, msg) => { if (!c) throw new Error(msg); };
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
test('home: no headline at 2 s, blur after intro, headline typed in full', async () => {
  const page = await newPage();
  const t0 = Date.now();
  await go(page, 'index.html');
  await page.waitForFunction(() => document.getElementById('vid').currentTime > 0, null, { timeout: 15000 }).catch(() => {});
  await sleep(Math.max(0, 2000 - (Date.now() - t0)));
  ok(await page.evaluate(() => document.querySelectorAll('#headline .ch.v').length) === 0, 'headline visible at 2 s');
  ok(await page.evaluate(() => !document.getElementById('stage').classList.contains('loop')), 'loop shown before the intro ended');
  await page.waitForFunction(() => document.getElementById('stage').classList.contains('blur'), null, { timeout: 30000 });
  const blurAt = (Date.now() - t0) / 1000;
  await sleep(3400);
  const filter = await page.evaluate(() => getComputedStyle(document.getElementById('vloop')).filter);
  ok(/blur\(9px\)/.test(filter) && !/brightness/.test(filter), 'loop video should be blurred (9px) with no static brightness(): ' + filter);
  // the darkening overlay follows the typing: 0 while line 1 is typed, 0.7 exactly when the last letter of line 2 appears
  await page.evaluate(() => { window.__dim = []; const dim = document.getElementById('dim'), chars = [...document.querySelectorAll('#headline .ln')].map((l) => [...l.querySelectorAll('.ch')]);
    const snap = () => { const l1 = chars[0].filter((c) => c.classList.contains('v')).length, l2 = chars[1].filter((c) => c.classList.contains('v')).length; window.__dim.push([performance.now(), l1, l2, parseFloat(getComputedStyle(dim).opacity)]); };
    new MutationObserver(snap).observe(document.getElementById('headline'), { subtree: true, attributes: true, attributeFilter: ['class'] }); });
  await page.waitForFunction(() => document.querySelector('#headline .caret').classList.contains('done'), null, { timeout: 60000 });
  const doneAt = (Date.now() - t0) / 1000;
  const dimLog = await page.evaluate(() => window.__dim);
  const l1done = dimLog.find((r) => r[1] === 23), last = dimLog.filter((r) => r[2] === 28).pop();
  ok(l1done && l1done[3] < 0.02, 'overlay is ' + (l1done && l1done[3]) + ' when line 1 has just been typed (expected 0)');
  ok(dimLog.filter((r) => r[2] === 0 && r[3] > 0.02).length === 0, 'overlay darkened before line 2 started');
  const mid = dimLog.find((r) => r[2] === 14);
  ok(mid && mid[3] > 0.15 && mid[3] < 0.55, 'overlay mid line 2 is ' + (mid && mid[3]) + ' (expected partial)');
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

test('home: Brennock showcase steps 0 > 1 > 2 without moving the page, then the next gesture scrolls', async () => {
  const page = await newPage();
  await go(page, 'index.html'); await sleep(1000);
  const top = await page.evaluate(() => document.querySelectorAll('.show')[0].getBoundingClientRect().top + scrollY);
  await page.evaluate((y) => window.scrollTo(0, y), top); await sleep(300);
  const y0 = await page.evaluate(() => scrollY);
  ok(await dots(page, 0) === 1, 'start step is not 0');
  const paused = await page.evaluate(() => { const v = document.querySelectorAll('.show')[0].querySelector('video'); return v.paused && v.currentTime === 0; });
  ok(paused, 'step 0 video is not paused on frame 0');
  await wheel(page); await sleep(900);
  ok(await dots(page, 0) === 2, 'wheel 1 did not step to 1');
  near(await page.evaluate(() => scrollY), y0, 1, 'scrollY after step 1');
  await wheel(page); await sleep(900);
  ok(await dots(page, 0) === 3, 'wheel 2 did not step to 2');
  near(await page.evaluate(() => scrollY), y0, 1, 'scrollY after step 2');
  // one gesture = many wheel events 30 ms apart: must still be one step only (already at the last step here, so the page must not run on)
  await wheel(page); await sleep(900);
  ok(await page.evaluate(() => scrollY) > y0 + 5, 'gesture after the last step did not scroll the page');
  ok(page.errors.length === 0, 'console: ' + page.errors.join(' | '));
  await page.ctx.close();
});

test('home: one long gesture (many wheel events) gives exactly one step', async () => {
  const page = await newPage();
  await go(page, 'index.html'); await sleep(1000);
  const top = await page.evaluate(() => document.querySelectorAll('.show')[0].getBoundingClientRect().top + scrollY);
  await page.evaluate((y) => window.scrollTo(0, y), top); await sleep(300);
  await page.mouse.move(W / 2, H / 2);
  for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 40); await sleep(30); }
  await sleep(900);
  ok(await dots(page, 0) === 2, 'a long gesture gave ' + (await dots(page, 0) - 1) + ' steps');
  near(await page.evaluate(() => scrollY), top, 1, 'scrollY during the gesture');
  await page.ctx.close();
});

test('home: scrolling down into KUS snaps it to the top, ArrowDown and ArrowUp step it', async () => {
  const page = await newPage();
  await go(page, 'index.html'); await sleep(1000);
  const top = await page.evaluate(() => document.getElementById('kus').getBoundingClientRect().top + scrollY);
  await page.evaluate((y) => window.scrollTo(0, y), top - 400); await sleep(300);
  await wheel(page); await sleep(1500);
  near(await page.evaluate(() => document.getElementById('kus').getBoundingClientRect().top), 0, 3, 'KUS top after the snap');
  ok(await page.evaluate(() => document.querySelectorAll('#kus .show-steps i').length) === 3, 'KUS has no three dashes');
  await page.keyboard.press('ArrowDown'); await sleep(200);
  ok(await page.evaluate(() => document.querySelectorAll('#kus .show-steps i.on').length) === 2, 'ArrowDown did not step KUS');
  await page.keyboard.press('ArrowUp'); await sleep(200);
  ok(await page.evaluate(() => document.querySelectorAll('#kus .show-steps i.on').length) === 1, 'ArrowUp did not step back');
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
  for (const s of slugs) {
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
  for (let i = 0; i < slugs.length - 1; i++) {
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
  for (const f of ['index', 'work', 'about', 'contact', ...slugs]) {
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

test('contact: Instagram grid cycle (wave in, hold, slot machine < 1 s, settle, wave out, rest, repeat) and it pauses when out of view', async () => {
  const page = await newPage();
  await page.addInitScript(() => {
    window.__ig = []; const start = () => { const g = document.querySelector('.ig'); if (!g) return setTimeout(start, 20); const t0 = performance.now(); const cells = [...g.querySelectorAll('.ph')];
      new MutationObserver((ms) => ms.forEach((m) => { const i = cells.indexOf(m.target.closest ? m.target.closest('.ph') : m.target); if (i < 0) return; if (m.attributeName === 'class') window.__ig.push([performance.now() - t0, 'class', i, m.target.classList.contains('on')]); else if (m.attributeName === 'src') window.__ig.push([performance.now() - t0, 'src', i, m.target.getAttribute('src').split('/').pop()]); })).observe(g, { subtree: true, attributes: true, attributeFilter: ['class', 'src'] }); };
    document.addEventListener('DOMContentLoaded', start);
  });
  await go(page, 'contact.html'); await sleep(27500);
  const ev = await page.evaluate(() => window.__ig);
  const on = ev.filter((e) => e[1] === 'class' && e[3]), off = ev.filter((e) => e[1] === 'class' && !e[3] && e[0] > 800);
  ok(on.length >= 16, 'expected two fade-in waves, got ' + on.length + ' fades in');
  const wave1 = on.slice(0, 8), idx = wave1.map((e) => e[2]);
  ok(idx.join() === '0,1,2,3,4,5,6,7', 'fade-in order is ' + idx.join() + ' (cells 1,2,3,7,8,9,11,14)');
  const gaps = wave1.slice(1).map((e, i) => e[0] - wave1[i][0]); ok(gaps.every((g) => g > 150 && g < 280), 'fade-in steps (each starts as the previous is halfway, 210 ms): ' + gaps.map(Math.round).join(' '));
  const allOn = wave1[7][0] + 420;
  const slotEv = ev.filter((e) => e[1] === 'src' && e[0] > allOn);
  ok(slotEv.length > 20, 'slot machine produced only ' + slotEv.length + ' changes');
  const s0 = slotEv[0][0], s1 = slotEv.filter((e) => e[0] < s0 + 1500).pop()[0];
  near(s0 - allOn, 3500, 400, 'hold before the slot moment'); ok(s1 - s0 < 1000, 'slot moment lasted ' + Math.round(s1 - s0) + ' ms (must be < 1000)');
  const seen = new Set(slotEv.filter((e) => e[0] < s0 + 1500).map((e) => e[3])); ok(seen.size >= 6, 'slot showed only ' + seen.size + ' different posts');
  const finalSrc = {}; slotEv.filter((e) => e[0] < s0 + 1500).forEach((e) => { finalSrc[e[2]] = e[3]; });
  const mineSrc = ['01', '02', '03', '07', '08', '09', '11', '14'].map((n) => n + '.jpg'); ok(mineSrc.every((s, i) => finalSrc[i] === s), 'cells did not settle back on the exact order: ' + JSON.stringify(finalSrc));
  ok(slotEv.some((e) => /^0[456]\.jpg$/.test(e[3])), 'posts 4, 5, 6 never appeared in the slot moment');
  const outside = ev.filter((e) => e[1] === 'src' && (e[0] < allOn)); ok(outside.length === 0, 'photos changed outside the slot moment');
  const out1 = off.slice(0, 8), oi = out1.map((e) => e[2]); ok(oi.join() === '0,1,2,3,4,5,6,7', 'fade-out order is ' + oi.join());
  ok(on[8][0] - out1[7][0] > 1200 && on[8][0] - out1[7][0] < 2400, 'rest with the empty grid before the next cycle: ' + Math.round(on[8][0] - out1[7][0]) + ' ms (incl. last fade)');
  console.log(`      wave-in steps ${gaps.map(Math.round).join('/')} ms; hold ${Math.round(s0 - allOn)} ms; slot ${Math.round(s1 - s0)} ms with ${seen.size} different posts; second cycle starts ${Math.round(on[8][0])} ms`);
  // paused when out of view: scroll away, the grid resets and nothing moves any more
  const p2 = await newPage();
  await go(p2, 'index.html'); await sleep(1200);
  await p2.evaluate(() => document.querySelector('.ig').scrollIntoView({ block: 'center' })); await sleep(1500);
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
  for (const f of ['index', 'work', 'about', 'contact', ...slugs]) { await go(page, f + '.html'); await sleep(1200); }
  ok(page.errors.length === 0, 'console: ' + page.errors.join(' | '));
  await page.ctx.close();
});

const kusExists = fs.existsSync(path.join(here, '../site/kus.html'));
if (kusExists) test('KUS slot: links and chain', async () => {
  const page = await newPage();
  await go(page, 'work.html'); await sleep(500);
  ok(await page.evaluate(() => !!document.querySelector('a.card[href="kus.html"]')), 'Work KUS card does not point to kus.html');
  await go(page, 'index.html'); await sleep(500);
  ok(await page.evaluate(() => !!document.querySelector('#kus a.show-link[href="kus.html"]')), 'homepage KUS button does not point to kus.html');
  await go(page, 'brennock.html'); await sleep(500);
  ok(await page.evaluate(() => document.querySelector('.next a').getAttribute('href')) === 'kus.html', 'Brennock next is not KUS');
  await go(page, 'kus.html'); await sleep(500);
  ok(await page.evaluate(() => document.querySelector('.next a').getAttribute('href')) === 'reilly.html', 'KUS next is not Reilly');
  await page.ctx.close();
}); else console.log('skip   KUS slot: site/kus.html does not exist yet');

/* ---------------------------------------------------------------- run */
browser = await type.launch(bname === 'chromium' ? { channel: 'chrome' } : {});
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
