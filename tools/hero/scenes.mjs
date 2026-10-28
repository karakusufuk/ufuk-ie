// The ten scenes of the homepage banner, recorded live. Every scene is { name, url, seconds, setup, act }.
// seconds = on-screen time (2.0 s, first shot 2.5 s) + 0.3 s that the crossfade into the next shot needs.
import { sleep } from './recorder.mjs';

const FADE = 0.3;
const L = (s) => +(s + FADE).toFixed(2);

// scroll-driven scenes: the page's own scroll position is eased from -> to, inside the page, so timing is exact
export const glide = (page, from, to, ms, delay = 0, linear = false) => page.evaluate(([from, to, ms, delay, linear]) => new Promise((res) => {
  const ease = (t) => (linear ? t : t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  setTimeout(() => { const t0 = performance.now(); (function f(now) { const t = Math.min(1, (now - t0) / ms); window.scrollTo({ top: from + (to - from) * ease(t), behavior: 'instant' }); if (t < 1) requestAnimationFrame(f); else res(); })(t0); }, delay);
}), [from, to, ms, delay, linear]);

// real wheel events (for pages with their own scroll smoothing): `total` px spread evenly over `ms`
export const wheelScroll = async (page, total, ms, delay = 0) => { await sleep(delay); await page.mouse.move(800, 450); const n = Math.round(ms / 30), t0 = Date.now(); for (let i = 1; i <= n; i++) { await page.mouse.wheel(0, total / n); const wait = t0 + (i * ms) / n - Date.now(); if (wait > 0) await sleep(wait); } };

const ready = (ms = 1500) => async (page) => { await page.waitForTimeout(ms); };
const at = (page, y, ms = 1200) => page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y).then(() => page.waitForTimeout(ms));

export const scenes = {
  // 1 — the Brennock closing scene: the truck stands in daylight with its lamps off, night falls and the headlights come on (the site's own nightfall)
  brennock: {
    name: 'brennock', url: 'https://brennock.ufuk.ie/', seconds: L(2.5), total: 6.2, keepScroll: true,
    trim: (m) => (m.night || 1.8) - 0.12,
    async setup(page) {
      await page.waitForTimeout(2500); await page.mouse.move(800, 450);
      for (let i = 0; i < 4; i++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(1700); }   // beats 1..4; the sectors are on screen
      await page.evaluate(() => { window.__nightAt = 0; const s = document.getElementById('duskStage'); (function f(now) { if (!window.__nightAt && parseFloat(s.style.getPropertyValue('--night')) > 0.004) window.__nightAt = now; requestAnimationFrame(f); })(0); });
    },
    async act(page, mark) {
      const t0 = Date.now(); mark('press'); await page.keyboard.press('ArrowDown');         // beat 5: the truck rises in, then night falls by itself
      await page.waitForFunction(() => window.__nightAt > 0, null, { timeout: 8000, polling: 16 });
      mark('night');
      // __nightAt is a page timestamp; the mark above is when node saw it, 0-30 ms later: good enough for a 0.12 s margin
    },
  },
  // 2 — Garvey Lennon: the card, then the first question panel opens
  garvey: {
    name: 'garvey', url: 'https://garveylennon.ufuk.ie/', seconds: L(2.0),
    async setup(page) { await page.waitForTimeout(3200); },
    async act(page, mark) { await sleep(450); mark('click'); await page.getByText('Start here').first().click(); },
  },
  // 3 — Reilly: the implant is built part by part as the page scrolls
  reilly: {
    name: 'reilly', url: 'https://reilly.ufuk.ie/', seconds: L(2.0),
    async setup(page) { await at(page, 2850, 1500); },
    async act(page, mark) { mark('scroll'); await glide(page, 2850, 4080, 1900, 150); },
  },
  // 4 — Tierney: the road to a licence
  tierney: {
    name: 'tierney', url: 'https://tierney.ufuk.ie/', seconds: L(2.0),
    async setup(page) { await at(page, 1190, 1500); },
    async act(page, mark) { mark('scroll'); await wheelScroll(page, 165, 1800, 100); },
  },
  // 5 — Lear: grey day turns to evening as the page scrolls
  lear: {
    name: 'lear', url: 'https://lear.ufuk.ie/', seconds: L(2.0),
    async setup(page) { await at(page, 0, 1500); },
    async act(page, mark) { mark('scroll'); await glide(page, 0, 820, 1900, 150, true); },
  },
  // 6 — Ashgrove House: the house plan; the pointer finds a room and opens it
  ashgrove: {
    name: 'ashgrove', url: 'https://ashgrove.ufuk.ie/rooms/', seconds: L(2.0),
    async setup(page) { await page.waitForTimeout(2500); await page.mouse.move(900, 330); },
    async act(page, mark) {
      const rm = page.locator('button.rm');
      await sleep(250); mark('hover'); await rm.nth(4).hover();                // Hazel 3
      await sleep(750); mark('click'); await rm.nth(4).click();
    },
  },
  // 7 — Fennel Dental: what actually happens, tooth and treatment list
  fennel: {
    name: 'fennel', url: 'https://fennel.ufuk.ie/', seconds: L(2.0),
    async setup(page) { await at(page, 960, 1500); },
    async act(page, mark) { await sleep(300); mark('click'); await page.locator('button.tbtn').nth(2).click(); },
  },

  // lane clip: the Tierney road. Lanes rush past, the lime trapezoid grows until the whole screen is solid lime; the scroll then stops, so the page holds on solid green
  lane: {
    // The road plays its own 3.4 s canvas sequence the moment the page scrolls down to it, and holds the page on the band. We jump straight onto the band
    // (instant scroll, so no white section is ever on screen), start recording first, and trim the slow opening so the shot is ~2.1 s up to solid lime.
    name: 'lane', url: 'https://tierney.ufuk.ie/', seconds: 4.2, total: 5.6, trim: () => +(process.env.LANE_SKIP || 1.3),
    async setup(page) {
      // the green panel prints its words the moment it fills the screen; for this recording only, they stay hidden so the full-green frames are really solid
      await page.addStyleTag({ content: '.choice,.choice *{opacity:0!important}' });
      // park just above the band (it is still 70 % down the screen, so the sequence has not been triggered)
      await page.evaluate(() => { const r = document.getElementById('road'); window.scrollTo({ top: Math.round(r.getBoundingClientRect().top + scrollY - innerHeight * 0.7), behavior: 'instant' }); });
      await page.waitForTimeout(1200);
    },
    async act(page, mark) {
      mark('scroll');
      await page.evaluate(() => { const r = document.getElementById('road'); window.scrollTo({ top: Math.round(r.getBoundingClientRect().top + scrollY), behavior: 'instant' }); });
    },
  },
  // Brennock after nightfall: truck with headlights on, dark ground (for the dark-only loop)
  brennockNight: {
    name: 'brennockNight', url: 'https://brennock.ufuk.ie/', seconds: L(2.0), keepScroll: true,
    async setup(page) {
      await page.waitForTimeout(2500); await page.mouse.move(800, 450);
      for (let i = 0; i < 5; i++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(1700); }
      await page.waitForTimeout(9000);                                     // night has fallen and every detail has faded in
    },
    async act(page, mark) { mark('still'); },
  },
  // Garvey Lennon, dark slate ground: the language section, the visitor switches language
  garveyDark: {
    name: 'garveyDark', url: 'https://garveylennon.ufuk.ie/', seconds: L(2.0),
    async setup(page) { await at(page, 1480, 1800); },
    async act(page, mark) {
      const btn = page.locator('button', { hasText: /Polski|PL/ }).first();
      await sleep(350); mark('pl'); await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^Polski$/.test(x.textContent.trim())); if (b) b.click(); });
      await sleep(900); mark('pt'); await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^Português$/.test(x.textContent.trim())); if (b) b.click(); });
    },
  },
  // loop only: Bawn Growers (its subdomain has no valid certificate yet, so the certificate error is ignored for the recording only)
  bawn: {
    name: 'bawn', url: 'https://bawn.ufuk.ie/', seconds: L(2.0), ignoreHTTPSErrors: true,
    async setup(page) { await at(page, 2705, 1800); },
    async act(page, mark) { mark('scroll'); await glide(page, 2705, 2785, 1600, 100); },
  },
  // loop only: Monument, a current listing; the gallery moves on
  monument: {
    name: 'monument', url: 'https://monument.ufuk.ie/properties/6-chelmsford-lane/', seconds: L(2.0),
    async setup(page) { await at(page, 0, 1800); },
    async act(page, mark) {
      const next = () => page.evaluate(() => document.getElementById('gnext').click());     // no scrolling into view: the page stays where it is
      await sleep(380); mark('photo2'); await next();
      await sleep(850); mark('photo3'); await next();
    },
  },
  midland: {
    name: 'midland', url: 'https://midland.ufuk.ie/cars/2022-audi-a4-s-line/', seconds: L(2.0),
    async setup(page) { await at(page, 1096, 1800); },
    async act(page, mark) {
      const z = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('svg.iso path.hit')].map((h) => { const b = h.getBoundingClientRect(); return [h.getAttribute('data-z'), { x: b.x, y: b.y, w: b.width, h: b.height }]; })));
      const pt = (n, fx, fy) => ({ x: z[n].x + z[n].w * fx, y: z[n].y + z[n].h * fy });
      await page.mouse.move(pt('engine', 0.55, 0.2).x + 50, pt('engine', 0.55, 0.2).y - 75);
      await sleep(250); mark('hover');
      for (const [n, fx, fy] of [['engine', .55, .2], ['doorFL', .5, .2], ['doorRL', .5, .2], ['rear', .25, .55]]) { const p = pt(n, fx, fy); await page.mouse.move(p.x, p.y, { steps: 10 }); await sleep(230); }
    },
  },
};
// intro: sharp, light and dark shots, closing on the lane clip that ends in solid green (the blur starts on that frame).
// loop: after the green only shots with a dark ground play behind the headline (mean luma <= 90, see luma.mjs). Light-ground sites live in the intro only.
export const order = {
  intro: ['brennock', 'garvey', 'reilly', 'lear', 'ashgrove', 'fennel', 'monument', 'lane'],
  // order chosen with order-search.mjs: the clips with bright details under the headline (Reilly implant, Brennock truck) come when the overlay is already darker
  loop: ['midland', 'lear', 'bawn', 'reilly', 'brennockNight'],
};
