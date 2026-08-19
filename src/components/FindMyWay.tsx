import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RefreshIcon from "@mui/icons-material/Refresh";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import { Box, IconButton, Slider, Stack, Tooltip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HexMap, Search } from "../core/models";
import { CONTROLS_WIDTH, DEFAULT_CELL_COUNT, DEFAULT_COMPLEXITY_SLIDER, DEFAULT_SPEED_SLIDER, DEFAULT_STEP_SIZE, MAX_CELL_COUNT, MAX_STEP_SIZE, MIN_CELL_COUNT, MIN_STEP_SIZE, SLIDER_MAX, SLIDER_MIN, TRANSPORT_BUTTONS_WIDTH } from "../core/constants";
import { breadthFirst } from "../core/algorithms/breadth-first";
import { furthestApart } from "../core/furthest";
import { generateMap, optionsFor } from "../core/generation";
import { createRandom } from "../core/random";
import { complexityFrom, speedFrom } from "../core/scales";
import { lastIndex } from "../hooks/playback";
import { usePlayback } from "../hooks/usePlayback";
import { drawMap, prepareCanvas } from "../render/draw";
import { layoutFor } from "../render/geometry";
import { hexesToDraw } from "../render/layout";
import { paletteFor } from "../render/palette";
import { rolesAt } from "../render/roles";
import { ControlSlider } from "./ControlSlider";
import { NumberField } from "./NumberField";
import { useElementSize } from "../hooks/useElementSize";

export function FindMyWay() {
    const theme = useTheme();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | undefined>(undefined);
    const mapAreaRef = useRef<HTMLDivElement>(null);
    const available = useElementSize(mapAreaRef);
    const [seed, setSeed] = useState(() => Date.now());
    const [cellCount, setCellCount] = useState(DEFAULT_CELL_COUNT);
    const [complexitySlider, setComplexitySlider] = useState(DEFAULT_COMPLEXITY_SLIDER);
    const [speedSlider, setSpeedSlider] = useState(DEFAULT_SPEED_SLIDER);
    const [stepSize, setStepSize] = useState(DEFAULT_STEP_SIZE);

    const map = useMemo(
        () => generateMap(optionsFor(cellCount, complexityFrom(complexitySlider)), createRandom(seed)),
        [cellCount, complexitySlider, seed]
    );
    const search = useMemo(() => searchOn(map), [map]);
    const view = useMemo(() => layoutFor(map, available), [map, available]);
    const speed = useMemo(() => speedFrom(speedSlider), [speedSlider]);
    const playback = usePlayback(search.events.length, speed);
    const roles = useMemo(() => rolesAt(map, search, playback.index), [map, search, playback.index]);
    const hexes = useMemo(
        () => hexesToDraw(map, roles, paletteFor(theme.palette.mode), view),
        [map, roles, theme.palette.mode, view]
    );

    const regenerate = useCallback(() => {
        setSeed(Date.now());
        playback.reset();
    }, [playback]);

    const changeCellCount = useCallback((value: number) => {
        setCellCount(value);
        playback.reset();
    }, [playback]);

    const changeComplexity = useCallback((value: number) => {
        setComplexitySlider(value);
        playback.reset();
    }, [playback]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        contextRef.current = prepareCanvas(canvas, view.canvas);
    }, [view]);

    useEffect(() => {
        const context = contextRef.current;
        if (!context) return;
        drawMap(context, hexes);
    }, [hexes]);

    return (
        <Box
            sx={{
                display: "grid",
                gap: 2,
                p: 2,
                flex: 1,
                width: "100%",
                boxSizing: "border-box",
                gridTemplateColumns: { xs: "minmax(0, 1fr)", md: `${CONTROLS_WIDTH}px minmax(0, 1fr)` },
                gridTemplateRows: { xs: "auto auto auto", md: "minmax(0, 1fr) auto" },
                gridTemplateAreas: {
                    xs: "\"params\" \"map\" \"transport\"",
                    md: "\"params map\" \"params transport\""
                }
            }}
        >
            <Stack spacing={2} sx={{ gridArea: "params", width: "100%", alignSelf: "center" }}>
                <ControlSlider
                    label="Speed"
                    value={speedSlider}
                    min={SLIDER_MIN}
                    max={SLIDER_MAX}
                    onChange={setSpeedSlider}
                />
                <ControlSlider
                    label="Size"
                    value={cellCount}
                    min={MIN_CELL_COUNT}
                    max={MAX_CELL_COUNT}
                    onChange={changeCellCount}
                />
                <ControlSlider
                    label="Complexity"
                    value={complexitySlider}
                    min={SLIDER_MIN}
                    max={SLIDER_MAX}
                    onChange={changeComplexity}
                />
            </Stack>

            <Box
                ref={mapAreaRef}
                sx={{
                    gridArea: "map",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: { xs: "50vh", md: 0 },
                    minWidth: 0,
                    overflow: "hidden"
                }}
            >
                <Box component="canvas" ref={canvasRef} sx={{ display: "block", maxWidth: "100%" }} />
            </Box>

            <Box
                sx={{
                    gridArea: "transport",
                    display: "grid",
                    gridTemplateColumns: {
                        xs: `${TRANSPORT_BUTTONS_WIDTH}px minmax(0, 1fr)`,
                        md: `${TRANSPORT_BUTTONS_WIDTH}px minmax(0, 1fr) auto`
                    },
                    gridTemplateAreas: {
                        xs: "\"buttons refresh\" \"step step\" \"scrub scrub\"",
                        md: "\"buttons scrub refresh\" \"step scrub refresh\""
                    },
                    alignItems: "center",
                    gap: 1,
                    width: "100%",
                    maxWidth: view.canvas.x > 0 ? Math.max(view.canvas.x, 320) : "100%",
                    mx: "auto"
                }}
            >
                <Stack direction="row" spacing={1} sx={{ gridArea: "buttons" }}>
                    <Tooltip title={stepLabel(-stepSize)} placement="top">
                        <IconButton onClick={() => playback.step(-stepSize)} aria-label={stepLabel(-stepSize)}>
                            <SkipPreviousIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={playback.playing ? "Pause" : "Play"} placement="top">
                        <IconButton onClick={playback.toggle} aria-label={playback.playing ? "Pause" : "Play"}>
                            {playback.playing ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={stepLabel(stepSize)} placement="top">
                        <IconButton onClick={() => playback.step(stepSize)} aria-label={stepLabel(stepSize)}>
                            <SkipNextIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>

                <Slider
                    value={playback.index}
                    min={0}
                    max={lastIndex(search.events.length)}
                    step={0.01}
                    onChange={(_, value) => playback.scrubTo(value)}
                    aria-label="Search progress"
                    sx={{
                        gridArea: "scrub",
                        alignSelf: "center",
                        "& .MuiSlider-thumb, & .MuiSlider-track": {
                            transition: "none"
                        }
                    }}
                />

                <Tooltip title="New map" placement="top">
                    <IconButton onClick={regenerate} aria-label="New map" sx={{ gridArea: "refresh", justifySelf: "end" }}>
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>

                <Box sx={{ gridArea: "step" }}>
                    <NumberField
                        label="Step size"
                        showLabel
                        value={stepSize}
                        min={MIN_STEP_SIZE}
                        max={MAX_STEP_SIZE}
                        width="100%"
                        onChange={setStepSize}
                    />
                </Box>
            </Box>
        </Box>
    );
}

function stepLabel(steps: number): string {
    const size = Math.abs(steps);
    return `Step ${steps < 0 ? "back" : "forward"} ${size} event${size === 1 ? "" : "s"}`;
}

function searchOn(map: HexMap): Search {
    const pair = furthestApart(map);
    if (!pair) return { events: [], start: { q: 0, r: 0 }, end: { q: 0, r: 0 } };
    return { events: breadthFirst(map, pair.start, pair.end), start: pair.start, end: pair.end };
}
