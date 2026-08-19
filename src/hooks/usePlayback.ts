import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_FRAME_MS } from "../core/constants";
import { advanceIndex, clampIndex, lastIndex, stepIndex } from "./playback";
import type { Playback } from "../core/models";

export function usePlayback(eventCount: number, eventsPerSecond: number): Playback {
    const [index, setIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const indexRef = useRef(0);

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
        if (playing) {
            setPlaying(false);
            return;
        }

        if (index >= lastIndex(eventCount)) {
            setIndex(0);
            indexRef.current = 0;
        }

        setPlaying(true);
    }, [playing, index, eventCount]);

    const step = useCallback((direction: number) => {
        setPlaying(false);
        setIndex(current => stepIndex(current, direction, eventCount));
    }, [eventCount]);

    const scrubTo = useCallback((next: number) => {
        setPlaying(false);
        setIndex(clampIndex(next, eventCount));
    }, [eventCount]);

    const reset = useCallback(() => {
        setPlaying(false);
        setIndex(0);
    }, []);

    return { index, playing, toggle, step, scrubTo, reset };
}
