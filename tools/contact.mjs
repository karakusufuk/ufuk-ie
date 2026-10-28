// Adds the Instagram grid to the hand-written pages (index, work, about) and points their "Contact" links at contact.html.
// Idempotent (run: npm run contact). Project pages, the 404 and contact.html get theirs from build.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { igBlock, IG_HEAD, IG_SCRIPT } from './ig.mjs';

const site = path.join(path.dirname(new URL(import.meta.url).pathname), '../site');
const edit = (name, fn) => { const f = path.join(site, name + '.html'); const a = fs.readFileSync(f, 'utf8'); const b = fn(a); if (a !== b) { fs.writeFileSync(f, b); console.log('updated', name); } };
const once = (html, marker, fn) => (html.includes(marker) ? html : fn(html));
const must = (html, needle, what) => { if (!html.includes(needle)) throw new Error('not found: ' + what); return html; };
const addCss = (h) => once(h, 'href="ig.css"', (x) => x.replace('<link rel="stylesheet" href="fonts/fonts.css">', `<link rel="stylesheet" href="fonts/fonts.css">\n${IG_HEAD()}`));
const addJs = (h) => once(h, 'src="ig.js"', (x) => x.replace(/<\/body>/, `${IG_SCRIPT()}\n</body>`));
const addBlock = (h, after) => once(h, 'data-ig', (x) => must(x, after, 'block anchor').replace(after, `${after}\n  ${igBlock()}`));

edit('index', (h) => addJs(addCss(addBlock(h.replaceAll('<a href="#contact">Contact</a>', '<a href="contact.html">Contact</a>'), '<span class="contact-mail">hello@ufuk.ie</span>\n  </div>'))));
edit('work', (h) => addJs(addCss(addBlock(h.replaceAll('<a href="index.html#contact">Contact</a>', '<a href="contact.html">Contact</a>'), '<span class="contact-mail">hello@ufuk.ie</span></div>'))));
edit('about', (h) => addJs(addCss(addBlock(h.replaceAll('<a href="index.html#contact">Contact</a>', '<a href="contact.html">Contact</a>'), '<span class="mail">hello@ufuk.ie</span></div>'))));
