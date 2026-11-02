/* The clock block on ashgrove.html: a pinned phone whose screen follows the scroll.
   The recording of the live Ashgrove site is an image sequence (img/d/ashgrove/clock/NNN.webp). The scroll position inside the pinned
   track picks the frame, 0 at the top of the pin and the last frame where the pin lets go; scrolling back up plays it backwards.
   Frames are fetched a little before the block comes near the screen, every fourth one first, so a frame is always there to show:
   the nearest frame that has arrived is drawn, never a blank. */
(function () {
  var sec = document.querySelector('.clk'); if (!sec) return;
  var track = sec.querySelector('.clk-track'), pin = sec.querySelector('.clk-pin'), cv = sec.querySelector('canvas'), ctx = cv.getContext('2d');
  var N = +sec.getAttribute('data-frames'), base = sec.getAttribute('data-base'), ver = sec.getAttribute('data-ver') || '1';
  var imgs = new Array(N), ok = new Array(N), cur = -1, want = 0, queue = [], busy = 0, started = false, ticking = false, checks = 0;
  function src(i) { return base + ('00' + i).slice(-3) + '.webp?v=' + ver; }
  function nearest(i) {
    for (var d = 0; d < N; d++) { if (i - d >= 0 && ok[i - d]) return i - d; if (i + d < N && ok[i + d]) return i + d; }
    return -1;
  }
  function draw() {
    var j = nearest(want); if (j < 0 || j === cur) return;
    cur = j; ctx.drawImage(imgs[j], 0, 0, cv.width, cv.height);
    /* the first few draws are read back: if the browser painted nothing (it can, right after a decode), draw again on the next frame */
    if (checks < 8) { checks++; if (ctx.getImageData(cv.width >> 1, cv.height >> 1, 1, 1).data[3] === 0) { cur = -1; requestAnimationFrame(draw); } }
  }
  function pump() {
    while (busy < 6 && queue.length) {
      var i = queue.shift(); if (imgs[i]) continue;
      var im = new Image(); imgs[i] = im; busy++;
      /* a frame counts as arrived once it is decoded: drawing one that is not yet decoded would paint nothing */
      im.onload = (function (i, im) { return function () { (im.decode ? im.decode() : Promise.resolve()).catch(function () {}).then(function () { busy--; ok[i] = true; draw(); pump(); }); }; })(i, im);
      im.onerror = function () { busy--; pump(); };
      im.src = src(i);
    }
  }
  function start() {
    if (started) return; started = true;
    var a = [], b = [];
    for (var i = 0; i < N; i++) (i % 4 === 0 || i === N - 1 ? a : b).push(i);
    queue = a.concat(b); pump();
  }
  /* the frame for the scroll position; while the pin holds, progress runs 0 → 1 over the track's extra length */
  function frame() {
    ticking = false;
    var r = track.getBoundingClientRect(), hh = parseFloat(getComputedStyle(pin).top) || 0, span = r.height - pin.offsetHeight;
    var p = span > 0 ? Math.min(1, Math.max(0, (hh - r.top) / span)) : 0;
    var i = Math.round(p * (N - 1));
    draw();
    if (i !== want) {
      want = i;
      if (!ok[i]) { queue.unshift(i); pump(); }     // a jump into frames that are not here yet: fetch that one first
      draw();
      for (var k = 1; k <= 3; k++) { var q = imgs[i + k * (p > 0 ? 1 : 1)]; if (q && q.decode) q.decode().catch(function () {}); }
    }
  }
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', tick);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) { start(); } }, { rootMargin: '1800px 0px' }).observe(sec);
  } else start();
  frame();
})();
