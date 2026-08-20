import { hexDistance, indexOf, isOpen, neighbours, sameHex } from "../grid";
import type { Hex, HexMap, SearchEvent } from "../models";
import { buildPath } from "./path";

export function aStar(map: HexMap, start: Hex, end: Hex): SearchEvent[] {
    if (!isOpen(map, start)) return [];

    const cellCount = map.width * map.height;
    const events: SearchEvent[] = [];
    const cameFrom: (Hex | null)[] = new Array<Hex | null>(cellCount).fill(null);
    const cost: number[] = new Array<number>(cellCount).fill(Infinity);
    const settled: boolean[] = new Array<boolean>(cellCount).fill(false);
    const open: Hex[] = [start];

    cost[indexOf(map, start)] = 0;

    let current = takeBest(map, open, cost, end);
    while (current) {
        const index = indexOf(map, current);

        if (!settled[index]) {
            settled[index] = true;
            events.push({ type: "visit", hex: current });

            if (sameHex(current, end)) {
                events.push({ type: "path", hexes: buildPath(map, cameFrom, end) });
                return events;
            }

            const stepCost = (cost[index] ?? Infinity) + 1;
            for (const next of neighbours(map, current)) {
                const nextIndex = indexOf(map, next);
                if (stepCost >= (cost[nextIndex] ?? Infinity)) continue;

                cost[nextIndex] = stepCost;
                cameFrom[nextIndex] = current;
                open.push(next);
            }
        }

        current = takeBest(map, open, cost, end);
    }

    return events;
}

function takeBest(map: HexMap, open: Hex[], cost: number[], end: Hex): Hex | undefined {
    let bestAt = 0;
    let bestScore = Infinity;

    open.forEach((hex, position) => {
        const score = (cost[indexOf(map, hex)] ?? Infinity) + hexDistance(hex, end);

        if (score < bestScore) {
            bestScore = score;
            bestAt = position;
        }
    });

    const best = open[bestAt];
    const last = open.pop();
    if (last !== undefined && bestAt < open.length) open[bestAt] = last;

    return best;
}