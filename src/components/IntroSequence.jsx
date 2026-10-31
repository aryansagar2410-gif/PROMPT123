import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, FastForward, Sparkles, ChevronRight, Eye } from 'lucide-react';
import CharacterAvatar from './CharacterAvatar';
import GameButton from './GameButton';
import { sounds } from '../audio/soundEffects';
import { useSound } from '../hooks/useSound';
import { ArcaneParticles } from './RuneDecorations';

export default function IntroSequence({ onFinish }) {
  const navigate = useNavigate();
  const { isMuted, toggleSound } = useSound();
  const [stage, setStage] = useState(0); 
  // 0: Dark & Gate Apparition
  // 1: Gate Opening & Arcane Rift
  // 2: Elemental Guardians (Blaze, Frost, Volt)
  // 3: Elder Byte Welcome Dialogue
  // 4: Grand Title Reveal

  const [reducedMotion, setReducedMotion] = useState(false);
  const [elderDialogueIndex, setElderDialogueIndex] = useState(0);

  const elderDialogues = [
    "“Greetings, brave adventurer! You are at the entrance to the Inbox Zero Dungeon.”",
    "“Tons of junk emails, newsletters, and clutter are piling up in your inbox.”",
    "“Three friendly elemental guardians are here to help you clean it up and reach Inbox Zero!”"
  ];

  // Progression timer for cinematic flow
  useEffect(() => {
    let t1, t2, t3, t4;

    // Stage 0: Initial Gate Reveal
    sounds.playGateRumble();

    // Move to gate opening after 1.8s
    t1 = setTimeout(() => {
      setStage(1);
      sounds.playGateOpen();
    }, 1800);

    // Move to Guardian Showcase after 4.8s
    t2 = setTimeout(() => {
      setStage(2);
      sounds.playFireEffect();
      setTimeout(() => sounds.playFrostEffect(), 800);
      setTimeout(() => sounds.playVoltEffect(), 1600);
    }, 4800);

    // Move to Elder Byte after 8.8s
    t3 = setTimeout(() => {
      setStage(3);
      sounds.playElderByteChime();
    }, 8800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const handleSkip = () => {
    sounds.playClick();
    if (onFinish) {
      onFinish();
    } else {
      navigate('/landing');
    }
  };

  const handleNextDialogue = () => {
    sounds.playClick();
    if (elderDialogueIndex < elderDialogues.length - 1) {
      setElderDialogueIndex(prev => prev + 1);
    } else {
      setStage(4);
      sounds.playLevelUp();
    }
  };

  const handleEnterCitadel = () => {
    sounds.playGateOpen();
    if (onFinish) {
      onFinish();
    } else {
      navigate('/landing');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030407] text-slate-100 flex flex-col justify-between overflow-hidden select-none">
      
      {/* Top Utility Bar (Skip Intro, Audio, Reduced Motion) */}
      <div className="relative z-50 p-4 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="font-cinzel text-xs font-bold tracking-widest text-amber-300 uppercase">
            PROLOGUE: THE INBOX CATACOMBS
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Reduced Motion Toggle */}
          <button
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-cinzel tracking-wider flex items-center gap-1.5 transition-all ${
              reducedMotion 
                ? 'border-amber-400 text-amber-300 bg-amber-950/40' 
                : 'border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Reduced Motion"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reduced Motion: {reducedMotion ? 'ON' : 'OFF'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-dungeon-900 border border-purple-900/60 hover:border-purple-400 text-purple-300 hover:text-amber-300 transition-all"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Skip Intro */}
          <button
            onClick={handleSkip}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-cinzel text-xs font-bold tracking-wider uppercase bg-dungeon-800/90 hover:bg-dungeon-700 border border-slate-700 text-amber-300 hover:text-white transition-all shadow-md"
          >
            <span>Skip Intro</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Cinematic Viewport */}
      <div className="relative flex-1 flex items-center justify-center p-4">
        
        {/* Background Atmospheric Layers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Purple Arcane Nebula */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-purple-700/20 rounded-full blur-[140px]" />
          <ArcaneParticles count={35} color="rgba(192, 132, 252, 0.5)" />
        </div>

        {/* STAGES 0 & 1: THE ANCIENT DUNGEON GATE */}
        {(stage === 0 || stage === 1) && (
          <div className="relative w-full max-w-4xl h-[460px] sm:h-[520px] flex items-center justify-center">
            
            {/* Brilliant Arcane Light Beams from Behind the Gate */}
            {stage === 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1.15 }}
                transition={{ duration: 1.8 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="w-[320px] sm:w-[480px] h-[320px] sm:h-[480px] rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-amber-300 blur-3xl opacity-60 animate-pulse" />
                <div className="absolute font-medieval text-5xl sm:text-7xl font-black text-amber-300/40 tracking-[0.2em] blur-[2px] select-none">
                  ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ
                </div>
              </motion.div>
            )}

            {/* Ancient Dungeon Gate Frame (Arch) */}
            <div className="relative w-[340px] sm:w-[480px] h-full border-4 border-slate-800 rounded-t-full bg-dungeon-950/80 shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex">
              
              {/* Left Massive Stone Door */}
              <motion.div
                initial={{ x: 0 }}
                animate={stage === 1 ? { x: reducedMotion ? '-75%' : '-94%' } : { x: 0 }}
                transition={{ duration: reducedMotion ? 1.5 : 2.8, ease: [0.65, 0, 0.35, 1] }}
                className="w-1/2 h-full bg-gradient-to-br from-[#1b1e2a] via-[#0d1018] to-[#06080d] border-r-2 border-amber-500/40 relative flex flex-col justify-between p-4"
              >
                {/* Iron Hinges & Runes */}
                <div className="w-8 h-3 bg-amber-700/60 rounded border border-amber-400/50" />
                <div className="text-center font-medieval text-2xl text-purple-400/40 select-none">ᚱᚢᚾ</div>
                <div className="w-8 h-3 bg-amber-700/60 rounded border border-amber-400/50" />
                
                {/* Massive iron knocker ring */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-4 border-slate-600 bg-slate-900 shadow-inner" />
              </motion.div>

              {/* Right Massive Stone Door */}
              <motion.div
                initial={{ x: 0 }}
                animate={stage === 1 ? { x: reducedMotion ? '75%' : '94%' } : { x: 0 }}
                transition={{ duration: reducedMotion ? 1.5 : 2.8, ease: [0.65, 0, 0.35, 1] }}
                className="w-1/2 h-full bg-gradient-to-bl from-[#1b1e2a] via-[#0d1018] to-[#06080d] border-l-2 border-amber-500/40 relative flex flex-col justify-between p-4"
              >
                <div className="w-8 h-3 bg-amber-700/60 rounded border border-amber-400/50 ml-auto" />
                <div className="text-center font-medieval text-2xl text-purple-400/40 select-none">ᛋᛏᛟ</div>
                <div className="w-8 h-3 bg-amber-700/60 rounded border border-amber-400/50 ml-auto" />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-4 border-slate-600 bg-slate-900 shadow-inner" />
              </motion.div>
            </div>

            {/* Caption underneath gate */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-8 text-center"
            >
              <p className="font-cinzel text-xs tracking-[0.3em] text-slate-400 uppercase">
                {stage === 0 ? "Approaching The Iron Sanctum..." : "The Ancient Seal Breaks..."}
              </p>
            </motion.div>
          </div>
        )}

        {/* STAGE 2: THE ELEMENTAL TRIAD (BLAZE, FROST, VOLT) */}
        {stage === 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-5xl text-center space-y-6"
          >
            <div className="space-y-1">
              <span className="font-cinzel text-xs font-bold text-amber-400 tracking-[0.3em] uppercase">
                YOUR TEAM IS READY
              </span>
              <h2 className="font-medieval text-3xl sm:text-4xl text-white tracking-wide">
                Meet The Elemental Guardians
              </h2>
              <p className="text-xs text-slate-400 font-cinzel">
                Here to help you clean up and protect your inbox
              </p>
            </div>

            {/* 3 Guardian Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {/* BLAZE */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-dungeon-900/90 rounded-2xl border border-orange-500/40 p-5 shadow-[0_0_30px_rgba(249,115,22,0.3)] flex flex-col items-center"
              >
                <div className="relative mb-3">
                  <div className="absolute inset-0 bg-orange-600/30 rounded-full blur-xl animate-pulse" />
                  <CharacterAvatar id="blaze" size="lg" animated={!reducedMotion} />
                </div>
                <div className="font-medieval text-xl font-bold text-orange-400">BLAZE</div>
                <div className="font-cinzel text-xs text-amber-300 font-semibold mb-2">Fire Guardian</div>
                <span className="px-2 py-0.5 rounded-full bg-orange-950/80 border border-orange-500/50 text-[10px] font-cinzel text-orange-300 font-bold uppercase tracking-wider mb-2">
                  Archive Email
                </span>
                <p className="text-xs text-slate-300 italic">
                  “Moves junk and unwanted emails out of your inbox into the archive!”
                </p>
              </motion.div>

              {/* FROST */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-dungeon-900/90 rounded-2xl border border-cyan-500/40 p-5 shadow-[0_0_30px_rgba(6,182,212,0.3)] flex flex-col items-center"
              >
                <div className="relative mb-3">
                  <div className="absolute inset-0 bg-cyan-600/30 rounded-full blur-xl animate-pulse" />
                  <CharacterAvatar id="frost" size="lg" animated={!reducedMotion} />
                </div>
                <div className="font-medieval text-xl font-bold text-cyan-400">FROST</div>
                <div className="font-cinzel text-xs text-cyan-300 font-semibold mb-2">Ice Guardian</div>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-[10px] font-cinzel text-cyan-300 font-bold uppercase tracking-wider mb-2">
                  Keep Email
                </span>
                <p className="text-xs text-slate-300 italic">
                  “Keeps your important school, bank, and security emails safe!”
                </p>
              </motion.div>

              {/* VOLT */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="bg-dungeon-900/90 rounded-2xl border border-purple-500/40 p-5 shadow-[0_0_30px_rgba(168,85,247,0.3)] flex flex-col items-center"
              >
                <div className="relative mb-3">
                  <div className="absolute inset-0 bg-purple-600/30 rounded-full blur-xl animate-pulse" />
                  <CharacterAvatar id="volt" size="lg" animated={!reducedMotion} />
                </div>
                <div className="font-medieval text-xl font-bold text-purple-400">VOLT</div>
                <div className="font-cinzel text-xs text-fuchsia-300 font-semibold mb-2">Storm Guardian</div>
                <span className="px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/50 text-[10px] font-cinzel text-purple-300 font-bold uppercase tracking-wider mb-2">
                  Reply Later
                </span>
                <p className="text-xs text-slate-300 italic">
                  “Labels emails with a tag so you can easily reply to them later!”
                </p>
              </motion.div>
            </div>

            <div className="pt-4">
              <GameButton
                variant="elder"
                size="md"
                onClick={() => {
                  setStage(3);
                  sounds.playElderByteChime();
                }}
              >
                Meet Elder Byte
              </GameButton>
            </div>
          </motion.div>
        )}

        {/* STAGE 3: ELDER BYTE DIALOGUE */}
        {stage === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-dungeon-900/95 border-2 border-amber-400/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(251,191,36,0.3)] backdrop-blur-xl relative"
          >
            {/* Corner runes */}
            <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400" />
            <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
            <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400" />
            <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400" />

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Elder Byte Avatar */}
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-2xl animate-pulse" />
                <CharacterAvatar id="elderByte" size="xl" animated={!reducedMotion} />
              </div>

              {/* Dialogue speech */}
              <div className="flex-1 text-center sm:text-left space-y-3">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="font-medieval text-xl font-bold text-amber-300">
                    ELDER BYTE
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-500/40 text-[10px] font-cinzel text-purple-300 uppercase">
                    Your Wise Guide
                  </span>
                </div>

                <div className="bg-dungeon-950/80 p-4 rounded-xl border border-slate-800 min-h-[90px] flex items-center">
                  <p className="font-serif italic text-base sm:text-lg text-slate-100 leading-relaxed">
                    {elderDialogues[elderDialogueIndex]}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-cinzel text-slate-400">
                    Message {elderDialogueIndex + 1} of {elderDialogues.length}
                  </span>

                  <GameButton
                    variant="primary"
                    size="sm"
                    icon={ChevronRight}
                    onClick={handleNextDialogue}
                  >
                    {elderDialogueIndex < elderDialogues.length - 1 ? 'Continue' : 'Start Your Adventure'}
                  </GameButton>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STAGE 4: GRAND TITLE REVEAL */}
        {stage === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-3xl text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/70 border border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-cinzel text-xs font-bold tracking-[0.25em] text-amber-300 uppercase">
                Welcome To The Game
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="font-medieval text-5xl sm:text-7xl font-black tracking-wider text-gold-gradient drop-shadow-[0_0_35px_rgba(251,191,36,0.5)]">
                INBOX ZERO
              </h1>
              <h2 className="font-cinzel text-3xl sm:text-5xl font-black tracking-[0.3em] text-purple-400 drop-shadow-[0_0_30px_rgba(192,132,252,0.6)]">
                DUNGEON
              </h2>
            </div>

            <p className="font-cinzel text-base sm:text-lg text-slate-300 tracking-wide max-w-xl mx-auto">
              “Your inbox is the dungeon. Become its hero.”
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <GameButton
                variant="primary"
                size="lg"
                onClick={handleEnterCitadel}
              >
                Start Playing
              </GameButton>

              <GameButton
                variant="outline"
                size="lg"
                onClick={() => navigate('/dashboard')}
              >
                Play Demo
              </GameButton>
            </div>
          </motion.div>
        )}

      </div>

      {/* Footer Stage Indicator */}
      <div className="relative z-20 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2, 3, 4].map((step) => (
            <button
              key={step}
              onClick={() => {
                setStage(step);
                sounds.playClick();
              }}
              className={`h-1.5 rounded-full transition-all ${
                stage === step
                  ? 'w-8 bg-amber-400 shadow-[0_0_10px_#fbbf24]'
                  : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              title={`Jump to Cinematic Phase ${step + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

