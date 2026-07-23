import type { Stroke, StrokePoint } from './types';
import { uid } from './types';

/** Pull-string + short averaging for stylus jitter (PoC-scale). */
export class StrokeStabilizer {
  private readonly stringLen: number;
  private readonly window: number;
  private queue: StrokePoint[] = [];
  private anchor: StrokePoint | null = null;

  constructor(stringLen = 10, window = 4) {
    this.stringLen = stringLen;
    this.window = window;
  }

  reset(): void {
    this.queue = [];
    this.anchor = null;
  }

  push(raw: StrokePoint): StrokePoint {
    this.queue.push(raw);
    if (this.queue.length > this.window) this.queue.shift();
    const avg = average(this.queue);
    if (!this.anchor) {
      this.anchor = { ...avg };
      return { ...avg };
    }
    const dx = avg.x - this.anchor.x;
    const dy = avg.y - this.anchor.y;
    const dist = Math.hypot(dx, dy);
    if (dist > this.stringLen) {
      const t = (dist - this.stringLen) / dist;
      this.anchor = {
        x: this.anchor.x + dx * t,
        y: this.anchor.y + dy * t,
        p: avg.p,
      };
    } else {
      this.anchor = { ...this.anchor, p: avg.p };
    }
    return { ...this.anchor };
  }
}

function average(pts: StrokePoint[]): StrokePoint {
  const n = pts.length || 1;
  let x = 0;
  let y = 0;
  let p = 0;
  for (const pt of pts) {
    x += pt.x;
    y += pt.y;
    p += pt.p;
  }
  return { x: x / n, y: y / n, p: p / n };
}

export function createStroke(color: string, size: number, erase: boolean): Stroke {
  return {
    id: uid('stroke'),
    color,
    size,
    points: [],
    erase,
  };
}

export function paintStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  tint?: string,
  alphaMul = 1,
): void {
  if (stroke.points.length < 2) {
    if (stroke.points.length === 1) {
      const pt = stroke.points[0]!;
      ctx.save();
      ctx.globalAlpha = alphaMul;
      ctx.fillStyle = tint ?? stroke.color;
      if (stroke.erase) ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, (stroke.size * pt.p) / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    return;
  }

  ctx.save();
  ctx.globalAlpha = alphaMul;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (stroke.erase) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = tint ?? stroke.color;
  }

  for (let i = 1; i < stroke.points.length; i++) {
    const a = stroke.points[i - 1]!;
    const b = stroke.points[i]!;
    const w = stroke.size * ((a.p + b.p) / 2);
    ctx.lineWidth = Math.max(0.5, w);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();
}
