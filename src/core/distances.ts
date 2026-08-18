import type { Hex, HexMap } from "./models";
import { UNREACHABLE } from "./constants";
import { indexOf, isOpen, neighbours } from "./grid";

export function distancesFrom(map: HexMap, start: Hex): number[] {
    const distances = new Array<number>(map.width * map.height).fill(UNREACHABLE);

    if (!isOpen(map, start)) return distances;

    distances[indexOf(map, start)] = 0;
    const queue: Hex[] = [start];

    for (const current of queue) {
        const distance = distances[indexOf(map, current)] ?? UNREACHABLE;

        for (const next of neighbours(map, current)) {
            const nextIndex = indexOf(map, next);
            if (distances[nextIndex] !== UNREACHABLE) continue;

            distances[nextIndex] = distance + 1;
            queue.push(next);
        }
    }

    return distances;
}