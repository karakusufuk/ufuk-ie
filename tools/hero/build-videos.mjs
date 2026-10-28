// Joins the recorded scenes into hero-intro.mp4 and hero-loop.mp4 with short crossfades (node build-videos.mjs [fade] [out dir]).
//   intro: 7 shots, shot 1 = 2.5 s, the others 2.0 s (centre of one crossfade to the centre of the next), 14.5 s in all.
//   loop : 10 shots x 2.0 s = 20 s; the last shot fades into the first, so the file loops without a seam.
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { order } from './scenes.mjs';

const here = path.dirname(new URL(import.meta.url).pathname);
const clips = path.join(here, 'clips');
const FADE = +(process.argv[2] ?? 0.3);
const out = process.argv[3] || path.join(here, '../../site/img');
const H = FADE / 2, SHOT = 2.0, CLIP = SHOT + FADE;
const ENC = ['-c:v', 'libx264', '-profile:v', 'high', '-preset', 'veryfast', '-crf', process.env.CRF || '28', '-pix_fmt', 'yuv420p', '-r', '30', '-an', '-movflags', '+faststart'];

function chain(names, offsets, lens, tail) {
  const args = ['-v', 'error', '-y'];
  names.forEach((n) => args.push('-i', path.join(clips, n + '.mp4')));
  let f = names.map((n, i) => `[${i}:v]${lens[i] ? `trim=duration=${lens[i]},` : ''}setpts=PTS-STARTPTS,fps=30,scale=1600:900,setsar=1,format=yuv420p[c${i}]`).join(';') + ';';
  let prev = 'c0';
  for (let i = 1; i < names.length; i++) { const o = `x${i}`; f += `[${prev}][c${i}]xfade=transition=fade:duration=${FADE}:offset=${offsets[i - 1].toFixed(3)}[${o}];`; prev = o; }
  f += `[${prev}]${tail}[v]`;
  return { args, f };
}

// intro
{
  const names = order.intro;
  const first = 2.4;                                   // on-screen time of shot 1
  const offsets = names.slice(1).map((_, i) => first - H + i * SHOT);
  const lens = names.map((n, i) => (i === 0 ? 0 : CLIP));
  const { args, f } = chain(names, offsets, lens, `trim=duration=${first + (names.length - 1) * SHOT},setpts=PTS-STARTPTS`);
  execFileSync('ffmpeg', [...args, '-filter_complex', f, '-map', '[v]', ...ENC, path.join(out, 'hero-intro.mp4')]);
  console.log('intro', names.join(' > '), 'offsets', offsets.map((o) => o.toFixed(2)).join(' '));
}
// loop (first shot repeated at the end for the seam)
{
  const names = [...order.loop, order.loop[0]];
  const offsets = names.slice(1).map((_, i) => (i + 1) * SHOT);
  const lens = names.map(() => CLIP);
  const { args, f } = chain(names, offsets, lens, `trim=start=${FADE}:duration=${(names.length - 1) * SHOT},setpts=PTS-STARTPTS`);
  execFileSync('ffmpeg', [...args, '-filter_complex', f, '-map', '[v]', ...ENC, path.join(out, 'hero-loop.mp4')]);
  console.log('loop', names.join(' > '));
}
