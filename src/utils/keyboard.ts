import { KeyboardEvent } from "react";

export function handleKeyboardActivation(handler: (e: KeyboardEvent) => void) {
  return (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      handler(e);
    }
  };
}
