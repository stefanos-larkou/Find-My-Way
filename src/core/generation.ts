import type { GenerationOptions, Hex, HexMap, MapGrowth } from "./models";
import { BOX_SLACK, BOX_SLACK_PER_COMPLEXITY, HEAVY_SHARE, MAX_WEIGHT, MIN_WEIGHT, ROUGH_SHARE } from "./constants";
import { adjacent, cellAt, createMap, indexOf, openCells, setCell, setWeight } from "./grid";



export function generateMap(options: GenerationOptions, random: () => number): HexMap {
    const growth: MapGrowth = {
        map: createMap(options.width, options.height),
        queued: new Array<boolean>(options.width * options.height).fill(false),
        frontier: []
    };

    const seed = { q: Math.floor(options.width / 2), r: Math.floor(options.height / 2) };

    setCell(growth.map, seed, "open");
    expand(growth, seed, random);

    let placed = 1;
    while (placed < options.cellCount && growth.frontier.length > 0) {
        const pick = random() < options.complexity ? growth.frontier.length - 1 : Math.floor(random() * growth.frontier.length);

        const hex = growth.frontier[pick] ?? seed;
        growth.frontier[pick] = growth.frontier[growth.frontier.length - 1] ?? hex;
        growth.frontier.pop();

        setCell(growth.map, hex, "open");
        placed += 1;
        expand(growth, hex, random);
    }

    assignWeights(growth.map, random);
    return growth.map;
}

export function optionsFor(cellCount: number, complexity: number): GenerationOptions {
    const compactSide = Math.ceil(Math.sqrt(cellCount));
    const side = Math.ceil(compactSide * (BOX_SLACK + complexity * BOX_SLACK_PER_COMPLEXITY));

    return { width: side, height: side, cellCount, complexity };
}

function expand(growth: MapGrowth, hex: Hex, random: () => number): void {
    shuffled(adjacent(growth.map, hex), random).forEach(next => offer(growth, next));
}

function offer(growth: MapGrowth, hex: Hex): void {
    const index = indexOf(growth.map, hex);
    if (growth.queued[index] || cellAt(growth.map, hex) !== "absent") {
        return;
    }

    growth.queued[index] = true;
    growth.frontier.push(hex);
}

function shuffled(hexes: Hex[], random: () => number): Hex[] {
    const remaining = [...hexes];
    const result: Hex[] = [];

    while (remaining.length > 0) {
        const index = Math.floor(random() * remaining.length);
        result.push(...remaining.splice(index, 1));
    }

    return result;
}

function assignWeights(map: HexMap, random: () => number): void {
    openCells(map).forEach(hex => setWeight(map, hex, weightFor(random())));
}

function weightFor(roll: number): number {
    if (roll < HEAVY_SHARE) return MAX_WEIGHT;
    if (roll < HEAVY_SHARE + ROUGH_SHARE) return MIN_WEIGHT + 1;
    return MIN_WEIGHT;
}