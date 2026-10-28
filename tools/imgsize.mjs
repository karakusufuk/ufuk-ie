// Adds the real pixel width/height to every <img> that has none, so the page does not jump while images load.
// Used by build.mjs (project pages) and as a CLI for the hand-written pages: node imgsize.mjs (run: npm run imgsize).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const here = path.dirname(new URL(import.meta.url).pathname);
const cache = new Map();
const dimsOf = async (file) => {
  if (!cache.has(file)) { const m = await sharp(file).metadata(); cache.set(file, [m.width, m.height]); }
  return cache.get(file);
};

export async function addSizes(html, siteRoot = path.join(here, '../site')) {
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].filter((m) => !/\swidth=/.test(m[0]));
  for (const m of imgs) {
    const src = (m[0].match(/\ssrc="([^"?#]+)/) || [])[1];
    if (!src || /^(https?:|data:)/.test(src)) continue;
    const file = path.join(siteRoot, src);
    if (!fs.existsSync(file)) continue;
    const [w, h] = await dimsOf(file);
    html = html.replace(m[0], m[0].replace(/(\ssrc="[^"]*")/, `$1 width="${w}" height="${h}"`));
  }
  return html;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  for (const name of ['index', 'work', 'about']) {
    const f = path.join(here, '../site', name + '.html');
    const before = fs.readFileSync(f, 'utf8');
    const after = await addSizes(before);
    if (after !== before) { fs.writeFileSync(f, after); console.log('sizes added:', name); }
  }
}
