import { sampleRate, Voice, OnePole, envelope, noteFreq, parseChord, softClip } from './synth.mjs';

// VARIABLES
const drumKit = {
  k: { kind: 'kick', vol: 1 },
  K: { kind: 'kick', vol: 1.25 },
  s: { kind: 'snare', vol: 0.8 },
  S: { kind: 'snare', vol: 1.05 },
  x: { kind: 'clap', vol: 0.7 },
  h: { kind: 'hat', vol: 0.35 },
  H: { kind: 'hat', vol: 0.55 },
  o: { kind: 'openhat', vol: 0.4 },
  c: { kind: 'crash', vol: 0.55 },
  t: { kind: 'tom', vol: 0.7, pitch: 110 },
  T: { kind: 'tom', vol: 0.7, pitch: 165 },
  b: { kind: 'shaker', vol: 0.3 },
};

// FUNCTIONS
function tokens(line) {
  return line.trim().split(/\s+/).filter(Boolean);
}

export function validateSong(song) {
  const problems = [];
  for (const name of song.order) if (!song.patterns[name]) problems.push(`order references missing pattern ${name}`);
  for (const [name, pattern] of Object.entries(song.patterns)) {
    let steps = null;
    for (const [channel, line] of Object.entries(pattern)) {
      if (!song.instruments[channel] && channel !== 'drums') problems.push(`pattern ${name} uses unknown channel ${channel}`);
      const count = tokens(line).length;
      if (steps === null) steps = count;
      else if (count !== steps) problems.push(`pattern ${name} channel ${channel} has ${count} steps, expected ${steps}`);
      for (const token of tokens(line)) {
        if (token === '.' || token === '-') continue;
        if (channel === 'drums') {
          for (const char of token) if (!drumKit[char] && char !== '+') problems.push(`pattern ${name} unknown drum '${char}'`);
          continue;
        }
        const instrument = song.instruments[channel] || {};
        if (instrument.arp) {
          if (!parseChord(token)) problems.push(`pattern ${name} channel ${channel} bad chord ${token}`);
        } else {
          try {
            noteFreq(token);
          } catch (error) {
            problems.push(`pattern ${name} channel ${channel} bad note ${token}`);
          }
        }
      }
    }
  }
  return problems;
}

function collectEvents(song) {
  const stepTime = 60 / song.bpm / (song.stepsPerBeat || 4);
  const swing = song.swing || 0;
  const channels = {};
  let stepOffset = 0;
  for (const patternName of song.order) {
    const pattern = song.patterns[patternName];
    let patternSteps = 0;
    for (const [channel, line] of Object.entries(pattern)) {
      const list = tokens(line);
      patternSteps = Math.max(patternSteps, list.length);
      if (!channels[channel]) channels[channel] = [];
      const events = channels[channel];
      list.forEach((token, index) => {
        const step = stepOffset + index;
        const time = step * stepTime + (step % 2 === 1 ? swing * stepTime : 0);
        if (token === '.') {
          const last = events[events.length - 1];
          if (last && last.open) last.steps++;
          return;
        }
        const last = events[events.length - 1];
        if (last) last.open = false;
        if (token === '-') return;
        events.push({ token, time, steps: 1, open: channel !== 'drums' });
      });
    }
    stepOffset += patternSteps;
  }
  for (const events of Object.values(channels)) {
    for (const event of events) {
      event.duration = event.steps * stepTime;
      event.legatoNext = false;
    }
    for (let i = 0; i < events.length - 1; i++) {
      const a = events[i];
      const b = events[i + 1];
      if (Math.abs(a.time + a.duration - b.time) < 1e-6) a.legatoNext = true;
    }
  }
  return { channels, totalTime: stepOffset * stepTime, stepTime };
}

function renderDrum(out, offset, hit, vol, rng) {
  const voice = new Voice('noise');
  const lp = new OnePole(8000, 'low');
  const hp = new OnePole(200, 'high');
  const add = (i, v) => {
    if (offset + i < out.length) out[offset + i] += v * vol;
  };
  switch (hit.kind) {
    case 'kick': {
      const n = Math.round(0.28 * sampleRate);
      let phase = 0;
      for (let i = 0; i < n; i++) {
        const t = i / sampleRate;
        const f = 50 + 120 * Math.exp(-t * 28);
        phase += f / sampleRate;
        const amp = Math.exp(-t * 9) * (t < 0.002 ? t / 0.002 : 1);
        const click = i < 40 ? (rng() * 2 - 1) * 0.25 * (1 - i / 40) : 0;
        add(i, (Math.sin(phase * Math.PI * 2) * 0.95 + click) * amp * hit.vol);
      }
      break;
    }
    case 'snare': {
      const n = Math.round(0.2 * sampleRate);
      let phase = 0;
      lp.setCutoff(7000);
      hp.setCutoff(900);
      for (let i = 0; i < n; i++) {
        const t = i / sampleRate;
        phase += (190 - 60 * t) / sampleRate;
        const tone = Math.sin(phase * Math.PI * 2) * Math.exp(-t * 30) * 0.5;
        const noise = hp.process(lp.process(voice.sample(14000))) * Math.exp(-t * 16) * 0.8;
        add(i, (tone + noise) * hit.vol * 0.75);
      }
      break;
    }
    case 'clap': {
      const n = Math.round(0.18 * sampleRate);
      lp.setCutoff(5000);
      hp.setCutoff(1200);
      for (let i = 0; i < n; i++) {
        const t = i / sampleRate;
        const bursts = t < 0.03 ? (Math.floor(t / 0.01) % 2 === 0 ? 1 : 0.3) : 1;
        const noise = hp.process(lp.process(rng() * 2 - 1));
        add(i, noise * Math.exp(-t * 22) * bursts * hit.vol * 0.8);
      }
      break;
    }
    case 'hat':
    case 'openhat':
    case 'shaker': {
      const length = hit.kind === 'openhat' ? 0.22 : hit.kind === 'shaker' ? 0.07 : 0.045;
      const n = Math.round(length * sampleRate);
      hp.setCutoff(hit.kind === 'shaker' ? 4000 : 7000);
      for (let i = 0; i < n; i++) {
        const t = i / sampleRate;
        const decay = hit.kind === 'openhat' ? Math.exp(-t * 14) : Math.exp(-t * (hit.kind === 'shaker' ? 45 : 90));
        add(i, hp.process(voice.sample(30000)) * decay * hit.vol * 0.6);
      }
      break;
    }
    case 'crash': {
      const n = Math.round(1.1 * sampleRate);
      hp.setCutoff(3500);
      for (let i = 0; i < n; i++) {
        const t = i / sampleRate;
        add(i, hp.process(rng() * 2 - 1) * Math.exp(-t * 3.2) * hit.vol * 0.45);
      }
      break;
    }
    case 'tom': {
      const n = Math.round(0.25 * sampleRate);
      let phase = 0;
      for (let i = 0; i < n; i++) {
        const t = i / sampleRate;
        phase += (hit.pitch * (1 + 0.6 * Math.exp(-t * 20))) / sampleRate;
        add(i, Math.sin(phase * Math.PI * 2) * Math.exp(-t * 11) * hit.vol);
      }
      break;
    }
    default:
      break;
  }
}

function renderChannel(buffer, events, instrument, totalTime) {
  const voice = new Voice(instrument.wave || 'pulse', instrument.duty || 0.5);
  const a = instrument.attack ?? 0.005;
  const d = instrument.decay ?? 0.1;
  const s = instrument.sustain ?? 0.6;
  const r = instrument.release ?? 0.06;
  const vol = instrument.volume ?? 0.3;
  const vibrato = instrument.vibrato;
  const slide = instrument.slide || 0;
  const arp = instrument.arp;
  const filter = instrument.lowpass ? new OnePole(instrument.lowpass, 'low') : null;
  const gate = instrument.gate ?? 1;
  let previousFreq = null;
  for (let index = 0; index < events.length; index++) {
    const event = events[index];
    const chord = arp ? parseChord(event.token) : null;
    const baseFreq = chord ? chord[0] : noteFreq(event.token);
    const transpose = Math.pow(2, (instrument.octave || 0));
    const length = event.duration * gate;
    const legato = slide > 0 && previousFreq !== null && index > 0 && events[index - 1].legatoNext;
    const start = Math.round(event.time * sampleRate);
    const tail = Math.round((length + r) * sampleRate);
    for (let i = 0; i < tail; i++) {
      const t = i / sampleRate;
      let freq = baseFreq;
      if (chord) {
        const step = Math.floor(t / (instrument.arpRate || 0.05)) % (instrument.arpNotes || chord.length);
        freq = chord[step % chord.length];
      }
      freq *= transpose;
      if (legato && t < slide) {
        const from = previousFreq;
        freq = from * Math.pow(freq / from, t / slide);
      }
      if (vibrato && t > (vibrato.delay || 0)) {
        const depth = vibrato.depth * Math.min(1, (t - (vibrato.delay || 0)) / 0.15);
        freq *= Math.pow(2, (depth * Math.sin(2 * Math.PI * vibrato.rate * t)) / 12);
      }
      let duty = instrument.duty || 0.5;
      if (instrument.dutySweep) duty = Math.max(0.05, Math.min(0.5, duty + instrument.dutySweep * t));
      let amp = legato ? envelope(t + a + d, length + a + d, a, d, s, r) : envelope(t, length, a, d, s, r);
      if (instrument.pluck) amp *= Math.exp(-t * instrument.pluck);
      let value = voice.sample(freq, duty) * amp * vol;
      if (filter) value = filter.process(value);
      const index2 = start + i;
      if (index2 < buffer.length) buffer[index2] += value;
    }
    previousFreq = baseFreq * transpose;
  }
}

function addEcho(buffer, delaySeconds, feedback, mix) {
  const delay = Math.round(delaySeconds * sampleRate);
  const wet = new Float32Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    const back = i - delay;
    const echoed = back >= 0 ? buffer[back] + wet[back] * feedback : 0;
    wet[i] = echoed;
  }
  for (let i = 0; i < buffer.length; i++) buffer[i] += wet[i] * mix;
}

export function renderSong(song, options = {}) {
  const { channels, totalTime, stepTime } = collectEvents(song);
  const loop = options.loop !== false;
  const tailTime = 2.5;
  const length = Math.round((totalTime + tailTime) * sampleRate);
  const master = new Float32Array(length);
  let seed = 12345;
  const rng = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (const [channel, events] of Object.entries(channels)) {
    const buffer = new Float32Array(length);
    if (channel === 'drums') {
      const drumVol = (song.instruments.drums && song.instruments.drums.volume) || 0.5;
      for (const event of events) {
        for (const char of event.token) {
          if (char === '+') continue;
          renderDrum(buffer, Math.round(event.time * sampleRate), drumKit[char], drumVol, rng);
        }
      }
    } else {
      const instrument = song.instruments[channel];
      renderChannel(buffer, events, instrument, totalTime);
      if (instrument.echo) addEcho(buffer, instrument.echoTime || stepTime * 3, instrument.echoFeedback || 0.35, instrument.echo);
    }
    for (let i = 0; i < length; i++) master[i] += buffer[i];
  }
  const total = Math.round(totalTime * sampleRate);
  let out;
  if (loop) {
    out = new Float32Array(total);
    for (let i = 0; i < length; i++) out[i % total] += master[i];
  } else {
    out = master;
  }
  const lowpass = new OnePole(song.masterLowpass || 11000, 'low');
  const warm = new OnePole(30, 'high');
  for (let pass = 0; pass < (loop ? 2 : 1); pass++) {
    for (let i = 0; i < out.length; i++) {
      const v = warm.process(lowpass.process(out[i]));
      if (pass === (loop ? 1 : 0)) out[i] = softClip(v * (song.masterGain || 1));
    }
  }
  return out;
}
