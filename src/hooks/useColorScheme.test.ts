import { describe, it, expect, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useColorScheme from "./useColorScheme";

type Listener = (e: { matches: boolean }) => void;

function mockMatchMedia(initialMatches: boolean) {
  const listeners = new Set<Listener>();
  const mq = {
    matches: initialMatches,
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: (event: string, l: Listener) => {
      if (event === "change") listeners.add(l);
    },
    removeEventListener: (event: string, l: Listener) => {
      if (event === "change") listeners.delete(l);
    },
    dispatchEvent: () => false,
  };
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: () => mq,
  });
  return {
    set: (matches: boolean) => {
      mq.matches = matches;
      listeners.forEach((l) => l({ matches }));
    },
  };
}

describe("useColorScheme", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 'light' when prop is 'light'", () => {
    const { result } = renderHook(() => useColorScheme("light"));
    expect(result.current).toBe("light");
  });

  it("returns 'dark' when prop is 'dark'", () => {
    const { result } = renderHook(() => useColorScheme("dark"));
    expect(result.current).toBe("dark");
  });

  it("returns 'light' when prop is 'auto' and OS prefers light", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useColorScheme("auto"));
    expect(result.current).toBe("light");
  });

  it("returns 'dark' when prop is 'auto' and OS prefers dark", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useColorScheme("auto"));
    expect(result.current).toBe("dark");
  });

  it("treats undefined prop as 'auto'", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useColorScheme(undefined));
    expect(result.current).toBe("dark");
  });

  it("updates live when OS preference changes (auto mode)", () => {
    const mq = mockMatchMedia(false);
    const { result } = renderHook(() => useColorScheme("auto"));
    expect(result.current).toBe("light");
    act(() => mq.set(true));
    expect(result.current).toBe("dark");
    act(() => mq.set(false));
    expect(result.current).toBe("light");
  });

  it("does NOT update on OS preference change when prop is explicit 'light'", () => {
    const mq = mockMatchMedia(false);
    const { result } = renderHook(() => useColorScheme("light"));
    act(() => mq.set(true));
    expect(result.current).toBe("light");
  });

  it("does NOT update on OS preference change when prop is explicit 'dark'", () => {
    const mq = mockMatchMedia(true);
    const { result } = renderHook(() => useColorScheme("dark"));
    act(() => mq.set(false));
    expect(result.current).toBe("dark");
  });
});
