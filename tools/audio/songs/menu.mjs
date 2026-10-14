// VARIABLES
const C = 'C3 . . . C3 . G2 . C3 . . . G2 . . .';
const G = 'G2 . . . G2 . D3 . G2 . . . D3 . . .';
const Am = 'A2 . . . A2 . E3 . A2 . . . E3 . . .';
const F = 'F2 . . . F2 . C3 . F2 . . . C3 . . .';
const beat = 'k . h . x . h . k . h . x . h h';
const beatSoft = 'k . h . . . h . k . h . x . h .';
const hold = (chord) => chord + ' . . . . . . . . . . . . . . .';

export default {
  name: 'menu',
  bpm: 96,
  stepsPerBeat: 4,
  swing: 0.12,
  instruments: {
    lead: { wave: 'pulse', duty: 0.25, attack: 0.01, decay: 0.15, sustain: 0.55, release: 0.12, volume: 0.24, vibrato: { depth: 0.2, rate: 5.5, delay: 0.2 }, echo: 0.22, slide: 0.03 },
    harmony: { wave: 'pulse', duty: 0.125, attack: 0.03, decay: 0.3, sustain: 0.4, release: 0.2, volume: 0.1 },
    bass: { wave: 'nesTriangle', attack: 0.005, decay: 0.08, sustain: 0.8, release: 0.05, volume: 0.42, gate: 0.85 },
    arp: { wave: 'triangle', arp: true, arpRate: 0.07, attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.2, volume: 0.1, pluck: 0.6 },
    drums: { volume: 0.32 },
  },
  patterns: {
    A1: {
      lead: 'E5 . . . G5 . . . C6 . B5 . G5 . . . D5 . . . G5 . . . B5 . A5 . G5 . . .',
      harmony: 'C5 . . . . . . . E5 . . . . . . . B4 . . . . . . . D5 . . . . . . .',
      bass: C + ' ' + G,
      arp: hold('Cmaj4') + ' ' + hold('Gmaj4'),
      drums: beatSoft + ' ' + beat,
    },
    A2: {
      lead: 'C5 . . . E5 . . . A5 . G5 . E5 . . . F5 . . . E5 . . . D5 . C5 . D5 . . .',
      harmony: 'A4 . . . . . . . C5 . . . . . . . A4 . . . . . . . C5 . . . . . . .',
      bass: Am + ' ' + F,
      arp: hold('Amin4') + ' ' + hold('Fmaj4'),
      drums: beat + ' ' + beat,
    },
    A3: {
      lead: 'E5 . . . G5 . . . C6 . D6 . E6 . . . D6 . . . B5 . . . G5 . A5 . B5 . . .',
      harmony: 'G4 . . . . . . . C5 . . . . . . . G4 . . . . . . . B4 . . . . . . .',
      bass: C + ' ' + G,
      arp: hold('Cmaj4') + ' ' + hold('Gmaj4'),
      drums: beat + ' ' + beat,
    },
    A4: {
      lead: 'A5 . . . G5 . . . F5 . E5 . D5 . . . E5 . . . D5 . . . B4 . . . . . . .',
      harmony: 'C5 . . . . . . . A4 . . . . . . . B4 . . . . . . . G4 . . . . . . .',
      bass: F + ' ' + G,
      arp: hold('Fmaj4') + ' ' + hold('Gmaj4'),
      drums: beat + ' k . h . x . h . k k h . x x x x',
    },
    B1: {
      lead: 'A4 . C5 . E5 . . . E5 . D5 . C5 . . . A4 . C5 . F5 . . . F5 . E5 . C5 . . .',
      harmony: 'E4 . . . . . . . C4 . . . . . . . F4 . . . . . . . A4 . . . . . . .',
      bass: Am + ' ' + F,
      arp: hold('Amin4') + ' ' + hold('Fmaj4'),
      drums: beatSoft + ' ' + beatSoft,
    },
    B2: {
      lead: 'G4 . C5 . E5 . . . G5 . E5 . C5 . . . B4 . D5 . G5 . . . F5 . E5 . D5 . . .',
      harmony: 'E4 . . . . . . . G4 . . . . . . . D4 . . . . . . . B4 . . . . . . .',
      bass: C + ' ' + G,
      arp: hold('Cmaj4') + ' ' + hold('Gmaj4'),
      drums: beatSoft + ' ' + beat,
    },
    B3: {
      lead: 'A4 . C5 . E5 . A5 . G5 . E5 . C5 . . . F5 . A5 . C6 . . . A5 . G5 . F5 . . .',
      harmony: 'C5 . . . . . . . E5 . . . . . . . A4 . . . . . . . C5 . . . . . . .',
      bass: Am + ' ' + F,
      arp: hold('Amin4') + ' ' + hold('Fmaj4'),
      drums: beat + ' ' + beat,
    },
    B4: {
      lead: 'G5 . . . F5 . . . E5 . . . D5 . . . B4 . . . C5 . . . D5 . . . . . . .',
      harmony: 'D5 . . . . . . . C5 . . . . . . . G4 . . . . . . . B4 . . . . . . .',
      bass: G + ' ' + G,
      arp: hold('Gmaj4') + ' ' + hold('G74'),
      drums: beat + ' k . h . x . h . k . x . x x x x',
    },
  },
  order: ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4'],
};
