import { describe, it, expect } from "vitest";
import type { Hex, SearchEvent } from "../models";
import { breadthFirst } from "./breadth-first";
import { mapFrom } from "../test-maps";

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