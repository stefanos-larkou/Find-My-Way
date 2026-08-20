import { hexDistance } from "../grid";
import type { Hex, HexMap, SearchEvent } from "../models";
import { bestFirstSearch } from "./best-first";

export function aStar(map: HexMap, start: Hex, end: Hex): SearchEvent[] {
    return bestFirstSearch(map, start, end, hex => hexDistance(hex, end));
}