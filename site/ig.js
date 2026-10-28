/* Instagram grid: photos fade in one cell at a time, hold, flick through random posts for a moment (slot machine),
   settle back, fade out in the same order, rest, repeat. Runs only while the block is on screen. */
(function () {
  var blocks = [].slice.call(document.querySelectorAll('[data-ig]'));
  if (!blocks.length) return;
  var calm = false; try { calm = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (calm || !('IntersectionObserver' in window)) return;          // photos simply stay shown

  var FADE = 420, STEP = FADE / 2, HOLD1 = 3500, HOLD2 = 3200, REST = 1400, SLOT = 760;
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  blocks.forEach(function (el) {
    var cells = [].slice.call(el.querySelectorAll('.ph'));
    var imgs = cells.map(function (c) { return c.querySelector('img'); });
    var mine = cells.map(function (c) { return +c.getAttribute('data-n'); });
    var pool = el.getAttribute('data-pool').split(',').map(Number), base = el.getAttribute('data-base');
    var preloaded = false, token = 0, timers = [], running = false;

    function preload() {
      if (preloaded) return; preloaded = true;
      pool.forEach(function (n) { var i = new Image(); i.src = base + pad(n) + '.jpg'; });
    }
    function wait(ms, tk) { return new Promise(function (res) { var t = setTimeout(function () { res(tk === token); }, ms); timers.push(t); }); }
    function setSrc(i, n) { imgs[i].src = base + pad(n) + '.jpg'; }
    function resetAll() { el.classList.add('ig-snap'); cells.forEach(function (c, i) { c.classList.remove('on'); setSrc(i, mine[i]); }); void el.offsetWidth; el.classList.remove('ig-snap'); }

    async function wave(tk, on) {
      for (var i = 0; i < cells.length; i++) { cells[i].classList.toggle('on', on); if (!(await wait(STEP, tk))) return false; }
      return wait(FADE - STEP, tk);
    }
    async function slot(tk) {
      var stop = cells.map(function (c, i) { return 400 + i * 40; }), t0 = performance.now(), last = cells.map(function () { return -1; });
      while (performance.now() - t0 < SLOT) {
        var t = performance.now() - t0;
        for (var i = 0; i < cells.length; i++) {
          if (t >= stop[i]) { if (last[i] !== mine[i]) { setSrc(i, mine[i]); last[i] = mine[i]; } continue; }
          var n; do { n = pool[Math.floor(Math.random() * pool.length)]; } while (n === last[i]);
          setSrc(i, n); last[i] = n;
        }
        if (!(await wait(70, tk))) return false;
      }
      cells.forEach(function (c, i) { setSrc(i, mine[i]); });
      return true;
    }
    async function cycle(tk) {
      while (tk === token) {
        if (!(await wave(tk, true))) return;
        if (!(await wait(HOLD1, tk))) return;
        if (!(await slot(tk))) return;
        if (!(await wait(HOLD2, tk))) return;
        if (!(await wave(tk, false))) return;
        if (!(await wait(REST, tk))) return;
      }
    }
    function start() { if (running) return; running = true; preload(); token++; cycle(token); }
    function stop() { if (!running) return; running = false; token++; timers.forEach(clearTimeout); timers = []; resetAll(); }

    el.classList.add('ig-ready');
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !document.hidden) start(); else stop(); }); }, { threshold: 0.25 }).observe(el);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else { var r = el.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) start(); } });
  });
})();
