import { ThemeProvider, createTheme } from "@mui/material";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WEIGHTS } from "../core/constants";
import { WeightBrush } from "./WeightBrush";

function renderBrush(value: number, onChange: (weight: number) => void, disabled = false) {
    render(
        <ThemeProvider theme={createTheme()}>
            <WeightBrush value={value} disabled={disabled} onChange={onChange} />
        </ThemeProvider>
    );
}

describe("WeightBrush", () => {
    it("offers every weight", () => {
        renderBrush(1, vi.fn());

        WEIGHTS.forEach(weight => expect(screen.getByRole("button", { name: `Weight ${weight}` })).toBeInTheDocument());
    });

    it("marks the chosen weight", () => {
        renderBrush(2, vi.fn());

        expect(screen.getByRole("button", { name: "Weight 2" })).toHaveAttribute("aria-pressed", "true");
    });

    it("takes no pick while disabled", () => {
        renderBrush(1, vi.fn(), true);

        WEIGHTS.forEach(weight => expect(screen.getByRole("button", { name: `Weight ${weight}` })).toBeDisabled());
    });

    it("reports the weight the user picks", async () => {
        const onChange = vi.fn();
        renderBrush(1, onChange);

        await userEvent.click(screen.getByRole("button", { name: "Weight 3" }));

        expect(onChange).toHaveBeenCalledWith(3);
    });
});
