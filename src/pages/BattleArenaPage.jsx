import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  ShieldCheck, 
  Zap, 
  RotateCcw, 
  Eye, 
  ShieldAlert, 
  Crown, 
  Sparkles, 
  Swords, 
  Trophy, 
  ChevronLeft,
  Volume2,
  VolumeX,
  Keyboard,
  Compass,
  Mail,
  RefreshCw,
  AlertCircle,
  Cloud,
  Database,
  Skull,
  X
} from 'lucide-react';
import DungeonBackground from '../components/DungeonBackground';
import BattleCard from '../components/BattleCard';
import CompanionBar from '../components/CompanionBar';
import ElementalEffects from '../components/ElementalEffects';
import GuardianProtocolModal from '../components/GuardianProtocolModal';
import BossBattle from '../components/BossBattle';
import ArenaResults from '../components/ArenaResults';
import GameButton from '../components/GameButton';
import GmailModal from '../components/GmailModal';
import { MOCK_EMAILS } from '../data/mockEmails';
import { MOCK_PLAYER } from '../data/mockData';
import { sounds } from '../audio/soundEffects';
import { useSound } from '../hooks/useSound';
import { 
  getGmailStatus, 
  fetchGmailMessages, 
  archiveGmailMessage, 
  keepGmailMessage, 
  replyLaterGmailMessage, 
  undoLastGmailAction 
} from '../services/gmailService';
import { 
  fetchPlayerProfile, 
  updatePlayerProfile, 
  saveSessionProgress, 
  loadLatestSession, 
  unlockPlayerAchievement,
  recordPlayerAction,
  getPersistenceStatus
} from '../services/persistenceService';

export default function BattleArenaPage() {
  const navigate = useNavigate();
  const { isMuted, toggleSound } = useSound();

  // State Management
  const [emailQueue, setEmailQueue] = useState(MOCK_EMAILS);
  const [historyStack, setHistoryStack] = useState([]);
  const [playerXP, setPlayerXP] = useState(MOCK_PLAYER.currentXP);
  const [playerLevel, setPlayerLevel] = useState(MOCK_PLAYER.level);
  const [gold, setGold] = useState(MOCK_PLAYER.gold);
  const [pollution, setPollution] = useState(68);
  const [combo, setCombo] = useState(0);
  const [peakCombo, setPeakCombo] = useState(0);

  // Counters for debrief & persistence
  const [archivedCount, setArchivedCount] = useState(0);
  const [protectedCount, setProtectedCount] = useState(0);
  const [snoozedCount, setSnoozedCount] = useState(0);
  const [totalXpEarned, setTotalXpEarned] = useState(0);

  // Active Companion
  const [activeCompanionId, setActiveCompanionId] = useState('blaze');
  const [lastAction, setLastAction] = useState(null);

  // Phase 4 & 5 Integration State
  const [isGmailMode, setIsGmailMode] = useState(false);
  const [gmailUserEmail, setGmailUserEmail] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [showGmailModal, setShowGmailModal] = useState(false);
  const [persistenceStatus, setPersistenceStatus] = useState({
    configured: false,
    connected: false,
    storageType: 'local-sanctum-cache',
    projectId: 'inbox-zero-dungeon-local',
  });

  // FX & Modals
  const [activeFX, setActiveFX] = useState(null);
  const [inspectingEmail, setInspectingEmail] = useState(null);
  const [isWarningMode, setIsWarningMode] = useState(false);
  const [isBossActive, setIsBossActive] = useState(false);
  const [bossDefeated, setBossDefeated] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [isActionLocked, setIsActionLocked] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  const currentEmail = emailQueue[0] || null;

  // Helper to calculate RPG level based on XP
  const getLevelFromXP = (xp) => 14 + Math.floor(Math.max(0, xp - 4250) / 600);

  // Helper to identify protected & high-risk emails
  const isProtectedEmail = (e) => {
    if (!e) return false;
    return (
      e.isProtectedByDefault === true ||
      e.phishingRisk === 'high' ||
      e.importance === 'critical' ||
      e.importance === 'vip' ||
      e.guardianFlag === 'high_value_asset' ||
      e.guardianFlag === 'suspicious_phishing' ||
      e.classification === 'banking' ||
      e.classification === 'university'
    );
  };

  // Deck Loader: Synchronizes Live Gmail or Demo Scrolls + restores persistent profile
  const loadDeck = useCallback(async (preferGmail = true) => {
    setIsLoadingMessages(true);
    setActionError(null);

    try {
      // 1. Fetch persistent player profile & cloud status
      const [pStatus, profile] = await Promise.all([
        getPersistenceStatus(),
        fetchPlayerProfile(),
      ]);

      setPersistenceStatus(pStatus);
      if (profile) {
        setPlayerXP(profile.totalXP ?? MOCK_PLAYER.currentXP);
        setPlayerLevel(profile.level || MOCK_PLAYER.level);
        setGold(profile.gold ?? MOCK_PLAYER.gold);
      }

      // 2. Fetch Gmail if preferred & connected
      if (preferGmail) {
        const gStatus = await getGmailStatus();
        if (gStatus && gStatus.connected) {
          setIsGmailMode(true);
          setGmailUserEmail(gStatus.email || 'Connected Realm');
          const data = await fetchGmailMessages(50);
          if (data && Array.isArray(data.messages) && data.messages.length > 0) {
            setEmailQueue(data.messages);
            setHistoryStack([]);
            setIsSessionComplete(false);
            setIsLoadingMessages(false);
            return;
          } else if (data && Array.isArray(data.messages) && data.messages.length === 0) {
            setEmailQueue([]);
            setIsSessionComplete(true);
            setIsLoadingMessages(false);
            return;
          }
        }
      }
    } catch (err) {
      console.warn('[Arena] Deck loading notice:', err.message);
      setActionError(`Gmail notice: ${err.message}. Entering Demo Realm.`);
    }

    // Default to Demo Scrolls
    setIsGmailMode(false);
    setEmailQueue(MOCK_EMAILS);
    setHistoryStack([]);
    setIsSessionComplete(false);
    setIsLoadingMessages(false);
  }, []);

  // Initial load
  useEffect(() => {
    loadDeck(true);
  }, [loadDeck]);

  // Process Elemental Action (with real Gmail execution gate & persistent Firestore sync)
  const executeAction = useCallback(async (actionType, email, forceOverride = false) => {
    if (isActionLocked || !email) return;

    // GUARDIAN PROTOCOL CHECK:
    // If archiving a protected, banking, university or phishing scroll without forceOverride, trigger warning modal
    if (actionType === 'inferno' && !forceOverride && isProtectedEmail(email)) {
      sounds.playWarningAlert();
      setInspectingEmail(email);
      setIsWarningMode(true);
      return;
    }

    setIsActionLocked(true);
    setActionError(null);

    // REAL GMAIL INTEGRATION:
    // Only show successful game animations AFTER Gmail confirms the action succeeded!
    if (isGmailMode && email.isGmail) {
      try {
        if (actionType === 'inferno') {
          await archiveGmailMessage(email.id);
        } else if (actionType === 'frost') {
          await keepGmailMessage(email.id);
        } else if (actionType === 'volt') {
          await replyLaterGmailMessage(email.id);
        }
      } catch (err) {
        console.error('[Arena] Gmail action rejected:', err.message);
        setActionError(`Gmail Action Rejected: ${err.message}`);
        sounds.playWarningAlert();
        setIsActionLocked(false);
        return; // Do NOT update game state or advance deck!
      }
    }

    // Audio & Visual FX
    if (actionType === 'inferno') {
      sounds.playFireEffect();
      sounds.playSlashSound();
      setActiveFX('inferno');
    } else if (actionType === 'frost') {
      sounds.playFrostEffect();
      setActiveFX('frost');
    } else if (actionType === 'volt') {
      sounds.playVoltEffect();
      setActiveFX('volt');
    }

    // Calculate XP with combo bonuses (milestones 3, 5, 10)
    const baseXP = actionType === 'inferno' ? 20 : actionType === 'volt' ? 15 : 10;
    const newCombo = combo + 1;
    let bonusXP = 0;
    if (newCombo === 10) bonusXP = 50;
    else if (newCombo === 5) bonusXP = 15;
    else if (newCombo === 3) bonusXP = 5;

    const actionTotalXP = baseXP + bonusXP;

    // Trigger combo sound if milestone reached
    if (newCombo === 3 || newCombo === 5 || newCombo === 10) {
      sounds.playComboBurst(newCombo);
      // Persist combo achievement
      unlockPlayerAchievement({
        id: `combo_${newCombo}`,
        name: `${newCombo}x Runic Streak`,
        rewardXP: bonusXP,
        rewardGold: 25,
      });
    }

    // Pollution drop
    const pollutionDrop = actionType === 'inferno' ? 2 : 1;

    // Save to history stack for Time Rewind
    const historyEntry = {
      email,
      actionType,
      xpGained: actionTotalXP,
      prevCombo: combo,
      prevPollution: pollution,
    };

    setHistoryStack((prev) => [historyEntry, ...prev]);

    // Update state & Level progression
    const nextXP = playerXP + actionTotalXP;
    const nextLevel = getLevelFromXP(nextXP);
    setPlayerXP(nextXP);
    setPlayerLevel(nextLevel);
    setTotalXpEarned((prev) => prev + actionTotalXP);
    setCombo(newCombo);
    setPeakCombo((prev) => Math.max(prev, newCombo));
    setPollution((prev) => Math.max(0, prev - pollutionDrop));
    setLastAction(actionType);

    const newArchived = actionType === 'inferno' ? archivedCount + 1 : archivedCount;
    const newProtected = actionType === 'frost' ? protectedCount + 1 : protectedCount;
    const newSnoozed = actionType === 'volt' ? snoozedCount + 1 : snoozedCount;
    const totalReviewed = newArchived + newProtected + newSnoozed;

    if (actionType === 'inferno') setArchivedCount(newArchived);
    else if (actionType === 'frost') setProtectedCount(newProtected);
    else if (actionType === 'volt') setSnoozedCount(newSnoozed);

    // FIRESTORE / PERSISTENCE SYNCHRONIZATION
    updatePlayerProfile({
      totalXP: nextXP,
      level: nextLevel,
      gold,
      totalReviewed,
      totalArchived: newArchived,
      totalKept: newProtected,
      totalReplyLater: newSnoozed,
      peakCombo: Math.max(peakCombo, newCombo),
    });

    saveSessionProgress({
      floor: 1,
      emailsReviewed: totalReviewed,
      sessionXP: totalXpEarned + actionTotalXP,
      sessionPollution: Math.max(0, pollution - pollutionDrop),
      peakCombo: Math.max(peakCombo, newCombo),
      status: 'in-progress',
    });

    recordPlayerAction({
      gmailMessageId: email.id,
      actionType,
      previousLabelIds: email.labelIds || [],
      resultingLabelIds: actionType === 'inferno' ? [] : (email.labelIds || []),
      xpAwarded: actionTotalXP,
      timestamp: Date.now(),
    });

    // Remove email from queue after short animation
    setTimeout(() => {
      setEmailQueue((prev) => {
        const nextQueue = prev.slice(1);
        if (nextQueue.length === 0) {
          setIsSessionComplete(true);
          sounds.playLevelUp();
          saveSessionProgress({ status: 'completed' });
        }
        return nextQueue;
      });

      setActiveFX(null);
      setIsActionLocked(false);

      // Milestone trigger: At 20 reviewed emails, trigger boss encounter
      if (totalReviewed === 20 && !bossDefeated && !isBossActive) {
        setTimeout(() => {
          sounds.playBossRoar();
          setIsBossActive(true);
        }, 500);
      }
    }, 380);
  }, [archivedCount, bossDefeated, combo, gold, isActionLocked, isBossActive, isGmailMode, peakCombo, playerXP, pollution, protectedCount, snoozedCount, totalXpEarned]);

  // TIME REWIND (UNDO) SYSTEM
  const handleUndo = useCallback(async () => {
    if (historyStack.length === 0 || isActionLocked) return;

    setIsActionLocked(true);
    setActionError(null);

    const [lastEntry, ...remainingHistory] = historyStack;
    const { email, actionType, xpGained, prevCombo, prevPollution } = lastEntry;

    // REAL GMAIL TIME REWIND:
    // If last action was on a live Gmail message, reverse it via backend API first!
    if (isGmailMode && email.isGmail) {
      try {
        await undoLastGmailAction();
      } catch (err) {
        console.error('[Arena] Gmail undo failed:', err.message);
        setActionError(`Gmail Time Rewind Failed: ${err.message}`);
        sounds.playWarningAlert();
        setIsActionLocked(false);
        return; // Do NOT falsely restore game state if Gmail rejected undo!
      }
    }

    sounds.playRewind();
    setActiveFX('rewind');

    // Revert state
    setHistoryStack(remainingHistory);
    const revertedXP = Math.max(0, playerXP - xpGained);
    setPlayerXP(revertedXP);
    setPlayerLevel(getLevelFromXP(revertedXP));
    setTotalXpEarned((prev) => Math.max(0, prev - xpGained));
    setCombo(prevCombo);
    setPollution(prevPollution);
    setLastAction('rewind');

    const revArchived = actionType === 'inferno' ? Math.max(0, archivedCount - 1) : archivedCount;
    const revProtected = actionType === 'frost' ? Math.max(0, protectedCount - 1) : protectedCount;
    const revSnoozed = actionType === 'volt' ? Math.max(0, snoozedCount - 1) : snoozedCount;

    if (actionType === 'inferno') setArchivedCount(revArchived);
    else if (actionType === 'frost') setProtectedCount(revProtected);
    else if (actionType === 'volt') setSnoozedCount(revSnoozed);

    // Restore email to top of queue
    setEmailQueue((prev) => [email, ...prev]);

    // Update persistence
    updatePlayerProfile({
      totalXP: revertedXP,
      totalArchived: revArchived,
      totalKept: revProtected,
      totalReplyLater: revSnoozed,
    });

    setTimeout(() => {
      setActiveFX(null);
      setIsActionLocked(false);
    }, 450);
  }, [archivedCount, historyStack, isActionLocked, isGmailMode, playerXP, protectedCount, snoozedCount]);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (inspectingEmail || isBossActive) return;

      const key = e.key.toLowerCase();

      if (key === 'arrowleft' || key === 'a') {
        e.preventDefault();
        if (currentEmail) executeAction('inferno', currentEmail);
      } else if (key === 'arrowright' || key === 'd') {
        e.preventDefault();
        if (currentEmail) executeAction('frost', currentEmail);
      } else if (key === 'arrowup' || key === 'w') {
        e.preventDefault();
        if (currentEmail) executeAction('volt', currentEmail);
      } else if (key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (key === ' ' || key === 'i') {
        e.preventDefault();
        if (currentEmail) {
          sounds.playClick();
          setInspectingEmail(currentEmail);
          setIsWarningMode(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentEmail, executeAction, handleUndo, inspectingEmail, isBossActive]);

  // Handle Boss Victory
  const handleBossDefeated = async (bounty) => {
    if (bossDefeated) return;
    setBossDefeated(true);

    const nextXP = playerXP + bounty.xp;
    const nextGold = gold + bounty.gold;

    setPlayerXP(nextXP);
    setPlayerLevel(getLevelFromXP(nextXP));
    setGold(nextGold);
    setTotalXpEarned((prev) => prev + bounty.xp);
    setIsBossActive(false);

    // Persist boss victory and unlock achievement (duplicate prevention guaranteed)
    await unlockPlayerAchievement({
      id: 'boss_slayer',
      name: 'Lord Spammerus Vanquished',
      rewardXP: bounty.xp,
      rewardGold: bounty.gold,
    });

    await updatePlayerProfile({
      totalXP: nextXP,
      gold: nextGold,
      bossVictories: 1,
    });
  };

  const handleRestart = () => {
    loadDeck(isGmailMode);
    setCombo(0);
    setPollution(68);
    setArchivedCount(0);
    setProtectedCount(0);
    setSnoozedCount(0);
    setTotalXpEarned(0);
    setIsSessionComplete(false);
    setBossDefeated(false);
    sounds.playLevelUp();
  };

  return (
    <DungeonBackground showParticles={true}>
      {/* FULL-SCREEN ELEMENTAL FX OVERLAY */}
      <ElementalEffects activeEffect={activeFX} comboCount={combo} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col justify-between min-h-[calc(100vh-5rem)]">
        
        {/* TOP STATUS BAR: PLAYER LEVEL, COMBO, POLLUTION & CONTROLS */}
        <header className="space-y-3 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#11101B]/95 border border-white/10 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-xl">
            
            {/* Left: Return & Player Crest */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-xl bg-[#1B1728] border border-white/10 text-slate-400 hover:text-white hover:border-[#8B5CF6]/50 transition-all"
                title="Return to Sanctum Dashboard"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] p-0.5 shadow-sm">
                  <div className="w-full h-full bg-[#11101B] rounded-[9px] flex items-center justify-center">
                    <span className="font-mono text-xs font-black text-[#FBBF24]">
                      L{playerLevel}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading text-sm font-bold text-white tracking-tight">
                      EMAIL BATTLE ARENA
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-[#22C55E]/10 text-[#22C55E] font-mono text-[10px] font-bold border border-[#22C55E]/30">
                      LIVE
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    XP: <strong className="text-[#FBBF24]">{playerXP.toLocaleString()}</strong> • Gold: <strong className="text-[#FBBF24]">{gold.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Center: Streak Bonus Indicator */}
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                combo >= 5
                  ? 'bg-[#FBBF24]/10 border-[#FBBF24]/40 text-[#FBBF24] shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                  : combo >= 3
                  ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/40 text-[#A78BFA]'
                  : 'bg-[#1B1728] border-white/5 text-slate-400'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
                <span>Streak x{combo}</span>
                {combo >= 5 && <span className="text-[10px] text-[#FBBF24] font-black">+15 XP BONUS</span>}
              </div>
            </div>

            {/* Right: Inbox Clutter, Big Challenge & Controls */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-[#1B1728] border border-white/5 text-xs font-mono">
                <span className="text-slate-400">Inbox Clutter:</span>
                <span className="font-bold text-orange-400">{pollution}%</span>
              </div>

              {/* Big Challenge Trigger */}
              <button
                onClick={() => {
                  if (bossDefeated) return;
                  sounds.playBossRoar();
                  setIsBossActive(true);
                }}
                disabled={bossDefeated}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-heading text-xs font-bold transition-all ${
                  bossDefeated
                    ? 'bg-amber-950/60 border border-amber-500/40 text-amber-300 opacity-80 cursor-default'
                    : 'bg-gradient-to-r from-red-600 to-rose-700 text-white border border-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.4)] hover:brightness-110 cursor-pointer'
                }`}
                title={bossDefeated ? 'Challenge completed!' : 'Try the Big Email Challenge'}
              >
                {bossDefeated ? (
                  <>
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Challenge Won!</span>
                  </>
                ) : (
                  <>
                    <Skull className="w-3.5 h-3.5 animate-pulse" />
                    <span className="hidden sm:inline">Big Email Challenge</span>
                  </>
                )}
              </button>

              {/* Keyboard Help Toggle */}
              <button
                onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                className="p-2 rounded-xl bg-dungeon-950 border border-slate-800 text-slate-400 hover:text-white"
                title="Keyboard Shortcuts"
              >
                <Keyboard className="w-4 h-4" />
              </button>

              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                className="p-2 rounded-xl bg-dungeon-950 border border-slate-800 text-purple-300 hover:text-white"
                title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* SIMPLE INSTRUCTIONS BANNER */}
          <div className="p-3 bg-[#11101B]/95 border border-[#8B5CF6]/30 rounded-xl flex flex-wrap items-center justify-around gap-2 text-xs font-sans text-slate-300">
            <span className="flex items-center gap-1.5"><strong className="text-[#F87171]">Swipe LEFT</strong> to archive an email.</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5"><strong className="text-[#60A5FA]">Swipe RIGHT</strong> to keep an email.</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5"><strong className="text-[#A78BFA]">Swipe UP</strong> to mark it for later.</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5"><strong className="text-[#FBBF24]">Press Z</strong> to undo your last move.</span>
          </div>

          {/* COMPANION LIVE BAR */}
          <CompanionBar
            activeCompanionId={activeCompanionId}
            lastAction={lastAction}
            currentEmail={currentEmail}
            comboCount={combo}
          />

          {/* DUAL REALM & SAVED PROGRESS STATUS BAR */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-[#11101B]/80 border border-white/5 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Realm Status */}
              <div className="flex items-center gap-2">
                {isGmailMode ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-heading font-bold text-emerald-300">Live Gmail Inbox:</span>
                    <span className="text-slate-200 text-[11px] font-mono">{gmailUserEmail}</span>
                    <span className="text-[10px] text-slate-400">({emailQueue.length} emails left)</span>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                    <span className="font-heading font-bold text-purple-300">Demo Mode:</span>
                    <span className="text-slate-400 text-[11px]">Practice Emails ({emailQueue.length} left)</span>
                  </>
                )}
              </div>

              {/* Saved Progress Badge */}
              <div className="flex items-center gap-1.5 pl-3 border-l border-slate-800 text-[11px] font-mono">
                {persistenceStatus.connected ? (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-cyan-300">Saved Online</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-purple-300">Saved on This Device</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isGmailMode ? (
                <>
                  <button
                    onClick={() => loadDeck(true)}
                    disabled={isLoadingMessages}
                    className="px-2.5 py-1 rounded-lg bg-[#1B1728] border border-emerald-500/40 text-emerald-300 hover:text-white text-[11px] font-heading font-bold flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                    <span>Refresh Inbox</span>
                  </button>
                  <button
                    onClick={() => loadDeck(false)}
                    className="px-2.5 py-1 rounded-lg bg-[#1B1728] border border-white/10 text-slate-300 hover:text-white text-[11px] font-heading transition-all"
                  >
                    Switch to Demo
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowGmailModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[11px] font-heading font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Mail className="w-3 h-3" />
                  <span>Connect Gmail</span>
                </button>
              )}
            </div>
          </div>

          {/* ACTION ERROR ALERT BANNER */}
          {actionError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-950/80 border border-red-500/60 rounded-xl text-red-200 text-xs flex items-center justify-between shadow-[0_0_20px_rgba(239,68,68,0.3)]"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{actionError}</span>
              </div>
              <button
                onClick={() => setActionError(null)}
                className="p-1 text-red-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </header>

        {/* CENTER ARENA: CARD DECK & BATTLE ZONE */}
        <main className="relative flex-1 flex flex-col items-center justify-center my-4 min-h-[500px]">
          
          {!isSessionComplete ? (
            <div className="relative w-full max-w-[500px] h-[480px] flex items-center justify-center">
              {emailQueue.slice(0, 3).map((email, index) => (
                <BattleCard
                  key={email.id}
                  email={email}
                  isTopCard={index === 0}
                  stackIndex={index}
                  onAction={(type) => executeAction(type, email)}
                  onInspect={() => {
                    sounds.playClick();
                    setInspectingEmail(email);
                    setIsWarningMode(false);
                  }}
                  isActionLocked={isActionLocked}
                />
              ))}
            </div>
          ) : (
            /* CONGRATULATIONS DEBRIEF RESULTS */
            <ArenaResults
              stats={{
                archived: archivedCount,
                protected: protectedCount,
                snoozed: snoozedCount,
                totalXP: totalXpEarned,
                peakCombo: peakCombo,
                pollutionReduction: 68 - pollution,
                bossDefeated: bossDefeated,
              }}
              onRestart={handleRestart}
              onReturnToSanctum={() => navigate('/dashboard')}
            />
          )}

        </main>

        {/* BOTTOM ACTION BAR */}
        {!isSessionComplete && (
          <footer className="space-y-4">
            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-xl mx-auto">
              
              {/* LEFT: ARCHIVE EMAIL */}
              <GameButton
                variant="blaze"
                size="md"
                icon={Flame}
                onClick={() => currentEmail && executeAction('inferno', currentEmail)}
                disabled={isActionLocked || !currentEmail}
                className="w-full flex-col sm:flex-row py-3"
              >
                <span>Archive Email</span>
                <span className="text-[10px] text-amber-200 opacity-80 font-mono">+20 XP</span>
              </GameButton>

              {/* UP: REPLY LATER */}
              <GameButton
                variant="volt"
                size="md"
                icon={Zap}
                onClick={() => currentEmail && executeAction('volt', currentEmail)}
                disabled={isActionLocked || !currentEmail}
                className="w-full flex-col sm:flex-row py-3"
              >
                <span>Reply Later</span>
                <span className="text-[10px] text-purple-200 opacity-80 font-mono">+15 XP</span>
              </GameButton>

              {/* RIGHT: KEEP EMAIL */}
              <GameButton
                variant="frost"
                size="md"
                icon={ShieldCheck}
                onClick={() => currentEmail && executeAction('frost', currentEmail)}
                disabled={isActionLocked || !currentEmail}
                className="w-full flex-col sm:flex-row py-3"
              >
                <span>Keep Email</span>
                <span className="text-[10px] text-cyan-200 opacity-80 font-mono">+10 XP</span>
              </GameButton>
            </div>

            {/* UTILITY ROW: UNDO, COMPANION SWITCHER & PROGRESS */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-heading max-w-xl mx-auto px-1">
              
              {/* Undo Last Move Button */}
              <button
                onClick={handleUndo}
                disabled={historyStack.length === 0 || isActionLocked}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-all ${
                  historyStack.length > 0
                    ? 'border-amber-400/60 bg-[#1B1728] text-amber-300 hover:bg-amber-950/40 shadow-sm'
                    : 'border-white/5 bg-[#11101B] text-slate-600 cursor-not-allowed'
                }`}
                title="Undo Last Move (Shortcut: Z)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo Last Move ({historyStack.length})</span>
              </button>

              {/* Companion Switcher Pills */}
              <div className="flex items-center gap-1 bg-[#11101B] p-1 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-400 px-1 font-mono">Helper:</span>
                {['blaze', 'frost', 'volt', 'elderByte'].map((id) => (
                  <button
                    key={id}
                    onClick={() => {
                      sounds.playClick();
                      setActiveCompanionId(id);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                      activeCompanionId === id
                        ? 'bg-[#8B5CF6]/30 text-amber-300 border border-amber-400/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {id === 'elderByte' ? 'Elder' : id}
                  </button>
                ))}
              </div>

              {/* Queue Counter */}
              <span className="text-slate-400 font-mono text-xs">
                Emails Left: <strong className="text-white">{emailQueue.length}</strong>
              </span>
            </div>
          </footer>
        )}

      </div>

      {/* GUARDIAN PROTOCOL DEEP INSPECTION & WARNING MODAL */}
      <GuardianProtocolModal
        isOpen={Boolean(inspectingEmail)}
        email={inspectingEmail}
        warningMode={isWarningMode}
        onClose={() => {
          setInspectingEmail(null);
          setIsWarningMode(false);
        }}
        onConfirmAction={(actionType, targetEmail) => {
          executeAction(actionType, targetEmail, true); // forceOverride: true
        }}
      />

      {/* BOSS BATTLE ENCOUNTER MODAL */}
      {isBossActive && (
        <BossBattle
          alreadyDefeated={bossDefeated}
          onBossDefeated={handleBossDefeated}
          onExit={() => setIsBossActive(false)}
        />
      )}

      {/* GMAIL CONNECTION MODAL */}
      <GmailModal
        isOpen={showGmailModal}
        onClose={() => {
          setShowGmailModal(false);
          loadDeck(true);
        }}
      />
    </DungeonBackground>
  );
}
