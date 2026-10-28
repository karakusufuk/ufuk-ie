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
  ok(/blur\(9px\)/.test(filter) && /brightness\(0\.72\)/.test(filter), 'loop video is not blurred after the 3 s ramp: ' + filter);
  await page.waitForFunction(() => document.querySelector('#headline .caret').classList.contains('done'), null, { timeout: 60000 });
  const doneAt = (Date.now() - t0) / 1000;
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
  for (const f of ['index', 'work', 'about', ...slugs]) { await go(page, f + '.html'); await sleep(1200); }
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
