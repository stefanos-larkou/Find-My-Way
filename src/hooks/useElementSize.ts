import { useEffect, useState } from "react";
import type { RefObject } from "react";
import type { Pixel } from "../core/models";

export function useElementSize(ref: RefObject<HTMLElement | null>): Pixel {
    const [size, setSize] = useState<Pixel>({ x: 0, y: 0 });

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new ResizeObserver(entries => {
            const rect = entries[0]?.contentRect;
            if (rect) setSize({ x: rect.width, y: rect.height });
        });

        observer.observe(element);

        return () => observer.disconnect();
    }, [ref]);

    return size;
}