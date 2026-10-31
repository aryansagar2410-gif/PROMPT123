import React from 'react';
import { 
  Trophy, 
  Flame, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  RotateCcw, 
  ArrowRight,
  TrendingDown,
  Award
} from 'lucide-react';
import GameButton from './GameButton';

export default function ArenaResults({
  stats = {},
  onPlayAgain,
  onRestart,
  onReturnDashboard,
  onReturnToSanctum,
}) {
  const reviewed = stats.reviewedCount ?? ((stats.archived || 0) + (stats.protected || 0) + (stats.snoozed || 0));
  const archived = stats.archivedCount ?? stats.archived ?? 0;
  const kept = stats.protectedCount ?? stats.protected ?? 0;
  const later = stats.snoozedCount ?? stats.snoozed ?? 0;
  const xp = stats.xpEarned ?? stats.totalXP ?? 0;
  const streak = stats.peakCombo ?? 0;
  const clutterDrop = stats.pollutionReduction ?? ((stats.initialPollution || 68) - (stats.finalPollution || 50));
  const bossWon = stats.bossDefeated;

  const handleRestart = onPlayAgain || onRestart;
  const handleReturn = onReturnDashboard || onReturnToSanctum;

  return (
    <div className="max-w-2xl mx-auto my-6 p-6 sm:p-8 bg-[#11101B] border-2 border-[#8B5CF6]/50 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-xl relative font-sans text-white">
      {/* HEADER */}
      <div className="text-center space-y-2 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#FBBF24] p-0.5 mx-auto shadow-[0_0_25px_rgba(251,191,36,0.4)] flex items-center justify-center">
          <div className="w-full h-full bg-[#0B0A12] rounded-[14px] flex items-center justify-center">
            <Trophy className="w-8 h-8 text-[#FBBF24] animate-bounce" />
          </div>
        </div>

        <span className="font-heading text-xs font-bold text-[#FBBF24] uppercase tracking-widest">
          Game Complete
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl font-black text-white">
          You Won!
        </h2>
        <p className="text-sm text-slate-300">
          Awesome job! You organized all your emails and cleaned up your inbox clutter.
        </p>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {/* Total Reviewed */}
        <div className="p-3.5 rounded-xl bg-[#1B1728] border border-white/5 text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Emails Checked</span>
          <div className="font-mono text-2xl font-bold text-white mt-1">
            {reviewed}
          </div>
        </div>

        {/* Archived */}
        <div className="p-3.5 rounded-xl bg-[#F87171]/10 border border-[#F87171]/30 text-center">
          <span className="text-[10px] font-mono text-[#F87171] uppercase flex items-center justify-center gap-1 font-bold">
            <Flame className="w-3 h-3" /> Archived
          </span>
          <div className="font-mono text-2xl font-bold text-[#F87171] mt-1">
            {archived}
          </div>
        </div>

        {/* Kept */}
        <div className="p-3.5 rounded-xl bg-[#60A5FA]/10 border border-[#60A5FA]/30 text-center">
          <span className="text-[10px] font-mono text-[#60A5FA] uppercase flex items-center justify-center gap-1 font-bold">
            <ShieldCheck className="w-3 h-3" /> Kept
          </span>
          <div className="font-mono text-2xl font-bold text-[#60A5FA] mt-1">
            {kept}
          </div>
        </div>

        {/* Reply Later */}
        <div className="p-3.5 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-center">
          <span className="text-[10px] font-mono text-[#A78BFA] uppercase flex items-center justify-center gap-1 font-bold">
            <Zap className="w-3 h-3" /> Reply Later
          </span>
          <div className="font-mono text-2xl font-bold text-[#A78BFA] mt-1">
            {later}
          </div>
        </div>
      </div>

      {/* XP & RESULTS BANNER */}
      <div className="bg-[#1B1728] p-5 rounded-2xl border border-white/5 mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#FBBF24] font-bold uppercase">
              <Sparkles className="w-4 h-4 text-[#FBBF24]" />
              <span>XP Points Earned</span>
            </div>
            <div className="font-mono text-3xl font-black text-white mt-0.5">
              +{xp} XP
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Best Streak: <strong className="text-[#FBBF24]">x{streak}</strong>
            </span>
          </div>

          <div className="text-right sm:border-l sm:border-white/5 sm:pl-6">
            <span className="text-xs font-mono text-[#22C55E] font-bold uppercase flex items-center gap-1 justify-end">
              <TrendingDown className="w-4 h-4" /> Clutter Reduced
            </span>
            <div className="font-mono text-2xl font-bold text-[#22C55E] mt-0.5">
              -{clutterDrop}%
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Inbox is now cleaner!
            </span>
          </div>
        </div>

        {/* BIG CHALLENGE BADGE IF WON */}
        {bossWon && (
          <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-xs text-[#FBBF24] font-sans">
            <Award className="w-4 h-4 text-[#FBBF24]" />
            <span>New Badge Earned: <strong>Big Email Challenge Champion</strong> (+500 XP)</span>
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <GameButton
          variant="primary"
          size="lg"
          icon={RotateCcw}
          onClick={handleRestart}
          className="w-full sm:w-auto"
        >
          Play Again
        </GameButton>

        <GameButton
          variant="dark"
          size="lg"
          icon={ArrowRight}
          onClick={handleReturn}
          className="w-full sm:w-auto"
        >
          Back to Dashboard
        </GameButton>
      </div>
    </div>
  );
}
