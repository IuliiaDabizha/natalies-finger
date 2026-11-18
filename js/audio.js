// ============================================================
//  js/audio.js — Retro & Fortnite-style Web Audio Synthesizer
// ============================================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.warn("Web Audio not supported", e);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, dur, type = 'sine', vol = 0.08) {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + dur);
    } catch (e) {}
  }

  step() {
    this.playTone(130 + Math.random() * 40, 0.05, 'triangle', 0.025);
  }

  click() {
    this.playTone(600, 0.05, 'sine', 0.06);
  }

  blip() {
    this.playTone(450 + Math.random() * 150, 0.03, 'square', 0.02);
  }

  pickup() {
    this.playTone(523, 0.08, 'triangle', 0.09);
    setTimeout(() => this.playTone(659, 0.08, 'triangle', 0.09), 70);
    setTimeout(() => this.playTone(784, 0.16, 'triangle', 0.12), 140);
  }

  kaching() {
    this.playTone(987, 0.06, 'triangle', 0.1);
    setTimeout(() => this.playTone(1318, 0.22, 'triangle', 0.12), 60);
  }

  siren(pitchMultiplier = 1) {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(300 * pitchMultiplier, now);
      osc.frequency.linearRampToValueAtTime(800 * pitchMultiplier, now + 0.3);
      osc.frequency.linearRampToValueAtTime(300 * pitchMultiplier, now + 0.6);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    } catch (e) {}
  }

  // MASSIVE CARTOON EXPLOSION WHEN NATALIE DETONATES!
  explosion() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;

      // 1. White noise blast for the shockwave
      const bufferSize = this.ctx.sampleRate * 1.5;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(40, now + 1.2);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      whiteNoise.start(now);
      whiteNoise.stop(now + 1.4);

      // 2. Sub-bass boom drop
      const bass = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(140, now);
      bass.frequency.exponentialRampToValueAtTime(25, now + 1.5);
      bassGain.gain.setValueAtTime(0.5, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
      bass.connect(bassGain);
      bassGain.connect(this.ctx.destination);
      bass.start(now);
      bass.stop(now + 1.6);
    } catch (e) {}
  }

  victory() {
    const melody = [523, 659, 784, 1046, 1318];
    melody.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.3, 'triangle', 0.1), idx * 140);
    });
  }

  toggle() {
    this.muted = !this.muted;
    return !this.muted;
  }
}

window.soundEngine = new SoundEngine();
