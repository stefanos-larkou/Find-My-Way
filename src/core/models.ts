export type Nullable<T> = T | null | undefined;

export interface Hex {
    q: number;
    r: number;
}

export type CellState = "absent" | "open" | "wall";

export interface HexMap {
    width: number;
    height: number;
    cells: CellState[];
}

export interface HexPair {
    start: Hex;
    end: Hex;
}

export type SearchEvent =
    | { type: "visit"; hex: Hex; }
    | { type: "path"; hexes: Hex[]; };

export interface GenerationOptions {
    width: number;
    height: number;
    cellCount: number;
    complexity: number;
}

export interface MapGrowth {
    map: HexMap;
    queued: boolean[];
    frontier: Hex[];
}