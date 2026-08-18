import { describe, expect, it } from "vitest";
import { UNREACHABLE } from "./constants";
import { distancesFrom } from "./distances";
import { indexOf } from "./grid";
import { mapFrom } from "./test-maps";

describe("distancesFrom", () => {
    it("counts steps outward from the start", () => {
        const map = mapFrom([
            "...",
            "..."
        ]);
        const distances = distancesFrom(map, { q: 0, r: 0 });
        expect(distances[indexOf(map, { q: 0, r: 0 })]).toBe(0);
        expect(distances[indexOf(map, { q: 1, r: 0 })]).toBe(1);
        expect(distances[indexOf(map, { q: 0, r: 1 })]).toBe(1);
        expect(distances[indexOf(map, { q: 2, r: 0 })]).toBe(2);
    });

    it("leaves walls and absent cells unreachable", () => {
        const map = mapFrom([
            ".#.",
            "  ."
        ]);
        const distances = distancesFrom(map, { q: 0, r: 0 });
        expect(distances[indexOf(map, { q: 1, r: 0 })]).toBe(UNREACHABLE);
        expect(distances[indexOf(map, { q: 0, r: 1 })]).toBe(UNREACHABLE);
    });

    it("leaves cells behind a barrier unreachable", () => {
        const map = mapFrom([
            "..",
            "  ",
            ".."
        ]);
        const distances = distancesFrom(map, { q: 0, r: 0 });
        expect(distances[indexOf(map, { q: 0, r: 2 })]).toBe(UNREACHABLE);
    });

    it("returns all unreachable when the start is not open", () => {
        const map = mapFrom(["#."]);
        const distances = distancesFrom(map, { q: 0, r: 0 });
        expect(distances.every(distance => distance === UNREACHABLE)).toBe(true);
    });
});