/** Scene-graph types mirroring docs/anima-format/schemas */

export type BlendMode = 'srcOver' | 'multiply' | 'screen';

export type Interp = 'hold' | 'linear' | 'bezier';

export interface StrokePoint {
  x: number;
  y: number;
  /** Pressure 0–1; default 0.5 when device omits */
  p: number;
}

export interface Stroke {
  id: string;
  color: string;
  size: number;
  points: StrokePoint[];
  erase?: boolean;
}

export interface FrameDrawing {
  strokes: Stroke[];
}

export interface Keyframe<T = unknown> {
  id: string;
  frame: number;
  value: T;
  interp: Interp;
}

export interface Channel {
  id: string;
  layerId: string;
  /** e.g. "frames" */
  path: string;
  keyframes: Keyframe<FrameDrawing>[];
}

export interface Layer {
  id: string;
  name: string;
  type: 'rasterStroke';
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  channelIds: string[];
}

export interface Scene {
  id: string;
  name: string;
  fps: number;
  width: number;
  height: number;
  durationFrames: number;
  backgroundColor: string;
  layers: Layer[];
  channels: Channel[];
}

export interface Project {
  id: string;
  name: string;
  version: string;
  defaultSceneId: string;
  scenes: Scene[];
}

export interface OnionSettings {
  enabled: boolean;
  before: number;
  after: number;
  falloff: number;
  /** Cool tint — Part 2A.3 default #5B8CFF */
  beforeTint: string;
  /** Warm tint — Part 2A.3 default #FF8A5B */
  afterTint: string;
  /** When true, onion only frames that have key drawings (Part 2A.3 keys-only) */
  keysOnly: boolean;
}

export interface BrushSettings {
  color: string;
  size: number;
  tool: 'brush' | 'eraser';
}

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
