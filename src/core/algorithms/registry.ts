import type { Hex, HexMap, SearchEvent } from "../models";
import { aStar } from "./a-star";
import { breadthFirst } from "./breadth-first";
import { depthFirst } from "./depth-first";
import { greedyBestFirst } from "./greedy-best-first";

export type SearchFn = (map: HexMap, start: Hex, end: Hex) => SearchEvent[];
export type AlgorithmName = "breadth-first" | "depth-first" | "greedy-best-first" | "a-star";

interface Algorithm {
    label: string;
    search: SearchFn;
}

export const ALGORITHMS: Record<AlgorithmName, Algorithm> = {
    "breadth-first": { label: "Breadth-First", search: breadthFirst },
    "depth-first": { label: "Depth-First", search: depthFirst },
    "greedy-best-first": { label: "Greedy Best-First", search: greedyBestFirst },
    "a-star": { label: "A*", search: aStar }
};

export const ALGORITHM_NAMES: AlgorithmName[] = ["breadth-first", "depth-first", "greedy-best-first", "a-star"];