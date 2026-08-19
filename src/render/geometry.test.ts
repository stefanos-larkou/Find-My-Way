import { describe, expect, it } from "vitest";
import type { Pixel } from "../core/models";
import { adjacent, createMap } from "../core/grid";
import { hexToPixel, pixelToHex } from "./geometry";

function distance(a: Pixel, b: Pixel): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

describe("hexToPixel", () => {
    it("places every neighbour the same distance away", () => {
        const map = createMap(5, 5);
        const centre = { q: 2, r: 2 };
        const centrePixel = hexToPixel(centre);
        const distances = adjacent(map, centre).map(hex => distance(centrePixel, hexToPixel(hex)));
        expect(distances).toHaveLength(6);
        distances.forEach(value => expect(value).toBeCloseTo(distances[0] ?? 0));
    });
});

describe("pixelToHex", () => {
    it("inverts hexToPixel", () => {
        const round = pixelToHex(hexToPixel({ q: 3, r: 4 }));
        expect(round.q).toBeCloseTo(3);
        expect(round.r).toBeCloseTo(4);
    });
});