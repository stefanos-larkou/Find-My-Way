import { describe, expect, it } from "vitest";
import { takeBestBy } from "./frontier";
import type { Hex } from "../models";

describe("takeBestBy", () => {
    it("returns nothing when the frontier is empty", () => {
        expect(takeBestBy([], () => 0)).toBeUndefined();
    });

    it("takes the lowest-scoring hex", () => {
        const open: Hex[] = [{ q: 3, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }];
        expect(takeBestBy(open, hex => hex.q)).toEqual({ q: 1, r: 0 });
    });

    it("removes only the hex it took", () => {
        const open: Hex[] = [{ q: 3, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }];
        takeBestBy(open, hex => hex.q);
        expect(open).toHaveLength(2);
        expect(open).toContainEqual({ q: 3, r: 0 });
        expect(open).toContainEqual({ q: 2, r: 0 });
    });
});
