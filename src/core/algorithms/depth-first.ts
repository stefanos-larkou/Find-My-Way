import { indexOf, isOpen, neighbours, sameHex } from "../grid";
import type { Hex, HexMap, SearchEvent } from "../models";
import { buildPath } from "./path";

interface Step {
    hex: Hex;
    from: Hex | null;
}

export function depthFirst(map: HexMap, start: Hex, end: Hex): SearchEvent[] {
    if (!isOpen(map, start)) return [];

    const cellCount = map.width * map.height;
    const events: SearchEvent[] = [];
    const visited: boolean[] = new Array<boolean>(cellCount).fill(false);
    const cameFrom: (Hex | null)[] = new Array<Hex | null>(cellCount).fill(null);
    const stack: Step[] = [{ hex: start, from: null }];

    let step = stack.pop();

    while (step) {
        const index = indexOf(map, step.hex);

        if (!visited[index]) {
            visited[index] = true;
            cameFrom[index] = step.from;
            events.push({ type: "visit", hex: step.hex });

            if (sameHex(step.hex, end)) {
                events.push({ type: "path", hexes: buildPath(map, cameFrom, end) });
                return events;
            }

            for (const next of neighbours(map, step.hex)) {
                if (!visited[indexOf(map, next)]) stack.push({ hex: next, from: step.hex });
            }
        }

        step = stack.pop();
    }

    return events;
}