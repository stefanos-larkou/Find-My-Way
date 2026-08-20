import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FindMyWay } from "./FindMyWay";
import { ALGORITHMS } from "../core/algorithms/registry";

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
    it("returns the playback to the start when replayed", async () => {
        renderVisualiser();
        await userEvent.click(screen.getByRole("button", { name: "Step forward 1 event" }));
        await userEvent.click(screen.getByRole("button", { name: "Replay" }));
        expect(screen.getByRole("slider", { name: "Search progress" })).toHaveAttribute("aria-valuenow", "0");
    });

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

    it("switches what a click places", async () => {
        renderVisualiser();
        await userEvent.click(screen.getByRole("button", { name: "Start" }));
        expect(screen.getByRole("button", { name: "Start" })).toHaveAttribute("aria-pressed", "true");
    });

    it("keeps the current mode when the active button is clicked again", async () => {
        renderVisualiser();
        await userEvent.click(screen.getByRole("button", { name: "Start" }));
        await userEvent.click(screen.getByRole("button", { name: "Start" }));
        expect(screen.getByRole("button", { name: "Start" })).toHaveAttribute("aria-pressed", "true");
    });

    it("lets the user choose an algorithm", async () => {
        const { label } = ALGORITHMS["depth-first"];
        renderVisualiser();
        await userEvent.click(screen.getByRole("combobox", { name: "Algorithm" }));
        await userEvent.click(screen.getByRole("option", { name: label }));
        expect(screen.getByRole("combobox", { name: "Algorithm" })).toHaveTextContent(label);
    });

    it("shows how far through the events the playback is", async () => {
        renderVisualiser();
        await userEvent.click(screen.getByRole("button", { name: "Step forward 1 event" }));
        expect(screen.getByText(/^2 \/ \d+$/)).toBeInTheDocument();
    });

    it("offers the weight tool only once terrain is switched on", async () => {
        renderVisualiser();
        expect(screen.queryByRole("button", { name: "Weight" })).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole("switch", { name: "Weighted terrain" }));
        expect(screen.getByRole("button", { name: "Weight" })).toBeInTheDocument();
    });

    it("enables the weight brush only once the weight tool is chosen", async () => {
        renderVisualiser();
        await userEvent.click(screen.getByRole("switch", { name: "Weighted terrain" }));
        expect(screen.getByRole("button", { name: "Weight 3" })).toBeDisabled();
        await userEvent.click(screen.getByRole("button", { name: "Weight" }));
        expect(screen.getByRole("button", { name: "Weight 3" })).toBeEnabled();
    });

    it("returns to placing walls when terrain is switched off", async () => {
        renderVisualiser();
        await userEvent.click(screen.getByRole("switch", { name: "Weighted terrain" }));
        await userEvent.click(screen.getByRole("button", { name: "Weight" }));
        await userEvent.click(screen.getByRole("switch", { name: "Weighted terrain" }));
        expect(screen.getByRole("button", { name: "Wall" })).toHaveAttribute("aria-pressed", "true");
    });

});
