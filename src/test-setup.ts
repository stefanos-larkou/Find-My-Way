import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

export const observers: ResizeObserverStub[] = [];

class ResizeObserverStub {
    readonly callback: ResizeObserverCallback;
    observed: Element[] = [];
    disconnected = false;

    constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
        observers.push(this);
    }

    observe(element: Element) {
        this.observed.push(element);
    }

    unobserve() { }

    disconnect() {
        this.disconnected = true;
    }

    send(size: { width: number; height: number }) {
        this.callback([{ contentRect: size } as ResizeObserverEntry], this);
    }
}

globalThis.ResizeObserver = ResizeObserverStub;

HTMLCanvasElement.prototype.getContext = () => null;

afterEach(() => {
    cleanup();
    localStorage.clear();
    observers.length = 0;
});
