import sharp from 'sharp';
const [name, l, t, w, h, out] = process.argv.slice(2); const a = '/private/tmp/claude-501/shots3/';
const r = { left: +l, top: +t, width: +w, height: +h };
const x = await sharp(a + 'srcA/' + name + '.png').extract(r).toBuffer(), y = await sharp(a + 'site/' + name + '.png').extract(r).toBuffer();
await sharp({ create: { width: r.width * 2 + 10, height: r.height, channels: 3, background: '#f00' } }).composite([{ input: x, left: 0, top: 0 }, { input: y, left: r.width + 10, top: 0 }]).png().toFile(a + out);
