# Town concept (v3.0 draft)

The layout reference is `design/mockup-town.html`: open it in a browser. It is a flat isometric drawing of the town (districts, connections, hamburger modal, district card). The real scene is 3D, built to the quality bar in SPEC §4.13.

What the mockup defines:
- **Placement** of the 9 districts and the 7 connection types (SPEC §3.4, §3.5). Anchors in code follow it.
- **Navigation:** no header bar; one 40 px hamburger top-left opens a modal (SPEC §3.6).
- **Camera levels:** town, then district (the mockup animates this by zooming the drawing).
- **Colours:** only tokens from `design/tokens.json`; the scene keeps daylight colours in both UI themes.

Not defined by the mockup: 3D model detail, lighting and simulation UI (see SPEC §4.4, §4.9, §4.13).

The mockup also has a **Follow the data** guided tour (button at the bottom of the Town page): 7 steps that highlight, one at a time, how a job moves through the connected districts. The real app should keep this tour.
