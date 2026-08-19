export function lastIndex(eventCount: number): number {
    return Math.max(eventCount - 1, 0);
}

export function clampIndex(index: number, eventCount: number): number {
    return Math.min(Math.max(index, 0), lastIndex(eventCount));
}

export function advanceIndex(index: number, elapsedMs: number, eventsPerSecond: number, eventCount: number): number {
    return clampIndex(index + elapsedMs / 1000 * eventsPerSecond, eventCount);
}

export function stepIndex(index: number, direction: number, eventCount: number): number {
    return clampIndex(Math.floor(index) + direction, eventCount);
}