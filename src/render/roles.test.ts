import { describe, it, expect } from "vitest";
import { breadthFirst } from "../core/algorithms/breadth-first";
import { indexOf } from "../core/grid";
import type { Search } from "../core/models";
import { mapFrom } from "../core/test-maps";
import { rolesAt } from "./roles";

const START = { q: 0, r: 0 };
const END = { q: 2, r: 1 };

function searchOn(rows: string[]): Search {
    const map = mapFrom(rows);

    return { events: breadthFirst(map, START, END), start: START, end: END };
}

describe("rolesAt", () => {
    it("starts with the map's own states", () => {
        const map = mapFrom([
            "..#",
            "..."
        ]);
        const search: Search = { events: [], start: START, end: END };

        const roles = rolesAt(map, search, -1);

        expect(roles[indexOf(map, { q: 2, r: 0 })]).toBe("wall");
        expect(roles[indexOf(map, { q: 1, r: 0 })]).toBe("open");
    });

    it("marks only the events up to the index", () => {
        const rows = ["..#", "..."];
        const map = mapFrom(rows);
        const search = searchOn(rows);

        expect(rolesAt(map, search, 0)[indexOf(map, { q: 1, r: 0 })]).toBe("open");
        expect(rolesAt(map, search, 1)[indexOf(map, { q: 1, r: 0 })]).toBe("visited");
    });

    it("marks the path once its event is included", () => {
        const rows = ["..#", "..."];
        const map = mapFrom(rows);
        const search = searchOn(rows);

        const roles = rolesAt(map, search, search.events.length - 1);

        expect(roles[indexOf(map, { q: 1, r: 1 })]).toBe("path");
        expect(roles[indexOf(map, { q: 0, r: 1 })]).toBe("visited");
    });

    it("keeps the start and end distinguishable after the search has run", () => {
        const rows = ["..#", "..."];
        const map = mapFrom(rows);
        const search = searchOn(rows);

        const roles = rolesAt(map, search, search.events.length - 1);

        expect(roles[indexOf(map, START)]).toBe("start");
        expect(roles[indexOf(map, END)]).toBe("end");
    });
});