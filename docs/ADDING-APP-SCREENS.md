# Adding screens and store links to the app pages

The Master ID, PassPath and Match ID pages (`site/master-id.html`, `site/passpath.html`, `site/match-id.html`) are written by `tools/apps.mjs` from the data in `tools/apps-content.mjs`. Never edit those three pages by hand. KUS is the exception: `site/kus.html` is hand-built from its approved board and is edited directly.

Media for each page lives in `site/img/d/master-id/`, `site/img/d/passpath/` and `site/img/d/match-id/`. It is final: never re-encode, resize, crop or rename it, except for a new screen in step 1 below.

## Screens still to come

**None at the moment.** The six screens that were waiting on 29 Oct 2026 have all arrived and are on the pages:

| Was waiting | Arrived as |
|---|---|
| Master ID, Leaderboards: `lb-2.jpg`, `lb-3.jpg` | `lb-cities.jpg`, `lb-cars.jpg`, `lb-football.jpg` |
| Master ID, Journey: `mars.jpg` | `journey-space.jpg` |
| PassPath, More roads: `result-direct.jpg`, `result-long.jpg`, `taxipass.jpg` | the Taxi Pass flow, `taxi-1.jpg` … `taxi-10.jpg` |

## How a waiting screen works

If a screen is not ready yet, put it in the data with the file name it will have and `awaits: true`:

```js
{ img: 'lb-2.jpg', alt: 'Leaderboard of a second collection', awaits: true },
```

`apps.mjs` includes a screen marked `awaits` only when its file exists in the page's media folder. Until then it is left out of the block, together with the tap and the "go" / "fade" / "scroll" step that brings it in, and the block plays the screens it has with the same timing for each. A block whose screens all await is left out of the page completely, together with its section heading if the section is empty. No placeholder is ever written to the page. Write the block's steps as if every screen were there (a tap, then `['g', n]`, `['f', n]` or `['u', n]` for screen *n*, then a hold); the generator cuts out the steps of the missing screens and renumbers the rest.

To check it: copy any jpg to the waiting file name, run `npm run apps` and see the screen appear in its block, then remove the file and run it again: the page is back to how it was.

## Adding a screen that has arrived

1. The original is an iPhone screenshot (1206×2622). Convert it once to a JPEG of 804×1748, quality 84 (the same size and quality as the other screens), and save it under the file name the data expects in `site/img/d/<slug>/`. This is the only re-encoding allowed.
2. Look at the screen for personal data that should not be public (a real person's name, a phone number, a notification). Ask Ufuk before publishing anything doubtful.
3. Run `npm run apps` in `tools/`, open the page and check that the block plays the new screen in its place with the same timing. Run `npm run check`, `npm run heads-check`, `npm run net-check -- http://localhost:8000` and the behaviour suite (`npm run behaviour -- http://localhost:8000 chromium 1440x900`).
4. Commit `site/` and `tools/` together and push to `main`.

`apps.mjs` also refuses to build when a screen in the data has no file, or when a media folder holds a file that no screen uses (`card.jpg` is the picture the previous page's "Next project" block uses).

## Store links

The App Store and Google Play links go in `tools/apps-content.mjs`, in the `appstore` and `play` fields of each app. They are empty today, so no store button is drawn: not in the closing row, and not in the dock (the dock then holds only the next-project button). When both are empty the closing row shows only its sentence. Once a link is filled in, run `npm run apps`: its button appears in the closing row and, for the App Store, in the dock. Store links open in a new tab.
