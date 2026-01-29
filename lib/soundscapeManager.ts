const SOUNDSCAPE_PATH = "/soundscape/DTTM_Soundscape.mp3";
const FADE_DURATION_MS = 1000;
const TARGET_VOLUME = 0.3;

export class SoundscapeManager {
  private _audio: HTMLAudioElement | null = null;
  private isGlobalMute = false;
  private isMutedByMusic = false;
  private fadeInterval: ReturnType<typeof setInterval> | null = null;

  private getAudio(): HTMLAudioElement | null {
    if (typeof window === "undefined") return null;
    if (!this._audio) {
      this._audio = new Audio(SOUNDSCAPE_PATH);
      this._audio.loop = true;
      this._audio.volume = 0;
    }
    return this._audio;
  }

  private stopFade() {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
  }

  fadeOut() {
    this.isMutedByMusic = true;
    this.stopFade();
    const audio = this.getAudio();
    if (!audio) return;
    const startVol = audio.volume;
    const start = performance.now();
    this.fadeInterval = setInterval(() => {
      const elapsed = performance.now() - start;
      const t = Math.min(1, elapsed / FADE_DURATION_MS);
      const ease = 1 - t * t * (3 - 2 * t);
      audio.volume = Math.max(0, startVol * ease);
      if (t >= 1) this.stopFade();
    }, 50);
  }

  fadeIn() {
    this.isMutedByMusic = false;
    this.stopFade();
    if (this.isGlobalMute) return;
    const audio = this.getAudio();
    if (!audio) return;
    const startVol = audio.volume;
    const start = performance.now();
    this.fadeInterval = setInterval(() => {
      const elapsed = performance.now() - start;
      const t = Math.min(1, elapsed / FADE_DURATION_MS);
      const ease = t * t * (3 - 2 * t);
      audio.volume = startVol + (TARGET_VOLUME - startVol) * ease;
      if (t >= 1) this.stopFade();
    }, 50);
  }

  setGlobalMute(muted: boolean) {
    this.isGlobalMute = muted;
    this.stopFade();
    const audio = this.getAudio();
    if (!audio) return;
    if (muted) {
      audio.volume = 0;
      audio.pause();
    } else if (!this.isMutedByMusic) {
      audio.volume = TARGET_VOLUME;
      audio.play().catch(() => {});
    }
  }

  start() {
    const audio = this.getAudio();
    if (!audio || this.isGlobalMute) return;
    audio.volume = TARGET_VOLUME;
    audio.play().catch(() => {});
  }
}
