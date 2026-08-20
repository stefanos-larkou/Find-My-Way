import { EMPTY_INDEX } from "../core/constants";

export function lastIndex(eventCount: number): number {
    return Math.max(eventCount - 1, EMPTY_INDEX);
}

export function clampIndex(index: number, eventCount: number): number {
    return Math.min(Math.max(index, EMPTY_INDEX), lastIndex(eventCount));
}

export function advanceIndex(index: number, elapsedMs: number, eventsPerSecond: number, eventCount: number): number {
    return clampIndex(index + elapsedMs / 1000 * eventsPerSecond, eventCount);
}

export function stepIndex(index: number, direction: number, eventCount: number): number {
    return clampIndex(Math.floor(index) + direction, eventCount);
}