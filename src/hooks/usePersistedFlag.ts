import { useCallback, useState } from "react";

export function usePersistedFlag(key: string, initial: boolean): [boolean, (value: boolean) => void] {
    const [value, setValue] = useState(() => stored(key, initial));

    const update = useCallback((next: boolean) => {
        setValue(next);
        localStorage.setItem(key, String(next));
    }, [key]);

    return [value, update];
}

function stored(key: string, initial: boolean): boolean {
    const saved = localStorage.getItem(key);

    if (saved === "true") return true;
    if (saved === "false") return false;

    return initial;
}
