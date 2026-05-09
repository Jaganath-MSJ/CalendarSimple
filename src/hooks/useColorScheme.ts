import { useEffect, useState } from "react";
import type { ColorScheme } from "../types";

const PREFERS_DARK_QUERY = "(prefers-color-scheme: dark)";

function readSystemScheme(): "light" | "dark" {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return "light";
  }
  return window.matchMedia(PREFERS_DARK_QUERY).matches ? "dark" : "light";
}

export default function useColorScheme(
  colorScheme: ColorScheme | undefined,
): "light" | "dark" {
  const isAuto = colorScheme === undefined || colorScheme === "auto";

  const [systemScheme, setSystemScheme] = useState<"light" | "dark">(() =>
    isAuto ? readSystemScheme() : "light",
  );

  useEffect(() => {
    if (!isAuto) return;
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    )
      return;

    const mq = window.matchMedia(PREFERS_DARK_QUERY);
    const handler = (e: MediaQueryListEvent) =>
      setSystemScheme(e.matches ? "dark" : "light");

    setSystemScheme(mq.matches ? "dark" : "light");

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [isAuto]);

  if (colorScheme === "light" || colorScheme === "dark") return colorScheme;
  return systemScheme;
}
