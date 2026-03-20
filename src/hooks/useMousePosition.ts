"use client";

import { useState, useEffect } from "react";

interface MousePosition {
  readonly x: number;
  readonly y: number;
}

const INITIAL_POSITION: MousePosition = { x: 0, y: 0 };

function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

/**
 * Tracks mouse position on the window.
 * Disabled on touch devices to avoid unnecessary event listeners.
 * Returns { x, y } in pixel coordinates.
 */
export function useMousePosition(): MousePosition {
  const [position, setPosition] = useState<MousePosition>(INITIAL_POSITION);

  useEffect(() => {
    if (isTouchDevice()) return;

    function handleMouseMove(event: MouseEvent) {
      setPosition({ x: event.clientX, y: event.clientY });
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return position;
}
