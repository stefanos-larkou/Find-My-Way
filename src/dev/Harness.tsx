import { useEffect, useRef } from "react";
import { generateMap, optionsFor } from "../core/generation";
import { createRandom } from "../core/random";
import { drawMap, prepareCanvas } from "../render/draw";
import { canvasSize } from "../render/geometry";
import { LIGHT_PALETTE } from "../render/palette";

export function Harness() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const map = generateMap(optionsFor(150, 0.5), createRandom(1));
        const context = prepareCanvas(canvas, canvasSize(map));
        if (!context) return;

        drawMap(context, map, LIGHT_PALETTE);
    }, []);

    return <canvas ref={canvasRef} />;
}