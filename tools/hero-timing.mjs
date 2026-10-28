// Usage: node hero-timing.mjs <baseUrl>. Time until the intro video really plays, on throttled connections,
// with the page as it is (A) and with the loop video held back until the intro plays (B).
import { chromium } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8101').replace(/\/?$/, '/');
const profiles = { '10 Mbit': { downloadThroughput: 1.25e6, uploadThroughput: 1.25e6, latency: 40 }, 'Fast 3G': { downloadThroughput: 1.6e6 / 8 * 0.9, uploadThroughput: 750e3 / 8, latency: 150 } };
const b = await chromium.launch({ channel: 'chrome' });
for (const [pname, prof] of Object.entries(profiles)) for (const variant of ['A', 'B']) {
  const times = [];
  for (let i = 0; i < 3; i++) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
    if (variant === 'B') await page.route('**/index.html', async (r) => { const res = await r.fetch(); let t = await res.text(); t = t.replace('id="vloop" src="img/hero-loop.mp4?v=3" muted loop playsinline preload="auto"', 'id="vloop" src="img/hero-loop.mp4?v=3" muted loop playsinline preload="none"').replace('</body>', '<script>document.getElementById("vid").addEventListener("playing",function(){var l=document.getElementById("vloop");l.preload="auto";l.load()},{once:true})</script></body>'); r.fulfill({ response: res, body: t }); });
    const cdp = await ctx.newCDPSession(page); await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', { offline: false, ...prof });
    const t0 = Date.now();
    await page.goto(base + 'index.html', { waitUntil: 'commit' });
    await page.waitForFunction(() => { const v = document.getElementById('vid'); return v && v.currentTime > 0.1 && !v.paused; }, null, { timeout: 90000, polling: 50 });
    times.push((Date.now() - t0) / 1000); await ctx.close();
  }
  console.log(pname, variant, times.map((t) => t.toFixed(2)).join(' '), 'median', times.sort()[1].toFixed(2));
}
await b.close();
