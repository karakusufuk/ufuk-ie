// Generates the 1200x630 sharing images into ../site/img/og/ (run: npm run og).
// Text is rendered in Chromium so the real Bricolage Grotesque file is used, then saved as JPEG with sharp.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { chromium } from 'playwright';
import { pages } from './content.mjs';

const here = path.dirname(new URL(import.meta.url).pathname);
const site = path.join(here, '../site');
const out = path.join(site, 'img/og');
fs.mkdirSync(out, { recursive: true });
const font = path.join(here, 'node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-opsz-normal.woff2');
const fontExt = font.replace('-latin-', '-latin-ext-');
const css = `@font-face{font-family:B;src:url(data:font/woff2;base64,${fs.readFileSync(font).toString('base64')}) format('woff2');font-weight:200 800}
@font-face{font-family:B;src:url(data:font/woff2;base64,${fs.readFileSync(fontExt).toString('base64')}) format('woff2');font-weight:200 800;unicode-range:U+0100-02BA,U+1E00-1EFF}
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;position:relative;overflow:hidden;font-family:B,sans-serif;font-weight:600}`;

const cover = (pg) => {
  const c = pg.sections.find((s) => s.t === 'cover');
  return path.join(site, 'img/d', pg.slug, c.m.v.replace(/\.mp4$/, '.jpg'));
};
const asData = (f) => 'data:image/jpeg;base64,' + fs.readFileSync(f).toString('base64');

const projectCard = (src, title) => `<body style="background:#EEF1F5"><img src="${src}" style="position:absolute;left:260px;top:36px;width:680px;height:425px;object-fit:cover"><div style="position:absolute;left:64px;bottom:64px;font-size:60px;line-height:1;letter-spacing:-.015em;color:#1A2238">${title}</div></body>`;

const cards = [
  ...['index', 'work', 'about', 'contact'].map((n) => ({
    name: n,
    html: `<body style="background:#151C2E"><h1 style="position:absolute;left:64px;right:64px;bottom:64px;font-size:84px;line-height:1.04;letter-spacing:-.02em;color:#F7D2DE;font-weight:600">${n === 'contact' ? 'Tell me about your business.' : 'You know your business. I know what it needs online.'}</h1><div style="position:absolute;left:64px;top:56px;font-size:34px;color:#EEF1F5">ufuk.ie</div></body>`,
  })),
  ...pages.map((pg) => ({ name: pg.slug, html: projectCard(asData(cover(pg)), pg.title) })),
  // the hand-built app pages (kus.html and the three apps.mjs writes): the picture is the page's own card.jpg
  ...[['kus', 'KUS'], ['master-id', 'Master ID'], ['passpath', 'PassPath'], ['match-id', 'Match ID']].map(([slug, title]) => ({
    name: slug, html: projectCard(asData(path.join(site, 'img/d', slug, 'card.jpg')), title),
  })),
];

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const c of cards) {
  await page.setContent(`<style>${css}</style>${c.html}`);
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot();
  const file = path.join(out, c.name + '.jpg');
  await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(file);
  console.log(c.name, fs.statSync(file).size);
}
await browser.close();
