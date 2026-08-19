import { presentCells, indexOf } from "../core/grid";
import type { HexMap, CellRole, MapPalette, DrawnHex, Pixel } from "../core/models";
import { hexToPixel, ORIGIN_OFFSET } from "./geometry";

export function hexesToDraw(map: HexMap, roles: CellRole[], palette: MapPalette): DrawnHex[] {
    return presentCells(map)
        .map(hex => ({ hex, role: roles[indexOf(map, hex)] ?? "open" }))
        .filter(entry => entry.role !== "absent")
        .map(entry => ({
            centre: offset(hexToPixel(entry.hex)),
            style: palette[entry.role === "absent" ? "open" : entry.role]
        }));
}

function offset(centre: Pixel): Pixel {
    return { x: centre.x + ORIGIN_OFFSET.x, y: centre.y + ORIGIN_OFFSET.y };
}