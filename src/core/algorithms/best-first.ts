import { indexOf, isOpen, neighbours, sameHex, weightAt } from "../grid";
import type { Hex, HexMap, SearchEvent } from "../models";
import { takeBestBy } from "./frontier";
import { buildPath } from "./path";

export function bestFirstSearch(map: HexMap, start: Hex, end: Hex, heuristic: (hex: Hex) => number): SearchEvent[] {
    if (!isOpen(map, start)) return [];

    const cellCount = map.width * map.height;
    const events: SearchEvent[] = [];
    const cameFrom: (Hex | null)[] = new Array<Hex | null>(cellCount).fill(null);
    const cost: number[] = new Array<number>(cellCount).fill(Infinity);
    const settled: boolean[] = new Array<boolean>(cellCount).fill(false);
    const open: Hex[] = [start];

    cost[indexOf(map, start)] = 0;

    let current = takeBestBy(open, hex => score(map, cost, heuristic, hex));
    while (current) {
        const index = indexOf(map, current);

        if (!settled[index]) {
            settled[index] = true;
            events.push({ type: "visit", hex: current });

            if (sameHex(current, end)) {
                events.push({ type: "path", hexes: buildPath(map, cameFrom, end) });
                return events;
            }

            for (const next of neighbours(map, current)) {
                const nextIndex = indexOf(map, next);
                const stepCost = (cost[index] ?? Infinity) + weightAt(map, next);
                if (stepCost >= (cost[nextIndex] ?? Infinity)) continue;

                cost[nextIndex] = stepCost;
                cameFrom[nextIndex] = current;
                open.push(next);
            }
        }

        current = takeBestBy(open, hex => score(map, cost, heuristic, hex));
    }

    return events;
}

function score(map: HexMap, cost: number[], heuristic: (hex: Hex) => number, hex: Hex): number {
    return (cost[indexOf(map, hex)] ?? Infinity) + heuristic(hex);
}