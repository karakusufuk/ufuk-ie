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
// Person and business, on the homepage and About
const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Person', '@id': `${SITE}/#person`, name: 'Ufuk Karakuş', jobTitle: 'Designer and developer', url: `${SITE}/`, address: { '@type': 'PostalAddress', addressCountry: 'IE' }, sameAs: [] },
    { '@type': 'ProfessionalService', '@id': `${SITE}/#business`, name: 'ufuk.ie', url: `${SITE}/`, founder: { '@id': `${SITE}/#person` }, areaServed: [{ '@type': 'Country', name: 'Ireland' }, { '@type': 'Continent', name: 'Europe' }], contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', availableLanguage: ['English', 'Turkish'] } },
  ],
};
for (const [name, p] of Object.entries(pages)) {
  const f = path.join(site, name + '.html');
  let html = fs.readFileSync(f, 'utf8');
  const had = html.includes('rel="canonical"');
  const icons = '<link rel="icon" href="favicon.ico" sizes="32x32"><link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="apple-touch-icon.png"><link rel="manifest" href="site.webmanifest">';
  if (!html.includes('src="nav.js"')) html = html.replace('<link rel="manifest" href="site.webmanifest">', '<link rel="manifest" href="site.webmanifest"><script src="nav.js"></script>');
  if (!html.includes('rel="icon"')) html = html.replace(/(<meta name="twitter:card"[^>]*>)/, `$1\n${icons}`);
  html = html.replace(/\n?<script type="application\/ld\+json">[\s\S]*?<\/script>/, '');
  if (name !== 'work') html = html.replace('<link rel="manifest" href="site.webmanifest">', `<link rel="manifest" href="site.webmanifest">\n<script type="application/ld+json">\n${JSON.stringify(ld, null, 2)}\n</script>`);
  if (had) { fs.writeFileSync(f, html); continue; }
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
