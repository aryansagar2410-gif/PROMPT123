import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Shield, CheckCircle2, Lock, AlertTriangle, X, ExternalLink, Unplug, Loader2 } from 'lucide-react';
import GameButton from './GameButton';
import { sounds } from '../audio/soundEffects';
import { getGmailStatus, getGmailAuthUrl, disconnectGmail } from '../services/gmailService';

export default function GmailModal({ isOpen, onClose }) {
  const [status, setStatus] = useState({ connected: false, configured: false, email: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  async function loadStatus() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getGmailStatus();
      setStatus(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getGmailAuthUrl();
      if (res?.authUrl) {
        sounds.playLevelUp();
        window.location.href = res.authUrl;
      } else {
        throw new Error('No authorization URL returned from sanctum server.');
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate Google OAuth consent.');
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await disconnectGmail();
      sounds.playElementalVolt();
      await loadStatus();
    } catch (err) {
      setError(err.message || 'Failed to sever Gmail connection.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-[#11101B] border border-[#8B5CF6]/30 rounded-2xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.85)] z-10 overflow-hidden"
        >
          {/* Subtle top gradient glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent" />

          {/* Close button */}
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#1B1728] border border-[#8B5CF6]/30 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
              <Mail className="w-7 h-7 text-[#A78BFA]" />
            </div>

            <h3 className="font-heading text-2xl font-bold text-white tracking-wide">
              {status.connected ? 'Gmail Connected' : 'Connect Your Gmail'}
            </h3>
            <p className="text-sm text-slate-400 mt-1 font-sans">
              {status.connected
                ? `Connected to ${status.email}`
                : 'Connect your Gmail account to play the game with your real emails.'}
            </p>
          </div>

          {/* Error notice */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Security Safeguards */}
          <div className="space-y-3 bg-[#1B1728]/70 p-4 rounded-xl border border-white/5 text-xs text-slate-300 mb-6 font-sans">
            <div className="flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Archiving Never Deletes:</strong>
                <p className="text-slate-400">Archiving moves an email out of your inbox into All Mail. It does not delete it.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-[#60A5FA] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Safe Google Sign-in:</strong>
                <p className="text-slate-400">You sign in directly with Google. We never see or store your password.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Undo Any Time:</strong>
                <p className="text-slate-400">You can reverse any move (archive, keep, reply later) with one click.</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end items-center">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 font-sans text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            {status.connected ? (
              <button
                onClick={handleDisconnect}
                disabled={isLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-sans text-xs font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unplug className="w-4 h-4" />}
                Disconnect Gmail
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-sans text-xs font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                Connect Gmail
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
