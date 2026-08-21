import { useCallback, useEffect, useRef, useState } from "react";
import { EMPTY_INDEX, MAX_FRAME_MS } from "../core/constants";
import { advanceIndex, clampIndex, lastIndex, stepIndex } from "./playback";
import type { Playback } from "../core/models";

export function usePlayback(eventCount: number, eventsPerSecond: number, autoPlay = false): Playback {
    const [index, setIndex] = useState(EMPTY_INDEX);
    const [playing, setPlaying] = useState(autoPlay);
    const [started, setStarted] = useState(autoPlay);
    const indexRef = useRef(EMPTY_INDEX);

    useEffect(() => {
        indexRef.current = index;
    }, [index]);

    useEffect(() => {
        if (!playing) return;

        let last = performance.now();
        let current = indexRef.current;
        let frame = 0;

        const tick = (now: number) => {
            const elapsed = Math.min(now - last, MAX_FRAME_MS);
            last = now;
            current = advanceIndex(current, elapsed, eventsPerSecond, eventCount);
            setIndex(current);

            if (current >= lastIndex(eventCount)) {
                setPlaying(false);
                return;
            }

            frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
    }, [playing, eventsPerSecond, eventCount]);

    const toggle = useCallback(() => {
        setStarted(true);

        if (playing) {
            setPlaying(false);
            return;
        }

        if (index >= lastIndex(eventCount)) {
            setIndex(EMPTY_INDEX);
            indexRef.current = EMPTY_INDEX;
        }

        setPlaying(true);
    }, [playing, index, eventCount]);

    const step = useCallback((direction: number) => {
        setStarted(true);
        setPlaying(false);
        setIndex(current => stepIndex(current, direction, eventCount));
    }, [eventCount]);

    const scrubTo = useCallback((next: number) => {
        setStarted(true);
        setPlaying(false);
        setIndex(clampIndex(next, eventCount));
    }, [eventCount]);

    const reset = useCallback(() => {
        setStarted(false);
        setPlaying(false);
        setIndex(EMPTY_INDEX);
    }, []);

    return { index, playing, started, toggle, step, scrubTo, reset };
}
