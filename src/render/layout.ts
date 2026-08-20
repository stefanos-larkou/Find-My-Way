import { presentCells, indexOf, weightAt } from "../core/grid";
import type { HexMap, CellRole, DrawnHex, ViewLayout } from "../core/models";
import { hexCorners, hexToPixel } from "./geometry";
import { paletteFor, veilFor } from "./palette";

export function hexesToDraw(map: HexMap, roles: CellRole[], view: ViewLayout, mode: "light" | "dark"): DrawnHex[] {
    const palette = paletteFor(mode);

    return presentCells(map)
        .map(hex => ({ hex, role: roles[indexOf(map, hex)] ?? "open" }))
        .filter(entry => entry.role !== "absent")
        .map(entry => ({
            corners: hexCorners(hexToPixel(entry.hex, view), view),
            style: palette[entry.role === "absent" ? "open" : entry.role],
            veil: entry.role === "wall" ? null : veilFor(mode, weightAt(map, entry.hex))
        }));
}
