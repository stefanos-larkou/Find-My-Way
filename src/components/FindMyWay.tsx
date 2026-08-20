import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import { Box, Button, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, Slider, Stack, Switch, ToggleButton, ToggleButtonGroup, Tooltip, Typography, type SelectChangeEvent } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, MouseEvent, PointerEvent } from "react";
import type { Hex, HexMap, HexPair, Search, WallStroke } from "../core/models";
import { outcomeOf, pathAt } from "../core/outcome";
import { CONTROLS_WIDTH, DEFAULT_CELL_COUNT, DEFAULT_COMPLEXITY_SLIDER, DEFAULT_SPEED_SLIDER, DEFAULT_STEP_SIZE, MAX_CELL_COUNT, MAX_STEP_SIZE, MAX_WEIGHT, MIN_CELL_COUNT, MIN_STEP_SIZE, MIN_WEIGHT, EMPTY_INDEX, MODE_GROUP_WIDTH, SLIDER_MAX, SLIDER_MIN, TRANSPORT_BUTTONS_WIDTH, WEIGHTS } from "../core/constants";
import { furthestApart } from "../core/furthest";
import { generateMap, optionsFor } from "../core/generation";
import { cellAt, endpointAt, indexOf, sameHex, withPlainGround, withWalls, withWeights } from "../core/grid";
import { createRandom } from "../core/random";
import { complexityFrom, speedFrom } from "../core/scales";
import { lastIndex } from "../hooks/playback";
import { useElementSize } from "../hooks/useElementSize";
import { usePersistedNumber } from "../hooks/usePersistedNumber";
import { usePlayback } from "../hooks/usePlayback";
import { drawMap, drawRoute, prepareCanvas } from "../render/draw";
import { layoutFor, pixelToHex, roundHex } from "../render/geometry";
import { hexesToDraw, routeToDraw, routeWidthFor } from "../render/layout";
import { paletteFor, veilFor } from "../render/palette";
import { rolesAt } from "../render/roles";
import { ControlSlider } from "./ControlSlider";
import { NumberField } from "./NumberField";
import { HexSwatch } from "./HexSwatch";
import { RouteSummary } from "./RouteSummary";
import { ALGORITHM_NAMES, ALGORITHMS, type AlgorithmName, type SearchFn } from "../core/algorithms/registry";
import { usePersistedFlag } from "../hooks/usePersistedFlag";
import { usePersistedChoice } from "../hooks/usePersistedChoice";
import { CELL_COUNT_KEY, COMPLEXITY_KEY, ALGORITHM_KEY, BRUSH_KEY, MODE_KEY, SPEED_KEY, STEP_SIZE_KEY, TERRAIN_KEY } from "../core/storage";
import { weighted, painted } from "../core/overlays";

type EditMode = "wall" | "start" | "end" | "weight";
type Stroke = { kind: "wall"; stroke: WallStroke; } | { kind: "weight"; weight: number; };

const LABELS = {
    algorithm: "Algorithm",
    speed: "Speed",
    size: "Size",
    complexity: "Complexity",
    terrain: "Weighted terrain",
    groundGroup: "What a click places",
    endpointGroup: "Where the route runs",
    wall: "Wall",
    weight: "Weight",
    start: "Start",
    end: "End",
    clearWalls: "Clear walls",
    clearTerrain: "Clear terrain",
    reset: "Reset",
    newMap: "New map",
    progress: "Search progress",
    replay: "Replay",
    play: "Play",
    pause: "Pause",
    stepSize: "Step size"
};

const HINTS = {
    wall: "Blocks the way",
    weight: "How costly this ground is to cross",
    start: "Where the route begins. It is always ordinary ground, so putting it on rough ground clears that hex",
    end: "Where the route has to reach. It is always ordinary ground, so putting it on rough ground clears that hex",
    clearWalls: "Clear all user-added walls",
    clearTerrain: "Clear all user-added terrain",
    counter: "Which step of you are looking at, and how many steps this search requires in total"
};

const PILL_ROW_WIDTH = "72%";

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
    const [seed, setSeed] = useState(() => Date.now());
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
    const [hovered, setHovered] = useState("");

    const baseMap = useMemo(
        () => generateMap(optionsFor(cellCount, complexityFrom(complexitySlider)), createRandom(seed)),
        [cellCount, complexitySlider, seed]
    );
    const defaults = useMemo(() => furthestApart(baseMap), [baseMap]);
    const endpoints = useMemo<HexPair>(() => ({
        start: chosen.start ?? defaults?.start ?? ORIGIN,
        end: chosen.end ?? defaults?.end ?? ORIGIN
    }), [chosen, defaults]);
    const map = useMemo(
        () => withPlainGround(withWeights(withWalls(baseMap, walls), paintedWeights, terrain), [endpoints.start, endpoints.end]),
        [baseMap, walls, paintedWeights, terrain, endpoints]
    );
    const search = useMemo(() => searchOn(map, endpoints, ALGORITHMS[algorithm].search), [map, endpoints, algorithm]);
    const view = useMemo(() => layoutFor(baseMap, available), [baseMap, available]);
    const speed = useMemo(() => speedFrom(speedSlider), [speedSlider]);
    const playback = usePlayback(search.events.length, speed);
    const roles = useMemo(() => rolesAt(map, search, playback.index), [map, search, playback.index]);
    const hexes = useMemo(
        () => hexesToDraw(map, roles, view, theme.palette.mode),
        [map, roles, theme.palette.mode, view]
    );
    const palette = useMemo(() => paletteFor(theme.palette.mode), [theme.palette.mode]);
    const revealed = useMemo(() => pathAt(search.events, playback.index), [search.events, playback.index]);
    const route = useMemo(() => routeToDraw(revealed, view, theme.palette.mode), [revealed, view, theme.palette.mode]);
    const outcome = useMemo(() => outcomeOf(map, search.events), [map, search.events]);
    const finished = playback.started && search.events.length > 0 && playback.index >= lastIndex(search.events.length);

    const restart = useCallback(() => {
        setWalls(new Set());
        setPaintedWeights(new Map());
        setChosen({});
        playback.reset();
    }, [playback]);

    const clearWalls = useCallback(() => {
        setWalls(new Set());
        playback.reset();
    }, [playback]);

    const clearTerrain = useCallback(() => {
        setPaintedWeights(new Map());
        playback.reset();
    }, [playback]);

    const regenerate = useCallback(() => {
        setSeed(Date.now());
        restart();
    }, [restart]);

    const changeCellCount = useCallback((value: number) => {
        setCellCount(value);
        restart();
    }, [setCellCount, restart]);

    const changeComplexity = useCallback((value: number) => {
        setComplexitySlider(value);
        restart();
    }, [setComplexitySlider, restart]);

    const changeEndpoint = useCallback((_event: MouseEvent<HTMLElement>, next: EditMode | null) => {
        if (next) setMode(next);
    }, [setMode]);

    const changeGround = useCallback((_event: MouseEvent<HTMLElement>, next: EditMode | number | null) => {
        if (next === null) return;

        if (typeof next === "number") {
            setBrush(next);
            setMode("weight");
            return;
        }

        setMode(next);
    }, [setBrush, setMode]);

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

    const trackPointer = useCallback((event: PointerEvent<HTMLCanvasElement>) => {
        const endpoint = endpointAt(hexUnder(event), endpoints);
        const label = endpoint ? LABELS[endpoint] : "";
        setHovered(current => current === label ? current : label);
        continueStroke(event);
    }, [hexUnder, endpoints, continueStroke]);

    const leaveCanvas = useCallback(() => setHovered(""), []);

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
        drawRoute(context, route, routeWidthFor(view.hexSize));
    }, [hexes, route, view]);

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
                <FormControl fullWidth>
                    <InputLabel id="algorithm-label">{LABELS.algorithm}</InputLabel>
                    <Select<AlgorithmName>
                        labelId="algorithm-label"
                        label={LABELS.algorithm}
                        value={algorithm}
                        onChange={changeAlgorithm}
                    >
                        {ALGORITHM_NAMES.map(name => (
                            <MenuItem key={name} value={name}>{ALGORITHMS[name].label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <ControlSlider
                    label={LABELS.speed}
                    value={speedSlider}
                    min={SLIDER_MIN}
                    max={SLIDER_MAX}
                    onChange={setSpeedSlider}
                />
                <ControlSlider
                    label={LABELS.size}
                    value={cellCount}
                    min={MIN_CELL_COUNT}
                    max={MAX_CELL_COUNT}
                    onChange={changeCellCount}
                />
                <ControlSlider
                    label={LABELS.complexity}
                    value={complexitySlider}
                    min={SLIDER_MIN}
                    max={SLIDER_MAX}
                    onChange={changeComplexity}
                />
                <FormControlLabel
                    control={<Switch checked={terrain} onChange={changeTerrain} />}
                    label={LABELS.terrain}
                    labelPlacement="start"
                    sx={{ alignSelf: "center", mx: 0 }}
                />
                <Stack spacing={0} sx={{ alignSelf: "center", width: MODE_GROUP_WIDTH }}>
                    <ToggleButtonGroup
                        value={mode === "start" || mode === "end" ? mode : null}
                        exclusive
                        size="medium"
                        onChange={changeEndpoint}
                        aria-label={LABELS.endpointGroup}
                        fullWidth
                        sx={{
                            alignSelf: "center",
                            width: PILL_ROW_WIDTH,
                            "& .MuiToggleButton-root": {
                                borderBottomLeftRadius: 0,
                                borderBottomRightRadius: 0,
                                borderBottom: "none"
                            }
                        }}
                    >
                        <Tooltip describeChild title={HINTS.start}>
                            <ToggleButton value="start">
                                <HexSwatch fill={palette.start.fill} />{LABELS.start}
                            </ToggleButton>
                        </Tooltip>
                        <Tooltip describeChild title={HINTS.end}>
                            <ToggleButton value="end">
                                <HexSwatch fill={palette.end.fill} />{LABELS.end}
                            </ToggleButton>
                        </Tooltip>
                    </ToggleButtonGroup>

                    <ToggleButtonGroup
                        value={mode === "wall" ? "wall" : mode === "weight" ? brush : null}
                        exclusive
                        size="medium"
                        onChange={changeGround}
                        aria-label={LABELS.groundGroup}
                        fullWidth
                        sx={{ width: "100%", mt: "-1px" }}
                    >
                        <Tooltip describeChild title={HINTS.wall}>
                            <ToggleButton value="wall">
                                <HexSwatch fill={palette.wall.fill} />{LABELS.wall}
                            </ToggleButton>
                        </Tooltip>
                        {WEIGHTS.map(weight => (
                            <Tooltip key={weight} describeChild title={HINTS.weight}>
                                <ToggleButton value={weight} disabled={!terrain} aria-label={weightLabel(weight)}>
                                    <HexSwatch fill={palette.open.fill} veil={veilFor(theme.palette.mode, weight)} />{weight}
                                </ToggleButton>
                            </Tooltip>
                        ))}
                    </ToggleButtonGroup>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignSelf: "center", width: MODE_GROUP_WIDTH }}>
                    <Tooltip describeChild title={HINTS.clearWalls}>
                        <Box component="span" sx={{ width: "100%" }}>
                            <Button fullWidth onClick={clearWalls} disabled={mode !== "wall"}>{LABELS.clearWalls}</Button>
                        </Box>
                    </Tooltip>
                    <Tooltip describeChild title={HINTS.clearTerrain}>
                        <Box component="span" sx={{ width: "100%" }}>
                            <Button fullWidth onClick={clearTerrain} disabled={mode !== "weight"}>{LABELS.clearTerrain}</Button>
                        </Box>
                    </Tooltip>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignSelf: "center", width: MODE_GROUP_WIDTH }}>
                    <Button fullWidth onClick={restart}>{LABELS.reset}</Button>
                    <Button fullWidth onClick={regenerate}>{LABELS.newMap}</Button>
                </Stack>
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
                <Tooltip title={hovered} open={hovered !== ""} followCursor placement="top">
                    <Box
                        component="canvas"
                        ref={canvasRef}
                        onPointerDown={beginStroke}
                        onPointerMove={trackPointer}
                        onPointerUp={endStroke}
                        onPointerCancel={endStroke}
                        onPointerLeave={leaveCanvas}
                        sx={{ display: "block", maxWidth: "100%", cursor: "pointer", touchAction: "none" }}
                    />
                </Tooltip>
            </Box>

            <Box
                sx={{
                    gridArea: "transport",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    width: "100%",
                    minWidth: 0
                }}
            >
                <Box sx={{ width: "100%", px: 1.5, boxSizing: "border-box" }}>
                    <Slider
                        value={playback.index}
                        min={EMPTY_INDEX}
                        max={lastIndex(search.events.length)}
                        step={0.01}
                        onChange={(_, value) => playback.scrubTo(value)}
                        aria-label={LABELS.progress}
                        getAriaValueText={value => eventCounter(value, search.events.length)}
                        sx={{
                            "& .MuiSlider-thumb, & .MuiSlider-track": {
                                transition: "none"
                            }
                        }}
                    />
                </Box>

                <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
                    <Tooltip title={stepLabel(-stepSize)} placement="top">
                        <IconButton onClick={() => playback.step(-stepSize)} aria-label={stepLabel(-stepSize)}>
                            <SkipPreviousIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={playback.playing ? LABELS.pause : LABELS.play} placement="top">
                        <IconButton onClick={playback.toggle} aria-label={playback.playing ? LABELS.pause : LABELS.play}>
                            {playback.playing ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={stepLabel(stepSize)} placement="top">
                        <IconButton onClick={() => playback.step(stepSize)} aria-label={stepLabel(stepSize)}>
                            <SkipNextIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={LABELS.replay} placement="top">
                        <IconButton onClick={playback.reset} aria-label={LABELS.replay}>
                            <ReplayIcon />
                        </IconButton>
                    </Tooltip>

                    <NumberField
                        label={LABELS.stepSize}
                        showLabel
                        value={stepSize}
                        min={MIN_STEP_SIZE}
                        max={MAX_STEP_SIZE}
                        width={TRANSPORT_BUTTONS_WIDTH}
                        onChange={setStepSize}
                    />
                </Stack>

                <Box sx={{ minHeight: "2.25em", display: "flex", alignItems: "center" }}>
                    {finished ? (
                        <RouteSummary outcome={outcome} terrain={terrain} />
                    ) : (
                        <Tooltip describeChild title={HINTS.counter} placement="top">
                            <Typography
                                variant="body1"
                                sx={{
                                    color: "text.secondary",
                                    fontVariantNumeric: "tabular-nums",
                                    whiteSpace: "nowrap",
                                    cursor: "help"
                                }}
                            >
                                {eventCounter(playback.index, search.events.length)}
                            </Typography>
                        </Tooltip>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

function weightLabel(weight: number): string {
    return `Weight ${weight}`;
}

function stepLabel(steps: number): string {
    const size = Math.abs(steps);
    return `Step ${steps < 0 ? "back" : "forward"} ${size} event${size === 1 ? "" : "s"}`;
}

function searchOn(map: HexMap, pair: HexPair, search: SearchFn): Search {
    return { events: search(map, pair.start, pair.end), start: pair.start, end: pair.end };
}

function eventCounter(index: number, eventCount: number): string {
    return `${eventCount === 0 ? 0 : Math.floor(index) + 1} / ${eventCount}`;
}