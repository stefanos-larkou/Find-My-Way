# Find My Way

A pathfinding visualiser on a hexagonal lattice. Watch five search algorithms explore the same
irregular map, draw walls and rough ground for them to negotiate, and scrub through the search one
step at a time to see exactly what each one looked at and what route it settled on.

React component library, built to be dropped into a host application and take its theme.

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
  - [Repository layout](#repository-layout)
  - [The event stream](#the-event-stream)
  - [Axial coordinates](#axial-coordinates)
  - [How a map is generated](#how-a-map-is-generated)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Running the harness](#running-the-harness)
- [Using it in an application](#using-it-in-an-application)
  - [FindMyWay](#findmyway)
  - [AutoSearch](#autosearch)
  - [Theme inheritance](#theme-inheritance)
- [Testing](#testing)
- [Licence](#licence)

## Features

| Algorithm | Route it finds | Cells it explores |
| --- | --- | --- |
| Breadth-First | Fewest steps, ignoring cost | Everything nearer than the end |
| Depth-First | Any route, usually a poor one | Anything from a fraction to nearly all |
| Dijkstra | Cheapest, counting terrain | Most of the map |
| Greedy Best-First | Often poor | Few |
| A* | Cheapest, counting terrain | Few |

**Editing**: Draw walls and terrain by dragging across the map. Endpoints are always ordinary
ground.

**Playback**: Play, pause, step forwards or backwards by a configurable number of events, scrub
anywhere in the search, restart the playback. The board redraws from whatever position the
scrubber holds, nothing is accumulated frame to frame. When the search finishes, a summary of
the route's length and cost is shown.

**The route**: Drawn as a line through the cells it passes, shaded from the start's colour to the
end's, so a route that doubles back through a crowded region is still legible as a path rather than
a blob.

**Throughout**: Light and dark palettes chosen by the host's theme, a canvas that resizes with its
container, and every control persisted to `localStorage` under `find-my-way:*`.

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | React 19 |
| Language | TypeScript 6.0 |
| UI | MUI 9 with Emotion |
| Rendering | Canvas 2D |
| Build | Vite 8, library mode with `vite-plugin-dts` |
| Tests | Vitest 4 with jsdom and React Testing Library |

## Architecture

The library is a thin shell of React around a core that knows nothing about React, the DOM, or the
canvas. Every search, every piece of geometry and every scale is a pure function, which is where
almost all of the test coverage lives.

### Repository layout

```text
src/
  core/            Pure logic - no React, no DOM, no canvas
    algorithms/    One search per file, plus the registry that names them
  render/          Canvas drawing and the geometry it needs
  components/      MUI controls and the component shell
  hooks/           React state and effects
  dev/             Local harness for debugging, not shipped
```

### The event stream

A search is a pure function that returns its whole result at once as an ordered list:

```ts
type SearchEvent = { type: "visit"; hex: Hex } | { type: "path"; hexes: Hex[] };
```

It never calls back into a renderer and never knows one exists. The component replays that list, and
playback is a single fractional index into it: `rolesAt` slices `0 … floor(index) + 1` and applies
each event to a fresh copy of the map.

Three things follow from this:

- **Scrubbing is free.** Any position in the search is one slice away, backwards or forwards.
- **Tests can assert a sequence** without rendering anything.
- **Speed is decoupled from frame rate.** The index advances by elapsed time multiplied by the
    rate.

The index starts at `-1`, meaning nothing revealed, so a search that finds nothing still visibly
tries rather than sitting at its first event from the outset.

On the last point, `requestAnimationFrame` fires once per display refresh, so a 60Hz screen gives
a frame every `1 / 60 = 16.67ms`. `advanceIndex` turns that into a distance:

```text
16.67ms / 1000 x 2000 events per second = 33.3 events in that frame
```

### Axial coordinates

Hexes are addressed as `{ q, r }`: two axes, sixty degrees apart, no diagonals and six equidistant
neighbours. `x` and `y` are reserved for pixels.

The third cube coordinate is implied, `s = -q - r`, which is what makes distance a closed form:

```ts
distance = (|dq| + |dr| + |ds|) / 2
```

### How a map is generated

Maps are grown from a seed cell rather than carved out of a rectangle, so connectivity is
structural: every cell is placed adjacent to one already placed, and nothing can be walled off by
accident.

Growth happens in two phases. For the first 70% of the cell budget, complexity decides how often the
newest frontier cell is chosen over a random one; picking the newest always is depth-first growth,
which produces a long winding snake. The remaining 30% are placed uniformly along the whole
frontier, which thickens those corridors into something with shoulders and loops.

Without that second phase, a map at full complexity is 81% **forced cells**, leaving the algorithms
little to disagree about. With it, that falls to about 26%. Forced cells were counted over five
seeds at 400 cells and complexity 1, which is how those percentages come about.

`generation.test.ts` pins the result at under 40%, loose enough not to be brittle across seeds and
tight enough that reverting to single-phase growth fails it:

```ts
const map = generateMap(optionsFor(400, 1), createRandom(11));
const forced = openCells(map).filter(hex => neighbours(map, hex).length <= 2);
expect(forced.length / openCells(map).length).toBeLessThan(0.4);
```

## Getting started

### Prerequisites

- Node 24+

### Running the harness

```bash
npm install
npm start
```

| Command | What it does |
| --- | --- |
| `npm start` | Harness at `http://localhost:5173` |
| `npm test` | Vitest, headless |
| `npm run lint` | ESLint |
| `npm run build` | Library bundle and type declarations into `dist/` |
| `npm run check` | Lint, test and build - what CI runs |

## Using it in an application

Install it as a git dependency. There is no published package:

```bash
npm i github:stefanos-larkou/Find-My-Way
```

`prepare` builds `dist/` on install, so the consumer never sees TypeScript source.

### FindMyWay

The whole visualiser, controls and all. Takes no props - it owns its own state and persists it.

```tsx
import { FindMyWay } from "@stefanos-larkou/find-my-way";

<FindMyWay />
```

### AutoSearch

A bare board with no controls, which plays itself and reports when it is done. Built for
decorative use.

```tsx
import { AutoSearch } from "@stefanos-larkou/find-my-way";

<AutoSearch
    key={run.id}
    seed={run.seed}
    cellCount={220}
    complexity={0.6}
    speed={120}
    algorithm="a-star"
    terrain
    onFinished={next}
/>
```

> **Give every run a fresh `key`.** `AutoSearch` runs once per mount. Changing `seed` on a live
> instance leaves its "already reported" flag set, so `onFinished` never fires again, and the
> playback keeps its index across the change, so a shorter new search can read as finished the
> moment it starts.

`complexity` is 0-1 and `speed` is events per second. Keep `cellCount` modest for background use,
each instance owns an animation frame loop and redraws every cell.

### Theme inheritance

The library never calls `createTheme`. It reads the host's theme through context, which holds only
while there is **one copy** of React, MUI and Emotion in the tree. A second copy is not an error, the component simply reads a default theme and the host's palette silently fails to apply.

It reads only tokens every host has: `palette.primary`, `palette.background`, `spacing`,
`breakpoints`, and `palette.mode` to choose between the light and dark canvas palettes.

## Testing

```bash
npm test
```

Headless, no browser and no server. Every module with behaviour has a test beside it; data, types
and the dev harness do not.

Shared behaviour is tested by looping the registry, so a new algorithm is covered the moment it is
registered. A per-algorithm file then asserts only what that one uniquely promises, e.g., that A*
matches Dijkstra's cost for fewer visits.

Random output is tested by its invariants rather than its value: a generated map has the requested
number of cells, is fully connected, and is windier at higher complexity.

The canvas itself is not tested. jsdom has no rendering context, so the drawing code is kept free of
decisions and the decisions are tested where they are made. What _is_ tested is that a canvas was
found and prepared.

## Licence

MIT ([LICENSE](LICENSE)).
