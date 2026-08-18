import { isOpen, indexOf, sameHex, neighbours } from "../grid";
import type { HexMap, Hex, SearchEvent, Nullable } from "../models";

export function breadthFirst(map: HexMap, start: Hex, end: Hex): SearchEvent[] {
    if (!isOpen(map, start)) return [];

    const cellCount = map.width * map.height;
    const events: SearchEvent[] = [];
    const visited: boolean[] = new Array<boolean>(cellCount).fill(false);
    const cameFrom: (Hex | null)[] = new Array<Hex | null>(cellCount).fill(null);
    const queue: Hex[] = [start];

    visited[indexOf(map, start)] = true;

    for (const current of queue) {
        events.push({ type: "visit", hex: current });

        if (sameHex(current, end)) {
            events.push({ type: "path", hexes: buildPath(map, cameFrom, end) });
            return events;
        }

        for (const next of neighbours(map, current)) {
            const nextIndex = indexOf(map, next);
            if (visited[nextIndex]) continue;

            visited[nextIndex] = true;
            cameFrom[nextIndex] = current;
            queue.push(next);
        }
    }

    return events;
}

function buildPath(map: HexMap, cameFrom: (Hex | null)[], end: Hex): Hex[] {
    const path: Hex[] = [];
    let step: Nullable<Hex> = end;

    while (step) {
        path.push(step);
        step = cameFrom[indexOf(map, step)];
    }

    return path.reverse();
}