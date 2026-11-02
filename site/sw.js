/* ufuk.ie: rides out hosting hiccups.
   GitHub Pages now and then answers a request with its own server error page ("We're having a really bad day", a 503) or not at
   all, and a refresh a moment later works. Here every page and file still comes from the network first, so nothing is ever older
   than the live site while it answers; when it answers with a server error, or fails, the request is tried again, and if it still
   fails the last good copy is used. The pages, styles and scripts are kept from the first visit on; pictures and recordings are
   only tried again, never stored (video byte ranges are left to the browser). */
var CACHE = 'ufuk-pages-1';
var PAGES = ['/', '/index.html', '/work.html', '/about.html', '/contact.html', '/404.html',
  '/brennock.html', '/kus.html', '/master-id.html', '/passpath.html', '/match-id.html', '/reilly.html', '/bawn.html', '/fennel.html',
  '/kenilworth.html', '/garvey.html', '/tierney.html', '/midland.html', '/monument.html', '/lear.html', '/ashgrove.html',
  '/work.css', '/work.js', '/sub.css', '/sub.js', '/apps-cards.css', '/apps-cards.js', '/ig.css', '/ig.js', '/fonts/fonts.css'];

self.addEventListener('install', function (e) {
  /* one by one, so a single failed file never stops the rest from being kept */
  e.waitUntil(caches.open(CACHE).then(function (c) { return Promise.all(PAGES.map(function (u) { return c.add(u).catch(function () {}); })); }));
  self.skipWaiting();
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); })
    .then(function () { return self.clients.claim(); }));
});

var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
/* up to three tries, 0.4 s and 0.8 s apart; a 4xx (a real "not found") is an answer, a 5xx or a network failure is not */
function network(req) {
  var i = 0;
  return (function go() {
    return fetch(req).then(function (r) { if (r.status < 500) return r; throw r; }).catch(function (bad) {
      if (++i >= 3) return bad instanceof Response ? bad : null;
      return wait(400 * i).then(go);
    });
  })();
}
var KEEP = /\.(html|css|js|woff2)$|\/$/;

self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || req.headers.has('range')) return;
  var keep = req.mode === 'navigate' || KEEP.test(url.pathname);
  e.respondWith(network(req).then(function (r) {
    if (r && r.ok) {
      if (keep && r.type === 'basic') { var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(url.pathname, copy); }); }
      return r;
    }
    return caches.match(url.pathname, { ignoreSearch: true }).then(function (hit) { return hit || r || fetch(req); });
  }));
});
