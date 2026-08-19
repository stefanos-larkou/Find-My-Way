import { indexOf } from "../core/grid";
import type { HexMap, Search, CellRole, SearchEvent, Hex } from "../core/models";

export function rolesAt(map: HexMap, search: Search, index: number): CellRole[] {
    const roles: CellRole[] = map.cells.map(state => state);

    search.events.slice(0, Math.floor(index) + 1).forEach(event => applyEvent(map, roles, event));

    roles[indexOf(map, search.start)] = "start";
    roles[indexOf(map, search.end)] = "end";

    return roles;
}

function applyEvent(map: HexMap, roles: CellRole[], event: SearchEvent): void {
    if (event.type === "visit") {
        roles[indexOf(map, event.hex)] = "visited";
        return;
    }

    event.hexes.forEach(hex => markPath(map, roles, hex));
}

function markPath(map: HexMap, roles: CellRole[], hex: Hex): void {
    roles[indexOf(map, hex)] = "path";
}