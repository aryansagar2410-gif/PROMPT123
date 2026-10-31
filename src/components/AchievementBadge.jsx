import React from 'react';
import { Flame, ShieldCheck, Zap, Crown, Sparkles, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AchievementBadge({ achievement }) {
  const { title, description, icon, unlocked, tier, xpReward, guardian } = achievement;

  const iconMap = {
    Flame,
    ShieldCheck,
    Zap,
    Crown,
    Sparkles,
  };

  const Icon = iconMap[icon] || Sparkles;

  const tierStyles = {
    Bronze: {
      badge: 'border-amber-700/60 bg-amber-950/30 text-amber-500',
      tag: 'text-amber-500 bg-amber-950/60 border-amber-800',
    },
    Silver: {
      badge: 'border-slate-400/60 bg-slate-800/40 text-slate-200',
      tag: 'text-slate-200 bg-slate-900 border-slate-600',
    },
    Gold: {
      badge: 'border-yellow-400/60 bg-yellow-950/40 text-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.3)]',
      tag: 'text-yellow-300 bg-yellow-950 border-yellow-500',
    },
    Mythic: {
      badge: 'border-purple-400/70 bg-purple-950/40 text-purple-300 shadow-[0_0_20px_rgba(192,132,252,0.4)]',
      tag: 'text-purple-300 bg-purple-950 border-purple-500',
    },
  }[tier] || {
    badge: 'border-slate-700 bg-slate-900 text-slate-400',
    tag: 'text-slate-400 bg-slate-900 border-slate-700',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative flex items-start gap-4 p-4 rounded-xl border ${
        unlocked
          ? `${tierStyles.badge} backdrop-blur-md`
          : 'border-slate-800 bg-dungeon-950/60 opacity-60'
      } transition-all`}
    >
      {/* Icon Frame */}
      <div className="relative shrink-0">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${tierStyles.badge}`}>
          {unlocked ? (
            <Icon className="w-6 h-6" />
          ) : (
            <Lock className="w-5 h-5 text-slate-500" />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] font-cinzel font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider ${tierStyles.tag}`}>
            {tier}
          </span>
          <span className="text-[10px] font-cinzel text-amber-400 font-semibold">
            +{xpReward} XP
          </span>
          {!unlocked && (
            <span className="text-[10px] font-cinzel text-slate-500 uppercase tracking-widest ml-auto">
              LOCKED
            </span>
          )}
        </div>

        <h4 className="font-medieval text-base font-bold text-white truncate">
          {title}
        </h4>
        <p className="text-xs text-slate-400 leading-snug mt-0.5">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

