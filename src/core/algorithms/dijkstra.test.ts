import { describe, expect, it } from "vitest";
import { breadthFirst } from "./breadth-first";
import { dijkstra } from "./dijkstra";
import { mapFrom } from "../test-maps";
import { costOf, pathOf } from "../outcome";

const BAND = [
    "111111111",
    "133333331",
    "111111111"
];

const START = { q: 0, r: 1 };
const END = { q: 8, r: 1 };

describe("dijkstra", () => {
    it("takes a cheaper route than breadth-first over heavy ground", () => {
        const map = mapFrom(BAND);
        expect(costOf(map, pathOf(dijkstra(map, START, END)))).toBeLessThan(costOf(map, pathOf(breadthFirst(map, START, END))));
    });

    it("accepts more steps to pay less", () => {
        const map = mapFrom(BAND);
        expect(pathOf(dijkstra(map, START, END)).length).toBeGreaterThan(pathOf(breadthFirst(map, START, END)).length);
    });
});
