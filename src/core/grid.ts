import { MIN_WEIGHT, NEIGHBOUR_OFFSETS } from "./constants";
import type { CellState, Hex, HexMap } from "./models";

export function createMap(width: number, height: number): HexMap {
    return {
        width,
        height,
        cells: new Array<CellState>(width * height).fill("absent"),
        weights: new Array<number>(width * height).fill(MIN_WEIGHT)
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

export function weightAt(map: HexMap, hex: Hex): number {
    if (!isInBounds(map, hex)) return MIN_WEIGHT;
    return map.weights[indexOf(map, hex)] ?? MIN_WEIGHT;
}

export function setWeight(map: HexMap, hex: Hex, weight: number): void {
    if (isInBounds(map, hex)) map.weights[indexOf(map, hex)] = weight;
}

export function isOpen(map: HexMap, hex: Hex): boolean {
    return cellAt(map, hex) === "open";
}

export function adjacent(map: HexMap, hex: Hex): Hex[] {
    return NEIGHBOUR_OFFSETS
        .map(offset => ({ q: hex.q + offset.q, r: hex.r + offset.r }))
        .filter(next => isInBounds(map, next));
}

export function neighbours(map: HexMap, hex: Hex): Hex[] {
    return adjacent(map, hex).filter(next => isOpen(map, next));
}

export function firstOpenCell(map: HexMap): Hex | undefined {
    const index = map.cells.findIndex(state => state === "open");
    return index < 0 ? undefined : hexAt(map, index);
}

export function openCells(map: HexMap): Hex[] {
    return map.cells
        .map((_, index) => hexAt(map, index))
        .filter(hex => isOpen(map, hex));
}

export function presentCells(map: HexMap): Hex[] {
    return map.cells
        .map((_, index) => hexAt(map, index))
        .filter(hex => cellAt(map, hex) !== "absent");
}

export function withWalls(map: HexMap, walls: ReadonlySet<number>): HexMap {
    return {
        width: map.width,
        height: map.height,
        cells: map.cells.map((state, index) => state === "open" && walls.has(index) ? "wall" : state),
        weights: map.weights
    };
}

export function withWeights(map: HexMap, painted: ReadonlyMap<number, number>, enabled: boolean): HexMap {
    return {
        width: map.width,
        height: map.height,
        cells: map.cells,
        weights: map.weights.map((weight, index) => enabled ? painted.get(index) ?? weight : MIN_WEIGHT)
    };
}

export function withPlainGround(map: HexMap, hexes: Hex[]): HexMap {
    const plain = new Set(hexes.map(hex => indexOf(map, hex)));
    return {
        width: map.width,
        height: map.height,
        cells: map.cells,
        weights: map.weights.map((weight, index) => plain.has(index) ? MIN_WEIGHT : weight)
    };
}

export function hexDistance(from: Hex, to: Hex): number {
    const dq = from.q - to.q;
    const dr = from.r - to.r;
    return (Math.abs(dq) + Math.abs(dq + dr) + Math.abs(dr)) / 2;
}
