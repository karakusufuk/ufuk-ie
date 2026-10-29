// Usage: node net-check.mjs <baseUrl>. Loads all 19 pages, fails on any request to Google, any >=400 response, or a missing font.
import { chromium } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8101').replace(/\/?$/, '/');
const pages = ['index', 'work', 'about', 'contact', 'brennock', 'reilly', 'bawn', 'fennel', 'kenilworth', 'garvey', 'tierney', 'midland', 'monument', 'lear', 'ashgrove', 'kus', 'master-id', 'passpath', 'match-id'];
const b = await chromium.launch({ channel: 'chrome' });
let bad = 0;
for (const p of pages) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
  const urls = []; page.on('request', (r) => urls.push(r.url()));
  const errs = []; page.on('response', (r) => r.status() >= 400 && errs.push(r.status() + ' ' + r.url()));
  await page.goto(base + p + '.html', { waitUntil: 'load' }); await page.waitForTimeout(2500);
  const fonts = await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family + ' ' + f.weight); });
  const google = urls.filter((u) => /fonts\.(googleapis|gstatic)\.com/.test(u));
  if (google.length || errs.length) { bad++; console.log('FAIL', p, google, errs); } else console.log('ok', p, [...new Set(fonts)].join(', '));
  await ctx.close();
}
await b.close(); console.log(bad ? bad + ' failing pages' : 'no Google requests, no errors'); process.exit(bad ? 1 : 0);
