import "@testing-library/jest-dom";

// JSDOM has no ResizeObserver. Install a no-op stub; tests that need measured
// sizes override `globalThis.ResizeObserver` per test and restore it afterwards.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// JSDOM does not implement matchMedia. Default mock returns matches:false (light mode);
// tests that need dark-mode behavior override `window.matchMedia` per-test.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
