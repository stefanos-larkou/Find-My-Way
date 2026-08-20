import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePersistedFlag } from "./usePersistedFlag";

const KEY = "test:flag";

describe("usePersistedFlag", () => {
    it("starts at the initial value when nothing is stored", () => {
        const { result } = renderHook(() => usePersistedFlag(KEY, true));
        expect(result.current[0]).toBe(true);
    });

    it("reads a stored value on the first render", () => {
        localStorage.setItem(KEY, "false");
        const { result } = renderHook(() => usePersistedFlag(KEY, true));
        expect(result.current[0]).toBe(false);
    });

    it("writes every change to storage", () => {
        const { result } = renderHook(() => usePersistedFlag(KEY, false));
        act(() => result.current[1](true));
        expect(localStorage.getItem(KEY)).toBe("true");
    });

    it("falls back to the initial value when the stored value is not a flag", () => {
        localStorage.setItem(KEY, "banana");
        const { result } = renderHook(() => usePersistedFlag(KEY, true));
        expect(result.current[0]).toBe(true);
    });
});
