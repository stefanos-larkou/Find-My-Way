import { createRandom } from "@stefanos-larkou/sim-kit";
import { describe, expect, it } from "vitest";
import type { HexMap } from "./models";
import { MAX_WEIGHT, MIN_WEIGHT, UNREACHABLE } from "./constants";
import { distancesFrom } from "./distances";
import { furthestApart } from "./furthest";
import { generateMap, optionsFor } from "./generation";
import { indexOf, neighbours, openCells, weightAt } from "./grid";

function reachableCount(map: HexMap): number {
    const start = openCells(map)[0];
    if (!start) return 0;
    return distancesFrom(map, start).filter(distance => distance !== UNREACHABLE).length;
}

function diameter(map: HexMap): number {
    const pair = furthestApart(map);
    if (!pair) return 0;
    return distancesFrom(map, pair.start)[indexOf(map, pair.end)] ?? 0;
}

describe("generateMap", () => {
    it("places the requested number of cells", () => {
        const map = generateMap(optionsFor(60, 0.5), createRandom(1));
        expect(openCells(map)).toHaveLength(60);
    });

    it("produces a single connected shape", () => {
        const map = generateMap(optionsFor(60, 0.5), createRandom(2));
        expect(reachableCount(map)).toBe(openCells(map).length);
    });

    it("never places a wall", () => {
        const map = generateMap(optionsFor(60, 0.5), createRandom(3));
        expect(map.cells.some(state => state === "wall")).toBe(false);
    });

    it("produces the same map for the same seed", () => {
        const first = generateMap(optionsFor(60, 0.5), createRandom(4));
        const second = generateMap(optionsFor(60, 0.5), createRandom(4));
        expect(first.cells).toEqual(second.cells);
    });

    it("produces different maps for different seeds", () => {
        const first = generateMap(optionsFor(60, 0.5), createRandom(5));
        const second = generateMap(optionsFor(60, 0.5), createRandom(6));
        expect(first.cells).not.toEqual(second.cells);
    });

    it("produces a longer shape at higher complexity", () => {
        const compact = generateMap(optionsFor(60, 0), createRandom(7));
        const winding = generateMap(optionsFor(60, 1), createRandom(7));
        expect(diameter(winding)).toBeGreaterThan(diameter(compact));
    });

    it("leaves most of a winding shape with somewhere else to turn", () => {
        const map = generateMap(optionsFor(400, 1), createRandom(11));
        const forced = openCells(map).filter(hex => neighbours(map, hex).length <= 2);
        expect(forced.length / openCells(map).length).toBeLessThan(0.4);
    });

    it("gives every open cell a weight in range", () => {
        const map = generateMap(optionsFor(60, 0.5), createRandom(8));
        const weights = openCells(map).map(hex => weightAt(map, hex));
        expect(weights.filter(weight => weight < MIN_WEIGHT || weight > MAX_WEIGHT)).toEqual([]);
    });

    it("produces the same weights for the same seed", () => {
        const first = generateMap(optionsFor(60, 0.5), createRandom(9));
        const second = generateMap(optionsFor(60, 0.5), createRandom(9));
        expect(first.weights).toEqual(second.weights);
    });

    it("makes light ground more common than heavy", () => {
        const map = generateMap(optionsFor(300, 0.5), createRandom(10));
        const weights = openCells(map).map(hex => weightAt(map, hex));
        expect(weights.filter(weight => weight === MIN_WEIGHT).length).toBeGreaterThan(weights.filter(weight => weight === MAX_WEIGHT).length);
    });

});