"use client";

import { motion } from "framer-motion";

interface OrbProps {
  isActive: boolean;
  volume?: number; // 0 to 1
}

export default function Orb({ isActive, volume = 0 }: OrbProps) {
  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Core Orb */}
      <motion.div
        className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 blur-md z-10"
        animate={{
          scale: isActive ? [1, 1.2 + volume, 1] : 1,
          rotate: isActive ? [0, 360] : 0,
        }}
        transition={{
          scale: {
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
          rotate: {
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          },
        }}
      />

      {/* Outer Glow */}
      <motion.div
        className="absolute w-48 h-48 rounded-full bg-blue-500 opacity-20 blur-xl"
        animate={{
          scale: isActive ? [1, 1.5, 1] : 1,
          opacity: isActive ? [0.2, 0.4, 0.2] : 0.2,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Inner Highlight */}
      <motion.div
        className="absolute w-20 h-20 rounded-full bg-white opacity-30 blur-sm z-20"
        animate={{
          scale: isActive ? [0.8, 1.1, 0.8] : 1,
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
