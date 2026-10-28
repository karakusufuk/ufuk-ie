// Draws the favicon set into ../site (run: npm run icons): favicon.svg, favicon.ico (32), apple-touch-icon.png (180), site.webmanifest.
// The lowercase "u" is Bricolage Grotesque 600, converted to an outline so the SVG needs no font.
import fs from 'node:fs';
import path from 'node:path';
import * as fontkit from 'fontkit';
import sharp from 'sharp';
import woff2 from 'wawoff2';

const here = path.dirname(new URL(import.meta.url).pathname);
const site = path.join(here, '../site');
// fontkit cannot read this WOFF2 directly, so it is unpacked to TTF first
const ttf = Buffer.from(await woff2.decompress(fs.readFileSync(path.join(here, 'node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-opsz-normal.woff2'))));
const font = fontkit.create(ttf);
const NAVY = '#151C2E', PINK = '#F7D2DE';

const v = font.getVariation({ wght: 600, opsz: 72 });
const g = v.layout('u').glyphs[0];
const bb = g.bbox;                                    // font units, y up
const target = 34;                                    // glyph height in a 64-unit icon
const s = target / (bb.maxY - bb.minY);
const tx = 32 - ((bb.minX + bb.maxX) / 2) * s;
const ty = 32 + ((bb.minY + bb.maxY) / 2) * s;        // flip y
const d = g.path.toSVG();
const u = `<path transform="translate(${tx.toFixed(3)} ${ty.toFixed(3)}) scale(${s.toFixed(5)} ${(-s).toFixed(5)})" fill="${PINK}" d="${d}"/>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14.08" fill="${NAVY}"/>${u}</svg>\n`;
const square = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${NAVY}"/>${u}</svg>`;
fs.writeFileSync(path.join(site, 'favicon.svg'), svg);

// apple-touch-icon: full-bleed square (iOS rounds it), flattened, no alpha
await sharp(Buffer.from(square), { density: 72 * 180 / 64 }).resize(180, 180).flatten({ background: NAVY }).removeAlpha().png().toFile(path.join(site, 'apple-touch-icon.png'));

// favicon.ico: one 32x32 PNG image inside an ICO container
const png32 = await sharp(Buffer.from(svg), { density: 72 * 32 / 64 }).resize(32, 32).png().toBuffer();
const head = Buffer.alloc(22);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);       // ICONDIR: reserved, type icon, 1 image
head.writeUInt8(32, 6); head.writeUInt8(32, 7); head.writeUInt8(0, 8); head.writeUInt8(0, 9);
head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12);                              // planes, bit depth
head.writeUInt32LE(png32.length, 14); head.writeUInt32LE(22, 18);                   // size, offset
fs.writeFileSync(path.join(site, 'favicon.ico'), Buffer.concat([head, png32]));

fs.writeFileSync(path.join(site, 'site.webmanifest'), JSON.stringify({
  name: 'ufuk.ie', short_name: 'ufuk.ie', start_url: '/', display: 'browser',
  theme_color: '#EEF1F5', background_color: '#EEF1F5',
  icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' }, { src: 'apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
}, null, 2) + '\n');
console.log('icons written');
