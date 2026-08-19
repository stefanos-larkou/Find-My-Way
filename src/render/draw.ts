import type { DrawnHex, HexStyle, Pixel } from "../core/models";
import { hexCorners } from "./geometry";

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

export function drawMap(context: CanvasRenderingContext2D, hexes: DrawnHex[]): void {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    hexes.forEach(hex => drawHex(context, hex.centre, hex.style));
}

function drawHex(context: CanvasRenderingContext2D, centre: Pixel, style: HexStyle): void {
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