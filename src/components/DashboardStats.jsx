import React from 'react';
import { Mail, Flame, ShieldCheck, Zap, Compass, Skull, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardStats({
  metrics,
  onPurgeDemo,
  onShieldDemo,
  onSnoozeDemo,
}) {
  const cards = [
    {
      id: 'scanned',
      label: 'TOTAL EMAILS CHECKED',
      value: metrics.totalEmailsScanned.toLocaleString(),
      subtext: 'In your inbox',
      icon: Mail,
      guardian: 'Your Inbox',
      borderColor: 'border-purple-500/30',
      glowColor: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
      textColor: 'text-purple-300',
      iconColor: 'text-purple-400',
      gradient: 'from-purple-900/20 to-transparent',
    },
    {
      id: 'junk',
      label: 'LIKELY JUNK EMAILS',
      value: metrics.junkDetected.toLocaleString(),
      subtext: 'Ready to be archived by Blaze',
      icon: Flame,
      guardian: 'Blaze (Archive)',
      borderColor: 'border-orange-500/30',
      glowColor: 'hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]',
      textColor: 'text-orange-300',
      iconColor: 'text-orange-400',
      gradient: 'from-orange-950/30 to-transparent',
      action: onPurgeDemo ? { label: 'Archive Junk', fn: onPurgeDemo } : null,
    },
    {
      id: 'protected',
      label: 'IMPORTANT EMAILS',
      value: metrics.emailsProtected.toLocaleString(),
      subtext: 'Kept safe by Frost',
      icon: ShieldCheck,
      guardian: 'Frost (Keep)',
      borderColor: 'border-cyan-500/30',
      glowColor: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]',
      textColor: 'text-cyan-300',
      iconColor: 'text-cyan-400',
      gradient: 'from-cyan-950/30 to-transparent',
      action: onShieldDemo ? { label: 'Keep Safe', fn: onShieldDemo } : null,
    },
    {
      id: 'snoozed',
      label: 'REPLY LATER EMAILS',
      value: metrics.pendingReplies.toLocaleString(),
      subtext: 'Marked for reply later with Volt',
      icon: Zap,
      guardian: 'Volt (Reply Later)',
      borderColor: 'border-fuchsia-500/30',
      glowColor: 'hover:shadow-[0_0_20px_rgba(217,70,239,0.3)]',
      textColor: 'text-fuchsia-300',
      iconColor: 'text-fuchsia-400',
      gradient: 'from-fuchsia-950/30 to-transparent',
      action: onSnoozeDemo ? { label: 'Mark Later', fn: onSnoozeDemo } : null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className={`relative bg-dungeon-900/90 rounded-2xl border ${card.borderColor} p-5 backdrop-blur-md transition-all duration-300 ${card.glowColor} overflow-hidden group`}
            >
              {/* Corner clip */}
              <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-400/60 pointer-events-none" />
              
              {/* Subtle background glow */}
              <div className={`absolute inset-0 bg-gradient-to-b ${card.gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-cinzel text-[11px] font-bold text-slate-400 tracking-wider">
                    {card.guardian}
                  </span>
                  <div className={`p-2 rounded-xl bg-dungeon-950 border border-slate-800 ${card.iconColor} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="font-medieval text-3xl font-black text-white tracking-tight mb-1">
                  {card.value}
                </div>

                <div className="font-cinzel text-xs font-bold text-slate-300 tracking-wider mb-2">
                  {card.label}
                </div>

                <p className="text-[11px] text-slate-400">
                  {card.subtext}
                </p>

                {card.action && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={card.action.fn}
                      className="w-full text-center py-1 px-2 rounded-lg bg-dungeon-950/80 hover:bg-dungeon-800 border border-slate-700/60 font-cinzel text-[10px] font-bold uppercase tracking-wider text-amber-300 hover:text-white transition-all"
                    >
                      {card.action.label} (Demo)
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Dungeon Floor Progress Banner */}
      <div className="relative bg-gradient-to-r from-purple-950/80 via-dungeon-900 to-indigo-950/80 rounded-2xl border border-purple-500/40 p-5 sm:p-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
        <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
              <span className="font-cinzel text-xs font-bold text-amber-400 tracking-widest uppercase">
                CURRENT LEVEL PROGRESS
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-900/60 border border-rose-500/40 text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                {metrics.currentFloor.difficulty}
              </span>
            </div>

            <h3 className="font-medieval text-2xl text-white">
              Floor {metrics.currentFloor.number} of {metrics.currentFloor.totalFloors}: {metrics.currentFloor.name}
            </h3>

            <p className="text-xs text-slate-300 max-w-xl">
              Boss Challenge: <span className="text-rose-400 font-semibold">{metrics.currentFloor.bossName}</span>. 
              Archive or sort remaining emails to challenge the boss and unlock the next level!
            </p>
          </div>

          <div className="lg:w-72 shrink-0 space-y-2 bg-dungeon-950/70 p-3.5 rounded-xl border border-purple-900/60">
            <div className="flex justify-between text-xs font-cinzel text-slate-300">
              <span>Level Progress</span>
              <span className="font-bold text-amber-400">{metrics.currentFloor.purificationRate}%</span>
            </div>
            <div className="h-2.5 w-full bg-dungeon-900 rounded-full border border-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-700" 
                style={{ width: `${metrics.currentFloor.purificationRate}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 font-cinzel text-center">
              Boss health: {100 - metrics.currentFloor.purificationRate}% remaining
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

