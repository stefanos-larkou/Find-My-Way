import { MAX_WEIGHT, MIN_ROUTE_WIDTH, ROUTE_WIDTH_SHARE } from "../core/constants";
import { presentCells, indexOf, weightAt } from "../core/grid";
import type { Hex, HexMap, CellRole, DrawnHex, DrawnSegment, ViewLayout } from "../core/models";
import { hexCorners, hexToPixel } from "./geometry";
import { mixColours, paletteFor, strokeVeilFor, veilFor } from "./palette";

export function hexesToDraw(map: HexMap, roles: CellRole[], view: ViewLayout, mode: "light" | "dark"): DrawnHex[] {
    const palette = paletteFor(mode);

    return presentCells(map)
        .map(hex => ({ hex, role: roles[indexOf(map, hex)] ?? "open" }))
        .filter(entry => entry.role !== "absent")
        .map(entry => ({
            corners: hexCorners(hexToPixel(entry.hex, view), view),
            style: palette[entry.role === "absent" ? "open" : entry.role],
            veil: entry.role === "wall" ? null : veilFor(mode, weightAt(map, entry.hex)),
            strokeVeil: entry.role === "wall" ? null : strokeVeilFor(mode, weightAt(map, entry.hex)),
            borderRank: borderRankOf(entry.role, weightAt(map, entry.hex))
        }))
        .sort((first, second) => first.borderRank - second.borderRank);
}

export function routeToDraw(path: Hex[], view: ViewLayout, mode: "light" | "dark"): DrawnSegment[] {
    const palette = paletteFor(mode);
    const steps = path.length - 1;

    return path.slice(1).map((hex, step) => ({
        from: hexToPixel(path[step] ?? hex, view),
        to: hexToPixel(hex, view),
        colour: mixColours(palette.start.fill, palette.end.fill, (step + 1) / steps)
    }));
}

export function routeWidthFor(hexSize: number): number {
    return Math.max(hexSize * ROUTE_WIDTH_SHARE, MIN_ROUTE_WIDTH);
}

export function borderRankOf(role: CellRole, weight: number): number {
    if (role === "path" || role === "start" || role === "end") return MAX_WEIGHT + 2;
    if (role === "wall") return MAX_WEIGHT + 1;

    return weight;
}
