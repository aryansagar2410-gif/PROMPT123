import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { 
  Flame, 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  Eye, 
  Sparkles,
  Mail,
  HardDrive
} from 'lucide-react';

export default function BattleCard({
  email,
  onAction,
  onInspect,
  isTopCard = true,
  stackIndex = 0,
  reducedMotion = false,
  isActionLocked = false,
}) {
  const [dragDirection, setDragDirection] = useState(null);

  // Motion values for swipe mechanics
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Subtle rotation on horizontal drag
  const rotate = useTransform(x, [-200, 200], [-14, 14]);
  
  // Opacity of elemental stamp indicators based on drag offset
  const infernoOpacity = useTransform(x, [-140, -35], [1, 0]);
  const frostOpacity = useTransform(x, [35, 140], [0, 1]);
  const voltOpacity = useTransform(y, [-120, -35], [1, 0]);

  // Border color based on drag direction
  const borderColor = useTransform(
    x,
    [-150, 0, 150],
    ['rgba(248, 113, 113, 0.8)', 'rgba(255, 255, 255, 0.08)', 'rgba(96, 165, 250, 0.8)']
  );

  const handleDrag = (_, info) => {
    const { offset } = info;
    const absX = Math.abs(offset.x);
    const absY = Math.abs(offset.y);

    if (offset.y < -50 && absY > absX * 0.75) {
      setDragDirection('up');
    } else if (offset.x < -45 && absX > absY * 0.75) {
      setDragDirection('left');
    } else if (offset.x > 45 && absX > absY * 0.75) {
      setDragDirection('right');
    } else {
      setDragDirection(null);
    }
  };

  const handleDragEnd = (_, info) => {
    if (isActionLocked) return;

    const { offset, velocity } = info;
    const swipeThreshold = 85;
    const swipeVelocity = 280;
    const absX = Math.abs(offset.x);
    const absY = Math.abs(offset.y);

    // Dominant vertical upward swipe (Reply Later)
    if ((offset.y < -swipeThreshold && absY > absX * 0.75) || (velocity.y < -swipeVelocity && absY > absX)) {
      onAction('volt', email);
    } 
    // Dominant horizontal left swipe (Archive Email)
    else if ((offset.x < -swipeThreshold && absX > absY * 0.75) || (velocity.x < -swipeVelocity && absX > absY)) {
      onAction('inferno', email);
    } 
    // Dominant horizontal right swipe (Keep Email)
    else if ((offset.x > swipeThreshold && absX > absY * 0.75) || (velocity.x > swipeVelocity && absX > absY)) {
      onAction('frost', email);
    } else {
      setDragDirection(null);
    }
  };

  // Stack depth styling for cards behind the top card
  const stackScale = Math.max(0.88, 1 - stackIndex * 0.04);
  const stackY = stackIndex * 12;
  const stackOpacity = Math.max(0.4, 1 - stackIndex * 0.22);

  const classificationStyles = {
    promotional: { label: 'Likely Junk', bg: 'bg-[#F87171]/10 border-[#F87171]/30 text-[#F87171]' },
    newsletter: { label: 'Newsletter', bg: 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-[#A78BFA]' },
    personal: { label: 'Personal Message', bg: 'bg-[#60A5FA]/10 border-[#60A5FA]/30 text-[#60A5FA]' },
    university: { label: 'School / College Email', bg: 'bg-[#818CF8]/10 border-[#818CF8]/30 text-[#818CF8]' },
    banking: { label: 'Bank / Money Alert', bg: 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]' },
    order_update: { label: 'Order Update', bg: 'bg-[#38BDF8]/10 border-[#38BDF8]/30 text-[#38BDF8]' },
    phishing: { label: '⚠️ Scam Warning', bg: 'bg-rose-950/80 border-rose-500/80 text-rose-300' },
  }[email.classification] || { label: 'Email', bg: 'bg-white/5 border-white/10 text-slate-300' };

  return (
    <motion.div
      style={
        isTopCard
          ? {
              x,
              y,
              rotate: reducedMotion ? 0 : rotate,
              borderColor,
              zIndex: 30 - stackIndex,
            }
          : {
              scale: stackScale,
              y: stackY,
              opacity: stackOpacity,
              zIndex: 30 - stackIndex,
            }
      }
      drag={isTopCard && !isActionLocked}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.75}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.01, cursor: 'grabbing' }}
      className={`absolute w-full max-w-[500px] select-none rounded-[20px] bg-[#1B1728] border p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-shadow ${
        isTopCard ? 'cursor-grab hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]' : 'pointer-events-none'
      }`}
    >
      {/* SWIPE ELEMENTAL STAMP INDICATORS */}
      {isTopCard && (
        <>
          {/* Left / Archive Email Stamp */}
          <motion.div
            style={{ opacity: infernoOpacity }}
            className="absolute top-5 right-5 px-3.5 py-1.5 rounded-xl bg-[#F87171] border border-white/30 text-white font-heading text-xs font-bold tracking-wider uppercase shadow-[0_4px_20px_rgba(248,113,113,0.6)] rotate-12 flex items-center gap-1.5 pointer-events-none z-30"
          >
            <Flame className="w-4 h-4 fill-white text-white" />
            <span>Archive Email</span>
          </motion.div>

          {/* Right / Keep Email Stamp */}
          <motion.div
            style={{ opacity: frostOpacity }}
            className="absolute top-5 left-5 px-3.5 py-1.5 rounded-xl bg-[#60A5FA] border border-white/30 text-white font-heading text-xs font-bold tracking-wider uppercase shadow-[0_4px_20px_rgba(96,165,250,0.6)] -rotate-12 flex items-center gap-1.5 pointer-events-none z-30"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>Keep Email</span>
          </motion.div>

          {/* Up / Reply Later Stamp */}
          <motion.div
            style={{ opacity: voltOpacity }}
            className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-xl bg-[#8B5CF6] border border-white/30 text-white font-heading text-xs font-bold tracking-wider uppercase shadow-[0_4px_20px_rgba(139,92,246,0.6)] flex items-center gap-1.5 pointer-events-none z-30"
          >
            <Zap className="w-4 h-4 fill-white text-white" />
            <span>Reply Later</span>
          </motion.div>
        </>
      )}

      {/* CARD HEADER & METADATA */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Classification Badge & Live Gmail Chip */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-semibold border tracking-wider ${classificationStyles.bg}`}>
            {classificationStyles.label}
          </span>
          {email.isGmail && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 text-[10px] font-mono font-bold">
              <Mail className="w-2.5 h-2.5" />
              LIVE GMAIL
            </span>
          )}
        </div>

        {/* How Sure Is the AI? */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1 text-[#FBBF24]">
            <Sparkles className="w-3 h-3" />
            AI is {email.confidenceScore}% sure
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-400">
            <HardDrive className="w-3 h-3" />
            {email.size}
          </span>
        </div>
      </div>

      {/* SENDER & SUBJECT */}
      <div className="mb-3 space-y-1">
        <div className="flex items-center justify-between text-xs text-slate-400 font-sans">
          <span className="font-semibold text-slate-300 truncate max-w-[280px]">
            From: {email.sender}
          </span>
          <span className="text-[10px] font-mono shrink-0 text-slate-400">{email.date}</span>
        </div>

        <h3 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
          {email.subject}
        </h3>
      </div>

      {/* SCAM WARNING BANNER IF DETECTED */}
      {email.phishingRisk === 'high' && (
        <div className="mb-3 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-start gap-2 text-xs text-rose-300 font-sans">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <strong className="text-white">This email might be a scam:</strong>
            <p className="text-[11px] text-rose-200/90 leading-tight mt-0.5">
              Please check it carefully before taking action. Do not click links or send passwords.
            </p>
          </div>
        </div>
      )}

      {/* AI EMAIL SUMMARY BOX */}
      <div className="mb-3 p-3.5 rounded-xl bg-[#11101B]/80 border border-white/5 text-xs text-slate-200 font-sans">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-[#FBBF24] font-mono font-bold text-[10px] uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>AI Email Summary</span>
          </div>

          {/* AI Check Result */}
          <span className="px-2 py-0.5 rounded bg-[#8B5CF6]/20 text-[#A78BFA] font-mono text-[9px] font-bold border border-[#8B5CF6]/30 uppercase">
            {email.classification === 'promotional' ? 'Likely Junk' : email.isProtectedByDefault ? 'Important Email' : 'Emails to Check'}
          </span>
        </div>

        <p className="italic text-slate-300 leading-relaxed text-[11px] mb-2 font-sans">
          "{email.aiSummary}"
        </p>

        {/* Safety Check status chip */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono">
          <span className="text-slate-400">Safety Check:</span>
          <span className={`font-semibold ${
            email.isProtectedByDefault
              ? 'text-[#60A5FA]'
              : email.phishingRisk === 'high'
              ? 'text-[#F87171]'
              : 'text-[#FBBF24]'
          }`}>
            {email.isProtectedByDefault
              ? '🛡️ Important Email (Keep safe)'
              : email.phishingRisk === 'high'
              ? '⚠️ Scam Check Warning (Review carefully)'
              : '🔥 Safe to archive'}
          </span>
        </div>
      </div>

      {/* EMAIL BODY PREVIEW */}
      <div className="mb-4 p-3 rounded-xl bg-[#0B0A12]/60 border border-white/5 text-[11px] text-slate-400 leading-relaxed max-h-24 overflow-y-auto font-sans">
        {email.preview}
      </div>

      {/* ACTION CONTROLS / TOOLBAR */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
        {/* See Details button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInspect(email);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-mono text-[10px] transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-[#A78BFA]" />
          <span>See Email Details (Space)</span>
        </button>

        {/* Action hints */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span className="hidden sm:inline">← Archive (A)</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Keep (D) →</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Reply Later (W) ↑</span>
        </div>
      </div>
    </motion.div>
  );
}
