import { describe, expect, it } from "vitest";
import { furthestApart } from "./furthest";
import { mapFrom } from "./test-maps";

describe("furthestApart", () => {
    it("finds the two ends of a corridor", () => {
        const map = mapFrom(["....."]);
        expect(furthestApart(map)).toEqual({
            start: { q: 4, r: 0 },
            end: { q: 0, r: 0 }
        });
    });

    it("routes around a wall rather than through it", () => {
        const map = mapFrom([
            "..#",
            "..."
        ]);
        expect(furthestApart(map)).toEqual({
            start: { q: 2, r: 1 },
            end: { q: 0, r: 0 }
        });
    });

    it("returns nothing when no cell is open", () => {
        const map = mapFrom(["   "]);
        expect(furthestApart(map)).toBeUndefined();
    });
});