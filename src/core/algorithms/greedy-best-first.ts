import { hexDistance, indexOf, isOpen, neighbours, sameHex } from "../grid";
import type { Hex, HexMap, SearchEvent } from "../models";
import { takeBestBy } from "./frontier";
import { buildPath } from "./path";

export function greedyBestFirst(map: HexMap, start: Hex, end: Hex): SearchEvent[] {
    if (!isOpen(map, start)) return [];

    const cellCount = map.width * map.height;
    const events: SearchEvent[] = [];
    const cameFrom: (Hex | null)[] = new Array<Hex | null>(cellCount).fill(null);
    const seen: boolean[] = new Array<boolean>(cellCount).fill(false);
    const open: Hex[] = [start];

    seen[indexOf(map, start)] = true;

    let current = takeBestBy(open, hex => hexDistance(hex, end));
    while (current) {
        events.push({ type: "visit", hex: current });

        if (sameHex(current, end)) {
            events.push({ type: "path", hexes: buildPath(map, cameFrom, end) });
            return events;
        }

        for (const next of neighbours(map, current)) {
            const nextIndex = indexOf(map, next);
            if (seen[nextIndex]) continue;

            seen[nextIndex] = true;
            cameFrom[nextIndex] = current;
            open.push(next);
        }

        current = takeBestBy(open, hex => hexDistance(hex, end));
    }

    return events;
}
