import React from 'react';
import { motion } from 'framer-motion';

export function ArcaneParticles({ count = 20, color = 'rgba(192, 132, 252, 0.4)' }) {
  const particles = Array.from({ length: count });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((_, i) => {
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const size = Math.random() * 3 + 1.5;
        const duration = Math.random() * 8 + 6;
        const delay = Math.random() * 4;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              boxShadow: `0 0 ${size * 3}px ${color}`,
            }}
            animate={{
              y: [0, -60, -120],
              opacity: [0, 0.8, 0],
              scale: [0.8, 1.2, 0.6],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
}

export function FantasyFrame({ children, className = '', glowColor = 'purple' }) {
  const glowBorder = {
    purple: 'border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    gold: 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    fire: 'border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.15)]',
    ice: 'border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]',
  }[glowColor] || 'border-purple-500/30';

  return (
    <div className={`relative bg-dungeon-900/80 backdrop-blur-md rounded-xl border ${glowBorder} p-6 ${className}`}>
      {/* Corner runes */}
      <span className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
      <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
      <span className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
      <span className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-400 pointer-events-none" />
      {children}
    </div>
  );
}

export function RuneBanner({ text = 'ARCANE SANCTUM' }) {
  return (
    <div className="flex items-center justify-center gap-3 select-none py-1">
      <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-400/60" />
      <span className="font-cinzel text-xs tracking-[0.3em] text-amber-400/80 font-bold uppercase">
        {text}
      </span>
      <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-400/60" />
    </div>
  );
}

