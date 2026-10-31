import React from 'react';
import { motion } from 'framer-motion';
import { Skull, ShieldAlert, Sparkles, Flame, CheckCircle2 } from 'lucide-react';

export default function PollutionMeter({
  pollutionPercent = 68,
  totalEmailsScanned = 1842,
  junkCount = 1120,
}) {
  // Threat color logic
  const getThreatLevel = (val) => {
    if (val <= 20) return { label: 'SUPER CLEAN INBOX', color: 'emerald', border: 'border-emerald-500/40', text: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]' };
    if (val <= 50) return { label: 'A LITTLE CLUTTER', color: 'amber', border: 'border-amber-500/40', text: 'text-amber-400', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]' };
    if (val <= 75) return { label: 'LOTS OF JUNK EMAILS', color: 'orange', border: 'border-orange-500/40', text: 'text-orange-400', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.4)]' };
    return { label: 'TOO MUCH CLUTTER!', color: 'rose', border: 'border-rose-600/50', text: 'text-rose-400', glow: 'shadow-[0_0_25px_rgba(225,29,72,0.5)]' };
  };

  const threat = getThreatLevel(pollutionPercent);

  // Circumference for SVG gauge circle
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pollutionPercent / 100) * circumference;

  return (
    <div className={`relative bg-dungeon-900/90 rounded-2xl border ${threat.border} p-5 sm:p-6 ${threat.glow} backdrop-blur-md`}>
      {/* Corner runes */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Radial Arcane Meter */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Background ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#1e2638"
              strokeWidth="12"
            />
            {/* Active pollution glow ring */}
            <motion.circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="url(#pollution-gradient)"
              strokeWidth="12"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="pollution-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center stats */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-medieval text-3xl font-black text-white leading-none">
              {pollutionPercent}%
            </span>
            <span className="text-[10px] font-cinzel font-bold text-slate-400 uppercase tracking-widest mt-1">
              INBOX CLUTTER
            </span>
          </div>
        </div>

        {/* Text & Threat Status */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-cinzel font-bold tracking-wider uppercase bg-dungeon-950 border ${threat.border} ${threat.text}`}>
              <ShieldAlert className="w-3.5 h-3.5" />
              {threat.label}
            </span>
            <span className="text-xs text-slate-400 font-cinzel">
              Target: 0% (Inbox Zero)
            </span>
          </div>

          <h3 className="font-medieval text-xl text-white">
            Inbox Clutter Level
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed max-w-md">
            You have <strong className="text-orange-400">{junkCount}</strong> junk emails out of <strong className="text-slate-100">{totalEmailsScanned}</strong> total emails. Use <strong className="text-amber-400">Blaze</strong> to archive them!
          </p>

          <div className="pt-2 flex items-center justify-center sm:justify-start gap-4 text-xs font-cinzel">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>{junkCount} Junk Emails to Clean</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Safety Checks Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

