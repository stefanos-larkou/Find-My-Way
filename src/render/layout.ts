import { presentCells, indexOf } from "../core/grid";
import type { HexMap, CellRole, MapPalette, DrawnHex, ViewLayout } from "../core/models";
import { hexCorners, hexToPixel } from "./geometry";

export function hexesToDraw(map: HexMap, roles: CellRole[], palette: MapPalette, view: ViewLayout): DrawnHex[] {
    return presentCells(map)
        .map(hex => ({ hex, role: roles[indexOf(map, hex)] ?? "open" }))
        .filter(entry => entry.role !== "absent")
        .map(entry => ({
            corners: hexCorners(hexToPixel(entry.hex, view), view),
            style: palette[entry.role === "absent" ? "open" : entry.role]
        }));
}