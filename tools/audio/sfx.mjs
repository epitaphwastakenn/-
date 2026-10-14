import { sampleRate, Voice, OnePole, normalize, softClip } from './synth.mjs';
import { renderSong } from './music.mjs';

// VARIABLES
const n = (name) => {
  const map = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const m = /^([A-G])([#b]?)(\d)$/.exec(name);
  let s = map[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  return 440 * Math.pow(2, ((Number(m[3]) + 1) * 12 + s - 69) / 12);
};

export const sounds = {
  click: [{ wave: 'pulse', duty: 0.5, f0: 900, f1: 1150, t: 0.04, vol: 0.35, lowpass: 6000 }],
  back: [{ wave: 'pulse', duty: 0.5, f0: 700, f1: 420, t: 0.06, vol: 0.32, lowpass: 5000 }],
  select: [
    { wave: 'pulse', duty: 0.25, f0: n('E5'), t: 0.05, vol: 0.3 },
    { wave: 'pulse', duty: 0.25, f0: n('B5'), t: 0.09, vol: 0.3, delay: 0.045 },
  ],
  buy: [
    { wave: 'pulse', duty: 0.5, f0: n('B5'), t: 0.06, vol: 0.32 },
    { wave: 'pulse', duty: 0.5, f0: n('E6'), t: 0.28, vol: 0.32, delay: 0.06, shape: 2 },
    { wave: 'noise', f0: 20000, t: 0.12, vol: 0.08, delay: 0.06, highpass: 6000 },
  ],
  error: [{ wave: 'saw', f0: 150, f1: 110, t: 0.16, vol: 0.35, lowpass: 1400 }],
  gem: [{ wave: 'triangle', f0: 1300, f1: 1900, t: 0.055, vol: 0.4, shape: 1 }],
  coin: [
    { wave: 'pulse', duty: 0.5, f0: n('B5'), t: 0.05, vol: 0.28 },
    { wave: 'pulse', duty: 0.5, f0: n('E6'), t: 0.22, vol: 0.28, delay: 0.05, shape: 2 },
  ],
  heal: [
    { wave: 'triangle', f0: n('C5'), t: 0.08, vol: 0.4 },
    { wave: 'triangle', f0: n('E5'), t: 0.08, vol: 0.4, delay: 0.07 },
    { wave: 'triangle', f0: n('G5'), t: 0.08, vol: 0.4, delay: 0.14 },
    { wave: 'triangle', f0: n('C6'), t: 0.25, vol: 0.4, delay: 0.21, vib: 0.01, vibRate: 7 },
  ],
  magnet: [
    { wave: 'saw', f0: 180, f1: 900, t: 0.4, vol: 0.25, lowpass: [600, 4000], vib: 0.03, vibRate: 18, a: 0.05, shape: 0.8 },
    { wave: 'sine', f0: 600, f1: 1800, t: 0.4, vol: 0.2, a: 0.05 },
  ],
  bomb: [
    { wave: 'noise', f0: 9000, t: 0.8, vol: 0.9, lowpass: [4000, 150], shape: 1.4 },
    { wave: 'sine', f0: 120, f1: 30, t: 0.6, vol: 0.9, shape: 1.2 },
  ],
  freeze: [
    { wave: 'sine', f0: 2200, f1: 3200, t: 0.45, vol: 0.25, vib: 0.04, vibRate: 30, a: 0.02 },
    { wave: 'sine', f0: 3300, f1: 4400, t: 0.45, vol: 0.15, delay: 0.05, a: 0.02 },
    { wave: 'noise', f0: 30000, t: 0.4, vol: 0.18, highpass: 5000, a: 0.05 },
  ],
  chestPickup: [
    { wave: 'pulse', duty: 0.25, f0: n('G5'), t: 0.07, vol: 0.3 },
    { wave: 'pulse', duty: 0.25, f0: n('D6'), t: 0.2, vol: 0.3, delay: 0.07 },
  ],
  blueprint: [
    { wave: 'triangle', f0: n('A5'), t: 0.1, vol: 0.35 },
    { wave: 'triangle', f0: n('C#6'), t: 0.1, vol: 0.35, delay: 0.08 },
    { wave: 'triangle', f0: n('E6'), t: 0.1, vol: 0.35, delay: 0.16 },
    { wave: 'triangle', f0: n('A6'), t: 0.35, vol: 0.35, delay: 0.24, vib: 0.01, vibRate: 8 },
    { wave: 'noise', f0: 25000, t: 0.5, vol: 0.08, highpass: 7000, delay: 0.1 },
  ],
  hurt: [
    { wave: 'noise', f0: 8000, t: 0.08, vol: 0.5, lowpass: 3000 },
    { wave: 'pulse', duty: 0.5, f0: 420, f1: 140, t: 0.16, vol: 0.4, lowpass: 2500 },
  ],
  death: [
    { wave: 'pulse', duty: 0.25, f0: n('G4'), t: 0.2, vol: 0.35, vib: 0.02, vibRate: 6 },
    { wave: 'pulse', duty: 0.25, f0: n('E4'), t: 0.2, vol: 0.35, delay: 0.2, vib: 0.02, vibRate: 6 },
    { wave: 'pulse', duty: 0.25, f0: n('C4'), f1: n('C3'), t: 0.7, vol: 0.35, delay: 0.4, vib: 0.03, vibRate: 5 },
    { wave: 'noise', f0: 3000, t: 0.5, vol: 0.2, lowpass: 1200 },
  ],
  levelup: [
    { wave: 'pulse', duty: 0.125, f0: n('C5'), t: 0.07, vol: 0.3 },
    { wave: 'pulse', duty: 0.125, f0: n('E5'), t: 0.07, vol: 0.3, delay: 0.06 },
    { wave: 'pulse', duty: 0.125, f0: n('G5'), t: 0.07, vol: 0.3, delay: 0.12 },
    { wave: 'pulse', duty: 0.125, f0: n('C6'), t: 0.3, vol: 0.32, delay: 0.18, vib: 0.012, vibRate: 7 },
    { wave: 'triangle', f0: n('C4'), t: 0.45, vol: 0.3, delay: 0.0 },
  ],
  revive: [
    { wave: 'triangle', f0: n('C5'), f1: n('C6'), t: 0.6, vol: 0.4, a: 0.05 },
    { wave: 'pulse', duty: 0.125, f0: n('G5'), f1: n('G6'), t: 0.6, vol: 0.18, a: 0.05 },
    { wave: 'noise', f0: 25000, t: 0.7, vol: 0.1, highpass: 6000, a: 0.1 },
  ],
  meow: [
    { wave: 'saw', pitch: [[0, 620], [0.1, 900], [0.22, 820], [0.42, 520]], t: 0.42, vol: 0.32, lowpass: [2600, 900], a: 0.03, shape: 0.9, vib: 0.015, vibRate: 9 },
    { wave: 'sine', pitch: [[0, 1240], [0.1, 1800], [0.22, 1640], [0.42, 1040]], t: 0.42, vol: 0.12, a: 0.03, shape: 1 },
  ],
  hit: [
    { wave: 'noise', f0: 14000, t: 0.03, vol: 0.4, highpass: 900 },
    { wave: 'pulse', duty: 0.5, f0: 280, f1: 180, t: 0.04, vol: 0.25, lowpass: 2000 },
  ],
  pop: [
    { wave: 'sine', f0: 280, f1: 950, t: 0.07, vol: 0.5, shape: 1.5 },
    { wave: 'noise', f0: 9000, t: 0.04, vol: 0.12, lowpass: 5000 },
  ],
  eliteDie: [
    { wave: 'sine', f0: 200, f1: 900, t: 0.12, vol: 0.5 },
    { wave: 'noise', f0: 9000, t: 0.5, vol: 0.5, lowpass: [3000, 200] },
    { wave: 'sine', f0: 110, f1: 40, t: 0.4, vol: 0.6 },
  ],
  claw: [
    { wave: 'noise', f0: 22000, t: 0.13, vol: 0.45, lowpass: [2500, 9000], highpass: 1200, a: 0.02 },
    { wave: 'noise', f0: 22000, t: 0.1, vol: 0.3, lowpass: [3000, 9000], highpass: 1500, a: 0.02, delay: 0.05 },
  ],
  yarn: [{ wave: 'sine', f0: 280, f1: 520, t: 0.14, vol: 0.45, vib: 0.05, vibRate: 25 }],
  bounce: [{ wave: 'triangle', f0: 480, f1: 760, t: 0.06, vol: 0.4 }],
  laser: [{ wave: 'pulse', duty: 0.25, f0: 2000, f1: 320, t: 0.13, vol: 0.3, lowpass: 7000, dutyTo: 0.08 }],
  orbital: [
    { wave: 'saw', f0: 120, f1: 640, t: 0.45, vol: 0.3, lowpass: [500, 5000], a: 0.05, shape: 0.6 },
    { wave: 'pulse', duty: 0.5, f0: 1280, t: 0.9, vol: 0.12, delay: 0.35, vib: 0.02, vibRate: 30 },
    { wave: 'noise', f0: 20000, t: 1, vol: 0.15, highpass: 2000, delay: 0.3 },
  ],
  throw: [{ wave: 'noise', f0: 20000, t: 0.13, vol: 0.4, lowpass: [1500, 7000], highpass: 800, a: 0.03 }],
  splash: [
    { wave: 'noise', f0: 12000, t: 0.28, vol: 0.45, lowpass: [5000, 700] },
    { wave: 'sine', f0: 700, f1: 1400, t: 0.05, vol: 0.25, delay: 0.05 },
    { wave: 'sine', f0: 900, f1: 1700, t: 0.05, vol: 0.2, delay: 0.12 },
  ],
  thunder: [
    { wave: 'white', f0: 1, t: 0.06, vol: 0.7, highpass: 1500 },
    { wave: 'noise', f0: 1800, t: 0.55, vol: 0.6, lowpass: [2500, 300], delay: 0.02 },
    { wave: 'sine', f0: 90, f1: 40, t: 0.4, vol: 0.5 },
  ],
  orbs: [
    { wave: 'sine', f0: n('A5'), t: 0.35, vol: 0.25, vib: 0.02, vibRate: 12, a: 0.02 },
    { wave: 'sine', f0: n('E6'), t: 0.35, vol: 0.18, vib: 0.02, vibRate: 12, a: 0.02, delay: 0.04 },
  ],
  crane: [
    { wave: 'noise', f0: 16000, t: 0.04, vol: 0.3, highpass: 2000 },
    { wave: 'noise', f0: 16000, t: 0.04, vol: 0.25, highpass: 2000, delay: 0.06 },
  ],
  shuriken: [
    { wave: 'noise', f0: 26000, t: 0.09, vol: 0.35, highpass: 3500 },
    { wave: 'pulse', duty: 0.125, f0: 2600, f1: 2000, t: 0.04, vol: 0.12 },
  ],
  pew: [{ wave: 'pulse', duty: 0.25, f0: 1400, f1: 600, t: 0.06, vol: 0.28, lowpass: 6000 }],
  missile: [
    { wave: 'noise', f0: 9000, t: 0.25, vol: 0.35, lowpass: [1200, 5000], a: 0.04 },
    { wave: 'saw', f0: 200, f1: 400, t: 0.2, vol: 0.12, lowpass: 1500 },
  ],
  rocket: [
    { wave: 'sine', f0: 700, f1: 1900, t: 0.35, vol: 0.25, a: 0.02 },
    { wave: 'noise', f0: 15000, t: 0.35, vol: 0.2, highpass: 3000, a: 0.03 },
  ],
  boom: [
    { wave: 'noise', f0: 8000, t: 0.38, vol: 0.6, lowpass: [3000, 180] },
    { wave: 'sine', f0: 130, f1: 40, t: 0.3, vol: 0.7 },
  ],
  frost: [
    { wave: 'noise', f0: 26000, t: 0.32, vol: 0.35, highpass: 2500, lowpass: 9000, a: 0.03 },
    { wave: 'sine', f0: 2800, f1: 3600, t: 0.25, vol: 0.12, vib: 0.03, vibRate: 25 },
  ],
  nova: [
    { wave: 'noise', f0: 26000, t: 0.6, vol: 0.4, highpass: 2000, a: 0.01 },
    { wave: 'sine', f0: 1800, f1: 3800, t: 0.5, vol: 0.2, vib: 0.03, vibRate: 30 },
    { wave: 'sine', f0: 150, f1: 60, t: 0.3, vol: 0.4 },
  ],
  ghost: [{ wave: 'sine', pitch: [[0, 380], [0.15, 620], [0.35, 340]], t: 0.35, vol: 0.3, vib: 0.03, vibRate: 7, a: 0.05, lowpass: 2000, shape: 1 }],
  chestShake: [
    { wave: 'noise', f0: 5000, t: 0.06, vol: 0.4, lowpass: 2500 },
    { wave: 'noise', f0: 5000, t: 0.06, vol: 0.4, lowpass: 2500, delay: 0.13 },
    { wave: 'noise', f0: 5000, t: 0.06, vol: 0.4, lowpass: 2500, delay: 0.26 },
    { wave: 'noise', f0: 5000, t: 0.06, vol: 0.4, lowpass: 2500, delay: 0.39 },
    { wave: 'noise', f0: 5000, t: 0.06, vol: 0.4, lowpass: 2500, delay: 0.52 },
  ],
  chestOpen: [
    { wave: 'noise', f0: 9000, t: 0.2, vol: 0.35, lowpass: [2000, 6000] },
    { wave: 'pulse', duty: 0.25, f0: n('C5'), t: 0.1, vol: 0.28, delay: 0.1 },
    { wave: 'pulse', duty: 0.25, f0: n('G5'), t: 0.1, vol: 0.28, delay: 0.18 },
    { wave: 'pulse', duty: 0.25, f0: n('C6'), t: 0.1, vol: 0.28, delay: 0.26 },
    { wave: 'pulse', duty: 0.25, f0: n('E6'), t: 0.45, vol: 0.28, delay: 0.34, vib: 0.012, vibRate: 7 },
    { wave: 'noise', f0: 26000, t: 0.7, vol: 0.12, highpass: 7000, delay: 0.2 },
  ],
  chestItem: [{ wave: 'triangle', f0: n('G6'), t: 0.25, vol: 0.4, vib: 0.01, vibRate: 8 }],
  evolve: [
    { wave: 'pulse', duty: 0.25, f0: n('C5'), t: 0.1, vol: 0.26 },
    { wave: 'pulse', duty: 0.25, f0: n('E5'), t: 0.1, vol: 0.26, delay: 0.08 },
    { wave: 'pulse', duty: 0.25, f0: n('G5'), t: 0.1, vol: 0.26, delay: 0.16 },
    { wave: 'pulse', duty: 0.25, f0: n('C6'), t: 0.1, vol: 0.26, delay: 0.24 },
    { wave: 'pulse', duty: 0.25, f0: n('E6'), t: 0.1, vol: 0.26, delay: 0.32 },
    { wave: 'pulse', duty: 0.25, f0: n('G6'), t: 0.6, vol: 0.26, delay: 0.4, vib: 0.015, vibRate: 7 },
    { wave: 'saw', f0: 100, f1: 800, t: 0.5, vol: 0.15, lowpass: [400, 6000] },
    { wave: 'noise', f0: 26000, t: 1, vol: 0.12, highpass: 6000, delay: 0.3 },
  ],
  warning: [
    { wave: 'pulse', duty: 0.5, f0: 880, t: 0.12, vol: 0.28, lowpass: 4000 },
    { wave: 'pulse', duty: 0.5, f0: 660, t: 0.12, vol: 0.28, lowpass: 4000, delay: 0.15 },
    { wave: 'pulse', duty: 0.5, f0: 880, t: 0.12, vol: 0.28, lowpass: 4000, delay: 0.3 },
    { wave: 'pulse', duty: 0.5, f0: 660, t: 0.18, vol: 0.28, lowpass: 4000, delay: 0.45 },
  ],
  bossRoar: [
    { wave: 'saw', f0: 95, f1: 65, t: 1, vol: 0.5, lowpass: [900, 300], vib: 0.06, vibRate: 22, a: 0.08, shape: 1.2 },
    { wave: 'noise', f0: 3000, t: 0.9, vol: 0.35, lowpass: [1200, 400], a: 0.1 },
    { wave: 'pulse', duty: 0.25, f0: 190, f1: 130, t: 0.9, vol: 0.15, lowpass: 900, vib: 0.05, vibRate: 18, a: 0.08 },
  ],
  bossDie: [
    { wave: 'noise', f0: 9000, t: 1.6, vol: 0.8, lowpass: [4000, 100], shape: 1.3 },
    { wave: 'sine', f0: 200, f1: 30, t: 1.2, vol: 0.7 },
    { wave: 'pulse', duty: 0.5, f0: 600, f1: 80, t: 1.0, vol: 0.2, lowpass: 2000, delay: 0.1 },
  ],
  bossShoot: [
    { wave: 'sine', f0: 220, f1: 90, t: 0.15, vol: 0.5 },
    { wave: 'noise', f0: 10000, t: 0.15, vol: 0.25, lowpass: [3000, 800] },
  ],
  bossCast: [
    { wave: 'saw', f0: 200, f1: 820, t: 0.4, vol: 0.25, lowpass: [600, 5000], a: 0.05 },
    { wave: 'sine', f0: 400, f1: 1600, t: 0.4, vol: 0.15, vib: 0.03, vibRate: 15 },
  ],
  bossLand: [
    { wave: 'sine', f0: 100, f1: 38, t: 0.35, vol: 0.85 },
    { wave: 'noise', f0: 4000, t: 0.3, vol: 0.45, lowpass: [1500, 200] },
  ],
  summon: [
    { wave: 'triangle', f0: 200, f1: 420, t: 0.55, vol: 0.35, vib: 0.05, vibRate: 9, a: 0.1 },
    { wave: 'noise', f0: 6000, t: 0.5, vol: 0.15, lowpass: 2000, a: 0.1 },
  ],
  teleport: [
    { wave: 'sine', f0: 1600, f1: 300, t: 0.15, vol: 0.3 },
    { wave: 'sine', f0: 300, f1: 1600, t: 0.15, vol: 0.3, delay: 0.15 },
  ],
};

const jingleInstruments = {
  lead: { wave: 'pulse', duty: 0.25, attack: 0.005, decay: 0.12, sustain: 0.6, release: 0.15, volume: 0.3, vibrato: { depth: 0.2, rate: 6, delay: 0.15 }, echo: 0.2 },
  harmony: { wave: 'pulse', duty: 0.125, attack: 0.005, decay: 0.12, sustain: 0.5, release: 0.15, volume: 0.16 },
  bass: { wave: 'nesTriangle', attack: 0.005, decay: 0.1, sustain: 0.8, release: 0.1, volume: 0.45 },
  drums: { volume: 0.35 },
};

export const jingles = {
  zoneClear: {
    bpm: 150, instruments: jingleInstruments,
    patterns: { A: {
      lead: 'C5 E5 G5 C6 . . G5 . C6 . . . . . . .',
      harmony: 'E4 G4 C5 E5 . . E5 . E5 . . . . . . .',
      bass: 'C3 . . . . . G2 . C3 . . . . . . .',
      drums: 'k . . . s . k . c . . . . . . .',
    } },
    order: ['A'],
  },
  victory: {
    bpm: 132, instruments: jingleInstruments,
    patterns: {
      A: {
        lead: 'G4 . C5 . E5 . G5 . . . E5 . G5 . . . A5 . . . F5 . A5 . C6 . . . . . . .',
        harmony: 'E4 . E4 . G4 . C5 . . . C5 . C5 . . . F4 . . . C5 . C5 . F5 . . . . . . .',
        bass: 'C3 . . . G2 . . . C3 . . . G2 . . . F2 . . . C3 . . . F2 . . . . . . .',
        drums: 'k . h . s . h . k . h . s . h . k . h . s . h . k . s . c . . .',
      },
      B: {
        lead: 'G5 . . . A5 . B5 . C6 . . . D6 . . . E6 . . . . . . . . . . . . . . .',
        harmony: 'D5 . . . F5 . G5 . G5 . . . B5 . . . C6 . . . . . . . . . . . . . . .',
        bass: 'G2 . . . G2 . . . G2 . . . G2 . . . C3 . . . . . . . . . . . . . . .',
        drums: 'k . s . k . s . k k s . s s s s c . . . . . . . . . . . . . . .',
      },
    },
    order: ['A', 'B'],
  },
  defeat: {
    bpm: 84, instruments: jingleInstruments,
    patterns: { A: {
      lead: 'E5 . D5 . C5 . . . B4 . . . A4 . . . G#4 . . . . . . . . . . . . . . .',
      harmony: 'C5 . B4 . A4 . . . G4 . . . E4 . . . E4 . . . . . . . . . . . . . . .',
      bass: 'A2 . . . . . . . E2 . . . . . . . E2 . . . . . . . . . . . . . . .',
    } },
    order: ['A'],
  },
};

// FUNCTIONS
function pitchAt(layer, t) {
  if (layer.pitch) {
    const points = layer.pitch;
    if (t <= points[0][0]) return points[0][1];
    for (let i = 1; i < points.length; i++) {
      if (t <= points[i][0]) {
        const [t0, f0] = points[i - 1];
        const [t1, f1] = points[i];
        const k = (t - t0) / (t1 - t0);
        return f0 * Math.pow(f1 / f0, k);
      }
    }
    return points[points.length - 1][1];
  }
  const p = t / layer.t;
  if (layer.f1 === undefined) return layer.f0;
  return layer.f0 * Math.pow(layer.f1 / layer.f0, p);
}

function renderLayer(out, layer) {
  const start = Math.round((layer.delay || 0) * sampleRate);
  const count = Math.round(layer.t * sampleRate);
  const voice = new Voice(layer.wave, layer.duty ?? 0.5);
  const lowpass = layer.lowpass ? new OnePole(Array.isArray(layer.lowpass) ? layer.lowpass[0] : layer.lowpass, 'low') : null;
  const highpass = layer.highpass ? new OnePole(layer.highpass, 'high') : null;
  const attack = layer.a ?? 0.003;
  const shape = layer.shape ?? 1.6;
  for (let i = 0; i < count; i++) {
    const t = i / sampleRate;
    const p = t / layer.t;
    let freq = pitchAt(layer, t);
    if (layer.vib) freq *= 1 + layer.vib * Math.sin(2 * Math.PI * (layer.vibRate || 6) * t);
    const duty = layer.dutyTo !== undefined ? (layer.duty ?? 0.5) + (layer.dutyTo - (layer.duty ?? 0.5)) * p : layer.duty ?? 0.5;
    let amp = t < attack ? t / attack : Math.pow(Math.max(0, 1 - (t - attack) / Math.max(0.0001, layer.t - attack)), shape);
    let value = voice.sample(freq, duty);
    if (lowpass) {
      if (Array.isArray(layer.lowpass)) lowpass.setCutoff(layer.lowpass[0] * Math.pow(layer.lowpass[1] / layer.lowpass[0], p));
      value = lowpass.process(value);
    }
    if (highpass) value = highpass.process(value);
    const index = start + i;
    if (index < out.length) out[index] += value * amp * (layer.vol ?? 0.5);
  }
}

export function renderSound(layers) {
  let end = 0;
  for (const layer of layers) end = Math.max(end, (layer.delay || 0) + layer.t);
  const out = new Float32Array(Math.ceil((end + 0.02) * sampleRate));
  for (const layer of layers) renderLayer(out, layer);
  for (let i = 0; i < out.length; i++) out[i] = softClip(out[i]);
  return normalize(out, 0.9);
}

export function renderJingle(song) {
  return normalize(renderSong({ stepsPerBeat: 4, ...song }, { loop: false }), 0.9);
}
