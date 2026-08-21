import { ThemeProvider, createTheme } from "@mui/material";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { MAX_WEIGHT } from "../core/constants";
import { cellAt, indexOf, openCells, sameHex, weightAt } from "../core/grid";
import type { Hex, Scene, SceneOptions } from "../core/models";
import { lastIndex } from "./playback";
import { useSearchScene } from "./useSearchScene";

const BASE: SceneOptions = {
    seed: 7,
    cellCount: 60,
    complexity: 0.5,
    speed: 30,
    algorithm: "breadth-first",
    terrain: false,
    available: { x: 800, y: 600 }
};

function wrapper({ children }: { children: ReactNode; }) {
    return <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>;

}

function sceneOf(options: SceneOptions) {
    return renderHook(() => useSearchScene(options), { wrapper }).result;
}

function spareCell(scene: Scene): Hex {
    const hex = openCells(scene.baseMap).find(cell => !sameHex(cell, scene.endpoints.start) && !sameHex(cell, scene.endpoints.end));
    if (!hex) throw new Error("expected an open cell that is not an endpoint");
    return hex;
}

describe("useSearchScene", () => {
    it("is not finished before the playback starts", () => {
        expect(sceneOf(BASE).current.finished).toBe(false);
    });

    it("is finished once the playback reaches the last event", () => {
        const scene = sceneOf(BASE);
        act(() => scene.current.playback.scrubTo(lastIndex(scene.current.search.events.length)));
        expect(scene.current.finished).toBe(true);
    });

    it("picks its own endpoints when none are given", () => {
        const scene = sceneOf(BASE);
        expect(sameHex(scene.current.endpoints.start, scene.current.endpoints.end)).toBe(false);
        expect(cellAt(scene.current.map, scene.current.endpoints.start)).toBe("open");
    });

    it("uses the endpoints it is given", () => {
        const scene = sceneOf(BASE);
        const start = spareCell(scene.current);
        const end = scene.current.endpoints.end;
        expect(sceneOf({ ...BASE, chosen: { start, end } }).current.endpoints).toEqual({ start, end });
    });

    it("leaves the map unwalled when no walls are given", () => {
        expect(sceneOf(BASE).current.map.cells).not.toContain("wall");
    });

    it("walls the cells it is given", () => {
        const scene = sceneOf(BASE);
        const hex = spareCell(scene.current);
        const walls = new Set([indexOf(scene.current.baseMap, hex)]);
        expect(cellAt(sceneOf({ ...BASE, walls }).current.map, hex)).toBe("wall");
    });

    it("leaves the ground plain when no weights are given", () => {
        const scene = sceneOf({ ...BASE, terrain: true });
        expect(scene.current.map.weights.filter(weight => weight > MAX_WEIGHT)).toEqual([]);
        expect(weightAt(scene.current.map, spareCell(scene.current))).toBeGreaterThan(0);
    });

    it("paints the weights it is given", () => {
        const scene = sceneOf(BASE);
        const hex = spareCell(scene.current);
        const weights = new Map([[indexOf(scene.current.baseMap, hex), MAX_WEIGHT]]);
        expect(weightAt(sceneOf({ ...BASE, terrain: true, weights }).current.map, hex)).toBe(MAX_WEIGHT);
    });

    it("starts playing when asked to", () => {
        expect(sceneOf({ ...BASE, autoPlay: true }).current.playback.playing).toBe(true);
    });
});
