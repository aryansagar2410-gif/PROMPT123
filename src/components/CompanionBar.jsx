import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CharacterAvatar from './CharacterAvatar';
import { CHARACTERS } from '../data/characters';

export default function CompanionBar({
  activeCompanionId = 'blaze',
  lastAction = null,
  currentEmail = null,
  comboCount = 0,
}) {
  const companion = CHARACTERS[activeCompanionId] || CHARACTERS.blaze;

  // Compute reactive dialogue based on state
  const getDialogue = () => {
    // If combo is high
    if (comboCount >= 10) {
      return '“Awesome streak! 10 in a row! You are unstoppable!”';
    }
    if (comboCount >= 5) {
      return '“Great streak! Keep cleaning up those emails!”';
    }

    // If current email is a phishing threat, Elder Byte / Companion warning
    if (currentEmail && currentEmail.phishingRisk === 'high') {
      return '“⚠️ Watch out! This email might be a scam. Please check it before taking action!”';
    }

    // If current email is VIP / critical banking
    if (currentEmail && currentEmail.importance === 'critical') {
      return '“Important email! This looks like a receipt, password, or school notice. Keep it safe!”';
    }

    // Based on last action
    if (lastAction === 'inferno') {
      if (activeCompanionId === 'blaze') {
        return '“Woosh! Archived and out of your way! Your inbox is getting cleaner!”';
      }
      return '“Moved to archive! Your inbox clutter is going down.”';
    }

    if (lastAction === 'frost') {
      if (activeCompanionId === 'frost') {
        return '“Safe and sound! This important email stays right where you need it.”';
      }
      return '“Email kept safe in your inbox.”';
    }

    if (lastAction === 'volt') {
      if (activeCompanionId === 'volt') {
        return '“Zap! Saved for later! You can reply when you have more time.”';
      }
      return '“Saved for later with a reminder tag.”';
    }

    if (lastAction === 'rewind') {
      return '“Move undone! Your last email has been brought right back.”';
    }

    // Default idling quote
    return companion.voiceLine;
  };

  return (
    <div className="relative flex items-center gap-3 bg-dungeon-900/80 rounded-2xl border border-purple-500/30 p-3 sm:p-4 shadow-[0_0_20px_rgba(168,85,247,0.15)] backdrop-blur-md">
      {/* Corner metallic clips */}
      <span className="absolute top-1 left-1 w-2.5 h-2.5 border-t border-l border-amber-400 pointer-events-none" />
      <span className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b border-r border-amber-400 pointer-events-none" />

      {/* Companion Avatar */}
      <div className="relative shrink-0">
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-50"
          style={{ backgroundColor: companion.primaryColor }}
        />
        <CharacterAvatar id={activeCompanionId} size="sm" animated={true} />
      </div>

      {/* Speech Bubble */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medieval text-xs font-bold text-white tracking-wider">
            {companion.name}
          </span>
          <span className="text-[10px] font-cinzel text-amber-400 uppercase tracking-wider font-semibold">
            {companion.title}
          </span>
          {comboCount >= 3 && (
            <span className="ml-auto px-2 py-0.2 rounded-full bg-amber-500/20 border border-amber-400/50 text-[10px] font-cinzel font-bold text-amber-300 animate-pulse">
              STREAK x{comboCount}
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={getDialogue()}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="text-xs text-slate-300 italic truncate sm:whitespace-normal"
          >
            {getDialogue()}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

