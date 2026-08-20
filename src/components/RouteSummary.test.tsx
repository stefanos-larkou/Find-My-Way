import { ThemeProvider, createTheme } from "@mui/material";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Outcome } from "../core/models";
import { RouteSummary } from "./RouteSummary";

const FOUND: Outcome = { found: true, steps: 129, cost: 209 };

function renderSummary(outcome: Outcome, terrain: boolean) {
    render(
        <ThemeProvider theme={createTheme()}>
            <RouteSummary outcome={outcome} terrain={terrain} />
        </ThemeProvider>
    );
}

describe("RouteSummary", () => {
    it("reports the number of steps", () => {
        renderSummary(FOUND, false);
        expect(screen.getByLabelText("129 steps")).toBeInTheDocument();
    });

    it("leaves the cost out while terrain is off", () => {
        renderSummary(FOUND, false);
        expect(screen.queryByLabelText("209 cost")).not.toBeInTheDocument();
    });

    it("reports the cost as well once terrain is on", () => {
        renderSummary(FOUND, true);
        expect(screen.getByLabelText("129 steps")).toBeInTheDocument();
        expect(screen.getByLabelText("209 cost")).toBeInTheDocument();
    });

    it("says so when there is no route", () => {
        renderSummary({ found: false, steps: 0, cost: 0 }, true);
        expect(screen.getByText("No route")).toBeInTheDocument();
        expect(screen.queryByLabelText(/steps$/)).not.toBeInTheDocument();
    });
});
