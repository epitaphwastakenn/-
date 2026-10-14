// VARIABLES
const voiceLimit = 28;
const perSoundLimit = 5;
const minGap = 0.035;

// FUNCTIONS
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.buffers = new Map();
    this.musicBuffers = new Map();
    this.musicLoading = new Map();
    this.voices = 0;
    this.playing = new Map();
    this.lastPlayed = new Map();
    this.musicVolume = 0.7;
    this.sfxVolume = 0.8;
    this.currentMusic = null;
    this.currentName = '';
    this.wantedMusic = '';
    this.unlocked = false;
    this.suspended = false;
  }

  init() {
    if (this.ctx) return;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    try {
      this.ctx = new Context({ latencyHint: 'interactive', sampleRate: 32000 });
    } catch (error) {
      this.ctx = new Context();
    }
    this.master = this.ctx.createGain();
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = this.musicVolume;
    this.musicGain.connect(this.master);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.sfxVolume;
    const compressor = this.ctx.createDynamicsCompressor();
    compressor.threshold.value = -14;
    compressor.ratio.value = 4;
    this.sfxGain.connect(compressor);
    compressor.connect(this.master);
  }

  unlock() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state !== 'running' && !this.suspended) this.ctx.resume();
    this.unlocked = true;
    if (this.wantedMusic && this.currentName !== this.wantedMusic) this.playMusic(this.wantedMusic);
  }

  suspend() {
    this.suspended = true;
    if (this.ctx && this.ctx.state === 'running') this.ctx.suspend();
  }

  resume() {
    this.suspended = false;
    if (this.ctx && this.unlocked) this.ctx.resume();
  }

  setVolumes(music, sfx) {
    this.musicVolume = music;
    this.sfxVolume = sfx;
    if (this.musicGain) this.musicGain.gain.setTargetAtTime(music, this.ctx.currentTime, 0.05);
    if (this.sfxGain) this.sfxGain.gain.setTargetAtTime(sfx, this.ctx.currentTime, 0.05);
  }

  async loadSfx(names) {
    this.init();
    if (!this.ctx) return;
    await Promise.all(names.map(async (name) => {
      try {
        const response = await fetch('sfx/' + name + '.wav');
        if (!response.ok) return;
        const data = await response.arrayBuffer();
        const buffer = await this.ctx.decodeAudioData(data);
        this.buffers.set(name, buffer);
      } catch (error) {
        console.warn('sfx load failed', name);
      }
    }));
  }

  play(name, options = {}) {
    if (!this.ctx || this.ctx.state !== 'running' || this.sfxVolume <= 0) return;
    const buffer = this.buffers.get(name);
    if (!buffer) return;
    const now = this.ctx.currentTime;
    const last = this.lastPlayed.get(name) || 0;
    if (now - last < (options.gap === undefined ? minGap : options.gap)) return;
    const count = this.playing.get(name) || 0;
    if (count >= (options.limit || perSoundLimit) || this.voices >= voiceLimit) return;
    this.lastPlayed.set(name, now);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const pitch = options.pitch || 1;
    const variance = options.variance === undefined ? 0.06 : options.variance;
    source.playbackRate.value = pitch * (1 + (Math.random() * 2 - 1) * variance);
    const gain = this.ctx.createGain();
    gain.gain.value = options.volume === undefined ? 1 : options.volume;
    source.connect(gain);
    gain.connect(this.sfxGain);
    this.voices++;
    this.playing.set(name, count + 1);
    source.onended = () => {
      this.voices--;
      this.playing.set(name, Math.max(0, (this.playing.get(name) || 1) - 1));
      source.disconnect();
      gain.disconnect();
    };
    source.start();
  }

  async loadMusic(name) {
    if (this.musicBuffers.has(name)) return this.musicBuffers.get(name);
    if (this.musicLoading.has(name)) return this.musicLoading.get(name);
    const promise = (async () => {
      try {
        const response = await fetch('music/' + name + '.ogg');
        if (!response.ok) return null;
        const data = await response.arrayBuffer();
        const buffer = await this.ctx.decodeAudioData(data);
        this.musicBuffers.set(name, buffer);
        while (this.musicBuffers.size > 3) {
          const oldest = this.musicBuffers.keys().next().value;
          if (oldest === this.currentName || oldest === name) break;
          this.musicBuffers.delete(oldest);
        }
        return buffer;
      } catch (error) {
        console.warn('music load failed', name);
        return null;
      } finally {
        this.musicLoading.delete(name);
      }
    })();
    this.musicLoading.set(name, promise);
    return promise;
  }

  async playMusic(name, fade = 0.8) {
    this.wantedMusic = name;
    if (!this.ctx || !this.unlocked) return;
    if (this.currentName === name && this.currentMusic) return;
    const buffer = await this.loadMusic(name);
    if (!buffer || this.wantedMusic !== name || this.currentName === name) return;
    const now = this.ctx.currentTime;
    if (this.currentMusic) {
      const old = this.currentMusic;
      old.gain.gain.setValueAtTime(old.gain.gain.value, now);
      old.gain.gain.linearRampToValueAtTime(0, now + fade);
      old.source.stop(now + fade + 0.05);
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(1, now + fade * 0.6);
    source.connect(gain);
    gain.connect(this.musicGain);
    source.start(now);
    this.currentMusic = { source, gain };
    this.currentName = name;
  }

  stopMusic(fade = 0.6) {
    this.wantedMusic = '';
    if (!this.currentMusic || !this.ctx) return;
    const now = this.ctx.currentTime;
    const old = this.currentMusic;
    old.gain.gain.setValueAtTime(old.gain.gain.value, now);
    old.gain.gain.linearRampToValueAtTime(0, now + fade);
    old.source.stop(now + fade + 0.05);
    this.currentMusic = null;
    this.currentName = '';
  }

  duck(amount, time = 0.3) {
    if (!this.musicGain) return;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setTargetAtTime(this.musicVolume * amount, now, time / 3);
  }

  unduck(time = 0.4) {
    if (!this.musicGain) return;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setTargetAtTime(this.musicVolume, now, time / 3);
  }
}
