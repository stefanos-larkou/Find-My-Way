import { presentCells, cellAt } from "../core/grid";
import type { HexMap, HexStyle, MapPalette, Pixel } from "../core/models";
import { hexCorners, hexToPixel, ORIGIN_OFFSET } from "./geometry";

export function drawHex(context: CanvasRenderingContext2D, centre: Pixel, style: HexStyle): void {
    const [first, ...rest] = hexCorners(centre);
    if (!first) {
        return;
    }

    context.beginPath();
    context.moveTo(first.x, first.y);
    rest.forEach(corner => context.lineTo(corner.x, corner.y));
    context.closePath();

    context.fillStyle = style.fill;
    context.fill();
    context.strokeStyle = style.stroke;
    context.stroke();
}

export function prepareCanvas(canvas: HTMLCanvasElement, size: Pixel): CanvasRenderingContext2D | undefined {
    const context = canvas.getContext("2d");
    if (!context) return undefined;

    const ratio = window.devicePixelRatio;
    canvas.width = size.x * ratio;
    canvas.height = size.y * ratio;
    canvas.style.width = `${size.x}px`;
    canvas.style.height = `${size.y}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    return context;
}

export function drawMap(context: CanvasRenderingContext2D, map: HexMap, palette: MapPalette): void {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    presentCells(map).forEach(hex => {
        const centre = hexToPixel(hex);
        const style = cellAt(map, hex) === "wall" ? palette.wall : palette.open;
        drawHex(context, { x: centre.x + ORIGIN_OFFSET.x, y: centre.y + ORIGIN_OFFSET.y }, style);
    });
}