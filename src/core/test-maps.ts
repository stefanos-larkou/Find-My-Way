import type { CellState, HexMap, SearchEvent } from "./models";
import { createMap, setCell, setWeight } from "./grid";
import { MIN_WEIGHT } from "./constants";

export function mapFrom(rows: string[]): HexMap {
    const map = createMap(rows[0]?.length ?? 0, rows.length);

    rows.forEach((row, r) => {
        [...row].forEach((symbol, q) => {
            setCell(map, { q, r }, stateFrom(symbol));
            setWeight(map, { q, r }, weightFrom(symbol));
        });
    });

    return map;
}

export function visitsOf(events: SearchEvent[]): number {
    return events.filter(event => event.type === "visit").length;
}

function weightFrom(symbol: string): number {
    switch (symbol) {
        case "2":
            return 2;
        case "3":
            return 3;
        default:
            return MIN_WEIGHT;
    }
}

function stateFrom(symbol: string): CellState {
    switch (symbol) {
        case ".":
        case "1":
        case "2":
        case "3":
            return "open";
        case "#":
            return "wall";
        case " ":
            return "absent";
        default:
            throw new Error(`Unknown map symbol: ${symbol}`);
    }
}
