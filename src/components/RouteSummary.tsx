import RouteIcon from "@mui/icons-material/Route";
import TerrainIcon from "@mui/icons-material/Terrain";
import { Stack, Tooltip, Typography } from "@mui/material";
import type { ReactNode } from "react";
import type { Outcome } from "../core/models";

const LABELS = {
    noRoute: "No route",
    steps: "steps",
    cost: "cost"
};

const HINTS = {
    steps: "Distance",
    cost: "Cost"
};

const TOOLTIP_SLOTS = { tooltip: { sx: { fontSize: "0.95rem" } } };

interface Figure {
    name: string;
    icon: ReactNode;
    hint: string;
    value: number;
}

interface RouteSummaryProps {
    outcome: Outcome;
    terrain: boolean;
}

export function RouteSummary({ outcome, terrain }: RouteSummaryProps) {
    if (!outcome.found) {
        return <Typography variant="h6" sx={{ fontWeight: 600, color: "error.main" }}>{LABELS.noRoute}</Typography>;
    }

    return (
        <Stack direction="row" spacing={3} sx={{ alignItems: "center", color: "success.main" }}>
            {figuresOf(outcome, terrain).map(figure => (
                <Tooltip key={figure.name} describeChild title={figure.hint} slotProps={TOOLTIP_SLOTS}>
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", cursor: "help" }}>
                        {figure.icon}
                        <Typography
                            variant="h6"
                            aria-label={`${figure.value} ${figure.name}`}
                            sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
                        >
                            {figure.value}
                        </Typography>
                    </Stack>
                </Tooltip>
            ))}
        </Stack>
    );
}

function figuresOf(outcome: Outcome, terrain: boolean): Figure[] {
    const steps: Figure = { name: LABELS.steps, icon: <RouteIcon />, hint: HINTS.steps, value: outcome.steps };
    if (!terrain) return [steps];
    return [steps, { name: LABELS.cost, icon: <TerrainIcon />, hint: HINTS.cost, value: outcome.cost }];
}
