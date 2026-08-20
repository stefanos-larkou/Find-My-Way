import type { CellState, Hex, HexMap, SearchEvent } from "./models";
import { createMap, setCell } from "./grid";

export function mapFrom(rows: string[]): HexMap {
    const map = createMap(rows[0]?.length ?? 0, rows.length);

    rows.forEach((row, r) => {
        [...row].forEach((symbol, q) => setCell(map, { q, r }, stateFrom(symbol)));
    });

    return map;
}

export function pathOf(events: SearchEvent[]): Hex[] {
    for (const event of events) {
        if (event.type === "path") return event.hexes;
    }

    return [];
}

export function visitsOf(events: SearchEvent[]): number {
    return events.filter(event => event.type === "visit").length;
}

function stateFrom(symbol: string): CellState {
    switch (symbol) {
        case ".":
            return "open";
        case "#":
            return "wall";
        case " ":
            return "absent";
        default:
            throw new Error(`Unknown map symbol: ${symbol}`);
    }
}