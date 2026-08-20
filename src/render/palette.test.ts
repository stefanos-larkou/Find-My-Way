import { describe, expect, it } from "vitest";
import { MAX_WEIGHT, MIN_WEIGHT } from "../core/constants";
import type { Nullable } from "../core/models";
import { strokeVeilFor, veilFor } from "./palette";

function channelsOf(veil: Nullable<string>): number[] {
    return (veil?.replace(/rgba\(|\)/g, "").split(",") ?? []).map(part => Number(part));
}

function alphaOf(veil: Nullable<string>): number {
    return channelsOf(veil).at(-1) ?? 0;
}

function inkOf(veil: Nullable<string>): number {
    return channelsOf(veil).slice(0, 3).reduce((total, channel) => total + channel, 0);
}

describe("veilFor", () => {
    it("leaves the lightest ground unveiled", () => {
        expect(veilFor("light", MIN_WEIGHT)).toBeNull();
    });

    it("veils heavier ground more heavily", () => {
        expect(alphaOf(veilFor("light", MAX_WEIGHT))).toBeGreaterThan(alphaOf(veilFor("light", MIN_WEIGHT + 1)));
    });

    it("veils a border more heavily than the face it surrounds", () => {
        expect(alphaOf(strokeVeilFor("light", MAX_WEIGHT))).toBeGreaterThan(alphaOf(veilFor("light", MAX_WEIGHT)));
    });

    it("leaves the lightest ground's border unveiled", () => {
        expect(strokeVeilFor("light", MIN_WEIGHT)).toBeNull();
    });

    it("veils with lighter ink in dark mode than in light mode", () => {
        expect(inkOf(veilFor("dark", MAX_WEIGHT))).toBeGreaterThan(inkOf(veilFor("light", MAX_WEIGHT)));
    });
});
