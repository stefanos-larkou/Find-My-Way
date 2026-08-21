import { useTheme } from "@mui/material/styles";
import { useMemo } from "react";
import type { Hex, HexMap, HexPair, Scene, SceneOptions, Search } from "../core/models";
import { ALGORITHMS, type SearchFn } from "../core/algorithms/registry";
import { furthestApart } from "../core/furthest";
import { generateMap, optionsFor } from "../core/generation";
import { withPlainGround, withWalls, withWeights } from "../core/grid";
import { outcomeOf, pathAt } from "../core/outcome";
import { createRandom } from "../core/random";
import { layoutFor } from "../render/geometry";
import { hexesToDraw, routeToDraw } from "../render/layout";
import { rolesAt } from "../render/roles";
import { lastIndex } from "./playback";
import { usePlayback } from "./usePlayback";

const ORIGIN: Hex = { q: 0, r: 0 };
const NO_WALLS: ReadonlySet<number> = new Set();
const NO_WEIGHTS: ReadonlyMap<number, number> = new Map();
const NO_CHOICE: Partial<HexPair> = {};

export function useSearchScene(options: SceneOptions): Scene {
    const theme = useTheme();
    const mode = theme.palette.mode;
    const { seed, cellCount, complexity, speed, algorithm, terrain, available } = options;
    const walls = options.walls ?? NO_WALLS;
    const weights = options.weights ?? NO_WEIGHTS;
    const chosen = options.chosen ?? NO_CHOICE;

    const baseMap = useMemo(
        () => generateMap(optionsFor(cellCount, complexity), createRandom(seed)),
        [cellCount, complexity, seed]
    );
    const defaults = useMemo(() => furthestApart(baseMap), [baseMap]);
    const endpoints = useMemo<HexPair>(() => ({
        start: chosen.start ?? defaults?.start ?? ORIGIN,
        end: chosen.end ?? defaults?.end ?? ORIGIN
    }), [chosen, defaults]);
    const map = useMemo(
        () => withPlainGround(withWeights(withWalls(baseMap, walls), weights, terrain), [endpoints.start, endpoints.end]),
        [baseMap, walls, weights, terrain, endpoints]
    );
    const search = useMemo(() => searchOn(map, endpoints, ALGORITHMS[algorithm].search), [map, endpoints, algorithm]);
    const view = useMemo(() => layoutFor(baseMap, available), [baseMap, available]);
    const playback = usePlayback(search.events.length, speed);
    const roles = useMemo(() => rolesAt(map, search, playback.index), [map, search, playback.index]);
    const hexes = useMemo(() => hexesToDraw(map, roles, view, mode), [map, roles, view, mode]);
    const revealed = useMemo(() => pathAt(search.events, playback.index), [search.events, playback.index]);
    const route = useMemo(() => routeToDraw(revealed, view, mode), [revealed, view, mode]);
    const outcome = useMemo(() => outcomeOf(map, search.events), [map, search.events]);
    const finished = playback.started && search.events.length > 0 && playback.index >= lastIndex(search.events.length);

    return { baseMap, map, endpoints, search, view, playback, hexes, route, outcome, finished };
}

function searchOn(map: HexMap, pair: HexPair, search: SearchFn): Search {
    return { events: search(map, pair.start, pair.end), start: pair.start, end: pair.end };
}
