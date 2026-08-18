import type { CellState, HexMap } from "./models";
import { createMap, setCell } from "./grid";

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

export function mapFrom(rows: string[]): HexMap {
    const map = createMap(rows[0]?.length ?? 0, rows.length);

    rows.forEach((row, r) => {
        [...row].forEach((symbol, q) => setCell(map, { q, r }, stateFrom(symbol)));
    });

    return map;
}