# ufuk.ie

Personal portfolio of Ufuk Karakuş, designer and developer in Ireland. A static site: no framework, no build step for the pages other than the 11 generated project pages.

- **Preview:** `cd site && python3 -m http.server 8000`, then open http://localhost:8000
- **Change a project page:** edit `tools/content.mjs` (or `tools/build.mjs`), run `npm run build` in `tools/`, review, commit both. Never hand-edit a project page in `site/`.
- **Check the generator:** `npm run check` in `tools/` regenerates the 11 pages and compares them byte for byte with `site/`.
- **Deploy:** push to `main`; `.github/workflows/deploy.yml` publishes `site/` to GitHub Pages.
- Media in `site/img/` is final. Never re-encode, resize, crop or rename it.
- `site/sw.js` (registered from `ig.js`) only rides out GitHub Pages' rare 5xx errors: every request still goes to the network first, is retried on a server error, and only then falls back to the last good copy. A new page or script needs no change there.
- Recordings that must glide without a dropped frame use `recordStepped` in `tools/rec/recorder.mjs` (a frozen, stepped page clock); see the `reilly-parts` scene.
