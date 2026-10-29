// Copies the self-hosted font files from node_modules into ../site/fonts and writes the CSS (run: npm run fonts).
// fonts/fonts.css = site fonts (every page). fonts/p-<slug>.css = the specimen fonts of one project page only.
// Also swaps the Google Fonts links in index/work/about for the local ones (idempotent).
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
const site = path.join(here, '../site');
const out = path.join(site, 'fonts');
fs.mkdirSync(out, { recursive: true });
const nm = path.join(here, 'node_modules');

const RANGE = {
  latin: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
  'latin-ext': 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
};
const copied = new Set();
// Weight ranges are limited to what the Google Fonts links served before (e.g. Geist 400-500), so text asking for
// another weight is synthesised by the browser exactly as it was in the approved export.
// face(family, pkg, file stem without subset, weight descriptor, extra descriptors)
function face(family, pkg, stem, weight, extra = '') {
  return ['latin', 'latin-ext'].map((sub) => {
    const file = `${stem.replace('{s}', sub)}.woff2`;
    if (!copied.has(file)) { fs.copyFileSync(path.join(nm, pkg, 'files', file), path.join(out, file)); copied.add(file); }
    return `@font-face{font-family:'${family}';font-style:normal;font-display:swap;font-weight:${weight};${extra}src:url(${file}) format('woff2');unicode-range:${RANGE[sub]}}`;
  }).join('\n');
}
const st = (family, id, weights) => weights.map((w) => face(family, `@fontsource/${id}`, `${id}-{s}-${w}-normal`, w)).join('\n');

const base = [
  face('Bricolage Grotesque', '@fontsource-variable/bricolage-grotesque', 'bricolage-grotesque-{s}-opsz-normal', '500 600'),
  face('Geist', '@fontsource-variable/geist', 'geist-{s}-wght-normal', '400 500'),
].join('\n');
fs.writeFileSync(path.join(out, 'fonts.css'), base + '\n');

const archivo = () => face('Archivo', '@fontsource-variable/archivo', 'archivo-{s}-wdth-normal', '800', 'font-stretch:125%;');
const perPage = {
  brennock: [archivo(), st('Instrument Sans', 'instrument-sans', [400, 600])],
  reilly: [st('IBM Plex Sans Condensed', 'ibm-plex-sans-condensed', [600]), st('IBM Plex Sans', 'ibm-plex-sans', [400]), st('IBM Plex Mono', 'ibm-plex-mono', [400])],
  bawn: [st('Outfit', 'outfit', [600, 700]), st('Figtree', 'figtree', [400, 500])],
  fennel: [st('Geist Mono', 'geist-mono', [400])],
  kenilworth: [face('Source Serif 4', '@fontsource-variable/source-serif-4', 'source-serif-4-{s}-opsz-normal', '600'), st('Hanken Grotesk', 'hanken-grotesk', [400, 600])],
  tierney: [st('Rubik', 'rubik', [500, 700])],
  midland: [archivo(), st('IBM Plex Sans', 'ibm-plex-sans', [400])],
  monument: [st('Libre Caslon Display', 'libre-caslon-display', [400]), st('Hanken Grotesk', 'hanken-grotesk', [400])],
  lear: [st('Gloock', 'gloock', [400]), st('Instrument Sans', 'instrument-sans', [400])],
  ashgrove: [st('Anton', 'anton', [400]), st('Manrope', 'manrope', [400, 600])],
  // the four app pages draw the text inside their app screens (leaderboard rows, typed message, notification) in Inter
  kus: [st('Inter', 'inter', [400, 500, 600, 700])],
  'master-id': [st('Inter', 'inter', [400, 500, 600, 700])],
  passpath: [st('Inter', 'inter', [400, 500, 600, 700])],
  'match-id': [st('Inter', 'inter', [400, 500, 600, 700])],
};
for (const [slug, parts] of Object.entries(perPage)) fs.writeFileSync(path.join(out, `p-${slug}.css`), parts.join('\n') + '\n');

// Hand-written pages: replace the Google links.
const PRELOAD = `<link rel="preload" as="font" type="font/woff2" href="fonts/bricolage-grotesque-latin-opsz-normal.woff2" crossorigin><link rel="preload" as="font" type="font/woff2" href="fonts/geist-latin-wght-normal.woff2" crossorigin>
<link rel="stylesheet" href="fonts/fonts.css">`;
for (const name of ['index', 'work', 'about']) {
  const f = path.join(site, name + '.html');
  let html = fs.readFileSync(f, 'utf8');
  if (!html.includes('fonts.googleapis.com')) continue;
  html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\s*/, '')
    .replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*">/, PRELOAD);
  if (html.includes('googleapis') || html.includes('gstatic')) throw new Error('Google link left in ' + name);
  fs.writeFileSync(f, html);
  console.log('fonts linked:', name);
}
console.log(`${copied.size} font files, ${Object.keys(perPage).length + 1} CSS files`);
