"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Signature hero element: an animated temperature readout that drops
 * from ambient to sub-zero on load, like a cold-room sensor activating.
 * This is the one "real risk" of the design — a literal, technical
 * embodiment of the product rather than a generic icon or stat block.
 */
export default function ThermalReadout() {
  const [temp, setTemp] = useState(24);

  useEffect(() => {
    const target = -28;
    const duration = 2200;
    const start = performance.now();

    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setTemp(Math.round(24 + (target - 24) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="inline-flex items-center gap-3 border border-steel-700 bg-steel-900/50 px-5 py-3 backdrop-blur-sm"
    >
      <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
      <span className="font-[family-name:var(--font-mono)] text-2xl font-medium tabular-nums text-cyan-300">
        {temp}°C
      </span>
      <span className="text-xs text-fog-400">القراءة الحية لغرفة التجميد</span>
    </motion.div>
  );
}
