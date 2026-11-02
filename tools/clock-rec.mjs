// Records the Arrival programme of the live Ashgrove site (mobile view, 390 px wide, WebKit) as an image sequence for the "clock" block
// on ashgrove.html. The page is stepped to exact scroll positions (no real-time scrolling), so every frame is sharp and the spacing is even:
// frame 0 is the moment the clock appears at 16:00, the last frame is the last stop (Sunday 11:00, goodbye).
// Usage: node clock-rec.mjs [url] [frames] [quality]      writes ../site/img/d/ashgrove/clock/NNN.webp and clock.json
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { webkit, devices } from 'playwright';

const url = process.argv[2] || 'https://ashgrove.ufuk.ie/';
const N = +process.argv[3] || 216;
const Q = +process.argv[4] || 62;
const W = 390, H = 844, DPR = 1.5;
const out = path.join(path.dirname(new URL(import.meta.url).pathname), '../site/img/d/ashgrove/clock');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const br = await webkit.launch();
const ctx = await br.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: DPR, isMobile: true, hasTouch: true, userAgent: devices['iPhone 13'].userAgent });
const page = await ctx.newPage();
await page.route('**/*', (r) => r.continue({ headers: { ...r.request().headers(), 'cache-control': 'no-cache' } }));
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction(() => document.getElementById('intro').classList.contains('done'), null, { timeout: 90000, polling: 100 });
await page.addStyleTag({ content: '.st-clock{transition:none!important}' });
// every photo of the programme, and its copy under the glass, must be decoded before the first frame
await page.evaluate(async () => {
  const ims = [...document.querySelectorAll('#story img')];
  ims.forEach((i) => { i.loading = 'eager'; });
  await Promise.all(ims.map((i) => (i.complete && i.naturalWidth ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
  await Promise.all(ims.map((i) => i.decode().catch(() => 0)));
});
await page.waitForTimeout(800);
const g = await page.evaluate(() => {
  const lis = [...document.querySelectorAll('#story > .st-list > ol > li')].map((l) => { const r = l.getBoundingClientRect(); return r.top + scrollY + r.height / 2; });
  const D = document.getElementById('stClock').offsetHeight, top = document.getElementById('story').getBoundingClientRect().top + scrollY;
  return { lis, D, top, ih: innerHeight };
});
const y0 = Math.ceil(g.top - (g.ih / 2 - g.D / 2)) + 2;       // the section fills the clock's place: it appears, showing 16:00
const y1 = g.lis[g.lis.length - 1] - g.ih / 2;                  // the last stop (goodbye) at the centre
const raf = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
for (let i = 0; i < N; i++) {
  const y = y0 + (y1 - y0) * i / (N - 1);
  await page.evaluate((v) => scrollTo(0, v), y);
  await raf(); await page.waitForTimeout(40);
  const png = await page.screenshot({ type: 'png' });
  await sharp(png).webp({ quality: Q, effort: 6, smartSubsample: true }).toFile(path.join(out, String(i).padStart(3, '0') + '.webp'));
  if (i % 24 === 0) process.stdout.write(`${i} `);
}
const first = await sharp(path.join(out, '000.webp')).metadata();
fs.writeFileSync(path.join(out, 'clock.json'), JSON.stringify({ frames: N, width: first.width, height: first.height, source: url, scroll: [y0, y1], stops: g.lis.map((l) => +((l - g.ih / 2 - y0) / (y1 - y0)).toFixed(4)) }));
await br.close();
const bytes = fs.readdirSync(out).filter((f) => f.endsWith('.webp')).reduce((n, f) => n + fs.statSync(path.join(out, f)).size, 0);
console.log(`\n${N} frames ${first.width}x${first.height}, ${(bytes / 1e6).toFixed(1)} MB`);
