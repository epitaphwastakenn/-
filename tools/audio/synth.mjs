// VARIABLES
export const sampleRate = 32000;
const noteIndex = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const chordShapes = {
  maj: [0, 4, 7, 12], min: [0, 3, 7, 12], m: [0, 3, 7, 12], 7: [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], min7: [0, 3, 7, 10],
  sus2: [0, 2, 7, 12], sus4: [0, 5, 7, 12], dim: [0, 3, 6, 12], aug: [0, 4, 8, 12], add9: [0, 4, 7, 14], 5: [0, 7, 12, 19],
};

// FUNCTIONS
export function noteFreq(name) {
  const match = /^([A-G])([#b]?)(-?\d)$/.exec(name);
  if (!match) throw new Error('bad note ' + name);
  let semitone = noteIndex[match[1]];
  if (match[2] === '#') semitone++;
  if (match[2] === 'b') semitone--;
  const octave = Number(match[3]);
  const midi = (octave + 1) * 12 + semitone;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function parseChord(token) {
  const match = /^([A-G])([#b]?)(maj7|min7|maj|min|m7|m|7|sus2|sus4|dim|aug|add9|5)(\d?)$/.exec(token);
  if (!match) return null;
  const octave = match[4] ? match[4] : '4';
  const root = noteFreq(match[1] + match[2] + octave);
  return chordShapes[match[3]].map((s) => root * Math.pow(2, s / 12));
}

function polyBlep(t, dt) {
  if (t < dt) {
    const x = t / dt;
    return x + x - x * x - 1;
  }
  if (t > 1 - dt) {
    const x = (t - 1) / dt;
    return x * x + x + x + 1;
  }
  return 0;
}

export class Voice {
  constructor(wave, duty = 0.5) {
    this.wave = wave;
    this.duty = duty;
    this.phase = 0;
    this.lfsr = 1;
    this.noiseValue = 1;
    this.noiseTimer = 0;
    this.last = 0;
  }

  sample(freq, duty = this.duty) {
    const dt = Math.min(0.49, freq / sampleRate);
    let value = 0;
    const phase = this.phase;
    switch (this.wave) {
      case 'pulse': {
        value = phase < duty ? 1 : -1;
        value += polyBlep(phase, dt);
        let shifted = phase - duty;
        if (shifted < 0) shifted += 1;
        value -= polyBlep(shifted, dt);
        break;
      }
      case 'saw':
        value = 2 * phase - 1 - polyBlep(phase, dt);
        break;
      case 'triangle':
        value = phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase;
        break;
      case 'nesTriangle': {
        const raw = phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase;
        value = Math.round(raw * 7.5) / 7.5;
        break;
      }
      case 'sine':
        value = Math.sin(phase * Math.PI * 2);
        break;
      case 'noise': {
        this.noiseTimer += freq / sampleRate;
        while (this.noiseTimer >= 1) {
          this.noiseTimer -= 1;
          const bit = (this.lfsr ^ (this.lfsr >> 1)) & 1;
          this.lfsr = (this.lfsr >> 1) | (bit << 14);
          this.noiseValue = (this.lfsr & 1) ? 1 : -1;
        }
        value = this.noiseValue;
        break;
      }
      case 'white':
        value = Math.random() * 2 - 1;
        break;
      default:
        value = 0;
    }
    this.phase += dt;
    if (this.phase >= 1) this.phase -= 1;
    return value;
  }
}

export class OnePole {
  constructor(cutoff, type = 'low') {
    this.type = type;
    this.state = 0;
    this.setCutoff(cutoff);
  }

  setCutoff(cutoff) {
    const x = Math.exp((-2 * Math.PI * Math.min(cutoff, sampleRate * 0.45)) / sampleRate);
    this.a = 1 - x;
    this.b = x;
  }

  process(input) {
    this.state = this.a * input + this.b * this.state;
    return this.type === 'low' ? this.state : input - this.state;
  }
}

export function envelope(t, length, a, d, s, r) {
  if (t < 0) return 0;
  if (t < a) return t / a;
  if (t < length) {
    const td = t - a;
    if (td < d) return 1 - (1 - s) * (td / d);
    return s;
  }
  const level = length < a ? length / a : length - a < d ? 1 - (1 - s) * ((length - a) / d) : s;
  const tr = t - length;
  if (tr >= r) return 0;
  return level * (1 - tr / r);
}

export function softClip(x) {
  if (x > 1) return 1;
  if (x < -1) return -1;
  return x * (1.5 - 0.5 * x * x);
}

export function encodeWav(samples, rate = sampleRate) {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + samples.length * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(rate, 24);
  buffer.writeUInt32LE(rate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  return buffer;
}

export function normalize(samples, peak = 0.89) {
  let max = 0;
  for (let i = 0; i < samples.length; i++) max = Math.max(max, Math.abs(samples[i]));
  if (max <= 0) return samples;
  const gain = peak / max;
  for (let i = 0; i < samples.length; i++) samples[i] *= gain;
  return samples;
}
