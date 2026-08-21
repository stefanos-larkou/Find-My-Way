import { ThemeProvider, createTheme } from "@mui/material";
import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AutoSearch } from "./AutoSearch";

function renderSearch(onFinished: () => void) {
    return render(
        <ThemeProvider theme={createTheme()}>
            <AutoSearch seed={1} cellCount={40} complexity={0.5} speed={100000} algorithm="breadth-first" onFinished={onFinished} />
        </ThemeProvider>
    );
}

beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (tick: FrameRequestCallback) => {
        tick(performance.now() + 1000);
        return 0;
    });
    vi.stubGlobal("cancelAnimationFrame", () => undefined);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("AutoSearch", () => {
    it("plays without being asked", async () => {
        const onFinished = vi.fn();
        renderSearch(onFinished);
        await waitFor(() => expect(onFinished).toHaveBeenCalled());
    });

    it("reports finishing once, however often it re-renders", async () => {
        const onFinished = vi.fn();
        const { rerender } = renderSearch(onFinished);
        await waitFor(() => expect(onFinished).toHaveBeenCalled());
        rerender(
            <ThemeProvider theme={createTheme()}>
                <AutoSearch seed={1} cellCount={40} complexity={0.5} speed={100000} algorithm="breadth-first" onFinished={() => onFinished()} />
            </ThemeProvider>
        );
        expect(onFinished).toHaveBeenCalledTimes(1);
    });
});
