import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

describe("public types", () => {
  it("do not use the TypeScript 5.4+ NoInfer utility", () => {
    const src = readFileSync(resolve(__dirname, "calendar.ts"), "utf8");
    expect(src).not.toMatch(/\bNoInfer</);
  });
});
