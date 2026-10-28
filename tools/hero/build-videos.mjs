// Joins the recorded scenes into hero-intro.mp4 and hero-loop.mp4 with short crossfades (node build-videos.mjs [fade] [out dir]).
//   intro: 8 shots. Shot 1 = 2.4 s, shots 2-7 = 2.0 s (centre of one crossfade to the centre of the next), shot 8 = the lane clip,
//          which runs until the screen is completely solid green and holds it for HOLD frames; the file ends there.
//   loop : dark-ground shots only, 2.0 s each; the last shot fades into the first, so the file loops without a seam.
// The first fully solid green frame of the intro is measured in the finished file and written into index.html (data-green).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { order } from './scenes.mjs';

const here = path.dirname(new URL(import.meta.url).pathname);
const clips = path.join(here, 'clips');
const FADE = +(process.argv[2] ?? 0.3);
const out = process.argv[3] || path.join(here, '../../site/img');
const H = FADE / 2, SHOT = 2.0, CLIP = SHOT + FADE, FPS = 30, HOLD = 5;
const ENC = ['-c:v', 'libx264', '-profile:v', 'high', '-preset', 'veryfast', '-crf', process.env.CRF || '28', '-pix_fmt', 'yuv420p', '-r', '30', '-an', '-movflags', '+faststart'];

// frame index of the first fully solid green frame of a clip / video (green = the colour of the clip's last frame)
function solidFrames(file) {
  const W = 160, Hh = 90, FS = W * Hh * 3;
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', `scale=${W}:${Hh}`, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 29 });
  const n = raw.length / FS, ref = [raw[(n - 1) * FS], raw[(n - 1) * FS + 1], raw[(n - 1) * FS + 2]];
  const solid = (f) => { for (let i = 0; i < W * Hh; i++) { const o = f * FS + i * 3; if (Math.abs(raw[o] - ref[0]) > 14 || Math.abs(raw[o + 1] - ref[1]) > 14 || Math.abs(raw[o + 2] - ref[2]) > 24) return false; } return true; };
  let first = -1; for (let f = 0; f < n; f++) if (solid(f)) { first = f; break; }
  let run = 0; if (first >= 0) while (first + run < n && solid(first + run)) run++;
  return { first, run, n, ref };
}

// The recordings carry the site's own header bar on top (and, for Bawn, the next section sliding in at the bottom). Those bands are cut off
// and the rest is scaled up to fill the whole 16:9 frame, so no shot has a strip above or below it. [rows cut at top, rows cut at bottom], measured per clip.
const CUT = { brennock: [102, 0], brennockNight: [102, 0], garvey: [88, 84], reilly: [72, 0], midland: [76, 0], bawn: [0, 108], monument: [100, 0] };
const cropFor = (n) => { const c = CUT[n]; if (!c) return ''; const h = 900 - c[0] - c[1], w = Math.floor(h * 16 / 9 / 2) * 2, x = Math.floor((1600 - w) / 2 / 2) * 2; return `crop=${w}:${h}:${x}:${c[0]},`; };

function chain(names, offsets, lens, tail) {
  const args = ['-v', 'error', '-y'];
  names.forEach((n) => args.push('-i', path.join(clips, n + '.mp4')));
  let f = names.map((n, i) => `[${i}:v]${lens[i] ? `trim=duration=${lens[i]},` : ''}setpts=PTS-STARTPTS,fps=30,${cropFor(n)}scale=1600:900,setsar=1,format=yuv420p[c${i}]`).join(';') + ';';
  let prev = 'c0';
  for (let i = 1; i < names.length; i++) { const o = `x${i}`; f += `[${prev}][c${i}]xfade=transition=fade:duration=${FADE}:offset=${offsets[i - 1].toFixed(3)}[${o}];`; prev = o; }
  f += `[${prev}]${tail}[v]`;
  return { args, f };
}

// ---- intro
const laneClip = solidFrames(path.join(clips, 'lane.mp4'));
if (laneClip.first < 0 || laneClip.run < HOLD) throw new Error('the lane clip has no solid green frames');
const laneLen = (laneClip.first + HOLD) / FPS;             // the clip is cut HOLD frames after the first solid frame: lanes are never cut while still growing
{
  const names = order.intro, first = 2.4;
  const offsets = names.slice(1).map((_, i) => first - H + i * SHOT);
  const lens = names.map((n, i) => (i === 0 ? 0 : n === 'lane' ? +laneLen.toFixed(4) : CLIP));
  const total = offsets[offsets.length - 1] + laneLen;
  const { args, f } = chain(names, offsets, lens, `trim=duration=${total.toFixed(4)},setpts=PTS-STARTPTS`);
  const file = path.join(out, 'hero-intro.mp4');
  execFileSync('ffmpeg', [...args, '-filter_complex', f, '-map', '[v]', ...ENC, file]);
  const g = solidFrames(file);
  const tG = g.first / FPS;
  console.log('intro', names.join(' > '), '\n  lane clip: first solid frame', laneClip.first, `-> cut after ${laneLen.toFixed(3)} s; intro ${(g.n / FPS).toFixed(3)} s; first full-green frame #${g.first} = ${tG.toFixed(4)} s, ${g.run} solid frames until the end`);
  if (g.first < 0 || g.first + g.run !== g.n || g.run < HOLD) throw new Error('intro does not end on a solid green hold');
  // the page blurs on this frame
  const idx = path.join(here, '../../site/index.html'), html = fs.readFileSync(idx, 'utf8');
  const patched = html.replace(/(<video id="vid"[^>]*?)( data-green="[^"]*")?( autoplay)/, `$1 data-green="${tG.toFixed(4)}"$3`);
  if (patched === html && !html.includes(`data-green="${tG.toFixed(4)}"`)) console.log('  (index.html: data-green attribute not found, set it by hand)'); else fs.writeFileSync(idx, patched);
}
// ---- loop (the first shot is repeated at the end for the seam)
{
  const names = [...order.loop, order.loop[0]];
  const offsets = names.slice(1).map((_, i) => (i + 1) * SHOT);
  const lens = names.map(() => CLIP);
  const { args, f } = chain(names, offsets, lens, `trim=start=${FADE}:duration=${(names.length - 1) * SHOT},setpts=PTS-STARTPTS`);
  execFileSync('ffmpeg', [...args, '-filter_complex', f, '-map', '[v]', ...ENC, path.join(out, 'hero-loop.mp4')]);
  console.log('loop', names.join(' > '));
}
