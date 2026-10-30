/**
 * Procedural Korean Heritage Soundscape using Web Audio API.
 * Synthesizes traditional Korean court instruments (Gayageum, Punggyeong bell, Buk drum).
 * Zero external audio files (100% procedural, no 404s).
 */

class TraditionalAudioController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientTimer: number | null = null;
  private isPlayingAmbient: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.ctx) {
      this.ctx.suspend();
    } else if (!muted && this.ctx) {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Punggyeong (Wind Chime / Bronze Bell) sound
   * Distinctive high-resonance brass overtone with gentle decay
   */
  public playBell(frequency = 880) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(frequency, t);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(frequency * 2.76, t); // Metallic harmonic

    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(frequency * 5.4, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);

    osc1.connect(gain);
    osc2.connect(gain);
    osc3.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc3.start(t);
    osc1.stop(t + 3.3);
    osc2.stop(t + 3.3);
    osc3.stop(t + 3.3);
  }

  /**
   * Gayageum plucked silk string sound
   * Rich pentatonic pitch (Hwangjong, Taeju, Jungryeo, Imjong, Namnyeo)
   */
  public playGayageumNote(pitchHz = 220) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(pitchHz, t);
    // Subtle Nonghyeon vibrato
    osc.frequency.exponentialRampToValueAtTime(pitchHz * 1.01, t + 0.3);
    osc.frequency.exponentialRampToValueAtTime(pitchHz * 0.995, t + 0.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 1.2);
    filter.Q.value = 4.0;

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 1.9);
  }

  /**
   * Buk (Ceremonial Drum / Jingo) strike for regal presence
   */
  public playDrum() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.35);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 1.0);
  }

  /**
   * Ambient court pentatonic pattern
   */
  public toggleAmbientSoundscape(): boolean {
    if (this.isPlayingAmbient) {
      if (this.ambientTimer) {
        window.clearInterval(this.ambientTimer);
        this.ambientTimer = null;
      }
      this.isPlayingAmbient = false;
      return false;
    } else {
      this.isPlayingAmbient = true;
      this.initCtx();
      const scale = [196, 220, 261.6, 293.6, 329.6, 392, 440, 523]; // Pentatonic court scale (Sol, La, Do, Re, Mi)
      let step = 0;
      this.ambientTimer = window.setInterval(() => {
        if (this.isMuted) return;
        step++;
        if (step % 4 === 0) {
          const note = scale[Math.floor(Math.random() * scale.length)];
          this.playGayageumNote(note);
        }
        if (step % 9 === 0) {
          this.playBell(700 + Math.random() * 400);
        }
        if (step % 16 === 0) {
          this.playDrum();
        }
      }, 700);
      return true;
    }
  }

  public getIsPlayingAmbient(): boolean {
    return this.isPlayingAmbient;
  }
}

export const soundController = new TraditionalAudioController();
