// VARIABLES
const radius = 46;
const deadZone = 0.12;

// FUNCTIONS
export class Input {
  constructor(surface, base, knob) {
    this.surface = surface;
    this.base = base;
    this.knob = knob;
    this.x = 0;
    this.y = 0;
    this.pointerId = null;
    this.originX = 0;
    this.originY = 0;
    this.keys = new Set();
    this.enabled = true;
    surface.addEventListener('pointerdown', (e) => this.down(e), { passive: false });
    window.addEventListener('pointermove', (e) => this.move(e), { passive: false });
    window.addEventListener('pointerup', (e) => this.up(e));
    window.addEventListener('pointercancel', (e) => this.up(e));
    window.addEventListener('keydown', (e) => this.keys.add(e.key.toLowerCase()));
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => this.reset());
  }

  down(e) {
    if (!this.enabled || this.pointerId !== null) return;
    e.preventDefault();
    this.pointerId = e.pointerId;
    this.originX = e.clientX;
    this.originY = e.clientY;
    this.x = 0;
    this.y = 0;
    this.base.style.transform = `translate(${this.originX - radius}px, ${this.originY - radius}px)`;
    this.knob.style.transform = `translate(${this.originX - 18}px, ${this.originY - 18}px)`;
    this.base.classList.add('on');
    this.knob.classList.add('on');
  }

  move(e) {
    if (e.pointerId !== this.pointerId) return;
    e.preventDefault();
    let dx = e.clientX - this.originX;
    let dy = e.clientY - this.originY;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > radius) {
      const excess = d - radius;
      this.originX += (dx / d) * excess;
      this.originY += (dy / d) * excess;
      dx = e.clientX - this.originX;
      dy = e.clientY - this.originY;
      this.base.style.transform = `translate(${this.originX - radius}px, ${this.originY - radius}px)`;
    }
    const m = Math.min(1, d / radius);
    if (m < deadZone) {
      this.x = 0;
      this.y = 0;
    } else {
      const n = Math.sqrt(dx * dx + dy * dy) || 1;
      const strength = Math.min(1, (m - deadZone) / (1 - deadZone) * 1.25);
      this.x = (dx / n) * strength;
      this.y = (dy / n) * strength;
    }
    this.knob.style.transform = `translate(${this.originX + this.x * radius - 18}px, ${this.originY + this.y * radius - 18}px)`;
  }

  up(e) {
    if (e.pointerId !== this.pointerId) return;
    this.reset();
  }

  reset() {
    this.pointerId = null;
    this.x = 0;
    this.y = 0;
    this.base.classList.remove('on');
    this.knob.classList.remove('on');
  }

  read() {
    let x = this.x;
    let y = this.y;
    if (this.keys.size > 0) {
      let kx = 0;
      let ky = 0;
      if (this.keys.has('a') || this.keys.has('arrowleft')) kx -= 1;
      if (this.keys.has('d') || this.keys.has('arrowright')) kx += 1;
      if (this.keys.has('w') || this.keys.has('arrowup')) ky -= 1;
      if (this.keys.has('s') || this.keys.has('arrowdown')) ky += 1;
      if (kx !== 0 || ky !== 0) {
        const n = Math.sqrt(kx * kx + ky * ky);
        x = kx / n;
        y = ky / n;
      }
    }
    return { x, y };
  }
}
