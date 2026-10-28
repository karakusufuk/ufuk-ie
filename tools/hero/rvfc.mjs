import { webkit, firefox } from 'playwright';
for (const [n, t] of [['webkit', webkit], ['firefox', firefox]]) { const b = await t.launch(); const p = await b.newPage(); await p.goto('http://localhost:8101/index.html'); console.log(n, 'requestVideoFrameCallback:', await p.evaluate(() => 'requestVideoFrameCallback' in HTMLVideoElement.prototype)); await b.close(); }
