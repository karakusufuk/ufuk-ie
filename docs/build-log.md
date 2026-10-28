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

## Part 6 — done
`tools/behaviour.spec.mjs` (`npm run behaviour -- <baseUrl> <chromium|webkit|firefox> <WxH>`), 17 checks, run against the local build (http://localhost:8101, same files as site/). Chromium = installed Chrome (H.264). Results saved in docs/test-runs/: **17/17 pass in Chrome, WebKit and Firefox, at 1440x900 and 1920x1080; zero console errors and zero ≥400 responses** (favicon excluded until Part 8). The suite was checked for teeth by breaking the site on purpose (gesture lock removed, opening-inertia guard removed): it failed both times.

Section 2, item by item (browsers: C = Chrome, W = WebKit, F = Firefox; all at both sizes):
- 2.1.1 starts at the top, 2.1.2 no headline at 2 s (CWF) · 2.1.3 `.loop` then `.blur`, filter blur(9px) brightness(.72) after the 3 s ramp, blur class at 10.7 s (CWF) · 2.1.4 headline typed in full, text equals "You know your business. I know what it needs online.", done at ~23.7–24.1 s, caret ends after 3 blinks (CWF; typo and the two pauses seen in docs/recordings/01) · 2.1.5 header bar hidden in hero, returns on scroll up, hides on scroll down (CWF) · 2.1.6 showcases: steps 0>1>2 without scrollY change, a long gesture of 12 wheel events = one step, next gesture scrolls, snap into KUS, ArrowDown/ArrowUp, Reilly single step (CWF; ≤900 px follow-scroll mode is Part 9) · 2.1.7 hover adds `.hv-on`, video from frame 0, fades out on leave (CWF) · 2.1.8 right column half a card lower, drift transform (CWF).
- 2.2 Work: counts 15/11/4/4, columns re-dealt alternately, aria-pressed, no focus ring after click, 4 "Case study" pills, header bar visible, hover and parallax (CWF).
- 2.3 project pages: hidden until settled at scrollY 0, line ~44 px under the summary until a gesture, one wheel opens the page with scrollY 0 (also against 6 trailing inertia events) and the line at 36 px above the bottom, line locks and hides at the footer, pins drawn, recordings load only near the viewport, arrow pulses forever (nudge, infinite), first click docks without opening a page and the text flies to the dock (text hidden, dock right edge = text right edge ±2), second click (dock) opens the live URL in a new page, dock hidden until the second scroll, footer text and WhatsApp link, reduced motion (CWF).
- 2.4 About: loads clean; "KUS" in the proof row is pink rgb(247,210,222) (CWF).
- Part 6.3 "opens at the bottom, then jumps to the top": for all 11 pages from the Work card (page scrolled to the bottom first), from the homepage cards, along the whole Next-project chain from the bottom of each page, then back x3 and forward x3: always scrollY 0, and a per-frame monitor saw the page revealed away from the top zero times (CWF).
- By eye: docs/recordings/01–04 (.webm, git-ignored for size; regenerate with `npm run record`): hero blur ramp (8th clip partly, 9th fully blurred), typing with the "t" slip and the pauses, Brennock truck arriving at "to your door.", the sectors band drifting, the pin line inverting inside a light and inside a dark (Bawn) recording, line printing and dropping, dock appearing.

## Part 7 — done
- `docs/ADDING-KUS.md` (media, fill the object, chain Brennock → KUS → Reilly with `NEXT.kus`, build/og/sitemap, the two exact link lines in work.html and index.html, tests) and `docs/ADDING-BAWN-PHONES.md` exist. `tools/sitemap.mjs` (`npm run sitemap`) added so the sitemap follows `pages`.
- The Playwright "KUS slot" check in `tools/behaviour.spec.mjs` is skipped while `site/kus.html` does not exist (the run prints "skip").
- Dry run on a throwaway branch with dummy files (copies of Brennock media, dummy words) following ADDING-KUS.md step by step: `kus.html` built, title "KUS · ufuk.ie", OG image made, sitemap 15 URLs, heads-check OK on 15 pages, Brennock → KUS → Reilly chain correct, Work card and homepage button point to kus.html, "KUS slot" check passed, page rendered with the pin and the dock. Branch deleted; `npm run build` on main: 11 pages byte-identical, working tree clean, KUS still commented, Bawn phones still off.
- Nothing placeholder-like exists on the live pages.

## Part 8 — done (two checks cannot be fully completed here, see below)
- Favicon set from `tools/icons.mjs` (`npm run icons`): `favicon.svg` (lowercase "u", Bricolage Grotesque 600 converted to an outline, pink #F7D2DE on navy #151C2E, rounded square 22%), `favicon.ico` (32×32 PNG inside ICO), `apple-touch-icon.png` (180×180, RGB, no alpha, full-bleed so iOS rounds it), `site.webmanifest` (name "ufuk.ie", theme #EEF1F5). Linked from all 14 pages and the 404 (project pages via build.mjs, index/work/about via heads.mjs). The font is unpacked with wawoff2 because fontkit cannot read this WOFF2 directly.
- `404.html` generated by build.mjs: project-page header and footer, grey ground, "This page isn't here." in Bricolage 600, links "See the work" (/work.html) and "Back to the start" (/index.html), root-absolute asset paths, `noindex`. Verified in Chrome behind a Pages-style server (404 for any depth, e.g. /does-not-exist/deep/path: status 404, styled, both links reach Work and the homepage). On the Pages URL `https://karakusufuk.github.io/ufuk-ie/does-not-exist` GitHub serves this page with HTTP 404, but because the site lives under `/ufuk-ie/` there, its root-absolute links and styles point at `karakusufuk.github.io/` and do not resolve. That is inherent to the brief's rule (absolute paths) and goes away on `https://ufuk.ie`; to be re-tested there in Part 10/11.
- `sitemap.xml` (14 pages, from `tools/sitemap.mjs`, absolute https://ufuk.ie URLs) and `robots.txt` (allow all + sitemap) served on the Pages URL (200).
- JSON-LD on index and about: `Person` (Ufuk Karakuş, jobTitle, address country IE, url, `sameAs: []`) and `ProfessionalService` (name, areaServed Ireland + Europe, English/Turkish). `availableLanguage` is not a property of `ProfessionalService` in schema.org, so it sits on a `contactPoint` (ContactPoint) of the business; `tools/ld-check.mjs` validates types and properties against the schema.org vocabulary: zero errors.
- Favicon in browsers: Chrome, WebKit and Firefox all fetch `favicon.svg` (WebKit also the manifest, Firefox also the touch icon) with status 200 on the Pages URL; rendered at 32 px and 180 px and checked by eye. I could not look at an actual tab strip or an iOS home-screen preview from a headless run; that last look is yours.
- Screenshots of the 14 pages vs source: the same known set as before, nothing new. The favicon 404 console error from Lighthouse is gone (shots.mjs now reports "no console errors / 404s").
