# ANIMA Wireframes

ASCII layouts with approximate proportions. Density shown: **Standard**.  
Aligned with canonical [PRODUCT_SPEC.md Part 2](./PRODUCT_SPEC.md) panel layouts.

Legend: `[Panel]` · proportions as % of window. Shared timeline + playhead across all workspaces.

**Global chrome:** `[Draw | Rig | Composite | Seq]` tabs · `Tab` cycles workspaces · foreign layers show *Jump to home*.

---

## Draw Space (Part 2A)

Left **18%** tools/brushes · Center **~52%** canvas · Right **30%** layers / drawing bank / X-sheet / onion · Bottom **~30%** shared timeline.

```
+----------------------------------------------------------------------------------+
| ANIMA  [Draw|Rig|Composite|Seq]   scene_main   24fps   [Quick|Std|Pro]  user*    |  4%
+--------+-----------------------------------------------------------+-------------+
| TOOLS  |                                                           | LAYERS      |
| 18% W  |                    CANVAS                                 | DRAWING BANK|
|        |              GPU hybrid · 256px tiles                     | / CELS      |
| Brush  |         onion #5B8CFF / #FF8A5B · keys-only               | 30% W       |
| Erase  |         light table underlay · rotate/flip/mirror         | Ink         |
| Fill   |                                                           | Rough       |
| Lasso  |                                                           | Clean       |
| Xform  |                                                           |-------------+
| CelSwap|                                                           | X-SHEET     |
| BRUSH  |                                                           | exposures   |
| size[] |                                                           | timing chart|
| lock   |                                                           | audio col   |
| color  |                                                           |-------------+
| palette|                                                           | ONION / LT  |
|        |                                                           | N=3/3 falloff|
+--------+-----------------------------------------------------------+-------------+
| TIMELINE 100% W × ~30% H  (shared playhead · project-wide undo)                |
| |< playhead · layer rows · dope keys · markers · audio scrub                   |
+----------------------------------------------------------------------------------+
```

---

## Rig Space (Part 2B)

Left **16%** rig tools · Center viewport · Right **30%** properties / swap map / LIVE · Bottom shared timeline (bones, takes, behaviors).

```
+----------------------------------------------------------------------------------+
| ANIMA  [Draw|Rig|Composite|Seq]   LIVE armed   take_03                    user*  |
+--------+-----------------------------------------------------------+-------------+
| RIG    |                                                           | PROPERTIES  |
| TOOLS  |                   VIEWPORT                                | bone tree   |
| 16% W  |              mesh + bones + 3D overlay                    | constraints |
| Bone+  |                   IK handles · FK/IK                      | weights     |
| Pose   |                                                           |-------------+
| Weight |                                                           | LAYER-SWAP  |
| IK     |                                                           | mouths/hands|
| Bind   |                                                           | angle auto  |
| AutoRig|                                                           |-------------+
| Behav  |                                                           | LIVE PERF   |
|        |                                                           | face · 12   |
|        |                                                           | visemes     |
|        |                                                           | hands/MIDI  |
|        |                                                           | [R]ec [T]ake|
|        |                                                           | behaviors   |
+--------+-----------------------------------------------------------+-------------+
| TIMELINE — bone channels · takes · behavior layering (keys→loco→behaviors→dyn) |
+----------------------------------------------------------------------------------+
```

---

## Composite Space (Part 2C)

Left **16%** node catalog · Center **~44%** graph · Right viewer + AE-style layer projection · Bottom timeline / sequence.

```
+----------------------------------------------------------------------------------+
| ANIMA  [Draw|Rig|Composite|Seq]   comp_beauty_glow                           |
+-------------+------------------------------------------+-------------------------+
| NODE        |                                          | VIEWER                  |
| CATALOG     |           NODE GRAPH                     | ~40% W × ~50% H         |
| 16% W       |           ~44% W                         |                         |
| Input       |   [Scene]──[Glow]──[Merge]──[Out]        |                         |
| Filter      |                                          +-------------------------+
| Keying      |                                          | LAYER VIEW (AE-style)   |
| Generate    |                                          | synced projection       |
| Utility     |                                          | beauty                  |
| Output      |                                          |   └ glow                |
| Mograph     |                                          | output                  |
| StopMotion  |                                          |                         |
+-------------+------------------------------------------+-------------------------+
| TIMELINE — time remap · effect params · sequence clips when assembling           |
+----------------------------------------------------------------------------------+
```

---

## Sequence Editor (Composite 2C.7 assembly surface)

```
+----------------------------------------------------------------------------------+
| ANIMA  [Draw|Rig|Composite|Seq]   seq_main   review?                         |
+---------------------------+------------------------------------------------------+
| MEDIA / SCENES            |  PROGRAM MONITOR                                     |
| 22% W                     |  assembled shots · transitions                       |
| scene_main                |                                                      |
| scene_alt                 |                                                      |
| audio beds                |                                                      |
+---------------------------+------------------------------------------------------+
| SEQUENCE TIMELINE 100% W × ~42% H                                                |
| V1  [==== scene_main ====][== scene_alt ==]                                      |
| A1  [~~~~~~~~ dialogue ~~~~~~~~~~~~~~~~~~~~]                                     |
| markers · transitions · export range                                             |
+----------------------------------------------------------------------------------+
```

---

## First-run tutorial overlay (Draw)

```
+------------------ CANVAS ------------------+
|  (1/5) Draw a ball with B                  |
|     [ Got it ]     skip tutorial           |
+--------------------------------------------+
```
