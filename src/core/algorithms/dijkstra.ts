import type { Hex, HexMap, SearchEvent } from "../models";
import { bestFirstSearch } from "./best-first";

export function dijkstra(map: HexMap, start: Hex, end: Hex): SearchEvent[] {
    return bestFirstSearch(map, start, end, () => 0);
}
