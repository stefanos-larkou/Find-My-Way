import { describe, expect, it } from "vitest";
import { MAX_COMPLEXITY, MAX_EVENTS_PER_SECOND, MIN_EVENTS_PER_SECOND } from "./constants";
import { complexityFrom, speedFrom } from "./scales";

describe("complexityFrom", () => {
    it("maps the slider range onto the range that changes the shape", () => {
        expect(complexityFrom(1)).toBeCloseTo(0);
        expect(complexityFrom(100)).toBeCloseTo(MAX_COMPLEXITY);
        expect(complexityFrom(50.5)).toBeCloseTo(MAX_COMPLEXITY / 2);
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
