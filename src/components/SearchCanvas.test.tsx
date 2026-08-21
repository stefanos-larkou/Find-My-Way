import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchCanvas } from "./SearchCanvas";

const VIEW = { hexSize: 10, origin: { x: 0, y: 0 }, canvas: { x: 100, y: 100 } };

describe("SearchCanvas", () => {
    it("passes pointer events on to whoever is listening", () => {
        const onPointerDown = vi.fn();
        const onPointerMove = vi.fn();
        const onPointerUp = vi.fn();
        const { container } = render(
            <SearchCanvas view={VIEW} hexes={[]} route={[]} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} />
        );
        const canvas = container.querySelector("canvas");
        if (!canvas) throw new Error("expected a canvas");

        fireEvent.pointerDown(canvas);
        fireEvent.pointerMove(canvas);
        fireEvent.pointerUp(canvas);

        expect(onPointerDown).toHaveBeenCalled();
        expect(onPointerMove).toHaveBeenCalled();
        expect(onPointerUp).toHaveBeenCalled();
    });
});
