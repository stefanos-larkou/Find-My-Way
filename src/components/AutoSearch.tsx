import { Box } from "@mui/material";
import { useEffect, useRef } from "react";
import type { AlgorithmName } from "../core/algorithms/registry";
import { useElementSize } from "../hooks/useElementSize";
import { useSearchScene } from "../hooks/useSearchScene";
import { SearchCanvas } from "./SearchCanvas";

interface AutoSearchProps {
    seed: number;
    cellCount: number;
    complexity: number;
    speed: number;
    algorithm: AlgorithmName;
    terrain?: boolean;
    onFinished?: () => void;
}

export function AutoSearch({ seed, cellCount, complexity, speed, algorithm, terrain = false, onFinished }: AutoSearchProps) {
    const areaRef = useRef<HTMLDivElement>(null);
    const reported = useRef(false);
    const available = useElementSize(areaRef);
    const { view, hexes, route, finished } = useSearchScene({
        seed,
        cellCount,
        complexity,
        speed,
        algorithm,
        terrain,
        available,
        autoPlay: true
    });

    useEffect(() => {
        if (!finished || reported.current) return;

        reported.current = true;
        onFinished?.();
    }, [finished, onFinished]);

    return (
        <Box ref={areaRef} sx={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <SearchCanvas view={view} hexes={hexes} route={route} />
        </Box>
    );
}
