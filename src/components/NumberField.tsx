import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { IconButton, Stack, TextField } from "@mui/material";
import { withinRange } from "../core/scales";

interface NumberFieldProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    showLabel?: boolean;
    width?: number | string;
    onChange: (value: number) => void;
}

const NO_NATIVE_SPINNERS = {
    "& input[type=number]": { MozAppearance: "textfield" },
    "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button": {
        WebkitAppearance: "none",
        margin: 0
    }
};

export function NumberField({ label, value, min, max, step = 1, showLabel = false, width = 120, onChange }: NumberFieldProps) {
    return (
        <TextField
            type="number"
            size="medium"
            label={showLabel ? label : undefined}
            value={value}
            onChange={event => onChange(withinRange(Number(event.target.value), min, max))}
            slotProps={{
                htmlInput: {
                    min,
                    max,
                    step,
                    "aria-label": showLabel ? undefined : `${label} value`
                },
                input: {
                    endAdornment: (
                        <Stack sx={{ mr: -1 }}>
                            <IconButton
                                size="small"
                                aria-label={`Increase ${label.toLowerCase()}`}
                                onClick={() => onChange(withinRange(value + step, min, max))}
                                sx={{ p: 0 }}
                            >
                                <KeyboardArrowUpIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                aria-label={`Decrease ${label.toLowerCase()}`}
                                onClick={() => onChange(withinRange(value - step, min, max))}
                                sx={{ p: 0 }}
                            >
                                <KeyboardArrowDownIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    )
                }
            }}
            sx={{ width, ...NO_NATIVE_SPINNERS }}
        />
    );
}
