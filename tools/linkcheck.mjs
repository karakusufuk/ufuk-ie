// Clicks nothing, follows every link: all internal links on all pages (status + hash targets), then every external link (status).
// WhatsApp is only checked for its URL shape, nothing is sent. node linkcheck.mjs <baseUrl>
import { chromium } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8101').replace(/\/?$/, '/');
const pages = ['index', 'work', 'about', 'contact', 'brennock', 'reilly', 'bawn', 'fennel', 'kenilworth', 'garvey', 'tierney', 'midland', 'monument', 'lear', 'ashgrove', '404'];
const b = await chromium.launch({ channel: 'chrome' }); const ctx = await b.newContext({ ignoreHTTPSErrors: false }); const p = await ctx.newPage();
const internal = new Map(), external = new Map();
for (const pg of pages) {
  await p.goto(base + pg + '.html', { waitUntil: 'load' }).catch(() => {});
  const links = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => ({ href: a.getAttribute('href'), abs: a.href, text: a.textContent.trim().replace(/\s+/g, ' ').slice(0, 30) })));
  for (const l of links) { if (/^(mailto:|tel:|javascript:)/.test(l.href)) continue; const u = new URL(l.abs); const isInternal = u.origin === new URL(base).origin; const m = isInternal ? internal : external; const key = isInternal ? u.pathname + u.hash : l.abs; if (!m.has(key)) m.set(key, { from: [], text: l.text }); m.get(key).from.push(pg); }
}
let bad = 0;
console.log(`${internal.size} internal and ${external.size} external distinct link targets on ${pages.length} pages`);
// internal
const origin = new URL(base).origin;
for (const [key] of internal) {
  const [path, hash] = key.split('#'); const url = origin + path;
  const r = await ctx.request.get(url, { failOnStatusCode: false });
  let st = r.status(), note = '';
  if (hash && st === 200) { const txt = await r.text(); if (!txt.includes(`id="${hash}"`)) { st = 'missing #' + hash; } }
  if (st !== 200 && !/404\.html$/.test(path)) { bad++; console.log('DEAD internal', key, st, '<-', internal.get(key).from.join(',')); }
}
// external
const rows = [];
for (const [url, v] of external) {
  if (/^https:\/\/wa\.me\//.test(url)) { const ok = /^https:\/\/wa\.me\/353832079387\?text=Hi%20Ufuk%2C%20I%20found%20you%20on%20ufuk\.ie\.$/.test(url); rows.push([url.slice(0, 40) + '…', ok ? 'URL shape ok, not opened' : 'URL CHANGED']); if (!ok) bad++; continue; }
  const r = await ctx.request.get(url, { failOnStatusCode: false, timeout: 20000, maxRedirects: 5 }).catch((e) => ({ status: () => 'error: ' + String(e.message).split('\n')[0].slice(0, 60) }));
  rows.push([url, r.status()]);
}
console.log('external targets:'); for (const [u, s] of rows) console.log('  ' + String(s).padEnd(28) + u);
const deadExt = rows.filter(([, s]) => typeof s !== 'number' ? !/not opened|shape ok/.test(s) : s >= 400);
console.log(deadExt.length ? 'EXTERNAL PROBLEMS: ' + deadExt.map(([u, s]) => `${u} (${s})`).join(' | ') : 'all external links answer');
await b.close();
console.log(bad ? bad + ' dead internal links' : 'all internal links work');
