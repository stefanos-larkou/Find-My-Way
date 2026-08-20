import { describe, expect, it } from "vitest";
import { adjacent, sameHex } from "../grid";
import { mapFrom, visitsOf } from "../test-maps";
import { pathOf } from "../outcome";
import { ALGORITHM_NAMES, ALGORITHMS } from "./registry";

const START = { q: 0, r: 0 };

describe("the algorithm registry", () => {
    it("lists every algorithm exactly once", () => {
        expect([...ALGORITHM_NAMES].sort()).toEqual(Object.keys(ALGORITHMS).sort());
    });

    it("gives every algorithm a label", () => {
        ALGORITHM_NAMES.forEach(name => expect(ALGORITHMS[name].label).not.toBe(""));
    });
});

ALGORITHM_NAMES.forEach(name => {
    describe(name, () => {
        const { search } = ALGORITHMS[name];
        it("finds a route from the start to the end", () => {
            const map = mapFrom([
                "..#",
                "..."
            ]);
            const path = pathOf(search(map, START, { q: 2, r: 1 }));
            expect(path.at(0)).toEqual(START);
            expect(path.at(-1)).toEqual({ q: 2, r: 1 });
        });

        it("returns a path whose cells are all neighbours", () => {
            const map = mapFrom([
                "....",
                "....",
                "...."
            ]);
            const path = pathOf(search(map, START, { q: 3, r: 2 }));
            const gaps = path.filter((hex, position) => {
                const previous = path[position - 1];
                return previous !== undefined && !adjacent(map, previous).some(other => sameHex(other, hex));
            });
            expect(gaps).toEqual([]);
        });

        it("reports no path when the end cannot be reached", () => {
            const map = mapFrom([
                "..",
                "  ",
                ".."
            ]);
            expect(pathOf(search(map, START, { q: 0, r: 2 }))).toHaveLength(0);
        });

        it("still reports the cells it visited when there is no path", () => {
            const map = mapFrom([
                "..",
                "  ",
                ".."
            ]);
            expect(visitsOf(search(map, START, { q: 0, r: 2 }))).toBeGreaterThan(0);
        });

        it("returns a single-cell path when the start is the end", () => {
            expect(pathOf(search(mapFrom(["..."]), START, START))).toEqual([START]);
        });

        it("returns no events when the start is not open", () => {
            expect(search(mapFrom(["#."]), START, { q: 1, r: 0 })).toEqual([]);
        });
    });
});
