# Questions

Things that look like bugs or design mistakes. Nothing here has been changed.

- deploy.yml: the example workflow comment said the repository root is the site; updated to say site/.
- Part 4: after self-hosting the fonts, the paused Brennock showcase video on the homepage renders with a tiny per-pixel difference (max 50/255, mean 0.4/255) against source/. Element box, frame time and state are identical; it reproduces when only the font links are swapped. Not visible side by side. Accept, or investigate further?
- Part 4: specimen panels show sub-pixel anti-aliasing differences (npm font builds vs Google's served subsets). Not visible at 4x zoom.
- Garvey "Type and colour": the Geist 600 specimen renders as browser faux-bold in the approved export (only Geist 400/500 were loaded). Kept identical; flagging in case a true 600 was intended.
