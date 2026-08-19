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

export const MIN_EVENTS_PER_SECOND = 1;
export const MAX_EVENTS_PER_SECOND = 240;

export const MAX_FRAME_MS = 100;

export const DEFAULT_CELL_COUNT = 150;

export const MIN_CELL_COUNT = 30;
export const MAX_CELL_COUNT = 3000;

export const MAX_HEX_SIZE = 36;
export const CONTROLS_WIDTH = 460;

export const TRANSPORT_BUTTONS_WIDTH = 136;

export const DEFAULT_STEP_SIZE = 1;
export const MIN_STEP_SIZE = 1;
export const MAX_STEP_SIZE = 100;

export const SLIDER_MIN = 1;
export const SLIDER_MAX = 100;

export const DEFAULT_SPEED_SLIDER = 50;
export const DEFAULT_COMPLEXITY_SLIDER = 50;