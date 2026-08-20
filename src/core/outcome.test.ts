import { describe, expect, it } from "vitest";
import { breadthFirst } from "./algorithms/breadth-first";
import { outcomeOf } from "./outcome";
import { mapFrom } from "./test-maps";

const START = { q: 0, r: 0 };

describe("outcomeOf", () => {
    it("counts the steps of a route", () => {
        const map = mapFrom(["...."]);
        expect(outcomeOf(map, breadthFirst(map, START, { q: 3, r: 0 })).steps).toBe(3);
    });

    it("adds up what the route cost", () => {
        const map = mapFrom(["1331"]);
        expect(outcomeOf(map, breadthFirst(map, START, { q: 3, r: 0 })).cost).toBe(7);
    });

    it("reports that no route was found", () => {
        const map = mapFrom([
            "..",
            "  ",
            ".."
        ]);
        expect(outcomeOf(map, breadthFirst(map, START, { q: 0, r: 2 }))).toEqual({ found: false, steps: 0, cost: 0 });
    });
});
