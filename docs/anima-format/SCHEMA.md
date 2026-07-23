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
│   ├── drawings/{drawingId}.json   # Drawing bank entries (Part 2A.6) — schema in Part 3
│   ├── takes/{takeId}.json         # Live Performance takes (Part 2B.5)
│   ├── behaviors/{behaviorId}.json # Behavior blocks (Part 2B.7) — schema in Part 3
│   └── swapsets/{swapSetId}.json   # Layer-swap sets (Part 2B.3) — schema in Part 3
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
6. **Home workspace:** Layer `type` / metadata imply which workspace may edit in place (Part 2 global rules); visibility is universal.

## Part 2–implied assets (schemas deferred to Part 3)

Part 2 introduces several first-class concepts. Paths are reserved now; **JSON Schema files will land with Part 3** so the scene-graph pass stays coherent:

| Concept | Home | Reserved path / notes |
|---------|------|------------------------|
| Drawing bank entry | Draw | `assets/drawings/{id}.json` — strokes + name; exposures reference `drawingId` |
| Exposure / cel cycle | Draw | Channel path e.g. `exposures` with hold/cycle modifiers |
| Swap set | Rig | `assets/swapsets/{id}.json` — angle or trigger → drawing/sprite |
| Viseme take | Rig | Take asset + channel keys using 12-viseme enum from Part 2B.5 |
| Behavior block | Rig | `assets/behaviors/{id}.json` — non-destructive layered modifiers |
| Cleanup stack | Draw | Layer metadata `cleanupStages: rough\|tiedown\|clean\|color` |

## Schema index

| Schema | Path |
|--------|------|
| Project | [`schemas/Project.json`](./schemas/Project.json) |
| Scene | [`schemas/Scene.json`](./schemas/Scene.json) |
| Layer | [`schemas/Layer.json`](./schemas/Layer.json) |
| Bone | [`schemas/Bone.json`](./schemas/Bone.json) |
| Keyframe | [`schemas/Keyframe.json`](./schemas/Keyframe.json) |
| Node | [`schemas/Node.json`](./schemas/Node.json) |
| Drawing / SwapSet / Behavior | *Pending Part 3* |

## Example

Complete mini production: [`examples/bouncing-ball-scene.json`](./examples/bouncing-ball-scene.json) — bouncing ball strokes, one rigged character, one glow composite node.

## Validation

```bash
# Conceptual — M2 tooling
anima validate path/to/project.anima
```

Prototype TypeScript types mirror these schemas under `prototype/src/core/`.
