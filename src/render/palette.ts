import { MIN_WEIGHT, STROKE_VEIL_FACTOR, VEIL_STEP } from "../core/constants";
import type { MapPalette, Nullable } from "../core/models";

export const LIGHT_PALETTE: MapPalette = {
    open: { fill: "#eceff3", stroke: "#cdd4dd" },
    wall: { fill: "#2c3644", stroke: "#171e28" },
    visited: { fill: "#9fc5e8", stroke: "#6f9fcb" },
    path: { fill: "#f5a524", stroke: "#c07c0d" },
    start: { fill: "#0e9f6e", stroke: "#07704c" },
    end: { fill: "#d6337f", stroke: "#a02460" }
};

export const DARK_PALETTE: MapPalette = {
    open: { fill: "#222831", stroke: "#39424e" },
    wall: { fill: "#cbd3de", stroke: "#eef2f7" },
    visited: { fill: "#2f6193", stroke: "#4b86bd" },
    path: { fill: "#ffbf3d", stroke: "#d99a25" },
    start: { fill: "#2fd39b", stroke: "#17a87a" },
    end: { fill: "#f472b6", stroke: "#c94e92" }
};

export function paletteFor(mode: "light" | "dark"): MapPalette {
    return mode === "dark" ? DARK_PALETTE : LIGHT_PALETTE;
}

export function veilFor(mode: "light" | "dark", weight: number): Nullable<string> {
    return veilAt(mode, (weight - MIN_WEIGHT) * VEIL_STEP);
}

export function strokeVeilFor(mode: "light" | "dark", weight: number): Nullable<string> {
    return veilAt(mode, Math.min((weight - MIN_WEIGHT) * VEIL_STEP * STROKE_VEIL_FACTOR, 1));
}

export function mixColours(from: string, to: string, ratio: number): string {
    const held = Math.min(Math.max(ratio, 0), 1);
    const start = channelsOf(from);
    const end = channelsOf(to);
    const channels = [0, 1, 2].map(channel => Math.round((start[channel] ?? 0) + ((end[channel] ?? 0) - (start[channel] ?? 0)) * held));

    return `rgb(${channels.join(", ")})`;
}

function channelsOf(colour: string): number[] {
    return [0, 1, 2].map(channel => Number.parseInt(colour.slice(1 + channel * 2, 3 + channel * 2), 16));
}

function veilAt(mode: "light" | "dark", alpha: number): Nullable<string> {
    if (alpha <= 0) return null;
    return mode === "dark" ? `rgba(196, 181, 253, ${alpha})` : `rgba(88, 61, 168, ${alpha})`;
}
