// VARIABLES
const a1c = 'kc . h . S . h . k . h k S . h .';
const a1 = 'k . h . S . h . k . h k S . h .';
const a2 = 'k . h h S . h . k k h . S . h h';
const aF = 'k . h . S . h . k . t t T T S S';
const b1c = 'kc h h k S h h . k h k h S h h S';
const b1 = 'k h h k S h h . k h k h S h h S';
const bF = 'k h h k S h h . t t T T S S S S';
const h1c = 'kc . H . S . H . k . H k S . o .';
const h1 = 'k . H . S . H . k . H k S . o .';
const h2 = 'k . H k S . H . k k H . S . H S';
const hF = 'k . H k S . H . t t T T S S S S';
const t1 = 't . . . . . . . t . . . . . t .';
const t2 = 't . . . t . . . T . . . T . T .';
const t3 = 't . t . t . t . T . T . T T T T';
const c1 = 'k . . . S . . . k . . . S . . .';
const t4 = 't t T T t t T T S S S S S S S S';
const e1 = 'kc k H k s H H . k k H k S H H S';

export default {
  name: 'final',
  bpm: 164,
  stepsPerBeat: 4,
  instruments: {
    lead: { wave: 'pulse', duty: 0.25, attack: 0.003, decay: 0.08, sustain: 0.65, release: 0.025, gate: 0.88, volume: 0.23, vibrato: { depth: 0.2, rate: 6, delay: 0.2 }, echo: 0.18 },
    harmony: { wave: 'pulse', duty: 0.5, attack: 0.004, decay: 0.1, sustain: 0.6, release: 0.04, gate: 0.88, volume: 0.1 },
    bass: { wave: 'nesTriangle', attack: 0.003, decay: 0.07, sustain: 0.85, release: 0.025, volume: 0.4, gate: 0.75 },
    arp: { wave: 'pulse', duty: 0.125, arp: true, arpRate: 0.0457, attack: 0.002, decay: 0.08, sustain: 0.5, release: 0.03, volume: 0.08, gate: 0.8, pluck: 1.8 },
    drums: { volume: 0.3 },
  },
  patterns: {
    A1: {
      lead: 'E5 E5 E5 - B5 . . . G5 G5 G5 - E5 . . . E5 E5 E5 - B5 . . . D6 . . B5 G5 . . .',
      harmony: '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -',
      bass: 'E2 . E2 . E3 . E2 . E2 . E2 . E3 . E2 . E2 . E2 . E3 . E2 . E2 . E2 . E3 . E2 .',
      arp: 'Emin4 . . . Emin4 . . . Emin4 . . . Emin4 . . . Emin4 . . . Emin4 . . . Emin4 . . . Emin4 . . .',
      drums: a1c + ' ' + a1,
    },
    A2: {
      lead: 'C5 C5 C5 - G5 . . . E5 E5 E5 - C5 . . . D5 D5 D5 - A5 . . . F#5 F#5 F#5 - A5 . . .',
      harmony: '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -',
      bass: 'C3 . C3 . C4 . C3 . C3 . C3 . C4 . C3 . D3 . D3 . D4 . D3 . D3 . D3 . D4 . D3 .',
      arp: 'Cmaj4 . . . Cmaj4 . . . Cmaj4 . . . Cmaj4 . . . Dmaj4 . . . Dmaj4 . . . Dmaj4 . . . Dmaj4 . . .',
      drums: a1 + ' ' + a1,
    },
    A3: {
      lead: 'B5 . G5 . E5 . G5 . B5 . . . E6 . . . D6 . . . B5 . . . G5 . B5 . E6 . . .',
      harmony: 'B4 . G4 . E4 . G4 . B4 . . . E5 . . . D5 . . . B4 . . . G4 . B4 . E5 . . .',
      bass: 'E2 . E2 . E3 . E2 . E2 . E2 . E3 . E2 . E2 . E2 . E3 . E2 . E2 . E2 . E3 . E2 .',
      arp: 'Emin4 . . . Emin4 . . . Emin4 . . . Emin4 . . . Emin4 . . . Emin4 . . . Emin4 . . . Emin4 . . .',
      drums: a2 + ' ' + a2,
    },
    A4: {
      lead: 'C6 . . . G5 . . . E5 . G5 . C6 . . . B4 C5 D5 E5 F#5 G5 A5 B5 F#6 . E6 . D6 . B5 .',
      harmony: 'C5 . . . G4 . . . E4 . G4 . C5 . . . B3 C4 D4 E4 F#4 G4 A4 B4 F#5 . E5 . D5 . B4 .',
      bass: 'C3 . C3 . C4 . C3 . C3 . C3 . C4 . C3 . B2 . B2 . B3 . B2 . B2 . B2 . B3 . B2 .',
      arp: 'Cmaj4 . . . Cmaj4 . . . Cmaj4 . . . Cmaj4 . . . B54 . . . B54 . . . B54 . . . B54 . . .',
      drums: a2 + ' ' + aF,
    },
    V1: {
      lead: 'E5 E5 E5 - B5 . . . G5 G5 G5 - E5 . . . E5 E5 E5 - B5 . . . E6 . . D6 B5 . . .',
      harmony: 'A4 A4 A4 - E5 . . . C5 C5 C5 - A4 . . . A4 A4 A4 - E5 . . . A5 . . G5 E5 . . .',
      bass: 'E2 E2 E3 E2 E2 E2 E3 E2 E2 E2 E3 E2 E2 E2 E3 E2 E2 E2 E3 E2 E2 E2 E3 E2 E2 E2 E3 E2 E2 E2 E3 E2',
      arp: 'Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 .',
      drums: b1c + ' ' + b1,
    },
    V2: {
      lead: 'C5 C5 C5 - G5 . . . C6 . . B5 G5 . . . D5 D5 D5 - A5 . . . D6 . . C6 A5 . . .',
      harmony: 'G4 G4 G4 - C5 . . . G5 . . E5 C5 . . . G4 G4 G4 - D5 . . . G5 . . G5 D5 . . .',
      bass: 'C3 C3 C4 C3 C3 C3 C4 C3 C3 C3 C4 C3 C3 C3 C4 C3 D3 D3 D4 D3 D3 D3 D4 D3 D3 D3 D4 D3 D3 D3 D4 D3',
      arp: 'Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 .',
      drums: b1 + ' ' + b1,
    },
    V3: {
      lead: 'G5 . B5 . E6 . G6 . F#6 . . . E6 . . . E6 . C6 . G5 . C6 . E6 . . . G6 . . .',
      harmony: 'C5 . E5 . A5 . C6 . B5 . . . A5 . . . A5 . G5 . C5 . G5 . A5 . . . C6 . . .',
      bass: 'E2 E2 E3 E2 E2 E2 E3 E2 E2 E2 E3 E2 E2 E2 E3 E2 C3 C3 C4 C3 C3 C3 C4 C3 C3 C3 C4 C3 C3 C3 C4 C3',
      arp: 'Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 .',
      drums: b1 + ' ' + b1,
    },
    V4: {
      lead: 'F#6 . . . D6 . . . A5 . D6 . F#6 . . . B5 C6 D6 E6 F#6 G6 F#6 E6 D6 . . . B5 . . .',
      harmony: 'B5 . . . G5 . . . D5 . G5 . B5 . . . E5 G5 G5 A5 B5 C6 B5 A5 G5 . . . E5 . . .',
      bass: 'D3 D3 D4 D3 D3 D3 D4 D3 D3 D3 D4 D3 D3 D3 D4 D3 B2 B2 B3 B2 B2 B2 B3 B2 B2 B2 B3 B2 B2 B2 B3 B2',
      arp: 'Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 .',
      drums: b1 + ' ' + bF,
    },
    B1: {
      lead: 'E6 . . . . . D6 . C6 . . . G5 . . . D6 . . . . . C6 . B5 . . . G5 . . .',
      harmony: 'C6 . . . . . B5 . A5 . . . E5 . . . B5 . . . . . A5 . G5 . . . E5 . . .',
      bass: 'C3 . C3 C3 C4 . C3 C3 C3 . C3 C3 C4 . C3 C3 G2 . G2 G2 G3 . G2 G2 G2 . G2 G2 G3 . G2 G2',
      arp: 'Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 .',
      drums: h1c + ' ' + h1,
    },
    B2: {
      lead: 'A5 . . . . . B5 . A5 . . . F#5 . . . G5 . . . B5 . . . E6 . . . . . . .',
      harmony: 'F#5 . . . . . G5 . F#5 . . . D5 . . . E5 . . . G5 . . . C6 . . . . . . .',
      bass: 'D3 . D3 D3 D4 . D3 D3 D3 . D3 D3 D4 . D3 D3 E2 . E2 E2 E3 . E2 E2 E2 . E2 E2 E3 . E2 E2',
      arp: 'Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 .',
      drums: h1 + ' ' + h2,
    },
    B3: {
      lead: 'E6 . . . . . G6 . E6 . . . C6 . . . D6 . . . . . G6 . D6 . . . B5 . . .',
      harmony: 'C6 . . . . . E6 . C6 . . . A5 . . . B5 . . . . . E6 . B5 . . . G5 . . .',
      bass: 'C3 . C3 C3 C4 . C3 C3 C3 . C3 C3 C4 . C3 C3 G2 . G2 G2 G3 . G2 G2 G2 . G2 G2 G3 . G2 G2',
      arp: 'Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 .',
      drums: h1 + ' ' + h1,
    },
    B4: {
      lead: 'F#6 . . . . . E6 . D6 . . . B5 . . . B5 . . . A5 . F#5 . B5 . . . . . - -',
      harmony: 'D6 . . . . . C6 . B5 . . . G5 . . . G5 . . . F#5 . D5 . G5 . . . . . - -',
      bass: 'B2 . B2 B2 B3 . B2 B2 B2 . B2 B2 B3 . B2 B2 B2 . B2 . B3 . B2 . B2 B2 B3 . F#3 . D3 .',
      arp: 'B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 .',
      drums: h1 + ' ' + hF,
    },
    C1: {
      lead: 'B5 . . . . . . . . . . . . . . . B5 . . . . . . . . . . . A5 . B5 .',
      harmony: 'E4 . . . . . . . . . . . . . . . E4 . . . . . . . . . . . . . . .',
      bass: 'E2 . . . . . . . . . . . . . . . E2 . . . . . . . . . . . E2 . E2 .',
      arp: 'E54 . . . . . . . . . . . . . . . E54 . . . . . . . . . . . . . . .',
      drums: t1 + ' ' + t1,
    },
    C2: {
      lead: 'C6 . . . . . . . B5 . . . . . . . A5 . . . . . . . . . . . B5 . C6 .',
      harmony: 'A4 . . . . . . . . . . . . . . . A4 . . . . . . . . . . . . . . .',
      bass: 'A2 . . . . . . . . . . . . . . . A2 . . . . . . . . . . . A2 . A2 .',
      arp: 'Amin4 . . . . . . . . . . . . . . . Amin4 . . . . . . . . . . . . . . .',
      drums: t2 + ' ' + t2,
    },
    C3: {
      lead: 'E6 . . . . . . . . . . . D6 . E6 . F#6 . . . . . . . . . . . E6 . D6 .',
      harmony: 'G4 . . . . . . . . . . . . . . . A4 . . . . . . . . . . . . . . .',
      bass: 'C3 C3 C4 C3 C3 C3 C4 C3 C3 C3 C4 C3 C3 C3 C4 C3 D3 D3 D4 D3 D3 D3 D4 D3 D3 D3 D4 D3 D3 D3 D4 D3',
      arp: 'Cmaj4 . . . Cmaj4 . . . Cmaj4 . . . Cmaj4 . . . Dmaj4 . . . Dmaj4 . . . Dmaj4 . . . Dmaj4 . . .',
      drums: t3 + ' ' + t3,
    },
    C4: {
      lead: 'D6 . . . . . . . B5 . . . . . . . B4 C5 D5 E5 F#5 G5 A5 B5 C6 D6 E6 F#6 G6 . . .',
      harmony: 'F#4 . . . . . . . . . . . . . . . F#4 . . . . . . . . . . . . . . .',
      bass: 'B2 B2 B3 B2 B2 B2 B3 B2 B2 B2 B3 B2 B2 B2 B3 B2 B2 B2 B3 B2 B2 B2 B3 B2 B2 B2 B3 B2 B2 B2 B3 B2',
      arp: 'B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 .',
      drums: c1 + ' ' + t4,
    },
    D1: {
      lead: 'B5 . . . D6 . . . G6 . . . . . . . F#6 . . . . . E6 . D6 . . . . . . .',
      harmony: 'B4 . . . D5 . . . G5 . . . . . . . F#5 . . . . . E5 . D5 . . . . . . .',
      bass: 'G2 G2 G3 G2 G2 G2 G3 G2 G2 G2 G3 G2 G2 G2 G3 G2 D3 D3 D4 D3 D3 D3 D4 D3 D3 D3 D4 D3 D3 D3 D4 D3',
      arp: 'Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 .',
      drums: e1 + ' ' + h2,
    },
    D2: {
      lead: 'G6 . . . . . F#6 . E6 . . . B5 . . . E6 . . . . . D6 . C6 . . . G5 . . .',
      harmony: 'G5 . . . . . F#5 . E5 . . . B4 . . . E5 . . . . . D5 . C5 . . . G4 . . .',
      bass: 'E2 E2 E3 E2 E2 E2 E3 E2 E2 E2 E3 E2 E2 E2 E3 E2 C3 C3 C4 C3 C3 C3 C4 C3 C3 C3 C4 C3 C3 C3 C4 C3',
      arp: 'Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 .',
      drums: h2 + ' ' + h2,
    },
    D3: {
      lead: 'D6 . . . B5 . . . G6 . . . . . . . F#6 . . . A5 . . . D6 . . . . . . .',
      harmony: 'D5 . . . B4 . . . G5 . . . . . . . F#5 . . . A4 . . . D5 . . . . . . .',
      bass: 'G2 G2 G3 G2 G2 G2 G3 G2 G2 G2 G3 G2 G2 G2 G3 G2 D3 D3 D4 D3 D3 D3 D4 D3 D3 D3 D4 D3 D3 D3 D4 D3',
      arp: 'Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 .',
      drums: h2 + ' ' + h2,
    },
    D4: {
      lead: 'C6 . . . E6 . . . G6 . . . . . . . A5 . B5 . A5 . F#5 . D5 . . . . . . .',
      harmony: 'C5 . . . E5 . . . G5 . . . . . . . A4 . B4 . A4 . F#4 . D4 . . . . . . .',
      bass: 'C3 C3 C4 C3 C3 C3 C4 C3 C3 C3 C4 C3 C3 C3 C4 C3 D3 . D3 . D4 . D3 . A2 . A2 . D3 . D3 .',
      arp: 'Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 .',
      drums: h2 + ' ' + hF,
    },
    E1: {
      lead: 'E5 E5 E5 - B5 . . . E6 E6 E6 - B5 . . . C6 C6 C6 - G5 . . . E6 E6 E6 - G6 . . .',
      harmony: 'A4 A4 A4 - E5 . . . A5 A5 A5 - E5 . . . G5 G5 G5 - C5 . . . A5 A5 A5 - C6 . . .',
      bass: 'E2 E2 E3 E2 E2 E2 E3 E2 E2 E2 E3 E2 E2 E2 E3 E2 C3 C3 C4 C3 C3 C3 C4 C3 C3 C3 C4 C3 C3 C3 C4 C3',
      arp: 'Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 .',
      drums: e1 + ' ' + h2,
    },
    E2: {
      lead: 'D6 D6 D6 - B5 . . . G6 G6 G6 - D6 . . . A5 A5 A5 - F#6 . . . D6 D6 D6 - A5 . . .',
      harmony: 'G5 G5 G5 - E5 . . . C6 C6 C6 - G5 . . . D5 D5 D5 - B5 . . . G5 G5 G5 - D5 . . .',
      bass: 'G2 G2 G3 G2 G2 G2 G3 G2 G2 G2 G3 G2 G2 G2 G3 G2 D3 D3 D4 D3 D3 D3 D4 D3 D3 D3 D4 D3 D3 D3 D4 D3',
      arp: 'Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Gmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 . Dmaj4 .',
      drums: h2 + ' ' + h2,
    },
    E3: {
      lead: 'G5 . . . B5 . . . E6 . . . G6 . . . E6 . . . . . G6 . E6 . . . C6 . . .',
      harmony: 'C5 . . . E5 . . . A5 . . . C6 . . . A5 . . . . . C6 . A5 . . . G5 . . .',
      bass: 'E2 E2 E3 E2 E2 E2 E3 E2 E2 E2 E3 E2 E2 E2 E3 E2 C3 C3 C4 C3 C3 C3 C4 C3 C3 C3 C4 C3 C3 C3 C4 C3',
      arp: 'Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Emin4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 . Cmaj4 .',
      drums: h2 + ' ' + h2,
    },
    E4: {
      lead: 'D6 . . . . . E6 . F#6 . . . D6 . . . B5 C6 D6 E6 F#6 E6 D6 C6 B5 . . . - - - -',
      harmony: 'G5 . . . . . A5 . B5 . . . G5 . . . E5 G5 G5 A5 B5 A5 G5 G5 E5 . . . - - - -',
      bass: 'B2 B2 B3 B2 B2 B2 B3 B2 B2 B2 B3 B2 B2 B2 B3 B2 B2 B2 B3 . B2 B2 B3 . B2 B2 B3 . B2 B2 B3 .',
      arp: 'B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 . B54 .',
      drums: h2 + ' ' + hF,
    },
  },
  order: [
    'A1', 'A2', 'A3', 'A4', 'V1', 'V2', 'V3', 'V4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4',
    'D1', 'D2', 'D3', 'D4', 'E1', 'E2', 'E3', 'E4',
  ],
};
