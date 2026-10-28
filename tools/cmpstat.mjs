import sharp from 'sharp'; import fs from 'node:fs'; import path from 'node:path';
const [a, b] = process.argv.slice(2); const rows = [];
for (const w of fs.readdirSync(a)) for (const f of fs.readdirSync(path.join(a, w))) {
  const pb = path.join(b, w, f); if (!fs.existsSync(pb)) continue;
  const [x, y] = await Promise.all([sharp(path.join(a, w, f)).raw().toBuffer(), sharp(pb).raw().toBuffer()]);
  if (x.equals(y)) continue; let max = 0, big = 0, n = 0; for (let i = 0; i < x.length; i += 3) { const d = Math.max(Math.abs(x[i] - y[i]), Math.abs(x[i + 1] - y[i + 1]), Math.abs(x[i + 2] - y[i + 2])); if (d) n++; if (d > max) max = d; if (d > 40) big++; }
  rows.push({ shot: w + '/' + f, max, big, n });
}
const buckets = { 'max delta <= 30 (video decode / poster vs first frame)': rows.filter((r) => r.max <= 30).length, 'max delta 31-60': rows.filter((r) => r.max > 30 && r.max <= 60).length, 'max delta > 60': rows.filter((r) => r.max > 60).length };
console.log(rows.length, 'differing screenshots', JSON.stringify(buckets, null, 1));
console.log('> 60:', rows.filter((r) => r.max > 60).map((r) => `${r.shot}(max ${r.max}, ${r.big} px >40)`).join('; '));
console.log('31-60:', rows.filter((r) => r.max > 30 && r.max <= 60).map((r) => `${r.shot}(max ${r.max}, ${r.big})`).join('; ').slice(0, 600));
