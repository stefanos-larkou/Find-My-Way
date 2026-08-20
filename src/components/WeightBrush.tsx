import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCallback } from "react";
import type { MouseEvent } from "react";
import { MODE_GROUP_WIDTH, WEIGHTS } from "../core/constants";
import { paletteFor, veilFor } from "../render/palette";

interface WeightBrushProps {
    value: number;
    disabled: boolean;
    onChange: (weight: number) => void;
}

export function WeightBrush({ value, disabled, onChange }: WeightBrushProps) {
    const theme = useTheme();

    const change = useCallback((_event: MouseEvent<HTMLElement>, next: number | null) => {
        if (next !== null) onChange(next);
    }, [onChange]);

    return (
        <ToggleButtonGroup
            value={value}
            exclusive
            size="medium"
            onChange={change}
            aria-label="Weight to paint"
            disabled={disabled}
            fullWidth
            sx={{ alignSelf: "center", width: MODE_GROUP_WIDTH, opacity: disabled ? 0.5 : 1 }}
        >
            {WEIGHTS.map(weight => (
                <ToggleButton key={weight} value={weight} aria-label={`Weight ${weight}`}>
                    <Box
                        sx={{
                            width: 14,
                            height: 14,
                            mr: 1,
                            borderRadius: 0.5,
                            backgroundColor: paletteFor(theme.palette.mode).open.fill,
                            backgroundImage: swatch(veilFor(theme.palette.mode, weight))
                        }}
                    />
                    {weight}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
}

function swatch(veil: string | null | undefined): string {
    return veil ? `linear-gradient(${veil}, ${veil})` : "none";
}