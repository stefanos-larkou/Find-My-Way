import { ThemeProvider, createTheme } from "@mui/material";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Nullable } from "../core/models";
import { HexSwatch } from "./HexSwatch";

function swatchOf(fill: string, veil?: Nullable<string>): CSSStyleDeclaration {
    const { container } = render(
        <ThemeProvider theme={createTheme()}>
            <HexSwatch fill={fill} veil={veil} />
        </ThemeProvider>
    );
    const swatch = container.firstElementChild;
    if (!swatch) throw new Error("HexSwatch rendered nothing");

    return getComputedStyle(swatch);
}

describe("HexSwatch", () => {
    it("paints the fill it is given", () => {
        expect(swatchOf("rgb(1, 2, 3)").backgroundColor).toBe("rgb(1, 2, 3)");
    });

    it("layers a veil over the fill", () => {
        expect(swatchOf("rgb(1, 2, 3)", "rgba(4, 5, 6, 0.5)").backgroundImage).toContain("rgba(4, 5, 6, 0.5)");
    });

    it("layers nothing when there is no veil", () => {
        expect(swatchOf("rgb(1, 2, 3)").backgroundImage).toBe("none");
    });
});
