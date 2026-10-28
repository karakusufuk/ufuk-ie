// Applies title, description, canonical and sharing tags to the three hand-written pages (index, work, about).
// Idempotent: a page that already has a canonical link is left alone. Project pages get theirs from build.mjs.
import fs from 'node:fs';
import path from 'node:path';

const site = path.join(path.dirname(new URL(import.meta.url).pathname), '../site');
const SITE = 'https://ufuk.ie';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pages = {
  index: { title: 'Ufuk Karakuş · Designer and developer · ufuk.ie', file: '', desc: 'Websites and software designed and built by one person, for businesses that know what they sell. Based in Ireland, working in English and Turkish.' },
  work: { title: 'Work · ufuk.ie', file: 'work.html', desc: 'Fifteen websites, apps and systems, each designed and built for one business and how it sells.' },
  about: { title: 'About Ufuk · ufuk.ie', file: 'about.html', desc: 'Fifteen years of design, six running my own studio, now designing and building end to end in Ireland.' },
};
for (const [name, p] of Object.entries(pages)) {
  const f = path.join(site, name + '.html');
  let html = fs.readFileSync(f, 'utf8');
  if (html.includes('rel="canonical"')) continue;
  const meta = `<meta name="theme-color" content="#EEF1F5">
<meta name="description" content="${esc(p.desc)}">
<link rel="canonical" href="${SITE}/${p.file}">
<meta property="og:type" content="website"><meta property="og:site_name" content="ufuk.ie"><meta property="og:locale" content="en_IE">
<meta property="og:title" content="${esc(p.title)}"><meta property="og:description" content="${esc(p.desc)}"><meta property="og:url" content="${SITE}/${p.file}">
<meta property="og:image" content="${SITE}/img/og/${name}.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">`;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(p.title)}</title>\n${meta}`);
  fs.writeFileSync(f, html);
  console.log('head updated:', name);
}
