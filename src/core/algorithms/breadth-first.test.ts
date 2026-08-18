import { describe, it, expect } from "vitest";
import type { CellState, Hex, HexMap, SearchEvent } from "../models";
import { createMap, setCell } from "../grid";
import { breadthFirst } from "./breadth-first";

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

function mapFrom(rows: string[]): HexMap {
    const map = createMap(rows[0]?.length ?? 0, rows.length);

    rows.forEach((row, r) => {
        [...row].forEach((symbol, q) => setCell(map, { q, r }, stateFrom(symbol)));
    });

    return map;
}

function pathOf(events: SearchEvent[]): Hex[] | undefined {
    for (const event of events) {
        if (event.type === "path") return event.hexes;
    }

    return undefined;
}

describe("breadthFirst", () => {
    it("finds the shortest route around a wall", () => {
        const map = mapFrom([
            "..#",
            "..."
        ]);
        const events = breadthFirst(map, { q: 0, r: 0 }, { q: 2, r: 1 });
        expect(pathOf(events)).toEqual([
            { q: 0, r: 0 },
            { q: 1, r: 0 },
            { q: 1, r: 1 },
            { q: 2, r: 1 }
        ]);
    });

    it("reports no path when the end cannot be reached", () => {
        const map = mapFrom([
            "..",
            "  ",
            ".."
        ]);
        const events = breadthFirst(map, { q: 0, r: 0 }, { q: 0, r: 2 });
        expect(pathOf(events)).toBeUndefined();
        expect(events).not.toHaveLength(0);
    });

    it("returns a single-cell path when the start is the end", () => {
        const map = mapFrom([".."]);
        const events = breadthFirst(map, { q: 0, r: 0 }, { q: 0, r: 0 });
        expect(pathOf(events)).toEqual([{ q: 0, r: 0 }]);
    });

    it("returns no events when the start is not open", () => {
        const map = mapFrom(["#."]);
        const events = breadthFirst(map, { q: 0, r: 0 }, { q: 1, r: 0 });
        expect(events).toEqual([]);
    });
});