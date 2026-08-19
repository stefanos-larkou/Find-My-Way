import { useCallback, useState } from "react";
import { withinRange } from "../core/scales";

export function usePersistedNumber(key: string, initial: number, min: number, max: number): [number, (value: number) => void] {
    const [value, setValue] = useState(() => stored(key, initial, min, max));

    const update = useCallback((next: number) => {
        const held = withinRange(next, min, max);

        setValue(held);
        localStorage.setItem(key, String(held));
    }, [key, min, max]);

    return [value, update];
}

function stored(key: string, initial: number, min: number, max: number): number {
    const saved = localStorage.getItem(key);
    if (saved === null) return initial;

    const parsed = Number(saved);

    return withinRange(Number.isNaN(parsed) ? initial : parsed, min, max);
}
