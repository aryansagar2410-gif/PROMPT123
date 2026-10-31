import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Radar, 
  Flame, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Lock, 
  Swords, 
  Info,
  Radio
} from 'lucide-react';
import DungeonBackground from '../components/DungeonBackground';
import { MOCK_EMAILS } from '../data/mockEmails';
import { scanEmailBatch } from '../services/aiService';
import { getGmailStatus, fetchGmailMessages, executeGmailAction } from '../services/gmailService';
import { sounds } from '../audio/soundEffects';

export default function AiScanPage() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusMessage, setScanStatusMessage] = useState('AI is ready to check your emails.');
  const [scanResults, setScanResults] = useState(null);
  const [autoArchiveOptIn, setAutoArchiveOptIn] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [purgedCount, setPurgedCount] = useState(0);
  const [showMinionWave, setShowMinionWave] = useState(false);
  const [gmailStatus, setGmailStatus] = useState({ connected: false, email: '' });
  const [liveEmails, setLiveEmails] = useState([]);

  useEffect(() => {
    let isMounted = true;
    getGmailStatus().then((res) => {
      if (isMounted) {
        setGmailStatus(res);
        if (res.connected) {
          fetchGmailMessages().then((msgs) => {
            if (isMounted && msgs?.length) setLiveEmails(msgs);
          }).catch(() => {});
        }
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const handleStartScan = async () => {
    sounds.playElementalVolt();
    setIsScanning(true);
    setScanProgress(5);
    setScanResults(null);
    setPurgedCount(0);
    setShowMinionWave(false);

    const emailPool = gmailStatus.connected && liveEmails.length > 0 ? liveEmails : MOCK_EMAILS;

    // Friendly simple status updates
    const statuses = [
      'AI is getting ready to check your emails...',
      'Checking if the sender is real...',
      'Checking for scams or fake messages...',
      'Finding school, bank, and family emails to keep safe...',
      'Finding old ads and newsletters to clean up...',
      'Safety Check complete! All emails checked.',
    ];

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < statuses.length) {
        setScanStatusMessage(statuses[step]);
        setScanProgress(Math.min(90, Math.round((step / statuses.length) * 100)));
      }
    }, 700);

    try {
      const result = await scanEmailBatch(emailPool, { userEnabledAutoArchive: autoArchiveOptIn });
      clearInterval(interval);
      setScanProgress(100);
      setScanStatusMessage('Done! All emails have been checked.');
      setScanResults(result);
      sounds.playLevelUp();
    } catch (err) {
      clearInterval(interval);
      setScanProgress(100);
      setScanStatusMessage('Check failed. Please click the button to try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handlePurgeConfirmedJunk = async () => {
    if (!scanResults || !scanResults.obviousJunk?.length) return;
    setIsPurging(true);
    sounds.playElementalInferno();

    const junkList = scanResults.obviousJunk;
    setShowMinionWave(true);

    if (gmailStatus.connected) {
      let successCount = 0;
      for (const item of junkList) {
        try {
          await executeGmailAction('inferno', item.emailId || item.id);
          successCount++;
        } catch (e) {
          console.warn('Failed to archive email:', e);
        }
      }
      setPurgedCount(successCount);
    } else {
      setPurgedCount(junkList.length);
    }

    setTimeout(() => {
      setIsPurging(false);
    }, 1200);
  };

  return (
    <DungeonBackground>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B1728] border border-[#8B5CF6]/30 text-xs font-mono text-[#A78BFA]">
              <Radio className="w-3.5 h-3.5 text-[#22C55E] animate-pulse" />
              <span>AI Email Check Active</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Check My Emails with AI
            </h1>
            <p className="text-sm text-slate-400 font-sans">
              Scan and organize your emails safely using Google's AI helper.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-xl bg-[#1B1728] hover:bg-[#252038] border border-white/10 text-xs font-heading font-semibold text-slate-300 transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/battle')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-xs font-heading font-semibold text-white transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Start Game</span>
            </button>
          </div>
        </div>

        {/* SCANNER RADAR & INITIATION CARD */}
        <div className="relative bg-[#11101B]/95 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5CF6]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            
            {/* Visual Radar Animation */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#8B5CF6]/20" />
              <div className="absolute inset-4 rounded-full border border-[#8B5CF6]/30" />
              <div className="absolute inset-8 rounded-full border border-[#8B5CF6]/40" />
              <div className="absolute inset-12 rounded-full border border-[#8B5CF6]/50" />
              
              {isScanning && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                  className="absolute inset-0 rounded-full origin-center"
                  style={{
                    background: 'conic-gradient(from 0deg at 50% 50%, rgba(139, 92, 246, 0.4) 0deg, transparent 60deg)',
                  }}
                />
              )}

              <div className="relative z-10 w-16 h-16 rounded-full bg-[#1B1728] border-2 border-[#8B5CF6] flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.5)]">
                <Radar className={`w-8 h-8 text-[#A78BFA] ${isScanning ? 'animate-spin' : ''}`} />
              </div>
            </div>

            {/* Scan Controls & Live Status */}
            <div className="flex-1 space-y-4 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-xl font-bold text-white">
                    {isScanning ? 'AI Is Checking Your Emails...' : 'AI Email Scanner'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Checking: {gmailStatus.connected ? `Live Gmail (${gmailStatus.email})` : 'Practice Demo Emails'}
                  </p>
                </div>

                <button
                  onClick={handleStartScan}
                  disabled={isScanning}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white font-heading font-semibold text-sm transition-all shadow-[0_4px_20px_rgba(139,92,246,0.4)]"
                >
                  <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'Checking Emails...' : 'Check My Emails'}</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>{scanStatusMessage}</span>
                  <span className="font-bold text-[#A78BFA]">{scanProgress}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#1B1728] overflow-hidden p-0.5 border border-white/5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#FBBF24]"
                    initial={{ width: '0%' }}
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Safety & Auto-Archive Toggle */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#1B1728]/70 border border-white/5 text-xs font-sans">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-[#FBBF24] shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Automatically Move Junk to Archive:</span>
                    <span className="text-slate-400 ml-1.5">Turned off by default. We never move important emails.</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoArchiveOptIn}
                    onChange={(e) => setAutoArchiveOptIn(e.target.checked)}
                    className="w-4 h-4 rounded text-[#8B5CF6] focus:ring-0 bg-[#0B0A12] border-white/20 cursor-pointer"
                  />
                  <span className={`text-xs font-mono font-bold ${autoArchiveOptIn ? 'text-[#22C55E]' : 'text-slate-400'}`}>
                    {autoArchiveOptIn ? 'TURNED ON' : 'TURNED OFF (Safe)'}
                  </span>
                </label>
              </div>

            </div>
          </div>
        </div>

        {/* SCAN RESULTS BREAKDOWN CARDS */}
        {scanResults && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Likely Junk */}
              <div className="bg-[#11101B]/95 border border-[#F87171]/30 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#F87171]/10 border border-[#F87171]/30 flex items-center justify-center text-[#F87171]">
                    <Flame className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-2xl font-bold text-[#F87171]">
                    {scanResults.obviousJunk?.length || 0}
                  </span>
                </div>
                <div>
                  <h4 className="font-heading text-lg font-bold text-white">Likely Junk</h4>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Old ads, store newsletters, and promotional emails.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={handlePurgeConfirmedJunk}
                    disabled={isPurging || (scanResults.obviousJunk?.length || 0) === 0}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F87171]/20 hover:bg-[#F87171]/30 border border-[#F87171]/50 text-xs font-heading font-bold text-[#F87171] transition-all disabled:opacity-50"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>{isPurging ? 'Cleaning Emails...' : 'Archive Likely Junk'}</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Important Emails */}
              <div className="bg-[#11101B]/95 border border-[#60A5FA]/30 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#60A5FA]/10 border border-[#60A5FA]/30 flex items-center justify-center text-[#60A5FA]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-2xl font-bold text-[#60A5FA]">
                    {scanResults.obviousKeep?.length || 0}
                  </span>
                </div>
                <div>
                  <h4 className="font-heading text-lg font-bold text-white">Important Emails</h4>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    School updates, bank notices, order receipts, and passwords.
                  </p>
                </div>
                <div className="pt-2">
                  <div className="px-3 py-2 rounded-xl bg-[#1B1728] border border-white/5 text-[11px] font-mono text-[#60A5FA] flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Kept safe in your inbox</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Emails to Check */}
              <div className="bg-[#11101B]/95 border border-[#8B5CF6]/30 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA]">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-2xl font-bold text-[#A78BFA]">
                    {scanResults.ambiguous?.length || 0}
                  </span>
                </div>
                <div>
                  <h4 className="font-heading text-lg font-bold text-white">Emails to Check</h4>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Emails that you decide what to do with in the game.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/battle')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-xs font-heading font-bold text-white transition-all shadow-md"
                  >
                    <span>Play the Email Game</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* MINION WAVE PURGE NOTIFICATION */}
            {showMinionWave && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-[#1B1728] border border-[#F87171]/50 flex items-center justify-between gap-4 text-xs font-sans shadow-[0_0_30px_rgba(248,113,113,0.2)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F87171]/20 flex items-center justify-center text-xl animate-bounce">
                    🔥
                  </div>
                  <div>
                    <h5 className="font-heading text-sm font-bold text-white">
                      Blaze Cleared Your Junk Emails!
                    </h5>
                    <p className="text-slate-300">
                      Archived <span className="font-mono font-bold text-[#F87171]">{purgedCount}</span> junk emails out of your inbox.
                    </p>
                  </div>
                </div>

                <div className="font-mono text-xs text-[#22C55E] font-bold px-3 py-1.5 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30">
                  ARCHIVED SAFELY
                </div>
              </motion.div>
            )}

            {/* SAFETY CHECK NOTICE */}
            <div className="p-4 rounded-xl bg-[#11101B]/80 border border-white/5 text-xs text-slate-400 font-sans flex items-start gap-3">
              <Info className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Safety Check Rules:</strong>
                <p className="mt-0.5 leading-relaxed">
                  Archiving moves an email out of your inbox. It does not delete it. We never delete emails automatically. Bank notices, school messages, password resets, and suspicious emails are always kept safe for you to review.
                </p>
              </div>
            </div>

          </motion.div>
        )}

      </div>
    </DungeonBackground>
  );
}
