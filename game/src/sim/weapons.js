import { weapons as weaponDefs, evolutions, weaponStats } from '../data/items.js';

// VARIABLES
const tau = Math.PI * 2;
const handlers = {};
const projectileUpdaters = {};

// FUNCTIONS
export function makeProjectile() {
  return {
    kind: '', slot: -1, x: 0, y: 0, vx: 0, vy: 0, r: 4, dmg: 0, pierce: -1, life: 0, maxLife: 0, age: 0, rot: 0, spin: 0,
    scale: 1, knockback: 0, hitMap: new Map(), hitInterval: 0, tx: 0, ty: 0, sx: 0, sy: 0, angle: 0, length: 0, width: 0,
    speed: 0, target: null, targetId: 0, evo: false, critBonus: 0, bounces: 0, returning: false, travelled: 0, maxDist: 0,
    color: 0, delay: 0, blast: 0, freeze: 0, freezeTime: 0, pull: 0, tick: 0, tickT: 0, variant: 0, dead: false, extra: 0,
    started: false, extraZ: 0,
  };
}

function rawStats(w) {
  return w.evolved ? evolutions[weaponDefs[w.id].evolution].stats : weaponStats(w.id, w.level);
}

function eff(world, w) {
  const base = rawStats(w);
  const s = world.stats;
  return {
    dmg: base.dmg * s.might,
    cd: (base.cd || 0) * s.cooldown,
    amount: (base.amount || 0) + s.amount,
    area: (base.area || 1) * s.area,
    speed: (base.speed || 0) * s.projSpeed,
    duration: (base.duration || 0) * s.duration,
    pierce: base.pierce === undefined ? -1 : base.pierce,
    knockback: base.knockback || 0,
    raw: base,
  };
}

export function resetWeaponState(world, w) {
  w.t = 0.4;
  w.state = { angle: 0, active: false, activeT: 0, sweepT: 2, novaT: 3, drones: [], ghosts: [], orbs: [], spin: 0, radius: 0, healKills: 0 };
  if (w.id === 'frost' && w.evolved) world.frozenBonus = evolutions.iceAge.stats.frozenBonus;
}

function spawn(world, kind, slot, x, y) {
  const p = world.projectilePool.pop() || makeProjectile();
  p.kind = kind;
  p.slot = slot;
  p.x = x;
  p.y = y;
  p.vx = 0;
  p.vy = 0;
  p.r = 4;
  p.dmg = 0;
  p.pierce = -1;
  p.life = 1;
  p.maxLife = 1;
  p.age = 0;
  p.rot = 0;
  p.spin = 0;
  p.scale = 1;
  p.knockback = 0;
  p.hitMap.clear();
  p.hitInterval = 0;
  p.target = null;
  p.targetId = 0;
  p.evo = false;
  p.critBonus = 0;
  p.bounces = 0;
  p.returning = false;
  p.travelled = 0;
  p.delay = 0;
  p.blast = 0;
  p.freeze = 0;
  p.pull = 0;
  p.tick = 0;
  p.tickT = 0;
  p.variant = 0;
  p.dead = false;
  p.extra = 0;
  p.started = false;
  p.extraZ = 0;
  world.projectiles.push(p);
  return p;
}

function setLife(p, life) {
  p.life = life;
  p.maxLife = life;
}

function nearestEnemy(world, x, y, maxDist, skip) {
  let best = null;
  let bestD = maxDist * maxDist;
  for (const e of world.enemies) {
    if (e.hp <= 0 || e.prop) continue;
    if (skip && skip.has(e.id)) continue;
    const d = (e.x - x) * (e.x - x) + (e.y - y) * (e.y - y);
    if (d < bestD) {
      bestD = d;
      best = e;
    }
  }
  return best;
}

function nearestEnemies(world, x, y, count, maxDist) {
  const list = [];
  const max2 = maxDist * maxDist;
  for (const e of world.enemies) {
    if (e.hp <= 0 || e.prop) continue;
    const d = (e.x - x) * (e.x - x) + (e.y - y) * (e.y - y);
    if (d > max2) continue;
    if (list.length < count) {
      list.push({ e, d });
      list.sort((a, b) => a.d - b.d);
    } else if (d < list[list.length - 1].d) {
      list[list.length - 1] = { e, d };
      list.sort((a, b) => a.d - b.d);
    }
  }
  return list.map((item) => item.e);
}

function enemiesInView(world, margin = 0) {
  const halfW = world.viewW / 2 + margin;
  const halfH = world.viewH / 2 + margin;
  const result = [];
  for (const e of world.enemies) {
    if (e.hp <= 0 || e.prop) continue;
    if (Math.abs(e.x - world.camX) < halfW && Math.abs(e.y - world.camY) < halfH) result.push(e);
  }
  return result;
}

function viewBounds(world) {
  if (world.arena) return world.arena;
  return { x0: world.camX - world.viewW / 2, x1: world.camX + world.viewW / 2, y0: world.camY - world.viewH / 2, y1: world.camY + world.viewH / 2 };
}

function canHit(world, p, e) {
  const until = p.hitMap.get(e.id);
  if (until === undefined) return true;
  return p.hitInterval > 0 && world.time >= until;
}

function markHit(world, p, e) {
  p.hitMap.set(e.id, p.hitInterval > 0 ? world.time + p.hitInterval : Infinity);
}

function knockFrom(p, e) {
  if (p.vx !== 0 || p.vy !== 0) return { kx: p.vx, ky: p.vy };
  return { kx: e.x - p.x, ky: e.y - p.y };
}

function hitWith(world, p, e, damage) {
  const dir = knockFrom(p, e);
  return world.damageEnemy(e, damage === undefined ? p.dmg : damage, p.slot, { knockback: p.knockback, kx: dir.kx, ky: dir.ky, critBonus: p.critBonus });
}

function collide(world, p, onHit) {
  let stop = false;
  world.grid.query(p.x, p.y, p.r + 28, (e) => {
    if (e.hp <= 0) return false;
    const dx = e.x - p.x;
    const dy = e.y - p.y;
    const rr = p.r + e.r;
    if (dx * dx + dy * dy > rr * rr) return false;
    if (!canHit(world, p, e)) return false;
    markHit(world, p, e);
    if (onHit) onHit(e);
    else hitWith(world, p, e);
    if (p.pierce > 0) {
      p.pierce--;
      if (p.pierce === 0) {
        stop = true;
        return true;
      }
    }
    return false;
  });
  return stop;
}

function areaDamage(world, slot, x, y, radius, damage, options = {}) {
  let hits = 0;
  world.grid.query(x, y, radius + 28, (e) => {
    if (e.hp <= 0) return false;
    const dx = e.x - x;
    const dy = e.y - y;
    const rr = radius + e.r;
    if (dx * dx + dy * dy > rr * rr) return false;
    if (options.gate !== undefined) {
      if (e.hitCds[options.gate] > world.time) return false;
      e.hitCds[options.gate] = world.time + options.interval;
    }
    world.damageEnemy(e, damage, slot, { knockback: options.knockback || 0, kx: dx, ky: dy, critBonus: options.critBonus || 0 });
    if (options.slow) {
      const current = e.slowT > 0 ? e.slowAmt : 0;
      e.slowAmt = Math.max(current, options.slow);
      e.slowT = 0.6;
    }
    if (options.onHit) options.onHit(e);
    hits++;
    return false;
  });
  return hits;
}

function explode(world, slot, x, y, radius, damage, knockback, style) {
  areaDamage(world, slot, x, y, radius, damage, { knockback });
  world.emit('explosion', x, y, radius, style);
}

export function updateWeapons(world, dt) {
  for (const w of world.weapons) {
    const handler = handlers[w.id];
    if (handler) handler(world, w, dt);
  }
}

export function updateProjectiles(world, dt) {
  const list = world.projectiles;
  for (let i = list.length - 1; i >= 0; i--) {
    const p = list[i];
    if (p.delay > 0) {
      p.delay -= dt;
      if (p.delay > 0) continue;
    }
    if (!p.started) {
      p.started = true;
      const starter = projectileUpdaters[p.kind + 'Start'];
      if (starter) starter(world, p);
    }
    p.age += dt;
    p.life -= dt;
    const updater = projectileUpdaters[p.kind];
    if (updater) updater(world, p, dt);
    if (p.life <= 0 || p.dead) {
      const ender = projectileUpdaters[p.kind + 'End'];
      if (ender && !p.dead) ender(world, p);
      list[i] = list[list.length - 1];
      list.pop();
      world.projectilePool.push(p);
    }
  }
}

handlers.claw = (world, w, dt) => {
  w.t -= dt;
  if (w.t > 0) return;
  const s = eff(world, w);
  w.t = s.cd;
  const player = world.player;
  const radius = 30 * s.area;
  const aim = nearestEnemy(world, player.x, player.y, radius + 50);
  const base = aim ? Math.atan2(aim.y - player.y, aim.x - player.x) : Math.atan2(player.facingY, player.facingX);
  const angles = [];
  if (w.evolved) {
    for (let i = 0; i < 4; i++) angles.push(base + Math.PI / 4 + (i * Math.PI) / 2);
  } else {
    for (let i = 0; i < s.amount; i++) angles.push(base + (i * tau) / s.amount);
  }
  const halfArc = w.evolved ? 0.95 : 1.25;
  angles.forEach((angle, index) => {
    const fx = spawn(world, 'slash', w.slot, player.x, player.y);
    fx.rot = angle;
    fx.scale = radius / 30;
    fx.evo = w.evolved;
    fx.variant = index % 2;
    fx.delay = index * 0.06;
    fx.r = radius;
    fx.dmg = s.dmg;
    fx.knockback = s.knockback;
    fx.angle = halfArc;
    fx.critBonus = w.evolved ? s.raw.critBonus : 0;
    fx.extra = w.evolved ? s.raw.bleed : 0;
    setLife(fx, 0.2);
  });
  world.emit('sfx', 'claw');
};

projectileUpdaters.slashStart = (world, p) => {
  const player = world.player;
  p.x = player.x;
  p.y = player.y;
  const arc = p.angle;
  world.grid.query(p.x, p.y, p.r + 28, (e) => {
    if (e.hp <= 0) return false;
    const dx = e.x - p.x;
    const dy = e.y - p.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > p.r + e.r) return false;
    let diff = Math.atan2(dy, dx) - p.rot;
    while (diff > Math.PI) diff -= tau;
    while (diff < -Math.PI) diff += tau;
    if (Math.abs(diff) > arc && d > e.r + 6) return false;
    world.damageEnemy(e, p.dmg, p.slot, { knockback: p.knockback, kx: dx, ky: dy, critBonus: p.critBonus });
    if (p.extra > 0 && e.hp > 0) {
      e.bleedT = 2;
      e.bleedDps = (p.dmg * p.extra) / 2;
      e.bleedSlot = p.slot;
    }
    return false;
  });
};

projectileUpdaters.slash = (world, p) => {
  p.x = world.player.x;
  p.y = world.player.y;
};

handlers.yarn = (world, w, dt) => {
  w.t -= dt;
  if (w.t > 0) return;
  const s = eff(world, w);
  w.t = s.cd;
  const player = world.player;
  for (let i = 0; i < s.amount; i++) {
    const angle = world.rng.angle();
    const p = spawn(world, 'yarn', w.slot, player.x, player.y);
    p.vx = Math.cos(angle) * s.speed;
    p.vy = Math.sin(angle) * s.speed;
    p.r = 5 * s.area;
    p.scale = s.area;
    p.dmg = s.dmg;
    p.knockback = s.knockback;
    p.hitInterval = 0.35;
    p.evo = w.evolved;
    p.extra = w.evolved ? s.raw.splitDmg * world.stats.might : 0;
    p.variant = i;
    setLife(p, s.duration);
  }
  world.emit('sfx', 'yarn');
};

function bounceInBounds(world, p) {
  const b = viewBounds(world);
  let bounced = false;
  if (p.x < b.x0 + p.r && p.vx < 0) {
    p.vx = -p.vx;
    bounced = true;
  } else if (p.x > b.x1 - p.r && p.vx > 0) {
    p.vx = -p.vx;
    bounced = true;
  }
  if (p.y < b.y0 + p.r && p.vy < 0) {
    p.vy = -p.vy;
    bounced = true;
  } else if (p.y > b.y1 - p.r && p.vy > 0) {
    p.vy = -p.vy;
    bounced = true;
  }
  return bounced;
}

projectileUpdaters.yarn = (world, p, dt) => {
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.rot += (p.vx > 0 ? 1 : -1) * 8 * dt;
  bounceInBounds(world, p);
  collide(world, p, (e) => {
    hitWith(world, p, e);
    const nx = p.x - e.x;
    const ny = p.y - e.y;
    const n = Math.sqrt(nx * nx + ny * ny) || 1;
    const dot = (p.vx * nx + p.vy * ny) / n;
    if (dot < 0) {
      p.vx -= (2 * dot * nx) / n;
      p.vy -= (2 * dot * ny) / n;
    }
    world.emit('sfx', 'bounce');
    if (p.evo && world.projectiles.length < 380) {
      let minis = 0;
      for (const other of world.projectiles) if (other.kind === 'yarnMini') minis++;
      if (minis < 36) {
        const angle = world.rng.angle();
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const mini = spawn(world, 'yarnMini', p.slot, p.x, p.y);
        mini.vx = Math.cos(angle) * speed;
        mini.vy = Math.sin(angle) * speed;
        mini.r = 3.5;
        mini.dmg = p.extra;
        mini.hitInterval = 0.3;
        mini.variant = world.rng.int(0, 3);
        setLife(mini, 0.9);
      }
    }
  });
};

projectileUpdaters.yarnMini = (world, p, dt) => {
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.rot += 10 * dt;
  bounceInBounds(world, p);
  collide(world, p);
};

handlers.laser = (world, w, dt) => {
  const s = eff(world, w);
  const player = world.player;
  if (w.evolved) {
    w.state.sweepT -= dt;
    if (w.state.sweepT <= 0) {
      w.state.sweepT = s.raw.sweepCd * world.stats.cooldown;
      const p = spawn(world, 'sweep', w.slot, player.x, player.y);
      p.angle = world.rng.angle();
      p.length = 150 * s.area;
      p.width = 10 * s.area;
      p.dmg = s.raw.sweepDmg * world.stats.might;
      p.hitInterval = 0.25;
      setLife(p, 1.6);
      world.emit('sfx', 'orbital');
    }
  }
  w.t -= dt;
  if (w.t > 0) return;
  const targets = nearestEnemies(world, player.x, player.y, s.amount, 230);
  if (targets.length === 0) {
    w.t = 0.25;
    return;
  }
  w.t = s.cd;
  const length = 250;
  const width = 4 * s.area;
  for (let i = 0; i < s.amount; i++) {
    const target = targets[i % targets.length];
    let angle = Math.atan2(target.y - player.y, target.x - player.x);
    if (i >= targets.length) angle += (i - targets.length + 1) * 0.5;
    beamDamage(world, w.slot, player.x, player.y, angle, length, width, s.dmg, 25);
    const fx = spawn(world, 'beam', w.slot, player.x, player.y);
    fx.angle = angle;
    fx.length = length;
    fx.width = width;
    fx.evo = w.evolved;
    setLife(fx, 0.22);
  }
  world.emit('sfx', 'laser');
};

function beamDamage(world, slot, x, y, angle, length, width, damage, knockback, gate, interval) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  for (const e of world.enemies) {
    if (e.hp <= 0) continue;
    const dx = e.x - x;
    const dy = e.y - y;
    const along = dx * cos + dy * sin;
    if (along < -e.r || along > length + e.r) continue;
    const across = Math.abs(-dx * sin + dy * cos);
    if (across > width / 2 + e.r) continue;
    if (gate !== undefined) {
      if (e.hitCds[gate] > world.time) continue;
      e.hitCds[gate] = world.time + interval;
    }
    world.damageEnemy(e, damage, slot, { knockback, kx: cos, ky: sin });
  }
}

projectileUpdaters.beam = (world, p) => {
  p.x = world.player.x;
  p.y = world.player.y;
};

projectileUpdaters.sweep = (world, p, dt) => {
  p.x = world.player.x;
  p.y = world.player.y;
  p.angle += (tau / 1.6) * dt;
  beamDamage(world, p.slot, p.x, p.y, p.angle, p.length, p.width * 2, p.dmg, 40, p.slot + 6, p.hitInterval);
};

handlers.fish = (world, w, dt) => {
  w.t -= dt;
  if (w.t > 0) return;
  const s = eff(world, w);
  w.t = s.cd;
  const player = world.player;
  const target = nearestEnemy(world, player.x, player.y, 260);
  const base = target ? Math.atan2(target.y - player.y, target.x - player.x) : Math.atan2(player.facingY, player.facingX);
  const spread = w.evolved ? tau / s.amount : 0.4;
  for (let i = 0; i < s.amount; i++) {
    const angle = w.evolved ? base + i * spread : base + (i - (s.amount - 1) / 2) * spread;
    const p = spawn(world, 'boomerang', w.slot, player.x, player.y);
    p.angle = angle;
    p.speed = s.speed;
    p.vx = Math.cos(angle) * s.speed;
    p.vy = Math.sin(angle) * s.speed;
    p.maxDist = (w.evolved ? 150 : 110) * Math.sqrt(s.area);
    p.r = (w.evolved ? 9 : 6) * s.area;
    p.scale = s.area;
    p.dmg = s.dmg;
    p.knockback = s.knockback;
    p.evo = w.evolved;
    p.hitInterval = 0;
    setLife(p, 6);
  }
  world.emit('sfx', 'throw');
};

projectileUpdaters.boomerang = (world, p, dt) => {
  const player = world.player;
  p.rot += 14 * dt;
  if (!p.returning) {
    const progress = Math.min(1, p.travelled / p.maxDist);
    const speed = p.speed * Math.max(0.12, Math.sqrt(1 - progress));
    if (p.evo) p.angle += 2.4 * dt;
    p.vx = Math.cos(p.angle) * speed;
    p.vy = Math.sin(p.angle) * speed;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.travelled += speed * dt;
    if (progress >= 0.98) {
      p.returning = true;
      p.hitMap.clear();
      p.travelled = 0;
    }
  } else {
    const dx = player.x - p.x;
    const dy = player.y - p.y;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    p.travelled += dt;
    const speed = Math.min(p.speed * 1.35, 40 + p.travelled * p.speed * 2.2);
    p.vx = (dx / d) * speed;
    p.vy = (dy / d) * speed;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (d < 10) p.dead = true;
  }
  collide(world, p);
};

handlers.catnip = (world, w, dt) => {
  const s = eff(world, w);
  const radius = 34 * s.area;
  w.state.radius = radius;
  const player = world.player;
  if (w.evolved) {
    for (const item of world.pickups) {
      if (item.kind !== 'gem' || item.magnet) continue;
      if ((item.x - player.x) ** 2 + (item.y - player.y) ** 2 < radius * radius) item.magnet = true;
    }
  }
  w.t -= dt;
  if (w.t > 0) return;
  w.t = s.raw.tick * world.stats.cooldown;
  w.state.pulse = 1;
  areaDamage(world, w.slot, player.x, player.y, radius, s.dmg, { slow: s.raw.slow, knockback: w.evolved ? s.knockback : 0 });
};

handlers.orbs = (world, w, dt) => {
  const s = eff(world, w);
  const player = world.player;
  const state = w.state;
  const orbRadius = 6 * s.area;
  state.orbs.length = 0;
  if (w.evolved) {
    state.angle += s.speed * dt;
    const inner = s.amount;
    const outer = s.raw.outer + world.stats.amount;
    for (let i = 0; i < inner; i++) {
      const angle = state.angle + (i * tau) / inner;
      state.orbs.push({ x: player.x + Math.cos(angle) * 40 * s.area, y: player.y + Math.sin(angle) * 40 * s.area, ring: 0 });
    }
    for (let i = 0; i < outer; i++) {
      const angle = -state.angle * 0.8 + (i * tau) / outer;
      state.orbs.push({ x: player.x + Math.cos(angle) * 72 * s.area, y: player.y + Math.sin(angle) * 72 * s.area, ring: 1 });
    }
  } else {
    if (state.active) {
      state.activeT -= dt;
      state.angle += s.speed * dt;
      if (state.activeT <= 0) {
        state.active = false;
        w.t = s.cd;
      }
    } else {
      w.t -= dt;
      if (w.t <= 0) {
        state.active = true;
        state.activeT = s.duration;
        world.emit('sfx', 'orbs');
      }
    }
    if (!state.active) return;
    for (let i = 0; i < s.amount; i++) {
      const angle = state.angle + (i * tau) / s.amount;
      state.orbs.push({ x: player.x + Math.cos(angle) * 40 * s.area, y: player.y + Math.sin(angle) * 40 * s.area, ring: 0 });
    }
  }
  for (const orb of state.orbs) {
    areaDamage(world, w.slot, orb.x, orb.y, orbRadius, s.dmg, { gate: w.slot, interval: 0.5, knockback: s.knockback });
  }
};

handlers.bell = (world, w, dt) => {
  w.t -= dt;
  if (w.t > 0) return;
  const candidates = enemiesInView(world, -6);
  if (candidates.length === 0) {
    w.t = 0.3;
    return;
  }
  const s = eff(world, w);
  w.t = s.cd;
  world.rng.shuffle(candidates);
  const radius = 14 * s.area;
  for (let i = 0; i < s.amount; i++) {
    const target = candidates[i % candidates.length];
    const x = target.x + (i >= candidates.length ? world.rng.range(-20, 20) : 0);
    const y = target.y + (i >= candidates.length ? world.rng.range(-20, 20) : 0);
    areaDamage(world, w.slot, x, y, radius, s.dmg, { knockback: 10 });
    const fx = spawn(world, 'bolt', w.slot, x, y);
    fx.scale = s.area;
    fx.variant = world.rng.int(0, 2);
    setLife(fx, 0.3);
    if (w.evolved) {
      const hit = new Set([target.id]);
      let from = target;
      let damage = s.dmg;
      for (let c = 0; c < s.raw.chains; c++) {
        const next = nearestEnemy(world, from.x, from.y, 70, hit);
        if (!next) break;
        hit.add(next.id);
        damage *= 0.85;
        world.damageEnemy(next, damage, w.slot, { knockback: 8 });
        const chain = spawn(world, 'chain', w.slot, from.x, from.y);
        chain.tx = next.x;
        chain.ty = next.y;
        setLife(chain, 0.25);
        from = next;
      }
    }
  }
  world.emit('sfx', 'thunder');
};

handlers.milk = (world, w, dt) => {
  w.t -= dt;
  if (w.t > 0) return;
  const s = eff(world, w);
  w.t = s.cd;
  const player = world.player;
  const near = nearestEnemies(world, player.x, player.y, 10, 140);
  for (let i = 0; i < s.amount; i++) {
    let tx;
    let ty;
    if (near.length > 0) {
      const target = near[world.rng.int(0, near.length - 1)];
      tx = target.x;
      ty = target.y;
    } else {
      const angle = world.rng.angle();
      tx = player.x + Math.cos(angle) * 60;
      ty = player.y + Math.sin(angle) * 60;
    }
    const p = spawn(world, 'lob', w.slot, player.x, player.y);
    p.sx = player.x;
    p.sy = player.y;
    p.tx = tx;
    p.ty = ty;
    p.dmg = s.dmg;
    p.scale = s.area;
    p.evo = w.evolved;
    p.extra = s.duration;
    p.pull = w.evolved ? s.raw.pull : 0;
    p.delay = i * 0.08;
    setLife(p, 0.5);
  }
  world.emit('sfx', 'throw');
};

projectileUpdaters.lob = (world, p) => {
  const t = 1 - p.life / p.maxLife;
  p.x = p.sx + (p.tx - p.sx) * t;
  p.y = p.sy + (p.ty - p.sy) * t;
  p.extraZ = Math.sin(t * Math.PI) * 26;
  p.rot += 0.3;
};

projectileUpdaters.lobEnd = (world, p) => {
  const puddle = spawn(world, p.evo ? 'galaxy' : 'puddle', p.slot, p.tx, p.ty);
  puddle.r = (p.evo ? 22 : 22) * p.scale;
  puddle.scale = p.scale;
  puddle.dmg = p.dmg;
  puddle.hitInterval = 0.35;
  puddle.pull = p.pull;
  puddle.evo = p.evo;
  setLife(puddle, p.extra);
  world.emit('sfx', 'splash');
  world.emit('splash', p.tx, p.ty, puddle.r, p.evo);
};

projectileUpdaters.puddle = (world, p) => {
  collide(world, p);
};

projectileUpdaters.galaxy = (world, p, dt) => {
  const reach = p.r * 1.6;
  world.grid.query(p.x, p.y, reach + 20, (e) => {
    if (e.hp <= 0 || e.boss || e.prop) return false;
    const dx = p.x - e.x;
    const dy = p.y - e.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > reach || d < 2) return false;
    const strength = (e.elite ? 0.25 : 1) * p.pull * dt;
    e.x += (dx / d) * strength;
    e.y += (dy / d) * strength;
    return false;
  });
  p.rot += 2 * dt;
  collide(world, p);
};

handlers.cranes = (world, w, dt) => {
  w.t -= dt;
  if (w.t > 0) return;
  const s = eff(world, w);
  const player = world.player;
  const targets = nearestEnemies(world, player.x, player.y, w.evolved ? 6 : s.amount, 220);
  if (targets.length === 0) {
    w.t = 0.2;
    return;
  }
  w.t = s.cd;
  const count = w.evolved ? 1 + Math.floor(world.stats.amount / 2) : s.amount;
  for (let i = 0; i < count; i++) {
    const target = w.evolved ? targets[world.rng.int(0, targets.length - 1)] : targets[i % targets.length];
    const angle = Math.atan2(target.y - player.y, target.x - player.x) + world.rng.range(-0.6, 0.6);
    const p = spawn(world, 'crane', w.slot, player.x, player.y);
    p.speed = s.speed;
    p.vx = Math.cos(angle) * s.speed;
    p.vy = Math.sin(angle) * s.speed;
    p.target = target;
    p.targetId = target.id;
    p.r = 5;
    p.dmg = s.dmg;
    p.pierce = s.pierce;
    p.knockback = s.knockback;
    p.evo = w.evolved;
    p.blast = w.evolved ? s.raw.blast : 0;
    p.variant = world.rng.int(0, 2);
    setLife(p, 3);
  }
  world.emit('sfx', 'crane');
};

projectileUpdaters.crane = (world, p, dt) => {
  if (!p.target || p.target.hp <= 0 || p.target.id !== p.targetId) {
    const next = nearestEnemy(world, p.x, p.y, 220);
    p.target = next;
    p.targetId = next ? next.id : 0;
  }
  if (p.target) {
    const desired = Math.atan2(p.target.y - p.y, p.target.x - p.x);
    const current = Math.atan2(p.vy, p.vx);
    let diff = desired - current;
    while (diff > Math.PI) diff -= tau;
    while (diff < -Math.PI) diff += tau;
    const turn = Math.max(-6 * dt, Math.min(6 * dt, diff));
    p.vx = Math.cos(current + turn) * p.speed;
    p.vy = Math.sin(current + turn) * p.speed;
  }
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.rot = Math.atan2(p.vy, p.vx);
  const stopped = collide(world, p, (e) => {
    hitWith(world, p, e);
    if (p.blast > 0) explode(world, p.slot, e.x, e.y, p.extra || 18, p.dmg * p.blast, 20, p.kind === 'missile' ? 'missile' : 'confetti');
  });
  if (stopped) p.dead = true;
};

handlers.shuriken = (world, w, dt) => {
  w.t -= dt;
  if (w.t > 0) return;
  const s = eff(world, w);
  w.t = s.cd;
  const player = world.player;
  if (w.evolved) {
    w.state.spin += 0.39;
    const count = s.amount;
    for (let i = 0; i < count; i++) {
      const angle = w.state.spin + (i * tau) / count;
      const p = spawn(world, 'star', w.slot, player.x, player.y);
      p.vx = Math.cos(angle) * s.speed;
      p.vy = Math.sin(angle) * s.speed;
      p.r = 4.5;
      p.dmg = s.dmg;
      p.pierce = -1;
      p.bounces = 1;
      p.evo = true;
      p.knockback = s.knockback;
      p.spin = 18;
      setLife(p, 1.6);
    }
  } else {
    const aim = nearestEnemy(world, player.x, player.y, 220);
    const base = aim ? Math.atan2(aim.y - player.y, aim.x - player.x) : Math.atan2(player.facingY, player.facingX);
    for (let i = 0; i < s.amount; i++) {
      const angle = base + (i - (s.amount - 1) / 2) * 0.16;
      const p = spawn(world, 'star', w.slot, player.x, player.y);
      p.vx = Math.cos(angle) * s.speed;
      p.vy = Math.sin(angle) * s.speed;
      p.r = 4;
      p.dmg = s.dmg;
      p.pierce = s.pierce;
      p.knockback = s.knockback;
      p.spin = 16;
      p.delay = i * 0.03;
      setLife(p, 1.1);
    }
  }
  world.emit('sfx', 'shuriken');
};

projectileUpdaters.star = (world, p, dt) => {
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.rot += p.spin * dt;
  if (p.bounces > 0 && bounceInBounds(world, p)) {
    p.bounces--;
    p.hitMap.clear();
  }
  if (collide(world, p)) p.dead = true;
};

handlers.drone = (world, w, dt) => {
  const s = eff(world, w);
  const player = world.player;
  const drones = w.state.drones;
  while (drones.length < s.amount) drones.push({ x: player.x, y: player.y - 10, t: 0.3 * drones.length, flip: false });
  drones.length = s.amount;
  w.state.angle += dt * 1.1;
  const interval = s.raw.interval * world.stats.cooldown;
  for (let i = 0; i < drones.length; i++) {
    const drone = drones[i];
    const angle = w.state.angle + (i * tau) / drones.length;
    const tx = player.x + Math.cos(angle) * 22;
    const ty = player.y - 6 + Math.sin(angle) * 14;
    const k = Math.min(1, dt * 6);
    drone.flip = tx < drone.x;
    drone.x += (tx - drone.x) * k;
    drone.y += (ty - drone.y) * k;
    drone.t -= dt;
    if (drone.t > 0) continue;
    const target = nearestEnemy(world, drone.x, drone.y, 170);
    if (!target) {
      drone.t = 0.2;
      continue;
    }
    drone.t = interval;
    const fire = Math.atan2(target.y - drone.y, target.x - drone.x);
    const p = spawn(world, w.evolved ? 'missile' : 'bullet', w.slot, drone.x, drone.y);
    p.speed = s.speed;
    p.vx = Math.cos(fire) * s.speed;
    p.vy = Math.sin(fire) * s.speed;
    p.rot = fire;
    p.r = w.evolved ? 4 : 3;
    p.dmg = s.dmg;
    p.pierce = 1;
    p.knockback = 10;
    p.target = target;
    p.targetId = target.id;
    p.evo = w.evolved;
    p.blast = w.evolved ? s.raw.blast : 0;
    p.extra = w.evolved ? 22 : 0;
    setLife(p, w.evolved ? 2.5 : 1.2);
  }
  if (drones.some((d) => d.t === interval)) world.emit('sfx', w.evolved ? 'missile' : 'pew');
};

projectileUpdaters.bullet = (world, p, dt) => {
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  if (collide(world, p)) p.dead = true;
};

projectileUpdaters.missile = (world, p, dt) => {
  projectileUpdaters.crane(world, p, dt);
};

handlers.fireworks = (world, w, dt) => {
  w.t -= dt;
  if (w.t > 0) return;
  const candidates = enemiesInView(world, -10);
  if (candidates.length === 0) {
    w.t = 0.3;
    return;
  }
  const s = eff(world, w);
  w.t = s.cd;
  const player = world.player;
  for (let i = 0; i < s.amount; i++) {
    let best = candidates[world.rng.int(0, candidates.length - 1)];
    let bestCount = -1;
    for (let k = 0; k < 4; k++) {
      const option = candidates[world.rng.int(0, candidates.length - 1)];
      let count = 0;
      for (const e of candidates) if ((e.x - option.x) ** 2 + (e.y - option.y) ** 2 < 900) count++;
      if (count > bestCount) {
        bestCount = count;
        best = option;
      }
    }
    const p = spawn(world, 'rocket', w.slot, player.x, player.y);
    p.tx = best.x;
    p.ty = best.y;
    p.speed = s.speed;
    const angle = Math.atan2(p.ty - p.y, p.tx - p.x) + world.rng.range(-0.5, 0.5);
    p.vx = Math.cos(angle) * s.speed;
    p.vy = Math.sin(angle) * s.speed;
    p.dmg = s.dmg;
    p.r = 26 * s.area;
    p.scale = s.area;
    p.knockback = s.knockback;
    p.evo = w.evolved;
    p.extra = w.evolved ? s.raw.cluster : 0;
    p.variant = world.rng.int(0, 3);
    p.delay = i * 0.1;
    setLife(p, 2.2);
  }
  world.emit('sfx', 'rocket');
};

projectileUpdaters.rocket = (world, p, dt) => {
  const desired = Math.atan2(p.ty - p.y, p.tx - p.x);
  const current = Math.atan2(p.vy, p.vx);
  let diff = desired - current;
  while (diff > Math.PI) diff -= tau;
  while (diff < -Math.PI) diff += tau;
  const turn = Math.max(-5 * dt, Math.min(5 * dt, diff));
  p.vx = Math.cos(current + turn) * p.speed;
  p.vy = Math.sin(current + turn) * p.speed;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.rot = Math.atan2(p.vy, p.vx);
  if ((p.tx - p.x) ** 2 + (p.ty - p.y) ** 2 < 49) p.life = 0;
};

projectileUpdaters.rocketEnd = (world, p) => {
  explode(world, p.slot, p.x, p.y, p.r, p.dmg, p.knockback, 'firework' + p.variant);
  world.emit('sfx', 'boom');
  for (let i = 0; i < p.extra; i++) {
    const angle = world.rng.angle();
    const distance = world.rng.range(18, 32) * p.scale;
    const mini = spawn(world, 'burst', p.slot, p.x + Math.cos(angle) * distance, p.y + Math.sin(angle) * distance);
    mini.dmg = p.dmg * 0.5;
    mini.r = 18 * p.scale;
    mini.delay = 0.12 + i * 0.07;
    mini.variant = world.rng.int(0, 3);
    setLife(mini, 0.01);
  }
};

projectileUpdaters.burstEnd = (world, p) => {
  explode(world, p.slot, p.x, p.y, p.r, p.dmg, 30, 'firework' + p.variant);
};

handlers.frost = (world, w, dt) => {
  const s = eff(world, w);
  const player = world.player;
  if (w.evolved) {
    w.state.novaT -= dt;
    if (w.state.novaT <= 0) {
      w.state.novaT = s.raw.novaCd * world.stats.cooldown;
      const radius = 110 * s.area;
      areaDamage(world, w.slot, player.x, player.y, radius, s.dmg * 0.5, {
        onHit: (e) => {
          if (!e.boss) e.freezeT = Math.max(e.freezeT, s.duration * (e.elite ? 0.4 : 1));
        },
      });
      const fx = spawn(world, 'nova', w.slot, player.x, player.y);
      fx.r = radius;
      setLife(fx, 0.5);
      world.emit('sfx', 'nova');
    }
  }
  w.t -= dt;
  if (w.t > 0) return;
  w.t = s.cd;
  const length = 66 * s.area;
  const aim = nearestEnemy(world, player.x, player.y, length + 30);
  const angle = aim ? Math.atan2(aim.y - player.y, aim.x - player.x) : Math.atan2(player.facingY, player.facingX);
  const half = 0.55;
  const chance = s.raw.freezeChance;
  world.grid.query(player.x, player.y, length + 28, (e) => {
    if (e.hp <= 0) return false;
    const dx = e.x - player.x;
    const dy = e.y - player.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > length + e.r) return false;
    let diff = Math.atan2(dy, dx) - angle;
    while (diff > Math.PI) diff -= tau;
    while (diff < -Math.PI) diff += tau;
    if (Math.abs(diff) > half && d > e.r + 4) return false;
    world.damageEnemy(e, s.dmg, w.slot, { knockback: 20, kx: dx, ky: dy });
    if (!e.boss && e.hp > 0 && world.rng.next() < chance) e.freezeT = Math.max(e.freezeT, s.duration * (e.elite ? 0.4 : 1));
    return false;
  });
  const fx = spawn(world, 'frostCone', w.slot, player.x, player.y);
  fx.angle = angle;
  fx.length = length;
  setLife(fx, 0.4);
  world.emit('sfx', 'frost');
};

projectileUpdaters.frostCone = (world, p) => {
  p.x = world.player.x;
  p.y = world.player.y;
};

handlers.ghosts = (world, w, dt) => {
  const s = eff(world, w);
  const player = world.player;
  if (w.evolved) {
    const ghosts = w.state.ghosts;
    const count = s.amount + world.stats.amount;
    while (ghosts.length < count) ghosts.push({ x: player.x, y: player.y, mode: 0, tx: 0, ty: 0, t: 0, flip: false });
    ghosts.length = count;
    w.state.angle += dt * 1.6;
    const radius = 50 * s.area;
    w.t -= dt;
    if (w.t <= 0) {
      w.t = s.cd;
      const idle = ghosts.filter((g) => g.mode === 0);
      const target = nearestEnemies(world, player.x, player.y, 8, 180);
      if (idle.length > 0 && target.length > 0) {
        const ghost = idle[world.rng.int(0, idle.length - 1)];
        const enemy = target[world.rng.int(0, target.length - 1)];
        const dx = enemy.x - ghost.x;
        const dy = enemy.y - ghost.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        ghost.mode = 1;
        ghost.tx = enemy.x + (dx / d) * 30;
        ghost.ty = enemy.y + (dy / d) * 30;
        world.emit('sfx', 'ghost');
      }
    }
    for (let i = 0; i < ghosts.length; i++) {
      const ghost = ghosts[i];
      if (ghost.mode === 0) {
        const angle = w.state.angle + (i * tau) / ghosts.length;
        const tx = player.x + Math.cos(angle) * radius;
        const ty = player.y + Math.sin(angle) * radius;
        const k = Math.min(1, dt * 8);
        ghost.flip = tx < ghost.x;
        ghost.x += (tx - ghost.x) * k;
        ghost.y += (ty - ghost.y) * k;
      } else {
        const tx = ghost.mode === 1 ? ghost.tx : player.x;
        const ty = ghost.mode === 1 ? ghost.ty : player.y;
        const dx = tx - ghost.x;
        const dy = ty - ghost.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const step = s.speed * dt;
        ghost.flip = dx < 0;
        if (d <= step) {
          ghost.x = tx;
          ghost.y = ty;
          ghost.mode = ghost.mode === 1 ? 2 : 0;
        } else {
          ghost.x += (dx / d) * step;
          ghost.y += (dy / d) * step;
        }
        if (ghost.mode === 2 && d < radius) ghost.mode = 0;
      }
      areaDamage(world, w.slot, ghost.x, ghost.y, 7 * s.area, s.dmg, { gate: w.slot, interval: 0.4, knockback: s.knockback });
    }
    return;
  }
  w.t -= dt;
  if (w.t > 0) return;
  w.t = s.cd;
  const targets = nearestEnemies(world, player.x, player.y, s.amount, 200);
  for (let i = 0; i < s.amount; i++) {
    const target = targets[i];
    const angle = target ? Math.atan2(target.y - player.y, target.x - player.x) : world.rng.angle();
    const p = spawn(world, 'ghost', w.slot, player.x, player.y);
    p.vx = Math.cos(angle) * s.speed;
    p.vy = Math.sin(angle) * s.speed;
    p.r = 6 * s.area;
    p.scale = s.area;
    p.dmg = s.dmg;
    p.knockback = s.knockback;
    p.delay = i * 0.07;
    setLife(p, s.duration);
  }
  world.emit('sfx', 'ghost');
};

projectileUpdaters.ghost = (world, p, dt) => {
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  collide(world, p);
};
