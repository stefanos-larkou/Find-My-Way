import { Box } from "@mui/material";
import { useEffect, useRef } from "react";
import type { PointerEvent } from "react";
import type { DrawnHex, DrawnSegment, ViewLayout } from "../core/models";
import { drawMap, drawRoute, prepareCanvas } from "../render/draw";
import { routeWidthFor } from "../render/layout";

interface SearchCanvasProps {
    view: ViewLayout;
    hexes: DrawnHex[];
    route: DrawnSegment[];
    onPointerDown?: (event: PointerEvent<HTMLCanvasElement>) => void;
    onPointerMove?: (event: PointerEvent<HTMLCanvasElement>) => void;
    onPointerUp?: (event: PointerEvent<HTMLCanvasElement>) => void;
    onPointerCancel?: (event: PointerEvent<HTMLCanvasElement>) => void;
    onPointerLeave?: (event: PointerEvent<HTMLCanvasElement>) => void;
}

export function SearchCanvas({ view, hexes, route, ...pointer }: SearchCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | undefined>(undefined);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        contextRef.current = prepareCanvas(canvas, view.canvas);
    }, [view]);

    useEffect(() => {
        const context = contextRef.current;
        if (!context) return;

        drawMap(context, hexes);
        drawRoute(context, route, routeWidthFor(view.hexSize));
    }, [hexes, route, view]);

    return (
        <Box
            component="canvas"
            ref={canvasRef}
            {...pointer}
            sx={{ display: "block", maxWidth: "100%", cursor: "pointer", touchAction: "none" }}
        />
    );
}
