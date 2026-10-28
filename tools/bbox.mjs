import sharp from 'sharp';
const [a, b] = process.argv.slice(2);
const [x, y] = await Promise.all([sharp(a).raw().toBuffer({ resolveWithObject: true }), sharp(b).raw().toBuffer({ resolveWithObject: true })]);
const { width: w, height: h, channels: c } = x.info; let x0 = w, y0 = h, x1 = 0, y1 = 0, n = 0, max = 0;
for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) { let d = 0; for (let k = 0; k < c; k++) d = Math.max(d, Math.abs(x.data[(i * w + j) * c + k] - y.data[(i * w + j) * c + k])); if (d) { n++; max = Math.max(max, d); x0 = Math.min(x0, j); x1 = Math.max(x1, j); y0 = Math.min(y0, i); y1 = Math.max(y1, i); } }
console.log(`${n} px differ, max delta ${max}, bbox x ${x0}-${x1} y ${y0}-${y1}`);
