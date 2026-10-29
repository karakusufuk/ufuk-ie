/* ufuk.ie project pages.
   Opening: the pink line runs down from the header and prints the name and the summary,
   then waits a little below them. The first scroll gesture drops it to the bottom of the
   screen and the page appears; that gesture does not also move the page. From then on the
   page scrolls freely and the line never passes the footer.
   Notes: one straight line from the note to the edge of its recording, entering it a short way.
   Recordings only play while they are on screen. */
(function () {
  try { history.scrollRestoration = 'manual'; } catch (e) {}
  var html = document.documentElement;
  var body = document.body, line = document.querySelector('.laser'), veil = document.querySelector('.veil'),
      end = document.querySelector('.end'), bar = document.querySelector('.top'), dock = document.querySelector('.dock'),
      sum = document.querySelector('.open .sum'), h1 = document.querySelector('.open h1'), liveTop = document.querySelector('.live-top');
  var reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ---------- the page is held hidden until it really sits at the top, then the line prints ---------- */
  var ready = false, user = false;
  function settle() {
    var tries = 0, still = 0;
    (function check() {
      if (!location.hash && window.scrollY !== 0) { window.scrollTo(0, 0); still = 0; } else still++;
      if ((still >= 3 || ++tries > 40) && document.readyState !== 'loading') { ready = true; html.classList.remove('pre'); return; }
      requestAnimationFrame(check);
    })();
  }
  settle();
  addEventListener('pageshow', function (e) { if (e.persisted && !location.hash) { window.scrollTo(0, 0); } });

  /* ---------- opening: only the visitor's own gesture drops the line ---------- */
  var opened = false, openedAt = 0, print = 0, drop = 0, started = 0;
  function open() { if (opened || !ready) return; opened = true; openedAt = performance.now(); body.classList.add('opened'); }
  if (reduce || location.hash) { opened = true; print = 1; drop = 1; body.classList.add('opened'); }
  addEventListener('wheel', function (e) {
    if (e.ctrlKey) return; user = true;
    if (!opened) { if (e.deltaY > 0) { e.preventDefault(); open(); } else e.preventDefault(); return; }
    if (performance.now() - openedAt < 900 && scrollY < 4) e.preventDefault();
  }, { passive: false });
  var ty = null;
  addEventListener('touchstart', function (e) { user = true; ty = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchmove', function (e) {
    if (!opened && ty != null && ty - e.touches[0].clientY > 8) { if (e.cancelable) e.preventDefault(); open(); }
    else if (opened && performance.now() - openedAt < 900 && scrollY < 4 && e.cancelable) e.preventDefault();
  }, { passive: false });
  addEventListener('keydown', function (e) {
    if (opened) return;
    if (['ArrowDown', 'PageDown', ' ', 'End'].indexOf(e.key) > -1) { user = true; e.preventDefault(); open(); }
  });
  addEventListener('mousedown', function () { user = true; });
  addEventListener('keydown', function (e) { if (e.key === 'Tab') user = true; });
  addEventListener('scroll', function () { if (user && ready && scrollY > 30) open(); }, { passive: true });

  /* ---------- "Visit the live site": the first click scrolls on and the text becomes the pink button below it ---------- */
  var docked = false;
  function placeDock() {
    if (!dock || !liveTop || innerWidth <= 900) { if (dock) dock.style.right = ''; return; }
    var r = liveTop.getBoundingClientRect();
    dock.style.right = Math.max(16, innerWidth - r.right) + 'px';
  }
  addEventListener('resize', placeDock); addEventListener('load', placeDock); placeDock();
  /* the text link never leaves the page: it has no address, so no click, middle click or menu can open the live site;
     only the pink button in the dock does */
  function liveTopGo(e) {
    e.preventDefault(); user = true;
    if (docked) return;
    var from = liveTop.getBoundingClientRect();
    if (!opened) { open(); setTimeout(function () { window.scrollBy({ top: innerHeight * 0.7, behavior: 'smooth' }); }, 1100); }
    else window.scrollBy({ top: innerHeight * 0.7, behavior: 'smooth' });
    placeDock(); docked = true;
    var btn = dock.querySelector('.btn'); dock.classList.add('on', 'arrive');
    var to = btn.getBoundingClientRect();
    var ghost = liveTop.cloneNode(true); ghost.className = 'live-ghost'; ghost.removeAttribute('href');
    ghost.style.cssText = 'left:' + from.left + 'px;top:' + from.top + 'px;width:' + from.width + 'px;height:' + from.height + 'px';
    document.body.appendChild(ghost); liveTop.style.visibility = 'hidden'; btn.style.opacity = '0';
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      ghost.style.transform = 'translate(' + (to.right - from.right) + 'px,' + (to.top - from.top + (to.height - from.height) / 2) + 'px)';
      ghost.style.opacity = '0';
    }); });
    setTimeout(function () { btn.style.opacity = ''; }, 420);
    setTimeout(function () { ghost.remove(); dock.classList.remove('arrive'); }, 900);
  }
  if (liveTop && dock) {
    liveTop.addEventListener('click', liveTopGo);
    liveTop.addEventListener('auxclick', function (e) { e.preventDefault(); });
    liveTop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') liveTopGo(e); });
  }

  /* ---------- the line ---------- */
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  var last = 0;
  function frame(ts) {
    var dt = last ? Math.min(64, ts - last) : 16; last = ts;
    if (ready && !started) started = ts;
    if (ready && print < 1 && ts - started > 250) print = Math.min(1, print + dt / 1500);
    if (opened && print >= 1 && drop < 1) drop = Math.min(1, drop + dt / 950);
    if (opened && print < 1) print = Math.min(1, print + dt / 400);   /* an early gesture finishes the print quickly */
    var vh = innerHeight, hb = bar.getBoundingClientRect().bottom, ft = end.getBoundingClientRect().top;
    var textEnd = Math.max(sum.getBoundingClientRect().bottom, h1.getBoundingClientRect().bottom);
    var home = Math.min(vh - 60, textEnd + 44), low = vh - 36;
    var y = hb + (home - hb) * easeOut(print);
    if (drop > 0) y = home + (low - home) * ease(drop);
    if (drop >= 1) y = low;
    y = Math.max(hb, y);
    var locked = ft <= y + .5; if (locked) y = ft;
    var v = 'translate3d(0,' + y.toFixed(2) + 'px,0)';
    line.style.transform = v; veil.style.transform = v;
    line.style.opacity = locked ? '0' : '1';
    if (dock) dock.classList.toggle('on', ft > vh - 10 && ((drop >= 1 && scrollY > 240) || docked));
    requestAnimationFrame(frame);
  }
  if (line && veil && end && bar) requestAnimationFrame(frame);

  /* ---------- note lines: straight, perpendicular to the edge, a short way in ---------- */
  var pins = [].slice.call(document.querySelectorAll('.blk[data-pin]'));
  function drawPins() {
    pins.forEach(function (b) {
      var out = b.querySelector('svg.pin'), inn = b.querySelector('svg.pin-in'); if (!out || !inn) return;
      if (innerWidth <= 900) { out.innerHTML = inn.innerHTML = ''; return; }
      var br = b.getBoundingClientRect(), m = b.querySelector('.media').getBoundingClientRect(), n = b.querySelector('.note b').getBoundingClientRect();
      var depth = m.width * (+b.getAttribute('data-pin') || 6) / 100;
      var noteRight = n.left > m.left;
      var y = n.top - br.top + n.height / 2;
      y = Math.max(m.top - br.top + 24, Math.min(m.bottom - br.top - 24, y));
      var edge = noteRight ? m.right - br.left : m.left - br.left;
      var nx = noteRight ? n.left - br.left - 18 : n.right - br.left + 18;
      var px = noteRight ? edge - depth : edge + depth;
      var vb = '0 0 ' + br.width + ' ' + br.height;
      out.setAttribute('viewBox', vb); inn.setAttribute('viewBox', vb);
      out.innerHTML = '<line x1="' + nx + '" y1="' + y + '" x2="' + edge + '" y2="' + y + '"/>';
      inn.innerHTML = '<line x1="' + edge + '" y1="' + y + '" x2="' + px + '" y2="' + y + '"/><circle cx="' + px + '" cy="' + y + '" r="6"/>';
    });
  }
  addEventListener('resize', drawPins); addEventListener('load', drawPins);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawPins);
  drawPins();

  /* ---------- recordings play only while seen, always from their first frame ---------- */
  /* A recording is fetched a little before it comes near the screen (so it is ready), but it only starts when at least a third of it is
     in view, and it always starts at its very first frame: never already running, never halfway. A cover plays once, in its natural order,
     and rests on its last frame; every other recording loops. Leaving the screen rewinds it, so the next visit starts fresh too. */
  var vids = [].slice.call(document.querySelectorAll('video[data-src]'));
  vids.forEach(function (v) { if (v.closest('.cover')) { v.loop = false; v.setAttribute('data-once', ''); } });
  function load(v) { if (!v.src) { v.preload = 'auto'; v.src = v.getAttribute('data-src'); } }
  if ('IntersectionObserver' in window) {
    var pre = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { load(e.target); pre.unobserve(e.target); } }); }, { rootMargin: '700px 0px' });
    var seen = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting && e.intersectionRatio >= 0.33) {
          if (v._on) return; v._on = true; load(v);
          try { v.currentTime = 0; } catch (x) {}
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else if (!e.isIntersecting) {
          if (!v._on) return; v._on = false; v.pause(); try { v.currentTime = 0; } catch (x) {}
        }
      });
    }, { threshold: [0, 0.33] });
    vids.forEach(function (v) { pre.observe(v); seen.observe(v); });
  } else vids.forEach(function (v) { load(v); v.play(); });
})();
