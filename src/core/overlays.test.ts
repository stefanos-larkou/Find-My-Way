import { describe, expect, it } from "vitest";
import { painted, weighted } from "./overlays";

describe("painted", () => {
    it("adds a wall", () => {
        expect(painted(new Set(), 3, "add").has(3)).toBe(true);
    });

    it("removes a wall", () => {
        expect(painted(new Set([3]), 3, "remove").has(3)).toBe(false);
    });

    it("returns the same set when the cell is already a wall", () => {
        const walls = new Set([3]);
        expect(painted(walls, 3, "add")).toBe(walls);
    });

    it("returns the same set when the cell is already clear", () => {
        const walls = new Set([3]);
        expect(painted(walls, 7, "remove")).toBe(walls);
    });

    it("leaves the original set alone", () => {
        const walls = new Set([3]);
        painted(walls, 7, "add");
        expect(walls.has(7)).toBe(false);
    });
});

describe("weighted", () => {
    it("records a weight", () => {
        expect(weighted(new Map(), 3, 2).get(3)).toBe(2);
    });

    it("returns the same map when the weight is unchanged", () => {
        const weights = new Map([[3, 2]]);
        expect(weighted(weights, 3, 2)).toBe(weights);
    });

    it("leaves the original map alone", () => {
        const weights = new Map<number, number>();
        weighted(weights, 3, 2);
        expect(weights.size).toBe(0);
    });
});
