import type { Channel, FrameDrawing, Layer, Project, Scene } from './types';
import { uid } from './types';

export function emptyDrawing(): FrameDrawing {
  return { strokes: [] };
}

export function createLayer(name: string, order: number): { layer: Layer; channel: Channel } {
  const layerId = uid('layer');
  const channelId = uid('ch');
  const layer: Layer = {
    id: layerId,
    name,
    type: 'rasterStroke',
    visible: true,
    locked: false,
    opacity: 1,
    blendMode: 'srcOver',
    channelIds: [channelId],
  };
  const channel: Channel = {
    id: channelId,
    layerId,
    path: 'frames',
    keyframes: [
      {
        id: uid('kf'),
        frame: 0,
        interp: 'hold',
        value: emptyDrawing(),
      },
    ],
  };
  void order;
  return { layer, channel };
}

export function createDemoProject(): Project {
  const { layer, channel } = createLayer('Ink', 0);
  const scene: Scene = {
    id: uid('scene'),
    name: 'Draw Space PoC',
    fps: 12,
    width: 960,
    height: 540,
    durationFrames: 24,
    backgroundColor: '#1a1d24',
    layers: [layer],
    channels: [channel],
  };
  return {
    id: uid('proj'),
    name: 'ANIMA Prototype',
    version: '0.1.0',
    defaultSceneId: scene.id,
    scenes: [scene],
  };
}

export function getScene(project: Project): Scene {
  const scene = project.scenes.find((s) => s.id === project.defaultSceneId) ?? project.scenes[0];
  if (!scene) throw new Error('Project has no scenes');
  return scene;
}

export function getFrameChannel(scene: Scene, layerId: string): Channel | undefined {
  const layer = scene.layers.find((l) => l.id === layerId);
  if (!layer) return undefined;
  const chId = layer.channelIds[0];
  return scene.channels.find((c) => c.id === chId && c.path === 'frames');
}

/** Hold-interpolation: last keyframe at or before frame */
export function drawingAtFrame(channel: Channel, frame: number): FrameDrawing {
  const sorted = [...channel.keyframes].sort((a, b) => a.frame - b.frame);
  let current = emptyDrawing();
  for (const kf of sorted) {
    if (kf.frame > frame) break;
    current = kf.value;
  }
  return current;
}

export function ensureKeyframe(channel: Channel, frame: number): FrameDrawing {
  const existing = channel.keyframes.find((k) => k.frame === frame);
  if (existing) return existing.value;
  const prev = drawingAtFrame(channel, frame);
  const clone: FrameDrawing = {
    strokes: prev.strokes.map((s) => ({
      ...s,
      id: uid('stroke'),
      points: s.points.map((p) => ({ ...p })),
    })),
  };
  channel.keyframes.push({
    id: uid('kf'),
    frame,
    interp: 'hold',
    value: clone,
  });
  channel.keyframes.sort((a, b) => a.frame - b.frame);
  return clone;
}

export function clearFrame(channel: Channel, frame: number): void {
  const kf = channel.keyframes.find((k) => k.frame === frame);
  if (kf) {
    kf.value = emptyDrawing();
  } else {
    channel.keyframes.push({
      id: uid('kf'),
      frame,
      interp: 'hold',
      value: emptyDrawing(),
    });
    channel.keyframes.sort((a, b) => a.frame - b.frame);
  }
}

export function framesWithKeys(channel: Channel): number[] {
  return channel.keyframes.filter((k) => k.value.strokes.length > 0).map((k) => k.frame);
}
