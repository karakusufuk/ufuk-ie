// Builds the project pages of ufuk.ie from content.mjs.
// Usage (from the tools folder): npm install, then `node build.mjs` — writes <slug>.html into ../site.
// Frame sizes come from the real poster images in ../site/img/d/<slug>/, so add media before building.
import fs from 'node:fs';
import path from 'node:path';
import { pages } from './content.mjs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require('sharp');
const MEDIA = process.env.MEDIA || path.join(path.dirname(new URL(import.meta.url).pathname), '../site/img/d');
const dims = {};
async function measure() {
  for (const pg of pages) for (const f of fs.existsSync(path.join(MEDIA, pg.slug)) ? fs.readdirSync(path.join(MEDIA, pg.slug)) : []) {
    if (!f.endsWith('.jpg')) continue;
    const m = await sharp(path.join(MEDIA, pg.slug, f)).metadata(); dims[pg.slug + '/' + f.replace(/\.jpg$/, '')] = m.width + '/' + m.height;
  }
}
await measure();

const OUT = process.argv[2] || path.join(path.dirname(new URL(import.meta.url).pathname), '../site');
fs.mkdirSync(OUT, { recursive: true });
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const D = (slug) => `img/d/${slug}/`;

function media(m, slug, cls = '') {
  const base = D(slug);
  const key = slug + '/' + (m.v || m.i || (m.pair && m.pair[0]) || '').replace(/\.(mp4|jpg)$/, '');
  const real = dims[key];
  if (!real) console.log('  missing media', key);
  const arv = m.phone ? null : (real || m.ar);
  const ar = arv ? ` style="aspect-ratio:${arv}"` : '';
  const k = ['frame', m.phone ? 'phone' : '', m.dark ? 'dark' : '', m.pair ? 'pair' : '', cls].filter(Boolean).join(' ');
  if (m.v) return `<div class="${k}"${ar}><video data-src="${base}${m.v}?v=4" poster="${base}${m.v.replace(/\.mp4$/, '.jpg')}?v=4" muted loop playsinline preload="none" aria-label="${esc(m.alt || '')}"></video></div>`;
  if (m.pair) return `<div class="${k}"${ar} role="img" aria-label="${esc(m.alt || '')}">${m.pair.map((f) => `<img src="${base}${f}?v=4" alt="" loading="lazy">`).join('')}</div>`;
  return `<div class="${k}"${ar}><img src="${base}${m.i}?v=4" alt="${esc(m.alt || '')}" loading="lazy"></div>`;
}

function block(b, slug) {
  const span = b.span || 7;
  const side = b.side || 'l';
  const mediaCol = side === 'l' ? `1 / span ${span}` : `${13 - span} / span ${span}`;
  const noteSpan = Math.min(4, 12 - span);
  const noteCol = side === 'l' ? `${13 - noteSpan} / span ${noteSpan}` : `1 / span ${noteSpan}`;
  const pin = b.pin != null && b.b ? ` data-pin="${[].concat(b.pin)[0]}"` : '';
  const valign = b.valign ? `;align-self:${b.valign}` : '';
  return `<div class="blk"${pin}>
  <div class="media" style="grid-column:${mediaCol}">${media(b.m, slug)}</div>
  ${b.b ? `<div class="note" style="grid-column:${noteCol}${valign}"><b>${esc(b.b)}</b><p>${esc(b.p)}</p></div>` : ''}${pin ? '\n  <svg class="pin" aria-hidden="true"></svg><svg class="pin-in" aria-hidden="true"></svg>' : ''}
</div>`;
}

function section(s, slug) {
  if (s.t === 'cover') return `<figure class="cover" style="margin:0 auto">${media(s.m, slug)}</figure>`;
  let inner = '';
  if (s.blocks) inner = s.blocks.map((b) => block(b, slug)).join('\n');
  if (s.t === 'phones') inner = `<div class="phones">${s.items.map((it) => `<figure>${media({ ...it.m, phone: true }, slug)}<figcaption>${esc(it.cap)}</figcaption></figure>`).join('')}</div>`;
  if (s.t === 'kit') {
    const fonts = s.fonts.map((f) => `<div class="type-row"><div class="aa" style="font-family:${f.css};font-weight:${f.w || 600}">Aa</div><div class="nm">${esc(f.name)} · ${esc(f.role)}</div><div class="sp" style="font-family:${f.css};font-weight:${f.ws || 400}">${esc(f.sample)}</div></div>`).join('');
    const sw = s.colours.map((c) => `<div><i style="background:${c.hex}${c.edge ? ';box-shadow:inset 0 0 0 1px #DCE1E8' : ''}"></i><span>${esc(c.name)}</span></div>`).join('');
    inner = `<div class="kit"><div class="p"><small>Type</small>${fonts}</div><div class="p"><small>Colour</small><div class="sw">${sw}</div></div></div>`;
  }
  return `<section class="sec wrap"${s.id ? ` id="${s.id}"` : ''}>${s.h ? `<h2>${esc(s.h)}</h2>` : ''}${s.lede ? `<p class="lede">${esc(s.lede)}</p>` : ''}
${inner}
</section>`;
}

function deep(d) {
  if (!d) return '';
  const rows = d.rows.map((r) => `<div class="deep-row"><h3>${esc(r.h)}</h3><div class="tx">${(r.ps || []).map((p) => `<p>${esc(p)}</p>`).join('')}${r.vs ? `<div class="vs">${r.vs.map((x) => `<div><p class="o">${esc(x.o)}</p><p class="me">${esc(x.me)}</p></div>`).join('')}</div>` : ''}${r.li ? `<ul>${r.li.map((l) => `<li>${l.b ? `<b>${esc(l.b)}</b> ` : ''}${esc(l.t)}</li>`).join('')}</ul>` : ''}${r.flow ? `<div class="flow">${r.flow.map((f) => `<div><span>${esc(f[0])}</span><i style="width:${f[1]}%"></i></div>`).join('')}</div>` : ''}</div></div>`).join('');
  return `<section class="deep wrap"><h2>${esc(d.h)}</h2><p class="lede">${esc(d.lede)}</p>${rows}</section>`;
}

const WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.66 15l-1.3 4.76 4.88-1.28A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-2.9.76.78-2.83-.2-.3A8.2 8.2 0 1 1 12 20.2z"/><path fill="currentColor" d="M16.6 14.1c-.25-.13-1.48-.73-1.7-.81-.23-.08-.4-.13-.56.12-.17.25-.65.81-.8.98-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.23.9 2.43 1.03 2.6.12.16 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.48-.6 1.69-1.19.21-.58.21-1.08.15-1.19-.06-.1-.23-.17-.48-.29z"/></svg>';

for (const pg of pages) {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(pg.title)}</title>
<script>try{history.scrollRestoration='manual'}catch(e){}if(!location.hash){document.documentElement.className='pre';window.scrollTo(0,0);setTimeout(function(){document.documentElement.classList.remove('pre')},1500);}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600&family=Geist:wght@400;500&display=swap">
${pg.fontLink ? `<link rel="stylesheet" href="${pg.fontLink}">\n` : ''}<link rel="stylesheet" href="work.css">
</head><body>
<header class="top"><a class="mark" href="index.html">ufuk.ie</a><nav aria-label="Main"><a href="work.html" aria-current="page">Work</a><a href="about.html">About</a><a href="index.html#contact">Contact</a></nav></header>
<div class="veil" aria-hidden="true"></div><div class="laser" aria-hidden="true"></div>

<main>
<section class="open" aria-label="${esc(pg.title)}">
  <div class="open-in"><div class="wrap"><h1>${pg.name.map((n) => `<span>${esc(n)}</span>`).join('')}</h1><p class="sum">${esc(pg.sum)}</p></div></div>
  <div class="facts"><div class="wrap"><dl>
    <div><dt>Sector</dt><dd>${esc(pg.facts.sector)}</dd></div>
    <div><dt>Role</dt><dd>${esc(pg.facts.role)}</dd></div>
    <div><dt>Built with</dt><dd>${esc(pg.facts.built)}</dd></div>
    <a class="live-top" href="${pg.live}" target="_blank" rel="noopener">Visit the live site <i aria-hidden="true">↓</i></a>
  </dl></div></div>
</section>

${pg.sections.map((s) => section(s, pg.slug)).join('\n\n')}

${deep(pg.deep)}

<section class="closing wrap"><p>${esc(pg.closing || 'Every screen on this page is a recording of the live site.')}</p><a class="btn" href="${pg.live}" target="_blank" rel="noopener">Visit the live site</a></section>
<section class="next wrap" aria-label="Next project"><a href="${pg.next.slug}.html"><div><small>Next project</small><b>${esc(pg.next.name)}</b><span>${esc(pg.next.sub)}</span></div>${`<div class="frame"><img src="${pg.next.img}" alt="" loading="lazy"></div>`}</a></section>
</main>

<div class="end"><footer class="foot">
  <h2>Tell me about your business.</h2>
  <div class="row"><a class="btn" href="https://wa.me/353832079387?text=Hi%20Ufuk%2C%20I%20found%20you%20on%20ufuk.ie." target="_blank" rel="noopener">${WA}Chat on WhatsApp</a><span class="mail">hello@ufuk.ie</span></div>
  <div class="base"><span>Ufuk Karakuş · Designer and developer · Ireland</span><span>© 2026 ufuk.ie</span></div>
</footer></div>
<div class="dock" aria-label="Quick links"><a class="btn" href="${pg.live}" target="_blank" rel="noopener">Visit the live site</a></div>
<script src="work.js"></script>
</body></html>
`;
  fs.writeFileSync(path.join(OUT, pg.slug + '.html'), html);
  console.log('built', pg.slug);
}
