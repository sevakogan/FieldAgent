const GRID_SPACING = 32;

export function GridPattern() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        opacity: 0.03,
        backgroundImage: `radial-gradient(circle, #1C1C1E 1px, transparent 1px)`,
        backgroundSize: `${GRID_SPACING}px ${GRID_SPACING}px`,
      }}
    />
  );
}
