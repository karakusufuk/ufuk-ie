import sharp from 'sharp';
const [src, dst, chunkArg = '1688', perRow = '6'] = process.argv.slice(2);
const m = await sharp(src).metadata(); const ch = +chunkArg; const n = Math.ceil(m.height / ch);
const tiles = []; for (let i = 0; i < n; i++) { const hh = Math.min(ch, m.height - i * ch); tiles.push({ input: await sharp(src).extract({ left: 0, top: i * ch, width: m.width, height: hh }).resize(Math.round(m.width / 2)).toBuffer(), i }); }
const tw = Math.round(m.width / 2), th = Math.round(ch / 2), pr = +perRow, rows = Math.ceil(n / pr);
await sharp({ create: { width: tw * Math.min(n, pr) + 6 * (Math.min(n, pr) - 1), height: th * rows + 6 * (rows - 1), channels: 3, background: '#c00' } }).composite(tiles.map((t) => ({ input: t.input, left: (t.i % pr) * (tw + 6), top: Math.floor(t.i / pr) * (th + 6) }))).png().toFile(dst);
console.log(dst, n, 'tiles');
