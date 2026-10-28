// Opens https://ufuk.ie in Chrome with its DNS pinned to a GitHub Pages address (so a stale local DNS cache cannot hide the result).
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome', args: ['--host-resolver-rules=MAP ufuk.ie 185.199.108.153, MAP www.ufuk.ie 185.199.108.153'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); const errs = [];
p.on('console', (m) => m.type() === 'error' && errs.push(m.text())); p.on('response', (r) => r.status() >= 400 && errs.push(r.status() + ' ' + r.url()));
for (const path of ['', 'work.html', 'about.html', 'contact.html', 'brennock.html', 'midland.html']) {
  const r = await p.goto('https://ufuk.ie/' + path, { waitUntil: 'load' }); await p.waitForTimeout(1200);
  console.log(String(r.status()).padEnd(4), ('/' + path).padEnd(16), (await p.title()).padEnd(52), 'canonical', await p.evaluate(() => document.querySelector('link[rel=canonical]').href));
}
const r = await p.goto('https://ufuk.ie/does-not-exist/deep', { waitUntil: 'load' }); await p.waitForTimeout(800);
console.log(String(r.status()).padEnd(4), '/does-not-exist  ', await p.title(), '| styled:', await p.evaluate(() => getComputedStyle(document.querySelector('h1')).fontFamily.includes('Bricolage')), '| links:', await p.evaluate(() => [...document.querySelectorAll('main a')].map((a) => a.pathname).join(' ')));
await p.click('main a[href="/work.html"]'); await p.waitForLoadState(); console.log('404 link "See the work" ->', p.url());
await p.goto('http://www.ufuk.ie/', { waitUntil: 'load' }).catch(() => {}); console.log('http://www.ufuk.ie/ ends at', p.url());
console.log('console errors/404s (excluding the deliberate 404 page):', errs.filter((e) => !/does-not-exist/.test(e)));
await b.close();
