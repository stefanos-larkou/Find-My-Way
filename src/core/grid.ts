import { NEIGHBOUR_OFFSETS } from "./constants";
import type { CellState, Hex, HexMap } from "./models";

export function createMap(width: number, height: number): HexMap {
    return {
        width,
        height,
        cells: new Array<CellState>(width * height).fill("absent")
    };
}

export function indexOf(map: HexMap, hex: Hex): number {
    return hex.r * map.width + hex.q;
}

export function hexAt(map: HexMap, index: number): Hex {
    return { q: index % map.width, r: Math.floor(index / map.width) };
}

export function isInBounds(map: HexMap, hex: Hex): boolean {
    return hex.q >= 0 && hex.q < map.width && hex.r >= 0 && hex.r < map.height;
}

export function sameHex(a: Hex, b: Hex): boolean {
    return a.q === b.q && a.r === b.r;
}

export function cellAt(map: HexMap, hex: Hex): CellState {
    if (!isInBounds(map, hex)) return "absent";
    return map.cells[indexOf(map, hex)] ?? "absent";
}

export function setCell(map: HexMap, hex: Hex, state: CellState): void {
    if (isInBounds(map, hex)) map.cells[indexOf(map, hex)] = state;
}

export function isOpen(map: HexMap, hex: Hex): boolean {
    return cellAt(map, hex) === "open";
}

export function neighbours(map: HexMap, hex: Hex): Hex[] {
    return NEIGHBOUR_OFFSETS
        .map(offset => ({ q: hex.q + offset.q, r: hex.r + offset.r }))
        .filter(next => isOpen(map, next));
}

export function firstOpenCell(map: HexMap): Hex | undefined {
    const index = map.cells.findIndex(state => state === "open");
    return index < 0 ? undefined : hexAt(map, index);
}
