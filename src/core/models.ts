export type Nullable<T> = T | null | undefined;

export interface FractionalHex {
    q: number;
    r: number;
}

export interface Hex {
    q: number;
    r: number;
}

export interface HexPair {
    start: Hex;
    end: Hex;
}

export type CellState = "absent" | "open" | "wall";
export type CellRole = CellState | "visited" | "path" | "start" | "end";
export type SearchEvent = { type: "visit"; hex: Hex; } | { type: "path"; hexes: Hex[]; };

export interface HexMap {
    width: number;
    height: number;
    cells: CellState[];
    weights: number[];
}

export interface Outcome {
    found: boolean;
    steps: number;
    cost: number;
}

export interface Search {
    events: SearchEvent[];
    start: Hex;
    end: Hex;
}

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

export type WallStroke = "add" | "remove";

export interface Pixel {
    x: number;
    y: number;
}

export interface ViewLayout {
    hexSize: number;
    origin: Pixel;
    canvas: Pixel;
}

export interface HexStyle {
    fill: string;
    stroke: string;
}

export interface MapPalette {
    open: HexStyle;
    wall: HexStyle;
    visited: HexStyle;
    path: HexStyle;
    start: HexStyle;
    end: HexStyle;
}

export interface DrawnHex {
    corners: Pixel[];
    style: HexStyle;
    veil: Nullable<string>;
    strokeVeil: Nullable<string>;
    borderRank: number;
}

export interface Playback {
    index: number;
    playing: boolean;
    toggle: () => void;
    step: (direction: number) => void;
    scrubTo: (index: number) => void;
    reset: () => void;
}
