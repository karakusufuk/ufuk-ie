// Parses all 14 pages and checks title, description, canonical and OG image are present, unique and valid.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const site = path.join(path.dirname(new URL(import.meta.url).pathname), '../site');
const files = fs.readdirSync(site).filter((f) => f.endsWith('.html') && f !== '404.html');
const seen = { title: new Map(), desc: new Map(), canonical: new Map(), image: new Map() };
let bad = 0;
const fail = (f, m) => { console.error(`FAIL ${f}: ${m}`); bad++; };
const get = (h, re) => (h.match(re) || [])[1];
for (const f of files) {
  const h = fs.readFileSync(path.join(site, f), 'utf8');
  const head = h.slice(0, h.indexOf('</head>'));
  const v = {
    title: get(head, /<title>([^<]*)<\/title>/),
    desc: get(head, /<meta name="description" content="([^"]*)"/),
    canonical: get(head, /<link rel="canonical" href="([^"]*)"/),
    image: get(head, /<meta property="og:image" content="([^"]*)"/),
  };
  for (const k of Object.keys(v)) {
    if (!v[k]) { fail(f, 'missing ' + k); continue; }
    if (seen[k].has(v[k])) fail(f, `${k} duplicates ${seen[k].get(v[k])}`);
    seen[k].set(v[k], f);
  }
  for (const [re, label] of [[/<html lang="en"/, 'lang'], [/<meta charset="utf-8"/, 'charset'], [/viewport-fit=cover/, 'viewport'], [/name="theme-color" content="#EEF1F5"/, 'theme-color'], [/twitter:card" content="summary_large_image"/, 'twitter:card'], [/og:title/, 'og:title'], [/og:description/, 'og:description'], [/og:url/, 'og:url'], [/og:type/, 'og:type'], [/claude:/, 'preview tag']]) {
    if (label === 'preview tag' ? re.test(head) : !re.test(head)) fail(f, label);
  }
  if (v.image) {
    const img = path.join(site, v.image.replace('https://ufuk.ie/', ''));
    if (!fs.existsSync(img)) fail(f, 'og image file missing');
    else {
      const m = await sharp(img).metadata(); const size = fs.statSync(img).size;
      if (m.width !== 1200 || m.height !== 630) fail(f, `og image is ${m.width}x${m.height}`);
      if (size > 250 * 1024) fail(f, `og image ${size} bytes`);
    }
  }
}
console.log(bad ? `${bad} problems` : `OK: ${files.length} pages, titles/descriptions/canonicals/OG images unique and valid`);
process.exit(bad ? 1 : 0);
