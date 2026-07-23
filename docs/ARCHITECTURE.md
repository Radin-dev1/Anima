# ANIMA Architecture

Canonical stack: **Rust + wgpu core**, **Tauri 2 + React** desktop shell, **Python (PyO3)** scripting, **QuickJS** expressions, **Yjs** sync, **WASM** reduced web build.

## 1. Core engine

```mermaid
flowchart TB
  subgraph Shell["Desktop Shell — Tauri + React"]
    UI[Panels / Timeline / Command Palette]
    IPC[Tauri IPC]
  end

  subgraph Core["Rust Core"]
    SG[Scene Graph Evaluator]
    TL[Timeline / Channels / Keys]
    DR[Draw Engine — strokes + tiles]
    RG[Rig Solver — FK/IK/Dynamics]
    CG[Composite Graph VM]
    CACHE[Tile / Mesh Cache]
    IO[.anima Zip IO]
  end

  subgraph GPU["wgpu Backend"]
    VK[Vulkan]
    MTL[Metal]
    DX[DX12]
  end

  UI --> IPC --> SG
  SG --> TL
  SG --> DR
  SG --> RG
  SG --> CG
  DR --> CACHE
  RG --> CACHE
  CG --> CACHE
  CACHE --> GPU
  IO --> SG
```

## 2. Three workspaces ↔ shared graph

```mermaid
flowchart LR
  subgraph Graph["Shared Scene Graph"]
    P[Project]
    SEQ[Sequences]
    SC[Scenes]
    L[Layers]
    CH[Channels]
    KF[Keyframes]
    P --> SEQ --> SC --> L --> CH --> KF
  end

  DS[Draw Space View]
  RS[Rig Space View]
  CS[Composite Space View]
  SE[Sequence Editor View]

  DS --> L
  RS --> L
  CS --> SC
  SE --> SEQ
```

Switching workspaces flushes buffers and rebinds tools; it does **not** bake layers.

## 3. AI services

```mermaid
flowchart TB
  PB[Prompt Bar / Feature UI]
  ROUTER[Intent Router + Safety Rails]

  subgraph OnDevice["On-device"]
    IB1[Light Inbetween]
    CL1[Cleanup Preview]
    LS1[Lipsync Small]
    TR[Face / Hand Track]
  end

  subgraph Cloud["Cloud — Creator+"]
    IB2[Heavy Inbetween]
    ANIM[Text-to-Animatic]
    ST[Style Transfer]
    MC[Mocap Solve]
  end

  NATIVE[Native Writers — strokes / bones / keys / nodes]
  SG[(Scene Graph)]

  PB --> ROUTER
  ROUTER --> OnDevice
  ROUTER --> Cloud
  OnDevice --> NATIVE
  Cloud --> NATIVE
  NATIVE --> SG
```

**Hard rule:** AI never terminates in non-editable video as the deliverable artifact.

## 4. Sync server (Creator / Studio)

```mermaid
flowchart LR
  C1[Client A — Yjs]
  C2[Client B — Yjs]
  AW[Awareness Presence]
  LOCK[Soft Lock Service]
  DOC[(Document Store)]
  ASSET[(CAS Asset Store)]
  VC[Git-semantics VC]

  C1 <-->|WebSocket| DOC
  C2 <-->|WebSocket| DOC
  C1 --- AW
  C2 --- AW
  C1 --- LOCK
  C2 --- LOCK
  DOC --> VC
  C1 --> ASSET
  C2 --> ASSET
```

## 5. Render pipeline

```mermaid
flowchart TB
  EVAL[Evaluate channels at frame t]
  DRAW[Build drawable list]
  HIT{Tile cache hit?}
  RAST[Tessellate / rasterize strokes]
  RIG[Skin meshes / apply bones]
  COMP[Composite layers premul linear]
  NODE[Node graph FX]
  OCIO[Display transform sRGB]
  OUT[Swapchain / File Output / Farm]

  EVAL --> DRAW --> HIT
  HIT -->|yes| COMP
  HIT -->|no| RAST --> RIG --> COMP
  COMP --> NODE --> OCIO --> OUT
```

## 6. Process boundaries

| Process | Responsibility |
|---------|----------------|
| UI (React) | Chrome, panels, dials, collab cursors |
| Engine (Rust) | Graph, GPU, IO, solvers |
| AI worker | ONNX/local inference; sandboxed |
| Sync sidecar | Yjs provider; optional embedded for solo |

## 7. Web reduced build

WASM module exposes Draw Space subset (strokes, onion, timeline, GIF) matching the week-1 prototype schema — used for Review Mode playback and marketing PoC.
