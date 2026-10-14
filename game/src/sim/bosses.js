import { bosses as bossDefs } from '../data/zones.js';
import { clamp } from '../core/mathx.js';

// VARIABLES
const tau = Math.PI * 2;
const scripts = {};

// FUNCTIONS
export function spawnBoss(world, id) {
  const def = bossDefs[id];
  const enemy = world.allocEnemy();
  const arena = world.arena;
  enemy.def = { hp: def.hp, speed: def.speed, dmg: def.dmg, radius: def.radius, xp: 0, behavior: 'boss' };
  enemy.bossDef = { ...def, id };
  enemy.type = id;
  enemy.sprite = def.sprite;
  enemy.behavior = 'boss';
  enemy.boss = true;
  enemy.x = (arena.x0 + arena.x1) / 2;
  enemy.y = arena.y0 + 60;
  enemy.r = def.radius;
  enemy.maxHp = enemy.hp = Math.round(def.hp * world.diff.eliteHp);
  enemy.speed = def.speed * world.diff.speed;
  enemy.dmg = Math.round(def.dmg * world.diff.dmg);
  enemy.mass = 100;
  enemy.spawnT = 1.2;
  enemy.noSeparate = true;
  enemy.ai = { id, phase: 1, cooldown: 2.2, seq: null, seqT: 0, stepIndex: 0, seqEnd: 0, move: 'chase', last: -1, dash: null, hopT: 0, invulnerable: false, timer: 0, enraged: false, counter: 0 };
  return enemy;
}

function startSeq(boss, steps, end) {
  const ai = boss.ai;
  ai.seq = steps;
  ai.seqT = 0;
  ai.stepIndex = 0;
  ai.seqEnd = end;
}

function runSeq(world, boss, dt) {
  const ai = boss.ai;
  if (!ai.seq) return false;
  ai.seqT += dt;
  while (ai.seq && ai.stepIndex < ai.seq.length && ai.seq[ai.stepIndex][0] <= ai.seqT) {
    const step = ai.seq[ai.stepIndex];
    ai.stepIndex++;
    step[1](world, boss);
  }
  if (ai.seq && ai.stepIndex >= ai.seq.length && ai.seqT >= ai.seqEnd) {
    ai.seq = null;
    return false;
  }
  return true;
}

function angleTo(boss, player) {
  return Math.atan2(player.y - boss.y, player.x - boss.x);
}

function fan(world, shot, x, y, angle, count, spread, dmg, options) {
  for (let i = 0; i < count; i++) {
    const a = count === 1 ? angle : angle + (i / (count - 1) - 0.5) * spread;
    world.fireBullet(shot, x, y, a, dmg, options);
  }
}

function ringShot(world, shot, x, y, count, offset, dmg, options) {
  for (let i = 0; i < count; i++) world.fireBullet(shot, x, y, offset + (i * tau) / count, dmg, options);
}

function clampToArena(world, boss) {
  const a = world.arena;
  if (!a) return false;
  const x = clamp(boss.x, a.x0 + boss.r, a.x1 - boss.r);
  const y = clamp(boss.y, a.y0 + boss.r, a.y1 - boss.r);
  const hit = x !== boss.x || y !== boss.y;
  boss.x = x;
  boss.y = y;
  return hit;
}

function moveToward(boss, x, y, speed, dt, keep = 0) {
  const dx = x - boss.x;
  const dy = y - boss.y;
  const d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (d <= keep) return;
  const step = Math.min(d - keep, speed * dt);
  boss.x += (dx / d) * step;
  boss.y += (dy / d) * step;
  if (Math.abs(dx) > 2) boss.facing = dx > 0 ? 1 : -1;
}

function randomArenaPoint(world, margin) {
  const a = world.arena;
  return { x: world.rng.range(a.x0 + margin, a.x1 - margin), y: world.rng.range(a.y0 + margin, a.y1 - margin) };
}

function updateDash(world, boss, dt) {
  const dash = boss.ai.dash;
  if (!dash) return false;
  dash.t += dt;
  const step = dash.speed * dt;
  boss.x += Math.cos(dash.angle) * step;
  boss.y += Math.sin(dash.angle) * step;
  dash.travelled += step;
  boss.facing = Math.cos(dash.angle) > 0 ? 1 : -1;
  if (dash.trail && world.rng.chance(0.5)) world.emit('dashTrail', boss.x, boss.y + boss.r * 0.6);
  const wall = clampToArena(world, boss);
  if (wall || dash.travelled >= dash.max) {
    boss.ai.dash = null;
    if (wall && dash.onWall) dash.onWall(world, boss);
    return false;
  }
  return true;
}

export function updateBoss(world, boss, dt) {
  const ai = boss.ai;
  const script = scripts[ai.id];
  if (boss.spawnT > 0) return;
  if (ai.phase === 1 && boss.hp < boss.maxHp * 0.5) {
    ai.phase = 2;
    ai.cooldown = Math.min(ai.cooldown, 0.8);
    world.emit('bossPhase', boss);
    if (script.phase2) script.phase2(world, boss);
  }
  if (updateDash(world, boss, dt)) return;
  const busy = runSeq(world, boss, dt);
  if (!busy) {
    ai.cooldown -= dt * (ai.phase === 2 ? 1.35 : 1) * (world.difficulty >= 3 ? 1.15 : 1);
    if (ai.cooldown <= 0) {
      const options = script.attacks(ai.phase);
      let index = world.rng.int(0, options.length - 1);
      if (index === ai.last && options.length > 1) index = (index + 1) % options.length;
      ai.last = index;
      options[index](world, boss);
    }
  }
  script.move(world, boss, dt, busy);
  clampToArena(world, boss);
}

scripts.kingGloop = {
  move(world, boss, dt, busy) {
    const ai = boss.ai;
    if (ai.airborne) {
      ai.airT += dt;
      if (ai.airT < 0.5) {
        boss.hopZ = Math.min(170, boss.hopZ + 420 * dt);
      } else {
        boss.x = ai.target.x;
        boss.y = ai.target.y;
        boss.hopZ = Math.max(0, 170 * (1 - (ai.airT - 0.5) / 0.7));
      }
      return;
    }
    if (busy && ai.hold) {
      boss.hopZ = 0;
      return;
    }
    ai.hopT += dt;
    const period = ai.phase === 2 ? 1.25 : 1.55;
    const t = ai.hopT % period;
    if (t < 0.6) {
      boss.hopZ = Math.sin((t / 0.6) * Math.PI) * 12;
      moveToward(boss, world.player.x, world.player.y, boss.speed * 2, dt, 12);
      ai.wasAir = true;
    } else {
      boss.hopZ = 0;
      if (ai.wasAir) {
        ai.wasAir = false;
        world.addHazard('ring', boss.x, boss.y + 6, 10, 0, 0, { grow: 90, life: 0.42, thickness: 6, fx: 'slimeWave' });
        world.emit('bossLand', boss, 0.5);
      }
    }
  },
  attacks(phase) {
    return [
      (world, boss) => {
        const ai = boss.ai;
        ai.hold = true;
        const target = { x: world.player.x, y: world.player.y };
        ai.target = target;
        startSeq(boss, [
          [0, (w, b) => {
            b.ai.airborne = true;
            b.ai.invulnerable = true;
            b.ai.airT = 0;
            w.emit('bossJump', b);
          }],
          [0.15, (w) => {
            target.x = w.player.x;
            target.y = w.player.y;
            w.addHazard('circle', target.x, target.y, 36, 1.05, Math.round(boss.dmg * 1.5), { life: 0.2, fx: 'slam' });
          }],
          [1.2, (w, b) => {
            b.x = target.x;
            b.y = target.y;
            b.ai.airborne = false;
            b.ai.invulnerable = false;
            b.hopZ = 0;
            w.addHazard('ring', b.x, b.y, 20, 0, Math.round(b.dmg * 0.6), { grow: 95, life: 0.45, thickness: 8, fx: 'slimeWave' });
            w.emit('bossLand', b, 1);
            if (b.ai.phase === 2) ringShot(w, 'slimeball', b.x, b.y, 10, w.rng.angle(), Math.round(b.dmg * 0.6));
          }],
          [1.6, (w, b) => {
            b.ai.hold = false;
          }],
        ], 1.6);
        ai.cooldown = 2.4;
      },
      (world, boss) => {
        boss.ai.hold = true;
        const volleys = boss.ai.phase === 2 ? 4 : 3;
        const steps = [];
        for (let i = 0; i < volleys; i++) {
          steps.push([0.3 + i * 0.4, (w, b) => {
            w.emit('bossShoot', b);
            if (b.ai.phase === 2 && i % 2 === 1) ringShot(w, 'slimeball', b.x, b.y, 12, w.rng.angle(), Math.round(b.dmg * 0.6));
            else fan(w, 'slimeball', b.x, b.y, angleTo(b, w.player), 5, 1.0, Math.round(b.dmg * 0.6));
          }]);
        }
        steps.push([0.4 + volleys * 0.4, (w, b) => {
          b.ai.hold = false;
        }]);
        startSeq(boss, steps, 0.5 + volleys * 0.4);
        boss.ai.cooldown = 2.2;
      },
    ];
  },
  phase2(world, boss) {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * tau;
      world.spawnEnemy('slime', boss.x + Math.cos(angle) * 30, boss.y + Math.sin(angle) * 30);
    }
  },
};

scripts.elderOak = {
  move(world, boss, dt, busy) {
    if (busy) return;
    moveToward(boss, world.player.x, world.player.y, boss.speed, dt, 50);
  },
  attacks(phase) {
    const list = [
      (world, boss) => {
        const base = angleTo(boss, world.player);
        const lines = phase === 2 ? 5 : 3;
        startSeq(boss, [
          [0, (w, b) => {
            for (let i = 0; i < lines; i++) {
              const angle = base + (i - (lines - 1) / 2) * 0.32;
              w.addHazard('line', b.x, b.y, 300, 1.0, Math.round(b.dmg * 1.1), { w: 14, angle, life: 0.35, fx: 'roots' });
            }
            w.emit('bossCast', b);
          }],
        ], 1.4);
        boss.ai.cooldown = 2.2;
      },
      (world, boss) => {
        const steps = [];
        const arms = phase === 2 ? 3 : 2;
        let angle = world.rng.angle();
        for (let i = 0; i < 20; i++) {
          steps.push([i * 0.12, (w, b) => {
            angle += 0.33;
            ringShot(w, 'acorn', b.x, b.y - 6, arms, angle, Math.round(b.dmg * 0.55));
          }]);
        }
        startSeq(boss, steps, 2.6);
        world.emit('bossCast', boss);
        boss.ai.cooldown = 2;
      },
      (world, boss) => {
        startSeq(boss, [
          [0, (w, b) => {
            w.addHazard('circle', b.x, b.y, 54, 1.0, Math.round(b.dmg * 1.3), { life: 0.25, fx: 'slam' });
            w.emit('bossCast', b);
          }],
          [1.0, (w, b) => {
            w.addHazard('ring', b.x, b.y, 54, 0, Math.round(b.dmg * 0.5), { grow: 100, life: 0.6, thickness: 8, fx: 'leafWave' });
            w.emit('bossLand', b, 1);
          }],
        ], 1.6);
        boss.ai.cooldown = 2;
      },
      (world, boss) => {
        const type = phase === 2 ? 'stump' : 'toadstool';
        const count = phase === 2 ? 4 : 5;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * tau;
          world.spawnEnemy(type, boss.x + Math.cos(angle) * 36, boss.y + Math.sin(angle) * 36);
        }
        world.emit('summon', boss);
        boss.ai.cooldown = 2.4;
      },
    ];
    if (phase === 2) {
      list.push((world, boss) => {
        const steps = [];
        for (let i = 0; i < 6; i++) {
          steps.push([i * 0.32, (w, b) => {
            const jitter = i === 0 ? 0 : 16;
            w.addHazard('circle', w.player.x + w.rng.range(-jitter, jitter), w.player.y + w.rng.range(-jitter, jitter), 20, 0.9, Math.round(b.dmg), { life: 0.25, fx: 'rootSpike' });
          }]);
        }
        startSeq(boss, steps, 2.2);
        boss.ai.cooldown = 1.8;
      });
    }
    return list;
  },
};

scripts.yeti = {
  move(world, boss, dt, busy) {
    if (busy || boss.ai.stunT > 0) {
      if (boss.ai.stunT > 0) boss.ai.stunT -= dt;
      return;
    }
    moveToward(boss, world.player.x, world.player.y, boss.speed, dt, 30);
  },
  attacks(phase) {
    return [
      (world, boss) => {
        const angle = angleTo(boss, world.player);
        startSeq(boss, [
          [0, (w, b) => {
            w.addHazard('line', b.x, b.y, 320, 0.8, 0, { w: b.r * 2, angle, life: 0.1, fx: 'charge' });
            w.emit('bossRoar', b);
          }],
          [0.85, (w, b) => {
            b.ai.dash = {
              angle, speed: 300, travelled: 0, max: 340, t: 0, trail: true,
              onWall: (w2, b2) => {
                b2.ai.stunT = 1.1;
                w2.emit('bossLand', b2, 1.2);
                const count = b2.ai.phase === 2 ? 9 : 6;
                for (let i = 0; i < count; i++) {
                  const point = randomArenaPoint(w2, 20);
                  w2.addHazard('circle', point.x, point.y, 15, 0.9 + i * 0.07, Math.round(b2.dmg * 0.8), { life: 0.2, fx: 'icicle' });
                }
              },
            };
          }],
        ], 0.9);
        boss.ai.cooldown = 1.6;
      },
      (world, boss) => {
        startSeq(boss, [
          [0.4, (w, b) => {
            w.emit('bossShoot', b);
            const angle = angleTo(b, w.player);
            w.fireBullet('bigsnowball', b.x, b.y, angle, Math.round(b.dmg), { life: 1.3, split: b.ai.phase === 2 ? 12 : 8, splitShot: 'snowball' });
          }],
        ], 1.0);
        boss.ai.cooldown = 1.8;
      },
      (world, boss) => {
        startSeq(boss, [
          [0, (w, b) => {
            w.emit('bossRoar', b);
            b.hopZ = 0;
          }],
          [0.5, (w, b) => {
            w.addHazard('ring', b.x, b.y, 16, 0, Math.round(b.dmg * 0.5), { grow: 115, life: 0.7, thickness: 8, fx: 'snowWave' });
            w.emit('bossLand', b, 1);
          }],
          [1.1, (w, b) => {
            w.addHazard('ring', b.x, b.y, 16, 0, Math.round(b.dmg * 0.5), { grow: 115, life: 0.7, thickness: 8, fx: 'snowWave' });
            w.emit('bossLand', b, 1);
          }],
        ], 1.6);
        boss.ai.cooldown = 2;
      },
      (world, boss) => {
        const steps = [];
        const rounds = phase === 2 ? 3 : 2;
        for (let i = 0; i < rounds; i++) {
          steps.push([0.3 + i * 0.45, (w, b) => {
            ringShot(w, 'icespike', b.x, b.y, 16, (i * Math.PI) / 16, Math.round(b.dmg * 0.6));
            w.emit('bossShoot', b);
          }]);
        }
        startSeq(boss, steps, 0.5 + rounds * 0.45);
        boss.ai.cooldown = 1.9;
      },
    ];
  },
};

scripts.countRatula = {
  move(world, boss, dt, busy) {
    const ai = boss.ai;
    boss.alpha = ai.invulnerable ? 0.25 : 1;
    if (busy) return;
    ai.timer += dt;
    const angle = ai.timer * 0.7;
    const x = world.player.x + Math.cos(angle) * 95;
    const y = world.player.y - 45 + Math.sin(angle * 1.3) * 25;
    moveToward(boss, x, y, boss.speed, dt);
    const dx = boss.x - world.player.x;
    const dy = boss.y - world.player.y;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    if (d < 55) {
      boss.x += (dx / d) * (55 - d) * Math.min(1, dt * 6);
      boss.y += (dy / d) * (55 - d) * Math.min(1, dt * 6);
    }
  },
  attacks(phase) {
    const list = [
      (world, boss) => {
        const point = { x: 0, y: 0 };
        startSeq(boss, [
          [0, (w, b) => {
            b.ai.invulnerable = true;
            w.emit('teleport', b.x, b.y);
          }],
          [0.45, (w, b) => {
            const angle = w.rng.angle();
            point.x = w.player.x + Math.cos(angle) * 70;
            point.y = w.player.y + Math.sin(angle) * 70;
            const a = w.arena;
            point.x = clamp(point.x, a.x0 + 20, a.x1 - 20);
            point.y = clamp(point.y, a.y0 + 20, a.y1 - 20);
            b.x = point.x;
            b.y = point.y;
            w.emit('teleport', b.x, b.y);
          }],
          [0.75, (w, b) => {
            b.ai.invulnerable = false;
            fan(w, 'bloodorb', b.x, b.y, angleTo(b, w.player), b.ai.phase === 2 ? 9 : 7, 1.3, Math.round(b.dmg * 0.6), { speed: 95 });
            w.emit('bossShoot', b);
          }],
        ], 1.2);
        boss.ai.cooldown = 1.4;
      },
      (world, boss) => {
        const steps = [];
        const count = phase === 2 ? 9 : 6;
        for (let i = 0; i < count; i++) {
          steps.push([i * 0.13, (w, b) => {
            const side = i % 2 === 0 ? 1 : -1;
            const angle = angleTo(b, w.player) + side * 0.9;
            w.fireBullet('batshot', b.x, b.y, angle, Math.round(b.dmg * 0.5), { homing: 1.0, life: 2.6 });
          }]);
        }
        startSeq(boss, steps, count * 0.11 + 0.6);
        world.emit('bossCast', boss);
        boss.ai.cooldown = 1.8;
      },
      (world, boss) => {
        const steps = [];
        const arms = phase === 2 ? 4 : 3;
        let angle = world.rng.angle();
        const direction = world.rng.chance(0.5) ? 1 : -1;
        for (let i = 0; i < 28; i++) {
          steps.push([i * 0.1, (w, b) => {
            angle += 0.21 * direction;
            ringShot(w, 'bloodorb', b.x, b.y, arms, angle, Math.round(b.dmg * 0.5));
          }]);
        }
        startSeq(boss, steps, 3.2);
        world.emit('bossCast', boss);
        boss.ai.cooldown = 1.8;
      },
      (world, boss) => {
        const count = phase === 2 ? 10 : 8;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * tau;
          world.spawnEnemy('skeleton', world.player.x + Math.cos(angle) * 95, world.player.y + Math.sin(angle) * 95);
        }
        world.emit('summon', boss);
        boss.ai.cooldown = 2.2;
      },
    ];
    if (phase === 2) {
      list.push((world, boss) => {
        const steps = [];
        for (let i = 0; i < 16; i++) {
          steps.push([i * 0.16, (w, b) => {
            const a = w.arena;
            const side = i % 4;
            let x;
            let y;
            if (side === 0) { x = w.rng.range(a.x0, a.x1); y = a.y0; } else if (side === 1) { x = a.x1; y = w.rng.range(a.y0, a.y1); } else if (side === 2) { x = w.rng.range(a.x0, a.x1); y = a.y1; } else { x = a.x0; y = w.rng.range(a.y0, a.y1); }
            const angle = Math.atan2(w.player.y - y, w.player.x - x) + w.rng.range(-0.25, 0.25);
            w.fireBullet('bloodorb', x, y, angle, Math.round(b.dmg * 0.5), { speed: 70, life: 7 });
          }]);
        }
        startSeq(boss, steps, 2.8);
        world.emit('bossCast', boss);
        boss.ai.cooldown = 1.6;
      });
    }
    return list;
  },
};

scripts.cerberus = {
  move(world, boss, dt, busy) {
    if (busy) return;
    moveToward(boss, world.player.x, world.player.y, boss.speed, dt, 40);
  },
  attacks(phase) {
    const list = [
      (world, boss) => {
        let angle = angleTo(boss, world.player);
        const steps = [[0, (w, b) => {
          angle = angleTo(b, w.player);
          w.addHazard('cone', b.x, b.y, 170, 0.75, 0, { w: 0.5, angle, life: 0.05, fx: 'fireCone' });
          b.ai.head = 0;
          w.emit('bossRoar', b);
        }]];
        for (let i = 0; i < 26; i++) {
          steps.push([0.8 + i * 0.05, (w, b) => {
            const sweep = b.ai.phase === 2 ? Math.sin(i * 0.25) * 0.5 : 0;
            w.fireBullet('firebreath', b.x, b.y, angle + sweep + w.rng.range(-0.42, 0.42), Math.round(b.dmg * 0.5), { speed: 130 + w.rng.range(-20, 20) });
          }]);
        }
        startSeq(boss, steps, 2.3);
        boss.ai.cooldown = 1.6;
      },
      (world, boss) => {
        const steps = [];
        for (let i = 0; i < 3; i++) {
          steps.push([0.3 + i * 0.35, (w, b) => {
            b.ai.head = 2;
            fan(w, 'frostshard', b.x + 10, b.y, angleTo(b, w.player), 5, 0.9, Math.round(b.dmg * 0.5));
            w.emit('bossShoot', b);
          }]);
        }
        startSeq(boss, steps, 1.5);
        boss.ai.cooldown = 1.6;
      },
      (world, boss) => {
        startSeq(boss, [[0.3, (w, b) => {
          b.ai.head = 1;
          const count = b.ai.phase === 2 ? 5 : 3;
          for (let i = 0; i < count; i++) w.fireBullet('voidorb', b.x, b.y, (i / count) * tau, Math.round(b.dmg * 0.6), { homing: 0.85, life: 5 });
          w.emit('bossCast', b);
        }]], 1.0);
        boss.ai.cooldown = 1.8;
      },
      (world, boss) => {
        const angle = angleTo(boss, world.player);
        startSeq(boss, [
          [0, (w, b) => {
            w.addHazard('line', b.x, b.y, 340, 0.75, 0, { w: b.r * 2, angle, life: 0.1, fx: 'charge' });
            w.emit('bossRoar', b);
          }],
          [0.8, (w, b) => {
            b.ai.dash = {
              angle, speed: 320, travelled: 0, max: 360, t: 0, trail: true,
              onWall: (w2, b2) => {
                w2.emit('bossLand', b2, 1.2);
                ringShot(w2, 'fireball', b2.x, b2.y, 14, w2.rng.angle(), Math.round(b2.dmg * 0.5));
              },
            };
          }],
        ], 0.85);
        boss.ai.cooldown = 1.4;
      },
    ];
    if (phase === 2) {
      list.push((world, boss) => {
        const steps = [];
        for (let i = 0; i < 12; i++) {
          steps.push([i * 0.22, (w, b) => {
            const jitter = i % 3 === 0 ? 0 : 40;
            const x = w.player.x + w.rng.range(-jitter, jitter);
            const y = w.player.y + w.rng.range(-jitter, jitter);
            w.addHazard('circle', x, y, 22, 1.0, Math.round(b.dmg * 0.9), { life: 0.25, fx: 'meteor' });
          }]);
        }
        startSeq(boss, steps, 3.4);
        world.emit('bossRoar', boss);
        boss.ai.cooldown = 1.4;
      });
      list.push((world, boss) => {
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * tau;
          world.spawnEnemy('imp', boss.x + Math.cos(angle) * 40, boss.y + Math.sin(angle) * 40);
        }
        world.emit('summon', boss);
        boss.ai.cooldown = 1.2;
      });
    }
    return list;
  },
  phase2(world, boss) {
    boss.speed *= 1.25;
  },
};
