// Screenshots of the contact block at the moment all photos are shown (1440 and 1920; homepage, a project page, contact.html), and one recorded cycle.
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
const out = path.join(path.dirname(new URL(import.meta.url).pathname), '../docs/contact-check');
const base = (process.argv[2] || 'http://localhost:8101').replace(/\/?$/, '/');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [1920, 1080]]) for (const f of ['index', 'brennock', 'contact']) {
  const c = await b.newContext({ viewport: { width: w, height: h } }); const p = await c.newPage();
  await p.goto(base + f + '.html'); await sleep(f === 'brennock' ? 3000 : 1500);
  if (f === 'brennock') { await p.mouse.move(w / 2, h / 2); await p.mouse.wheel(0, 200); await sleep(1500); }
  await p.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await p.waitForFunction(() => document.querySelectorAll('.ig .ph.on').length === 8 && [...document.querySelectorAll('.ig .ph.on')].every((e) => getComputedStyle(e).opacity === '1'), null, { timeout: 8000, polling: 30 });
  await p.screenshot({ path: path.join(out, `${w}-${f}.png`) }); console.log('shot', w, f);
  await c.close();
}
// one full cycle, recorded
const tmp = fs.mkdtempSync('/private/tmp/claude-501/igrec-');
const c = await b.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: tmp, size: { width: 1440, height: 900 } } }); const p = await c.newPage();
await p.goto(base + 'contact.html'); await sleep(14500); const v = p.video(); await c.close();
fs.copyFileSync(await v.path(), path.join(out, 'cycle.webm')); console.log('recorded cycle.webm');
await b.close();
