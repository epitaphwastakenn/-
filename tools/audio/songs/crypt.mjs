// Zone 4 "Cripta Assombrada" - spooky-cute A harmonic minor waltz in 3/4 (12-step bars), 126 bpm.
// Form: A / A' / B (lament over A-G#-F-E) / C (tiptoe bridge) / D (return), 20 patterns of 24 steps.

// VARIABLES
const rest = '- - - - - - - - - - - -';
const wC = 'kc . h . x . h . x . h .';
const wA = 'k . . h x . . h x . . h';
const wB = 'k . h . x . h . x . h h';
const wF = 'k . h . x . h . t . T .';
const wR = 'k . . . x . . . t t T T';
const wH1 = 'k . . . . . . . . . . .';
const wH2 = 'k . . . . . t . . . . .';
const wH3 = 'k . . . . . . . t . . .';
const wBuild = 't . . . t . . . T . T .';
const wBuild2 = 't . t . T . T . T T S S';
const wK = 'K . h . x . h . x . h h';

export default {
  name: 'crypt',
  bpm: 126,
  stepsPerBeat: 4,
  instruments: {
    lead: { wave: 'pulse', duty: 0.5, attack: 0.012, decay: 0.05, sustain: 0.8, release: 0.05, gate: 0.85, volume: 0.22, vibrato: { depth: 0.3, rate: 5.5, delay: 0.15 }, echo: 0.2, echoTime: 0.4762 },
    harmony: { wave: 'pulse', duty: 0.125, attack: 0.08, decay: 0.2, sustain: 0.7, release: 0.2, volume: 0.1, vibrato: { depth: 0.45, rate: 4.5, delay: 0.1 }, slide: 0.12, echo: 0.3, echoTime: 0.4762 },
    bass: { wave: 'nesTriangle', attack: 0.004, decay: 0.08, sustain: 0.8, release: 0.03, volume: 0.45, gate: 0.7 },
    arp: { wave: 'pulse', duty: 0.25, arp: true, arpRate: 0.035, attack: 0.002, decay: 0.12, sustain: 0.3, release: 0.06, volume: 0.12, pluck: 3.5 },
    drums: { volume: 0.32 },
  },
  patterns: {
    // A  - hop-and-neighbour hook, finger-snap waltz
    // Am | Am
    A1: {
      lead: 'A5 . . G#5 A5 . C6 . E6 . C6 . C6 . . . A5 . . . E5 . . .',
      harmony: rest + ' ' + rest,
      bass: 'A2 . . . - - - - E3 . . . A2 . . . - - - - A2 . . .',
      arp: '- - - - Amin4 . . . Amin4 . . . - - - - Amin4 . . . Amin4 . . .',
      drums: wC + ' ' + wA,
    },
    // E7 | Am
    A2: {
      lead: 'B5 . . G#5 B5 . D6 . E6 . D6 . C6 . . . . . B5 . A5 . . .',
      harmony: rest + ' ' + '- - - - - - - - E5 . . .',
      bass: 'E2 . . . - - - - B2 . . . A2 . . . - - - - E3 . . .',
      arp: '- - - - E74 . . . E74 . . . - - - - Amin4 . . . Amin4 . . .',
      drums: wA + ' ' + wA,
    },
    // Dm | Am
    A3: {
      lead: 'F5 . . E5 F5 . A5 . D6 . A5 . E6 . . . C6 . . . A5 . . .',
      harmony: rest + ' ' + rest,
      bass: 'D3 . . . - - - - A2 . . . A2 . . . - - - - E3 . . .',
      arp: '- - - - Dmin4 . . . Dmin4 . . . - - - - Amin4 . . . Amin4 . . .',
      drums: wB + ' ' + wA,
    },
    // E7 | Am
    A4: {
      lead: 'B5 . . G#5 B5 . D6 . B5 . G#5 . A5 . . . . . . . - - - -',
      harmony: rest + ' ' + '- - - - E4 . . . . . . .',
      bass: 'E2 . . . - - - - B2 . . . A2 . . . C3 . . . E3 . . .',
      arp: '- - - - E74 . . . E74 . . . - - - - Amin4 . . . Amin4 . . .',
      drums: wA + ' ' + wF,
    },
    // A' - hook again, pushes up through F and Dm
    // Am | Am
    V1: {
      lead: 'A5 . . G#5 A5 . C6 . E6 . C6 . E6 . . . C6 . . . A5 . . .',
      harmony: 'E5 . . . . . . . . . . .' + ' ' + rest,
      bass: 'A2 . . . - - - - E3 . . . A2 . . . C3 . . . E3 . . .',
      arp: '- - - - Amin4 . . . Amin4 . . . - - - - Amin4 . . . Amin4 . . .',
      drums: wC + ' ' + wB,
    },
    // E7 | Am
    V2: {
      lead: 'E6 . . D6 B5 . G#5 . B5 . D6 . A5 . . . . . C6 . E6 . . .',
      harmony: 'G#5 . . . . . . . . . . . E5 . . . . . . . . . . .',
      bass: 'E2 . . . - - - - B2 . . . A2 . . . - - - - E3 . . .',
      arp: '- - - - E74 . . . E74 . . . - - - - Amin4 . . . Amin4 . . .',
      drums: wB + ' ' + wB,
    },
    // F | Dm
    V3: {
      lead: 'A5 . . G#5 A5 . C6 . F6 . C6 . D6 . . . A5 . . . F5 . . .',
      harmony: 'F5 . . . . . . . . . . . D5 . . . . . . . . . . .',
      bass: 'F2 . . . - - - - C3 . . . D3 . . . - - - - A2 . . .',
      arp: '- - - - Fmaj4 . . . Fmaj4 . . . - - - - Dmin4 . . . Dmin4 . . .',
      drums: wB + ' ' + wB,
    },
    // E7 | Am
    V4: {
      lead: 'G#5 . B5 . D6 . E6 . D6 . B5 . A5 . . . . . . . . . . .',
      harmony: 'B4 . . . . . . . . . . . E5 . . . . . . . . . . .',
      bass: 'E2 . . . - - - - B2 . . . A2 . . . E2 . . . A2 . . .',
      arp: '- - - - E74 . . . E74 . . . - - - - Amin4 . . . Amin4 . . .',
      drums: wB + ' ' + wR,
    },
    // B  - lyrical lament over the falling bass A G# F E
    // Am | E7
    B1: {
      lead: 'A5 . . . . . C6 . E6 . . . D6 . . . . . B5 . G#5 . . .',
      harmony: 'E5 . . . . . . . . . . . B4 . . . . . . . . . . .',
      bass: 'A2 . . . - - - - E3 . . . G#2 . . . B2 . . . E3 . . .',
      arp: '- - - - Amin4 . . . Amin4 . . . - - - - E74 . . . E74 . . .',
      drums: wA + ' ' + wA,
    },
    // F | E7
    B2: {
      lead: 'A5 . . . . . C6 . A5 . . . B5 . . . . . G#5 . E5 . . .',
      harmony: 'C5 . . . . . . . . . . . G#4 . . . . . . . . . . .',
      bass: 'F2 . . . - - - - C3 . . . E2 . . . - - - - B2 . . .',
      arp: '- - - - Fmaj4 . . . Fmaj4 . . . - - - - E74 . . . E74 . . .',
      drums: wB + ' ' + wB,
    },
    // Am | Dm
    B3: {
      lead: 'E6 . . . . . C6 . A5 . . . F5 . . . . . A5 . D6 . . .',
      harmony: 'C5 . . . . . . . . . . . A4 . . . . . . . . . . .',
      bass: 'A2 . . . - - - - E3 . . . D3 . . . - - - - A2 . . .',
      arp: '- - - - Amin4 . . . Amin4 . . . - - - - Dmin4 . . . Dmin4 . . .',
      drums: wA + ' ' + wB,
    },
    // E7 | Am
    B4: {
      lead: 'D6 . . . . . B5 . G#5 . . . A5 . . . . . . . . . . .',
      harmony: 'B4 . . . . . . . . . . . E5 . . . . . . . . . . .',
      bass: 'E2 . . . - - - - B2 . . . A2 . . . - - - - E3 . . .',
      arp: '- - - - E74 . . . E74 . . . - - - - Amin4 . . . Amin4 . . .',
      drums: wB + ' ' + wF,
    },
    // C  - tiptoe bridge: scale up, arpeggios down, build
    // Am | Dm
    C1: {
      lead: 'A4 . - - B4 . - - C5 . - - D5 . - - E5 . - - F5 . - -',
      harmony: rest + ' ' + rest,
      bass: 'A2 . . . - - - - A2 . . . D3 . . . - - - - D3 . . .',
      arp: '- - - - - - - - - - - - - - - - - - - - - - - -',
      drums: wH1 + ' ' + wH1,
    },
    // E7 | Am
    C2: {
      lead: 'G#5 . - - A5 . - - B5 . - - C6 . - - D6 . - - E6 . - -',
      harmony: rest + ' ' + rest,
      bass: 'E2 . . . - - - - E2 . . . A2 . . . - - - - A2 . . .',
      arp: '- - - - - - - - - - - - - - - - - - - - - - - -',
      drums: wH2 + ' ' + wH2,
    },
    // F | Dm
    C3: {
      lead: 'C6 . - - A5 . - - F5 . - - D6 . - - A5 . - - F5 . - -',
      harmony: 'C5 . . . . . . . . . . . D5 . . . . . . . . . . .',
      bass: 'F2 . . . - - - - F2 . . . D3 . . . - - - - D3 . . .',
      arp: '- - - - Fmaj4 . . . - - - - - - - - Dmin4 . . . - - - -',
      drums: wH3 + ' ' + wH2,
    },
    // E7 | E7
    C4: {
      lead: 'D6 . - - B5 . - - G#5 . - - E5 . G#5 . B5 . D6 . E6 . . .',
      harmony: 'B4 . . . . . . . . . . . B4 . . . . . . . - - - -',
      bass: 'E2 . . . - - - - E2 . . . E2 . . . G#2 . . . B2 . . .',
      arp: '- - - - E74 . . . - - - - - - - - E74 . . . E74 . . .',
      drums: wBuild + ' ' + wBuild2,
    },
    // D  - A'' full band, ends on the dominant
    // Am | Am
    D1: {
      lead: 'A5 . . G#5 A5 . C6 . E6 . C6 . C6 . . . A5 . G#5 A5 E5 . . .',
      harmony: 'E5 . . . . . . . . . . . E5 . . . . . . . . . . .',
      bass: 'A2 . . . - - - - E3 . . . A2 . . . - - - - C3 . . .',
      arp: '- - - - Amin4 . . . Amin4 . . . - - - - Amin4 . . . Amin4 . . .',
      drums: wC + ' ' + wK,
    },
    // E7 | Am
    D2: {
      lead: 'B5 . . G#5 B5 . D6 . E6 . D6 . C6 . . . . . B5 . A5 . G#5 A5',
      harmony: 'G#5 . . . . . . . . . . . E5 . . . . . . . . . . .',
      bass: 'E2 . . . - - - - B2 . . . A2 . . . - - - - E3 . . .',
      arp: '- - - - E74 . . . E74 . . . - - - - Amin4 . . . Amin4 . . .',
      drums: wK + ' ' + wK,
    },
    // Dm | Am
    D3: {
      lead: 'F5 . . E5 F5 . A5 . D6 . A5 . E6 . D6 . C6 . B5 . A5 . . .',
      harmony: 'F5 . . . . . . . . . . . E5 . . . . . . . . . . .',
      bass: 'D3 . . . - - - - A2 . . . A2 . . . - - - - E3 . . .',
      arp: '- - - - Dmin4 . . . Dmin4 . . . - - - - Amin4 . . . Amin4 . . .',
      drums: wK + ' ' + wK,
    },
    // E7 | E7
    D4: {
      lead: 'G#5 . B5 . D6 . E6 . D6 . B5 . B5 . . G#5 B5 . D6 . E6 . . .',
      harmony: 'B4 . . . . . . . . . . . E4 . . . . . . . . . . .',
      bass: 'E2 . . . - - - - B2 . . . E2 . . . G#2 . . . B2 . . .',
      arp: '- - - - E74 . . . E74 . . . - - - - E74 . . . E74 . . .',
      drums: wK + ' ' + wR,
    },
  },
  order: [
    'A1', 'A2', 'A3', 'A4', 'V1', 'V2', 'V3', 'V4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4',
    'D1', 'D2', 'D3', 'D4',
  ],
};
