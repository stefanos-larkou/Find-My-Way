import type { Hex, HexMap, Outcome, SearchEvent } from "./models";
import { weightAt } from "./grid";

export function pathOf(events: SearchEvent[]): Hex[] {
    for (const event of events) {
        if (event.type === "path") return event.hexes;
    }

    return [];
}

export function costOf(map: HexMap, path: Hex[]): number {
    return path.slice(1).reduce((total, hex) => total + weightAt(map, hex), 0);
}

export function outcomeOf(map: HexMap, events: SearchEvent[]): Outcome {
    const path = pathOf(events);

    return {
        found: path.length > 0,
        steps: Math.max(path.length - 1, 0),
        cost: costOf(map, path)
    };
}
