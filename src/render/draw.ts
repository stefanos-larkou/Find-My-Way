import type { DrawnHex, Pixel } from "../core/models";

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
    hexes.forEach(hex => drawHex(context, hex));
}

function drawHex(context: CanvasRenderingContext2D, hex: DrawnHex): void {
    const [first, ...rest] = hex.corners;
    if (!first) return;

    context.beginPath();
    context.moveTo(first.x, first.y);
    rest.forEach(corner => context.lineTo(corner.x, corner.y));
    context.closePath();

    context.fillStyle = hex.style.fill;
    context.fill();

    if (hex.veil) {
        context.fillStyle = hex.veil;
        context.fill();
    }

    context.strokeStyle = hex.style.stroke;
    context.stroke();

    if (hex.veil) {
        context.strokeStyle = hex.veil;
        context.stroke();
    }
}
