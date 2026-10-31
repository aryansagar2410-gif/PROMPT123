/**
 * INBOX ZERO DUNGEON — SECURE BACKEND API SERVER
 * 
 * Provides:
 * 1. Cloud Firestore / Firebase Admin SDK data persistence (Profile, Sessions, Achievements, Actions, Settings)
 * 2. Real Gmail OAuth 2.0 flow & Gmail API operations (archive, keep, reply-later, undo)
 * 3. Secure server-side Gemini AI classification
 * 4. Guardian Protocol independent safety evaluation
 * 5. Scan aggregation & status reporting
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { classifyEmailWithGemini } from './geminiService.js';
import { evaluateGuardianProtocol } from './guardianEngine.js';
import {
  isGmailConfigured,
  generateAuthUrl,
  handleOAuthCallback,
  getSessionStatus,
  disconnectSession,
  fetchInboxMessages,
  archiveMessage,
  keepMessage,
  replyLaterMessage,
  undoLastAction,
} from './gmailService.js';
import {
  initializeFirebase,
  getFirebaseStatus,
  getPlayerProfile,
  savePlayerProfile,
  saveGameSession,
  getLatestGameSession,
  unlockAchievement,
  getPlayerAchievements,
  recordGameAction,
  markActionUndone,
  getPlayerActions,
  getUserSettings,
  saveUserSettings,
} from './firebaseService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const SESSION_SECRET = process.env.SESSION_SECRET || 'dungeon-arcane-session-secret-key';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// CORS configuration supporting credentials (cookies & auth headers)
const allowedOrigins = [
  FRONTEND_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser(SESSION_SECRET));

// Session resolution helper
function getOrCreateSessionId(req, res) {
  let sessionId =
    req.signedCookies?.dungeon_session ||
    req.cookies?.dungeon_session ||
    req.headers['x-dungeon-session'];

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    res.cookie('dungeon_session', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      signed: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }
  return sessionId;
}

// Player identity resolution (Gmail email if authorized, otherwise isolated session ID)
function resolvePlayerId(req, res) {
  const sessionId = getOrCreateSessionId(req, res);
  const status = getSessionStatus(sessionId);
  if (status && status.connected && status.email) {
    return status.email;
  }
  return req.headers['x-player-id'] || `hero-${sessionId.slice(0, 8)}`;
}

// Sanitize logs: never print full email bodies, client secrets, or auth tokens
function logSanitizedRequest(type, id, details) {
  const cleanDetails = (details || '').slice(0, 45);
  console.log(`[Backend ${new Date().toISOString()}] ${type} | ID: ${id || 'unknown'} | ${cleanDetails}`);
}

/**
 * GET /api/health
 * Returns service status, Gemini AI status, Gmail config, and Firebase persistence status.
 */
app.get('/api/health', (req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('placeholder'));
  const gmailConfigured = isGmailConfigured();
  const fbStatus = getFirebaseStatus();

  res.json({
    status: 'online',
    service: 'Inbox Zero Dungeon Backend',
    version: '1.3.0 (Phase 5 Firebase Integration)',
    geminiConfigured: hasGeminiKey,
    gmailConfigured,
    firebase: fbStatus,
    activeModel: hasGeminiKey ? 'gemini-3.8-flash' : 'local-deterministic-fallback (Demo Mode)',
    timestamp: new Date().toISOString(),
  });
});

/* ==========================================================================
   FIREBASE & GAME DATA PERSISTENCE ENDPOINTS
   ========================================================================== */

/**
 * GET /api/firebase/status
 * Returns current Cloud Firestore / local persistence connection status.
 */
app.get('/api/firebase/status', (req, res) => {
  res.json(getFirebaseStatus());
});

/**
 * GET /api/player/profile
 * Retrieves persistent profile for current player.
 */
app.get('/api/player/profile', async (req, res) => {
  try {
    const playerId = resolvePlayerId(req, res);
    const profile = await getPlayerProfile(playerId);
    res.json(profile);
  } catch (err) {
    console.error('[Backend] Failed to get player profile:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/player/profile
 * Updates persistent player profile (XP, level, gold, counters).
 */
app.post('/api/player/profile', async (req, res) => {
  try {
    const playerId = resolvePlayerId(req, res);
    const updates = req.body || {};
    const updated = await savePlayerProfile(playerId, updates);
    res.json(updated);
  } catch (err) {
    console.error('[Backend] Failed to update player profile:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/player/session
 * Saves a game session snapshot (floor, session XP, reviewed count).
 */
app.post('/api/player/session', async (req, res) => {
  try {
    const playerId = resolvePlayerId(req, res);
    const sessionData = req.body || {};
    const saved = await saveGameSession(playerId, sessionData);
    res.json(saved);
  } catch (err) {
    console.error('[Backend] Failed to save session:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/player/session/latest
 * Restores the player's latest game state on resume.
 */
app.get('/api/player/session/latest', async (req, res) => {
  try {
    const playerId = resolvePlayerId(req, res);
    const session = await getLatestGameSession(playerId);
    res.json(session || { status: 'no_previous_session' });
  } catch (err) {
    console.error('[Backend] Failed to get latest session:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/player/achievements/unlock
 * Permanently unlocks an achievement, strictly preventing duplicate claims.
 */
app.post('/api/player/achievements/unlock', async (req, res) => {
  try {
    const playerId = resolvePlayerId(req, res);
    const achievement = req.body || {};
    const result = await unlockAchievement(playerId, achievement);
    res.json(result);
  } catch (err) {
    console.error('[Backend] Failed to unlock achievement:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/player/achievements
 * Fetches all unlocked achievements for the player.
 */
app.get('/api/player/achievements', async (req, res) => {
  try {
    const playerId = resolvePlayerId(req, res);
    const achievements = await getPlayerAchievements(playerId);
    res.json(achievements);
  } catch (err) {
    console.error('[Backend] Failed to get achievements:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/player/action
 * Persists an elemental action audit entry.
 */
app.post('/api/player/action', async (req, res) => {
  try {
    const playerId = resolvePlayerId(req, res);
    const actionData = req.body || {};
    const recorded = await recordGameAction(playerId, actionData);
    res.json(recorded);
  } catch (err) {
    console.error('[Backend] Failed to record action:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/player/actions
 * Retrieves player's action history audit trail.
 */
app.get('/api/player/actions', async (req, res) => {
  try {
    const playerId = resolvePlayerId(req, res);
    const actions = await getPlayerActions(playerId);
    res.json(actions);
  } catch (err) {
    console.error('[Backend] Failed to get actions:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/player/settings
 * Retrieves user preferences (with autoArchive strictly disabled by default).
 */
app.get('/api/player/settings', async (req, res) => {
  try {
    const playerId = resolvePlayerId(req, res);
    const settings = await getUserSettings(playerId);
    res.json(settings);
  } catch (err) {
    console.error('[Backend] Failed to get settings:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/player/settings
 * Updates user preferences.
 */
app.post('/api/player/settings', async (req, res) => {
  try {
    const playerId = resolvePlayerId(req, res);
    const updates = req.body || {};
    const updated = await saveUserSettings(playerId, updates);
    res.json(updated);
  } catch (err) {
    console.error('[Backend] Failed to save settings:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================================================
   GMAIL OAUTH 2.0 & MANAGEMENT ENDPOINTS
   ========================================================================== */

/**
 * GET /api/gmail/auth-url
 * Generates an OAuth 2.0 authorization URL with CSRF state token.
 */
app.get('/api/gmail/auth-url', (req, res) => {
  try {
    const sessionId = getOrCreateSessionId(req, res);
    const { authUrl, state } = generateAuthUrl(sessionId);

    logSanitizedRequest('GMAIL_AUTH_URL', sessionId.slice(0, 8), 'Generated authorization URL');
    res.json({ authUrl, state });
  } catch (err) {
    console.error('[Backend] Failed to generate Gmail Auth URL:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/gmail/callback
 * Handles the OAuth 2.0 callback from Google.
 */
app.get('/api/gmail/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.warn('[Backend] Google OAuth returned error:', error);
      return res.redirect(`${FRONTEND_ORIGIN}/#/dashboard?gmail_error=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      return res.status(400).send('Missing code or state parameter.');
    }

    const { sessionId, email } = await handleOAuthCallback(code, state);

    // Set signed cookie on user's browser
    res.cookie('dungeon_session', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      signed: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    logSanitizedRequest('GMAIL_CONNECTED', sessionId.slice(0, 8), `Authorized account: ${email}`);
    res.redirect(`${FRONTEND_ORIGIN}/#/dashboard?gmail_connected=true&email=${encodeURIComponent(email)}`);
  } catch (err) {
    console.error('[Backend] OAuth callback failed:', err.message);
    res.redirect(`${FRONTEND_ORIGIN}/#/dashboard?gmail_error=${encodeURIComponent(err.message)}`);
  }
});

/**
 * GET /api/gmail/status
 * Returns current Gmail connection status for the session.
 */
app.get('/api/gmail/status', (req, res) => {
  const sessionId = getOrCreateSessionId(req, res);
  const status = getSessionStatus(sessionId);
  res.json(status);
});

/**
 * POST /api/gmail/disconnect
 * Disconnects the Gmail account and clears server tokens.
 */
app.post('/api/gmail/disconnect', (req, res) => {
  const sessionId = getOrCreateSessionId(req, res);
  disconnectSession(sessionId);
  res.clearCookie('dungeon_session');
  logSanitizedRequest('GMAIL_DISCONNECT', sessionId.slice(0, 8), 'Account disconnected');
  res.json({ success: true, connected: false });
});

/**
 * GET /api/gmail/messages
 * Fetches the latest 50 inbox messages from real Gmail.
 */
app.get('/api/gmail/messages', async (req, res) => {
  try {
    const sessionId = getOrCreateSessionId(req, res);
    const maxResults = parseInt(req.query.maxResults, 10) || 50;

    logSanitizedRequest('GMAIL_FETCH_MSGS', sessionId.slice(0, 8), `Fetching max ${maxResults} messages`);
    const result = await fetchInboxMessages(sessionId, maxResults);

    res.json(result);
  } catch (err) {
    console.error('[Backend] Failed to fetch Gmail messages:', err.message);
    const status = err.message.includes('not connected') ? 401 : 500;
    res.status(status).json({ error: err.message });
  }
});

/* ==========================================================================
   ELEMENTAL ACTIONS & TIME REWIND (UNDO)
   ========================================================================== */

/**
 * POST /api/gmail/actions/archive (LEFT — INFERNO SLASH)
 * Removes the INBOX label. Never deletes. Records in persistent audit log.
 */
app.post('/api/gmail/actions/archive', async (req, res) => {
  try {
    const sessionId = getOrCreateSessionId(req, res);
    const playerId = resolvePlayerId(req, res);
    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({ error: 'messageId is required.' });
    }

    logSanitizedRequest('GMAIL_ARCHIVE', messageId, 'Inferno Slash executed');
    const result = await archiveMessage(sessionId, messageId);

    // Persist in action history
    await recordGameAction(playerId, {
      gmailMessageId: messageId,
      actionType: 'inferno',
      xpAwarded: 20,
    });

    res.json(result);
  } catch (err) {
    console.error('[Backend] Archive action failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/gmail/actions/keep (RIGHT — FROST SHIELD)
 * Retains the email in the inbox without modifying labels.
 */
app.post('/api/gmail/actions/keep', async (req, res) => {
  try {
    const sessionId = getOrCreateSessionId(req, res);
    const playerId = resolvePlayerId(req, res);
    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({ error: 'messageId is required.' });
    }

    logSanitizedRequest('GMAIL_KEEP', messageId, 'Frost Shield executed');
    const result = await keepMessage(sessionId, messageId);

    // Persist in action history
    await recordGameAction(playerId, {
      gmailMessageId: messageId,
      actionType: 'frost',
      xpAwarded: 10,
    });

    res.json(result);
  } catch (err) {
    console.error('[Backend] Keep action failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/gmail/actions/reply-later (UP — THUNDER PORTAL)
 * Adds the 'Reply Later' label (creates label if missing).
 */
app.post('/api/gmail/actions/reply-later', async (req, res) => {
  try {
    const sessionId = getOrCreateSessionId(req, res);
    const playerId = resolvePlayerId(req, res);
    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({ error: 'messageId is required.' });
    }

    logSanitizedRequest('GMAIL_REPLY_LATER', messageId, 'Thunder Portal executed');
    const result = await replyLaterMessage(sessionId, messageId);

    // Persist in action history
    await recordGameAction(playerId, {
      gmailMessageId: messageId,
      actionType: 'volt',
      xpAwarded: 15,
    });

    res.json(result);
  } catch (err) {
    console.error('[Backend] Reply Later action failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/gmail/undo (TIME REWIND)
 * Reverses the last elemental action on Gmail and updates persistent audit history.
 */
app.post('/api/gmail/undo', async (req, res) => {
  try {
    const sessionId = getOrCreateSessionId(req, res);
    const playerId = resolvePlayerId(req, res);
    logSanitizedRequest('GMAIL_UNDO', sessionId.slice(0, 8), 'Time Rewind requested');
    const result = await undoLastAction(sessionId);

    // Mark action undone in persistent history
    if (result.messageId) {
      await markActionUndone(playerId, result.messageId);
    }

    res.json(result);
  } catch (err) {
    console.error('[Backend] Time Rewind failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================================================
   AI CLASSIFICATION & SANCTUM SCAN
   ========================================================================== */

/**
 * POST /api/classify
 * Classifies an email and evaluates Guardian Protocol safety rules.
 */
app.post('/api/classify', async (req, res) => {
  try {
    const { email, options = {} } = req.body;

    if (!email || typeof email !== 'object' || !email.id) {
      return res.status(400).json({
        error: 'Invalid request payload: email object with id is required.',
      });
    }

    logSanitizedRequest('CLASSIFY', email.id, email.subject);

    const geminiResult = await classifyEmailWithGemini(email);
    const guardianResult = evaluateGuardianProtocol(email, geminiResult.data, options);

    return res.json({
      emailId: email.id,
      gemini: geminiResult.data,
      guardian: guardianResult,
      isDemoMode: geminiResult.isDemoMode,
      message: geminiResult.message,
    });
  } catch (err) {
    console.error('[Backend] Classification route failure:', err.message);
    res.status(500).json({
      error: 'Internal server error processing AI classification.',
      details: err.message,
    });
  }
});

/**
 * POST /api/scan
 * Batch classifies an array of emails and groups them into categories.
 */
app.post('/api/scan', async (req, res) => {
  try {
    const { emails = [], options = {} } = req.body;

    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Array of emails is required.' });
    }

    logSanitizedRequest('BATCH_SCAN', `Count: ${emails.length}`, `Scanning ${emails.length} scrolls`);

    const scanResults = [];
    const obviousJunk = [];
    const obviousKeep = [];
    const ambiguous = [];
    const autoArchiveCandidates = [];

    for (const email of emails) {
      const geminiResult = await classifyEmailWithGemini(email);
      const guardianResult = evaluateGuardianProtocol(email, geminiResult.data, options);

      const record = {
        emailId: email.id,
        gemini: geminiResult.data,
        guardian: guardianResult,
        isDemoMode: geminiResult.isDemoMode,
      };

      scanResults.push(record);

      if (guardianResult.autoArchiveEligible) {
        autoArchiveCandidates.push(email.id);
      }

      if (geminiResult.data.classification === 'obvious-junk') {
        obviousJunk.push(email.id);
      } else if (geminiResult.data.classification === 'obvious-keep') {
        obviousKeep.push(email.id);
      } else {
        ambiguous.push(email.id);
      }
    }

    return res.json({
      totalScanned: emails.length,
      obviousJunkCount: obviousJunk.length,
      obviousKeepCount: obviousKeep.length,
      ambiguousCount: ambiguous.length,
      autoArchiveCandidatesCount: autoArchiveCandidates.length,
      autoArchiveCandidates,
      categories: {
        obviousJunk,
        obviousKeep,
        ambiguous,
      },
      results: scanResults,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Backend] Batch scan failure:', err.message);
    res.status(500).json({
      error: 'Internal server error processing batch scan.',
      details: err.message,
    });
  }
});

// Boot server and initialize Firebase
app.listen(PORT, async () => {
  console.log(`⚔️ [Inbox Zero Dungeon] Backend running on port ${PORT}`);
  console.log(`🔒 Gemini API Key configured: ${Boolean(process.env.GEMINI_API_KEY)}`);
  console.log(`📧 Gmail OAuth configured: ${isGmailConfigured()}`);
  await initializeFirebase();
});
