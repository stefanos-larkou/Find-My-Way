import type { FractionalHex, Hex, HexMap, Pixel } from "../core/models";
import { HEX_SIZE } from "../core/constants";

export const ORIGIN_OFFSET: Pixel = {
    x: HEX_SIZE * Math.sqrt(3) / 2,
    y: HEX_SIZE
};

export function hexToPixel(hex: Hex): Pixel {
    return {
        x: HEX_SIZE * Math.sqrt(3) * (hex.q + hex.r / 2),
        y: HEX_SIZE * 1.5 * hex.r
    };
}

export function pixelToHex(pixel: Pixel): FractionalHex {
    return {
        q: (Math.sqrt(3) / 3 * pixel.x - pixel.y / 3) / HEX_SIZE,
        r: (2 / 3 * pixel.y) / HEX_SIZE
    };
}

export function hexCorners(centre: Pixel): Pixel[] {
    return [0, 1, 2, 3, 4, 5].map(corner => {
        const angle = Math.PI / 180 * (60 * corner - 30);

        return {
            x: centre.x + HEX_SIZE * Math.cos(angle),
            y: centre.y + HEX_SIZE * Math.sin(angle)
        };
    });
}

export function canvasSize(map: HexMap): Pixel {
    return {
        x: HEX_SIZE * Math.sqrt(3) * (map.width + (map.height - 1) / 2),
        y: HEX_SIZE * (1.5 * (map.height - 1) + 2)
    };
}