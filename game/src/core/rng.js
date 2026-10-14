// FUNCTIONS
export class Rng {
  constructor(seed = Date.now() >>> 0) {
    this.state = seed >>> 0;
  }

  next() {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min, max) {
    return min + (max - min) * this.next();
  }

  int(min, max) {
    return Math.floor(min + (max - min + 1) * this.next());
  }

  chance(probability) {
    return this.next() < probability;
  }

  pick(list) {
    return list[Math.floor(this.next() * list.length)];
  }

  angle() {
    return this.next() * Math.PI * 2;
  }

  weighted(entries, weightOf) {
    let total = 0;
    for (const entry of entries) total += weightOf(entry);
    if (total <= 0) return null;
    let roll = this.next() * total;
    for (const entry of entries) {
      roll -= weightOf(entry);
      if (roll <= 0) return entry;
    }
    return entries[entries.length - 1];
  }

  shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      const swap = list[i];
      list[i] = list[j];
      list[j] = swap;
    }
    return list;
  }
}

export function hash2(x, y, seed = 0) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
