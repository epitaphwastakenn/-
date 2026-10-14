// Zone 2 "Bosque Sussurrante" - mysterious D dorian forest groove, 116 bpm, light swing.
// Form: A (flute chant) / A' (ornamented) / B (rising line) / C (whispering tag, loops into A).

// VARIABLES
const gCr = 'kc b h b x b h b b k h b x b h b';
const gA = 'k . h h x . h . . k h h x . h .';
const gAf = 'k . h h x . h . . k h h x . t T';
const gB = 'k b h b x b h b b k h b x b h b';
const gBf = 'k b h b x b h b t . t . T . T t';
const gBld = 'k . h h x . h . . k h h x . x .';
const gC = 'k b H b x b H b b k H b x b H b';

export default {
  name: 'woods',
  bpm: 116,
  stepsPerBeat: 4,
  swing: 0.18,
  instruments: {
    lead: { wave: 'triangle', attack: 0.035, decay: 0.12, sustain: 0.75, release: 0.14, volume: 0.28, vibrato: { depth: 0.22, rate: 5, delay: 0.18 }, slide: 0.045, echo: 0.24 },
    harmony: { wave: 'pulse', duty: 0.25, attack: 0.003, decay: 0.12, sustain: 0.2, release: 0.08, volume: 0.13, pluck: 5, lowpass: 3500 },
    bass: { wave: 'nesTriangle', attack: 0.004, decay: 0.08, sustain: 0.8, release: 0.05, volume: 0.42, gate: 0.85 },
    arp: { wave: 'triangle', arp: true, arpRate: 0.2586, attack: 0.08, decay: 0.2, sustain: 0.6, release: 0.25, volume: 0.1, pluck: 0.5, vibrato: { depth: 0.12, rate: 4, delay: 0.3 } },
    drums: { volume: 0.3 },
  },
  patterns: {
    // A  - flute chant over a plucked Dm7 ostinato
    // Dm7 | G7
    A1: {
      lead: 'A4 . D5 . . . F5 . A5 . . . . . G5 . B5 . . A5 G5 . . . D5 . . . . . . .',
      harmony: 'D4 . . F4 . . A4 . C5 . A4 . F4 . D4 . G4 . . B4 . . D5 . F5 . D5 . B4 . G4 .',
      bass: 'D2 . . . E2 . . . F2 . . . A2 . . . G2 . . . A2 . . . B2 . . . D3 . . .',
      arp: 'Dm73 . . . . . . . . . . . . . . . G73 . . . . . . . . . . . . . . .',
      drums: gCr + ' ' + gA,
    },
    // Dm7 | Am7
    A2: {
      lead: 'A4 . D5 . . . F5 . A5 . . . C6 . . . B5 . A5 . E5 . . . C5 . . . . . . .',
      harmony: 'D4 . . F4 . . A4 . C5 . A4 . F4 . D4 . A4 . . C5 . . E5 . G5 . E5 . C5 . A4 .',
      bass: 'D3 . . . C3 . . . A2 . . . G2 . . . A2 . . . B2 . . . C3 . . . E3 . . .',
      arp: 'Dm73 . . . . . . . . . . . . . . . Am73 . . . . . . . . . . . . . . .',
      drums: gA + ' ' + gAf,
    },
    // Dm7 | G7
    A3: {
      lead: 'A4 . D5 . F5 . A5 . C6 . . . A5 . . . B5 . . D6 B5 . G5 . A5 . . . G5 . . .',
      harmony: 'D4 . . F4 . . A4 . C5 . A4 . F4 . D4 . G4 . . B4 . . D5 . F5 . D5 . B4 . G4 .',
      bass: 'D3 . . . C3 . . . A2 . . . F2 . . . G2 . . . B2 . . . D3 . . . E3 . . .',
      arp: 'Dm73 . . . . . . . . . . . . . . . G73 . . . . . . . . . . . . . . .',
      drums: gA + ' ' + gA,
    },
    // Fmaj7 | Cmaj7
    A4: {
      lead: 'A5 . . . . . G5 . F5 . . . E5 . . . G5 . . . E5 . . . C5 . . . . . D5 .',
      harmony: 'F4 . . A4 . . C5 . E5 . C5 . A4 . F4 . C4 . . E4 . . G4 . B4 . G4 . E4 . C4 .',
      bass: 'F3 . . . E3 . . . C3 . . . A2 . . . C3 . . . E3 . . . G3 . . . E3 . . .',
      arp: 'Fmaj3 . . . . . . . . . . . . . . . Cmaj3 . . . . . . . . . . . . . . .',
      drums: gA + ' ' + gAf,
    },
    // A' - higher, ornamented, busier bass
    // Dm7 | G7
    A5: {
      lead: 'A4 . D5 . F5 . A5 . D6 . . . C6 . A5 . B5 . . . G5 . B5 . D6 . . . . . . .',
      harmony: 'C5 . . A4 . . F4 . D4 . F4 . A4 . C5 . G4 . . B4 . . D5 . F5 . D5 . B4 . G4 .',
      bass: 'D2 . . . E2 . F2 . A2 . . . C3 . . B2 G2 . . . A2 . B2 . D3 . . . F3 . . E3',
      arp: 'Dm73 . . . . . . . . . . . . . . . G73 . . . . . . . . . . . . . . .',
      drums: gCr + ' ' + gB,
    },
    // Dm7 | Am7
    A6: {
      lead: 'C6 . . A5 F5 . . . D5 . F5 . A5 . . . E6 . . . C6 . . . B5 . . . A5 . . .',
      harmony: 'C5 . . A4 . . F4 . D4 . F4 . A4 . C5 . A4 . . C5 . . E5 . G5 . E5 . C5 . A4 .',
      bass: 'D3 . . . C3 . A2 . F2 . . . G2 . . A2 A2 . . . B2 . C3 . E3 . . . G3 . . E3',
      arp: 'Dm73 . . . . . . . . . . . . . . . Am73 . . . . . . . . . . . . . . .',
      drums: gB + ' ' + gBf,
    },
    // Dm7 | G7
    A7: {
      lead: 'A4 . D5 . . . F5 . A5 . . . . . G5 . B5 . . A5 G5 . B5 . D6 . . . B5 . . .',
      harmony: 'C5 . . A4 . . F4 . D4 . F4 . A4 . C5 . G4 . . B4 . . D5 . F5 . D5 . B4 . G4 .',
      bass: 'D3 . . . A2 . F2 . D2 . . . F2 . . A2 G2 . . . B2 . D3 . G3 . . . E3 . . D3',
      arp: 'Dm73 . . . . . . . . . . . . . . . G73 . . . . . . . . . . . . . . .',
      drums: gB + ' ' + gB,
    },
    // Fmaj7 | Cmaj7
    A8: {
      lead: 'C6 . . . A5 . . . F5 . . . A5 . . . E5 . . . G5 . . . C6 . . . . . . .',
      harmony: 'E5 . . C5 . . A4 . F4 . A4 . C5 . E5 . C4 . . E4 . . G4 . B4 . G4 . E4 . C4 .',
      bass: 'F2 . . . A2 . C3 . F3 . . . E3 . . C3 C3 . . . G2 . E3 . G3 . . . E3 . . D3',
      arp: 'Fmaj3 . . . . . . . . . . . . . . . Cmaj3 . . . . . . . . . . . . . . .',
      drums: gB + ' ' + gBf,
    },
    // B  - rising chord-tone line over Em7 F G Am
    // Em7 | Fmaj7
    B1: {
      lead: 'G5 . . . . . E5 . B5 . . . . . . . A5 . . . . . F5 . C6 . . . . . . .',
      harmony: 'E4 . G4 . B4 . D5 . B4 . G4 . B4 . G4 . F4 . A4 . C5 . E5 . C5 . A4 . C5 . A4 .',
      bass: 'E2 . . . G2 . B2 . E3 . . . D3 . . B2 F2 . . . A2 . C3 . F3 . . . E3 . . C3',
      arp: 'Em73 . . . . . . . . . . . . . . . Fmaj3 . . . . . . . . . . . . . . .',
      drums: gBld + ' ' + gBld,
    },
    // G | Am7
    B2: {
      lead: 'B5 . . . A5 . B5 . D6 . . . . . . . C6 . . . . . A5 . E6 . . . . . . .',
      harmony: 'G4 . B4 . D5 . G5 . D5 . B4 . D5 . B4 . A4 . C5 . E5 . G5 . E5 . C5 . E5 . C5 .',
      bass: 'G2 . . . B2 . D3 . G3 . . . F3 . . D3 A2 . . . C3 . E3 . A3 . . . G3 . . E3',
      arp: 'Gmaj3 . . . . . . . . . . . . . . . Am73 . . . . . . . . . . . . . . .',
      drums: gC + ' ' + gC,
    },
    // Em7 | Fmaj7
    B3: {
      lead: 'B5 . . . A5 . G5 . E5 . . . . . . . A5 . . . G5 . F5 . C5 . . . . . . .',
      harmony: 'E4 . G4 . B4 . D5 . B4 . G4 . B4 . G4 . F4 . A4 . C5 . E5 . C5 . A4 . C5 . A4 .',
      bass: 'E3 . . . D3 . B2 . G2 . . . B2 . . D3 F3 . . . E3 . C3 . A2 . . . C3 . . E3',
      arp: 'Em73 . . . . . . . . . . . . . . . Fmaj3 . . . . . . . . . . . . . . .',
      drums: gBld + ' ' + gBld,
    },
    // G | Cmaj7
    B4: {
      lead: 'G5 . . . F5 . D5 . B4 . . . . . . . E5 . . . . . G5 . C5 . . . . . - -',
      harmony: 'G4 . B4 . D5 . G5 . D5 . B4 . D5 . B4 . C4 . E4 . G4 . B4 . G4 . E4 . G4 . E4 .',
      bass: 'G2 . . . A2 . B2 . D3 . . . B2 . . G2 C3 . . . D3 . E3 . G3 . . . E3 . . C3',
      arp: 'Gmaj3 . . . . . . . . . . . . . . . Cmaj3 . . . . . . . . . . . . . . .',
      drums: gC + ' ' + 'k b H b x b H b b k H b x t T t',
    },
    // C  - whispering tag back to the loop
    // Dm7 | Dm7
    C1: {
      lead: 'D5 . . . . . . . . . E5 . F5 . . . A5 . . . . . . . G5 . . . F5 . . .',
      harmony: 'D4 . . . - - - - A4 . . . - - - - D4 . . . - - - - F4 . . . - - - -',
      bass: 'D2 . . . . . . . . . . . A2 . . . D2 . . . . . . . . . . . C3 . . .',
      arp: 'Dm73 . . . . . . . . . . . . . . . Dm73 . . . . . . . . . . . . . . .',
      drums: 'b . b . b . b . b . b . b . b . k . . . . . b . . . . . b . b .',
    },
    // Bdim | Cmaj7
    C2: {
      lead: 'F5 . . . . . . . D5 . . . . . . . E5 . . . . . . . . . . . - - - -',
      harmony: 'B3 . . . - - - - D4 . . . - - - - C4 . . . - - - - E4 . . . - - - -',
      bass: 'B2 . . . . . . . D3 . . . F3 . . . C3 . . . . . . . E3 . . . G3 . E3 .',
      arp: 'Bdim3 . . . . . . . . . . . . . . . Cmaj3 . . . . . . . . . . . . . . .',
      drums: 'b . b . b . b . b . t . T . T t t . . . . . b . T . . . b . b b',
    },
  },
  order: [
    'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2',
  ],
};
