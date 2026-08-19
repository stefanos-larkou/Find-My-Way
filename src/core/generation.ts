import type { GenerationOptions, Hex, HexMap } from "./models";
import { BOX_SLACK, BOX_SLACK_PER_COMPLEXITY } from "./constants";
import { adjacent, cellAt, createMap, indexOf, setCell } from "./grid";

export function generateMap(options: GenerationOptions, random: () => number): HexMap {
    const map = createMap(options.width, options.height);
    const seed = { q: Math.floor(options.width / 2), r: Math.floor(options.height / 2) };
    const queued: boolean[] = new Array<boolean>(options.width * options.height).fill(false);
    const frontier: Hex[] = [];

    function offer(hex: Hex): void {
        const index = indexOf(map, hex);
        if (queued[index] || cellAt(map, hex) !== "absent") return;

        queued[index] = true;
        frontier.push(hex);
    }

    function expand(hex: Hex): void {
        shuffled(adjacent(map, hex), random).forEach(offer);
    }

    setCell(map, seed, "open");
    expand(seed);

    let placed = 1;
    while (placed < options.cellCount && frontier.length > 0) {
        const pick = random() < options.complexity ? frontier.length - 1 : Math.floor(random() * frontier.length);

        const hex = frontier[pick] ?? seed;
        frontier[pick] = frontier[frontier.length - 1] ?? hex;
        frontier.pop();

        setCell(map, hex, "open");
        placed += 1;
        expand(hex);
    }

    return map;
}

export function optionsFor(cellCount: number, complexity: number): GenerationOptions {
    const compactSide = Math.ceil(Math.sqrt(cellCount));
    const side = Math.ceil(compactSide * (BOX_SLACK + complexity * BOX_SLACK_PER_COMPLEXITY));
    return { width: side, height: side, cellCount, complexity };
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