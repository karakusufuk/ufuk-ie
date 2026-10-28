/* Reload and fresh visits start at the top; Back and Forward return to where the visitor was. */
(function () {
  var nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {};
  var back = nav.type === 'back_forward', key = 'ufuk-scroll:' + location.pathname, y = 0;
  window.ufukBack = back;
  try { history.scrollRestoration = 'manual'; } catch (e) {}
  function save() { try { sessionStorage.setItem(key, String(Math.round(window.scrollY))); } catch (e) {} }
  addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') save(); });
  if (!back) {
    try { sessionStorage.removeItem(key); sessionStorage.removeItem('ufuk-filter'); } catch (e) {}
    if (!location.hash) window.scrollTo(0, 0);
    return;
  }
  try { y = +sessionStorage.getItem(key) || 0; } catch (e) {}
  if (!y || location.hash) return;
  var moved = false;
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (t) { addEventListener(t, function () { moved = true; }, { passive: true }); });
  function go() { if (!moved) window.scrollTo(0, y); }
  go();
  document.addEventListener('DOMContentLoaded', go);
  addEventListener('load', go);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 350); setTimeout(go, 900); setTimeout(function () { moved = true; }, 1600);
})();
