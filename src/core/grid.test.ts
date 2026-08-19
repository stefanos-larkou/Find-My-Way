import { describe, expect, it } from "vitest";
import { adjacent, cellAt, createMap, hexAt, indexOf, isInBounds, neighbours, openCells, sameHex, setCell, withWalls } from "./grid";
import { mapFrom } from "./test-maps";

describe("createMap", () => {
    it("fills the box with absent cells", () => {
        const map = createMap(3, 2);
        expect(map.cells).toHaveLength(6);
        expect(map.cells.every(state => state === "absent")).toBe(true);
    });
});

describe("indexOf and hexAt", () => {
    it("round-trip every position in the box", () => {
        const map = createMap(4, 3);
        map.cells.forEach((_, index) => {
            expect(indexOf(map, hexAt(map, index))).toBe(index);
        });
    });
});

describe("isInBounds", () => {
    it("rejects positions outside the box", () => {
        const map = createMap(3, 2);
        expect(isInBounds(map, { q: 0, r: 0 })).toBe(true);
        expect(isInBounds(map, { q: 2, r: 1 })).toBe(true);
        expect(isInBounds(map, { q: -1, r: 0 })).toBe(false);
        expect(isInBounds(map, { q: 3, r: 0 })).toBe(false);
        expect(isInBounds(map, { q: 0, r: 2 })).toBe(false);
    });
});

describe("cellAt", () => {
    it("reports absent for a position that would wrap into another row", () => {
        const map = mapFrom([
            "..#",
            "..."
        ]);
        expect(cellAt(map, { q: 2, r: 0 })).toBe("wall");
        expect(cellAt(map, { q: -1, r: 1 })).toBe("absent");
    });
});

describe("setCell", () => {
    it("ignores writes outside the box", () => {
        const map = mapFrom([
            "..#",
            "..."
        ]);
        const before = [...map.cells];
        setCell(map, { q: -1, r: 1 }, "open");
        expect(map.cells).toEqual(before);
    });
});

describe("sameHex", () => {
    it("compares by value rather than reference", () => {
        expect(sameHex({ q: 1, r: 2 }, { q: 1, r: 2 })).toBe(true);
        expect(sameHex({ q: 1, r: 2 }, { q: 2, r: 1 })).toBe(false);
    });
});

describe("adjacent", () => {
    it("returns six positions in the middle of the box", () => {
        const map = createMap(3, 3);
        expect(adjacent(map, { q: 1, r: 1 })).toHaveLength(6);
    });

    it("drops positions outside the box at a corner", () => {
        const map = createMap(3, 3);
        expect(adjacent(map, { q: 0, r: 0 })).toHaveLength(2);
    });
});

describe("neighbours", () => {
    it("returns only open cells", () => {
        const map = mapFrom([
            ".#.",
            "..."
        ]);
        expect(neighbours(map, { q: 1, r: 1 })).toEqual([
            { q: 2, r: 1 },
            { q: 2, r: 0 },
            { q: 0, r: 1 }
        ]);
    });
});

describe("openCells", () => {
    it("lists only open cells", () => {
        const map = mapFrom([
            ".# ",
            "..."
        ]);
        expect(openCells(map)).toHaveLength(4);
    });
});

describe("withWalls", () => {
    it("turns the listed open cells into walls", () => {
        const map = mapFrom(["..", ".."]);
        const walled = withWalls(map, new Set([indexOf(map, { q: 1, r: 0 })]));
        expect(cellAt(walled, { q: 1, r: 0 })).toBe("wall");
        expect(cellAt(walled, { q: 0, r: 0 })).toBe("open");
    });

    it("leaves absent cells alone", () => {
        const map = mapFrom([". ", ".."]);
        const walled = withWalls(map, new Set([indexOf(map, { q: 1, r: 0 })]));
        expect(cellAt(walled, { q: 1, r: 0 })).toBe("absent");
    });

    it("does not modify the original map", () => {
        const map = mapFrom(["..", ".."]);
        withWalls(map, new Set([0]));
        expect(cellAt(map, { q: 0, r: 0 })).toBe("open");
    });
});
