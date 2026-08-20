import { MAX_WEIGHT } from "../core/constants";
import { presentCells, indexOf, weightAt } from "../core/grid";
import type { HexMap, CellRole, DrawnHex, ViewLayout } from "../core/models";
import { hexCorners, hexToPixel } from "./geometry";
import { paletteFor, strokeVeilFor, veilFor } from "./palette";

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

export function borderRankOf(role: CellRole, weight: number): number {
    if (role === "path" || role === "start" || role === "end") return MAX_WEIGHT + 2;
    if (role === "wall") return MAX_WEIGHT + 1;

    return weight;
}
