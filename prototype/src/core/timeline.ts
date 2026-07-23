export type PlayCallback = (frame: number) => void;

export class TimelinePlayer {
  private playing = false;
  private raf = 0;
  private acc = 0;
  private last = 0;
  private frame = 0;
  private fps = 12;
  private duration = 24;
  private onFrame: PlayCallback;

  constructor(onFrame: PlayCallback) {
    this.onFrame = onFrame;
  }

  configure(fps: number, duration: number, frame: number): void {
    this.fps = fps;
    this.duration = duration;
    this.frame = frame;
  }

  get current(): number {
    return this.frame;
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  setFrame(f: number): void {
    this.frame = ((f % this.duration) + this.duration) % this.duration;
    this.onFrame(this.frame);
  }

  play(): void {
    if (this.playing) return;
    this.playing = true;
    this.last = performance.now();
    this.acc = 0;
    const loop = (now: number) => {
      if (!this.playing) return;
      const dt = now - this.last;
      this.last = now;
      this.acc += dt;
      const frameMs = 1000 / this.fps;
      while (this.acc >= frameMs) {
        this.acc -= frameMs;
        this.frame = (this.frame + 1) % this.duration;
        this.onFrame(this.frame);
      }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  pause(): void {
    this.playing = false;
    cancelAnimationFrame(this.raf);
  }

  toggle(): void {
    if (this.playing) this.pause();
    else this.play();
  }
}
