import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FindMyWay } from "./FindMyWay";

function renderVisualiser() {
    render(
        <ThemeProvider theme={createTheme()}>
            <FindMyWay />
        </ThemeProvider>
    );
}

beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", () => 0);
    vi.stubGlobal("cancelAnimationFrame", () => undefined);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("FindMyWay", () => {
    it("offers to play and then to pause", async () => {
        renderVisualiser();
        await userEvent.click(screen.getByRole("button", { name: "Play" }));
        expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    });

    it("moves the search progress forward when stepped", async () => {
        renderVisualiser();
        await userEvent.click(screen.getByRole("button", { name: "Step forward 1 event" }));
        expect(screen.getByRole("slider", { name: "Search progress" })).toHaveAttribute("aria-valuenow", "1");
    });

    it("names the step buttons after the step size", () => {
        renderVisualiser();
        fireEvent.change(screen.getByLabelText("Step size"), { target: { value: "5" } });
        expect(screen.getByRole("button", { name: "Step forward 5 events" })).toBeInTheDocument();
    });
});
