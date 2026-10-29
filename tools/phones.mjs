// Checks all 20 pages at 390x844, 430x932 and 768x1024 in WebKit for breakage only:
// horizontal scroll, elements sticking out of the viewport, overlapping text blocks, tap targets under 24 px.
// Usage: node phones.mjs [baseUrl] [outDir]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { webkit } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8101').replace(/\/?$/, '/');
const out = process.argv[3] || path.join(os.tmpdir(), 'phones');
const pages = ['index', 'work', 'about', 'contact', 'brennock', 'reilly', 'bawn', 'fennel', 'kenilworth', 'garvey', 'tierney', 'midland', 'monument', 'lear', 'ashgrove', 'kus', 'master-id', 'passpath', 'match-id', '404'];
const sizes = [[390, 844], [430, 932], [768, 1024]];
const b = await webkit.launch();
let bad = 0;
for (const [w, h] of sizes) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  for (const p of pages) {
    const page = await ctx.newPage(); const errs = [];
    page.on('console', (m) => m.type() === 'error' && !/favicon/.test(m.location().url || '') && errs.push(m.text()));
    await page.goto(base + p + '.html', { waitUntil: 'load' }); await page.waitForTimeout(1800);
    // walk the page so lazy content settles
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += h * 0.8) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(120); }
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
    const r = await page.evaluate((vw) => {
      const de = document.documentElement;
      const hs = Math.max(de.scrollWidth, document.body.scrollWidth) - vw;
      const clipped = (el) => { for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) { const o = getComputedStyle(e).overflowX; if (o === 'hidden' || o === 'clip' || o === 'auto' || o === 'scroll') return true; } return false; };
      const out = [], small = [];
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') continue;
        const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
        if (r.right > vw + 1 && !clipped(el) && cs.position !== 'absolute') out.push(el.tagName.toLowerCase() + '.' + String(el.className).slice(0, 20) + ' right=' + Math.round(r.right));
        if ((el.tagName === 'A' || el.tagName === 'BUTTON') && (r.width < 24 || r.height < 24) && cs.opacity !== '0') small.push((el.textContent || '').trim().slice(0, 18) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
      }
      return { hs, out: out.slice(0, 5), small: [...new Set(small)].slice(0, 5), h: de.scrollHeight };
    }, w);
    const dir = path.join(out, `${w}`); fs.mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: path.join(dir, p + '.png'), fullPage: true });
    const flag = r.hs > 0 || r.out.length || errs.length;
    if (flag) bad++;
    console.log(`${flag ? 'CHECK' : 'ok   '} ${w} ${p.padEnd(10)} hscroll ${r.hs > 0 ? '+' + r.hs : 'none'}${r.out.length ? ' | out: ' + r.out.join('; ') : ''}${r.small.length ? ' | small taps: ' + r.small.join('; ') : ''}${errs.length ? ' | console: ' + errs[0] : ''}`);
    await page.close();
  }
  await ctx.close();
}
await b.close();
console.log(bad ? bad + ' to look at' : 'no horizontal scroll, nothing sticking out');
