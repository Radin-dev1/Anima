# ANIMA Product Specification

**Version:** 0.1.0-draft  
**Status:** Canonical for M1–M6 planning  
**Format companion:** [`anima-format/SCHEMA.md`](./anima-format/SCHEMA.md)

This document is the product source of truth. Decisions are concrete; each major choice includes a one-sentence justification.

---

# PART 1 — Product Vision & Positioning

## 1.1 Elevator pitch

ANIMA is a professional animation platform that unifies frame-by-frame drawing, character rigging with live performance capture, and node-based compositing inside one non-destructive scene graph — so artists never leave the app to clean up, composite, or hand animation to collaborators, and every AI assist emits editable native strokes, bones, and nodes instead of locked video.

## 1.2 Tagline

**One canvas. Three workspaces. Native data everywhere.**

## 1.3 Mission

Give independent creators and small studios a Harmony-class pipeline without Harmony-class cost or fragmentation, by treating drawing, rigging, and compositing as views of the same scene graph rather than separate products glued by export.

## 1.4 Target users (priority order)

| Priority | Audience | Primary job-to-be-done | Success metric |
|----------|----------|------------------------|----------------|
| 1 | **Indie 2D animators** (freelance / YouTube / short film) | Ship polished shorts without hopping Toon Boom → AE → Premiere | Time from rough to export ↓ 40% vs multi-app |
| 2 | **Small studios (2–15 seats)** | Collaborate on sequences with review, locks, and shared library | Review cycle length ↓; fewer “wrong file” incidents |
| 3 | **Motion designers / hybrid 2.5D** | Rig + LIVE PERFORMANCE + mograph nodes in one timeline | Takes → keyframes usable same day |
| 4 | **Educators / students** | Learn classical + digital animation with low cost and clear mental model | Free tier completion of first 12s loop |

*Justification for priority:* Indie volume drives product-led growth; studios fund Studio tier; motion designers validate Rig+Live; education fills Free funnel.

## 1.5 Core differentiators

1. **Three workspaces, one graph** — Draw / Rig / Composite never bake to flatten; switch preserves channels.
2. **AI → native data only** — Inbetweens are vector/raster strokes on layers; auto-rig is bones+weights; no “AI video” dead ends.
3. **LIVE PERFORMANCE MODE** — Webcam face, mic lipsync (12 visemes), hands, MIDI/gamepad → keyframes at &lt;100 ms glass-to-glass budget.
4. **Yjs collab + Git-semantics VC** — Soft locks and presence for live work; commits/branches/visual diffs for durable history.
5. **Hybrid 2D + reduced 3D** — glTF/FBX/OBJ with toon/NPR and baked physics keys inside the same camera as 2D cels.

## 1.6 Pricing — Free / Creator / Studio

### Free — $0

| Capability | Gate |
|------------|------|
| Projects | **1** active project |
| Resolution | Export up to **1080p**, 24/30 fps |
| Workspaces | Draw + Timeline; Rig (bones FK only, no Live); Composite (5 nodes max) |
| Collab | Local only; no cloud sync |
| AI | On-device only (inbetween preview, rough-to-clean preview); no cloud credits |
| Export | MP4 H.264, GIF, PNG sequence; **watermark** on Instagram/TikTok/YouTube presets |
| Asset library | Local folder only |
| Support | Community Discord |

### Creator — $19 / month (or $190 / year)

| Capability | Gate |
|------------|------|
| Projects | Unlimited |
| Resolution | Up to **4K**, custom fps including mixed timelines |
| Workspaces | Full Draw / Rig / Composite; LIVE PERFORMANCE MODE |
| Collab | Cloud sync **5 GB**; 2 concurrent presence users (personal share links) |
| AI | **2,000 cloud credits / mo** + unlimited on-device |
| Export | No watermark; ProRes 422; WebM; interactive web export |
| Asset library | Personal cloud library 5 GB |
| Support | Email, 48h SLA |

### Studio — $79 / seat / month (min 3 seats; annual preferred)

| Capability | Gate |
|------------|------|
| Everything in Creator | Yes |
| Collab | Soft locks, comments, voice hooks, **Review Mode**, SSO (SAML/OIDC) |
| Storage | **500 GB** team library + per-seat 50 GB working set |
| AI | **10,000 credits / seat / mo**; priority queue; private model endpoint option |
| Pipeline | Render farm CLI, batch watch folders, plugin SDK signing |
| VC | Git-semantics team remotes, protected branches, visual diff in Review |
| Support | Dedicated Slack/Teams, 8h business SLA, onboarding call |

*Justification:* Freemium conversion on watermark + project cap; Creator at indie price point under Toon Boom Harmony Essentials; Studio priced under Adobe Team + Harmony combo for small shops.

---

# PART 2 — Three-Workspace Architecture

**Shared rule:** Workspaces are *views* over the same `Scene` graph. Switching never rasterizes unless the user explicitly flattens a layer. Active tool, camera, and selection persist per-workspace in `workspaceState` but timeline playhead is global.

**On switch:**
1. Flush pending stroke/deform buffers to channels.
2. Rebind GPU resources for the target workspace’s default toolset.
3. Preserve selection if the selected node exists in the target view’s filter; else clear selection.
4. Emit `workspace.changed` for collab presence badges.

---

## 2A — Draw Space

### Panel layout (default, Standard density)

| Region | % width/height | Panels |
|--------|----------------|--------|
| Left | 18% W | Tool shelf, Brush presets, Color/Ink |
| Center | 52% W × 70% H (above timeline) | Canvas (GPU hybrid) |
| Right | 30% W | Layers / Cels, X-Sheet, Onion/Light Table |
| Bottom | 100% W × 30% H | Unified Timeline + Audio scrub |

### Default toolset

Pencil, Ink Pen, Soft Brush, Hard Eraser, Soft Eraser, Fill Bucket, Lasso Select, Transform, Eyedropper, Hand, Zoom, Flip Peek, Cel Swap.

### Keyboard map (Draw defaults — remappable)

| Key | Action |
|-----|--------|
| `B` | Brush |
| `E` | Eraser |
| `G` | Fill |
| `V` | Transform |
| `I` | Eyedropper |
| `[` / `]` | Brush size −/+ |
| `{` / `}` | Softness −/+ |
| `,` / `.` | Prev / next frame |
| `Shift+,` / `Shift+.` | Prev / next keyframe only |
| `O` | Toggle onion skin |
| `L` | Light table |
| `F` | Flip peek (hold) |
| `1`–`9` | Cel swap slots |
| `Space` | Pan (hold) / Play-pause when not over canvas drag |
| `Ctrl+Z` / `Ctrl+Shift+Z` | Undo / Redo |
| `Ctrl+S` | Save / commit draft |

### Canvas engine

- **GPU raster + vector hybrid:** Strokes stored as pressure-rich polylines (`StrokePath`) with optional baked raster cache tiles (256×256, mipmapped). Vector remains source of truth for scale & AI; raster cache for paint-over and soft brushes.
- **Pointer:** Supports pressure (0–1), tilt (altitude/azimuth), velocity (px/ms). Velocity modulates size/opacity via brush curves.
- **Stabilization:** Dual mode — **pull-string** (length `L` px, default 12) + **averaging window** (`N` samples, default 5). Predictive smoothing extrapolates 1 sample ahead using last 3 deltas to reduce perceived lag (*justification:* pull-string for intentional curves; averaging for tremor; prediction recovers latency).
- **Coordinate space:** Scene camera → canvas view matrix; strokes in layer local space.

### Brush system

**Parameters per brush:**

```ts
interface BrushParams {
  sizePx: number;              // 0.5–1024
  sizePressure: Curve;         // maps pressure → size multiplier
  opacity: number;             // 0–1
  opacityPressure: Curve;
  flow: number;                // 0–1 per dab
  spacing: number;             // fraction of size, default 0.12
  hardness: number;            // 0–1 (raster)
  scatter: number;             // 0–1
  angle: number;               // degrees
  angleJitter: number;
  tiltAffordance: boolean;     // size/angle from stylus tilt
  velocitySize: Curve;
  blendMode: BlendMode;
  color: ColorRgbaLinear;
  antiAlias: boolean;
  vectorMode: 'polyline' | 'ribbon' | 'rasterOnly';
}
```

**Default brush set:** Pencil HB, Pencil 2B, Ink Nib, Ink Brush, Soft Air, Flat Marker, Texture Grain, Hard Eraser, Soft Eraser, Mix Blender.

**`.abr` import:** Parse Adobe Brush ABR v6/v7 brush tips into raster tip textures + approximate dynamics curves; store as `BrushPreset` with `source: "abr"`. Unsupported dynamics fall back to pressure size/opacity only (*justification:* 90% of community brushes are tip+pressure).

### Onion skinning

| Param | Spec |
|-------|------|
| Before / After count | `N_before`, `N_after` ∈ 0–10 (default 3/3) |
| Tinting | Before = cool `#5B8CFF` @ multiply; After = warm `#FF8A5B` @ multiply |
| Opacity falloff | `opacity_i = base * falloff^|i|` where `falloff` default 0.72 |
| Keyframes only | Optional filter: show only frames with keys on active layer |
| Relative to camera | Optional: transform onion frames by camera delta so pans don’t ghost incorrectly |

### Light table

Semi-transparent stack of selected reference layers/cels under the active drawing layer; opacity per-ref; can pin a still image or video frame. Does not write to export unless “flatten light table” is invoked.

### X-sheet bidirectional sync

X-Sheet columns map 1:1 to layers (or cel exposure columns). Editing exposure duration in X-Sheet writes `hold`/`empty` into the layer’s frame channel; scrubbing timeline highlights X-Sheet row. Cel labels, timing charts, and lip-sync viseme rows share the same frame index domain.

### Cel system

| Feature | Behavior |
|---------|----------|
| Substitution | Named cel library per layer; exposure points to `celId` |
| Auto-hold | Empty frames after a drawing inherit previous cel until next key |
| Cycles | `cycle(celIds[], lengthFrames)` channel modifier |
| Swap-on-keypress | Hotkeys `1`–`9` assign/swap cel under playhead for lip-sync / FX |

### Cleanup pipeline

Stages as non-destructive node stack on layer: **Despeckle → Centerline / Contour smooth → Gap close → Stroke unify**. Each stage stores params; output is a new editable stroke layer (or channel override), original preserved in stack.

### Paint & fill

- Gap-aware flood fill with `gapTolerancePx` (default 2).
- Region fill to vector closed paths when source strokes are vector.
- Flat color layers separate from line art; auto-color AI writes flat regions as fill paths.

### Flipping controls

Hold `F` or dedicated pedal mapping: ping-pong ±`K` frames (default 2) at `flipHz` (default 8). Used for arcs/volume checks.

### Mobile / touch mode

- Larger hit targets (Pro density off; Quick density default).
- Two-finger pan/zoom; Apple Pencil / Samsung S-Pen pressure.
- Tool shelf collapses to radial menu.
- Same `.anima` file; reduced brush set cached locally.

---

## 2B — Rig Space

### Panel layout

| Region | Content |
|--------|---------|
| Left | Rig tools, Bone tree, Constraints, Dynamics |
| Center | Viewport (2D mesh + optional 3D overlay), camera controls |
| Right | Properties, Deform weights, Layer-swap map, Live Performance panel |
| Bottom | Timeline (bone channels, takes) |

### Default toolset

Bone Create, Bone Edit, FK Pose, IK Handle, Weight Paint, Mesh Bind, Smart Bone Angle, Constraint Add, Layer Swap Map, Live Rec, Take Marker.

### Keyboard map (Rig)

| Key | Action |
|-----|--------|
| `Ctrl+B` | Add bone |
| `Tab` | FK / IK toggle on selected chain |
| `Q` / `W` / `E` | Select / Pose / Weight |
| `R` | Record Live take (toggle) |
| `T` | Insert take as keys |
| `Ctrl+R` | Auto-rig selected mesh/sprites |
| `,` / `.` | Frame step |

### 2D bones

- **FK / IK:** Two-bone and multi-bone CCD + FABRIK solvers; pole vectors; angle limits.
- **Smart bones:** Angle or translation of a control bone drives deformation / layer visibility / mesh morph via keyed curves.
- **Constraints:** Parent, Aim, Position, Rotation, Scale, Copy Transform, Spring (damped), Path.
- **Dynamics:** Verlet hair/cloth-lite on bone chains; bake to keys for export determinism.

### Mesh deformation

Skinning: linear blend skinning (max 4 influences/vertex). Lattice / envelope optional. Mesh stored as `MeshDeform` with bind pose; drawing layers can be textured onto mesh or vector warped via cage.

### Layer-swap rigging

Map bone/control states to cel swaps (mouth shapes, hands). Driven by float channels or Live viseme stream.

### Reduced 3D

| Import | glTF 2.0, FBX, OBJ |
|--------|---------------------|
| Rig | FK/IK on imported skeletons |
| Shading | PBR + **toon / NPR** ramp materials |
| Camera | **Unified** with 2D scene camera (orthographic or perspective) |
| Physics | Simulate in session → **bake to keyframes** (no runtime physics in final `.anima` playback) |

*Justification:* Baking physics keeps playback deterministic across collab clients and render farm.

### LIVE PERFORMANCE MODE (full spec)

**Goal:** Drive facial / lip / hand / trigger params into channels with **&lt;100 ms** motion-to-viewport latency.

#### Inputs → params

| Source | Output params |
|--------|---------------|
| Webcam face (MediaPipe / custom ONNX) | `browL`, `browR`, `eyeOpenL/R`, `eyeX/Y`, `jawOpen`, `mouthSmile`, `mouthFunnel`, `headYaw/Pitch/Roll` — each float 0–1 or ±1 |
| Mic lipsync | 12-viseme weights + energy |
| Hand tracking | Wrist, finger curl floats; gesture enums |
| Keyboard / MIDI / gamepad | Discrete triggers & continuous CC → channels |

#### 12-viseme set

`REST, A, E, I, O, U, F_V, L, W_Q, M_B_P, C_D_G_K_N_S_Z_TH, R`

#### Phoneme → viseme table (English ARPAbet subset)

| Phonemes | Viseme |
|----------|--------|
| `.` silence / SP | REST |
| `AA, AH, AO` | A |
| `EH, AE` | E |
| `IY, IH, AY` | I |
| `OW, OY` | O |
| `UW, UH, AW` | U |
| `F, V` | F_V |
| `L, EL` | L |
| `W, WH, Q` | W_Q |
| `M, B, P` | M_B_P |
| `CH, JH, SH, ZH, DH, TH, S, Z, T, D, G, K, N, NG` | C_D_G_K_N_S_Z_TH |
| `R, ER` | R |

Streaming ASR/phoneme aligner updates viseme weights with 30–50 ms audio look-ahead buffer; display delayed by same buffer to keep A/V sync inside latency budget.

#### Takes → keyframes

1. Arm channels for record.
2. `R` starts take; samples at timeline fps (interpolated from tracking @ 60–90 Hz).
3. Stop → Take asset in `takes[]`.
4. `T` or “Apply Take” writes cubic/hold keys; optional Butterworth denoise.

#### Latency pipeline (&lt;100 ms)

```
Camera/Mic → Capture (≤16ms) → Inference (≤33ms) → Param filter (≤8ms)
→ Channel write → GPU pose eval (≤8ms) → Present (≤16ms)  ≈ 81ms typical
```

Drop frames in inference before dropping UI; never block draw thread.

### Auto-rigging

Input: character sprite sheet or layered PSD/ANIMA layers. Output: bone hierarchy + weights + suggested smart-bone mouth/eye controls as native `Bone`/`MeshDeform` — user-refinable in Weight Paint.

### Walk / behavior system

Locomotion clips as reusable `BehaviorGraph` nodes: idle, walk, run, turn — blend by speed param. Foot IK optional. Exportable as clip library assets.

---

## 2C — Composite Space

### Panel layout

Left: Node catalog · Center: Node graph canvas · Right: Viewer + Layer (AE-style) list · Bottom: Timeline for time-remapped comps.

### Node graph categories

| Category | Example nodes |
|----------|----------------|
| Source | Scene/Layer Ref, Solid, Image, Video, Contour |
| Color | OCIO Grade, Curves, Hue/Sat, Levels |
| Blur/Distort | Gaussian, Directional, Radial, Wave, Magnify |
| Key/Matte | Chroma, Luma, Roto, Matte Ops |
| Time | Echo, Time Remap, Posterize Time |
| Vector/Mograph | Text, Shape, Repeater, Trim Paths, Wiggle |
| 3D Lite | Extrude, Environment Dome |
| AI | Style Transfer, Upscale (writes new layer ref, non-destructive) |
| Output | Viewer, File Output, Web Interactive |

### AE-style layer view mapping

Node graph is canonical. Layer view is a **filtered projection**: each top-level connected subgraph from a Scene Source becomes a layer row; blend mode ↔ over node; track matte ↔ matte link; effects stack ↔ linear chain of effect nodes. Reordering layers rewires z-order inputs. *Justification:* artists who think in AE layers get familiar UI without forking data model.

### Motion blur & speed ramp

- Motion blur: shutter angle 0–720°, samples 8–64; velocity from transform channels.
- Speed ramp: time remap channel on comp; graph editor editable; frame blend or optical-flow assist (AI optional → native warp mesh).

### JS expression language API

Sandboxed QuickJS (desktop) / constrained interpreter (web).

```js
// Bound names: time, fps, thisLayer, thisComp, thisChannel
// Example: wiggle-like
const amp = 20, freq = 2;
thisChannel.value + Math.sin(time * freq * Math.PI * 2) * amp;
```

API surface: `thisLayer.transform.*`, `comp.layer(name)`, `posterizeTime`, `loopIn/Out`, math helpers. No filesystem/network in expressions.

### Motion graphics toolkit

Text animators, path text, shape boolean ops, repeaters, gradient ramps, stroke trim — as first-class nodes writing to vector layers.

### Procedural environments

Parallax camera rigs, tiling texture planes, simple particle (GPU), sky/dome generators — params keyable.

### Stop motion module

Capture bay: camera device → frame hold into layer; onion for physical; cleanup AI → stroke/matte refinement; timing on X-sheet.

### Sequence editing

Sequence Editor workspace sibling: shot assemble from scenes, transitions, audio mix buses, export marks. Non-linear but animation-first (not a Premiere replacement for long-form editorial).

### Interactive / web output

Export scene subset as HTML/WebGL (WASM player) or Lottie-adjacent JSON for supported subset (shapes, transforms, sprites). Interactive hotspots as `InteractionNode` (click → play marker).

---

# PART 3 — Unified Timeline & Scene Graph

## 3.1 Hierarchy

```
Project
 └─ Sequences[]
     └─ Scenes[] / ShotRefs[]
         └─ Layers[]
             └─ Channels[]          // e.g. transform.x, brush.frames, bone.rot
                 └─ Keyframes[]
```

Also: `assets[]`, `brushPresets[]`, `takes[]`, `comments[]`, `historyRefs[]`.

## 3.2 Timeline features

| Feature | Spec |
|---------|------|
| Mixed fps | Sequence declares `timebase`; scenes may run at different fps with resample policy `hold` \| `blend` \| `optical` |
| Keyframe types | `hold`, `linear`, `bezier` (cubic), `bounce`, `elastic` presets |
| Graph editor | Channel curves; bezier handles in value/time |
| Dope sheet | Key diamonds across layers; box select; scale timing |
| Markers | Scene/sequence markers with color, name, chapter export |
| Audio scrub | Waveform under timeline; scrubbing plays grains; lipsync viseme lane |

## 3.3 Layer blending across paradigms

**Render order:** Bottom → top layers; Composite node graph may override with explicit z.

**Color:** Working space **linear Rec.709** (or ACES opt-in Studio); display **sRGB OETF**. UI color pickers show sRGB; storage float linear.

**Alpha:** **Premultiplied** in GPU framebuffer; file IO converts to/from straight as needed. *Justification:* premultiplied matches GPU blending and AE-compatible export paths.

## 3.4 `.anima` zip format

See [`anima-format/SCHEMA.md`](./anima-format/SCHEMA.md). Summary:

```
project.anima  (zip)
  manifest.json
  project.json
  sequences/{id}.json
  scenes/{id}.json
  assets/...
  previews/...
  yjs/          optional collab snapshot
```

## 3.5 JSON schemas

Authoritative schemas live in `docs/anima-format/schemas/`. Inline summaries:

### Layer (example)

```json
{
  "id": "layer_ink",
  "name": "Ink",
  "type": "rasterStroke",
  "visible": true,
  "locked": false,
  "blendMode": "srcOver",
  "opacity": 1.0,
  "channels": ["ch_frames", "ch_opacity"],
  "metadata": { "onionEligible": true }
}
```

### Bone (example)

```json
{
  "id": "bone_forearm_L",
  "name": "Forearm_L",
  "parentId": "bone_upperarm_L",
  "length": 120,
  "rest": { "x": 0, "y": 0, "rotation": 0, "scaleX": 1, "scaleY": 1 },
  "ik": { "enabled": true, "targetId": "ctrl_hand_L", "poleId": "pole_elbow_L" },
  "limits": { "rotationMin": -2.4, "rotationMax": 0.2 }
}
```

### Keyframe (example)

```json
{
  "id": "kf_01",
  "frame": 12,
  "value": 80.0,
  "interp": "bezier",
  "handles": { "in": { "dt": -3, "dv": 0 }, "out": { "dt": 3, "dv": 0 } }
}
```

### Node (composite example)

```json
{
  "id": "node_glow",
  "type": "blur.gaussian",
  "inputs": { "image": "node_beauty.output" },
  "params": { "radius": 12, "sigma": 4 },
  "outputs": { "output": "tex" }
}
```

## 3.6 Non-destructive everything

Mutations append to an operation log (local) / Yjs updates (collab). Flatten, bake, and rasterize create **new** layers or cache artifacts; sources remain unless user deletes. AI outputs land as sibling layers or channel overrides with provenance metadata `createdBy: "ai:<feature>:<model>"`.

---

# PART 4 — Collaboration

## 4.1 CRDT choice: **Yjs over Automerge**

**Decision:** Yjs.  
**Justification:** Mature CRDT ecosystem for rich editors, shared types for maps/arrays/binary, and proven presence/awareness APIs suited to canvas cursors and soft locks — Automerge’s document model is excellent for JSON but weaker ecosystem fit for high-frequency drawing strokes.

## 4.2 Soft locks

Users claim a lock on `layerId` | `boneId` | `nodeId` with TTL heartbeat (15s). Others see amber outline; edits are blocked client-side but CRDT still converges if violated (server may reject write with lock token). Hard locks not used — *justification:* animation needs glance edits without bureaucracy.

## 4.3 Presence

Awareness field: `{ userId, name, color, workspace, selection[], cursorWorld, playhead }`. Render remote cursors and playhead ghosts.

## 4.4 Comments & voice hooks

Pin comments to `{ sceneId, frame, worldPos?, layerId? }`. Voice hooks: optional WebRTC room per sequence (Studio); recordings attach as audio assets linked to comment threads.

## 4.5 Git-semantics version control

Commits snapshot `.anima` (chunked). Branches for experiments. Visual diff: layer thumbnail scrub, channel curve overlay, bone hierarchy diff, node graph diff. Merge: Yjs-assisted for non-overlapping; conflict UI for same channel keys.

## 4.6 Asset library

Team/personal library: brushes, cels, rigs, behaviors, comps. Content-addressed blobs; reference by hash in project.

## 4.7 Review Mode (Studio)

Read-only timeline + drawing annotations + approval states (`draft|inReview|approved|rejected`). Playlist of shots; version compare A/B. Export review PDF/CSV notes.

---

# PART 5 — AI Layer

## 5.1 Hard rule

**Every AI feature must emit editable native ANIMA data** (strokes, fills, bones, weights, keyframes, nodes). Video/pixel-only outputs are forbidden as final artifacts; temporary preview rasters allowed if discarded or converted.

## 5.2 Feature specs

| Feature | Input | Output type | UI entry | Manual refine |
|---------|-------|-------------|----------|---------------|
| **Inbetweening** | Two+ key drawings on layer | Intermediate `StrokePath` frames / raster strokes | Timeline “AI Inbetween” | Edit strokes; delete/regenerate range |
| **Auto-rig** | Character layers / mesh | `Bone[]` + weights + controls | Rig Space “Auto-Rig” | Weight paint, bone edit |
| **Rough-to-clean** | Rough stroke layer | Cleanup stack output layer | Draw cleanup panel | Adjust cleanup params; tweak vectors |
| **Auto-color** | Line art + palette hint | Fill path layer | Paint “Auto Color” | Bucket fix, palette remap |
| **Text-to-animatic** | Script + style refs | Sequence of rough scenes + markers | File → New from Script | Redraw; retime X-sheet |
| **Audio-to-performance** | Dialogue audio | Viseme keys + jaw/energy channels | Live / Timeline “Bake Lipsync” | Viseme editor, offset |
| **Style transfer node** | Source image + style ref | Composite node writing new layer ref | Composite catalog | Node params; paint mask |
| **Mocap** | Video / Live take | Bone channel keys | Live “Apply Take” | Graph editor smooth |
| **Stop-motion cleanup** | Captured frames | Denoise + matte + optional vectorize | Stop Motion bay | Matte edges, timing |

## 5.3 Prompt bar architecture + safety rails

- Global prompt bar (`Ctrl+K` AI mode): intent parser routes to feature tools with structured args.
- Rails: block CSAM / weapons-for-harm prompts; refuse to generate photoreal minors; watermark AI provenance in metadata; user assets never train global models without opt-in (Studio contract).
- Credit metering on cloud; clear “on-device” badge when local.

## 5.4 On-device vs cloud

| On-device | Cloud |
|----------|-------|
| Light inbetween, cleanup preview, lipsync small models, face/hand track | Heavy inbetween, text-to-animatic, style transfer, long mocap solve |
| Offline: cloud features disable with queued jobs when back online | Requires Creator+ |

---

# PART 6 — Technical Architecture

## 6.1 Stack decision

| Layer | Choice | Justification |
|-------|--------|---------------|
| Core engine | **Rust + wgpu** (Vulkan/Metal/DX12) | Predictable perf, portable GPU, safe systems code for timeline & tessellation |
| Desktop UI | **Tauri 2 + React** (panels) | Smaller than Electron; web-skill UI; native FS; pairs with WASM preview |
| Panels alternative rejected | egui/iced or Qt | egui less designer-friendly for complex panel chrome; Qt heavier licensing/skills split |
| Scripting | **Python via PyO3** | Pipeline TDs expect Python |
| Expressions | **JS (QuickJS)** | AE-familiar expressions |
| Mobile | **Rust FFI** → Swift/Kotlin UI | Share engine |
| Web | **WASM reduced build** | Draw PoC + review player; no full Live farm |

## 6.2 Rendering pipeline

```
Scene Graph Eval → Drawable List → Tile Cache Query →
Tessellate/Stroke Raster → Layer Composite (premul linear) →
OCIO Display Transform → Swapchain
```

Composite Space inserts node graph eval before final composite.

## 6.3 Performance budgets (requirements)

| Budget | Target |
|--------|--------|
| UI frame (idle scrub) | ≤ 16.7 ms (60 Hz) |
| Stroke-to-ink | ≤ 16 ms p95 |
| Live Performance glass-to-glass | &lt; 100 ms |
| 4K timeline scrub (cached) | ≥ 24 fps interactive |
| Project open (1 GB) | ≤ 5 s to editable |
| Collab stroke sync | ≤ 100 ms LAN awareness |

## 6.4 Caching

Immutable tile cache keyed by `(layerId, frame, cameraHash, fxHash)`. LRU + disk mmap. Invalidation on channel edit.

## 6.5 Plugins

WASM + native dylib plugins via stable C ABI `anima_plugin_v1`. Signed for Studio. Manifest declares capabilities (nodes, brushes, importers).

## 6.6 Data safety

Local autosave every 30s + crash journal; cloud CRDT snapshots; encryption at rest (Studio); no silent cloud training; export checksums in manifest.

---

# PART 7 — UX & Onboarding

## 7.1 Density modes

| Mode | Use |
|------|-----|
| **Quick** | Large controls, fewer panels — students / tablet |
| **Standard** | Default |
| **Pro** | Compact, maximum timeline rows, minimal chrome |

## 7.2 First-run 3-minute tutorial

1. Draw a bouncing ball (30s)  
2. Onion + scrub (45s)  
3. Add layer + GIF export (45s)  
4. Peek Rig: one bone wave (60s)  
5. Switch Composite: glow node (30s)  

Skip anytime; progress stored in user prefs.

## 7.3 Command palette & shortcuts

`Ctrl+K` / `Cmd+K` command palette. Remappable shortcuts. Bundled maps: **Blender**, **After Effects**, **Harmony**, **Photoshop** (+ ANIMA default).

## 7.4 Accessibility

WCAG 2.2 AA for UI chrome; screen reader labels on panels; colorblind-safe onion tints option; full keyboard canvas navigation mode; scalable UI 80–200%.

## 7.5 ASCII wireframes

See [`WIREFRAMES.md`](./WIREFRAMES.md) for full Draw / Rig / Composite / Sequence Editor layouts.

---

# PART 8 — Export & Interop

## 8.1 Video formats

| Format | Notes |
|--------|-------|
| MP4 H.264 / H.265 | Social + delivery |
| ProRes 422 / 4444 | Studio finishing |
| WebM VP9/AV1 | Web |
| PNG / EXR sequence | VFX pipe |
| GIF / APNG / WebP anim | Loops |
| WAV / AAC audio | Muxed or separate |

## 8.2 Social presets

| Preset | Size | FPS | Notes |
|--------|------|-----|-------|
| YouTube 1080 | 1920×1080 | 24/30/60 | Free watermark |
| YouTube 4K | 3840×2160 | 24/30 | Creator+ |
| Instagram Feed | 1080×1080 | 30 | |
| Instagram Story / Reels | 1080×1920 | 30 | |
| TikTok | 1080×1920 | 30 | |
| Twitter/X | 1920×1080 | 30 | |

## 8.3 Import / export matrix

| Type | Import | Export |
|------|--------|--------|
| PSD / PSB (layers) | ✓ | ✓ (flattened layers optional) |
| TVG / Toon Boom partial | ✓ (paths best-effort) | — |
| SVG | ✓ | ✓ |
| PNG/JPEG/TIFF/EXR | ✓ | ✓ |
| MP4/MOV/WebM | ✓ (ref) | ✓ |
| glTF / FBX / OBJ | ✓ | glTF ✓ |
| ABR brushes | ✓ | — |
| Lottie (subset) | ✓ | ✓ subset |
| `.anima` | ✓ | ✓ |

## 8.4 Batch / render farm CLI

```bash
anima render project.anima --sequence seq_main --out /renders \
  --format prores422 --farm --workers 8 --frame 1001-1480
```

Watch folder mode for Studio. Exit codes: 0 ok, 2 validation, 3 render fail, 4 license.

---

## Document history

| Ver | Date | Notes |
|-----|------|-------|
| 0.1.0 | 2026-07-23 | Initial exhaustive Parts 1–8 |
