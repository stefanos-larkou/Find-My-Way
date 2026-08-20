import { describe, expect, it } from "vitest";
import { mapFrom } from "../core/test-maps";
import { layoutFor } from "./geometry";
import { hexesToDraw, routeToDraw, routeWidthFor } from "./layout";
import { LIGHT_PALETTE, mixColours } from "./palette";
import { rolesAt } from "./roles";
import { MAX_WEIGHT, MIN_ROUTE_WIDTH } from "../core/constants";
import { setWeight } from "../core/grid";

const AVAILABLE = { x: 800, y: 600 };

describe("routeWidthFor", () => {
    it("scales the line with the hexes", () => {
        expect(routeWidthFor(40)).toBeGreaterThan(routeWidthFor(20));
    });

    it("never draws thinner than the floor", () => {
        expect(routeWidthFor(1)).toBe(MIN_ROUTE_WIDTH);
        expect(routeWidthFor(0)).toBe(MIN_ROUTE_WIDTH);
    });
});

describe("routeToDraw", () => {
    const view = layoutFor(mapFrom(["...."]), AVAILABLE);
    const path = [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }, { q: 3, r: 0 }];

    it("draws one segment between each pair of cells", () => {
        expect(routeToDraw(path, view, "light")).toHaveLength(path.length - 1);
    });

    it("draws nothing when there is no route", () => {
        expect(routeToDraw([], view, "light")).toEqual([]);
    });

    it("shades from the start colour towards the end colour", () => {
        const segments = routeToDraw(path, view, "light");
        expect(segments.at(-1)?.colour).toBe(mixColours(LIGHT_PALETTE.start.fill, LIGHT_PALETTE.end.fill, 1));
        expect(segments[0]?.colour).not.toBe(segments.at(-1)?.colour);
    });

    it("joins each cell to the one before it", () => {
        const segments = routeToDraw(path, view, "light");
        expect(segments[1]?.from).toEqual(segments[0]?.to);
    });
});

describe("hexesToDraw", () => {
    it("skips absent cells", () => {
        const map = mapFrom([
            ".. ",
            "..."
        ]);
        const search = { events: [], start: { q: 0, r: 0 }, end: { q: 2, r: 1 } };
        const drawn = hexesToDraw(map, rolesAt(map, search, -1), layoutFor(map, AVAILABLE), "light");
        expect(drawn).toHaveLength(5);
    });

    it("styles a wall with the wall colours", () => {
        const map = mapFrom(["#."]);
        const search = { events: [], start: { q: 1, r: 0 }, end: { q: 1, r: 0 } };
        const drawn = hexesToDraw(map, rolesAt(map, search, -1), layoutFor(map, AVAILABLE), "light");
        expect(drawn[0]?.style).toEqual(LIGHT_PALETTE.wall);
    });

    it("veils heavy ground and leaves light ground clear", () => {
        const map = mapFrom(["13"]);
        const search = { events: [], start: { q: 0, r: 0 }, end: { q: 1, r: 0 } };
        const drawn = hexesToDraw(map, rolesAt(map, search, -1), layoutFor(map, AVAILABLE), "light");
        expect(drawn[0]?.veil).toBeNull();
        expect(drawn[1]?.veil).not.toBeNull();
    });

    it("orders heavier ground after lighter, and endpoints after both", () => {
        const map = mapFrom(["1231"]);
        const search = { events: [], start: { q: 0, r: 0 }, end: { q: 3, r: 0 } };
        const drawn = hexesToDraw(map, rolesAt(map, search, -1), layoutFor(map, AVAILABLE), "light");
        expect(drawn.map(hex => hex.borderRank)).toEqual([2, 3, MAX_WEIGHT + 2, MAX_WEIGHT + 2]);
    });

    it("never veils a wall", () => {
        const map = mapFrom(["#."]);
        setWeight(map, { q: 0, r: 0 }, MAX_WEIGHT);
        const search = { events: [], start: { q: 1, r: 0 }, end: { q: 1, r: 0 } };
        const drawn = hexesToDraw(map, rolesAt(map, search, -1), layoutFor(map, AVAILABLE), "light");
        expect(drawn[0]?.veil).toBeNull();
    });

});