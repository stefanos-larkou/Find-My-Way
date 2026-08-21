import { describe, expect, it } from "vitest";
import type { Pixel } from "../core/models";
import { adjacent, createMap, hexAt, hexDistance } from "../core/grid";
import { hexLine, hexToPixel, layoutFor, pixelToHex, roundHex } from "./geometry";

function distance(a: Pixel, b: Pixel): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

describe("hexToPixel", () => {
    it("places every neighbour the same distance away", () => {
        const map = createMap(5, 5);
        const view = layoutFor(createMap(5, 5), { x: 800, y: 600 });
        const centre = { q: 2, r: 2 };
        const centrePixel = hexToPixel(centre, view);
        const distances = adjacent(map, centre).map(hex => distance(centrePixel, hexToPixel(hex, view)));
        expect(distances).toHaveLength(6);
        distances.forEach(value => expect(value).toBeCloseTo(distances[0] ?? 0));
    });
});

describe("pixelToHex", () => {
    it("inverts hexToPixel", () => {
        const view = layoutFor(createMap(5, 5), { x: 800, y: 600 });
        const round = pixelToHex(hexToPixel({ q: 3, r: 4 }, view), view);
        expect(round.q).toBeCloseTo(3);
        expect(round.r).toBeCloseTo(4);
    });
});

describe("roundHex", () => {
    it("returns the hex whose centre a pixel falls on", () => {
        const view = layoutFor(createMap(10, 10), { x: 800, y: 600 });
        const hex = { q: 4, r: 3 };
        expect(roundHex(pixelToHex(hexToPixel(hex, view), view))).toEqual(hex);
    });

    it("resolves every cell in a map from its own centre", () => {
        const map = createMap(8, 6);
        const view = layoutFor(map, { x: 800, y: 600 });
        map.cells.forEach((_, index) => {
            const hex = hexAt(map, index);
            expect(roundHex(pixelToHex(hexToPixel(hex, view), view))).toEqual(hex);
        });
    });

    it("picks the nearer hex for a pixel between two centres", () => {
        const view = layoutFor(createMap(10, 10), { x: 800, y: 600 });
        const left = hexToPixel({ q: 3, r: 3 }, view);
        const right = hexToPixel({ q: 4, r: 3 }, view);
        const nearLeft = { x: left.x + (right.x - left.x) * 0.3, y: left.y };
        expect(roundHex(pixelToHex(nearLeft, view))).toEqual({ q: 3, r: 3 });
    });
});

describe("hexLine", () => {
    const from = { q: 0, r: 0 };
    const to = { q: 4, r: -2 };

    it("draws nothing between a hex and itself", () => {
        expect(hexLine(from, from)).toEqual([]);
    });

    it("draws just the neighbour when they touch", () => {
        expect(hexLine(from, { q: 1, r: 0 })).toEqual([{ q: 1, r: 0 }]);
    });

    it("takes one step for each hex of distance", () => {
        expect(hexLine(from, to)).toHaveLength(hexDistance(from, to));
    });

    it("ends where it was asked to", () => {
        expect(hexLine(from, to).at(-1)).toEqual(to);
    });

    it("never jumps a gap", () => {
        const line = [from, ...hexLine(from, to)];
        const gaps = line.filter((hex, step) => step > 0 && hexDistance(line[step - 1] ?? hex, hex) !== 1);
        expect(gaps).toEqual([]);
    });
});
