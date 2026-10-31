import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Swords, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Zap, 
  Crown, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Trophy,
  History,
  Mail,
  Cloud,
  Database,
  X,
  LayoutDashboard,
  Radar,
  Award,
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Lock,
  ArrowRight,
  Shield,
  Clock,
  Compass
} from 'lucide-react';
import DungeonBackground from '../components/DungeonBackground';
import XPBar from '../components/XPBar';
import PollutionMeter from '../components/PollutionMeter';
import CharacterCard from '../components/CharacterCard';
import AchievementBadge from '../components/AchievementBadge';
import GmailModal from '../components/GmailModal';
import { CHARACTERS } from '../data/characters';
import { ACHIEVEMENTS } from '../data/achievements';
import { MOCK_PLAYER, MOCK_DUNGEON_METRICS, MOCK_RECENT_ACTIVITY } from '../data/mockData';
import { MOCK_EMAILS } from '../data/mockEmails';
import { scanEmailBatch } from '../services/aiService';
import { getGmailStatus, fetchGmailMessages } from '../services/gmailService';
import { 
  getPersistenceStatus, 
  fetchPlayerProfile, 
  loadLatestSession, 
  fetchAchievements,
  updatePlayerProfile,
  fetchPlayerSettings,
  savePlayerSettings
} from '../services/persistenceService';
import { sounds } from '../audio/soundEffects';
import { useSound } from '../hooks/useSound';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isMuted, toggleSound } = useSound();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'achievements' | 'settings'

  // Player & Gameplay State
  const [player, setPlayer] = useState(MOCK_PLAYER);
  const [metrics, setMetrics] = useState(MOCK_DUNGEON_METRICS);
  const [activities, setActivities] = useState(MOCK_RECENT_ACTIVITY);
  const [activeCompanionId, setActiveCompanionId] = useState('blaze');
  const [isGmailModalOpen, setIsGmailModalOpen] = useState(false);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiScanResult, setAiScanResult] = useState(null);

  // Phase 4 & 5 Persistence & Gmail State
  const [gmailStatus, setGmailStatus] = useState({ connected: false, email: '' });
  const [realInboxStats, setRealInboxStats] = useState(null);
  const [persistenceStatus, setPersistenceStatus] = useState({
    configured: false,
    connected: false,
    storageType: 'local-sanctum-cache',
    projectId: 'inbox-zero-dungeon-local',
  });
  const [savedAchievements, setSavedAchievements] = useState([]);
  const [latestSession, setLatestSession] = useState(null);
  const [userSettings, setUserSettings] = useState({
    soundEnabled: true,
    reducedMotion: false,
    difficulty: 'apprentice',
    autoArchivePreference: false,
  });

  const activeCompanion = CHARACTERS[activeCompanionId] || CHARACTERS.blaze;

  // Load persistent profile, session, achievements & Gmail status
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        // 1. Persistence & Cloud Status
        const pStatus = await getPersistenceStatus();
        if (isMounted) setPersistenceStatus(pStatus);

        const profile = await fetchPlayerProfile();
        if (isMounted && profile) {
          setPlayer((prev) => ({
            ...prev,
            name: profile.displayName || prev.name,
            level: profile.level || prev.level,
            currentXP: profile.totalXP ?? prev.currentXP,
            gold: profile.gold ?? prev.gold,
          }));

          setMetrics((prev) => ({
            ...prev,
            totalEmailsScanned: profile.totalReviewed || prev.totalEmailsScanned,
            junkDetected: profile.totalArchived || prev.junkDetected,
            emailsProtected: profile.totalKept || prev.emailsProtected,
            pendingReplies: profile.totalReplyLater || prev.pendingReplies,
          }));
        }

        // 2. Achievements & Latest Session
        const [achData, sessionData, settingsData] = await Promise.all([
          fetchAchievements(),
          loadLatestSession(),
          fetchPlayerSettings(),
        ]);
        if (isMounted) {
          setSavedAchievements(achData || []);
          setLatestSession(sessionData);
          if (settingsData) setUserSettings(settingsData);
        }

        // 3. Gmail Status & Live Messages
        const gStatus = await getGmailStatus();
        if (isMounted) {
          setGmailStatus(gStatus);
          if (gStatus.connected) {
            const msgs = await fetchGmailMessages(50);
            if (isMounted && msgs && msgs.messages) {
              setRealInboxStats({
                totalFetched: msgs.total,
                messages: msgs.messages,
                email: gStatus.email,
              });
              setMetrics((prev) => ({
                ...prev,
                totalEmailsScanned: msgs.total,
                junkDetected: msgs.messages.filter((m) => m.classification === 'promotional').length,
                emailsProtected: msgs.messages.filter((m) => m.isProtectedByDefault).length,
              }));
            }
          }
        }
      } catch (err) {
        console.warn('[Dashboard] Data load notice:', err.message);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [isGmailModalOpen]);

  // AI Scan trigger
  const handleRunAiScan = async () => {
    setIsAiScanning(true);
    sounds.playElderByteChime();

    try {
      const emailsToScan = realInboxStats?.messages?.length
        ? realInboxStats.messages.slice(0, 8)
        : MOCK_EMAILS;

      const scanData = await scanEmailBatch(emailsToScan, { userEnabledAutoArchive: false });
      setAiScanResult(scanData);
      sounds.playLevelUp();

      // Add to expedition activity feed
      const newAct = {
        id: `act-${Date.now()}`,
        time: 'Just now',
        guardian: 'elderByte',
        action: 'Gemini AI Core: Scan Completed',
        details: `Scanned ${scanData.totalScanned} scrolls (${gmailStatus.connected ? 'Live Gmail' : 'Demo Realm'}): ${scanData.obviousKeepCount} marked keep, ${scanData.obviousJunkCount} obvious-junk, ${scanData.ambiguousCount} routed to Arena.`,
        xpGained: 250,
        type: 'boss',
      };
      setActivities((prev) => [newAct, ...prev]);

      // Update persistent player XP
      const updatedXP = player.currentXP + 250;
      setPlayer((prev) => ({ ...prev, currentXP: updatedXP }));
      await updatePlayerProfile({ totalXP: updatedXP });
    } catch (err) {
      console.error('AI Scan error:', err);
    } finally {
      setIsAiScanning(false);
    }
  };

  const handleUpdateSettings = async (newSettings) => {
    setUserSettings(newSettings);
    await savePlayerSettings(newSettings);
  };

  // Ambiguous calculation
  const ambiguousCount = Math.max(0, (metrics.totalEmailsScanned || 22) - (metrics.junkDetected || 0) - (metrics.emailsProtected || 0));

  return (
    <div className="min-h-screen bg-[#0B0A12] flex flex-col md:flex-row font-sans text-[#F5F3FF]">
      
      {/* ========================================================= */}
      {/* LEFT SIDEBAR: APPROX 250PX                               */}
      {/* ========================================================= */}
      <aside className="w-full md:w-[250px] shrink-0 bg-[#11101B] border-r border-[#1B1728] p-4 flex flex-col justify-between">
        <div className="space-y-6">
          
          {/* Sidebar Section Title */}
          <div className="px-3 pt-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              Command Menu
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            
            {/* 1. Dashboard Overview */}
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('overview');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-heading text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#1B1728] text-white border border-[#8B5CF6]/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#8B5CF6]" />
              <span>Dashboard</span>
            </button>

            {/* 2. Start Game (Routes to Battle Arena) */}
            <button
              onClick={() => {
                sounds.playGateOpen();
                navigate('/battle');
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-heading text-xs font-semibold text-white bg-gradient-to-r from-[#8B5CF6]/20 to-[#A78BFA]/10 hover:from-[#8B5CF6]/30 hover:to-[#A78BFA]/20 border border-[#8B5CF6]/40 transition-all shadow-[0_0_15px_rgba(139,92,246,0.15)] group"
            >
              <div className="flex items-center gap-3">
                <Swords className="w-4 h-4 text-[#FBBF24]" />
                <span>Start Game</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#FBBF24] group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* 3. Check My Emails (Routes to /scan) */}
            <button
              onClick={() => {
                sounds.playElderByteChime();
                navigate('/scan');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-heading text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Radar className="w-4 h-4 text-[#60A5FA]" />
              <span>Check My Emails</span>
            </button>

            {/* 4. Badges & Trophies */}
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('achievements');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-heading text-xs font-semibold transition-all ${
                activeTab === 'achievements'
                  ? 'bg-[#1B1728] text-white border border-[#8B5CF6]/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Award className="w-4 h-4 text-[#FBBF24]" />
              <span>Badges & Trophies</span>
            </button>

            {/* 5. Settings */}
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('settings');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-heading text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#1B1728] text-white border border-[#8B5CF6]/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <SettingsIcon className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>

          </nav>

          {/* Active Companion Widget */}
          <div className="p-3.5 rounded-xl bg-[#1B1728]/70 border border-white/5 space-y-2">
            <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold">
              Your Helper
            </span>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#241E36] border border-[#8B5CF6]/30 flex items-center justify-center font-bold text-xs text-[#A78BFA]">
                {activeCompanion.name[0]}
              </div>
              <div className="overflow-hidden">
                <p className="font-heading text-xs font-bold text-white truncate">{activeCompanion.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{activeCompanion.title}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Footer: Saved Progress */}
        <div className="pt-4 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-500">Saved Progress:</span>
            <span className="text-[#22C55E] font-semibold">
              {persistenceStatus.connected ? 'Saved Online' : 'Saved on Device'}
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            <span>Private & Safe</span>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA                                         */}
      {/* ========================================================= */}
      <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-7xl">
        
        {/* ======================================================= */}
        {/* TAB 1: OVERVIEW DASHBOARD                               */}
        {/* ======================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* HERO WELCOME & START GAME CTA */}
            <div className="relative bg-gradient-to-r from-[#1B1728] via-[#241E36] to-[#1B1728] border border-[#8B5CF6]/30 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#11101B] border border-white/10 text-xs font-mono text-[#A78BFA]">
                    <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
                    <span>Command Center Ready</span>
                  </div>
                  <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                    Welcome back, {player.name}!
                  </h1>
                  <p className="text-sm text-slate-300 font-sans leading-relaxed">
                    Defeat your email backlog and clear out inbox clutter.
                    {gmailStatus.connected 
                      ? ` Connected to your real Gmail (${gmailStatus.email}).` 
                      : ' Playing in Demo Mode with practice emails.'}
                  </p>
                </div>

                {/* Primary Start Game Button */}
                <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      sounds.playGateOpen();
                      navigate('/battle');
                    }}
                    className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-heading font-bold text-sm transition-all shadow-[0_10px_30px_rgba(139,92,246,0.35)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Swords className="w-5 h-5 text-[#FBBF24]" />
                    <span>Start Game</span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playElderByteChime();
                      navigate('/scan');
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-4 rounded-xl bg-[#1B1728] hover:bg-[#252038] border border-white/10 text-slate-300 hover:text-white font-heading font-semibold text-xs transition-colors"
                  >
                    <Radar className="w-4 h-4 text-[#60A5FA]" />
                    <span>Check My Emails</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4 CORE METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Card 1: Total Inbox Emails */}
              <div className="bg-[#11101B]/95 border border-white/5 hover:border-[#8B5CF6]/30 rounded-2xl p-5 space-y-3 transition-all">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-[#A78BFA]">Total Inbox Emails</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px]">
                    {gmailStatus.connected ? 'LIVE GMAIL' : 'DEMO REALM'}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-3xl font-bold text-white">
                    {metrics.totalEmailsScanned.toLocaleString()}
                  </span>
                  <Mail className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Emails waiting in your inbox to be checked.
                </p>
              </div>

              {/* Card 2: Likely Junk */}
              <div className="bg-[#11101B]/95 border border-white/5 hover:border-[#F87171]/30 rounded-2xl p-5 space-y-3 transition-all">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-[#F87171]">Likely Junk</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#F87171]/10 text-[#F87171] text-[10px]">
                    BLAZE
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-3xl font-bold text-[#F87171]">
                    {metrics.junkDetected.toLocaleString()}
                  </span>
                  <Flame className="w-5 h-5 text-[#F87171]" />
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Ads and newsletters you can safely archive.
                </p>
              </div>

              {/* Card 3: Emails to Check */}
              <div className="bg-[#11101B]/95 border border-white/5 hover:border-[#A78BFA]/30 rounded-2xl p-5 space-y-3 transition-all">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-[#A78BFA]">Emails to Check</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#8B5CF6]/10 text-[#A78BFA] text-[10px]">
                    GAME
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-3xl font-bold text-[#A78BFA]">
                    {ambiguousCount.toLocaleString()}
                  </span>
                  <Zap className="w-5 h-5 text-[#A78BFA]" />
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Emails that need your choice in the game.
                </p>
              </div>

              {/* Card 4: Important Emails */}
              <div className="bg-[#11101B]/95 border border-white/5 hover:border-[#60A5FA]/30 rounded-2xl p-5 space-y-3 transition-all">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-[#60A5FA]">Important Emails</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#60A5FA]/10 text-[#60A5FA] text-[10px]">
                    FROST
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-3xl font-bold text-[#60A5FA]">
                    {metrics.emailsProtected.toLocaleString()}
                  </span>
                  <ShieldCheck className="w-5 h-5 text-[#60A5FA]" />
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  School, bank, and security emails kept safe.
                </p>
              </div>

            </div>

            {/* PROGRESS & METRICS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Player Level & XP Bar */}
              <div className="lg:col-span-2 space-y-6">
                <XPBar
                  level={player.level}
                  currentXP={player.currentXP}
                  maxXP={player.level * 1000 + 4000}
                  playerName={player.name}
                  title={player.title}
                  gold={player.gold}
                />

                {/* Badges Spotlight */}
                <div className="bg-[#11101B]/95 border border-white/5 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#FBBF24]" />
                      <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                        New Badges Earned
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('achievements')}
                      className="text-xs font-mono text-[#A78BFA] hover:text-white transition-colors"
                    >
                      View All Badges ({ACHIEVEMENTS.length}) →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {ACHIEVEMENTS.slice(0, 3).map((ach) => (
                      <div
                        key={ach.id}
                        className="p-3.5 rounded-xl bg-[#1B1728]/70 border border-white/5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-[#FBBF24]">+{ach.xpReward} XP</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                        </div>
                        <h4 className="font-heading text-xs font-bold text-white">{ach.title}</h4>
                        <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">{ach.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right 1 Col: Inbox Clutter Meter */}
              <div className="bg-[#11101B]/95 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="space-y-1">
                  <h3 className="font-heading text-base font-bold text-white">
                    Inbox Clutter
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">
                    Clearing emails lowers your clutter level.
                  </p>
                </div>

                <PollutionMeter
                  percentage={metrics.inboxPollutionPercent}
                  totalCount={metrics.totalEmailsScanned}
                />

                <div className="w-full pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Clutter Status:</span>
                  <span className="text-[#22C55E] font-bold">UNDER CONTROL</span>
                </div>
              </div>

            </div>

            {/* ACTIVITY FEED */}
            <div className="bg-[#11101B]/95 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-400" />
                  <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                    Recent Activity
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-500">Game History</span>
              </div>

              <div className="divide-y divide-white/5">
                {activities.slice(0, 4).map((act) => (
                  <div key={act.id} className="py-3 flex items-center justify-between gap-4 text-xs font-sans">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                      <div>
                        <p className="font-semibold text-white">{act.action}</p>
                        <p className="text-slate-400 text-[11px]">{act.details}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-[#FBBF24] font-bold">+{act.xpGained} XP</span>
                      <p className="text-[10px] text-slate-500 font-mono">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 2: ACHIEVEMENTS & BADGES                            */}
        {/* ======================================================= */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">Badges & Trophies</h2>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Fun badges you earn by organizing your emails. Each badge can only be earned once!
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-[#FBBF24] px-3 py-1.5 rounded-lg bg-[#FBBF24]/10 border border-[#FBBF24]/30">
                Permanent Badges
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACHIEVEMENTS.map((ach) => (
                <div
                  key={ach.id}
                  className="bg-[#11101B]/95 border border-white/5 rounded-2xl p-5 flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1B1728] border border-[#8B5CF6]/30 flex items-center justify-center shrink-0 text-[#FBBF24]">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading text-sm font-bold text-white">{ach.title}</h4>
                      <span className="font-mono text-xs font-bold text-[#FBBF24]">+{ach.xpReward} XP</span>
                    </div>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">{ach.description}</p>
                    <div className="pt-2 flex items-center gap-2 text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">{ach.tier} Badge</span>
                      <span className="text-[#22C55E]">✓ Earned Badge</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 3: SETTINGS & SAFETY CONTROLS                       */}
        {/* ======================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="border-b border-white/5 pb-4">
              <h2 className="font-heading text-2xl font-bold text-white">Game Settings</h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Change your sound and safety preferences.
              </p>
            </div>

            <div className="bg-[#11101B]/95 border border-white/5 rounded-2xl p-6 space-y-6">
              
              {/* Sound Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading text-sm font-bold text-white">Game Sound</h4>
                  <p className="text-xs text-slate-400">Turn game sound effects on or off.</p>
                </div>
                <button
                  onClick={toggleSound}
                  className="p-2.5 rounded-xl bg-[#1B1728] border border-white/10 text-white"
                >
                  {isMuted ? <VolumeX className="w-5 h-5 text-[#F87171]" /> : <Volume2 className="w-5 h-5 text-[#22C55E]" />}
                </button>
              </div>

              {/* Automatically Move Junk to Archive */}
              <div className="pt-4 border-t border-white/5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#FBBF24]" />
                    <h4 className="font-heading text-sm font-bold text-white">Automatically Move Junk to Archive</h4>
                  </div>
                  <p className="text-xs text-slate-400 max-w-xl">
                    This is turned off by default. If you turn it on, only junk emails that the AI is 98% sure about will be archived automatically. We never move emails from banks, schools, doctors, or password resets automatically.
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
                  <input
                    type="checkbox"
                    checked={userSettings.autoArchivePreference}
                    onChange={(e) => handleUpdateSettings({ ...userSettings, autoArchivePreference: e.target.checked })}
                    className="w-4 h-4 rounded text-[#8B5CF6] focus:ring-0 bg-[#0B0A12] border-white/20 cursor-pointer"
                  />
                  <span className="font-mono text-xs font-bold text-slate-300">
                    {userSettings.autoArchivePreference ? 'Turned On' : 'Turned Off'}
                  </span>
                </label>
              </div>

              {/* Difficulty Mode */}
              <div className="pt-4 border-t border-white/5 space-y-2">
                <h4 className="font-heading text-sm font-bold text-white">Game Difficulty</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'apprentice', label: 'Easy' },
                    { key: 'mage', label: 'Medium' },
                    { key: 'archmage', label: 'Hard' }
                  ].map((diff) => (
                    <button
                      key={diff.key}
                      onClick={() => handleUpdateSettings({ ...userSettings, difficulty: diff.key })}
                      className={`p-3 rounded-xl border font-mono text-xs font-bold uppercase transition-all ${
                        userSettings.difficulty === diff.key
                          ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white'
                          : 'bg-[#1B1728] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Gmail OAuth Modal */}
      <GmailModal
        isOpen={isGmailModalOpen}
        onClose={() => setIsGmailModalOpen(false)}
      />
    </div>
  );
}
