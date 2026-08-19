import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePersistedNumber } from "./usePersistedNumber";

const KEY = "test:value";

describe("usePersistedNumber", () => {
    it("starts at the initial value when nothing is stored", () => {
        const { result } = renderHook(() => usePersistedNumber(KEY, 42, 1, 100));

        expect(result.current[0]).toBe(42);
    });

    it("reads a stored value on the first render", () => {
        localStorage.setItem(KEY, "77");

        const { result } = renderHook(() => usePersistedNumber(KEY, 42, 1, 100));

        expect(result.current[0]).toBe(77);
    });

    it("writes every change to storage", () => {
        const { result } = renderHook(() => usePersistedNumber(KEY, 42, 1, 100));

        act(() => result.current[1](63));

        expect(localStorage.getItem(KEY)).toBe("63");
    });

    it("holds a stored value that is out of range", () => {
        localStorage.setItem(KEY, "5000");

        const { result } = renderHook(() => usePersistedNumber(KEY, 42, 1, 100));

        expect(result.current[0]).toBe(100);
    });

    it("falls back to the initial value when the stored value is not a number", () => {
        localStorage.setItem(KEY, "banana");

        const { result } = renderHook(() => usePersistedNumber(KEY, 42, 1, 100));

        expect(result.current[0]).toBe(42);
    });
});
