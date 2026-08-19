import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { NumberField } from "./NumberField";

interface EditableProps {
    start: number;
    min: number;
    max: number;
    step?: number;
    showLabel?: boolean;
}

function Editable({ start, min, max, step, showLabel }: EditableProps) {
    const [value, setValue] = useState(start);

    return (
        <NumberField
            label="Speed"
            value={value}
            min={min}
            max={max}
            step={step}
            showLabel={showLabel}
            onChange={setValue}
        />
    );
}

describe("NumberField", () => {
    it("increases the value by the step", async () => {
        render(<Editable start={50} min={1} max={100} step={5} />);
        await userEvent.click(screen.getByRole("button", { name: "Increase speed" }));
        expect(screen.getByLabelText("Speed value")).toHaveValue(55);
    });

    it("decreases the value by the step", async () => {
        render(<Editable start={50} min={1} max={100} step={5} />);
        await userEvent.click(screen.getByRole("button", { name: "Decrease speed" }));
        expect(screen.getByLabelText("Speed value")).toHaveValue(45);
    });

    it("will not increase past the maximum", async () => {
        render(<Editable start={100} min={1} max={100} />);
        await userEvent.click(screen.getByRole("button", { name: "Increase speed" }));
        expect(screen.getByLabelText("Speed value")).toHaveValue(100);
    });

    it("will not decrease below the minimum", async () => {
        render(<Editable start={30} min={30} max={1000} />);
        await userEvent.click(screen.getByRole("button", { name: "Decrease speed" }));
        expect(screen.getByLabelText("Speed value")).toHaveValue(30);
    });

    it("names the field with a visible label when asked", () => {
        render(<Editable start={1} min={1} max={100} showLabel />);
        expect(screen.getByLabelText("Speed")).toBeInTheDocument();
    });
});
