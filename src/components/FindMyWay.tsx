import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RefreshIcon from "@mui/icons-material/Refresh";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import { Box, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, Slider, Stack, Switch, ToggleButton, ToggleButtonGroup, Tooltip, Typography, type SelectChangeEvent } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, MouseEvent, PointerEvent } from "react";
import type { Hex, HexMap, HexPair, Search } from "../core/models";
import { CONTROLS_WIDTH, DEFAULT_CELL_COUNT, DEFAULT_COMPLEXITY_SLIDER, DEFAULT_SPEED_SLIDER, DEFAULT_STEP_SIZE, MAX_CELL_COUNT, MAX_STEP_SIZE, MAX_WEIGHT, MIN_CELL_COUNT, MIN_STEP_SIZE, MIN_WEIGHT, MODE_GROUP_WIDTH, SLIDER_MAX, SLIDER_MIN, TRANSPORT_BUTTONS_WIDTH } from "../core/constants";
import { furthestApart } from "../core/furthest";
import { generateMap, optionsFor } from "../core/generation";
import { cellAt, indexOf, sameHex, withWalls, withWeights } from "../core/grid";
import { createRandom } from "../core/random";
import { complexityFrom, speedFrom } from "../core/scales";
import { lastIndex } from "../hooks/playback";
import { useElementSize } from "../hooks/useElementSize";
import { usePersistedNumber } from "../hooks/usePersistedNumber";
import { usePlayback } from "../hooks/usePlayback";
import { drawMap, prepareCanvas } from "../render/draw";
import { layoutFor, pixelToHex, roundHex } from "../render/geometry";
import { hexesToDraw } from "../render/layout";
import { rolesAt } from "../render/roles";
import { ControlSlider } from "./ControlSlider";
import { NumberField } from "./NumberField";
import { WeightBrush } from "./WeightBrush";
import { ALGORITHM_NAMES, ALGORITHMS, type AlgorithmName, type SearchFn } from "../core/algorithms/registry";
import { usePersistedFlag } from "../hooks/usePersistedFlag";
import { usePersistedChoice } from "../hooks/usePersistedChoice";
import { CELL_COUNT_KEY, COMPLEXITY_KEY, ALGORITHM_KEY, BRUSH_KEY, MODE_KEY, SPEED_KEY, STEP_SIZE_KEY, TERRAIN_KEY } from "../core/storage";

type EditMode = "wall" | "start" | "end" | "weight";
type WallStroke = "add" | "remove";
type Stroke = { kind: "wall"; stroke: WallStroke; } | { kind: "weight"; weight: number; };

const ORIGIN: Hex = { q: 0, r: 0 };
const EDIT_MODES: EditMode[] = ["wall", "weight", "start", "end"];
const PLAIN_MODES: EditMode[] = ["wall", "start", "end"];

export function FindMyWay() {
    const theme = useTheme();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | undefined>(undefined);
    const mapAreaRef = useRef<HTMLDivElement>(null);
    const strokeRef = useRef<Stroke | undefined>(undefined);
    const available = useElementSize(mapAreaRef);
    const [seed] = useState(() => Date.now());
    const [cellCount, setCellCount] = usePersistedNumber(CELL_COUNT_KEY, DEFAULT_CELL_COUNT, MIN_CELL_COUNT, MAX_CELL_COUNT);
    const [complexitySlider, setComplexitySlider] = usePersistedNumber(COMPLEXITY_KEY, DEFAULT_COMPLEXITY_SLIDER, SLIDER_MIN, SLIDER_MAX);
    const [speedSlider, setSpeedSlider] = usePersistedNumber(SPEED_KEY, DEFAULT_SPEED_SLIDER, SLIDER_MIN, SLIDER_MAX);
    const [stepSize, setStepSize] = usePersistedNumber(STEP_SIZE_KEY, DEFAULT_STEP_SIZE, MIN_STEP_SIZE, MAX_STEP_SIZE);
    const [walls, setWalls] = useState<ReadonlySet<number>>(new Set());
    const [chosen, setChosen] = useState<Partial<HexPair>>({});
    const [terrain, setTerrain] = usePersistedFlag(TERRAIN_KEY, false);
    const [mode, setMode] = usePersistedChoice<EditMode>(MODE_KEY, "wall", terrain ? EDIT_MODES : PLAIN_MODES);
    const [algorithm, setAlgorithm] = usePersistedChoice<AlgorithmName>(ALGORITHM_KEY, "breadth-first", ALGORITHM_NAMES);
    const [paintedWeights, setPaintedWeights] = useState<ReadonlyMap<number, number>>(new Map());
    const [brush, setBrush] = usePersistedNumber(BRUSH_KEY, MAX_WEIGHT, MIN_WEIGHT, MAX_WEIGHT);

    const baseMap = useMemo(
        () => generateMap(optionsFor(cellCount, complexityFrom(complexitySlider)), createRandom(seed)),
        [cellCount, complexitySlider, seed]
    );
    const map = useMemo(
        () => withWeights(withWalls(baseMap, walls), paintedWeights, terrain),
        [baseMap, walls, paintedWeights, terrain]
    );

    const defaults = useMemo(() => furthestApart(baseMap), [baseMap]);
    const endpoints = useMemo<HexPair>(() => ({
        start: chosen.start ?? defaults?.start ?? ORIGIN,
        end: chosen.end ?? defaults?.end ?? ORIGIN
    }), [chosen, defaults]);
    const search = useMemo(() => searchOn(map, endpoints, ALGORITHMS[algorithm].search), [map, endpoints, algorithm]);
    const view = useMemo(() => layoutFor(baseMap, available), [baseMap, available]);
    const speed = useMemo(() => speedFrom(speedSlider), [speedSlider]);
    const playback = usePlayback(search.events.length, speed);
    const roles = useMemo(() => rolesAt(map, search, playback.index), [map, search, playback.index]);
    const hexes = useMemo(
        () => hexesToDraw(map, roles, view, theme.palette.mode),
        [map, roles, theme.palette.mode, view]
    );

    const restart = useCallback(() => {
        setWalls(new Set());
        setPaintedWeights(new Map());
        setChosen({});
        playback.reset();
    }, [playback]);

    const changeCellCount = useCallback((value: number) => {
        setCellCount(value);
        restart();
    }, [setCellCount, restart]);

    const changeComplexity = useCallback((value: number) => {
        setComplexitySlider(value);
        restart();
    }, [setComplexitySlider, restart]);

    const changeMode = useCallback((_event: MouseEvent<HTMLElement>, next: EditMode | null) => {
        if (next) setMode(next);
    }, [setMode]);

    const changeTerrain = useCallback((_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setTerrain(checked);
        if (!checked) setMode("wall");
        playback.reset();
    }, [setTerrain, setMode, playback]);

    const paintWeight = useCallback((hex: Hex, weight: number) => {
        setPaintedWeights(current => weighted(current, indexOf(baseMap, hex), weight));
    }, [baseMap]);

    const changeAlgorithm = useCallback((event: SelectChangeEvent<AlgorithmName>) => {
        setAlgorithm(event.target.value);
        playback.reset();
    }, [setAlgorithm, playback]);

    const hexUnder = useCallback((event: PointerEvent<HTMLCanvasElement>): Hex => {
        const bounds = event.currentTarget.getBoundingClientRect();

        return roundHex(pixelToHex({ x: event.clientX - bounds.left, y: event.clientY - bounds.top }, view));
    }, [view]);

    const paint = useCallback((hex: Hex, stroke: WallStroke) => {
        setWalls(current => painted(current, indexOf(baseMap, hex), stroke));
    }, [baseMap]);

    const editable = useCallback((hex: Hex) => {
        return cellAt(baseMap, hex) !== "absent"
            && !sameHex(hex, endpoints.start)
            && !sameHex(hex, endpoints.end);
    }, [baseMap, endpoints]);

    const beginStroke = useCallback((event: PointerEvent<HTMLCanvasElement>) => {
        const hex = hexUnder(event);

        if (mode === "start" || mode === "end") {
            if (cellAt(map, hex) !== "open") return;
            if (sameHex(hex, mode === "start" ? endpoints.end : endpoints.start)) return;

            setChosen(current => mode === "start" ? { ...current, start: hex } : { ...current, end: hex });
            playback.reset();
            return;
        }

        if (!editable(hex)) return;

        if (mode === "weight") {
            if (cellAt(map, hex) !== "open") return;

            strokeRef.current = { kind: "weight", weight: brush };
            event.currentTarget.setPointerCapture(event.pointerId);
            paintWeight(hex, brush);
            return;
        }

        const stroke: WallStroke = cellAt(map, hex) === "wall" ? "remove" : "add";
        strokeRef.current = { kind: "wall", stroke };
        event.currentTarget.setPointerCapture(event.pointerId);
        paint(hex, stroke);
    }, [hexUnder, mode, map, endpoints, editable, paint, paintWeight, brush, playback]);

    const continueStroke = useCallback((event: PointerEvent<HTMLCanvasElement>) => {
        const stroke = strokeRef.current;
        if (!stroke) return;

        const hex = hexUnder(event);
        if (!editable(hex)) return;

        if (stroke.kind === "weight") {
            if (cellAt(map, hex) === "open") paintWeight(hex, stroke.weight);
            return;
        }

        paint(hex, stroke.stroke);
    }, [hexUnder, editable, paint, paintWeight, map]);

    const endStroke = useCallback(() => {
        if (!strokeRef.current) return;

        strokeRef.current = undefined;
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
                <FormControl size="small" fullWidth>
                    <InputLabel id="algorithm-label">Algorithm</InputLabel>
                    <Select<AlgorithmName>
                        labelId="algorithm-label"
                        label="Algorithm"
                        value={algorithm}
                        onChange={changeAlgorithm}
                    >
                        {ALGORITHM_NAMES.map(name => (
                            <MenuItem key={name} value={name}>{ALGORITHMS[name].label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
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
                <FormControlLabel
                    control={<Switch checked={terrain} onChange={changeTerrain} />}
                    label="Weighted terrain"
                    labelPlacement="start"
                    sx={{ alignSelf: "center", mx: 0 }}
                />
                <ToggleButtonGroup
                    value={mode}
                    exclusive
                    size="small"
                    onChange={changeMode}
                    aria-label="What a click places"
                    fullWidth
                    sx={{ alignSelf: "center", width: MODE_GROUP_WIDTH }}
                >
                    <ToggleButton value="wall">Wall</ToggleButton>
                    {terrain && <ToggleButton value="weight">Weight</ToggleButton>}
                    <ToggleButton value="start">Start</ToggleButton>
                    <ToggleButton value="end">End</ToggleButton>
                </ToggleButtonGroup>
                {terrain && <WeightBrush value={brush} disabled={mode !== "weight"} onChange={setBrush} />}
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
                <Box
                    component="canvas"
                    ref={canvasRef}
                    onPointerDown={beginStroke}
                    onPointerMove={continueStroke}
                    onPointerUp={endStroke}
                    onPointerCancel={endStroke}
                    sx={{ display: "block", maxWidth: "100%", cursor: "pointer", touchAction: "none" }}
                />
            </Box>

            <Box
                sx={{
                    gridArea: "transport",
                    display: "grid",
                    gridTemplateColumns: {
                        xs: `${TRANSPORT_BUTTONS_WIDTH}px minmax(0, 1fr) auto`,
                        md: `${TRANSPORT_BUTTONS_WIDTH}px minmax(0, 1fr) auto auto`
                    },
                    gridTemplateAreas: {
                        xs: "\"buttons count refresh\" \"step step step\" \"scrub scrub scrub\"",
                        md: "\"buttons scrub count refresh\" \"step . . .\""
                    },
                    alignItems: "center",
                    gap: 1,
                    width: "100%",
                    maxWidth: "100%",
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
                    getAriaValueText={value => eventCounter(value, search.events.length)}
                    sx={{
                        gridArea: "scrub",
                        alignSelf: "center",
                        "& .MuiSlider-thumb, & .MuiSlider-track": {
                            transition: "none"
                        }
                    }}
                />

                <Typography
                    variant="body2"
                    sx={{
                        gridArea: "count",
                        ml: 2.5,
                        color: "text.secondary",
                        fontVariantNumeric: "tabular-nums",
                        whiteSpace: "nowrap"
                    }}
                >
                    {eventCounter(playback.index, search.events.length)}
                </Typography>

                <Tooltip title="Replay" placement="top">
                    <IconButton onClick={playback.reset} aria-label="Replay" sx={{ gridArea: "refresh", justifySelf: "end" }}>
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

function painted(walls: ReadonlySet<number>, index: number, stroke: WallStroke): ReadonlySet<number> {
    if (stroke === "add" ? walls.has(index) : !walls.has(index)) return walls;

    const next = new Set(walls);
    if (stroke === "add") next.add(index);
    else next.delete(index);

    return next;
}

function searchOn(map: HexMap, pair: HexPair, search: SearchFn): Search {
    return { events: search(map, pair.start, pair.end), start: pair.start, end: pair.end };
}

function eventCounter(index: number, eventCount: number): string {
    return `${eventCount === 0 ? 0 : Math.floor(index) + 1} / ${eventCount}`;
}

function weighted(painted: ReadonlyMap<number, number>, index: number, weight: number): ReadonlyMap<number, number> {
    if (painted.get(index) === weight) return painted;

    const next = new Map(painted);
    next.set(index, weight);

    return next;
}