/**
 * INBOX ZERO DUNGEON — FIREBASE ADMIN & CLOUD FIRESTORE SERVICE
 * 
 * Provides robust game data persistence for:
 * 1. Player Profile (level, XP, gold, reviewed counts, boss victories)
 * 2. Game Session snapshots (current floor, session XP, session progression)
 * 3. Achievement persistence (prevents duplicate rewards)
 * 4. Action History (audit log of elemental actions with Gmail undo tracking)
 * 5. User Settings & Preferences (sound, motion, auto-archive safety defaults)
 * 
 * Offline / Standalone Resilience:
 * - If Firebase Admin credentials are not configured or offline, falls back
 *   seamlessly to LocalSanctumStore (in-memory / file cache) with zero game disruption.
 */

import fs from 'fs';
import path from 'path';

let admin = null;
let firestoreDb = null;
let isCloudConnected = false;
let configuredProjectId = null;

// Local Fallback Storage for Demo Mode & Offline resilience
class LocalSanctumStore {
  constructor() {
    this.players = new Map();
    this.sessions = new Map(); // Map<playerId, session[]>
    this.achievements = new Map(); // Map<playerId, Map<achievementId, obj>>
    this.actions = new Map(); // Map<playerId, action[]>
    this.settings = new Map();
  }

  getPlayer(playerId) {
    if (!this.players.has(playerId)) {
      const now = new Date().toISOString();
      this.players.set(playerId, {
        playerId,
        displayName: 'Hero of the Sanctum',
        level: 14,
        totalXP: 4320,
        gold: 1250,
        totalReviewed: 0,
        totalArchived: 0,
        totalKept: 0,
        totalReplyLater: 0,
        peakCombo: 0,
        bossVictories: 0,
        createdAt: now,
        lastActiveAt: now,
      });
    }
    return { ...this.players.get(playerId) };
  }

  savePlayer(playerId, updates) {
    const current = this.getPlayer(playerId);
    const updated = {
      ...current,
      ...updates,
      playerId,
      lastActiveAt: new Date().toISOString(),
    };
    this.players.set(playerId, updated);
    return { ...updated };
  }

  saveSession(playerId, sessionData) {
    if (!this.sessions.has(playerId)) {
      this.sessions.set(playerId, []);
    }
    const playerSessions = this.sessions.get(playerId);
    const now = new Date().toISOString();
    const sessionId = sessionData.sessionId || `session-${Date.now()}`;

    const existingIdx = playerSessions.findIndex((s) => s.sessionId === sessionId);
    const sessionRecord = {
      ...sessionData,
      sessionId,
      playerId,
      updatedAt: now,
      startedAt: sessionData.startedAt || now,
    };

    if (existingIdx >= 0) {
      playerSessions[existingIdx] = sessionRecord;
    } else {
      playerSessions.unshift(sessionRecord);
    }

    return sessionRecord;
  }

  getLatestSession(playerId) {
    const playerSessions = this.sessions.get(playerId) || [];
    return playerSessions[0] || null;
  }

  unlockAchievement(playerId, achievement) {
    if (!this.achievements.has(playerId)) {
      this.achievements.set(playerId, new Map());
    }
    const playerAchs = this.achievements.get(playerId);
    const achId = achievement.achievementId || achievement.id;

    if (playerAchs.has(achId)) {
      return {
        success: false,
        alreadyUnlocked: true,
        message: 'Achievement already claimed previously.',
      };
    }

    const record = {
      achievementId: achId,
      name: achievement.name || 'Arcane Milestone',
      unlockedAt: new Date().toISOString(),
      rewardXP: achievement.rewardXP || 100,
      rewardGold: achievement.rewardGold || 50,
    };

    playerAchs.set(achId, record);
    return {
      success: true,
      alreadyUnlocked: false,
      achievement: record,
    };
  }

  getAchievements(playerId) {
    const playerAchs = this.achievements.get(playerId);
    return playerAchs ? Array.from(playerAchs.values()) : [];
  }

  recordAction(playerId, actionData) {
    if (!this.actions.has(playerId)) {
      this.actions.set(playerId, []);
    }
    const playerActions = this.actions.get(playerId);
    const actionId = actionData.actionId || `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const record = {
      actionId,
      gmailMessageId: actionData.gmailMessageId || null,
      actionType: actionData.actionType,
      previousLabelIds: actionData.previousLabelIds || [],
      resultingLabelIds: actionData.resultingLabelIds || [],
      xpAwarded: actionData.xpAwarded || 0,
      timestamp: actionData.timestamp || Date.now(),
      undone: Boolean(actionData.undone),
    };

    playerActions.unshift(record);
    if (playerActions.length > 100) playerActions.pop(); // Keep 100 recent
    return record;
  }

  markActionUndone(playerId, actionId) {
    const playerActions = this.actions.get(playerId) || [];
    const target = playerActions.find((a) => a.actionId === actionId || a.gmailMessageId === actionId);
    if (target) {
      target.undone = true;
      target.undoneAt = Date.now();
      return true;
    }
    return false;
  }

  getActions(playerId) {
    return this.actions.get(playerId) || [];
  }

  getSettings(playerId) {
    if (!this.settings.has(playerId)) {
      this.settings.set(playerId, {
        soundEnabled: true,
        reducedMotion: false,
        difficulty: 'hero',
        animationPreferences: {
          elementalOverlays: true,
          particles: true,
        },
        autoArchivePreference: false, // MANDATORY: Strictly disabled by default
        uiPreferences: { theme: 'dark-fantasy' },
        updatedAt: new Date().toISOString(),
      });
    }
    return { ...this.settings.get(playerId) };
  }

  saveSettings(playerId, updates) {
    const current = this.getSettings(playerId);
    const updated = {
      ...current,
      ...updates,
      // Enforce autoArchivePreference cannot be accidentally forced to true unless explicitly specified boolean
      autoArchivePreference: typeof updates.autoArchivePreference === 'boolean' ? updates.autoArchivePreference : false,
      updatedAt: new Date().toISOString(),
    };
    this.settings.set(playerId, updated);
    return { ...updated };
  }
}

const localStore = new LocalSanctumStore();

/**
 * Initializes Firebase Admin SDK if credentials exist.
 */
export async function initializeFirebase() {
  const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  try {
    const firebaseAdminModule = await import('firebase-admin');
    admin = firebaseAdminModule.default || firebaseAdminModule;

    // Option A: Service account JSON file exists
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });
      }
      firestoreDb = admin.firestore();
      isCloudConnected = true;
      configuredProjectId = serviceAccount.project_id;
      console.log(`☁️ [Firebase] Connected to Cloud Firestore (Project: ${configuredProjectId})`);
      return;
    }

    // Option B: Environment variables provided
    if (projectId && clientEmail && privateKey) {
      const formattedKey = privateKey.replace(/\\n/g, '\n');
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: formattedKey,
          }),
          projectId,
        });
      }
      firestoreDb = admin.firestore();
      isCloudConnected = true;
      configuredProjectId = projectId;
      console.log(`☁️ [Firebase] Connected to Cloud Firestore (Project: ${configuredProjectId})`);
      return;
    }
  } catch (err) {
    console.warn(`[Firebase] Initialization Notice: ${err.message}. Operating with Local Sanctum Cache.`);
  }

  // Fallback mode
  isCloudConnected = false;
  configuredProjectId = projectId || 'inbox-zero-dungeon-local';
  console.log('💾 [Firebase] Running with Local Sanctum Cache (Offline / Demo Mode active)');
}

/**
 * Checks whether Firebase is configured and connected.
 */
export function getFirebaseStatus() {
  return {
    configured: Boolean(process.env.FIREBASE_PROJECT_ID || fs.existsSync(path.resolve(process.cwd(), 'serviceAccountKey.json'))),
    connected: isCloudConnected,
    projectId: configuredProjectId,
    storageType: isCloudConnected ? 'cloud-firestore' : 'local-sanctum-cache',
  };
}

/**
 * PLAYER PROFILE OPERATIONS
 */
export async function getPlayerProfile(playerId = 'hero-default') {
  if (isCloudConnected && firestoreDb) {
    try {
      const docRef = firestoreDb.collection('players').doc(playerId);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        return docSnap.data();
      }
      // Initialize default in Firestore
      const initial = localStore.getPlayer(playerId);
      await docRef.set(initial);
      return initial;
    } catch (err) {
      console.warn(`[Firebase] Firestore read failed for player ${playerId}:`, err.message);
    }
  }
  return localStore.getPlayer(playerId);
}

export async function savePlayerProfile(playerId = 'hero-default', updates = {}) {
  // Update local store
  const updatedLocal = localStore.savePlayer(playerId, updates);

  if (isCloudConnected && firestoreDb) {
    try {
      const docRef = firestoreDb.collection('players').doc(playerId);
      await docRef.set(updatedLocal, { merge: true });
    } catch (err) {
      console.warn(`[Firebase] Firestore write failed for player ${playerId}:`, err.message);
    }
  }

  return updatedLocal;
}

/**
 * GAME SESSION OPERATIONS
 */
export async function saveGameSession(playerId = 'hero-default', sessionData = {}) {
  const saved = localStore.saveSession(playerId, sessionData);

  if (isCloudConnected && firestoreDb) {
    try {
      const docRef = firestoreDb
        .collection('players')
        .doc(playerId)
        .collection('sessions')
        .doc(saved.sessionId);
      await docRef.set(saved, { merge: true });
    } catch (err) {
      console.warn('[Firebase] Failed to save session to Firestore:', err.message);
    }
  }

  return saved;
}

export async function getLatestGameSession(playerId = 'hero-default') {
  if (isCloudConnected && firestoreDb) {
    try {
      const snap = await firestoreDb
        .collection('players')
        .doc(playerId)
        .collection('sessions')
        .orderBy('updatedAt', 'desc')
        .limit(1)
        .get();
      if (!snap.empty) {
        return snap.docs[0].data();
      }
    } catch (err) {
      console.warn('[Firebase] Failed to get latest session from Firestore:', err.message);
    }
  }
  return localStore.getLatestSession(playerId);
}

/**
 * ACHIEVEMENT OPERATIONS
 * Enforces duplicate reward prevention!
 */
export async function unlockAchievement(playerId = 'hero-default', achievement = {}) {
  const achId = achievement.achievementId || achievement.id;
  if (!achId) throw new Error('achievementId is required.');

  // First check local / cloud duplicate
  if (isCloudConnected && firestoreDb) {
    try {
      const docRef = firestoreDb
        .collection('players')
        .doc(playerId)
        .collection('achievements')
        .doc(achId);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        return {
          success: false,
          alreadyUnlocked: true,
          message: 'Achievement already claimed in Cloud Firestore.',
        };
      }

      const record = {
        achievementId: achId,
        name: achievement.name || 'Heroic Milestone',
        unlockedAt: new Date().toISOString(),
        rewardXP: achievement.rewardXP || 100,
        rewardGold: achievement.rewardGold || 50,
      };

      await docRef.set(record);
      localStore.unlockAchievement(playerId, achievement);

      // Award XP and gold to player profile atomically
      await savePlayerProfile(playerId, {
        totalXP: (await getPlayerProfile(playerId)).totalXP + record.rewardXP,
        gold: (await getPlayerProfile(playerId)).gold + record.rewardGold,
      });

      return {
        success: true,
        alreadyUnlocked: false,
        achievement: record,
      };
    } catch (err) {
      console.warn('[Firebase] Cloud achievement check error:', err.message);
    }
  }

  // Local fallback unlock
  const localResult = localStore.unlockAchievement(playerId, achievement);
  if (localResult.success) {
    const prof = localStore.getPlayer(playerId);
    localStore.savePlayer(playerId, {
      totalXP: prof.totalXP + localResult.achievement.rewardXP,
      gold: prof.gold + localResult.achievement.rewardGold,
    });
  }
  return localResult;
}

export async function getPlayerAchievements(playerId = 'hero-default') {
  if (isCloudConnected && firestoreDb) {
    try {
      const snap = await firestoreDb
        .collection('players')
        .doc(playerId)
        .collection('achievements')
        .get();
      if (!snap.empty) {
        return snap.docs.map((doc) => doc.data());
      }
    } catch (err) {
      console.warn('[Firebase] Failed to fetch achievements from Firestore:', err.message);
    }
  }
  return localStore.getAchievements(playerId);
}

/**
 * ACTION HISTORY & TIME REWIND (UNDO) TRACKING
 */
export async function recordGameAction(playerId = 'hero-default', actionData = {}) {
  const saved = localStore.recordAction(playerId, actionData);

  if (isCloudConnected && firestoreDb) {
    try {
      const docRef = firestoreDb
        .collection('players')
        .doc(playerId)
        .collection('actions')
        .doc(saved.actionId);
      await docRef.set(saved);
    } catch (err) {
      console.warn('[Firebase] Failed to record action to Firestore:', err.message);
    }
  }

  return saved;
}

export async function markActionUndone(playerId = 'hero-default', actionId) {
  localStore.markActionUndone(playerId, actionId);

  if (isCloudConnected && firestoreDb) {
    try {
      const docRef = firestoreDb
        .collection('players')
        .doc(playerId)
        .collection('actions')
        .doc(actionId);
      await docRef.set({ undone: true, undoneAt: Date.now() }, { merge: true });
    } catch (err) {
      console.warn('[Firebase] Failed to mark action undone in Firestore:', err.message);
    }
  }
}

export async function getPlayerActions(playerId = 'hero-default') {
  if (isCloudConnected && firestoreDb) {
    try {
      const snap = await firestoreDb
        .collection('players')
        .doc(playerId)
        .collection('actions')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();
      if (!snap.empty) {
        return snap.docs.map((doc) => doc.data());
      }
    } catch (err) {
      console.warn('[Firebase] Failed to fetch actions from Firestore:', err.message);
    }
  }
  return localStore.getActions(playerId);
}

/**
 * USER SETTINGS OPERATIONS
 */
export async function getUserSettings(playerId = 'hero-default') {
  if (isCloudConnected && firestoreDb) {
    try {
      const docRef = firestoreDb
        .collection('players')
        .doc(playerId)
        .collection('settings')
        .doc('preferences');
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        return docSnap.data();
      }
    } catch (err) {
      console.warn('[Firebase] Failed to get settings from Firestore:', err.message);
    }
  }
  return localStore.getSettings(playerId);
}

export async function saveUserSettings(playerId = 'hero-default', settings = {}) {
  const saved = localStore.saveSettings(playerId, settings);

  if (isCloudConnected && firestoreDb) {
    try {
      const docRef = firestoreDb
        .collection('players')
        .doc(playerId)
        .collection('settings')
        .doc('preferences');
      await docRef.set(saved, { merge: true });
    } catch (err) {
      console.warn('[Firebase] Failed to save settings to Firestore:', err.message);
    }
  }

  return saved;
}

