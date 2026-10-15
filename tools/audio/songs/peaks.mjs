// VARIABLES
const k8c = 'kc . h . S . h . k . h k S . h .';
const k8 = 'k . h . S . h . k . h . S . h .';
const k8f = 'k . h . S . h . k . h . s s s s';
const k8k = 'k . h . S . h . k . h k S . h .';
const k8F = 'k . h . S . h . s . s . s s S S';
const k16c = 'kc h h h S h h h k h h k S h h h';
const k16 = 'k h h h S h h h k h h h S h h h';
const k16k = 'k h h h S h h k k h h h S h h h';
const k16f = 'k h h h S h h h k h h h s s s s';
const bC1 = 'c . . . . . . . h . h . h . h .';
const bC2 = 'k . . . . . h . k . . . . . h .';
const bC3 = 'k . h . s . h . k . s . s . s .';
const bC4 = 's . s . s . s . s s s s S S S S';

export default {
  name: 'peaks',
  bpm: 142,
  stepsPerBeat: 4,
  instruments: {
    lead: { wave: 'pulse', duty: 0.125, attack: 0.004, decay: 0.1, sustain: 0.55, release: 0.03, gate: 0.8, volume: 0.26, vibrato: { depth: 0.15, rate: 6, delay: 0.3 }, echo: 0.22, dutySweep: 0.12, lowpass: 5500 },
    bells: { wave: 'triangle', attack: 0.002, decay: 0.2, sustain: 0.3, release: 0.15, volume: 0.13, pluck: 4.5, echo: 0.2 },
    harmony: { wave: 'saw', attack: 0.12, decay: 0.3, sustain: 0.6, release: 0.3, volume: 0.1, lowpass: 2500 },
    bass: { wave: 'nesTriangle', attack: 0.004, decay: 0.08, sustain: 0.8, release: 0.025, volume: 0.41, gate: 0.8 },
    drums: { volume: 0.31 },
  },
  patterns: {
    A1: {
      lead: 'E5 . B5 . . . A5 B5 E6 . . . . . D6 . C6 . G5 . . . F#5 G5 C6 . . . . . B5 .',
      bells: 'E5 G5 B5 E6 G6 E6 B5 G5 E5 B5 G5 E6 B5 G6 E6 B5 C5 E5 G5 C6 E6 C6 G5 E5 C5 G5 E5 C6 G5 E6 C6 G5',
      harmony: 'G4 . . . . . . . . . . . . . . . G4 . . . . . . . . . . . . . . .',
      bass: 'E2 . E2 . E3 . E2 . E2 . E2 . E3 . E2 . C3 . C3 . C4 . C3 . C3 . C3 . C3 . D3 .',
      drums: k8c + ' ' + k8,
    },
    A2: {
      lead: 'D6 . G5 . . . F#5 G5 B5 . . . . . A5 . A5 . D6 . . . C6 D6 F#6 . . . . . E6 .',
      bells: 'G5 B5 D6 G6 B6 G6 D6 B5 G5 D6 B5 G6 D6 B6 G6 D6 D5 F#5 A5 D6 F#6 D6 A5 F#5 D5 A5 F#5 D6 A5 F#6 D6 A5',
      harmony: 'B4 . . . . . . . . . . . . . . . A4 . . . . . . . . . . . . . . .',
      bass: 'G2 . G2 . G3 . G2 . G2 . G2 . G3 . G2 . D3 . D3 . D4 . D3 . D3 . D3 . D3 . B2 .',
      drums: k8 + ' ' + k8f,
    },
    A3: {
      lead: 'E5 F#5 G5 A5 B5 C6 D6 - E6 . . . D6 . B5 . C6 . . . G5 . E5 . G5 . . . C6 . . .',
      bells: 'E5 G5 B5 E6 G6 E6 B5 G5 E5 B5 G5 E6 B5 G6 E6 B5 C5 E5 G5 C6 E6 C6 G5 E5 C5 G5 E5 C6 G5 E6 C6 G5',
      harmony: 'G4 . . . . . . . . . . . . . . . G4 . . . . . . . . . . . . . . .',
      bass: 'E2 . E2 . E3 . E2 . E2 . E2 . E3 . E2 . C3 . C3 . C4 . C3 . C3 . C3 . C3 . A2 .',
      drums: k8 + ' ' + k8k,
    },
    A4: {
      lead: 'A5 . C6 . E6 . . . D6 . . . C6 . B5 . B5 . . . A5 . F#5 . B5 . . . . . - -',
      bells: 'A4 C5 E5 A5 C6 A5 E5 C5 A4 E5 C5 A5 E5 C6 A5 E5 B4 D5 F#5 B5 D6 B5 F#5 D5 B4 F#5 D5 B5 F#5 D6 B5 F#5',
      harmony: 'A4 . . . . . . . . . . . . . . . B4 . . . . . . . . . . . . . . .',
      bass: 'A2 . A2 . A3 . A2 . A2 . A2 . A3 . A2 . B2 . B2 . B3 . B2 . B2 . B2 . F#2 . B2 .',
      drums: k8 + ' ' + k8F,
    },
    V1: {
      lead: 'E5 . B5 . . . A5 B5 E6 . . . . . D6 . C6 . E6 . . . D6 E6 G6 . . . . . E6 .',
      bells: 'E5 G5 B5 E6 G6 E6 B5 G5 B5 E6 G6 E6 B5 G5 E5 G5 C5 G5 E5 C6 G5 E6 C6 G5 E6 C6 G5 C6 E5 G5 C5 E5',
      harmony: 'B4 . . . . . . . G4 . . . . . . . G4 . . . . . . . E4 . . . . . . .',
      bass: 'E2 . E2 . E3 . E2 . E2 . E2 . E3 . E2 . C3 . C3 . C4 . C3 . C3 . C3 . C3 . D3 .',
      drums: k16c + ' ' + k16,
    },
    V2: {
      lead: 'B5 . D6 . . . C6 D6 G6 . . . F#6 . E6 . D6 . . . A5 . F#5 . A5 . . . D6 . . .',
      bells: 'G5 B5 D6 G6 B6 G6 D6 B5 D6 G6 B6 G6 D6 B5 G5 B5 D5 A5 F#5 D6 A5 F#6 D6 A5 F#6 D6 A5 D6 F#5 A5 D5 F#5',
      harmony: 'D5 . . . . . . . B4 . . . . . . . A4 . . . . . . . F#4 . . . . . . .',
      bass: 'G2 . G2 . G3 . G2 . G2 . G2 . G3 . G2 . D3 . D3 . D4 . D3 . D3 . D3 . D3 . B2 .',
      drums: k16k + ' ' + k16f,
    },
    V3: {
      lead: 'E6 D6 C6 B5 A5 G5 F#5 - E5 . . . G5 . B5 . D5 . F#5 . A5 . D6 . F#6 . . . E6 . D6 .',
      bells: 'G6 E6 B5 E6 G5 B5 E5 G5 B5 E6 G6 E6 B5 G5 E5 G5 D5 F#5 A5 D6 F#6 D6 A5 F#5 D5 A5 F#5 D6 A5 F#6 D6 A5',
      harmony: 'G4 . . . . . . . B4 . . . . . . . A4 . . . . . . . F#4 . . . . . . .',
      bass: 'E2 . E2 . E3 . E2 . E2 . E2 . E3 . E2 . D3 . D3 . D4 . D3 . D3 . D3 . D3 . C3 .',
      drums: k16 + ' ' + k16k,
    },
    V4: {
      lead: 'C6 . B5 . A5 . G5 . E5 . . . G5 . . . B5 . . . A5 . F#5 . B5 . . . . . - -',
      bells: 'C5 G5 E5 C6 G5 E6 C6 G5 E6 C6 G5 C6 E5 G5 C5 E5 B4 D5 F#5 B5 D6 B5 F#5 D5 B4 F#5 D5 B5 F#5 D6 B5 F#5',
      harmony: 'G4 . . . . . . . E5 . . . . . . . F#5 . . . . . . . B4 . . . . . . .',
      bass: 'C3 . C3 . C4 . C3 . C3 . C3 . C4 . C3 . B2 . B2 . B3 . B2 . B2 . B2 . F#2 . B2 .',
      drums: k16 + ' ' + k16f,
    },
    B1: {
      lead: 'E6 . E6 . D6 . C6 . E6 . D6 . C6 . . . D6 . D6 . C6 . B5 . D6 . C6 . B5 . . .',
      bells: 'C5 G5 E5 C6 G5 E6 C6 G5 C5 E5 G5 C6 E6 C6 G5 E5 G5 D6 B5 G6 D6 B6 G6 D6 G5 B5 D6 G6 B6 G6 D6 B5',
      harmony: 'E4 . . . . . . . G4 . . . . . . . D4 . . . . . . . G4 . . . . . . .',
      bass: 'C3 . C3 . C4 . C3 . C3 . C3 . C4 . C3 . G2 . G2 . G3 . G2 . G2 . G2 . G3 . G2 .',
      drums: k16c + ' ' + k16,
    },
    B2: {
      lead: 'A5 . A5 . B5 . A5 . F#5 . A5 . D6 . . . E6 . E6 . D6 . B5 . G5 . B5 . E6 . . .',
      bells: 'D5 A5 F#5 D6 A5 F#6 D6 A5 D5 F#5 A5 D6 F#6 D6 A5 F#5 E5 B5 G5 E6 B5 G6 E6 B5 E5 G5 B5 E6 G6 E6 B5 G5',
      harmony: 'F#4 . . . . . . . A4 . . . . . . . G4 . . . . . . . B4 . . . . . . .',
      bass: 'D3 . D3 . D4 . D3 . D3 . D3 . D4 . D3 . E2 . E2 . E3 . E2 . E2 . E2 . G2 . B2 .',
      drums: k16k + ' ' + k16f,
    },
    B3: {
      lead: 'E6 . G6 . E6 . C6 . D6 . E6 . G6 . . . D6 . B5 . G5 . B5 . D6 . . . G6 . . .',
      bells: 'C5 E5 G5 C6 E6 C6 G5 E5 E6 C6 G5 C6 E5 G5 C5 E5 G5 B5 D6 G6 B6 G6 D6 B5 B6 G6 D6 G6 B5 D6 G5 B5',
      harmony: 'G4 . . . . . . . E4 . . . . . . . D5 . . . . . . . B4 . . . . . . .',
      bass: 'C3 . C3 . C4 . C3 . C3 . C3 . C4 . C3 . G2 . G2 . G3 . G2 . G2 . G2 . G3 . G2 .',
      drums: k16 + ' ' + k16k,
    },
    B4: {
      lead: 'E6 . C6 . A5 . C6 . E6 . . . D6 . C6 . B5 . . . A5 . F#5 . B5 . . . D6 . F#6 .',
      bells: 'A4 C5 E5 A5 C6 A5 E5 C5 C6 A5 E5 A5 C5 E5 A4 C5 B4 D5 F#5 B5 D6 B5 F#5 D5 D6 B5 F#5 B5 D5 F#5 B4 D5',
      harmony: 'C5 . . . . . . . E5 . . . . . . . D5 . . . . . . . F#5 . . . . . . .',
      bass: 'A2 . A2 . A3 . A2 . A2 . A2 . A3 . A2 . B2 . B2 . B3 . B2 . B2 . B2 . F#2 . B2 .',
      drums: k16 + ' ' + k16f,
    },
    C1: {
      lead: 'B5 . . . . . . . . . . . . . . . G5 . . . . . . . B5 . . . . . . .',
      bells: 'B5 E6 G6 E6 B5 G5 E5 G5 B5 E6 G6 E6 B5 G5 E5 G5 E5 G5 B5 E6 G6 E6 B5 G5 B5 E6 G6 E6 B5 G5 E5 G5',
      harmony: 'E4 . . . . . . . . . . . . . . . E4 . . . . . . . . . . . . . . .',
      bass: 'E2 . . . E2 . . . E2 . . . E2 . . . E2 . . . E2 . . . E2 . . . E2 . . .',
      drums: bC1 + ' ' + bC2,
    },
    C2: {
      lead: 'E6 . . . . . . . D6 . . . . . . . F#6 . . . . . . . A5 . . . B5 . . .',
      bells: 'C5 E5 G5 C6 E6 C6 G5 E5 G5 C6 E6 C6 G5 E5 C5 E5 D5 F#5 A5 D6 F#6 D6 A5 F#5 A5 D6 F#6 D6 A5 F#5 D5 F#5',
      harmony: 'G4 . . . . . . . . . . . . . . . A4 . . . . . . . . . . . . . . .',
      bass: 'C3 . . . C3 . . . C3 . . . C3 . . . D3 . . . D3 . . . D3 . D3 . A2 . . .',
      drums: bC3 + ' ' + bC4,
    },
    D1: {
      lead: 'E5 E5 B5 . . . A5 B5 E6 . . . . . D6 . C6 C6 G5 . . . F#5 G5 C6 . . . . . B5 .',
      bells: 'E5 G5 B5 E6 G6 E6 B5 G5 E5 B5 G5 E6 B5 G6 E6 B5 C5 E5 G5 C6 E6 C6 G5 E5 C5 G5 E5 C6 G5 E6 C6 G5',
      harmony: 'G4 . . . . . . . . . . . . . . . G4 . . . . . . . . . . . . . . .',
      bass: 'E2 . E2 . E3 . E2 . E2 . E2 . E3 . E2 . C3 . C3 . C4 . C3 . C3 . C3 . C3 . D3 .',
      drums: k16c + ' ' + k16,
    },
    D2: {
      lead: 'D6 D6 G5 . . . F#5 G5 B5 . . . . . A5 . A5 A5 D6 . . . C6 D6 F#6 . . . . . E6 .',
      bells: 'G5 B5 D6 G6 B6 G6 D6 B5 G5 D6 B5 G6 D6 B6 G6 D6 D5 F#5 A5 D6 F#6 D6 A5 F#5 D5 A5 F#5 D6 A5 F#6 D6 A5',
      harmony: 'B4 . . . . . . . . . . . . . . . A4 . . . . . . . . . . . . . . .',
      bass: 'G2 . G2 . G3 . G2 . G2 . G2 . G3 . G2 . D3 . D3 . D4 . D3 . D3 . D3 . D3 . B2 .',
      drums: k16k + ' ' + k16f,
    },
    D3: {
      lead: 'E6 E6 G6 . E6 . C6 . D6 . E6 . G6 . . . D6 D6 B5 . G5 . B5 . D6 . . . G6 . . .',
      bells: 'C5 E5 G5 C6 E6 C6 G5 E5 E6 C6 G5 C6 E5 G5 C5 E5 G5 B5 D6 G6 B6 G6 D6 B5 B6 G6 D6 G6 B5 D6 G5 B5',
      harmony: 'G4 . . . . . . . E4 . . . . . . . D5 . . . . . . . B4 . . . . . . .',
      bass: 'C3 . C3 . C4 . C3 . C3 . C3 . C4 . C3 . G2 . G2 . G3 . G2 . G2 . G2 . G3 . G2 .',
      drums: k16 + ' ' + k16k,
    },
    D4: {
      lead: 'E6 . C6 . A5 . C6 . E6 . . . D6 . C6 . B5 . . . A5 . F#5 . B5 . . . . . - -',
      bells: 'A4 C5 E5 A5 C6 A5 E5 C5 C6 A5 E5 A5 C5 E5 A4 C5 B4 D5 F#5 B5 D6 B5 F#5 D5 D6 B5 F#5 B5 D5 F#5 B4 D5',
      harmony: 'C5 . . . . . . . E5 . . . . . . . D5 . . . . . . . F#5 . . . . . . .',
      bass: 'A2 . A2 . A3 . A2 . A2 . A2 . A3 . A2 . B2 . B2 . B3 . B2 . B2 . B2 . F#2 . B2 .',
      drums: k16 + ' ' + k8F,
    },
  },
  order: [
    'A1', 'A2', 'A3', 'A4', 'V1', 'V2', 'V3', 'V4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'D1', 'D2',
    'D3', 'D4',
  ],
};
