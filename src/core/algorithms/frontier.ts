import type { Hex } from "../models";

export function takeBestBy(open: Hex[], score: (hex: Hex) => number): Hex | undefined {
    let bestAt = 0;
    let bestScore = Infinity;

    open.forEach((hex, position) => {
        const value = score(hex);

        if (value < bestScore) {
            bestScore = value;
            bestAt = position;
        }
    });

    const best = open[bestAt];
    const last = open.pop();
    if (last !== undefined && bestAt < open.length) open[bestAt] = last;

    return best;
}