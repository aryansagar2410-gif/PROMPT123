import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Play, 
  Mail, 
  RotateCcw, 
  Shield, 
  Flame, 
  Zap, 
  ArrowRight,
  CheckCircle2,
  Lock,
  History,
  ShieldCheck
} from 'lucide-react';
import DungeonBackground from '../components/DungeonBackground';
import CharacterCard from '../components/CharacterCard';
import GmailModal from '../components/GmailModal';
import { CHARACTERS } from '../data/characters';
import { sounds } from '../audio/soundEffects';
import { getGmailStatus } from '../services/gmailService';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isGmailModalOpen, setIsGmailModalOpen] = useState(false);
  const [activeCompanionId, setActiveCompanionId] = useState('blaze');
  const [gmailStatus, setGmailStatus] = useState({ connected: false, email: '' });

  useEffect(() => {
    let isMounted = true;
    getGmailStatus().then((res) => {
      if (isMounted) setGmailStatus(res);
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const handlePlayDemo = () => {
    sounds.playLevelUp();
    navigate('/dashboard');
  };

  const handleReplayIntro = () => {
    sounds.playGateOpen();
    navigate('/intro');
  };

  return (
    <DungeonBackground>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-24">
        
        {/* HERO SECTION */}
        <section className="text-center relative pt-4 sm:pt-10 max-w-4xl mx-auto space-y-8">
          
          {/* Friendly Game Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1B1728]/80 border border-[#8B5CF6]/30 shadow-[0_4px_20px_rgba(139,92,246,0.15)] backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-[#FBBF24]" />
            <span className="font-heading text-xs font-semibold tracking-wider text-[#A78BFA] uppercase">
              Fun Fantasy Email Game
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
          </motion.div>

          {/* Game Title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white drop-shadow-sm">
              INBOX ZERO <span className="bg-gradient-to-r from-[#A78BFA] via-[#8B5CF6] to-[#FBBF24] bg-clip-text text-transparent">DUNGEON</span>
            </h1>
          </motion.div>

          {/* Core Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-heading text-xl sm:text-2xl text-slate-200 tracking-normal max-w-3xl mx-auto font-medium leading-relaxed"
          >
            Defeat your email backlog. Save your inbox. Become the Inbox Zero Hero.
          </motion.p>

          <p className="text-base text-slate-400 max-w-2xl mx-auto leading-relaxed font-sans font-normal">
            Clean up your messy inbox by playing a fun RPG game! Swipe or click to archive junk emails, 
            keep important messages safe, and save emails to reply to later.
          </p>

          {/* Call-to-action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* Connect Gmail Button */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsGmailModalOpen(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-heading font-semibold text-base transition-all shadow-[0_10px_30px_rgba(139,92,246,0.35)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <Mail className="w-5 h-5" />
              <span>{gmailStatus.connected ? 'Gmail Connected' : 'Connect Gmail'}</span>
            </button>

            {/* Play Demo Button */}
            <button
              onClick={handlePlayDemo}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#1B1728] hover:bg-[#252038] border border-white/10 hover:border-[#8B5CF6]/50 text-white font-heading font-semibold text-base transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-5 h-5 text-[#FBBF24] fill-[#FBBF24]" />
              <span>Play Demo</span>
            </button>

            {/* Replay Intro */}
            <button
              onClick={handleReplayIntro}
              className="flex items-center gap-2 px-5 py-4 rounded-xl font-heading text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
            >
              <RotateCcw className="w-4 h-4 text-[#A78BFA]" />
              <span>How to Play</span>
            </button>
          </motion.div>

          {/* Simple Mode Status Notice */}
          <div className="pt-2 flex items-center justify-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              {gmailStatus.connected ? `Connected: ${gmailStatus.email}` : 'Demo Mode Ready to Play'}
            </span>
            <span>•</span>
            <span>No Password Needed for Demo</span>
            <span>•</span>
            <span>Safe and Reversible</span>
          </div>
        </section>

        {/* SIMPLE SAFETY & TRUST REASSURANCE */}
        <section className="bg-[#11101B]/90 border border-white/5 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#1B1728] border border-[#8B5CF6]/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-[#22C55E]" />
              </div>
              <div>
                <h4 className="font-heading text-base font-bold text-white">Your Emails Are Always Safe</h4>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  You stay in full control. We never delete your emails permanently.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans text-slate-300 w-full md:w-auto">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1B1728]/60 border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>Archiving does not delete emails</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1B1728]/60 border border-white/5">
                <History className="w-4 h-4 text-[#60A5FA] shrink-0" />
                <span>Undo any move at any time</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1B1728]/60 border border-white/5">
                <Lock className="w-4 h-4 text-[#FBBF24] shrink-0" />
                <span>Safety Check protects important mail</span>
              </div>
            </div>
          </div>
        </section>

        {/* HOW TO PLAY: 3 EASY ACTIONS */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#A78BFA]">
              How to Play
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Three Simple Moves
            </h2>
            <p className="text-sm text-slate-400 font-sans max-w-xl mx-auto">
              Use your keyboard, mouse, or touch screen to organize your emails fast!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Move 1: Archive Email */}
            <div className="bg-[#11101B]/90 border border-white/5 hover:border-[#F87171]/40 rounded-2xl p-6 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-[#F87171]/10 border border-[#F87171]/30 flex items-center justify-center text-[#F87171] group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-lg font-bold text-white">Swipe LEFT: Archive Email</h3>
                  <span className="font-mono text-xs font-bold text-[#F87171]">+20 XP</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Archiving moves an email out of your inbox into All Mail. It does not delete it. Great for newsletters and ads!
                </p>
              </div>
            </div>

            {/* Move 2: Keep Email */}
            <div className="bg-[#11101B]/90 border border-white/5 hover:border-[#60A5FA]/40 rounded-2xl p-6 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-[#60A5FA]/10 border border-[#60A5FA]/30 flex items-center justify-center text-[#60A5FA] group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-lg font-bold text-white">Swipe RIGHT: Keep Email</h3>
                  <span className="font-mono text-xs font-bold text-[#60A5FA]">+10 XP</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Keep means we leave the email as it is. Stars and protects important school, bank, and family messages.
                </p>
              </div>
            </div>

            {/* Move 3: Reply Later */}
            <div className="bg-[#11101B]/90 border border-white/5 hover:border-[#A78BFA]/40 rounded-2xl p-6 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA] group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-lg font-bold text-white">Swipe UP: Reply Later</h3>
                  <span className="font-mono text-xs font-bold text-[#A78BFA]">+15 XP</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Reply Later adds a label. It does not send a reply or set a reminder. Answer it whenever you are ready!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CHARACTER COMPANIONS SHOWCASE */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#FBBF24]">
              Your Helpers
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Meet Your Four Hero Helpers
            </h2>
            <p className="text-sm text-slate-400 font-sans max-w-xl mx-auto">
              Each hero specializes in a different email action to help you clean up your inbox.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.values(CHARACTERS).map((char) => (
              <CharacterCard
                key={char.id}
                character={char}
                isActive={activeCompanionId === char.id}
                onSelect={(id) => setActiveCompanionId(id)}
              />
            ))}
          </div>
        </section>

        {/* BOTTOM CTA BANNER */}
        <section className="bg-gradient-to-r from-[#1B1728] via-[#241E36] to-[#1B1728] border border-[#8B5CF6]/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              Ready to Clean Your Inbox?
            </h2>
            <p className="text-sm text-slate-300 font-sans">
              Enter your dashboard, check your emails with AI, and start playing!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handlePlayDemo}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-heading font-semibold text-sm transition-all shadow-[0_10px_25px_rgba(139,92,246,0.3)]"
            >
              <span>Start Game</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

      </div>

      {/* Gmail OAuth Modal */}
      <GmailModal
        isOpen={isGmailModalOpen}
        onClose={() => setIsGmailModalOpen(false)}
      />
    </DungeonBackground>
  );
}
