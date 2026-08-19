import { describe, expect, it } from "vitest";
import { MAX_EVENTS_PER_SECOND, MIN_EVENTS_PER_SECOND } from "./constants";
import { complexityFrom, speedFrom, withinRange } from "./scales";

describe("withinRange", () => {
    it("holds a value inside the range", () => {
        expect(withinRange(150, 1, 100)).toBe(100);
        expect(withinRange(-5, 1, 100)).toBe(1);
        expect(withinRange(42, 1, 100)).toBe(42);
    });

    it("falls back to the minimum for a value that is not a number", () => {
        expect(withinRange(Number.NaN, 30, 1000)).toBe(30);
    });
});

describe("complexityFrom", () => {
    it("maps the slider range onto 0 to 1", () => {
        expect(complexityFrom(1)).toBeCloseTo(0);
        expect(complexityFrom(100)).toBeCloseTo(1);
        expect(complexityFrom(50.5)).toBeCloseTo(0.5);
    });
});

describe("speedFrom", () => {
    it("spans the full speed range", () => {
        expect(speedFrom(1)).toBeCloseTo(MIN_EVENTS_PER_SECOND);
        expect(speedFrom(100)).toBeCloseTo(MAX_EVENTS_PER_SECOND);
    });

    it("rises geometrically rather than linearly", () => {
        expect(speedFrom(50.5)).toBeLessThan((MIN_EVENTS_PER_SECOND + MAX_EVENTS_PER_SECOND) / 2);
    });
});