import { describe, expect, it } from "vitest";
import { breadthFirst } from "./breadth-first";
import { aStar } from "./a-star";
import { dijkstra } from "./dijkstra";
import { mapFrom, visitsOf } from "../test-maps";
import { costOf, pathOf } from "../outcome";

const OPEN_MAP = [
    "..........",
    "..........",
    "..........",
    "..........",
    ".........."
];

const BAND = [
    "111111111",
    "133333331",
    "111111111"
];

const START = { q: 0, r: 1 };
const END = { q: 8, r: 1 };

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
        expect(visitsOf(aStar(map, start, end))).toBeLessThan(visitsOf(breadthFirst(map, start, end)));
    });

    it("finds dijkstra's cheapest route for fewer visits", () => {
        const map = mapFrom(BAND);
        expect(costOf(map, pathOf(aStar(map, START, END)))).toBe(costOf(map, pathOf(dijkstra(map, START, END))));
        expect(visitsOf(aStar(map, START, END))).toBeLessThan(visitsOf(dijkstra(map, START, END)));
    });
});
