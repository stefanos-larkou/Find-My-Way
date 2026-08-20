import { describe, expect, it } from "vitest";
import { MAX_WEIGHT, MIN_WEIGHT } from "../core/constants";
import type { Nullable } from "../core/models";
import { veilFor } from "./palette";

function alphaOf(veil: Nullable<string>): number {
    return Number(veil?.split(",").at(-1)?.replace(")", "") ?? 0);
}

describe("veilFor", () => {
    it("leaves the lightest ground unveiled", () => {
        expect(veilFor("light", MIN_WEIGHT)).toBeNull();
    });

    it("veils heavier ground more heavily", () => {
        expect(alphaOf(veilFor("light", MAX_WEIGHT))).toBeGreaterThan(alphaOf(veilFor("light", MIN_WEIGHT + 1)));
    });

    it("veils with light ink in dark mode", () => {
        expect(veilFor("dark", MAX_WEIGHT)).toContain("255, 255, 255");
        expect(veilFor("light", MAX_WEIGHT)).not.toContain("255, 255, 255");
    });
});
