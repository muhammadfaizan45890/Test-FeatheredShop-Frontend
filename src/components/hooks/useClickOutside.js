import { useEffect } from "react";

/**
 * Invokes `handler` when a pointer event occurs outside every ref in
 * `refs`. Pass an array of refs so a single handler can guard multiple
 * related elements (e.g. a trigger button + its popover).
 *
 * @param {Array<import('react').RefObject<HTMLElement>>} refs
 * @param {(event: MouseEvent | TouchEvent) => void} handler
 * @param {boolean} [enabled=true] - Skip attaching listeners when false.
 */
export default function useClickOutside(refs, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;

    const listener = (event) => {
      const clickedInsideAny = refs.some(
        (ref) => ref.current && ref.current.contains(event.target),
      );
      if (!clickedInsideAny) handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [refs, handler, enabled]);
}
