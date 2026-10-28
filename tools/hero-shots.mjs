// Screenshots of the homepage hero at the end of line 1, in the middle of line 2 and after typing (overlay 0 / partial / 70 %).
import { chromium } from 'playwright';
import path from 'node:path';
const out = path.join(path.dirname(new URL(import.meta.url).pathname), '../docs/hero-check');
const base = (process.argv[2] || 'http://localhost:8101').replace(/\/?$/, '/');
const b = await chromium.launch({ channel: 'chrome' });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(base + 'index.html');
const state = () => p.evaluate(() => { const ch = [...document.querySelectorAll('#headline .ln')].map((l) => [...l.querySelectorAll('.ch.v')].length); return { l1: ch[0], l2: ch[1], dim: +getComputedStyle(document.getElementById('dim')).opacity.slice(0, 6), caret: document.querySelector('#headline .caret').classList.contains('done') }; });
const shot = async (name, until) => { await p.waitForFunction(until, null, { timeout: 90000, polling: 20 }); const s = await state(); await p.screenshot({ path: path.join(out, name + '.png') }); console.log(name, JSON.stringify(s)); };
await shot('1-end-of-line-1', () => [...document.querySelectorAll('#headline .ln')][0].querySelectorAll('.ch.v').length === 23 && [...document.querySelectorAll('#headline .ln')][1].querySelectorAll('.ch.v').length === 0);
await shot('2-mid-line-2', () => [...document.querySelectorAll('#headline .ln')][1].querySelectorAll('.ch.v').length === 14);
await shot('3-after-typing', () => document.querySelector('#headline .caret').classList.contains('done'));
await b.close();
