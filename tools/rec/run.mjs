// node rec/run.mjs <scene name>...   (e.g. reilly-checker)   — records the scenes from rec/scenes.mjs into site/img/d/<slug>/
import { open, close, record } from './recorder.mjs';
import { scenes } from './scenes.mjs';
const names = process.argv.slice(2);
if (!names.length) { console.log('scenes: ' + Object.keys(scenes).join(', ')); process.exit(0); }
await open();
try {
  for (const n of names) {
    const s = scenes[n]; if (!s) throw new Error('no scene ' + n);
    const r = await record(s, { outDir: process.env.OUT });
    console.log(n, '->', r.file, r.frames + ' frames', JSON.stringify(r.marks), r.errors.length ? 'errors: ' + r.errors.join(' | ') : '');
  }
} finally { await close(); }
