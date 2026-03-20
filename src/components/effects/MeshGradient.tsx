"use client";

const MESH_STYLE: React.CSSProperties = {
  background: `
    radial-gradient(ellipse at 20% 50%, rgba(90,200,250,0.4) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 20%, rgba(0,122,255,0.35) 0%, transparent 55%),
    radial-gradient(ellipse at 50% 80%, rgba(175,82,222,0.32) 0%, transparent 55%),
    radial-gradient(ellipse at 70% 60%, rgba(255,107,157,0.28) 0%, transparent 55%),
    radial-gradient(ellipse at 30% 30%, rgba(0,122,255,0.2) 0%, transparent 50%),
    radial-gradient(ellipse at 60% 40%, rgba(175,82,222,0.18) 0%, transparent 50%)
  `,
  backgroundSize: "200% 200%",
  animationName: "meshShift",
  animationDuration: "12s",
  animationTimingFunction: "ease-in-out",
  animationIterationCount: "infinite",
};

export function MeshGradient() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <style>{`
        @keyframes meshShift {
          0%, 100% { background-position: 0% 50%; }
          25% { background-position: 100% 25%; }
          50% { background-position: 50% 100%; }
          75% { background-position: 25% 0%; }
        }
        @keyframes heroPulse {
          0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.3); }
        }
      `}</style>
      <div className="absolute inset-0 w-full h-screen" style={MESH_STYLE} />
      {/* Pulsing glow accent */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(90,200,250,0.2) 0%, rgba(175,82,222,0.1) 40%, transparent 70%)",
          animation: "heroPulse 4s ease-in-out infinite",
        }}
      />
    </>
  );
}
