import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

class ResizeObserverStub {
    observe() { }
    unobserve() { }
    disconnect() { }
}

globalThis.ResizeObserver = ResizeObserverStub;

HTMLCanvasElement.prototype.getContext = () => null;

afterEach(() => {
    cleanup();
    localStorage.clear();
});
