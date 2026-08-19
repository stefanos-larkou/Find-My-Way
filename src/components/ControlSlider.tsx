import { Slider, Stack, Typography } from "@mui/material";
import { NumberField } from "./NumberField";

interface ControlSliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number | null;
    marks?: { value: number }[];
    onChange: (value: number) => void;
}

export function ControlSlider({ label, value, min, max, step, marks, onChange }: ControlSliderProps) {
    return (
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", width: "100%" }}>
            <Typography variant="body2" color="text.secondary" sx={{ width: 84 }}>
                {label}
            </Typography>
            <Slider
                value={value}
                min={min}
                max={max}
                step={step}
                marks={marks}
                valueLabelDisplay="auto"
                onChange={(_, next) => onChange(next)}
                aria-label={label}
                sx={{ flex: 1 }}
            />
            <NumberField label={label} value={value} min={min} max={max} step={step ?? 1} onChange={onChange} />
        </Stack>
    );
}
