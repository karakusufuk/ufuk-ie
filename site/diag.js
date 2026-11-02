/* Diagnostics, only when the address carries ?diag: a panel listing every recording's and picture's state, so a phone screenshot
   shows why something is missing. Nothing is sent anywhere. */
(function () {
  var log = [], t0 = Date.now(), vids = [].slice.call(document.querySelectorAll('video')), imgs = [].slice.call(document.querySelectorAll('img'));
  var name = function (v) { return ((v.getAttribute('src') || v.getAttribute('data-src') || v.currentSrc || '?').split('/').pop().split('?')[0]); };
  var note = function (v, s) { (v._dg = v._dg || []).push(((Date.now() - t0) / 1000).toFixed(1) + ' ' + s); if (v._dg.length > 4) v._dg.shift(); };
  ['error', 'stalled', 'suspend', 'emptied', 'abort', 'waiting', 'playing', 'loadeddata'].forEach(function (k) {
    document.addEventListener(k, function (e) { if (e.target.tagName === 'VIDEO') note(e.target, k + (k === 'error' && e.target.error ? ':' + e.target.error.code : '')); }, true);
  });
  var play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { var v = this, p = play.apply(v, arguments); if (p && p.catch) p.catch(function (x) { note(v, 'play✗ ' + (x && x.name)); }); return p; };
  var posters = {};
  vids.forEach(function (v) { var p = v.getAttribute('poster'); if (!p) return; var im = new Image(); posters[p] = '…'; im.onload = function () { posters[p] = 'ok'; }; im.onerror = function () { posters[p] = 'FAIL'; }; im.src = p; });
  var box = document.createElement('pre');
  box.style.cssText = 'position:fixed;left:4px;right:4px;top:80px;max-height:46vh;overflow:auto;z-index:99999;margin:0;padding:6px;background:rgba(0,0,0,.82);color:#9f9;font:10px/1.35 ui-monospace,Menlo,monospace;white-space:pre-wrap;pointer-events:none;border-radius:6px';
  document.body.appendChild(box);
  function draw() {
    var lowPower = '', out = [];
    out.push('sw=' + !!(navigator.serviceWorker && navigator.serviceWorker.controller) + ' vis=' + document.visibilityState + ' t=' + ((Date.now() - t0) / 1000).toFixed(0) + 's ' + innerWidth + 'x' + innerHeight);
    vids.forEach(function (v) {
      var r = v.getBoundingClientRect(), cs = getComputedStyle(v);
      out.push(name(v) + ' rs' + v.readyState + ' ns' + v.networkState + (v.error ? ' ERR' + v.error.code : '') + (v.paused ? ' paused' : ' play') +
        ' t' + v.currentTime.toFixed(1) + ' poster:' + (posters[v.getAttribute('poster')] || '-') + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) +
        (cs.visibility !== 'visible' || cs.opacity !== '1' || cs.display === 'none' ? ' HIDDEN' : '') + (r.bottom > 0 && r.top < innerHeight ? ' ◉' : '') +
        (v._dg ? ' | ' + v._dg.join(', ') : ''));
    });
    var bad = imgs.filter(function (i) { return i.complete && !i.naturalWidth; }).map(function (i) { return (i.getAttribute('src') || '').split('/').pop(); });
    var wait = imgs.filter(function (i) { return !i.complete; }).length;
    out.push('img: ' + imgs.length + ' total, ' + wait + ' waiting' + (bad.length ? ', FAILED: ' + bad.join(' ') : ''));
    box.textContent = out.join('\n');
  }
  draw(); setInterval(draw, 1000);
})();
