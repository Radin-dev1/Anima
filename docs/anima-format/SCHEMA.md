# ANIMA File Format (`.anima`)

**Version:** 1.0.0-draft  
**MIME:** `application/vnd.anima.project+zip`  
**Extension:** `.anima`

A `.anima` project is a ZIP archive (STORE or DEFLATE) with deterministic paths. JSON is UTF-8. Binary assets are content-addressed under `assets/`.

## Zip layout

```
project.anima
├── manifest.json              # format version, hashes, created/modified
├── project.json               # Project root (see schemas/Project.json)
├── sequences/
│   └── {sequenceId}.json
├── scenes/
│   └── {sceneId}.json         # Scene + layers/channels/keyframes inline or refs
├── nodes/
│   └── {compGraphId}.json     # Optional extracted composite graphs
├── assets/
│   ├── rasters/{sha256}.{ext}
│   ├── meshes/{sha256}.bin
│   ├── audio/{sha256}.{ext}
│   ├── brushes/{presetId}.json
│   └── takes/{takeId}.json
├── previews/
│   └── {sceneId}.webp         # Optional poster frames
└── yjs/
    └── snapshot.bin           # Optional CRDT snapshot (Studio/Creator sync)
```

## manifest.json

```json
{
  "format": "anima",
  "formatVersion": "1.0.0",
  "appVersion": "0.1.0",
  "createdAt": "2026-07-23T12:00:00Z",
  "modifiedAt": "2026-07-23T12:00:00Z",
  "projectId": "proj_bouncing_ball_demo",
  "contentHash": "sha256-...",
  "encryption": null
}
```

## Design rules

1. **Non-destructive:** Prefer references and channel data over baked rasters.
2. **IDs:** `ulid` or `cuid`-style strings; stable across saves.
3. **Color:** Float RGBA **linear** in JSON; 8-bit files tagged with color space.
4. **Time:** Integer frames on channels; `fps` on Scene/Sequence.
5. **Alpha:** Premultiplied in engine; PNG assets may be straight (flag `alphaMode`).

## Schema index

| Schema | Path |
|--------|------|
| Project | [`schemas/Project.json`](./schemas/Project.json) |
| Scene | [`schemas/Scene.json`](./schemas/Scene.json) |
| Layer | [`schemas/Layer.json`](./schemas/Layer.json) |
| Bone | [`schemas/Bone.json`](./schemas/Bone.json) |
| Keyframe | [`schemas/Keyframe.json`](./schemas/Keyframe.json) |
| Node | [`schemas/Node.json`](./schemas/Node.json) |

## Example

Complete mini production: [`examples/bouncing-ball-scene.json`](./examples/bouncing-ball-scene.json) — bouncing ball strokes, one rigged character, one glow composite node.

## Validation

```bash
# Conceptual — M2 tooling
anima validate path/to/project.anima
```

Prototype TypeScript types mirror these schemas under `prototype/src/core/`.
