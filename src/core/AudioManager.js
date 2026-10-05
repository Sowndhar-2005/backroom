/**
 * AudioManager — Procedural audio using Web Audio API
 * All sounds are generated procedurally — no external audio files required.
 */
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientNodes = [];
    this.initialized = false;
  }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch (e) {
      console.warn('AudioManager: Web Audio API not available');
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /** Play a short noise burst (footstep) */
  playFootstep(running = false) {
    if (!this.initialized) return;
    const ctx = this.ctx;
    const duration = running ? 0.06 : 0.08;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.15));
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = running ? 600 : 400;
    const gain = ctx.createGain();
    gain.gain.value = running ? 0.12 : 0.08;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start();
  }

  /** Short metallic click for interactions */
  playInteract() {
    if (!this.initialized) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 1200;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  /** Door creak sound */
  playDoor() {
    if (!this.initialized) return;
    const ctx = this.ctx;
    const duration = 0.5;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      data[i] = Math.sin(200 * t + 50 * Math.sin(8 * t)) * 0.15 * Math.exp(-t * 3);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = 0.15;
    src.connect(gain);
    gain.connect(this.masterGain);
    src.start();
  }

  /** Flashlight click */
  playFlashlight() {
    if (!this.initialized) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 2500;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  /** Distant impact / thud */
  playDistantImpact() {
    if (!this.initialized) return;
    const ctx = this.ctx;
    const duration = 0.8;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      data[i] = Math.sin(60 * t * Math.PI * 2) * 0.3 * Math.exp(-t * 4) +
        (Math.random() * 2 - 1) * 0.05 * Math.exp(-t * 6);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = 0.08;
    src.connect(gain);
    gain.connect(this.masterGain);
    src.start();
  }

  /** Entity low drone */
  playEntityDrone(durationSec = 3) {
    if (!this.initialized) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 42;
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 45;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + durationSec);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc2.start();
    osc.stop(ctx.currentTime + durationSec);
    osc2.stop(ctx.currentTime + durationSec);
  }

  /** Start ambient hum (fluorescent lights) */
  startAmbientHum(frequency = 120, volume = 0.025) {
    if (!this.initialized) return;
    this.stopAmbient();
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = frequency;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = frequency;
    filter.Q.value = 10;
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    this.ambientNodes.push({ osc, gain, filter });
  }

  /** Start low ambient drone for later levels */
  startAmbientDrone(volume = 0.02) {
    if (!this.initialized) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 38;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 5;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    const gain = ctx.createGain();
    gain.gain.value = volume;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 100;
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    lfo.start();
    this.ambientNodes.push({ osc, gain, filter, lfo, lfoGain });
  }

  stopAmbient() {
    this.ambientNodes.forEach(n => {
      try { n.osc.stop(); } catch(e) {}
      try { if (n.lfo) n.lfo.stop(); } catch(e) {}
    });
    this.ambientNodes = [];
  }

  /** Play a short scare sting */
  playScareSting() {
    if (!this.initialized) return;
    const ctx = this.ctx;
    const duration = 1.2;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      data[i] = (
        Math.sin(80 * t * Math.PI * 2) * 0.3 +
        Math.sin(120 * t * Math.PI * 2) * 0.2 +
        (Math.random() * 2 - 1) * 0.15
      ) * Math.exp(-t * 2);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = 0.12;
    src.connect(gain);
    gain.connect(this.masterGain);
    src.start();
  }

  setMasterVolume(v) {
    if (this.masterGain) this.masterGain.gain.value = v;
  }

  dispose() {
    this.stopAmbient();
    if (this.ctx) this.ctx.close();
  }
}
