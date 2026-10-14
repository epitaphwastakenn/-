import { white } from '../render/renderer.js';

// VARIABLES
const maxParticles = 1400;

// FUNCTIONS
function makeParticle() {
  return { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, maxLife: 1, frame: 0, color: white, scale: 1, scaleEnd: 1, rot: 0, spin: 0, additive: false, gravity: 0, drag: 0, fade: true, ground: false, frames: null, fps: 0 };
}

export class Particles {
  constructor() {
    this.list = [];
    this.pool = [];
  }

  spawn(frame, x, y, options = {}) {
    let p;
    if (this.list.length >= maxParticles) {
      p = this.list[0];
      this.list[0] = this.list[this.list.length - 1];
      this.list.pop();
    } else {
      p = this.pool.pop() || makeParticle();
    }
    p.frame = frame;
    p.frames = options.frames || null;
    p.fps = options.fps || 0;
    p.x = x;
    p.y = y;
    p.z = options.z || 0;
    p.vx = options.vx || 0;
    p.vy = options.vy || 0;
    p.vz = options.vz || 0;
    p.life = p.maxLife = options.life || 0.5;
    p.color = options.color === undefined ? white : options.color;
    p.scale = options.scale === undefined ? 1 : options.scale;
    p.scaleEnd = options.scaleEnd === undefined ? p.scale : options.scaleEnd;
    p.rot = options.rot || 0;
    p.spin = options.spin || 0;
    p.additive = !!options.additive;
    p.gravity = options.gravity || 0;
    p.drag = options.drag || 0;
    p.fade = options.fade !== false;
    p.ground = !!options.ground;
    this.list.push(p);
    return p;
  }

  update(dt) {
    const list = this.list;
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.life -= dt;
      if (p.life <= 0) {
        list[i] = list[list.length - 1];
        list.pop();
        this.pool.push(p);
        continue;
      }
      if (p.drag > 0) {
        const k = Math.exp(-p.drag * dt);
        p.vx *= k;
        p.vy *= k;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity !== 0 || p.vz !== 0) {
        p.vz -= p.gravity * dt;
        p.z += p.vz * dt;
        if (p.z < 0) {
          p.z = 0;
          p.vz = -p.vz * 0.4;
        }
      }
      p.rot += p.spin * dt;
    }
  }

  draw(renderer, groundPass) {
    for (const p of this.list) {
      if (p.ground !== groundPass) continue;
      const t = 1 - p.life / p.maxLife;
      const scale = p.scale + (p.scaleEnd - p.scale) * t;
      let color = p.color;
      if (p.fade) {
        const alpha = ((color >>> 24) & 255) / 255 * Math.min(1, (p.life / p.maxLife) * 2.2);
        color = ((color & 0x00ffffff) | ((Math.round(alpha * 255) & 255) << 24)) >>> 0;
      }
      let frame = p.frame;
      if (p.frames) frame = p.frames[Math.min(p.frames.length - 1, Math.floor((p.maxLife - p.life) * p.fps))];
      renderer.draw(frame, p.x, p.y - p.z, scale, scale, p.rot, color, 0, p.additive);
    }
  }

  clear() {
    for (const p of this.list) this.pool.push(p);
    this.list.length = 0;
  }
}
