import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Skull, 
  Flame, 
  ShieldCheck, 
  Zap, 
  Trophy, 
  Swords
} from 'lucide-react';
import { BOSS_EMAIL } from '../data/mockEmails';
import GameButton from './GameButton';
import { sounds } from '../audio/soundEffects';

export default function BossBattle({ onBossDefeated, onExit, alreadyDefeated = false }) {
  const [bossHP, setBossHP] = useState(alreadyDefeated ? 0 : BOSS_EMAIL.bossHP);
  const [currentPhase, setCurrentPhase] = useState(alreadyDefeated ? 3 : 1);
  const [isVictor, setIsVictor] = useState(alreadyDefeated);
  const [bossDialogue, setBossDialogue] = useState(
    alreadyDefeated
      ? '“Lord Spammerus has already been defeated! Your inbox is safe.”'
      : '“You dare challenge me? My junk newsletters never stop coming!”'
  );
  const [slashFX, setSlashFX] = useState(false);
  const hasClaimedRef = useRef(alreadyDefeated);

  const phaseInstructions = [
    { phase: 1, requiredAction: 'frost', title: 'Phase 1: Freeze His Shield', hint: 'Use Keep Email to freeze his shield!' },
    { phase: 2, requiredAction: 'volt', title: 'Phase 2: Slow Down the Auto-Mailer', hint: 'Use Reply Later to short-circuit his machine!' },
    { phase: 3, requiredAction: 'inferno', title: 'Phase 3: Clean Up the Core Spambot', hint: 'Use Archive Email to archive the spambot once and for all!' }
  ];

  const currentPhaseData = phaseInstructions[currentPhase - 1] || phaseInstructions[2];

  const handleStrike = (actionType) => {
    if (alreadyDefeated || isVictor) return;

    setSlashFX(true);
    setTimeout(() => setSlashFX(false), 400);

    if (actionType === currentPhaseData.requiredAction) {
      if (actionType === 'frost') sounds.playFrostEffect();
      else if (actionType === 'volt') sounds.playVoltEffect();
      else sounds.playFireEffect();

      const newHP = bossHP - 1;
      setBossHP(newHP);

      if (newHP <= 0) {
        sounds.playLevelUp();
        setIsVictor(true);
        setBossDialogue('“NOOO! MY SPAM NEWSLETTERS ARE DISAPPEARING! YOU CLEANED THE INBOX!”');
        
        if (!hasClaimedRef.current) {
          hasClaimedRef.current = true;
          setTimeout(() => {
            if (onBossDefeated) {
              onBossDefeated({
                xp: BOSS_EMAIL.xpReward,
                gold: BOSS_EMAIL.goldReward,
              });
            }
          }, 1500);
        }
      } else {
        sounds.playBossRoar();
        setCurrentPhase(prev => prev + 1);
        if (newHP === 2) {
          setBossDialogue('“Ouch! My shield is gone, but I am sending more junk emails!”');
        } else if (newHP === 1) {
          setBossDialogue('“Argh! My auto-mailer is broken! One more hit will finish me!”');
        }
      }
    } else {
      sounds.playWarningAlert();
      setBossDialogue(`“Hahaha! That move doesn't work right now! Read the instruction above!”`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto">
      {/* Background Nebula */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-red-700/20 rounded-full blur-[140px]" />
      </div>

      {slashFX && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          className="fixed inset-0 bg-red-500/25 pointer-events-none z-50"
        />
      )}

      {/* Main Card Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-xl bg-[#11101B] border-2 border-[#F87171]/50 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] z-10 font-sans"
      >
        {/* BOSS HEADER */}
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-xs font-mono text-red-300">
            <Skull className="w-3.5 h-3.5 animate-pulse" />
            <span>Big Email Challenge</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-black text-white">
            {BOSS_EMAIL.bossName}
          </h2>

          <div className="max-w-md mx-auto space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Boss Health</span>
              <span className="text-[#F87171] font-bold">{bossHP} / {BOSS_EMAIL.bossHP}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#1B1728] border border-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-600 to-[#F87171]"
                initial={{ width: '100%' }}
                animate={{ width: `${(bossHP / BOSS_EMAIL.bossHP) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* BOSS DIALOGUE BUBBLE */}
        <div className="mb-6 p-4 rounded-2xl bg-[#1B1728] border border-white/5 text-center">
          <p className="text-sm italic text-amber-200">
            {bossDialogue}
          </p>
        </div>

        {/* BATTLE PHASE OBJECTIVE */}
        {!isVictor ? (
          <div className="mb-6 p-4 rounded-2xl bg-[#1B1728] border border-[#8B5CF6]/30 space-y-3">
            <div className="flex items-center gap-2 text-[#FBBF24] font-heading text-xs font-bold uppercase tracking-wider">
              <Swords className="w-4 h-4 text-[#FBBF24]" />
              <span>{currentPhaseData.title}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {currentPhaseData.hint}
            </p>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <GameButton
                variant="frost"
                size="md"
                icon={ShieldCheck}
                onClick={() => handleStrike('frost')}
                disabled={slashFX}
              >
                Keep Email
              </GameButton>

              <GameButton
                variant="volt"
                size="md"
                icon={Zap}
                onClick={() => handleStrike('volt')}
                disabled={slashFX}
              >
                Reply Later
              </GameButton>

              <GameButton
                variant="blaze"
                size="md"
                icon={Flame}
                onClick={() => handleStrike('inferno')}
                disabled={slashFX}
              >
                Archive Email
              </GameButton>
            </div>
          </div>
        ) : (
          /* VICTORY BANNER */
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-6 rounded-2xl bg-[#1B1728] border-2 border-[#FBBF24] text-center space-y-3 shadow-xl"
          >
            <Trophy className="w-12 h-12 text-[#FBBF24] mx-auto animate-bounce" />
            <h3 className="font-heading text-2xl font-black text-white">
              {alreadyDefeated ? 'CHALLENGE ALREADY WON!' : 'YOU WON THE CHALLENGE!'}
            </h3>
            <p className="text-xs text-amber-200">
              {alreadyDefeated ? 'Lord Spammerus was already defeated!' : 'You cleared the Big Email Challenge and defeated Lord Spammerus!'}
            </p>
            {!alreadyDefeated && (
              <div className="flex justify-center gap-4 text-xs font-mono font-bold text-[#FBBF24] pt-2">
                <span>+{BOSS_EMAIL.xpReward} BONUS XP</span>
                <span>•</span>
                <span>+{BOSS_EMAIL.goldReward} GOLD REWARD</span>
              </div>
            )}

            <div className="pt-3">
              <GameButton
                variant="primary"
                size="lg"
                onClick={onExit}
              >
                Claim Reward & Continue
              </GameButton>
            </div>
          </motion.div>
        )}

        {/* BACK TO GAME */}
        {!isVictor && (
          <div className="text-center pt-2">
            <button
              onClick={onExit}
              className="font-heading text-xs text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Regular Emails
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
