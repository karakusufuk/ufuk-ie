/* Instagram grid: the photos fade in slowly, one cell at a time, stay for a while, fade out in the same order, the grid rests, and they come back.
   The tall building (post 11) is the one that arrives last, noticeably after the rest, as if it had been forgotten.
   Nothing is swapped or shuffled. Runs only while the block is on screen. */
(function () {
  var blocks = [].slice.call(document.querySelectorAll('[data-ig]'));
  if (!blocks.length) return;
  var calm = false; try { calm = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (calm || !('IntersectionObserver' in window)) return;          // photos simply stay shown

  var STEP_IN = 900, STEP_OUT = 450, LATE = 3200, HOLD = 5200, REST = 2200, LAST = 11;

  blocks.forEach(function (el) {
    var cells = [].slice.call(el.querySelectorAll('.ph'));
    /* the order they arrive in: the grid top to bottom, the tall building last */
    var order = cells.filter(function (c) { return +c.getAttribute('data-n') !== LAST; }).concat(cells.filter(function (c) { return +c.getAttribute('data-n') === LAST; }));
    var token = 0, timers = [], running = false;

    function wait(ms, tk) { return new Promise(function (res) { var t = setTimeout(function () { res(tk === token); }, ms); timers.push(t); }); }
    function resetAll() { el.classList.add('ig-snap'); cells.forEach(function (c) { c.classList.remove('on'); }); void el.offsetWidth; el.classList.remove('ig-snap'); }

    async function fadeIn(tk) {
      for (var i = 0; i < order.length; i++) {
        var late = +order[i].getAttribute('data-n') === LAST;
        if (late && !(await wait(LATE, tk))) return false;           // the forgotten one
        order[i].classList.add('on');
        if (!(await wait(STEP_IN, tk))) return false;
      }
      return true;
    }
    async function fadeOut(tk) {
      for (var i = 0; i < order.length; i++) { order[i].classList.remove('on'); if (!(await wait(STEP_OUT, tk))) return false; }
      return true;
    }
    async function cycle(tk) {
      while (tk === token) {
        if (!(await fadeIn(tk))) return;
        if (!(await wait(HOLD, tk))) return;
        if (!(await fadeOut(tk))) return;
        if (!(await wait(REST, tk))) return;
      }
    }
    function start() { if (running) return; running = true; token++; cycle(token); }
    function stop() { if (!running) return; running = false; token++; timers.forEach(clearTimeout); timers = []; resetAll(); }

    el.classList.add('ig-ready');
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !document.hidden) start(); else stop(); }); }, { threshold: 0.25 }).observe(el);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else { var r = el.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) start(); } });
  });
})();
