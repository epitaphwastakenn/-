import { weapons as weaponDefs } from '../data/items.js';

// VARIABLES
const preferredPassives = { whetstone: 3, alarmClock: 3, magnifier: 2, cookie: 2, cardboard: 2, spellbook: 1.5, sharkTooth: 1.5, hourglass: 1.2, swiftPaws: 1.2, cushion: 1, whiskers: 0.8, feather: 0.8, clover: 0.6, luckyCoin: 0.4 };

// FUNCTIONS
export class Bot {
  constructor(world, skill = 0.7, seed = 1) {
    this.world = world;
    this.skill = skill;
    this.wanderAngle = seed;
    this.orbit = seed % 2 === 0 ? 1 : -1;
    this.retarget = 0;
    this.noiseX = 0;
    this.noiseY = 0;
  }

  update(dt) {
    const w = this.world;
    const p = w.player;
    let ax = 0;
    let ay = 0;
    const skill = this.skill;
    let cx = 0;
    let cy = 0;
    let weightSum = 0;
    let closest = Infinity;
    let closestEnemy = null;
    for (const e of w.enemies) {
      if (e.prop || e.hp <= 0 || e.boss) continue;
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const d = Math.sqrt(dx * dx + dy * dy) - e.r;
      if (d < closest) {
        closest = d;
        closestEnemy = e;
      }
      if (d > 130) continue;
      const weight = (e.elite ? 4 : 1) / Math.max(8, d);
      cx += e.x * weight;
      cy += e.y * weight;
      weightSum += weight;
      if (d < 26) {
        const push = (e.elite ? 2.5 : 1) * (26 - d) / 26 * 1.6;
        ax += (dx / (d + e.r || 1)) * push;
        ay += (dy / (d + e.r || 1)) * push;
      }
    }
    if (weightSum > 0 && !w.arena) {
      cx /= weightSum;
      cy /= weightSum;
      let rx = p.x - cx;
      let ry = p.y - cy;
      const rd = Math.sqrt(rx * rx + ry * ry) || 1;
      rx /= rd;
      ry /= rd;
      const tx = -ry * this.orbit;
      const ty = rx * this.orbit;
      let radial = 0;
      if (closest < 22) radial = 1.4;
      else if (closest < 45) radial = 0.6;
      else if (closest > 75) radial = -0.35;
      ax += tx * 1.1 + rx * radial;
      ay += ty * 1.1 + ry * radial;
      let blocked = 0;
      for (const e of w.enemies) {
        if (e.prop || e.hp <= 0) continue;
        const fx = e.x - (p.x + tx * 24);
        const fy = e.y - (p.y + ty * 24);
        if (fx * fx + fy * fy < 18 * 18) blocked++;
      }
      if (blocked >= 3) {
        this.flipT = (this.flipT || 0) + dt;
        if (this.flipT > 0.4) {
          this.orbit = -this.orbit;
          this.flipT = 0;
        }
      } else {
        this.flipT = 0;
      }
    }
    for (const b of w.bullets) {
      const fx = b.x + b.vx * 0.25;
      const fy = b.y + b.vy * 0.25;
      const dx = p.x - fx;
      const dy = p.y - fy;
      const d2 = dx * dx + dy * dy;
      if (d2 > 60 * 60) continue;
      const d = Math.sqrt(d2) || 1;
      const weight = (40 / Math.max(6, d)) * skill;
      ax += (dx / d) * weight;
      ay += (dy / d) * weight;
    }
    for (const h of w.hazards) {
      const dx = p.x - h.x;
      const dy = p.y - h.y;
      if (h.kind === 'circle' || h.kind === 'blast' || h.kind === 'cloud') {
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (d < h.r + 14) {
          const weight = 6 * skill * (h.warn > 0 ? 1 : 0.6);
          ax += (dx / d) * weight;
          ay += (dy / d) * weight;
        }
      } else if (h.kind === 'line' || h.kind === 'cone') {
        const cos = Math.cos(h.angle);
        const sin = Math.sin(h.angle);
        const along = dx * cos + dy * sin;
        const across = -dx * sin + dy * cos;
        const half = h.kind === 'line' ? h.w / 2 + 12 : Math.tan(h.w) * Math.max(10, along) + 10;
        if (along > -10 && along < h.r && Math.abs(across) < half) {
          const sign = across >= 0 ? 1 : -1;
          ax += -sin * sign * 7 * skill;
          ay += cos * sign * 7 * skill;
        }
      } else if (h.kind === 'ring') {
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (d > h.r && d - h.r < 40) {
          ax += (dx / d) * 3 * skill;
          ay += (dy / d) * 3 * skill;
        }
      }
    }
    const danger = closest < 30 ? 2 : closest < 50 ? 1 : 0;
    let gx = 0;
    let gy = 0;
    let special = null;
    let specialScore = Infinity;
    for (const item of w.pickups) {
      const dx = item.x - p.x;
      const dy = item.y - p.y;
      const d2 = dx * dx + dy * dy;
      if (item.kind === 'gem' || item.kind === 'coin') {
        if (d2 > 140 * 140) continue;
        const d = Math.sqrt(d2) || 1;
        const value = item.kind === 'coin' ? 3 : Math.min(4, 1 + item.value / 4);
        gx += (dx / d) * value / Math.max(12, d) * 12;
        gy += (dy / d) * value / Math.max(12, d) * 12;
      } else {
        let factor = 1;
        if (item.kind === 'chest' || item.kind === 'blueprint') factor = 0.2;
        else if (item.kind === 'fish') factor = p.hp < p.maxHp * 0.6 ? 0.3 : 3;
        else factor = 0.6;
        const score = d2 * factor;
        if (score < specialScore && d2 < 240 * 240) {
          specialScore = score;
          special = item;
        }
      }
    }
    const gemLength = Math.sqrt(gx * gx + gy * gy);
    if (gemLength > 0) {
      const strength = (danger === 0 ? 1.4 : danger === 1 ? 0.7 : 0.25) * (0.6 + skill * 0.6);
      ax += (gx / gemLength) * strength;
      ay += (gy / gemLength) * strength;
    }
    if (special && danger < 2) {
      const dx = special.x - p.x;
      const dy = special.y - p.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      ax += (dx / d) * 1.2;
      ay += (dy / d) * 1.2;
    } else if (!special && gemLength === 0 && !w.arena) {
      const breakable = w.enemies.find((e) => e.prop && (e.x - p.x) ** 2 + (e.y - p.y) ** 2 < 200 * 200);
      if (breakable && danger === 0) {
        const dx = breakable.x - p.x;
        const dy = breakable.y - p.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        ax += (dx / d) * 0.8;
        ay += (dy / d) * 0.8;
      }
    }
    if (w.arena) {
      const a = w.arena;
      const margin = 34;
      if (p.x - a.x0 < margin) ax += 3 * (1 - (p.x - a.x0) / margin);
      if (a.x1 - p.x < margin) ax -= 3 * (1 - (a.x1 - p.x) / margin);
      if (p.y - a.y0 < margin) ay += 3 * (1 - (p.y - a.y0) / margin);
      if (a.y1 - p.y < margin) ay -= 3 * (1 - (a.y1 - p.y) / margin);
      if (w.boss) {
        const boss = w.boss;
        const centerX = (a.x0 + a.x1) / 2;
        const centerY = (a.y0 + a.y1) / 2;
        let ox = centerX - boss.x;
        let oy = centerY - boss.y;
        const od = Math.sqrt(ox * ox + oy * oy);
        if (od < 1) {
          ox = Math.cos(this.wanderAngle);
          oy = Math.sin(this.wanderAngle);
        } else {
          ox /= od;
          oy /= od;
        }
        const radius = Math.min(a.x1 - a.x0, a.y1 - a.y0) * 0.33;
        const tx = centerX + ox * radius + -oy * radius * 0.5 * this.orbit;
        const ty = centerY + oy * radius + ox * radius * 0.5 * this.orbit;
        const dx = tx - p.x;
        const dy = ty - p.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const pull = Math.min(1, d / 30) * 2.2 * skill;
        ax += (dx / d) * pull;
        ay += (dy / d) * pull;
        const bx = p.x - boss.x;
        const by = p.y - boss.y;
        const bd = Math.sqrt(bx * bx + by * by) || 1;
        if (bd < boss.r + 40) {
          ax += (bx / bd) * 4 * skill;
          ay += (by / bd) * 4 * skill;
        }
        this.wanderAngle += dt * 0.2;
      }
    } else if (weightSum === 0) {
      this.wanderAngle += dt * 0.35;
      ax += Math.cos(this.wanderAngle) * 0.5;
      ay += Math.sin(this.wanderAngle) * 0.5;
    }
    this.retarget -= dt;
    if (this.retarget <= 0) {
      this.retarget = 0.25;
      const noise = (1 - skill) * 1.6;
      this.noiseX = (w.rng.next() - 0.5) * noise;
      this.noiseY = (w.rng.next() - 0.5) * noise;
    }
    ax += this.noiseX;
    ay += this.noiseY;
    const length = Math.sqrt(ax * ax + ay * ay);
    if (length < 0.05) {
      w.input.x = 0;
      w.input.y = 0;
    } else {
      w.input.x = ax / length;
      w.input.y = ay / length;
    }
  }

  choose(options) {
    const w = this.world;
    let best = options[0];
    let bestScore = -Infinity;
    for (const option of options) {
      let score = 0;
      if (option.type === 'evolution') score = 100;
      else if (option.type === 'weapon') {
        const owned = w.weapons.find((x) => x.id === option.id);
        if (owned) score = 10 + owned.level * 2;
        else score = w.weapons.length < 4 ? 13 : 6;
      } else if (option.type === 'passive') {
        const paired = w.weapons.some((x) => !x.evolved && weaponDefs[x.id].pair === option.id);
        score = (paired ? 9 : 4) + (preferredPassives[option.id] || 1) * 2;
      } else if (option.type === 'heal') {
        score = w.player.hp < w.player.maxHp * 0.5 ? 20 : 1;
      } else {
        score = 2;
      }
      score += w.rng.next() * 3 * (1.2 - this.skill);
      if (score > bestScore) {
        bestScore = score;
        best = option;
      }
    }
    return best;
  }

  chooseBlessing(options) {
    const w = this.world;
    if (w.player.hp < w.player.maxHp * 0.5 && options.includes('feast')) return 'feast';
    const order = ['strength', 'training', 'toughness', 'focus', 'chest', 'feast', 'swiftness', 'fortune', 'rerolls', 'treasure'];
    for (const id of order) if (options.includes(id)) return id;
    return options[0];
  }
}
