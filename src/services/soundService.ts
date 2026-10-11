/**
 * Procedural Web Audio Engine for Muhasabah Sharif
 * Synthesizes peaceful singing bowls, Solfeggio frequencies, and soft chimes
 * Zero external audio downloads, zero network lag, completely offline
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private mutedState: boolean = false;

  constructor() {
    const savedMute = localStorage.getItem('muhasaba_sound_muted');
    this.mutedState = savedMute === 'true';
  }

  private getContext(): AudioContext | null {
    if (this.mutedState) return null;
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public isSoundMuted(): boolean {
    return this.mutedState;
  }

  public isMuted(): boolean {
    return this.mutedState;
  }

  public setSoundMuted(muted: boolean) {
    this.mutedState = muted;
    localStorage.setItem('muhasaba_sound_muted', String(muted));
  }

  public toggleMute(): boolean {
    this.setSoundMuted(!this.mutedState);
    return this.mutedState;
  }

  public playSuccessFanfare() {
    this.playSealChime();
  }

  /**
   * Soft resonant bead tap chime (Solfeggio 528Hz with subtle octave harmonic)
   */
  public playBeadChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Fundamental oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, now); // Solfeggio Miracle/Transformation frequency
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.35);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);

      // Soft harmonic shimmer
      const harmOsc = ctx.createOscillator();
      const harmGain = ctx.createGain();
      harmOsc.type = 'sine';
      harmOsc.frequency.setValueAtTime(1056, now);
      harmGain.gain.setValueAtTime(0.04, now);
      harmGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.3);

      harmOsc.connect(harmGain);
      harmGain.connect(ctx.destination);

      harmOsc.start(now);
      harmOsc.stop(now + 0.3);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Deep peaceful singing bowl tone (432Hz natural tuning) for stage progress
   */
  public playStepTransition() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, now);
      osc.frequency.exponentialRampToValueAtTime(430, now + 0.8);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.9);
    } catch {}
  }

  /**
   * Resonant Celestial Triad Chime for sealing the night record
   */
  public playSealChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const freqs = [396, 528, 639]; // Solfeggio Triad
      const now = ctx.currentTime;

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.1, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + 1.8);
      });
    } catch {}
  }
}

export const sound = new SoundService();
export const soundEffects = sound;
