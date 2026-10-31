import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Flame, 
  ShieldCheck, 
  Zap, 
  Shield, 
  FileText
} from 'lucide-react';
import GameButton from './GameButton';
import { sounds } from '../audio/soundEffects';

export default function GuardianProtocolModal({
  isOpen,
  email,
  onClose,
  onConfirmAction,
  warningMode = false,
}) {
  if (!isOpen || !email) return null;

  const handleAction = (actionType) => {
    onConfirmAction(actionType, email);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          className="relative w-full max-w-2xl bg-[#11101B] border-2 border-[#8B5CF6]/50 rounded-2xl p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.9)] z-10 overflow-hidden my-8"
        >
          {/* Close button */}
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* HEADER & WARNING BANNER */}
          <div className="mb-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#1B1728] border border-[#8B5CF6]/40 text-[#A78BFA] font-heading text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#FBBF24]" />
                <span>Email Safety Check</span>
              </span>
              {email.phishingRisk === 'high' && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-500 text-rose-300 font-heading text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Scam Check Warning</span>
                </span>
              )}
            </div>

            {warningMode && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/80 text-amber-200 text-xs flex items-start gap-2.5 font-sans">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-heading text-sm">
                    Please Check This Email First:
                  </strong>
                  <p className="text-amber-200/90 text-xs mt-0.5 leading-relaxed">
                    This email looks important or might be a scam. We paused so you can read it carefully before deciding what to do.
                  </p>
                </div>
              </div>
            )}

            <h3 className="font-heading text-2xl font-bold text-white tracking-tight">
              {email.subject}
            </h3>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-sans">
              <span><strong>From:</strong> {email.sender}</span>
              <span><strong>Date:</strong> {email.date}</span>
              <span><strong>Size:</strong> {email.size}</span>
            </div>
          </div>

          {/* SIMPLE SENDER & SCAM CHECK */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4 bg-[#1B1728] p-3.5 rounded-xl border border-white/5 text-xs font-sans">
            {/* Sender Check */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Sender Check</span>
              <div className="flex items-center gap-1.5 font-semibold">
                {email.phishingRisk === 'high' ? (
                  <span className="text-rose-400 flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Unverified / Fake
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Sender
                  </span>
                )}
              </div>
            </div>

            {/* Website Trust */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Website Trust</span>
              <div className="flex items-center gap-1.5 font-semibold">
                {email.phishingRisk === 'high' ? (
                  <span className="text-rose-400">Untrusted / Warning</span>
                ) : (
                  <span className="text-emerald-400">Trusted Sender</span>
                )}
              </div>
            </div>

            {/* Scam Risk */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Scam Check</span>
              <div className="font-semibold">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  email.phishingRisk === 'high'
                    ? 'bg-rose-950 text-rose-300 border border-rose-500'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                }`}>
                  {email.phishingRisk === 'high' ? 'High Risk' : 'Low Risk'}
                </span>
              </div>
            </div>
          </div>

          {/* AI SUMMARY BOX */}
          <div className="mb-4 bg-[#1B1728] rounded-xl p-3.5 border border-white/5 space-y-2 text-xs font-sans">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#FBBF24] font-mono font-bold text-[11px] uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Email Check</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#8B5CF6]/20 text-[#A78BFA] font-mono text-[10px] font-bold border border-[#8B5CF6]/30">
                {email.classification === 'promotional' ? 'Likely Junk' : email.isProtectedByDefault ? 'Important Email' : 'Emails to Check'}
              </span>
            </div>

            <p className="text-slate-300 italic text-xs leading-relaxed">
              "{email.aiSummary}"
            </p>

            {/* Safety Check Decision */}
            <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono">
              <span className="text-slate-400">Safety Check Advice:</span>
              <span className="font-bold text-[#FBBF24]">
                {email.isProtectedByDefault ? '🛡️ Important Email (Keep safe)' : '⚡ You decide what to do'}
              </span>
            </div>
          </div>

          {/* FULL EMAIL TEXT */}
          <div className="mb-5 space-y-1.5">
            <span className="font-heading text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Email Body</span>
            </span>
            <div className="max-h-44 overflow-y-auto p-4 rounded-xl bg-[#0B0A12] border border-white/5 text-slate-300 text-xs font-sans whitespace-pre-line leading-relaxed">
              {email.bodyText}
            </div>
          </div>

          {/* SAFETY ADVICE */}
          <div className="mb-6 p-3 rounded-lg bg-[#1B1728] border border-white/5 text-xs text-slate-400 flex items-center gap-2 font-sans">
            <Shield className="w-4 h-4 text-[#8B5CF6] shrink-0" />
            <span>
              Never click links or enter passwords from suspicious emails. When in doubt, leave it in your inbox or ask an adult.
            </span>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
            <GameButton
              variant="dark"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </GameButton>

            <div className="flex flex-wrap items-center gap-2">
              <GameButton
                variant="frost"
                size="sm"
                icon={ShieldCheck}
                onClick={() => handleAction('frost')}
              >
                Keep Email
              </GameButton>

              <GameButton
                variant="volt"
                size="sm"
                icon={Zap}
                onClick={() => handleAction('volt')}
              >
                Reply Later
              </GameButton>

              <GameButton
                variant="blaze"
                size="sm"
                icon={Flame}
                onClick={() => handleAction('inferno')}
                className={warningMode ? 'border-2 border-red-500' : ''}
              >
                Archive Email
              </GameButton>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
