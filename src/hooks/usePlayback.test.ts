import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePlayback } from "./usePlayback";

const EVENT_COUNT = 10;
const SPEED = 30;

beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", () => 0);
    vi.stubGlobal("cancelAnimationFrame", () => undefined);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("usePlayback", () => {
    it("steps forward and back between whole events", () => {
        const { result } = renderHook(() => usePlayback(EVENT_COUNT, SPEED));

        act(() => result.current.step(1));
        expect(result.current.index).toBe(1);

        act(() => result.current.step(-1));
        expect(result.current.index).toBe(0);
    });

    it("clamps a scrub to the event range", () => {
        const { result } = renderHook(() => usePlayback(EVENT_COUNT, SPEED));
        act(() => result.current.scrubTo(50));
        expect(result.current.index).toBe(9);
    });

    it("stops playing when the user steps", () => {
        const { result } = renderHook(() => usePlayback(EVENT_COUNT, SPEED));

        act(() => result.current.toggle());
        expect(result.current.playing).toBe(true);

        act(() => result.current.step(1));
        expect(result.current.playing).toBe(false);
    });

    it("restarts from the beginning when played from the end", () => {
        const { result } = renderHook(() => usePlayback(EVENT_COUNT, SPEED));

        act(() => result.current.scrubTo(9));
        act(() => result.current.toggle());

        expect(result.current.index).toBe(0);
        expect(result.current.playing).toBe(true);
    });

    it("resets to the start and stops", () => {
        const { result } = renderHook(() => usePlayback(EVENT_COUNT, SPEED));

        act(() => result.current.scrubTo(5));
        act(() => result.current.reset());

        expect(result.current.index).toBe(0);
        expect(result.current.playing).toBe(false);
    });
});
