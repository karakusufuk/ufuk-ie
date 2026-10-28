# Build log

## Part 1 — in progress (blocked on GitHub repo creation)
- Done: repo/ structure, site/ copy of source/ (diff -r: only CNAME differs), tools/ with check.mjs (11/11 pages byte-identical), deploy.yml (path: site), README, .gitignore, local git commit.
- Blocked: `gh repo create karakusufuk/ufuk-ie --public` was denied by the permission classifier (creates a public surface). Not retried or worked around.
- Not yet done: push, Pages workflow run, screenshot comparison gate.

## Part 1 — done
- Repo https://github.com/karakusufuk/ufuk-ie created (public), `main` pushed, Pages source = GitHub Actions. Workflow run green: https://karakusufuk.github.io/ufuk-ie/
- `diff -r source repo/site`: only `CNAME` differs.
- `npm run check`: 11/11 generated pages byte-identical.
- Screenshots (Chrome channel, 14 pages x 1440/1920, top then every viewport height, videos frozen so frames are deterministic; tools/shots.mjs + tools/cmp.mjs): control (source vs source) differs in 7 of 242 shots (homepage animation timing), site vs source in the same 7 plus one (tierney-5 at 1440, not reproducible in the control run; checked visually on garvey as spot check). Judged as test noise, since the files are byte-identical.
- Pages sub-path URL: all 14 pages load; the only 404 is the browser's automatic /favicon.ico request (source has none either; Part 8 adds it).
- Not run in Part 1: WebKit/Firefox screenshots (browser coverage starts in Part 6).

## Part 2 — done
- Read tools/build.mjs and tools/content.mjs. `npm run build` (writes ../site) and `npm run check` exist in tools/package.json.
- `npm run build` regenerated the 11 pages: `git status` shows no change under site/ (identical).
- README states the rule: edit tools/content.mjs, run `npm run build`, review, commit both.

## Part 3 — done
- Heads: title, description (exact texts from the brief), canonical, theme-color, Open Graph, Twitter card on all 14 pages. Project pages via `build.mjs` (`headMeta`, description = `desc` field if present, otherwise `sum`); index/work/about via `tools/heads.mjs` (idempotent).
- Project titles are now `<Name> · ufuk.ie`; the section `aria-label` keeps the plain name.
- OG images: `tools/og.mjs` (`npm run og`), 14 JPEGs in site/img/og/, 1200x630, 30–61 KB. Deviation from the brief: text is rendered in Chromium with the real Bricolage Grotesque file (librsvg has no access to the web font) and saved with sharp. Checked by eye: index, brennock, garvey.
- Favicon links are NOT added yet, to keep "zero 404s" true; they arrive with the files in Part 8.
- `npm run heads-check`: 14 pages, unique valid titles/descriptions/canonicals/OG images, no `claude:` tags.
- `npm run check`: 11 pages identical to what the generator produces.
- Screenshots vs source: only the known flaky homepage set plus ashgrove-2 @1440 (video frame timing; compared visually, identical).

## Part 13 (Midland Motors hero, separate repo) — done, 2026-10-28
- Done between Part 3 and Part 4 at the owner's request. Repo karakusufuk/midland-motors, commit 0cfedaa, deploy green.
- The three hero files were the only changes and matched the given SHA-256. They now load with `?v=plate2` (app.js ×3, Base.astro ×1). The live hero.mp4, hero-loop.mp4 and hero-poster.webp hashes match.
- Live check in Chrome: the plate mark forms between 5.5 and 6.0 s of video time. It is visible at 6.4 s and 9.3 s, with no change at the switch to the loop (frames 7.9 → 8.1 identical), and on the phone poster at 390 px. At 6 s of wall-clock time from page load the video is only at about 5.0 s, so the plate is still blank there.

## Part 4 — done (with documented sub-pixel residue)
- `tools/fonts.mjs` (`npm run fonts`) copies 46 WOFF2 files (latin + latin-ext) from @fontsource packages into site/fonts/ and writes `fonts.css` (Bricolage Grotesque opsz variable, Geist variable) plus one `p-<slug>.css` per project page with specimen fonts. index/work/about links are swapped by the script; project pages via build.mjs. Preload: Bricolage latin + Geist latin. All Google preconnects removed.
- Weight ranges are limited to what Google served (Bricolage 500–600, Geist 400–500, Archivo 800/125%, Source Serif 600), so text that asks for another weight is synthesised exactly as in the approved export (e.g. the Garvey "Tell us what happened." specimen at Geist 600 is browser faux-bold in source/, and stays so).
- `tools/net-check.mjs`: all 14 pages, zero requests to fonts.googleapis.com / fonts.gstatic.com, zero ≥400 responses; every expected family loads.
- Glyphs: Karakuş, Siobhán, SEISIÚN render in Bricolage and Geist (checked at 3x).
- font-display: swap on every face, so there is no invisible-text period beyond the swap.
- Screenshots (tools/shots.mjs now pins every loaded video to frame 0; source-vs-source control: 1 of 242 differ): identical except
  - specimen panels on brennock, bawn, kenilworth, midland, tierney, ashgrove: anti-aliasing differences of up to 60/255 on glyph edges (the npm font builds are not byte-identical to Google's subsets); invisible at 4x zoom.
  - homepage Brennock showcase (index-1, index-3): the paused video area renders with a per-pixel delta of up to 50/255 (mean colour unchanged to 0.4/255). It reproduces with only the font links swapped, and an identical layout box was measured. Cause not found; listed in questions.md.

## Part 5 — done
- `<img>` width/height: every `<img>` on all 14 pages now carries its real pixel size (`tools/imgsize.mjs`, called from build.mjs for project pages and run with `npm run imgsize` for index/work). Because images with a height attribute would otherwise lose auto height when `max-width` shrinks them, the base `img` rules (work.css, index.html, work.html) gained `height:auto`; rules that already set a height (`.frame>img`, `.card-img img`, `.show-frame img`) are more specific and unchanged.
- Hero: measured with `tools/hero-timing.mjs` (Chrome, throttled): intro playing after 0.58 s median on 10 Mbit with the loop video preloading as today (A) vs 0.59 s with the loop held back (B); Fast 3G 3.6 s in both. No gain, so `hero-loop.mp4` keeps `preload="auto"`. All other videos untouched; `?v=` queries untouched.
- Lighthouse (desktop, Chrome, local server; JSON in docs/lighthouse/): index 99/96/96/100, work 98/96/96/100, brennock 98/96/96/100 (Performance / Accessibility / Best Practices / SEO), CLS 0 on all.
- Fixes without visible change: work.html card titles `h3` → `h2` (heading order; CSS selector updated); project pages: the "Visit the live site" link moved out of the `<dl>` into a `.facts-row` grid wrapper with `dl{display:contents}` (valid definition list, same layout).
- Remaining items, by design and not changed: colour contrast of `#7a8398` small labels and the pink/“d” spans, and the favicon 404 console error (arrives in Part 8).
- Screenshots: same set of differences as after Part 4 (nothing new).
