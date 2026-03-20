"use client";

import { motion, useScroll, useTransform } from "framer-motion";

const ORBS = [
  {
    id: "cyan",
    className: "top-[-10%] left-[-10%] w-[800px] h-[800px]",
    gradient: "from-[#5AC8FA] to-[#007AFF]",
    scrollFactor: 0.15,
    opacity: 0.3,
    blur: 140,
  },
  {
    id: "purple",
    className: "top-[-5%] right-[-10%] w-[700px] h-[700px]",
    gradient: "from-[#AF52DE] to-[#007AFF]",
    scrollFactor: 0.2,
    opacity: 0.28,
    blur: 130,
  },
  {
    id: "blue",
    className: "bottom-[-10%] left-[30%] w-[750px] h-[750px]",
    gradient: "from-[#007AFF] to-[#5AC8FA]",
    scrollFactor: 0.3,
    opacity: 0.25,
    blur: 120,
  },
  {
    id: "violet",
    className: "top-[40%] right-[20%] w-[650px] h-[650px]",
    gradient: "from-[#AF52DE] to-[#FF6B9D]",
    scrollFactor: 0.25,
    opacity: 0.22,
    blur: 150,
  },
  {
    id: "pink",
    className: "bottom-[-5%] right-[-8%] w-[680px] h-[680px]",
    gradient: "from-[#FF6B9D] to-[#AF52DE]",
    scrollFactor: 0.18,
    opacity: 0.24,
    blur: 135,
  },
] as const;

export function FloatingOrbs() {
  const { scrollY } = useScroll();

  const y0 = useTransform(scrollY, [0, 3000], [0, 3000 * ORBS[0].scrollFactor]);
  const y1 = useTransform(scrollY, [0, 3000], [0, 3000 * ORBS[1].scrollFactor]);
  const y2 = useTransform(scrollY, [0, 3000], [0, 3000 * ORBS[2].scrollFactor]);
  const y3 = useTransform(scrollY, [0, 3000], [0, 3000 * ORBS[3].scrollFactor]);
  const y4 = useTransform(scrollY, [0, 3000], [0, 3000 * ORBS[4].scrollFactor]);

  const transforms = [y0, y1, y2, y3, y4];

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {ORBS.map((orb, index) => (
        <motion.div
          key={orb.id}
          className={`absolute rounded-full bg-gradient-to-br ${orb.gradient} ${orb.className}`}
          style={{
            y: transforms[index],
            filter: `blur(${orb.blur}px)`,
            opacity: orb.opacity,
          }}
        />
      ))}
    </div>
  );
}
