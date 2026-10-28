import { webkit } from 'playwright';
const b = await webkit.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
p.on('console', (m) => console.log('  console:', m.text()));
await p.addInitScript(() => { const orig = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { const id = this.id; const r = orig.apply(this, arguments); console.log('play() on #' + id + ' paused=' + this.paused + ' rs=' + this.readyState); if (r && r.then) r.then(() => console.log('play resolved #' + id), (e) => console.log('play REJECTED #' + id + ' ' + e.name + ' ' + e.message)); return r; }; });
await p.goto('http://localhost:8101/index.html'); await p.waitForTimeout(3000);
console.log(await p.evaluate(() => { const v = document.getElementById('vid'); return { t: v.currentTime, paused: v.paused, rs: v.readyState, autoplay: v.autoplay }; }));
await b.close();
