// Zone 1 "Prado Florido" - sunny G major overworld, 132 bpm.
// Form: A (hook) / A' (variation) / B (chorus) / C (return + chorus tag, loops into A).

// VARIABLES
const crashA = 'kc . h . x . h . k . h . x . h .';
const beat = 'k . h . x . h . k . h . x . h .';
const fillS = 'k . h . x . h . k . h . s . s s';
const beatK = 'k . h . x . h . k . h k x . h .';
const fillB = 'k . h . x . x . s s s s S . S S';
const crashB = 'kc . h h s . h . k . h h s . h .';
const fullK = 'k . h h s . h . k . h k s . h .';
const full = 'k . h h s . h . k . h h s . h .';
const fillC = 'k . h h s . h . k . t . T t s S';
const chorC = 'kc . h . s . . h k . h . s . h .';
const chor = 'k . h . s . . h k . h . s . h .';
const chorB = 'k . h . s . . h k . h k s . h h';
const crashC = 'Kc . h h S . h . K . h h S . h .';
const bigC = 'K . H h S . H . K . H K S . H h';
const finalFill = 'K . H h S . H . s s s s S S T T';

export default {
  name: 'meadow',
  bpm: 132,
  stepsPerBeat: 4,
  instruments: {
    lead: { wave: 'pulse', duty: 0.25, attack: 0.008, decay: 0.12, sustain: 0.6, release: 0.03, volume: 0.23, gate: 0.9, vibrato: { depth: 0.18, rate: 5.5, delay: 0.25 }, echo: 0.2 },
    harmony: { wave: 'pulse', duty: 0.5, attack: 0.02, decay: 0.2, sustain: 0.5, release: 0.1, volume: 0.1 },
    bass: { wave: 'nesTriangle', attack: 0.004, decay: 0.08, sustain: 0.8, release: 0.025, volume: 0.4, gate: 0.85 },
    arp: { wave: 'pulse', duty: 0.25, arp: true, arpRate: 0.0568, attack: 0.004, decay: 0.12, sustain: 0.5, release: 0.05, volume: 0.085, pluck: 1.6 },
    drums: { volume: 0.3 },
  },
  patterns: {
    // A  - hook cell, rising sequence
    // G | Bm
    A1: {
      lead: 'B5 . . A5 G5 . D5 . G5 . . A5 B5 . . . D6 . . C6 B5 . F#5 . B5 . . C6 D6 . . .',
      harmony: 'D5 . . . . . . . B4 . . . . . . . D5 . . . . . . . F#5 . . . . . . .',
      bass: 'G2 . . . D3 . . . G2 . . . G2 . A2 . B2 . . . F#3 . . . B2 . . . D3 . B2 .',
      arp: '- - Gmaj4 . - - Gmaj4 . - - Gmaj4 . - - Gmaj4 . - - Bmin4 . - - Bmin4 . - - Bmin4 . - - Bmin4 .',
      drums: crashA + ' ' + beat,
    },
    // C | D
    A2: {
      lead: 'E6 . . D6 C6 . G5 . C6 . . D6 E6 . . . F#6 . . E6 D6 . A5 . D6 . . E6 F#6 . A5 .',
      harmony: 'E5 . . . . . . . G5 . . . . . . . F#5 . . . . . . . A5 . . . . . . .',
      bass: 'C3 . . . G3 . . . C3 . . . E3 . C3 . D3 . . . A2 . . . D3 . . . D3 . F#2 .',
      arp: '- - Cmaj4 . - - Cmaj4 . - - Cmaj4 . - - Cmaj4 . - - Dmaj4 . - - Dmaj4 . - - Dmaj4 . - - Dmaj4 .',
      drums: beat + ' ' + fillS,
    },
    // A  - syncopated answer
    // G | Em
    A3: {
      lead: 'G5 . . A5 . . B5 . D6 . . B5 . . G5 . E5 . . G5 . . B5 . E6 . . D6 . . B5 .',
      harmony: 'B4 . . . . . . . D5 . . . . . . . G5 . . . . . . . E5 . . . . . . .',
      bass: 'G2 . . . D3 . . . G2 . . . D3 . F#2 . E2 . . . B2 . . . E2 . . . E2 . G2 .',
      arp: '- - Gmaj4 . - - Gmaj4 . - - Gmaj4 . - - Gmaj4 . - - Emin4 . - - Emin4 . - - Emin4 . - - Emin4 .',
      drums: beat + ' ' + beatK,
    },
    // Am | D
    A4: {
      lead: 'A5 . . B5 . . C6 . E6 . . C6 . . A5 . D6 . . C6 . . A5 . F#5 . . A5 . . F#5 .',
      harmony: 'E5 . . . . . . . C5 . . . . . . . F#5 . . . . . . . A5 . . . . . . .',
      bass: 'A2 . . . E3 . . . A2 . . . A2 . C3 . D3 . D3 . A2 . A2 . D3 . D3 . F#2 . A2 .',
      arp: '- - Amin4 . - - Amin4 . - - Amin4 . - - Amin4 . - - Dmaj4 . - - Dmaj4 . - - Dmaj4 . - - Dmaj4 .',
      drums: beat + ' ' + fillB,
    },
    // A' - climbing syncopation, thirds below
    // G | Bm
    A5: {
      lead: 'G5 . . B5 . . D6 . E6 . . D6 . . B5 . D6 . . F#6 . . D6 . B5 . . A5 . . F#5 .',
      harmony: 'E5 . . G5 . . B5 . C6 . . B5 . . G5 . B5 . . D6 . . B5 . G5 . . F#5 . . D5 .',
      bass: 'G2 . G3 . G2 . G3 . G2 . G3 . G2 . A2 . B2 . B3 . B2 . B3 . B2 . B3 . D3 . B2 .',
      arp: 'Gmaj4 . . Gmaj4 . . Gmaj4 . Gmaj4 . . Gmaj4 . . Gmaj4 . Bmin4 . . Bmin4 . . Bmin4 . Bmin4 . . Bmin4 . . Bmin4 .',
      drums: crashB + ' ' + fullK,
    },
    // C | D
    A6: {
      lead: 'E6 . . G6 . . E6 . C6 . . D6 . . E6 . A5 . . D6 . . F#6 . F#6 . . E6 . . D6 .',
      harmony: 'C6 . . E6 . . C6 . A5 . . B5 . . C6 . F#5 . . B5 . . D6 . D6 . . C6 . . B5 .',
      bass: 'C3 . C4 . C3 . C4 . C3 . C4 . C3 . C3 . D3 . D4 . D3 . D4 . D3 . D4 . D3 . F#3 .',
      arp: 'Cmaj4 . . Cmaj4 . . Cmaj4 . Cmaj4 . . Cmaj4 . . Cmaj4 . Dmaj4 . . Dmaj4 . . Dmaj4 . Dmaj4 . . Dmaj4 . . Dmaj4 .',
      drums: full + ' ' + fullK,
    },
    // A' - hook cell over a descending bass
    // Em | D
    A7: {
      lead: 'E6 . . D6 B5 . G5 . B5 . . D6 E6 . . . F#6 . . E6 D6 . A5 . D6 . . E6 F#6 . . .',
      harmony: 'C6 . . B5 G5 . E5 . G5 . . B5 C6 . . . D6 . . C6 B5 . F#5 . B5 . . C6 D6 . . .',
      bass: 'E3 . E2 . E3 . E2 . E3 . E2 . E3 . D3 . D3 . D4 . D3 . D4 . D3 . D4 . D3 . C3 .',
      arp: '- - Emin4 . - - Emin4 . - - Emin4 . - - Emin4 . - - Dmaj4 . - - Dmaj4 . - - Dmaj4 . - - Dmaj4 .',
      drums: full + ' ' + fullK,
    },
    // C | D
    A8: {
      lead: 'E6 . D6 . C6 . G5 . C6 . D6 . E6 . . . D6 . C6 . A5 . F#5 . A5 . F#5 . D5 . F#5 .',
      harmony: 'C6 . B5 . A5 . E5 . A5 . B5 . C6 . . . B5 . A5 . F#5 . D5 . F#5 . D5 . B4 . D5 .',
      bass: 'C3 . C4 . C3 . C4 . C3 . C4 . C3 . C3 . D3 . D4 . D3 . D4 . A2 . D3 . F#2 . A2 .',
      arp: '- - Cmaj4 . - - Cmaj4 . - - Cmaj4 . - - Cmaj4 . - - Dmaj4 . - - Dmaj4 . - - Dmaj4 . - - Dmaj4 .',
      drums: full + ' ' + fillC,
    },
    // B  - chorus (hook cell in augmentation)
    // Em | C
    B1: {
      lead: 'B5 . . . . . A5 . G5 . . . D5 . . . G5 . . . . . A5 . B5 . . . . . . .',
      harmony: 'G5 . . . . . F#5 . E5 . . . B4 . . . E5 . . . . . F#5 . G5 . . . . . . .',
      bass: 'E2 . B2 . E3 . B2 . E2 . B2 . E2 . G2 . C3 . G3 . C4 . G3 . C3 . G3 . E3 . G3 .',
      arp: 'Emin4 . . . . . . . Emin4 . . . . . . . Cmaj4 . . . . . . . Cmaj4 . . . . . . .',
      drums: chorC + ' ' + chor,
    },
    // G | D
    B2: {
      lead: 'D6 . . . . . B5 . G5 . . . . . . . F#5 . . . . . A5 . D6 . . . . . . .',
      harmony: 'B5 . . . . . G5 . E5 . . . . . . . D5 . . . . . F#5 . B5 . . . . . . .',
      bass: 'G2 . D3 . G3 . D3 . G2 . D3 . B2 . D3 . D3 . A2 . D3 . A2 . D3 . A2 . F#3 . A3 .',
      arp: 'Gmaj4 . . . . . . . Gmaj4 . . . . . . . Dmaj4 . . . . . . . Dmaj4 . . . . . . .',
      drums: chor + ' ' + chorB,
    },
    // B  - chorus answer
    // Em | C
    B3: {
      lead: 'B5 . . . . . A5 . G5 . . . B5 . . . C6 . . . . . B5 . C6 . . . E6 . . .',
      harmony: 'G5 . . . . . F#5 . E5 . . . G5 . . . A5 . . . . . G5 . A5 . . . C6 . . .',
      bass: 'E2 . B2 . E3 . B2 . E2 . B2 . E2 . G2 . C3 . G3 . C4 . G3 . C3 . G3 . E3 . G3 .',
      arp: 'Emin4 . . . . . . . Emin4 . . . . . . . Cmaj4 . . . . . . . Cmaj4 . . . . . . .',
      drums: chor + ' ' + chorB,
    },
    // Am | D7
    B4: {
      lead: 'E6 . . . . . D6 . C6 . . . A5 . . . D6 . . . . . C6 . A5 . . . . . . .',
      harmony: 'C6 . . . . . B5 . A5 . . . F#5 . . . B5 . . . . . A5 . F#5 . . . . . . .',
      bass: 'A2 . E3 . A3 . E3 . A2 . E3 . C3 . E3 . D3 . A2 . D3 . A2 . D3 . A2 . F#3 . A3 .',
      arp: 'Amin4 . . . . . . . Amin4 . . . . . . . D74 . . . . . . . D74 . . . . . . .',
      drums: chor + ' ' + fillC,
    },
    // C  - hook returns, full band
    // G | Bm
    C1: {
      lead: 'B5 . . A5 G5 . D5 . G5 . . A5 B5 . D6 . D6 . . C6 B5 . F#5 . B5 . . C6 D6 . F#6 .',
      harmony: 'B4 . . A4 G4 . D4 . G4 . . A4 B4 . D5 . D5 . . C5 B4 . F#4 . B4 . . C5 D5 . F#5 .',
      bass: 'G2 . G2 G3 G2 . G2 G3 G2 . G2 G3 G2 . A2 . B2 . B2 B3 B2 . B2 B3 B2 . B2 B3 B2 . B2 .',
      arp: 'Gmaj4 . . Gmaj4 . . Gmaj4 . Gmaj4 . . Gmaj4 . . Gmaj4 . Bmin4 . . Bmin4 . . Bmin4 . Bmin4 . . Bmin4 . . Bmin4 .',
      drums: crashC + ' ' + bigC,
    },
    // C | D
    C2: {
      lead: 'E6 . . D6 C6 . G5 . C6 . . D6 E6 . G6 . F#6 . . E6 D6 . A5 . D6 . . E6 F#6 . A5 .',
      harmony: 'E5 . . D5 C5 . G4 . C5 . . D5 E5 . G5 . F#5 . . E5 D5 . A4 . D5 . . E5 F#5 . A4 .',
      bass: 'C3 . C3 C4 C3 . C3 C4 C3 . C3 C4 C3 . C3 . D3 . D3 D4 D3 . D3 D4 D3 . D3 D4 D3 . F#2 .',
      arp: 'Cmaj4 . . Cmaj4 . . Cmaj4 . Cmaj4 . . Cmaj4 . . Cmaj4 . Dmaj4 . . Dmaj4 . . Dmaj4 . Dmaj4 . . Dmaj4 . . Dmaj4 .',
      drums: bigC + ' ' + bigC,
    },
    // C  - chorus tag, turnaround into the loop
    // Em | C
    C3: {
      lead: 'B5 . . . . . A5 . G5 . . . D6 . . . G5 . . . . . A5 . B5 . . . D6 . . .',
      harmony: 'G5 . . . . . F#5 . E5 . . . B5 . . . E5 . . . . . F#5 . G5 . . . B5 . . .',
      bass: 'E2 . B2 . E3 . B2 . E2 . B2 . E2 . G2 . C3 . G3 . C4 . G3 . C3 . G3 . E3 . G3 .',
      arp: 'Emin4 . . . . . . . Emin4 . . . . . . . Cmaj4 . . . . . . . Cmaj4 . . . . . . .',
      drums: crashB + ' ' + chorB,
    },
    // G | D
    C4: {
      lead: 'D6 . . . . . B5 . G5 . . . B5 . . . F#5 . A5 . D6 . . . C6 . A5 . F#5 . A5 .',
      harmony: 'B5 . . . . . G5 . E5 . . . G5 . . . D5 . F#5 . B5 . . . A5 . F#5 . D5 . F#5 .',
      bass: 'G2 . D3 . G3 . D3 . G2 . D3 . B2 . D3 . D3 . D4 . D3 . D4 . A2 . D3 . F#2 . A2 .',
      arp: 'Gmaj4 . . . . . . . Gmaj4 . . . . . . . Dmaj4 . . . . . . . Dmaj4 . . . . . . .',
      drums: bigC + ' ' + finalFill,
    },
  },
  order: [
    'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4',
  ],
};
