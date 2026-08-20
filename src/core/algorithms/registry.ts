import type { Hex, HexMap, SearchEvent } from "../models";
import { breadthFirst } from "./breadth-first";
import { depthFirst } from "./depth-first";

export type SearchFn = (map: HexMap, start: Hex, end: Hex) => SearchEvent[];
export type AlgorithmName = "breadth-first" | "depth-first";

interface Algorithm {
    label: string;
    search: SearchFn;
}

export const ALGORITHMS: Record<AlgorithmName, Algorithm> = {
    "breadth-first": { label: "Breadth-first", search: breadthFirst },
    "depth-first": { label: "Depth-first", search: depthFirst }
};

export const ALGORITHM_NAMES: AlgorithmName[] = ["breadth-first", "depth-first"];