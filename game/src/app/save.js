import { storageLoad, storageSave, storageRemove } from './platform.js';

// VARIABLES
const saveKey = 'purrvivors.save.v1';
const runKey = 'purrvivors.run.v1';

// FUNCTIONS
export function defaultSave() {
  return {
    version: 1,
    gold: 0,
    meta: {},
    unlocked: [],
    blueprints: [],
    characters: ['bigode'],
    character: 'bigode',
    difficulty: 0,
    difficultyUnlocked: 0,
    difficultyBeaten: -1,
    achievements: {},
    seenIntro: false,
    stats: {
      runs: 0, wins: 0, kills: 0, deaths: 0, playTime: 0, goldEarned: 0, bestTime: 0, bestLevel: 0, bestZone: 0,
      bossKills: {}, evolved: {}, fishEaten: 0, flawlessZones: 0, chests: 0, eliteKills: 0,
    },
    settings: { music: 0.7, sfx: 0.8, vibration: true, shake: true, numbers: true, lang: '', fps: 60 },
  };
}

function merge(target, source) {
  for (const key in source) {
    const value = source[key];
    if (value && typeof value === 'object' && !Array.isArray(value) && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      merge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

export function loadSave() {
  const base = defaultSave();
  const raw = storageLoad(saveKey);
  if (!raw) return base;
  try {
    return merge(base, JSON.parse(raw));
  } catch (error) {
    console.warn('save corrupted', error);
    return base;
  }
}

export function writeSave(save) {
  storageSave(saveKey, JSON.stringify(save));
}

export function loadRun() {
  const raw = storageLoad(runKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

export function writeRun(data) {
  storageSave(runKey, JSON.stringify(data));
}

export function clearRun() {
  storageRemove(runKey);
}

export function resetAll() {
  storageRemove(saveKey);
  storageRemove(runKey);
}
