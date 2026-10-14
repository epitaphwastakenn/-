// Boss fights (zones 1-4) - urgent C minor, 156 bpm, ostinato bass riff.
// Form: A (stutter-chant hook) / B (soaring chorus) / A' / B' (final chorus, ends on Bb (bVII)).

// VARIABLES
const o1c = 'kc . h h S . h . k . k h S . h h';
const o1 = 'k . h h S . h . k . k h S . h h';
const o2 = 'k . h k S . h . k k h . S . h S';
const oF = 'k . h h S . h . k . k h S S S S';
const p1c = 'kc . H . S . H . k . H k S . H .';
const p1 = 'k . H . S . H . k . H k S . H .';
const p2 = 'k H H k S H H . k k H . S H H S';
const oFF = 'k k h h S . S . t t T T S S S S';

export default {
  name: 'boss',
  bpm: 156,
  stepsPerBeat: 4,
  instruments: {
    lead: { wave: 'pulse', duty: 0.25, attack: 0.002, decay: 0.07, sustain: 0.6, release: 0.03, gate: 0.72, volume: 0.23, vibrato: { depth: 0.2, rate: 6.5, delay: 0.25 }, echo: 0.15 },
    harmony: { wave: 'pulse', duty: 0.125, attack: 0.002, decay: 0.05, sustain: 0.5, release: 0.02, gate: 0.7, volume: 0.1 },
    bass: { wave: 'nesTriangle', attack: 0.003, decay: 0.07, sustain: 0.85, release: 0.025, volume: 0.4, gate: 0.75 },
    arp: { wave: 'pulse', duty: 0.25, arp: true, arpRate: 0.0481, attack: 0.002, decay: 0.1, sustain: 0.4, release: 0.04, volume: 0.08, pluck: 3 },
    drums: { volume: 0.3 },
  },
  patterns: {
    // A  - stutter-chant hook over the riff, siren joins in the second half
    // Cm | Cm
    A1: {
      lead: 'G5 . G5 . G5 . C6 . Eb6 . . . C6 . G5 . G5 . G5 . G5 . Bb5 . C6 . . . Bb5 . G5 .',
      harmony: '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -',
      bass: 'C2 . C2 C3 C2 . Eb2 F2 G2 . G2 G3 F2 . Eb2 . C2 . C2 C3 C2 . Eb2 F2 G2 . G2 G3 Bb2 . C3 .',
      arp: '- - Cmin4 . - - Cmin4 . - - Cmin4 . - - Cmin4 . - - Cmin4 . - - Cmin4 . - - Cmin4 . - - Cmin4 .',
      drums: o1c + ' ' + o1,
    },
    // Ab | Bb
    A2: {
      lead: 'Eb5 . Eb5 . Eb5 . Ab5 . C6 . . . Ab5 . Eb5 . F5 . F5 . F5 . Bb5 . D6 . . . Bb5 . F5 .',
      harmony: '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -',
      bass: 'Ab2 . Ab2 Ab3 Ab2 . Ab2 Bb2 C3 . C3 C4 Bb2 . Ab2 . Bb2 . Bb2 Bb3 Bb2 . Bb2 C3 D3 . D3 D4 C3 . Bb2 .',
      arp: '- - Abmaj4 . - - Abmaj4 . - - Abmaj4 . - - Abmaj4 . - - Bbmaj4 . - - Bbmaj4 . - - Bbmaj4 . - - Bbmaj4 .',
      drums: o2 + ' ' + o1,
    },
    // Cm | Cm
    A3: {
      lead: 'C6 - C6 . Bb5 . G5 . Eb5 . G5 . C6 . . . Bb5 . G5 . Eb5 . G5 . Bb5 . . . C6 . . .',
      harmony: 'G5 C6 G5 C6 G5 C6 G5 C6 G5 C6 G5 C6 G5 C6 G5 C6 G5 C6 G5 C6 G5 C6 G5 C6 G5 C6 G5 C6 G5 C6 G5 C6',
      bass: 'C2 . C2 C3 C2 . Eb2 F2 G2 . G2 G3 F2 . Eb2 . C2 . C2 C3 C2 . Eb2 F2 G2 . G2 G3 Bb2 . C3 .',
      arp: '- - Cmin4 . - - Cmin4 . - - Cmin4 . - - Cmin4 . - - Cmin4 . - - Cmin4 . - - Cmin4 . - - Cmin4 .',
      drums: o1 + ' ' + o2,
    },
    // Fm | Bb
    A4: {
      lead: 'Ab5 . Ab5 . C6 . F6 . Eb6 . . . C6 . Ab5 . Bb5 . Bb5 . D6 . F6 . D6 . . . - - - -',
      harmony: 'Ab5 C6 Ab5 C6 Ab5 C6 Ab5 C6 Ab5 C6 Ab5 C6 Ab5 C6 Ab5 C6 Bb5 D6 Bb5 D6 Bb5 D6 Bb5 D6 Bb5 D6 Bb5 D6 Bb5 D6 Bb5 D6',
      bass: 'F2 . F2 F3 F2 . Ab2 Bb2 C3 . C3 C4 Bb2 . Ab2 . Bb2 . Bb2 Bb3 Bb2 . Bb2 C3 D3 . D3 D4 C3 . Bb2 .',
      arp: '- - Fmin4 . - - Fmin4 . - - Fmin4 . - - Fmin4 . - - Bbmaj4 . - - Bbmaj4 . - - Bbmaj4 . - - Bbmaj4 .',
      drums: o1 + ' ' + oF,
    },
    // B  - soaring chorus
    // Ab | Bb
    B1: {
      lead: '- - C6 . Eb6 . . . D6 . C6 . Ab5 . . . - - D6 . F6 . . . Eb6 . D6 . Bb5 . . .',
      harmony: '- - Ab5 . C6 . . . Bb5 . Ab5 . F5 . . . - - Bb5 . D6 . . . C6 . Bb5 . G5 . . .',
      bass: 'Ab2 . Ab2 Ab3 Ab2 . Ab2 Bb2 C3 . C3 C4 Bb2 . Ab2 . Bb2 . Bb2 Bb3 Bb2 . Bb2 C3 D3 . D3 D4 C3 . Bb2 .',
      arp: 'Abmaj4 . . . . . . . . . . . . . . . Bbmaj4 . . . . . . . . . . . . . . .',
      drums: p1c + ' ' + p1,
    },
    // Cm | Cm
    B2: {
      lead: '- - Eb6 . G6 . . . F6 . Eb6 . C6 . . . Bb5 . C6 . D6 . Eb6 . C6 . . . . . . .',
      harmony: '- - C6 . Eb6 . . . D6 . C6 . Ab5 . . . G5 . Ab5 . Bb5 . C6 . Ab5 . . . . . . .',
      bass: 'C2 . C2 C3 C2 . Eb2 F2 G2 . G2 G3 F2 . Eb2 . C2 . C2 C3 C2 . Eb2 F2 G2 . G2 G3 Bb2 . C3 .',
      arp: 'Cmin4 . . . . . . . . . . . . . . . Cmin4 . . . . . . . . . . . . . . .',
      drums: p2 + ' ' + p1,
    },
    // Ab | Bb
    B3: {
      lead: '- - C6 . Eb6 . . . F6 . Eb6 . C6 . . . - - D6 . F6 . . . G6 . F6 . D6 . . .',
      harmony: '- - Ab5 . C6 . . . D6 . C6 . Ab5 . . . - - Bb5 . D6 . . . Eb6 . D6 . Bb5 . . .',
      bass: 'Ab2 . Ab2 Ab3 Ab2 . Ab2 Bb2 C3 . C3 C4 Bb2 . Ab2 . Bb2 . Bb2 Bb3 Bb2 . Bb2 C3 D3 . D3 D4 C3 . Bb2 .',
      arp: 'Abmaj4 . . . . . . . . . . . . . . . Bbmaj4 . . . . . . . . . . . . . . .',
      drums: p1 + ' ' + p1,
    },
    // Gm | Bb
    B4: {
      lead: 'Bb5 . D6 . G6 . . . F6 . D6 . Bb5 . . . F5 . Bb5 . D6 . F6 . D6 . . . - - - -',
      harmony: 'G5 . Bb5 . Eb6 . . . D6 . Bb5 . G5 . . . D5 . G5 . Bb5 . D6 . Bb5 . . . - - - -',
      bass: 'G2 . G2 G3 G2 . Bb2 C3 D3 . D3 D4 C3 . Bb2 . Bb2 . Bb2 . Bb3 . Bb2 . Bb2 Bb2 Bb3 . D3 . F3 .',
      arp: 'Gmin4 . . . . . . . . . . . . . . . Bbmaj4 . . . . . . . . . . . . . . .',
      drums: p2 + ' ' + oFF,
    },
    // A' - hook returns, octave-low double
    // Cm | Cm
    V1: {
      lead: 'G5 . G5 . G5 . C6 . Eb6 . . . C6 . G5 . G5 G5 G5 . G5 . Bb5 . C6 . . . Bb5 . G5 .',
      harmony: 'G4 . G4 . G4 . C5 . Eb5 . . . C5 . G4 . G4 G4 G4 . G4 . Bb4 . C5 . . . Bb4 . G4 .',
      bass: 'C2 . C2 C3 C2 . Eb2 F2 G2 . G2 G3 F2 . Eb2 . C2 . C2 C3 C2 . Eb2 F2 G2 . G2 G3 Bb2 . C3 .',
      arp: '- - Cmin4 . - - Cmin4 . - - Cmin4 . - - Cmin4 . - - Cmin4 . - - Cmin4 . - - Cmin4 . - - Cmin4 .',
      drums: o1c + ' ' + o2,
    },
    // Ab | Bb
    V2: {
      lead: 'Eb5 Eb5 Eb5 . Eb5 . Ab5 . C6 . . . Ab5 . Eb5 . F5 F5 F5 . F5 . Bb5 . D6 . . . Bb5 . F5 .',
      harmony: 'Eb4 Eb4 Eb4 . Eb4 . Ab4 . C5 . . . Ab4 . Eb4 . F4 F4 F4 . F4 . Bb4 . D5 . . . Bb4 . F4 .',
      bass: 'Ab2 . Ab2 Ab3 Ab2 . Ab2 Bb2 C3 . C3 C4 Bb2 . Ab2 . Bb2 . Bb2 Bb3 Bb2 . Bb2 C3 D3 . D3 D4 C3 . Bb2 .',
      arp: '- - Abmaj4 . - - Abmaj4 . - - Abmaj4 . - - Abmaj4 . - - Bbmaj4 . - - Bbmaj4 . - - Bbmaj4 . - - Bbmaj4 .',
      drums: o2 + ' ' + o1,
    },
    // Cm | Eb
    V3: {
      lead: 'C6 - C6 . Bb5 . G5 . Eb5 . G5 . C6 . . . Bb5 . G5 . Eb5 . G5 . Bb5 . C6 . Eb6 . . .',
      harmony: 'G5 C6 G5 C6 G5 C6 G5 C6 G5 C6 G5 C6 G5 C6 G5 C6 G5 Bb5 G5 Bb5 G5 Bb5 G5 Bb5 G5 Bb5 G5 Bb5 G5 Bb5 G5 Bb5',
      bass: 'C2 . C2 C3 C2 . Eb2 F2 G2 . G2 G3 F2 . Eb2 . Eb2 . Eb2 Eb3 Eb2 . G2 Ab2 Bb2 . Bb2 Bb3 Ab2 . G2 .',
      arp: '- - Cmin4 . - - Cmin4 . - - Cmin4 . - - Cmin4 . - - Ebmaj4 . - - Ebmaj4 . - - Ebmaj4 . - - Ebmaj4 .',
      drums: o1 + ' ' + o2,
    },
    // Fm | Bb
    V4: {
      lead: 'Ab5 . Ab5 . C6 . F6 . G6 . . . F6 . Eb6 . D6 . D6 . Bb5 . F5 . Bb5 . D6 . F6 . . .',
      harmony: 'Ab5 C6 Ab5 C6 Ab5 C6 Ab5 C6 Ab5 C6 Ab5 C6 Ab5 C6 Ab5 C6 Bb5 D6 Bb5 D6 Bb5 D6 Bb5 D6 Bb5 D6 Bb5 D6 Bb5 D6 Bb5 D6',
      bass: 'F2 . F2 F3 F2 . Ab2 Bb2 C3 . C3 C4 Bb2 . Ab2 . Bb2 . Bb2 Bb3 Bb2 . D3 F3 Bb2 . Bb2 Bb3 F2 . Bb2 .',
      arp: '- - Fmin4 . - - Fmin4 . - - Fmin4 . - - Fmin4 . - - Bbmaj4 . - - Bbmaj4 . - - Bbmaj4 . - - Bbmaj4 .',
      drums: o1 + ' ' + oFF,
    },
    // B' - final chorus, lifts to Eb, ends on Bb (bVII)
    // Ab | Bb
    D1: {
      lead: 'C6 . C6 . Eb6 . . . D6 . C6 . Ab5 . . . Bb5 . D6 . F6 . . . Eb6 . D6 . Bb5 . . .',
      harmony: 'Ab5 . Ab5 . C6 . . . Bb5 . Ab5 . F5 . . . G5 . Bb5 . D6 . . . C6 . Bb5 . G5 . . .',
      bass: 'Ab2 . Ab2 Ab3 Ab2 . Ab2 Bb2 C3 . C3 C4 Bb2 . Ab2 . Bb2 . Bb2 Bb3 Bb2 . Bb2 C3 D3 . D3 D4 C3 . Bb2 .',
      arp: 'Abmaj4 . . . . . . . . . . . . . . . Bbmaj4 . . . . . . . . . . . . . . .',
      drums: p1c + ' ' + p2,
    },
    // Cm | Eb
    D2: {
      lead: 'Eb6 . Eb6 . G6 . . . F6 . Eb6 . C6 . . . Bb5 . C6 . D6 . Eb6 . G6 . . . . . . .',
      harmony: 'C6 . C6 . Eb6 . . . D6 . C6 . Ab5 . . . G5 . Ab5 . Bb5 . C6 . Eb6 . . . . . . .',
      bass: 'C2 . C2 C3 C2 . Eb2 F2 G2 . G2 G3 F2 . Eb2 . Eb2 . Eb2 Eb3 Eb2 . G2 Ab2 Bb2 . Bb2 Bb3 Ab2 . G2 .',
      arp: 'Cmin4 . . . . . . . . . . . . . . . Ebmaj4 . . . . . . . . . . . . . . .',
      drums: p2 + ' ' + p1,
    },
    // Ab | Bb
    D3: {
      lead: '- - Ab5 . C6 . . . F6 . Eb6 . C6 . . . - - Bb5 . D6 . . . G6 . F6 . D6 . . .',
      harmony: '- - F5 . Ab5 . . . D6 . C6 . Ab5 . . . - - G5 . Bb5 . . . Eb6 . D6 . Bb5 . . .',
      bass: 'Ab2 . Ab2 Ab3 Ab2 . Ab2 Bb2 C3 . C3 C4 Bb2 . Ab2 . Bb2 . Bb2 Bb3 Bb2 . Bb2 C3 D3 . D3 D4 C3 . Bb2 .',
      arp: 'Abmaj4 . . . . . . . . . . . . . . . Bbmaj4 . . . . . . . . . . . . . . .',
      drums: p1 + ' ' + p2,
    },
    // Gm | Bb
    D4: {
      lead: 'Bb5 . D6 . G6 . . . F6 . D6 . Bb5 . . . F5 . Bb5 . D6 . F6 . D6 . Bb5 . F5 . . .',
      harmony: 'G5 . Bb5 . Eb6 . . . D6 . Bb5 . G5 . . . D5 . G5 . Bb5 . D6 . Bb5 . G5 . D5 . . .',
      bass: 'G2 . G2 G3 G2 . Bb2 C3 D3 . D3 D4 C3 . Bb2 . Bb2 . Bb2 . Bb3 . Bb2 . Bb2 Bb2 Bb3 . D3 . F3 .',
      arp: 'Gmin4 . . . . . . . . . . . . . . . Bbmaj4 . . . . . . . . . . . . . . .',
      drums: p2 + ' ' + oFF,
    },
  },
  order: [
    'A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'V1', 'V2', 'V3', 'V4', 'D1', 'D2', 'D3', 'D4',
  ],
};
