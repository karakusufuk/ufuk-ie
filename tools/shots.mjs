// Usage: node shots.mjs <baseUrl> <outDir> [browser]
// Screenshots all 14 pages at 1440x900 and 1920x1080 (top, then every 900px), logs console errors and 404s.
import { chromium, webkit, firefox } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [base, out, bname = 'chromium'] = process.argv.slice(2);
const pages = ['index', 'work', 'about', 'contact', 'brennock', 'reilly', 'bawn', 'fennel', 'kenilworth', 'garvey', 'tierney', 'midland', 'monument', 'lear', 'ashgrove'];
const sizes = [[1440, 900], [1920, 1080]];
const type = { chromium, webkit, firefox }[bname];
const browser = await type.launch(bname === 'chromium' ? { channel: 'chrome' } : {});
let problems = 0;
// Pin every loaded video to its first frame so screenshots do not depend on decode timing.
const pin = async () => {
  // slow connections: wait until the videos in and near the viewport have really loaded their first frame
  for (let t0 = Date.now(); Date.now() - t0 < 8000;) { const pending = [...document.querySelectorAll('video')].filter((v) => (v.currentSrc || v.getAttribute('src')) && v.readyState < 2 && v.getBoundingClientRect().bottom > -300 && v.getBoundingClientRect().top < innerHeight + 300); if (!pending.length) break; await new Promise((r) => setTimeout(r, 150)); }
  await Promise.all([...document.querySelectorAll('video')].filter((v) => v.readyState > 0).map((v) => new Promise((res) => {
    v.pause(); if (v.currentTime === 0) return res();
    v.addEventListener('seeked', res, { once: true }); v.currentTime = 0; setTimeout(res, 800);
  })));
  await new Promise((r) => setTimeout(r, 150));
};
for (const [w, h] of sizes) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  for (const p of pages) {
    const page = await ctx.newPage();
    await page.addInitScript(() => { HTMLMediaElement.prototype.play = function () { return Promise.resolve(); }; });
    const errs = [];
    page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    page.on('pageerror', (e) => errs.push(String(e)));
    page.on('response', (r) => r.status() >= 400 && errs.push(r.status() + ' ' + r.url()));
    await page.goto(base.replace(/\/?$/, '/') + p + '.html', { waitUntil: 'load' });
    await page.waitForTimeout(+(process.env.WAIT || 3000));
    await page.evaluate(pin);
    const dir = path.join(out, `${w}`); fs.mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: path.join(dir, p + '-0.png') });
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = h, i = 1; y < total && i < 40; y += h, i++) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(250);
      await page.evaluate(pin);
      await page.screenshot({ path: path.join(dir, `${p}-${i}.png`) });
    }
    if (errs.length) { problems++; console.log(w, p, errs.slice(0, 5)); }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
console.log(problems ? 'PROBLEMS: ' + problems : 'no console errors / 404s');
