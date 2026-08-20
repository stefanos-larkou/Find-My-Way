import { MAX_COMPLEXITY, MAX_EVENTS_PER_SECOND, MIN_EVENTS_PER_SECOND, SLIDER_MAX, SLIDER_MIN } from "./constants";

export function withinRange(value: number, min: number, max: number): number {
    if (Number.isNaN(value)) return min;
    return Math.min(Math.max(value, min), max);
}

export function fraction(slider: number): number {
    return (slider - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN);
}

export function complexityFrom(slider: number): number {
    return fraction(slider) * MAX_COMPLEXITY;
}

export function speedFrom(slider: number): number {
    const ratio = MAX_EVENTS_PER_SECOND / MIN_EVENTS_PER_SECOND;
    return MIN_EVENTS_PER_SECOND * ratio ** fraction(slider);
}