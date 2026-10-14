// Zone 5 "Abismo Vulcanico" - heroic-dark D minor with phrygian Eb touches, 150 bpm.
// Form: A (cobra hook) / B (heroic rise) / A' / C (phrygian bridge + build) / B' (final chorus), all ending on the dominant.

// VARIABLES
const d1c = 'Kc . h . S . h . K . K . S . h .';
const d1 = 'K . h . S . h . K . K . S . h .';
const d2 = 'K . h K S . h . K . K . S . o .';
const dF = 'K . h . S . h . t t T T S S S S';
const e1c = 'Kc . H . S . H . K . H K S . H .';
const e1 = 'K . H . S . H . K . H K S . H .';
const e2 = 'K . H K S . H . K K H . S . H K';
const eF = 'K . H K S . H . K K H . S S T T';
const dFF = 'K . K . S . S . t t T T S S S S';
const c1 = 'Kc . . . . . . . K . . . . . . .';
const c2 = 'K . . . S . . . K . . . S . . .';
const c3 = 'K . h . S . h . K . h . S . S .';
const c4 = 'S . S . S . S . S S S S S S S S';

export default {
  name: 'abyss',
  bpm: 150,
  stepsPerBeat: 4,
  instruments: {
    lead: { wave: 'saw', attack: 0.006, decay: 0.1, sustain: 0.7, release: 0.03, gate: 0.9, volume: 0.28, lowpass: 4800, vibrato: { depth: 0.25, rate: 5.5, delay: 0.22 }, echo: 0.2 },
    harmony: { wave: 'pulse', duty: 0.5, attack: 0.01, decay: 0.15, sustain: 0.6, release: 0.06, gate: 0.9, volume: 0.1 },
    bass: { wave: 'nesTriangle', attack: 0.003, decay: 0.07, sustain: 0.85, release: 0.025, volume: 0.4, gate: 0.8 },
    arp: { wave: 'pulse', duty: 0.25, arp: true, arpRate: 0.05, attack: 0.002, decay: 0.08, sustain: 0.55, release: 0.03, volume: 0.09, gate: 0.75, pluck: 1.5 },
    drums: { volume: 0.3 },
  },
  patterns: {
    // A  - cobra hook (D Eb D F A) and falling answer
    // Dm | Dm
    A1: {
      lead: 'D5 . . Eb5 D5 . F5 . A5 . . . G5 . F5 . D5 . . Eb5 D5 . F5 . A5 . . . . . C6 .',
      harmony: 'D4 . . Eb4 D4 . F4 . A4 . . . G4 . F4 . D4 . . Eb4 D4 . F4 . A4 . . . . . C5 .',
      bass: 'D2 . D2 . D2 . D2 . D2 . D2 . D2 . D3 . D2 . D2 . D2 . D2 . D2 . D2 . D2 . F2 .',
      arp: 'D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 .',
      drums: d1c + ' ' + d1,
    },
    // Bb | C
    A2: {
      lead: 'Bb5 . . . . . A5 . G5 . . . F5 . D5 . E5 . G5 . C6 . . . Bb5 . A5 . G5 . . .',
      harmony: 'Bb4 . . . . . A4 . G4 . . . F4 . D4 . E4 . G4 . C5 . . . Bb4 . A4 . G4 . . .',
      bass: 'Bb2 . Bb2 . Bb2 . Bb2 . Bb2 . Bb2 . Bb2 . Bb3 . C3 . C3 . C3 . C3 . C3 . C3 . C3 . C3 .',
      arp: 'Bb53 . Bb53 . Bb53 . Bb53 . Bb53 . Bb53 . Bb53 . Bb53 . C53 . C53 . C53 . C53 . C53 . C53 . C53 . C53 .',
      drums: d2 + ' ' + d1,
    },
    // Dm | Gm
    A3: {
      lead: 'D6 . . . C6 . A5 . F5 . . . A5 . . . G5 . . Bb5 D6 . Bb5 . G5 . . . Bb5 . . .',
      harmony: 'D5 . . . C5 . A4 . F4 . . . A4 . . . G4 . . Bb4 D5 . Bb4 . G4 . . . Bb4 . . .',
      bass: 'D2 . D2 . D2 . D2 . D2 . D2 . D2 . D3 . G2 . G2 . G2 . G2 . G2 . G2 . G2 . G3 .',
      arp: 'D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . G53 . G53 . G53 . G53 . G53 . G53 . G53 . G53 .',
      drums: d1 + ' ' + d2,
    },
    // Eb | A5
    A4: {
      lead: 'Eb6 . . . . . D6 . Bb5 . . . G5 . Eb5 . E5 . A5 . C6 . E6 . D6 . C6 . A5 . . .',
      harmony: 'Eb5 . . . . . D5 . Bb4 . . . G4 . Eb4 . E4 . A4 . C5 . E5 . D5 . C5 . A4 . . .',
      bass: 'Eb2 . Eb2 . Eb2 . Eb2 . Eb2 . Eb2 . Eb2 . Eb3 . A2 . A2 . A2 . A2 . A2 . A2 . A2 . A3 .',
      arp: 'Eb53 . Eb53 . Eb53 . Eb53 . Eb53 . Eb53 . Eb53 . Eb53 . A53 . A53 . A53 . A53 . A53 . A53 . A53 . A53 .',
      drums: d1 + ' ' + dF,
    },
    // B  - heroic rising arpeggios
    // Bb | C
    B1: {
      lead: 'F5 . . . Bb5 . . . D6 . . . . . . . G5 . G5 . C6 . . . E6 . . . . . . .',
      harmony: 'Bb4 . . . Eb5 . . . G5 . . . . . . . C5 . C5 . F5 . . . A5 . . . . . . .',
      bass: 'Bb2 . Bb2 Bb2 Bb2 . Bb2 Bb2 Bb2 . Bb2 Bb2 Bb2 . Bb3 . C3 . C3 C3 C3 . C3 C3 C3 . C3 C3 C3 . C4 .',
      arp: 'Bb53 . Bb53 . Bb53 . Bb53 . Bb53 . Bb53 . Bb53 . Bb53 . C53 . C53 . C53 . C53 . C53 . C53 . C53 . C53 .',
      drums: e1c + ' ' + e1,
    },
    // Dm | Dm
    B2: {
      lead: 'A5 . A5 . D6 . . . F6 . . . . . . . E6 . . . D6 . . . A5 . . . . . . .',
      harmony: 'D5 . D5 . G5 . . . Bb5 . . . . . . . A5 . . . G5 . . . D5 . . . . . . .',
      bass: 'D2 . D2 D2 D2 . D2 D2 D2 . D2 D2 D2 . D3 . D2 . D2 D2 D2 . D2 D2 D2 . D2 D2 D2 . F2 .',
      arp: 'D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 .',
      drums: e2 + ' ' + e1,
    },
    // Gm | Bb
    B3: {
      lead: 'Bb5 . Bb5 . D6 . . . G6 . . . . . . . F6 . . . D6 . . . Bb5 . . . . . . .',
      harmony: 'Eb5 . Eb5 . G5 . . . C6 . . . . . . . Bb5 . . . G5 . . . Eb5 . . . . . . .',
      bass: 'G2 . G2 G2 G2 . G2 G2 G2 . G2 G2 G2 . G3 . Bb2 . Bb2 Bb2 Bb2 . Bb2 Bb2 Bb2 . Bb2 Bb2 Bb2 . Bb3 .',
      arp: 'G53 . G53 . G53 . G53 . G53 . G53 . G53 . G53 . Bb53 . Bb53 . Bb53 . Bb53 . Bb53 . Bb53 . Bb53 . Bb53 .',
      drums: e1 + ' ' + e2,
    },
    // C | A5
    B4: {
      lead: 'C6 . . . E6 . . . G6 . . . . . . . E6 . . . D6 . . . C6 . . . A5 . . .',
      harmony: 'F5 . . . A5 . . . C6 . . . . . . . A5 . . . G5 . . . F5 . . . D5 . . .',
      bass: 'C3 . C3 C3 C3 . C3 C3 C3 . C3 C3 C3 . C4 . A2 . A2 A2 A2 . A2 A2 A2 . A2 A2 A2 A2 A3 .',
      arp: 'C53 . C53 . C53 . C53 . C53 . C53 . C53 . C53 . A53 . A53 . A53 . A53 . A53 . A53 . A53 . A53 .',
      drums: e1 + ' ' + eF,
    },
    // A' - hook again, syncopated second phrase
    // Dm | Dm
    V1: {
      lead: 'D5 . . Eb5 D5 . F5 . A5 . . . G5 . F5 . D5 . D5 Eb5 D5 . F5 . A5 . . . C6 . D6 .',
      harmony: 'D4 . . Eb4 D4 . F4 . A4 . . . G4 . F4 . D4 . D4 Eb4 D4 . F4 . A4 . . . C5 . D5 .',
      bass: 'D2 . D2 . D2 . D2 . D2 . D2 . D2 . D3 . D2 . D2 . D2 . D2 . D2 . D2 . D2 . F2 .',
      arp: 'D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 .',
      drums: d1c + ' ' + d1,
    },
    // Bb | C
    V2: {
      lead: 'F6 . . . D6 . Bb5 . Bb5 . A5 . G5 . F5 . E5 . G5 . C6 . . . E6 . . . D6 . C6 .',
      harmony: 'F5 . . . D5 . Bb4 . Bb4 . A4 . G4 . F4 . E4 . G4 . C5 . . . E5 . . . D5 . C5 .',
      bass: 'Bb2 . Bb2 . Bb2 . Bb2 . Bb2 . Bb2 . Bb2 . Bb3 . C3 . C3 . C3 . C3 . C3 . C3 . C3 . C3 .',
      arp: 'Bb53 . Bb53 . Bb53 . Bb53 . Bb53 . Bb53 . Bb53 . Bb53 . C53 . C53 . C53 . C53 . C53 . C53 . C53 . C53 .',
      drums: d2 + ' ' + d1,
    },
    // Dm | Gm
    V3: {
      lead: 'A5 . . A5 . . D6 . F6 . . E6 . . D6 . G5 . . Bb5 . . D6 . G6 . . F6 . . D6 .',
      harmony: 'D5 . . D5 . . G5 . Bb5 . . A5 . . G5 . C5 . . Eb5 . . G5 . C6 . . Bb5 . . G5 .',
      bass: 'D2 . D2 D2 D2 . D2 D2 D2 . D2 D2 D2 . D3 . G2 . G2 G2 G2 . G2 G2 G2 . G2 G2 G2 . G3 .',
      arp: 'D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . G53 . G53 . G53 . G53 . G53 . G53 . G53 . G53 .',
      drums: e1 + ' ' + e2,
    },
    // Eb | A5
    V4: {
      lead: 'Bb5 . . Eb6 . . G6 . F6 . . Eb6 . . Bb5 . A5 . . C6 . . E6 . E6 . . . D6 . C6 .',
      harmony: 'Eb5 . . Bb5 . . C6 . Bb5 . . Bb5 . . Eb5 . D5 . . F5 . . A5 . A5 . . . G5 . F5 .',
      bass: 'Eb2 . Eb2 Eb2 Eb2 . Eb2 Eb2 Eb2 . Eb2 Eb2 Eb2 . Eb3 . A2 . A2 A2 A2 . A2 A2 A2 . A2 A2 A2 A2 A3 .',
      arp: 'Eb53 . Eb53 . Eb53 . Eb53 . Eb53 . Eb53 . Eb53 . Eb53 . A53 . A53 . A53 . A53 . A53 . A53 . A53 . A53 .',
      drums: e1 + ' ' + dFF,
    },
    // C  - phrygian bridge (Eb against D), build
    // Eb | Dm
    C1: {
      lead: 'Bb5 . . Bb5 . . G5 . Bb5 . . Bb5 . . D6 . A5 . . A5 . . F5 . A5 . . A5 . . D6 .',
      harmony: '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -',
      bass: 'Eb2 . Eb2 . Eb2 . Eb2 . Eb2 . Eb2 . Eb2 . Eb3 . D2 . D2 . D2 . D2 . D2 . D2 . D2 . D3 .',
      arp: 'Eb53 . Eb53 . Eb53 . Eb53 . Eb53 . Eb53 . Eb53 . Eb53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 .',
      drums: c1 + ' ' + c2,
    },
    // Eb | Dm
    C2: {
      lead: 'Bb5 . . Bb5 . . G5 . Bb5 . . Bb5 . . Eb6 . D6 . . A5 . . F5 . A5 . . D6 . . F6 .',
      harmony: '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -',
      bass: 'Eb2 . Eb2 . Eb2 . Eb2 . Eb2 . Eb2 . Eb2 . Eb3 . D2 . D2 . D2 . D2 . D2 . D2 . D2 . D3 .',
      arp: 'Eb53 . Eb53 . Eb53 . Eb53 . Eb53 . Eb53 . Eb53 . Eb53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 . D53 .',
      drums: c1 + ' ' + c2,
    },
    // Cm | Bb
    C3: {
      lead: 'Eb6 . . . D6 . . . C6 . . . . . . . D6 . . . C6 . . . Bb5 . . . . . . .',
      harmony: 'G5 . . . . . . . . . . . . . . . F5 . . . . . . . . . . . . . . .',
      bass: 'C3 . C3 . C3 . C3 . C3 . C3 . C3 . C3 . Bb2 . Bb2 . Bb2 . Bb2 . Bb2 . Bb2 . Bb2 . Bb3 .',
      arp: 'C53 . C53 . C53 . C53 . C53 . C53 . C53 . C53 . Bb53 . Bb53 . Bb53 . Bb53 . Bb53 . Bb53 . Bb53 . Bb53 .',
      drums: c3 + ' ' + c3,
    },
    // Eb | A5
    C4: {
      lead: 'G5 . . . Bb5 . . . Eb6 . . . . . . . A5 C6 D6 E6 F6 E6 D6 C6 A5 . . . . . . .',
      harmony: 'Bb4 . . . . . . . G5 . . . . . . . A4 . . . . . . . . . . . . . . .',
      bass: 'Eb2 . Eb2 . Eb2 . Eb2 . Eb2 . Eb2 . Eb2 . Eb3 . A2 . A2 . A2 . A2 . A2 A2 A3 . A2 A2 A3 .',
      arp: 'Eb53 . Eb53 . Eb53 . Eb53 . Eb53 . Eb53 . Eb53 . Eb53 . A53 . . . A53 . . . A53 . . . A53 . . .',
      drums: c3 + ' ' + c4,
    },
    // B' - final chorus, parallel fifths, ends on the dominant
    // Bb | C
    D1: {
      lead: 'F5 . Bb5 . D6 . . . F6 . . . . . . . G5 . C6 . E6 . . . G6 . . . . . . .',
      harmony: 'Bb4 . Eb5 . G5 . . . Bb5 . . . . . . . C5 . F5 . A5 . . . C6 . . . . . . .',
      bass: 'Bb2 . Bb2 Bb2 Bb2 . Bb2 Bb2 Bb2 . Bb2 Bb2 Bb2 . Bb3 . C3 . C3 C3 C3 . C3 C3 C3 . C3 C3 C3 . C4 .',
      arp: 'Bb54 . Bb54 . Bb54 . Bb54 . Bb54 . Bb54 . Bb54 . Bb54 . C54 . C54 . C54 . C54 . C54 . C54 . C54 . C54 .',
      drums: e1c + ' ' + e2,
    },
    // Dm | Dm
    D2: {
      lead: 'A5 . D6 . F6 . . . D6 . . . . . . . E6 . . . D6 . . . A5 . . . . . . .',
      harmony: 'D5 . G5 . Bb5 . . . G5 . . . . . . . A5 . . . G5 . . . D5 . . . . . . .',
      bass: 'D2 . D2 D2 D2 . D2 D2 D2 . D2 D2 D2 . D3 . D2 . D2 D2 D2 . D2 D2 D2 . D2 D2 D2 . F2 .',
      arp: 'D54 . D54 . D54 . D54 . D54 . D54 . D54 . D54 . D54 . D54 . D54 . D54 . D54 . D54 . D54 . D54 .',
      drums: e2 + ' ' + e1,
    },
    // Gm | Bb
    D3: {
      lead: 'Bb5 . D6 . G6 . . . F6 . D6 . Bb5 . . . F5 . Bb5 . D6 . . . F6 . . . D6 . . .',
      harmony: 'Eb5 . G5 . C6 . . . Bb5 . G5 . Eb5 . . . Bb4 . Eb5 . G5 . . . Bb5 . . . G5 . . .',
      bass: 'G2 . G2 G2 G2 . G2 G2 G2 . G2 G2 G2 . G3 . Bb2 . Bb2 Bb2 Bb2 . Bb2 Bb2 Bb2 . Bb2 Bb2 Bb2 . Bb3 .',
      arp: 'G54 . G54 . G54 . G54 . G54 . G54 . G54 . G54 . Bb54 . Bb54 . Bb54 . Bb54 . Bb54 . Bb54 . Bb54 . Bb54 .',
      drums: e2 + ' ' + e2,
    },
    // C | A5
    D4: {
      lead: 'G5 . C6 . E6 . . . G6 . . . E6 . . . E6 . D6 . C6 . A5 . E6 . D6 . C6 . A5 .',
      harmony: 'C5 . F5 . A5 . . . C6 . . . A5 . . . A5 . G5 . F5 . D5 . A5 . G5 . F5 . D5 .',
      bass: 'C3 . C3 C3 C3 . C3 C3 C3 . C3 C3 C3 . C4 . A2 A2 A3 . A2 A2 A3 . A2 A2 A3 . A2 A2 A3 .',
      arp: 'C54 . C54 . C54 . C54 . C54 . C54 . C54 . C54 . A54 . A54 . A54 . A54 . A54 . A54 . A54 . A54 .',
      drums: e2 + ' ' + dFF,
    },
  },
  order: [
    'A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'V1', 'V2', 'V3', 'V4', 'C1', 'C2', 'C3', 'C4',
    'D1', 'D2', 'D3', 'D4',
  ],
};
