import { describe, it, expect } from "vitest";
import { breadthFirst } from "./breadth-first";
import { mapFrom, pathOf } from "../test-maps";

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
});