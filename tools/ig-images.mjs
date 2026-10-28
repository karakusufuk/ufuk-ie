// Turns the downloaded 1080x1080 Instagram originals into site/img/ig/NN.jpg (600x600). Usage: node ig-images.mjs <dir with raw-NN.jpg>
import sharp from 'sharp';
import path from 'node:path';
const src = process.argv[2], out = path.join(path.dirname(new URL(import.meta.url).pathname), '../site/img/ig');
for (const n of ['01', '02', '03', '04', '05', '06', '07', '08', '09', '11', '14']) {
  const m = await sharp(path.join(src, `raw-${n}.jpg`)).metadata();
  if (m.width !== m.height) throw new Error(n + ' is not square: ' + m.width + 'x' + m.height);
  await sharp(path.join(src, `raw-${n}.jpg`)).resize(600, 600, { kernel: 'lanczos3' }).jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: '4:4:4' }).toFile(path.join(out, `${n}.jpg`));
}
console.log('11 images written');
