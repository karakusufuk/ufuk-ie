# ufuk.ie

Personal portfolio of Ufuk Karakuş, designer and developer in Ireland. A static site: no framework, no build step for the pages other than the 11 generated project pages.

- **Preview:** `cd site && python3 -m http.server 8000`, then open http://localhost:8000
- **Change a project page:** edit `tools/content.mjs` (or `tools/build.mjs`), run `npm run build` in `tools/`, review, commit both. Never hand-edit a project page in `site/`.
- **Check the generator:** `npm run check` in `tools/` regenerates the 11 pages and compares them byte for byte with `site/`.
- **Deploy:** push to `main`; `.github/workflows/deploy.yml` publishes `site/` to GitHub Pages.
- Media in `site/img/` is final. Never re-encode, resize, crop or rename it.
