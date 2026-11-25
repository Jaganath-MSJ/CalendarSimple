import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import useShallowStable from "./useShallowStable";

describe("useShallowStable", () => {
  const run = (a: object, b: object) => {
    const { result, rerender } = renderHook(({ v }) => useShallowStable(v), {
      initialProps: { v: a },
    });
    const first = result.current;
    rerender({ v: b });
    return { first, second: result.current };
  };

  it("keeps the reference for a shallow-equal object", () => {
    const { first, second } = run({ a: 1 }, { a: 1 });
    expect(second).toBe(first);
  });

  it("returns the new reference when a value changes", () => {
    const next = { a: 2 };
    const { first, second } = run({ a: 1 }, next);
    expect(second).not.toBe(first);
    expect(second).toBe(next);
  });

  it("returns the new reference when a key is added or removed", () => {
    expect(run({ a: 1 }, { a: 1, b: 2 }).second).toEqual({ a: 1, b: 2 });
    const added = run({ a: 1 }, { a: 1, b: 2 });
    expect(added.second).not.toBe(added.first);
    const removed = run({ a: 1, b: 2 }, { a: 1 });
    expect(removed.second).not.toBe(removed.first);
  });
});
