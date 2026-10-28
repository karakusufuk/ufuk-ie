import sharp from 'sharp'; import fs from 'node:fs'; import path from 'node:path';
const [a, b] = process.argv.slice(2); let n = 0, bad = 0;
for (const w of fs.readdirSync(a)) for (const f of fs.readdirSync(path.join(a, w))) {
  n++; const pb = path.join(b, w, f);
  if (!fs.existsSync(pb)) { console.log('MISSING', w, f); bad++; continue; }
  const [x, y] = await Promise.all([sharp(path.join(a, w, f)).raw().toBuffer(), sharp(pb).raw().toBuffer()]);
  if (!x.equals(y)) { let d = 0; for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) d++; console.log('DIFF', w, f, d + ' bytes'); bad++; }
}
console.log(`${n} screenshots compared, ${bad} differ`);
