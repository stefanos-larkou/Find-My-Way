import { useEffect, useRef } from "react";
import { generateMap, optionsFor } from "../core/generation";
import { createRandom } from "../core/random";
import { drawMap, prepareCanvas } from "../render/draw";
import { canvasSize } from "../render/geometry";
import { LIGHT_PALETTE } from "../render/palette";
import { rolesAt } from "../render/roles";
import { breadthFirst } from "../core/algorithms/breadth-first";
import { furthestApart } from "../core/furthest";
import type { Search } from "../core/models";
import { hexesToDraw } from "../render/layout";

export function Harness() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const map = generateMap(optionsFor(150, 0.4), createRandom(Date.now()));
        const context = prepareCanvas(canvas, canvasSize(map));
        const pair = furthestApart(map);
        if (!context || !pair) return;

        const search: Search = {
            events: breadthFirst(map, pair.start, pair.end),
            start: pair.start,
            end: pair.end
        };
        const roles = rolesAt(map, search, search.events.length - 1);

        drawMap(context, hexesToDraw(map, roles, LIGHT_PALETTE));
    }, []);

    return <canvas ref={canvasRef} />;
}