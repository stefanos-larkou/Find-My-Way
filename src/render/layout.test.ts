import { describe, expect, it } from "vitest";
import { mapFrom } from "../core/test-maps";
import { layoutFor } from "./geometry";
import { hexesToDraw } from "./layout";
import { LIGHT_PALETTE } from "./palette";
import { rolesAt } from "./roles";

const AVAILABLE = { x: 800, y: 600 };

describe("hexesToDraw", () => {
    it("skips absent cells", () => {
        const map = mapFrom([
            ".. ",
            "..."
        ]);
        const search = { events: [], start: { q: 0, r: 0 }, end: { q: 2, r: 1 } };
        const drawn = hexesToDraw(map, rolesAt(map, search, -1), LIGHT_PALETTE, layoutFor(map, AVAILABLE));
        expect(drawn).toHaveLength(5);
    });

    it("styles a wall with the wall colours", () => {
        const map = mapFrom(["#."]);
        const search = { events: [], start: { q: 1, r: 0 }, end: { q: 1, r: 0 } };
        const drawn = hexesToDraw(map, rolesAt(map, search, -1), LIGHT_PALETTE, layoutFor(map, AVAILABLE));
        expect(drawn[0]?.style).toEqual(LIGHT_PALETTE.wall);
    });
});