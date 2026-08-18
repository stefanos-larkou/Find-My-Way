import type { Hex, HexMap, HexPair } from "./models";
import { distancesFrom } from "./distances";
import { firstOpenCell, hexAt, indexOf } from "./grid";

export function furthestApart(map: HexMap): HexPair | undefined {
    const seed = firstOpenCell(map);
    if (!seed) return undefined;

    const start = furthestFrom(map, seed);
    return { start, end: furthestFrom(map, start) };
}

function furthestFrom(map: HexMap, from: Hex): Hex {
    const distances = distancesFrom(map, from);
    let bestIndex = indexOf(map, from);
    let bestDistance = 0;

    distances.forEach((distance, index) => {
        if (distance > bestDistance) {
            bestDistance = distance;
            bestIndex = index;
        }
    });

    return hexAt(map, bestIndex);
}