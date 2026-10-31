import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, Award } from 'lucide-react';

export default function XPBar({
  level = 14,
  currentXP = 4250,
  maxXP = 6000,
  playerName = 'Archmage Valen',
  title = 'Novice Sanctum Purifier',
  gold = 3840,
}) {
  const percentage = Math.min(100, Math.round((currentXP / maxXP) * 100));

  return (
    <div className="relative bg-dungeon-900/90 rounded-2xl border border-purple-500/30 p-4 sm:p-5 shadow-[0_0_25px_rgba(168,85,247,0.15)]">
      {/* Corner gold ornaments */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
        {/* Player Profile & Level Crest */}
        <div className="flex items-center gap-3.5">
          {/* Level Crest Medal */}
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            {/* Hexagonal / Diamond Shield */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-400 via-amber-600 to-amber-900 rotate-45 rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
            <div className="absolute inset-1 bg-dungeon-950 rotate-45 rounded-md flex items-center justify-center" />
            <div className="relative z-10 flex flex-col items-center justify-center">
              <span className="text-[9px] font-cinzel text-amber-300 uppercase tracking-widest -mb-1">LVL</span>
              <span className="text-xl font-medieval font-black text-white text-shadow-sm">{level}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-cinzel text-lg sm:text-xl font-bold text-white tracking-wide">
                {playerName}
              </h2>
              <span className="px-2 py-0.5 rounded bg-purple-900/60 border border-purple-500/40 text-[11px] font-cinzel text-purple-200 tracking-wider font-semibold">
                HERO
              </span>
            </div>
            <p className="text-xs font-cinzel text-amber-400/90 tracking-wider">
              {title}
            </p>
          </div>
        </div>

        {/* Currency & Rewards Pills */}
        <div className="flex items-center gap-3">
          {/* Gold Bounty */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dungeon-950/80 border border-amber-500/30">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center shadow-[0_0_8px_#f59e0b]">
              <span className="text-[10px] font-black text-slate-950">G</span>
            </div>
            <span className="font-cinzel text-xs font-bold text-amber-300">
              {gold.toLocaleString()} <span className="text-[10px] text-amber-500/80">GOLD</span>
            </span>
          </div>

          {/* XP Progress Label */}
          <div className="text-right">
            <span className="text-xs text-slate-400 font-cinzel tracking-wider">
              XP to Next Level
            </span>
            <div className="font-cinzel text-xs font-bold text-white">
              <span className="text-amber-400">{currentXP.toLocaleString()}</span> / {maxXP.toLocaleString()} ({percentage}%)
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full h-4 bg-dungeon-950 rounded-full border border-purple-900/80 p-0.5 overflow-hidden shadow-inner">
        {/* Animated fill bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-300 relative shadow-[0_0_12px_rgba(251,191,36,0.6)]"
        >
          {/* Shimmer line */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-shimmer" />
        </motion.div>
      </div>

      {/* Bar subtext */}
      <div className="flex justify-between items-center mt-1.5 text-[11px] font-cinzel text-slate-400">
        <span>Player Level {level}</span>
        <span className="text-amber-400/80">{(maxXP - currentXP).toLocaleString()} XP to Level {level + 1}</span>
      </div>
    </div>
  );
}

