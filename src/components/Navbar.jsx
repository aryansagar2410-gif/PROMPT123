import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Volume2, VolumeX, Shield, Sparkles, Menu, X, Flame, Mail, Cloud, Radio, Swords, Zap, CheckCircle2, User } from 'lucide-react';
import { useSound } from '../hooks/useSound';
import { MOCK_PLAYER } from '../data/mockData';
import { getGmailStatus } from '../services/gmailService';
import { fetchPlayerProfile } from '../services/persistenceService';

export default function Navbar({ onOpenGmailModal }) {
  const location = useLocation();
  const { isMuted, toggleSound } = useSound();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gmailStatus, setGmailStatus] = useState({ connected: false, email: '' });
  const [playerName, setPlayerName] = useState(MOCK_PLAYER.name);
  const [playerLevel, setPlayerLevel] = useState(MOCK_PLAYER.level);
  const [playerXP, setPlayerXP] = useState(MOCK_PLAYER.currentXP);
  const maxXP = 6000;

  const navLinks = [
    { name: 'Home', path: '/landing' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'AI Email Check', path: '/scan' },
    { name: 'Battle Arena', path: '/battle' },
  ];

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      try {
        const [gStatus, profile] = await Promise.all([
          getGmailStatus(),
          fetchPlayerProfile(),
        ]);
        if (isMounted) {
          setGmailStatus(gStatus || { connected: false });
          if (profile?.displayName) setPlayerName(profile.displayName);
          if (profile?.level) setPlayerLevel(profile.level);
          if (profile?.totalXP != null) setPlayerXP(profile.totalXP);
        }
      } catch (err) {
        if (isMounted) setGmailStatus({ connected: false });
      }
    }
    checkStatus();
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const xpPercentage = Math.min(100, Math.round((playerXP / maxXP) * 100));

  return (
    <header className="sticky top-0 z-50 w-full h-[68px] border-b border-[#1B1728] bg-[#11101B]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
        
        {/* 1. Product Identity */}
        <Link 
          to="/landing" 
          className="flex items-center gap-3 group select-none shrink-0"
        >
          <div className="relative w-9 h-9 rounded-xl bg-[#1B1728] border border-[#8B5CF6]/40 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.25)] group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-[#FBBF24]" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#22C55E]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-base font-bold tracking-tight text-white">
                INBOX ZERO
              </span>
              <span className="font-heading text-xs font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30">
                DUNGEON
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 hidden sm:block">
              Defeat Your Email Backlog
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3.5 py-1.5 font-heading text-xs font-semibold tracking-wide transition-all rounded-lg ${
                  active
                    ? 'text-white bg-[#1B1728] border border-[#8B5CF6]/40 shadow-[0_0_10px_rgba(139,92,246,0.15)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#8B5CF6]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* 2. Gmail Status + 3. Player Profile + 4. Current Level + 5. XP Indicator */}
        <div className="flex items-center gap-3">
          
          {/* 2. Gmail Connection Status */}
          <button
            onClick={onOpenGmailModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              gmailStatus.connected
                ? 'bg-[#22C55E]/10 border-[#22C55E]/40 text-[#22C55E] hover:bg-[#22C55E]/20'
                : 'bg-[#1B1728] border-white/10 text-slate-400 hover:text-white hover:border-[#8B5CF6]/40'
            }`}
            title={gmailStatus.connected ? `Connected: ${gmailStatus.email}` : 'Click to connect real Gmail'}
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden md:inline truncate max-w-[120px]">
              {gmailStatus.connected ? gmailStatus.email : 'Demo Mode'}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${gmailStatus.connected ? 'bg-[#22C55E]' : 'bg-slate-500'}`} />
          </button>

          {/* 3. Player Profile & 4. Level & 5. XP Indicator */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#1B1728] border border-white/10 hover:border-[#8B5CF6]/40 transition-all text-xs"
            title="Player Profile"
          >
            {/* Player Avatar */}
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
              <User className="w-3.5 h-3.5" />
            </div>

            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-semibold text-white truncate max-w-[90px]">
                  {playerName}
                </span>
                {/* 4. Current Level */}
                <span className="px-1.5 py-0.2 rounded bg-[#FBBF24]/20 text-[#FBBF24] font-mono text-[10px] font-bold border border-[#FBBF24]/30">
                  LVL {playerLevel}
                </span>
              </div>
              {/* 5. XP Indicator */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-16 h-1.5 rounded-full bg-[#0B0A12] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#FBBF24]"
                    style={{ width: `${xpPercentage}%` }}
                  />
                </div>
                <span className="font-mono text-[9px] text-slate-400">
                  {playerXP.toLocaleString()} XP
                </span>
              </div>
            </div>
          </Link>

          {/* Sound Toggle Button */}
          <button
            onClick={toggleSound}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2 rounded-lg bg-[#1B1728] border border-white/10 hover:border-[#8B5CF6]/40 text-slate-300 hover:text-white transition-all"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-[#F87171]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#22C55E]" />
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#1B1728] border border-white/10 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#1B1728] bg-[#11101B] px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-heading font-semibold ${
                isActive(link.path)
                  ? 'bg-[#1B1728] text-white border border-[#8B5CF6]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenGmailModal();
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-mono text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/30"
          >
            {gmailStatus.connected ? `Gmail: ${gmailStatus.email}` : 'Connect Real Gmail'}
          </button>
        </div>
      )}
    </header>
  );
}
