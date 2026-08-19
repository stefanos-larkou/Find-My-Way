import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { ControlSlider } from "./ControlSlider";

function Editable({ min, max }: { min: number; max: number; }) {
    const [value, setValue] = useState(min);
    return <ControlSlider label="Speed" value={value} min={min} max={max} onChange={setValue} />;
}

describe("ControlSlider", () => {
    it("holds a typed value at the maximum", () => {
        render(<Editable min={1} max={100} />);
        fireEvent.change(screen.getByLabelText("Speed value"), { target: { value: "150" } });
        expect(screen.getByLabelText("Speed value")).toHaveValue(100);
    });

    it("holds a typed value at the minimum", () => {
        render(<Editable min={30} max={1000} />);
        fireEvent.change(screen.getByLabelText("Speed value"), { target: { value: "5" } });
        expect(screen.getByLabelText("Speed value")).toHaveValue(30);
    });

    it("shows the same value on the slider and the input", () => {
        render(<Editable min={1} max={100} />);
        fireEvent.change(screen.getByLabelText("Speed value"), { target: { value: "42" } });
        expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "42");
    });
});
