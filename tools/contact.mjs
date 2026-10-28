// Adds the Instagram grid to the hand-written pages (index, work, about) and points their "Contact" links at contact.html.
// Idempotent (run: npm run contact). Project pages, the 404 and contact.html get theirs from build.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { igBlock, IG_HEAD, IG_SCRIPT } from './ig.mjs';

const site = path.join(path.dirname(new URL(import.meta.url).pathname), '../site');
const edit = (name, fn) => { const f = path.join(site, name + '.html'); const a = fs.readFileSync(f, 'utf8'); const b = fn(a); if (a !== b) { fs.writeFileSync(f, b); console.log('updated', name); } };
const once = (html, marker, fn) => (html.includes(marker) ? html : fn(html));
const must = (html, needle, what) => { if (!html.includes(needle)) throw new Error('not found: ' + what); return html; };
const addCss = (h) => once(h, 'href="ig.css"', (x) => x.replace('<link rel="stylesheet" href="fonts/fonts.css">', `<link rel="stylesheet" href="fonts/fonts.css">\n${IG_HEAD('', true)}`));
// reload/back behaviour (tools/nav.js) is inlined: a 1 KB external script in the head would hold up the first paint on a slow connection
const asyncCss = (h) => (h.includes('onload="this.media=') ? h : h.replace('<link rel="stylesheet" href="ig.css">', () => IG_HEAD('', true)));
const NAV = fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'nav.js'), 'utf8').trim();
const inlineNav = (h) => { const tag = `<script id="nav">${NAV}</script>`; if (/<script id="nav">[\s\S]*?<\/script>/.test(h)) return h.replace(/<script id="nav">[\s\S]*?<\/script>/, () => tag); if (h.includes('<script src="nav.js"></script>')) return h.replace('<script src="nav.js"></script>', () => tag); return h.replace('<link rel="manifest" href="site.webmanifest">', () => `<link rel="manifest" href="site.webmanifest">${tag}`); };
const addJs = (h) => once(h, 'src="ig.js"', (x) => x.replace(/<\/body>/, `${IG_SCRIPT()}\n</body>`));
const addBlock = (h, after) => once(h, 'data-ig', (x) => must(x, after, 'block anchor').replace(after, `${after}\n  ${igBlock()}`));

edit('index', (h) => asyncCss(inlineNav(addJs(addCss(addBlock(h.replaceAll('<a href="#contact">Contact</a>', '<a href="contact.html">Contact</a>'), '<span class="contact-mail">hello@ufuk.ie</span>\n  </div>'))))));
edit('work', (h) => asyncCss(inlineNav(addJs(addCss(addBlock(h.replaceAll('<a href="index.html#contact">Contact</a>', '<a href="contact.html">Contact</a>'), '<span class="contact-mail">hello@ufuk.ie</span></div>'))))));
edit('about', (h) => asyncCss(inlineNav(addJs(addCss(addBlock(h.replaceAll('<a href="index.html#contact">Contact</a>', '<a href="contact.html">Contact</a>'), '<span class="mail">hello@ufuk.ie</span></div>'))))));

// Work page: the cards are dealt into the columns before the first paint, so all card images are requested at once.
// Everything after the first four cards asks for low priority so the first row and the text are not slowed down.
edit('work', (h) => { let n = 0; return h.replace(/(<div class="card-img"><img )(?![^>]*fetchpriority)([^>]*>)/g, (m, a, b) => (++n > 4 ? `${a}fetchpriority="low" ${b}` : m)); });
// the Instagram photos are secondary content: low fetch priority on every page
for (const name of ['index', 'work', 'about']) edit(name, (h) => h.replace(/(<img src="img\/ig\/\d+\.jpg" width="600" height="600" alt="" loading="lazy")(>)/g, '$1 fetchpriority="low"$2'));
