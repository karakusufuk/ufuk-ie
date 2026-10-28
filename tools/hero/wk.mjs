import { webkit } from 'playwright';
const b = await webkit.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
p.on('console', (m) => console.log('console', m.text()));
await p.goto('http://localhost:8101/index.html');
for (let i = 0; i < 26; i++) { await p.waitForTimeout(1000); console.log(i + 1, JSON.stringify(await p.evaluate(() => { const v = document.getElementById('vid'); return { t: +v.currentTime.toFixed(2), rs: v.readyState, paused: v.paused, ended: v.ended, err: v.error && v.error.code, net: v.networkState, blur: document.getElementById('stage').classList.contains('blur'), loop: document.getElementById('stage').classList.contains('loop') }; }))); }
await b.close();
