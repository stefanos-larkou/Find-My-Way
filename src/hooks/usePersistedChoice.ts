import { useCallback, useState } from "react";

export function usePersistedChoice<T extends string>(key: string, initial: T, allowed: readonly T[]): [T, (value: T) => void] {
    const [value, setValue] = useState(() => stored(key, initial, allowed));

    const update = useCallback((next: T) => {
        setValue(next);
        localStorage.setItem(key, next);
    }, [key]);

    return [value, update];
}

function stored<T extends string>(key: string, initial: T, allowed: readonly T[]): T {
    const saved = localStorage.getItem(key);
    return allowed.find(option => option === saved) ?? initial;
}
