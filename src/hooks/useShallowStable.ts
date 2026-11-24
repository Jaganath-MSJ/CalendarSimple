import { useRef } from "react";

function shallowEqual(a: object, b: object): boolean {
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every(
    (k) =>
      Object.prototype.hasOwnProperty.call(b, k) &&
      Object.is(
        (a as Record<string, unknown>)[k],
        (b as Record<string, unknown>)[k],
      ),
  );
}

/* eslint-disable react-hooks/refs -- idempotent render-time ref update is intentional */
/** Returns the previous object while its keys and values are shallow-equal. */
export default function useShallowStable<T extends object>(value: T): T {
  const ref = useRef(value);
  if (ref.current !== value && !shallowEqual(ref.current, value)) {
    ref.current = value;
  }
  return ref.current;
}
