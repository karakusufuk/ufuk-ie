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
