import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePersistedChoice } from "./usePersistedChoice";

const KEY = "test:choice";
const ALLOWED = ["one", "two", "three"] as const;

describe("usePersistedChoice", () => {
    it("starts at the initial value when nothing is stored", () => {
        const { result } = renderHook(() => usePersistedChoice(KEY, "one", ALLOWED));
        expect(result.current[0]).toBe("one");
    });

    it("reads a stored value on the first render", () => {
        localStorage.setItem(KEY, "three");
        const { result } = renderHook(() => usePersistedChoice(KEY, "one", ALLOWED));
        expect(result.current[0]).toBe("three");
    });

    it("writes every change to storage", () => {
        const { result } = renderHook(() => usePersistedChoice(KEY, "one", ALLOWED));
        act(() => result.current[1]("two"));
        expect(localStorage.getItem(KEY)).toBe("two");
    });

    it("falls back to the initial value when the stored value is not allowed", () => {
        localStorage.setItem(KEY, "foo");
        const { result } = renderHook(() => usePersistedChoice(KEY, "one", ALLOWED));
        expect(result.current[0]).toBe("one");
    });
});
