/**
 * INBOX ZERO DUNGEON — FRONTEND PERSISTENCE SERVICE
 * 
 * Communicates with the secure Node.js backend to synchronize:
 * - Player Profile (XP, level, gold, counts)
 * - Game Sessions (floor progress, session statistics)
 * - Achievements (permanent unlocking, duplicate prevention)
 * - Action History (audit trail of elemental purifications)
 * - User Preferences (sound, motion, auto-archive safety)
 * - Cloud Firestore / Local Sanctum Cache status
 */

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Checks whether Cloud Firestore or Local Sanctum Cache is active.
 */
export async function getPersistenceStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/firebase/status`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      configured: false,
      connected: false,
      storageType: 'local-sanctum-cache',
      error: err.message,
    };
  }
}

/**
 * Retrieves the persistent player profile.
 */
export async function fetchPlayerProfile() {
  try {
    const res = await fetch(`${API_BASE_URL}/player/profile`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Persistence] Profile fetch fallback:', err.message);
    return null;
  }
}

/**
 * Updates player profile stats (XP, gold, level, reviewed counts).
 */
export async function updatePlayerProfile(updates) {
  try {
    const res = await fetch(`${API_BASE_URL}/player/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Persistence] Profile save fallback:', err.message);
    return updates;
  }
}

/**
 * Saves the current game session progress snapshot.
 */
export async function saveSessionProgress(sessionData) {
  try {
    const res = await fetch(`${API_BASE_URL}/player/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(sessionData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Persistence] Session save fallback:', err.message);
    return sessionData;
  }
}

/**
 * Retrieves the latest saved game session snapshot to resume progress.
 */
export async function loadLatestSession() {
  try {
    const res = await fetch(`${API_BASE_URL}/player/session/latest`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data && data.status !== 'no_previous_session' ? data : null;
  } catch (err) {
    console.warn('[Persistence] Session load fallback:', err.message);
    return null;
  }
}

/**
 * Permanently unlocks an achievement, preventing duplicate claims.
 */
export async function unlockPlayerAchievement(achievement) {
  try {
    const res = await fetch(`${API_BASE_URL}/player/achievements/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(achievement),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Persistence] Achievement unlock fallback:', err.message);
    return { success: false, alreadyUnlocked: false, error: err.message };
  }
}

/**
 * Retrieves all unlocked achievements.
 */
export async function fetchAchievements() {
  try {
    const res = await fetch(`${API_BASE_URL}/player/achievements`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Persistence] Achievements fetch fallback:', err.message);
    return [];
  }
}

/**
 * Records an elemental action audit entry.
 */
export async function recordPlayerAction(actionData) {
  try {
    const res = await fetch(`${API_BASE_URL}/player/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(actionData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Persistence] Action record fallback:', err.message);
    return actionData;
  }
}

/**
 * Retrieves user preferences.
 */
export async function fetchUserSettings() {
  try {
    const res = await fetch(`${API_BASE_URL}/player/settings`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Persistence] Settings fetch fallback:', err.message);
    return {
      soundEnabled: true,
      reducedMotion: false,
      difficulty: 'hero',
      autoArchivePreference: false,
    };
  }
}

/**
 * Saves user preferences.
 */
export async function saveUserSettings(settings) {
  try {
    const res = await fetch(`${API_BASE_URL}/player/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Persistence] Settings save fallback:', err.message);
    return settings;
  }
}

export const fetchPlayerSettings = fetchUserSettings;
export const savePlayerSettings = saveUserSettings;


