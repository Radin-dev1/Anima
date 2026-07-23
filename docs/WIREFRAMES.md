# ANIMA Wireframes

ASCII layouts with approximate proportions. Density shown: **Standard**.

Legend: `[Panel]` · `=` splitter · proportions as % of window.

---

## Draw Space

```
+----------------------------------------------------------------------------------+
| ANIMA  [Draw|Rig|Composite|Seq]   scene_main   24fps   [Quick|Std|Pro]  user*    |  4%
+--------+-----------------------------------------------------------+-------------+
| TOOLS  |                                                           | LAYERS      |
| 18% W  |                    CANVAS                                 | / CELS      |
|        |                    ~52% W × 66% H                         | 30% W       |
| [B]rush|         GPU hybrid raster+vector                          |             |
| [E]rase|         onion tint before/after                           | Ball        |
| Fill   |         light table stack                                 | Character   |
| Lasso  |                                                           | Beauty      |
| Xform  |                                                           |-------------+
|        |                                                           | X-SHEET     |
| BRUSH  |                                                           | exposure    |
| size[] |                                                           | cel cols    |
| opac   |                                                           |-------------+
| color  |                                                           | ONION/LT    |
|        |                                                           | N=3/3       |
+--------+-----------------------------------------------------------+-------------+
| TIMELINE 100% W × 30% H                                                      |
| |< playhead                                                          audio ~  |
| layer rows · dope keys · markers                                             |
+----------------------------------------------------------------------------------+
```

**Focus:** Canvas is the hero; tools and cels support drawing without AE-style card clutter.

---

## Rig Space

```
+----------------------------------------------------------------------------------+
| ANIMA  [Draw|Rig|Composite|Seq]   LIVE idle   take_03                     user*  |
+--------+-----------------------------------------------------------+-------------+
| RIG    |                                                           | PROPERTIES  |
| TOOLS  |                   VIEWPORT                                | bone tree   |
| 16% W  |                   mesh + bones overlay                    | constraints |
| Bone+  |                   IK handles                              | weights     |
| Pose   |                                                           |-------------+
| Weight |                                                           | LIVE PERF   |
| IK     |                                                           | face meters |
| Bind   |                                                           | visemes 12  |
| AutoRig|                                                           | hands/MIDI  |
|        |                                                           | [R]ec [T]ake|
+--------+-----------------------------------------------------------+-------------+
| TIMELINE — bone channels / takes / behavior clips                            |
+----------------------------------------------------------------------------------+
```

---

## Composite Space

```
+----------------------------------------------------------------------------------+
| ANIMA  [Draw|Rig|Composite|Seq]   comp_beauty_glow                           |
+-------------+------------------------------------------+-------------------------+
| NODE        |                                          | VIEWER                  |
| CATALOG     |           NODE GRAPH                     | 40% W × 50% H           |
| 16% W       |           44% W                          |                         |
| Source      |   [Scene]──[Glow]──[Merge]──[Out]        |                         |
| Color       |                                          +-------------------------+
| Blur        |                                          | LAYER VIEW (AE-style)   |
| Key         |                                          | projection of graph     |
| Time        |                                          | beauty                  |
| Mograph     |                                          |   └ glow                |
| AI          |                                          | output                  |
+-------------+------------------------------------------+-------------------------+
| TIMELINE — time remap / effect params                                            |
+----------------------------------------------------------------------------------+
```

---

## Sequence Editor

```
+----------------------------------------------------------------------------------+
| ANIMA  [Draw|Rig|Composite|Seq]   seq_main   review?                         |
+---------------------------+------------------------------------------------------+
| MEDIA / SCENES            |  PROGRAM MONITOR                                     |
| 22% W                     |  preview of assembled shots                          |
| scene_main                |                                                      |
| scene_alt                 |                                                      |
| audio beds                |                                                      |
+---------------------------+------------------------------------------------------+
| SEQUENCE TIMELINE 100% W × 42% H                                                 |
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
