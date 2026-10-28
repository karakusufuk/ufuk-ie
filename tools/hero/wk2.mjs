import { webkit } from 'playwright';
const b = await webkit.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:8101/index.html'); await p.waitForTimeout(1500);
console.log(await p.evaluate(async () => { const v = document.getElementById('vid'); try { await v.play(); return 'play ok t=' + v.currentTime; } catch (e) { return 'play error ' + e.name + ': ' + e.message; } }));
await p.waitForTimeout(2000); console.log(await p.evaluate(() => { const v = document.getElementById('vid'); return { t: v.currentTime, paused: v.paused, rs: v.readyState }; }));
// the previous video from git, to see whether the file is the difference
await b.close();
