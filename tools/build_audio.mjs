import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { encodeWav, sampleRate, normalize } from './audio/synth.mjs';
import { sounds, jingles, renderSound, renderJingle } from './audio/sfx.mjs';
import { renderSong, validateSong } from './audio/music.mjs';

// VARIABLES
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'build', 'www');
const cacheDir = join(root, 'build', 'audio-cache');
const songsDir = join(root, 'tools', 'audio', 'songs');
const engineHash = createHash('sha1').update(readFileSync(join(root, 'tools', 'audio', 'synth.mjs'))).update(readFileSync(join(root, 'tools', 'audio', 'music.mjs'))).digest('hex').slice(0, 10);
const only = process.argv.find((a) => a.startsWith('--only='));

// FUNCTIONS
function stats(samples) {
  let peak = 0;
  let sum = 0;
  for (const v of samples) {
    peak = Math.max(peak, Math.abs(v));
    sum += v * v;
  }
  return { seconds: (samples.length / sampleRate).toFixed(2), peak: peak.toFixed(2), rms: Math.sqrt(sum / samples.length).toFixed(3) };
}

async function buildSongs() {
  mkdirSync(join(out, 'music'), { recursive: true });
  mkdirSync(cacheDir, { recursive: true });
  const files = readdirSync(songsDir).filter((f) => f.endsWith('.mjs'));
  for (const file of files) {
    const name = file.replace('.mjs', '');
    if (only && only !== '--only=' + name) continue;
    const source = readFileSync(join(songsDir, file));
    const hash = createHash('sha1').update(source).update(engineHash).digest('hex').slice(0, 12);
    const target = join(out, 'music', name + '.ogg');
    const cached = join(cacheDir, name + '.' + hash + '.ogg');
    if (existsSync(cached)) {
      writeFileSync(target, readFileSync(cached));
      continue;
    }
    const song = (await import(pathToFileURL(join(songsDir, file)).href + '?v=' + hash)).default;
    const problems = validateSong(song);
    if (problems.length) {
      console.error(`song ${name} has problems:\n  ` + problems.join('\n  '));
      process.exitCode = 1;
      continue;
    }
    const samples = normalize(renderSong(song), 0.88);
    const wavPath = join(cacheDir, name + '.wav');
    writeFileSync(wavPath, encodeWav(samples));
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wavPath, '-c:a', 'libvorbis', '-q:a', '3', cached]);
    unlinkSync(wavPath);
    writeFileSync(target, readFileSync(cached));
    console.log('music', name, JSON.stringify(stats(samples)));
  }
}

function buildSfx() {
  mkdirSync(join(out, 'sfx'), { recursive: true });
  for (const [name, layers] of Object.entries(sounds)) {
    writeFileSync(join(out, 'sfx', name + '.wav'), encodeWav(renderSound(layers)));
  }
  for (const [name, song] of Object.entries(jingles)) {
    const fileName = name === 'defeat' ? 'defeat' : name;
    writeFileSync(join(out, 'sfx', fileName + '.wav'), encodeWav(renderJingle(song)));
  }
  console.log('sfx', Object.keys(sounds).length + Object.keys(jingles).length);
}

// INITIALIZATION
if (!only) buildSfx();
await buildSongs();
