// Scenes for the detail-page recordings of the live demo sites. Every scene starts from the beginning of its own story,
// never scrolls the page unless the story needs it, and is cut so that the clip starts and ends cleanly.
import { sleep, glideMouse, glideScroll } from './recorder.mjs';

const at = (page, y, ms = 1200) => page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y).then(() => page.waitForTimeout(ms));
export const scenes = {};

/* ---------------- Reilly: "Twenty years after the sale" (checker.mp4): the pointer visits the four columns slowly, in order */
scenes['reilly-checker'] = {
  name: 'checker', slug: 'reilly', url: 'https://reilly.ufuk.ie/', width: 1440, height: 932, seconds: 13.5,
  async setup(page) {
    const top = await page.evaluate(() => document.getElementById('after').getBoundingClientRect().top + scrollY);
    await at(page, top - 69, 1800);                        // the header stays on, the whole section fits under it
    await page.mouse.move(720, 120);
  },
  async act(page, mark) {
    const cols = await page.evaluate(() => [...document.querySelectorAll('#after .board .col')].map((c) => { const r = c.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height * 0.45 }; }));
    let pos = { x: 720, y: 120 };
    await sleep(900);
    for (let i = 0; i < cols.length; i++) { mark('col' + i); pos = await glideMouse(page, pos, cols[i], 1500); await sleep(1500); }
  },
};

/* ---------------- Reilly: "Since 1998" (since.mp4): starts on the photo and the line, no dwelling on the machines above, one continuous move into the next scene */
scenes['reilly-since'] = {
  name: 'since', slug: 'reilly', url: 'https://reilly.ufuk.ie/', width: 1440, height: 900, seconds: 6.6,
  async setup(page) { await at(page, 1640, 1500); },
  async act(page, mark) { mark('go'); await glideScroll(page, 1640, 2520, 6200, 'inout'); },
};

/* ---------------- Reilly: "Precision you can put in a patient" (implant.mp4): the pinned stage only, from the implant alone to the crown seated; the page never scrolls into other sections */
scenes['reilly-implant'] = {
  name: 'implant', slug: 'reilly', url: 'https://reilly.ufuk.ie/', width: 1440, height: 900, seconds: 9.0,
  async setup(page) { const top = await page.evaluate(() => document.getElementById('implant').getBoundingClientRect().top + scrollY); await at(page, top - 69, 1800); },
  async act(page, mark) { const top = await page.evaluate(() => document.getElementById('implant').getBoundingClientRect().top + scrollY - 69); mark('go'); await sleep(500); await glideScroll(page, top, top + 2150, 7600, 'inout'); },
};

/* ---------------- Fennel: the cover, only the hero as it opens (recorded from the moment the page loads) */
scenes['fennel-hero'] = {
  name: 'hero', slug: 'fennel', url: 'https://fennel.ufuk.ie/', width: 1440, height: 900, seconds: 4.6, fromLoad: true,
  async setup() {},
  async act(page, mark) { await page.goto('https://fennel.ufuk.ie/', { waitUntil: 'commit' }); mark('commit'); await sleep(4800); },
  trim: (m) => 0,
};

/* ---------------- Kenilworth: "People we trust" (trust.mp4): the whole partners section with its buttons, no site header and no banner over it */
scenes['kenilworth-trust'] = {
  name: 'trust', slug: 'kenilworth', url: 'https://kenilworth.ufuk.ie/', width: 1440, height: 640, seconds: 9.6,
  async setup(page) {
    await page.addStyleTag({ content: '.hfixed,.etab-banner,.etab-edge,.scrim,.estrip,.reg,[data-etab]{display:none!important}' });
    const r = await page.evaluate(() => { const e = document.querySelector('.sec-pwt'); const b = e.getBoundingClientRect(); return { top: b.top + scrollY, h: b.height }; });
    await at(page, r.top - 16, 1800);
  },
  async act(page, mark) {
    const cards = await page.evaluate(() => [...document.querySelectorAll('.pwt-cards .mcard')].map((c) => { const r = c.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }));
    let pos = { x: 720, y: 8 };
    await page.mouse.move(pos.x, pos.y); await sleep(700);
    for (let i = 0; i < cards.length; i++) { mark('card' + i); pos = await glideMouse(page, pos, cards[i], i ? 650 : 1000); await sleep(i === cards.length - 1 ? 1100 : 750); }
  },
};

/* ---------------- Lear: the Show Home page (homes.mp4): booking a visit, no scrolling */
scenes['lear-show-home'] = {
  name: 'homes', slug: 'lear', url: 'https://lear.ufuk.ie/show-home/', width: 1440, height: 984, seconds: 8.4,
  async setup(page) { const top = await page.evaluate(() => document.getElementById('book').getBoundingClientRect().top + scrollY); await at(page, top, 2200); await page.mouse.move(700, 100); },
  async act(page, mark) {
    const chip = (t) => page.locator('#book .chip', { hasText: t }).first();
    await sleep(1300); mark('day'); await page.locator('#book [data-days] .chip').nth(1).click();
    await sleep(1500); mark('time'); await page.locator('#book [data-times] .chip:not([disabled])').nth(2).click();
    await sleep(1500); mark('home'); await page.locator('#book [data-homes] .chip[data-home="the-court"]').click();
    await sleep(3200);
  },
};

/* ---------------- Reilly: "By machine, or by part" (toggle.mp4): the strip is already on "By part" (the switch itself is hidden,
   its space kept), the parts glide right at the cover's speed through one full round of six and settle on the part they started
   from, so the clip loops without a seam. No switching moment, nothing loads during the take. */
const stripPos = (page) => page.evaluate(() => {
  const s = document.getElementById('stripEl'), r = s.getBoundingClientRect(), c = [...s.querySelectorAll('.slot')].find((e) => e.dataset.rel === '0');
  const tx = new DOMMatrix(getComputedStyle(c).transform).m41, card = c.offsetWidth, step = card + parseFloat(getComputedStyle(s).getPropertyValue('--gap'));
  return { idx: +c.dataset.key.split(':')[1], frac: (r.width / 2 - tx - card / 2) / step, step, card, left: r.left, top: r.top, w: r.width, h: r.height };
});
scenes['reilly-parts'] = {
  name: 'toggle', slug: 'reilly', url: 'https://reilly.ufuk.ie/', width: 1440, height: 900,
  async setup(page, wait) {
    await page.locator('#sw .lab.r').click();                                   // "By part", before the take
    await page.addStyleTag({ content: '#sw{visibility:hidden!important}' });
    await page.evaluate(() => Promise.all(window.RE.families.map((f) => { const i = new Image(); i.src = '/assets/img/' + f.hero.replace(/\.(jpg|png)$/, '.webp'); return i.decode().catch(() => {}); })));
    await wait(600);
    await page.evaluate(() => dispatchEvent(new Event('resize')));             // the site draws the part strip once with the machines' sizes
                                                                                // and sits 20 px off centre until something moves: its own redraw puts it right
    await page.mouse.move(720, 60); await wait(2500);                          // everything settled: labels, side cards, images
  },
  async take(page, frame) {
    const g = await stripPos(page), y = g.top + g.h / 2, cx = g.left + g.w / 2, dz0 = g.w / 2 - g.card / 2, edge = cx + g.card / 2;
    const want = 553 / g.step;                                                  // the cover's pace: ~553 px/s
    const f = Math.sqrt(Math.max(0, (want - 0.3) / 1.5)), x = edge + f * dz0;
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    let last = g.idx + g.frac, done = 0; this.trace = [];
    const track = async () => { const p = await stripPos(page); let cur = p.idx + p.frac; while (cur - last < -3) cur += 6; while (cur - last > 3) cur -= 6; done += cur - last; last = cur; return done; };
    const shot = async () => { await frame(); this.trace.push(+((await track()) * g.step).toFixed(2)); };
    const glide = async (from, to, frames) => { for (let i = 1; i <= frames; i++) { await page.mouse.move(from + (to - from) * ease(i / frames), y); await shot(); } };
    await page.mouse.move(cx, y);                                               // the centre card: the strip stays still
    for (let i = 0; i < 30; i++) await shot();                                  // 1 s on the first part
    await page.mouse.move(edge + 1, y);                                         // just past the centre card: the slowest drive
    await glide(edge + 1, x, 10);                                               // easing up to the cover's pace
    while (done < 6 - this.lead) await shot();
    await glide(x, edge + 1, 10);                                               // easing back down to the slowest drive
    const hand = 0.3 / 7;                                                       // where the site's own snap starts at that same slow speed
    while (done < 6 - hand) await shot();
    await page.mouse.move(cx, y);                                               // onto the centre card: the snap carries it home
    for (let i = 0; i < 66; i++) await shot();                                  // settles, then rests on the part it started from
    this.travelled = done;
  },
  lead: 0.30,
};
