import type { MapPalette } from "../core/models";

export const LIGHT_PALETTE: MapPalette = {
    open: { fill: "#e8eef5", stroke: "#c2cedb" },
    wall: { fill: "#3f4854", stroke: "#2c333c" },
    visited: { fill: "#bcd8f2", stroke: "#8fb8dd" },
    path: { fill: "#f2a900", stroke: "#c98c00" },
    start: { fill: "#2e9e5b", stroke: "#237a46" },
    end: { fill: "#d64545", stroke: "#ab3636" }
};

export const DARK_PALETTE: MapPalette = {
    open: { fill: "#262d36", stroke: "#39424e" },
    wall: { fill: "#11151a", stroke: "#05080b" },
    visited: { fill: "#1f4468", stroke: "#2c5c8a" },
    path: { fill: "#ffc94d", stroke: "#d9a52f" },
    start: { fill: "#3ecf7a", stroke: "#2ea55f" },
    end: { fill: "#ff6b6b", stroke: "#d35050" }
};

export function paletteFor(mode: "light" | "dark"): MapPalette {
    return mode === "dark" ? DARK_PALETTE : LIGHT_PALETTE;
}