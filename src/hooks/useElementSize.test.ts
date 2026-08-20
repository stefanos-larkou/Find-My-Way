import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { observers } from "../test-setup";
import { useElementSize } from "./useElementSize";

function measure() {
    const ref = { current: document.createElement("div") };
    return renderHook(() => useElementSize(ref));
}

describe("useElementSize", () => {
    it("starts at nothing until the element is measured", () => {
        const { result } = measure();
        expect(result.current).toEqual({ x: 0, y: 0 });
    });

    it("reports the size the observer sends", () => {
        const { result } = measure();
        act(() => observers[0]?.send({ width: 640, height: 480 }));
        expect(result.current).toEqual({ x: 640, y: 480 });
    });

    it("watches the element it was given", () => {
        const ref = { current: document.createElement("div") };
        renderHook(() => useElementSize(ref));
        expect(observers[0]?.observed).toEqual([ref.current]);
    });

    it("observes nothing when there is no element", () => {
        const ref = { current: null };
        renderHook(() => useElementSize(ref));
        expect(observers).toHaveLength(0);
    });

    it("disconnects when unmounted", () => {
        const { unmount } = measure();
        unmount();
        expect(observers[0]?.disconnected).toBe(true);
    });
});
