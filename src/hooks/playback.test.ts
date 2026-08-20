import { describe, it, expect } from "vitest";
import { EMPTY_INDEX } from "../core/constants";
import { lastIndex, clampIndex, advanceIndex, stepIndex } from "./playback";

describe("lastIndex", () => {
    it("is the empty index for an empty search", () => {
        expect(lastIndex(0)).toBe(EMPTY_INDEX);
    });

    it("is one below the event count", () => {
        expect(lastIndex(10)).toBe(9);
    });
});

describe("clampIndex", () => {
    it("holds the index inside the event range", () => {
        expect(clampIndex(-5, 10)).toBe(EMPTY_INDEX);
        expect(clampIndex(50, 10)).toBe(9);
        expect(clampIndex(3, 0)).toBe(EMPTY_INDEX);
    });
});

describe("advanceIndex", () => {
    it("moves forward in proportion to elapsed time and speed", () => {
        expect(advanceIndex(0, 100, 30, 100)).toBeCloseTo(3);
        expect(advanceIndex(0, 100, 60, 100)).toBeCloseTo(6);
    });

    it("stops at the last event", () => {
        expect(advanceIndex(9, 5000, 30, 10)).toBe(9);
    });
});

describe("stepIndex", () => {
    it("snaps forward to the next whole event", () => {
        expect(stepIndex(12.4, 1, 100)).toBe(13);
    });

    it("snaps back to the previous whole event", () => {
        expect(stepIndex(12.4, -1, 100)).toBe(11);
    });

    it("will not go below the empty index", () => {
        expect(stepIndex(EMPTY_INDEX, -1, 100)).toBe(EMPTY_INDEX);
    });
});