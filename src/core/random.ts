const a = 1664525;
const c = 1013904223;
const m = 4294967296;

export function createRandom(seed: number): () => number {
    let state = seed;
    return () => {
        state = (state * a + c) % m;
        return state / m;
    };
}