// ============================================================
//  js/pokemon_audio.js — Authentic 8-bit & 16-bit GBA Chiptune Synthesizer
// ============================================================

class PokemonAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicPlaying = false;
    this.musicTimer = null;
  }

  init() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.warn("AudioContext not supported", e);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, dur, type = 'square', vol = 0.06) {
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

  // Classic Pokemon text typewriter blip
  blip() {
    this.playTone(320 + Math.random() * 40, 0.035, 'square', 0.025);
  }

  // Wall bump thud
  bump() {
    this.playTone(70, 0.06, 'triangle', 0.05);
  }

  // Select / UI click
  click() {
    this.playTone(580, 0.04, 'square', 0.04);
  }

  // Item Fanfare (Classic Pokémon "Obtained Item" jingle!)
  itemFanfare() {
    const notes = [
      { f: 523, d: 0.1 },
      { f: 659, d: 0.1 },
      { f: 784, d: 0.1 },
      { f: 1046, d: 0.25 }
    ];
    let time = 0;
    notes.forEach(n => {
      setTimeout(() => this.playTone(n.f, n.d, 'square', 0.08), time * 1000);
      time += n.d;
    });
  }

  // Pokemon Battle Intro Sweep
  battleSweep() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {}
  }

  // Natalie's Angered Screech / Battle Cry
  karenCry() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.linearRampToValueAtTime(180, now + 0.1);
      osc.frequency.linearRampToValueAtTime(320, now + 0.25);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  // 8-BIT EXPLOSION (Natalie Self-Destructs!)
  explosion() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const dur = 1.3;

      // 8-bit noise channel
      const bufferSize = this.ctx.sampleRate * dur;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(30, now + dur);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + dur);

      // Deep rumble tone
      const rumble = this.ctx.createOscillator();
      const rGain = this.ctx.createGain();
      rumble.type = 'triangle';
      rumble.frequency.setValueAtTime(120, now);
      rumble.frequency.exponentialRampToValueAtTime(20, now + dur);
      rGain.gain.setValueAtTime(0.3, now);
      rGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      rumble.connect(rGain);
      rGain.connect(this.ctx.destination);
      rumble.start(now);
      rumble.stop(now + dur);
    } catch (e) {}
  }

  // Cartoon Slapstick Yeet (Slide whistle + Whoosh sound effect)
  slapstickYeet() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.65);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.75);
    } catch (e) {}
  }

  // Cartoon Splat & Ground Impact
  thudImpact() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // 1. Thud
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);

      // 2. Comic Boing
      const boing = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      boing.type = 'sine';
      boing.frequency.setValueAtTime(300, now + 0.08);
      boing.frequency.linearRampToValueAtTime(600, now + 0.2);
      boing.frequency.linearRampToValueAtTime(350, now + 0.35);
      bGain.gain.setValueAtTime(0.12, now + 0.08);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      boing.connect(bGain);
      bGain.connect(this.ctx.destination);
      boing.start(now + 0.08);
      boing.stop(now + 0.4);
    } catch (e) {}
  }

  // Victory Fanfare
  victory() {
    const melody = [
      { f: 523, d: 0.12 },
      { f: 523, d: 0.12 },
      { f: 523, d: 0.12 },
      { f: 659, d: 0.2 },
      { f: 784, d: 0.2 },
      { f: 1046, d: 0.4 }
    ];
    let t = 0;
    melody.forEach(m => {
      setTimeout(() => this.playTone(m.f, m.d, 'square', 0.08), t * 1000);
      t += m.d;
    });
  }

  toggle() {
    this.muted = !this.muted;
    return !this.muted;
  }
}

window.PokemonAudio = PokemonAudio;
window.pokemonAudio = new PokemonAudio();
