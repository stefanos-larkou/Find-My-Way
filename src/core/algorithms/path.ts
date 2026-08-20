import { indexOf } from "../grid";
import type { HexMap, Hex, Nullable } from "../models";

export function buildPath(map: HexMap, cameFrom: (Hex | null)[], end: Hex): Hex[] {
    const path: Hex[] = [];

    let step: Nullable<Hex> = end;
    while (step) {
        path.push(step);
        step = cameFrom[indexOf(map, step)];
    }

    return path.reverse();
}