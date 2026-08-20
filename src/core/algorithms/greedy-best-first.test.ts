import { describe, expect, it } from "vitest";
import { breadthFirst } from "./breadth-first";
import { greedyBestFirst } from "./greedy-best-first";
import { mapFrom, visitsOf } from "../test-maps";
import { pathOf } from "../outcome";

const HOOK = [
    "..........",
    ".....####.",
    ".........#",
    ".........#",
    ".....####.",
    ".........."
];

const START = { q: 0, r: 2 };
const END = { q: 9, r: 5 };

describe("greedyBestFirst", () => {
    it("takes a longer route than breadth-first when the heuristic misleads", () => {
        const map = mapFrom(HOOK);
        expect(pathOf(greedyBestFirst(map, START, END)).length).toBeGreaterThan(pathOf(breadthFirst(map, START, END)).length);
    });

    it("visits fewer cells than breadth-first", () => {
        const map = mapFrom(HOOK);
        expect(visitsOf(greedyBestFirst(map, START, END))).toBeLessThan(visitsOf(breadthFirst(map, START, END)));
    });
});
