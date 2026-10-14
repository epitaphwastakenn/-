// VARIABLES
const vertexSource = `
attribute vec2 aPos;
attribute vec2 aUv;
attribute vec4 aColor;
attribute vec4 aExtra;
uniform vec4 uView;
varying vec2 vUv;
varying vec4 vColor;
varying vec4 vExtra;
void main() {
  vUv = aUv;
  vColor = aColor;
  vExtra = aExtra;
  gl_Position = vec4(aPos.x * uView.z + uView.x, aPos.y * uView.w + uView.y, 0.0, 1.0);
}`;

const fragmentSource = `
precision mediump float;
uniform sampler2D uTex;
varying vec2 vUv;
varying vec4 vColor;
varying vec4 vExtra;
void main() {
  vec4 t = texture2D(uTex, vUv);
  float a = t.a * vColor.a;
  vec3 rgb = mix(t.rgb * vColor.rgb, vColor.rgb, vExtra.r);
  gl_FragColor = vec4(rgb * a, a * (1.0 - vExtra.g));
}`;

const maxQuads = 6000;
const floatsPerVertex = 6;
const strideBytes = floatsPerVertex * 4;

// FUNCTIONS
export function rgba(r, g, b, a = 1) {
  return ((Math.round(a * 255) & 255) << 24 | (b & 255) << 16 | (g & 255) << 8 | (r & 255)) >>> 0;
}

export function hexColor(hex, a = 1) {
  const value = parseInt(hex.replace('#', ''), 16);
  return rgba((value >> 16) & 255, (value >> 8) & 255, value & 255, a);
}

export function withAlpha(color, a) {
  return ((color & 0x00ffffff) | ((Math.round(a * 255) & 255) << 24)) >>> 0;
}

export const white = rgba(255, 255, 255, 1);

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    const options = { alpha: false, antialias: false, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance', depth: false, stencil: false };
    const gl = canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options);
    if (!gl) throw new Error('WebGL not available');
    this.gl = gl;
    this.frameIndex = new Map();
    this.frameData = new Float32Array(0);
    this.buffer = new ArrayBuffer(maxQuads * 4 * strideBytes);
    this.floats = new Float32Array(this.buffer);
    this.uints = new Uint32Array(this.buffer);
    this.quadCount = 0;
    this.drawCalls = 0;
    this.camX = 0;
    this.camY = 0;
    this.scale = 4;
    this.viewW = 0;
    this.viewH = 0;
    this.setup();
  }

  setup() {
    const gl = this.gl;
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    this.program = program;
    this.uView = gl.getUniformLocation(program, 'uView');

    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, this.buffer.byteLength, gl.DYNAMIC_DRAW);

    const indices = new Uint16Array(maxQuads * 6);
    for (let i = 0, v = 0; i < indices.length; i += 6, v += 4) {
      indices[i] = v;
      indices[i + 1] = v + 1;
      indices[i + 2] = v + 2;
      indices[i + 3] = v + 2;
      indices[i + 4] = v + 3;
      indices[i + 5] = v;
    }
    this.ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(program, 'aPos');
    const uv = gl.getAttribLocation(program, 'aUv');
    const color = gl.getAttribLocation(program, 'aColor');
    const extra = gl.getAttribLocation(program, 'aExtra');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, strideBytes, 0);
    gl.enableVertexAttribArray(uv);
    gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, strideBytes, 8);
    gl.enableVertexAttribArray(color);
    gl.vertexAttribPointer(color, 4, gl.UNSIGNED_BYTE, true, strideBytes, 16);
    gl.enableVertexAttribArray(extra);
    gl.vertexAttribPointer(extra, 4, gl.UNSIGNED_BYTE, true, strideBytes, 20);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  loadAtlas(image, meta) {
    const gl = this.gl;
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const names = Object.keys(meta.frames);
    this.frameData = new Float32Array(names.length * 10);
    names.forEach((name, i) => {
      const [x, y, w, h, ax, ay] = meta.frames[name];
      const o = i * 10;
      this.frameData[o] = w;
      this.frameData[o + 1] = h;
      this.frameData[o + 2] = ax;
      this.frameData[o + 3] = ay;
      this.frameData[o + 4] = x / meta.w;
      this.frameData[o + 5] = y / meta.h;
      this.frameData[o + 6] = (x + w) / meta.w;
      this.frameData[o + 7] = (y + h) / meta.h;
      this.frameData[o + 8] = (x + w / 2) / meta.w;
      this.frameData[o + 9] = (y + h / 2) / meta.h;
      this.frameIndex.set(name, i);
    });
    this.pxFrame = this.frame('px');
  }

  frame(name) {
    const index = this.frameIndex.get(name);
    if (index === undefined) {
      if (!this.missing) this.missing = new Set();
      if (!this.missing.has(name)) {
        this.missing.add(name);
        console.warn('missing frame', name);
      }
      return this.frameIndex.get('px');
    }
    return index;
  }

  hasFrame(name) {
    return this.frameIndex.has(name);
  }

  frameSize(index) {
    return [this.frameData[index * 10], this.frameData[index * 10 + 1]];
  }

  resize(width, height, scale) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.scale = scale;
    this.viewW = width / scale;
    this.viewH = height / scale;
    this.gl.viewport(0, 0, width, height);
  }

  begin(camX, camY, clearColor) {
    const gl = this.gl;
    const snap = 1 / this.scale;
    this.camX = Math.round(camX / snap) * snap;
    this.camY = Math.round(camY / snap) * snap;
    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const sx = 2 / this.viewW;
    const sy = -2 / this.viewH;
    gl.uniform4f(this.uView, -(this.camX - this.viewW / 2) * sx - 1, -(this.camY - this.viewH / 2) * sy + 1, sx, sy);
    this.quadCount = 0;
    this.drawCalls = 0;
  }

  flush() {
    if (this.quadCount === 0) return;
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.floats.subarray(0, this.quadCount * 4 * floatsPerVertex));
    gl.drawElements(gl.TRIANGLES, this.quadCount * 6, gl.UNSIGNED_SHORT, 0);
    this.drawCalls++;
    this.quadCount = 0;
  }

  end() {
    this.flush();
  }

  draw(frame, x, y, sx = 1, sy = 1, rotation = 0, color = white, flash = 0, additive = false) {
    if (this.quadCount >= maxQuads) this.flush();
    const d = this.frameData;
    const o = frame * 10;
    const w = d[o];
    const h = d[o + 1];
    const ax = d[o + 2];
    const ay = d[o + 3];
    const left = -ax * sx;
    const right = (w - ax) * sx;
    const top = -ay * sy;
    const bottom = (h - ay) * sy;
    const u0 = d[o + 4];
    const v0 = d[o + 5];
    const u1 = d[o + 6];
    const v1 = d[o + 7];
    const extra = ((flash * 255) & 255) | (additive ? 0xff00 : 0);
    const f = this.floats;
    const u = this.uints;
    let i = this.quadCount * 24;
    if (rotation === 0) {
      f[i] = x + left; f[i + 1] = y + top; f[i + 2] = u0; f[i + 3] = v0; u[i + 4] = color; u[i + 5] = extra;
      f[i + 6] = x + right; f[i + 7] = y + top; f[i + 8] = u1; f[i + 9] = v0; u[i + 10] = color; u[i + 11] = extra;
      f[i + 12] = x + right; f[i + 13] = y + bottom; f[i + 14] = u1; f[i + 15] = v1; u[i + 16] = color; u[i + 17] = extra;
      f[i + 18] = x + left; f[i + 19] = y + bottom; f[i + 20] = u0; f[i + 21] = v1; u[i + 22] = color; u[i + 23] = extra;
    } else {
      const c = Math.cos(rotation);
      const s = Math.sin(rotation);
      f[i] = x + left * c - top * s; f[i + 1] = y + left * s + top * c; f[i + 2] = u0; f[i + 3] = v0; u[i + 4] = color; u[i + 5] = extra;
      f[i + 6] = x + right * c - top * s; f[i + 7] = y + right * s + top * c; f[i + 8] = u1; f[i + 9] = v0; u[i + 10] = color; u[i + 11] = extra;
      f[i + 12] = x + right * c - bottom * s; f[i + 13] = y + right * s + bottom * c; f[i + 14] = u1; f[i + 15] = v1; u[i + 16] = color; u[i + 17] = extra;
      f[i + 18] = x + left * c - bottom * s; f[i + 19] = y + left * s + bottom * c; f[i + 20] = u0; f[i + 21] = v1; u[i + 22] = color; u[i + 23] = extra;
    }
    this.quadCount++;
  }

  rect(x, y, w, h, color, additive = false) {
    if (this.quadCount >= maxQuads) this.flush();
    const d = this.frameData;
    const o = this.pxFrame * 10;
    const uc = d[o + 8];
    const vc = d[o + 9];
    const extra = additive ? 0xff00 : 0;
    const f = this.floats;
    const u = this.uints;
    const i = this.quadCount * 24;
    f[i] = x; f[i + 1] = y; f[i + 2] = uc; f[i + 3] = vc; u[i + 4] = color; u[i + 5] = extra;
    f[i + 6] = x + w; f[i + 7] = y; f[i + 8] = uc; f[i + 9] = vc; u[i + 10] = color; u[i + 11] = extra;
    f[i + 12] = x + w; f[i + 13] = y + h; f[i + 14] = uc; f[i + 15] = vc; u[i + 16] = color; u[i + 17] = extra;
    f[i + 18] = x; f[i + 19] = y + h; f[i + 20] = uc; f[i + 21] = vc; u[i + 22] = color; u[i + 23] = extra;
    this.quadCount++;
  }

  line(x1, y1, x2, y2, thickness, color, additive = false) {
    if (this.quadCount >= maxQuads) this.flush();
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / length * thickness / 2;
    const ny = dx / length * thickness / 2;
    const d = this.frameData;
    const o = this.pxFrame * 10;
    const uc = d[o + 8];
    const vc = d[o + 9];
    const extra = additive ? 0xff00 : 0;
    const f = this.floats;
    const u = this.uints;
    const i = this.quadCount * 24;
    f[i] = x1 + nx; f[i + 1] = y1 + ny; f[i + 2] = uc; f[i + 3] = vc; u[i + 4] = color; u[i + 5] = extra;
    f[i + 6] = x2 + nx; f[i + 7] = y2 + ny; f[i + 8] = uc; f[i + 9] = vc; u[i + 10] = color; u[i + 11] = extra;
    f[i + 12] = x2 - nx; f[i + 13] = y2 - ny; f[i + 14] = uc; f[i + 15] = vc; u[i + 16] = color; u[i + 17] = extra;
    f[i + 18] = x1 - nx; f[i + 19] = y1 - ny; f[i + 20] = uc; f[i + 21] = vc; u[i + 22] = color; u[i + 23] = extra;
    this.quadCount++;
  }

  drawStretched(frame, x1, y1, x2, y2, thickness, color = white, additive = false) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy) || 1;
    const [w, h] = this.frameSize(frame);
    const angle = Math.atan2(dy, dx);
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    const d = this.frameData;
    const o = frame * 10;
    const ax = d[o + 2];
    const ay = d[o + 3];
    const sx = length / w;
    const sy = thickness / h;
    const offsetX = (ax - w / 2) * sx;
    const offsetY = (ay - h / 2) * sy;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    this.draw(frame, cx + offsetX * c - offsetY * s, cy + offsetX * s + offsetY * c, sx, sy, angle, color, 0, additive);
  }
}
