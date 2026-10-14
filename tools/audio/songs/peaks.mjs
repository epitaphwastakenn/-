// Zone 3 "Picos Nevados" - icy E minor sprint, 142 bpm.
// Form: A (hook) / A' (higher) / B (anthem) / C (icy breakdown) / D (return + chorus tag).

// VARIABLES
const k8 = 'k . h . S . h . k . h . S . h .';
const k8F = 'k . h . S . h . s . s . s s S S';
const k16c = 'kc h h h S h h h k h h k S h h h';
const k16 = 'k h h h S h h h k h h h S h h h';
const k16k = 'k h h h S h h k k h h h S h h h';
const k16f = 'k h h h S h h h k h h h s s s s';

export default {
  name: 'peaks',
  bpm: 142,
  stepsPerBeat: 4,
  instruments: {
    lead: { wave: 'pulse', duty: 0.125, attack: 0.004, decay: 0.1, sustain: 0.55, release: 0.06, gate: 0.8, volume: 0.24, vibrato: { depth: 0.15, rate: 6, delay: 0.3 }, echo: 0.22, dutySweep: 0.12 },
    bells: { wave: 'triangle', attack: 0.002, decay: 0.2, sustain: 0.3, release: 0.15, volume: 0.13, pluck: 4.5, echo: 0.2 },
    harmony: { wave: 'saw', attack: 0.12, decay: 0.3, sustain: 0.6, release: 0.3, volume: 0.09, lowpass: 2500 },
    bass: { wave: 'nesTriangle', attack: 0.004, decay: 0.08, sustain: 0.8, release: 0.04, volume: 0.42, gate: 0.8 },
    drums: { volume: 0.33 },
  },
  patterns: {
    // A  - hook sequence over Em C G D, then run and answer
    // Em | C
    A1: {
      lead: 'E5 . B5 . . . A5 B5 E6 . . . . . D6 . C5 . G5 . . . F#5 G5 C6 . . . . . B5 .',
      bells: 'E5 G5 B5 E6 G6 E6 B5 G5 E5 B5 G5 E6 B5 G6 E6 B5 C5 E5 G5 C6 E6 C6 G5 E5 C5 G5 E5 C6 G5 E6 C6 G5',
      harmony: 'G4 . . . . . . . . . . . . . . . G4 . . . . . . . . . . . . . . .',
      bass: 'E2 . E2 . E3 . E2 . E2 . E2 . E3 . E2 . C3 . C3 . C4 . C3 . C3 . C3 . C3 . D3 .',
      drums: 'kc . h . S . h . k . h k S . h .' + ' ' + k8,
    },
    // G | D
    A2: {
      lead: 'D5 . G5 . . . F#5 G5 B5 . . . . . A5 . A5 . D6 . . . C6 D6 F#6 . . . . . E6 .',
      bells: 'G5 B5 D6 G6 D6 G6 D6 B5 G5 D6 B5 G6 D6 D6 G6 D6 D5 F#5 A5 D6 F#6 D6 A5 F#5 D5 A5 F#5 D6 A5 F#6 D6 A5',
      harmony: 'B4 . . . . . . . . . . . . . . . A4 . . . . . . . . . . . . . . .',
      bass: 'G2 . G2 . G3 . G2 . G2 . G2 . G3 . G2 . D3 . D3 . D4 . D3 . D3 . D3 . D3 . B2 .',
      drums: k8 + ' ' + 'k . h . S . h . k . h . s s s s',
    },
    // Em | C
    A3: {
      lead: 'E5 F#5 G5 A5 B5 C6 D6 - E6 . . . D6 . B5 . C6 . . . G5 . E5 . G5 . . . C6 . . .',
      bells: 'E5 G5 B5 E6 G6 E6 B5 G5 E5 B5 G5 E6 B5 G6 E6 B5 C5 E5 G5 C6 E6 C6 G5 E5 C5 G5 E5 C6 G5 E6 C6 G5',
      harmony: 'G4 . . . . . . . . . . . . . . . G4 . . . . . . . . . . . . . . .',
      bass: 'E2 . E2 . E3 . E2 . E2 . E2 . E3 . E2 . C3 . C3 . C4 . C3 . C3 . C3 . C3 . A2 .',
      drums: k8 + ' ' + 'k . h . S . h . k . h k S . h .',
    },
    // Am | Bm
    A4: {
      lead: 'A5 . C6 . E6 . . . D6 . . . C6 . B5 . B5 . . . A5 . F#5 . B5 . . . . . - -',
      bells: 'A4 C5 E5 A5 C6 A5 E5 C5 A4 E5 C5 A5 E5 C6 A5 E5 B4 D5 F#5 B5 D6 B5 F#5 D5 B4 F#5 D5 B5 F#5 D6 B5 F#5',
      harmony: 'A4 . . . . . . . . . . . . . . . B4 . . . . . . . . . . . . . . .',
      bass: 'A2 . A2 . A3 . A2 . A2 . A2 . A3 . A2 . B2 . B2 . B3 . B2 . B2 . B2 . F#2 . B2 .',
      drums: k8 + ' ' + k8F,
    },
    // A' - same changes, climbs higher
    // Em | C
    V1: {
      lead: 'E5 . B5 . . . A5 B5 E6 . . . . . D6 . C6 . E6 . . . D6 E6 G6 . . . . . E6 .',
      bells: 'E5 G5 B5 E6 G6 E6 B5 G5 B5 E6 G6 E6 B5 G5 E5 G5 C5 G5 E5 C6 G5 E6 C6 G5 E6 C6 G5 C6 E5 G5 C5 E5',
      harmony: 'B4 . . . . . . . G4 . . . . . . . G4 . . . . . . . E4 . . . . . . .',
      bass: 'E2 . E2 . E3 . E2 . E2 . E2 . E3 . E2 . C3 . C3 . C4 . C3 . C3 . C3 . C3 . D3 .',
      drums: k16c + ' ' + k16,
    },
    // G | D
    V2: {
      lead: 'B5 . D6 . . . C6 D6 G6 . . . F#6 . E6 . D6 . . . A5 . F#5 . A5 . . . D6 . . .',
      bells: 'G5 B5 D6 G6 D6 G6 D6 B5 D6 G6 D6 G6 D6 B5 G5 B5 D5 A5 F#5 D6 A5 F#6 D6 A5 F#6 D6 A5 D6 F#5 A5 D5 F#5',
      harmony: 'D5 . . . . . . . B4 . . . . . . . A4 . . . . . . . F#4 . . . . . . .',
      bass: 'G2 . G2 . G3 . G2 . G2 . G2 . G3 . G2 . D3 . D3 . D4 . D3 . D3 . D3 . D3 . B2 .',
      drums: k16k + ' ' + k16f,
    },
    // Em | D
    V3: {
      lead: 'E6 D6 C6 B5 A5 G5 F#5 - E5 . . . G5 . B5 . D5 . F#5 . A5 . D6 . F#6 . . . E6 . D6 .',
      bells: 'G6 E6 B5 E6 G5 B5 E5 G5 B5 E6 G6 E6 B5 G5 E5 G5 D5 F#5 A5 D6 F#6 D6 A5 F#5 D5 A5 F#5 D6 A5 F#6 D6 A5',
      harmony: 'G4 . . . . . . . B4 . . . . . . . A4 . . . . . . . F#4 . . . . . . .',
      bass: 'E2 . E2 . E3 . E2 . E2 . E2 . E3 . E2 . D3 . D3 . D4 . D3 . D3 . D3 . D3 . C3 .',
      drums: k16 + ' ' + k16k,
    },
    // C | Bm
    V4: {
      lead: 'C6 . B5 . A5 . G5 . E5 . . . G5 . . . B5 . . . A5 . F#5 . B5 . . . . . - -',
      bells: 'C5 G5 E5 C6 G5 E6 C6 G5 E6 C6 G5 C6 E5 G5 C5 E5 B4 D5 F#5 B5 D6 B5 F#5 D5 B4 F#5 D5 B5 F#5 D6 B5 F#5',
      harmony: 'G4 . . . . . . . E5 . . . . . . . F#5 . . . . . . . B4 . . . . . . .',
      bass: 'C3 . C3 . C4 . C3 . C3 . C3 . C4 . C3 . B2 . B2 . B3 . B2 . B2 . B2 . F#2 . B2 .',
      drums: k16 + ' ' + k16f,
    },
    // B  - stuttering anthem and climax
    // C | G
    B1: {
      lead: 'E6 . E6 . D6 . C6 . D6 . C6 . G5 . . . D6 . D6 . C6 . B5 . C6 . B5 . G5 . . .',
      bells: 'C5 G5 E5 C6 G5 E6 C6 G5 C5 E5 G5 C6 E6 C6 G5 E5 G5 D6 B5 G6 D6 D6 G6 D6 G5 B5 D6 G6 D6 G6 D6 B5',
      harmony: 'E4 . . . . . . . G4 . . . . . . . D4 . . . . . . . G4 . . . . . . .',
      bass: 'C3 . C3 . C4 . C3 . C3 . C3 . C4 . C3 . G2 . G2 . G3 . G2 . G2 . G2 . G3 . G2 .',
      drums: k16c + ' ' + k16,
    },
    // D | Em
    B2: {
      lead: 'A5 . A5 . B5 . A5 . F#5 . A5 . D6 . . . E6 . E6 . D6 . B5 . G5 . B5 . E6 . . .',
      bells: 'D5 A5 F#5 D6 A5 F#6 D6 A5 D5 F#5 A5 D6 F#6 D6 A5 F#5 E5 B5 G5 E6 B5 G6 E6 B5 E5 G5 B5 E6 G6 E6 B5 G5',
      harmony: 'F#4 . . . . . . . A4 . . . . . . . G4 . . . . . . . B4 . . . . . . .',
      bass: 'D3 . D3 . D4 . D3 . D3 . D3 . D4 . D3 . E2 . E2 . E3 . E2 . E2 . E2 . G2 . B2 .',
      drums: k16k + ' ' + k16f,
    },
    // C | G
    B3: {
      lead: 'E6 . G6 . E6 . C6 . D6 . E6 . G6 . . . D6 . B5 . G5 . B5 . D6 . . . G6 . . .',
      bells: 'C5 E5 G5 C6 E6 C6 G5 E5 E6 C6 G5 C6 E5 G5 C5 E5 G5 B5 D6 G6 D6 G6 D6 B5 D6 G6 D6 G6 B5 D6 G5 B5',
      harmony: 'G4 . . . . . . . E4 . . . . . . . D5 . . . . . . . B4 . . . . . . .',
      bass: 'C3 . C3 . C4 . C3 . C3 . C3 . C4 . C3 . G2 . G2 . G3 . G2 . G2 . G2 . G3 . G2 .',
      drums: k16 + ' ' + k16k,
    },
    // Am | Bm
    B4: {
      lead: 'E6 . C6 . A5 . C6 . E6 . . . D6 . C6 . B5 . . . A5 . F#5 . B5 . . . D6 . F#6 .',
      bells: 'A4 C5 E5 A5 C6 A5 E5 C5 C6 A5 E5 A5 C5 E5 A4 C5 B4 D5 F#5 B5 D6 B5 F#5 D5 D6 B5 F#5 B5 D5 F#5 B4 D5',
      harmony: 'C5 . . . . . . . E5 . . . . . . . D5 . . . . . . . F#5 . . . . . . .',
      bass: 'A2 . A2 . A3 . A2 . A2 . A2 . A3 . A2 . B2 . B2 . B3 . B2 . B2 . B2 . F#2 . B2 .',
      drums: k16 + ' ' + k16f,
    },
    // C  - icy breakdown and snare-roll build
    // Em | Em
    C1: {
      lead: 'B5 . . . . . . . . . . . . . . . G5 . . . . . . . B5 . . . . . . .',
      bells: 'B5 E6 G6 E6 B5 G5 E5 G5 B5 E6 G6 E6 B5 G5 E5 G5 E5 G5 B5 E6 G6 E6 B5 G5 B5 E6 G6 E6 B5 G5 E5 G5',
      harmony: 'E4 . . . . . . . . . . . . . . . E4 . . . . . . . . . . . . . . .',
      bass: 'E2 . . . E2 . . . E2 . . . E2 . . . E2 . . . E2 . . . E2 . . . E2 . . .',
      drums: 'c . . . . . . . h . h . h . h . k . . . . . h . k . . . . . h .',
    },
    // C | D
    C2: {
      lead: 'E6 . . . . . . . D6 . . . . . . . F#6 . . . . . . . A5 . . . B5 . . .',
      bells: 'C5 E5 G5 C6 E6 C6 G5 E5 G5 C6 E6 C6 G5 E5 C5 E5 D5 F#5 A5 D6 F#6 D6 A5 F#5 A5 D6 F#6 D6 A5 F#5 D5 F#5',
      harmony: 'G4 . . . . . . . . . . . . . . . A4 . . . . . . . . . . . . . . .',
      bass: 'C3 . . . C3 . . . C3 . . . C3 . . . D3 . . . D3 . . . D3 . D3 . A2 . . .',
      drums: 'k . h . s . h . k . s . s . s . s . s . s . s . s s s s S S S S',
    },
    // D  - return of the hook, chorus climax as the tag
    // Em | C
    D1: {
      lead: 'E5 . B5 . . . A5 B5 E6 . . . . . D6 . C5 . G5 . . . F#5 G5 C6 . . . . . B5 .',
      bells: 'E5 G5 B5 E6 G6 E6 B5 G5 E5 B5 G5 E6 B5 G6 E6 B5 C5 E5 G5 C6 E6 C6 G5 E5 C5 G5 E5 C6 G5 E6 C6 G5',
      harmony: 'G4 . . . . . . . . . . . . . . . G4 . . . . . . . . . . . . . . .',
      bass: 'E2 . E2 . E3 . E2 . E2 . E2 . E3 . E2 . C3 . C3 . C4 . C3 . C3 . C3 . C3 . D3 .',
      drums: k16c + ' ' + k16,
    },
    // G | D
    D2: {
      lead: 'D5 . G5 . . . F#5 G5 B5 . . . . . A5 . A5 . D6 . . . C6 D6 F#6 . . . . . E6 .',
      bells: 'G5 B5 D6 G6 D6 G6 D6 B5 G5 D6 B5 G6 D6 D6 G6 D6 D5 F#5 A5 D6 F#6 D6 A5 F#5 D5 A5 F#5 D6 A5 F#6 D6 A5',
      harmony: 'B4 . . . . . . . . . . . . . . . A4 . . . . . . . . . . . . . . .',
      bass: 'G2 . G2 . G3 . G2 . G2 . G2 . G3 . G2 . D3 . D3 . D4 . D3 . D3 . D3 . D3 . B2 .',
      drums: k16k + ' ' + k16f,
    },
    // C | G
    D3: {
      lead: 'E6 . G6 . E6 . C6 . D6 . E6 . G6 . . . D6 . B5 . G5 . B5 . D6 . . . G6 . . .',
      bells: 'C5 E5 G5 C6 E6 C6 G5 E5 E6 C6 G5 C6 E5 G5 C5 E5 G5 B5 D6 G6 D6 G6 D6 B5 D6 G6 D6 G6 B5 D6 G5 B5',
      harmony: 'G4 . . . . . . . E4 . . . . . . . D5 . . . . . . . B4 . . . . . . .',
      bass: 'C3 . C3 . C4 . C3 . C3 . C3 . C4 . C3 . G2 . G2 . G3 . G2 . G2 . G2 . G3 . G2 .',
      drums: k16 + ' ' + k16k,
    },
    // Am | Bm
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
