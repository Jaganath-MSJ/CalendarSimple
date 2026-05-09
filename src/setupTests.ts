import "@testing-library/jest-dom";

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
