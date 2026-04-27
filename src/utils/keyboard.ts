import { KeyboardEvent } from "react";
import { KEYBOARD_SHORTCUTS } from "../constants";

export function handleKeyboardActivation(handler: (e: KeyboardEvent) => void) {
  return (e: KeyboardEvent) => {
    if (
      e.key === KEYBOARD_SHORTCUTS.OPEN ||
      e.key === KEYBOARD_SHORTCUTS.ACTIVATE
    ) {
      e.preventDefault();
      e.stopPropagation();
      handler(e);
    }
  };
}
