import { Tooltip } from "@mui/material";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { prepareCanvas } from "../render/draw";
import { SearchCanvas } from "./SearchCanvas";

vi.mock("../render/draw", { spy: true });

const VIEW = { hexSize: 10, origin: { x: 0, y: 0 }, canvas: { x: 100, y: 100 } };

describe("SearchCanvas", () => {
    it("hands the canvas element to be prepared", () => {
        render(<SearchCanvas view={VIEW} hexes={[]} route={[]} />);
        expect(prepareCanvas).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), VIEW.canvas);
    });

    it("still finds its canvas when something wraps it", () => {
        render(
            <Tooltip title="anything" open>
                <SearchCanvas view={VIEW} hexes={[]} route={[]} />
            </Tooltip>
        );
        expect(prepareCanvas).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), VIEW.canvas);
    });
});