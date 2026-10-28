# Adding the KUS case study

Everything is prepared; this is a content job. Nothing on the live pages changes until step 5.

1. **Media.** Put the recordings in `site/img/d/kus/` (never re-encode or resize them):
   - cover: `hero.mp4` + `hero.jpg` (poster, 1440×900)
   - one `<name>.mp4` + `<name>.jpg` per block (the name is what you pass to `v('<name>')` in step 2)
   - phone screens `m1.jpg`, `m2.jpg`, `m3.jpg` (390×844 @2x)
2. **Fill the object.** In `tools/content.mjs`, find the comment "KUS (case study, waiting for material)". Remove the comment markers, then fill in `sum` (one sentence: the problem and what it gains the business), `facts`, the `sections` with notes in the designer's voice (situation → what I did → why → what it gains the business), the `phones` items and the `deep` rows. `live` must be a real URL for the template's "Visit the live site" buttons; KUS is internal software, so decide with the owner what that button points to before publishing.
3. **Put it in the chain** (Brennock → KUS → Reilly), all in `tools/content.mjs`:
   - move the object into `pages`, right after Brennock
   - Brennock: `next: NEXT.reilly` becomes `next: NEXT.kus`
   - KUS: `next: NEXT.reilly` (already so)
   - add to `NEXT`: `kus: { slug: 'kus', name: 'KUS', sub: 'Internal software, distribution warehouse', img: 'img/d/kus/hero.jpg' },`
4. **Build.** In `tools/`: `npm run build`, then `npm run og` (sharing image), `npm run sitemap` (adds kus.html), `npm run heads-check`, `npm run check`.
5. **Switch the two links that point at the homepage showcase today.**
   - `site/work.html`, the KUS card: change `<a class="card" href="index.html#kus" data-kind="app case">` to `<a class="card" href="kus.html" data-kind="app case">`
   - `site/index.html`, the KUS showcase button: change `<a class="show-link" href="#how">How it was made</a>` to `<a class="show-link" href="kus.html">How it was made</a>` (the wording stays unless the owner changes it)
6. **Test.** `npm run behaviour -- http://localhost:8000 chromium 1440x900`: the "KUS slot" check runs automatically once `site/kus.html` exists and verifies both links and the chain (Brennock → KUS → Reilly). Also run `npm run net-check` and take the screenshots of the new page at 1440 and 1920.
7. Commit `tools/` and `site/` together, push to `main`.
