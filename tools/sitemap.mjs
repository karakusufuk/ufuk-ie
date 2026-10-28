// Writes ../site/sitemap.xml from the hand-written pages plus every page in content.mjs (run: npm run sitemap).
import fs from 'node:fs';
import path from 'node:path';
import { pages } from './content.mjs';

const site = path.join(path.dirname(new URL(import.meta.url).pathname), '../site');
const urls = ['', 'work.html', 'about.html', 'contact.html', ...pages.map((p) => p.slug + '.html')];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>https://ufuk.ie/${u}</loc></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(site, 'sitemap.xml'), xml);
console.log(`sitemap.xml: ${urls.length} urls`);
