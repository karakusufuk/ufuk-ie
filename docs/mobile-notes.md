# Mobile notes (for the separate mobile pass)

Checked in WebKit at 390×844, 430×932 and 768×1024 on all 14 pages and the 404 (`tools/phones.mjs`): no horizontal scroll, nothing sticks out of the viewport, no console errors. A real touch swipe opens a project page (Chrome, mobile emulation): page stays at scrollY 0 and the line drops to 36 px above the bottom. Nothing was broken enough to change; these are the things that "could look better", none of them changed:

- Header links (Work, About, Contact) on the project pages, About and the 404 are 23 px tall (36–55 px wide). A slightly taller hit area (padding) would make them easier to tap.
- The homepage hero on a phone shows the intro recording cropped to the portrait frame; the headline types over it (checked only in the quiet state, the typing itself is tested on desktop).
- Showcases on ≤ 900 px follow the scroll through a taller section (by design); full-page screenshots therefore show large empty stretches, which is the pinned layout and not a bug.
- Vertical card names on the Work and "More work" grids are small (19 px rotated) on a 390 px screen.
- Text sizes in the "Behind it" sections are 15–17 px; readable, could be a touch larger on phones.
- The pink focus ring and pink print line are very light on the grey ground; on touch devices that does not matter, but see questions.md for the keyboard case.
