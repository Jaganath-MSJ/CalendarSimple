/// <reference types="node" />
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LAYOUT_CONSTANTS } from "../constants";
import { getContrastColor } from "../utils/contrast";

const css = readFileSync(
  resolve(process.cwd(), "src/styles/variables.css"),
  "utf8",
);

const block = (selector: string): string => {
  const start = css.indexOf(`${selector} {`);
  return css.slice(start, css.indexOf("}", start));
};
const token = (scope: string, name: string): string | undefined =>
  new RegExp(`${name}:\\s*([^;]+);`).exec(scope)?.[1].trim();

const luminance = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const s = parseInt(hex.slice(i, i + 2), 16) / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const TOKENS = [
  "--cal-on-primary",
  "--cal-event-default",
  "--cal-surface-raised",
];

describe("variables.css palette tokens", () => {
  const light = block(":root");
  const dark = block('[data-color-scheme="dark"]');

  it.each(TOKENS)("%s is defined in both schemes", (name) => {
    expect(token(light, name)).toBeTruthy();
    expect(token(dark, name)).toBeTruthy();
  });

  it("keeps the default event colour equal to the contrast-input constant", () => {
    expect(token(light, "--cal-event-default")).toBe(
      LAYOUT_CONSTANTS.DEFAULT_EVENT_COLOR,
    );
    expect(token(dark, "--cal-event-default")).toBe(
      LAYOUT_CONSTANTS.DEFAULT_EVENT_COLOR,
    );
    expect(getContrastColor("#3b82f6")).toBeTruthy();
  });

  it("uses the native light primary palette", () => {
    expect(token(light, "--primary-color")).toBe("#2563eb");
    expect(token(light, "--primary-hover")).toBe("#1d4ed8");
  });

  // On-primary text meets WCAG AA (4.5:1) on the primary fill in both schemes.
  it.each([
    ["light", light, 4.5],
    ["dark", dark, 4.5],
  ])("on-primary contrast on primary (%s)", (_n, scope, min) => {
    const fg = token(scope, "--cal-on-primary") as string;
    const bg = token(scope, "--primary-color") as string;
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(min);
  });
});
