import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import useResizeObserver from "./useResizeObserver";
import { RefObject } from "react";

describe("useResizeObserver Hook", () => {
  let observeSpy: ReturnType<typeof vi.fn>;
  let disconnectSpy: ReturnType<typeof vi.fn>;
  let callbackRef: ResizeObserverCallback;

  beforeEach(() => {
    observeSpy = vi.fn();
    disconnectSpy = vi.fn();

    globalThis.ResizeObserver = class ResizeObserverMock {
      observe = observeSpy;
      unobserve = vi.fn();
      disconnect = disconnectSpy;
      constructor(callback: ResizeObserverCallback) {
        callbackRef = callback;
      }
    } as never;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should not observe if notNeeded is true", () => {
    const mockRef = {
      current: document.createElement("div"),
    } as RefObject<HTMLElement>;
    const { result } = renderHook(() => useResizeObserver(mockRef, true));

    expect(observeSpy).not.toHaveBeenCalled();
    expect(result.current).toEqual({ width: 0, height: 0 });
  });

  it("should not observe if ref.current is null", () => {
    const mockRef = { current: null } as RefObject<HTMLElement | null>;
    const { result } = renderHook(() => useResizeObserver(mockRef));

    expect(observeSpy).not.toHaveBeenCalled();
    expect(result.current).toEqual({ width: 0, height: 0 });
  });

  it("should observe and update size", () => {
    const element = document.createElement("div");
    const mockRef = { current: element } as RefObject<HTMLElement>;
    const { result } = renderHook(() => useResizeObserver(mockRef));

    expect(observeSpy).toHaveBeenCalledWith(element);

    act(() => {
      if (callbackRef) {
        const entries = [
          {
            contentRect: { width: 500, height: 300 },
          },
        ] as never;
        callbackRef(entries, {} as never);
      }
    });
    expect(result.current).toEqual({ width: 500, height: 300 });
  });
});
