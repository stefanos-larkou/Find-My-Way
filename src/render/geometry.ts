import { MAX_HEX_SIZE } from "../core/constants";
import type { FractionalHex, Hex, HexMap, Pixel, ViewLayout } from "../core/models";
import { presentCells } from "../core/grid";

interface Extent {
    minX: number;
    maxX: number;
    minR: number;
    maxR: number;
}

export function layoutFor(map: HexMap, available: Pixel): ViewLayout {
    const extent = extentOf(map);
    const across = Math.sqrt(3) * (extent.maxX - extent.minX + 1);
    const down = 1.5 * (extent.maxR - extent.minR) + 2;
    const hexSize = Math.min(available.x / across, available.y / down, MAX_HEX_SIZE);

    return {
        hexSize,
        origin: {
            x: hexSize * Math.sqrt(3) * (0.5 - extent.minX),
            y: hexSize * (1 - 1.5 * extent.minR)
        },
        canvas: { x: hexSize * across, y: hexSize * down }
    };
}

function extentOf(map: HexMap): Extent {
    const cells = presentCells(map);
    if (cells.length === 0) {
        return { minX: 0, maxX: map.width - 1, minR: 0, maxR: map.height - 1 };
    }

    return cells.reduce<Extent>((extent, hex) => ({
        minX: Math.min(extent.minX, hex.q + hex.r / 2),
        maxX: Math.max(extent.maxX, hex.q + hex.r / 2),
        minR: Math.min(extent.minR, hex.r),
        maxR: Math.max(extent.maxR, hex.r)
    }), { minX: Infinity, maxX: -Infinity, minR: Infinity, maxR: -Infinity });
}

export function hexToPixel(hex: Hex, view: ViewLayout): Pixel {
    return {
        x: view.origin.x + view.hexSize * Math.sqrt(3) * (hex.q + hex.r / 2),
        y: view.origin.y + view.hexSize * 1.5 * hex.r
    };
}

export function pixelToHex(pixel: Pixel, view: ViewLayout): FractionalHex {
    const x = pixel.x - view.origin.x;
    const y = pixel.y - view.origin.y;

    return {
        q: (Math.sqrt(3) / 3 * x - y / 3) / view.hexSize,
        r: (2 / 3 * y) / view.hexSize
    };
}

export function hexCorners(centre: Pixel, view: ViewLayout): Pixel[] {
    return [0, 1, 2, 3, 4, 5].map(corner => {
        const angle = Math.PI / 180 * (60 * corner - 30);

        return {
            x: centre.x + view.hexSize * Math.cos(angle),
            y: centre.y + view.hexSize * Math.sin(angle)
        };
    });
}