import type { WallStroke } from "./models";

export function painted(walls: ReadonlySet<number>, index: number, stroke: WallStroke): ReadonlySet<number> {
    if (stroke === "add" ? walls.has(index) : !walls.has(index)) return walls;

    const next = new Set(walls);
    if (stroke === "add") next.add(index);
    else next.delete(index);

    return next;
}

export function weighted(weights: ReadonlyMap<number, number>, index: number, weight: number): ReadonlyMap<number, number> {
    if (weights.get(index) === weight) return weights;

    const next = new Map(weights);
    next.set(index, weight);

    return next;
}
