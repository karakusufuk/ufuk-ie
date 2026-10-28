# Questions

Things that look like bugs or design mistakes. Nothing here has been changed.

- deploy.yml: the example workflow comment said the repository root is the site; updated to say site/.
- Part 4: after self-hosting the fonts, the paused Brennock showcase video on the homepage renders with a tiny per-pixel difference (max 50/255, mean 0.4/255) against source/. Element box, frame time and state are identical; it reproduces when only the font links are swapped. Not visible side by side. Accept, or investigate further?
- Part 4: specimen panels show sub-pixel anti-aliasing differences (npm font builds vs Google's served subsets). Not visible at 4x zoom.
- Garvey "Type and colour": the Geist 600 specimen renders as browser faux-bold in the approved export (only Geist 400/500 were loaded). Kept identical; flagging in case a true 600 was intended.
- Part 5: Lighthouse colour-contrast failures remain on purpose (design colours): `--ink-3` `#7a8398` labels (3.35:1 on the grey ground, 3.79:1 on white) on project pages, and the pink `#C4577D` / `.d` spans on the homepage and Work. Raising them would change colours; your call.
- Part 5: Fast 3G start of the homepage intro is 3.6 s (2 MB file). On 10 Mbit it starts in 0.6 s. Only a smaller intro file would change that, which is off limits.
- Part 7: KUS is internal software, but the project-page template requires a `live` URL for the "Visit the live site" buttons (top link, closing button, dock). Decide what the KUS page should do there before it goes live (a template option to omit the buttons would be a small change in build.mjs/work.js).
- Part 7: the homepage KUS button reads "How it was made". When it points to kus.html you may want "See the case study" like Brennock and Reilly. Only the href is changed in ADDING-KUS.md.
- Part 8: on the github.io sub-path URL the 404 page's root-absolute links and styles do not resolve (they resolve on ufuk.ie). The brief asks for absolute paths; nothing to do once DNS is in place.
- Part 8: `availableLanguage` was moved from `ProfessionalService` to a `ContactPoint` because schema.org does not define it on `ProfessionalService`.
