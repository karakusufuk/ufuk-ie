// Records the interactions that are judged by eye (run: node record.mjs [baseUrl]); output: ../docs/recordings/*.webm
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
const base = (process.argv[2] || 'http://localhost:8101').replace(/\/?$/, '/');
const out = path.join(path.dirname(new URL(import.meta.url).pathname), '../docs/recordings');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome' });
async function rec(name, fn) {
  const tmp = fs.mkdtempSync('/private/tmp/claude-501/rec-');
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: tmp, size: { width: 1440, height: 900 } } });
  await ctx.route(/^https:\/\/[a-z]+\.ufuk\.ie\/.*/, (r) => r.fulfill({ status: 200, contentType: 'text/html', body: 'demo' }));
  const page = await ctx.newPage(); await fn(page); const v = page.video(); await ctx.close();
  fs.copyFileSync(await v.path(), path.join(out, name + '.webm')); console.log('recorded', name);
}
const kb = process.argv[3] === 'keyboard';
if (!kb) {
await rec('01-hero-blur-and-typing', async (p) => { await p.goto(base + 'index.html'); await sleep(27000); });
await rec('02-brennock-showcase', async (p) => {
  await p.goto(base + 'index.html'); await sleep(800);
  await p.evaluate(() => window.scrollTo(0, document.querySelectorAll('.show')[0].getBoundingClientRect().top + scrollY)); await sleep(1000);
  await p.mouse.move(720, 450); await p.mouse.wheel(0, 120); await sleep(5500); await p.mouse.wheel(0, 120); await sleep(5000);
});
await rec('03-project-open-pins-dock', async (p) => {
  await p.goto(base + 'brennock.html'); await sleep(3500);
  await p.mouse.move(720, 450); await p.mouse.wheel(0, 200); await sleep(2200);
  for (let i = 0; i < 10; i++) { await p.mouse.wheel(0, 300); await sleep(500); }
  await sleep(1500);
  await p.evaluate(() => window.scrollTo(0, 0)); await sleep(800);
  await p.click('.live-top'); await sleep(2500);
});
await rec('04-pins-dark-recording', async (p) => {
  await p.goto(base + 'bawn.html'); await sleep(2500); await p.mouse.move(720, 450); await p.mouse.wheel(0, 200); await sleep(2000);
  for (let i = 0; i < 12; i++) { await p.mouse.wheel(0, 300); await sleep(500); }
});
}
if (kb) {
  const walk = (n, gap = 450) => async (p) => { for (let i = 0; i < n; i++) { await p.keyboard.press('Tab'); await sleep(gap); } await sleep(800); };
  await rec('05-keyboard-home', async (p) => { await p.goto(base + 'index.html'); await sleep(1500); await walk(8)(p); await p.evaluate(() => document.getElementById('kus').scrollIntoView()); await sleep(900); await p.keyboard.press('ArrowDown'); await sleep(700); await p.keyboard.press('ArrowDown'); await sleep(700); await p.keyboard.press('ArrowUp'); await sleep(700); await walk(14)(p); });
  await rec('06-keyboard-work', async (p) => { await p.goto(base + 'work.html'); await sleep(1500); await walk(12)(p); await p.keyboard.press('Enter'); await sleep(900); await walk(6)(p); });
  await rec('07-keyboard-about', async (p) => { await p.goto(base + 'about.html'); await sleep(2500); await walk(7)(p); });
  await rec('08-keyboard-project', async (p) => { await p.goto(base + 'brennock.html'); await sleep(3000); await walk(10, 700)(p); await p.keyboard.press('Space'); await sleep(1500); await walk(6)(p); });
}
await b.close();
