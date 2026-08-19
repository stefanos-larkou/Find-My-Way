import type { Hex } from "./models";

export const NEIGHBOUR_OFFSETS: Hex[] = [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 }
];

export const UNREACHABLE = -1;

export const BOX_SLACK = 1.5;
export const BOX_SLACK_PER_COMPLEXITY = 2;

export const HEX_SIZE = 14;