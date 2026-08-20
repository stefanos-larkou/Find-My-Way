import { Box } from "@mui/material";
import type { Nullable } from "../core/models";

const HEX_CLIP = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

interface HexSwatchProps {
    fill: string;
    veil?: Nullable<string>;
}

export function HexSwatch({ fill, veil }: HexSwatchProps) {
    return (
        <Box
            sx={{
                width: 16,
                height: 18,
                mr: 1,
                flexShrink: 0,
                clipPath: HEX_CLIP,
                backgroundColor: fill,
                backgroundImage: veil ? `linear-gradient(${veil}, ${veil})` : "none"
            }}
        />
    );
}
