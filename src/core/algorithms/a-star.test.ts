import { describe, expect, it } from "vitest";
import { breadthFirst } from "./breadth-first";
import { aStar } from "./a-star";
import { mapFrom, pathOf } from "../test-maps";
import type { SearchEvent } from "../models";

const OPEN_MAP = [
    "..........",
    "..........",
    "..........",
    "..........",
    ".........."
];

function visits(events: SearchEvent[]): number {
    return events.filter(event => event.type === "visit").length;
}

describe("aStar", () => {
    it("finds a route as short as breadth-first does", () => {
        const map = mapFrom(OPEN_MAP);
        const start = { q: 0, r: 0 };
        const end = { q: 9, r: 4 };
        expect(pathOf(aStar(map, start, end))).toHaveLength(pathOf(breadthFirst(map, start, end)).length);
    });

    it("visits fewer cells than breadth-first", () => {
        const map = mapFrom(OPEN_MAP);
        const start = { q: 0, r: 0 };
        const end = { q: 9, r: 4 };
        expect(visits(aStar(map, start, end))).toBeLessThan(visits(breadthFirst(map, start, end)));
    });
});
