# Adding the Bawn phone screens

The "On the phone" section of `bawn.html` was removed on purpose until the Bawn site's mobile layout is redone.

1. Put the new screenshots in `site/img/d/bawn/` as `m1.jpg`, `m2.jpg`, `m3.jpg` (390×844 @2x; replace the existing files). Captions: Home, Products, Customer panel. Never re-encode or resize them afterwards.
2. In `tools/content.mjs`, in the Bawn page, find the line that starts `// phones removed until the Bawn mobile layout is redone:` and delete the comment prefix so that it reads `{ t: 'phones', h: 'On the phone', items: [{ m: ph('m1'), cap: 'Home' }, { m: ph('m2'), cap: 'Products' }, { m: ph('m3'), cap: 'Customer panel' }] },`.
3. In `tools/`: `npm run build`, `npm run check`. Open `bawn.html` and confirm the three phones show with their captions.
4. Commit `tools/` and `site/` together, push to `main`.
