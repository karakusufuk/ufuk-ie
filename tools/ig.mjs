// The Instagram grid of the dark contact block: 3 columns x 5 rows of square cells.
// Row 1: posts 1 2 3 · row 2: the profile link · row 3: posts 7 8 9 · row 4: post 11 (middle) · row 5: post 14 (middle).
// Posts 4, 5 and 6 are only ever shown by the slot-machine moment (ig.js), they have no cell of their own.
export const IG_PROFILE = 'https://www.instagram.com/ufukkarakus/';
const CELLS = [[1, '1/1'], [2, '1/2'], [3, '1/3'], [7, '3/1'], [8, '3/2'], [9, '3/3'], [11, '4/2'], [14, '5/2']];
export const IG_POOL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 14];
const pad = (n) => String(n).padStart(2, '0');
const LOGO = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5"/><circle cx="12" cy="12" r="4.1"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>';

/** prefix: '' for pages next to the img folder, '/' for the 404 page (served from any depth) */
export const igBlock = (prefix = '') => `<div class="ig" data-ig data-base="${prefix}img/ig/" data-pool="${IG_POOL.join(',')}">${CELLS.map(([n, a]) => `<span class="ph" data-n="${n}" style="grid-area:${a}"><img src="${prefix}img/ig/${pad(n)}.jpg" width="600" height="600" alt="" loading="lazy"></span>`).join('')}<a class="ig-link" href="${IG_PROFILE}" target="_blank" rel="noopener" aria-label="Instagram: ufukkarakus">${LOGO}<span>/ufukkarakus</span></a></div>`;
export const IG_HEAD = (prefix = '') => `<link rel="stylesheet" href="${prefix}ig.css">`;
export const IG_SCRIPT = (prefix = '') => `<script src="${prefix}ig.js" defer></script>`;
