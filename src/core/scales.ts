import { fraction, geometric } from "@stefanos-larkou/sim-kit";
import { MAX_COMPLEXITY, MAX_EVENTS_PER_SECOND, MIN_EVENTS_PER_SECOND, SLIDER_MAX, SLIDER_MIN } from "./constants";

export function complexityFrom(slider: number): number {
    return fraction(slider, SLIDER_MIN, SLIDER_MAX) * MAX_COMPLEXITY;
}

export function speedFrom(slider: number): number {
    return geometric(fraction(slider, SLIDER_MIN, SLIDER_MAX), MIN_EVENTS_PER_SECOND, MAX_EVENTS_PER_SECOND);
}
