import { describe, it, expect } from "vitest";
import { createRandom } from "./random";

describe("createRandom", () => {
    it("produces the same sequence for the same seed", () => {
        const first = createRandom(42);
        const second = createRandom(42);
        expect([first(), first(), first()]).toEqual([second(), second(), second()]);
    });

    it("produces a different sequence for a different seed", () => {
        const first = createRandom(1);
        const second = createRandom(2);
        expect([first(), first(), first()]).not.toEqual([second(), second(), second()]);
    });

    it("stays within zero and one", () => {
        const random = createRandom(7);
        const values = Array.from({ length: 500 }, () => random());
        expect(values.every(value => value >= 0 && value < 1)).toBe(true);
    });
});