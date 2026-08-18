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

export type SearchEvent =
    | { type: "visit"; hex: Hex; }
    | { type: "path"; hexes: Hex[]; };