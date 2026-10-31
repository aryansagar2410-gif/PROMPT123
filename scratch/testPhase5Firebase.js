/**
 * INBOX ZERO DUNGEON — PHASE 5 FIREBASE & DATA PERSISTENCE QA SUITE
 * 
 * Verifies:
 * 1. Firebase Admin / Local persistence initialization and status reporting
 * 2. Player profile creation, XP, level, and gold progression
 * 3. Session state snapshot saving & latest session retrieval
 * 4. Permanent achievement unlocking and DUPLICATE REWARD PREVENTION
 * 5. Action history audit trail & Undo status tracking
 * 6. User preferences persistence (autoArchivePreference: false safety default)
 * 7. Multi-user data isolation (User A cannot access or overwrite User B)
 * 8. Offline & Demo Mode resilience without Firebase cloud dependencies
 * 9. REST API integration on port 3001
 */

import {
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
} from '../server/firebaseService.js';

let pass = 0;
let fail = 0;

function assert(condition, message, errorDetail = '') {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    pass++;
  } else {
    console.error(`❌ FAIL: ${message} ${errorDetail ? '(' + errorDetail + ')' : ''}`);
    fail++;
  }
}

console.log('🔮 ======================================================== 🔮');
console.log('   PHASE 5: FIREBASE & GAME DATA PERSISTENCE QA SUITE        ');
console.log('🔮 ======================================================== 🔮\n');

// --- 1. INITIALIZATION & STATUS ---
console.log('--- 1. INITIALIZATION & STATUS ---');
const status = getFirebaseStatus();
assert(typeof status.configured === 'boolean', 'Persistence status reports configured boolean');
assert(typeof status.connected === 'boolean', 'Persistence status reports connected boolean');
assert(typeof status.storageType === 'string', `Storage type is "${status.storageType}"`);

// --- 2. PLAYER PROFILE PERSISTENCE ---
console.log('\n--- 2. PLAYER PROFILE PERSISTENCE ---');
const testPlayerId = `test-hero-${Date.now()}`;
const initialProfile = await getPlayerProfile(testPlayerId);
assert(initialProfile.playerId === testPlayerId, 'Creates player profile with correct ID');
assert(typeof initialProfile.totalXP === 'number', 'Profile has numeric totalXP');
assert(typeof initialProfile.level === 'number', 'Profile has numeric level');
assert(typeof initialProfile.gold === 'number', 'Profile has numeric gold');

const updatedProfile = await savePlayerProfile(testPlayerId, {
  totalXP: 5200,
  level: 16,
  gold: 1500,
  totalReviewed: 25,
  totalArchived: 18,
  totalKept: 5,
  totalReplyLater: 2,
  bossVictories: 1,
});
assert(updatedProfile.totalXP === 5200, 'Persists updated totalXP');
assert(updatedProfile.level === 16, 'Persists updated level');
assert(updatedProfile.gold === 1500, 'Persists updated gold');
assert(updatedProfile.bossVictories === 1, 'Persists boss victory count');

const fetchedProfile = await getPlayerProfile(testPlayerId);
assert(fetchedProfile.totalXP === 5200, 'Fetches persisted totalXP accurately');
assert(fetchedProfile.bossVictories === 1, 'Fetches persisted boss victories accurately');

// --- 3. GAME SESSION SNAPSHOT & RESTORATION ---
console.log('\n--- 3. GAME SESSION PERSISTENCE & RESTORATION ---');
const sessionData = {
  sessionId: `sess-${Date.now()}`,
  floor: 2,
  emailsReviewed: 15,
  sessionXP: 320,
  sessionPollution: 45,
  peakCombo: 7,
  status: 'in-progress',
};
const savedSession = await saveGameSession(testPlayerId, sessionData);
assert(savedSession.floor === 2, 'Saves current floor in session snapshot');
assert(savedSession.sessionXP === 320, 'Saves session XP');

const latestSession = await getLatestGameSession(testPlayerId);
assert(latestSession !== null, 'Restores latest game session snapshot');
assert(latestSession.floor === 2, 'Restored session has correct floor');
assert(latestSession.peakCombo === 7, 'Restored session has correct peak combo');

// --- 4. PERMANENT ACHIEVEMENTS & DUPLICATE REWARD PREVENTION ---
console.log('\n--- 4. ACHIEVEMENTS & DUPLICATE CLAIM PREVENTION ---');
const testAchievement = {
  id: 'first_purge',
  name: 'First Blood of Clutter',
  rewardXP: 100,
  rewardGold: 50,
};

// First claim: Should succeed
const claim1 = await unlockAchievement(testPlayerId, testAchievement);
assert(claim1.success === true, 'First achievement unlock succeeds');
assert(claim1.alreadyUnlocked === false, 'alreadyUnlocked is false on first claim');

// Second claim with same achievement ID: MUST be rejected
const claim2 = await unlockAchievement(testPlayerId, testAchievement);
assert(claim2.success === false, 'Duplicate achievement unlock is REJECTED');
assert(claim2.alreadyUnlocked === true, 'alreadyUnlocked is true on duplicate claim');

const playerAchs = await getPlayerAchievements(testPlayerId);
const matching = playerAchs.filter(a => a.achievementId === 'first_purge');
assert(matching.length === 1, 'Achievement exists exactly once in player records (zero duplicate entries)');

// --- 5. ACTION HISTORY & TIME REWIND (UNDO) TRACKING ---
console.log('\n--- 5. ACTION HISTORY & TIME REWIND TRACKING ---');
const actionRecord = await recordGameAction(testPlayerId, {
  gmailMessageId: 'gmail-msg-888',
  actionType: 'inferno',
  previousLabelIds: ['INBOX', 'UNREAD'],
  resultingLabelIds: [],
  xpAwarded: 20,
  timestamp: Date.now(),
});
assert(actionRecord.actionId !== undefined, 'Action record has unique actionId');
assert(actionRecord.undone === false, 'Action is initially marked undone: false');

await markActionUndone(testPlayerId, actionRecord.actionId);
const actionsList = await getPlayerActions(testPlayerId);
const targetAction = actionsList.find(a => a.actionId === actionRecord.actionId);
assert(targetAction !== undefined, 'Target action exists in action history');
assert(targetAction.undone === true, 'Action is accurately updated to undone: true after Time Rewind');

// --- 6. USER SETTINGS & SAFETY DEFAULTS ---
console.log('\n--- 6. USER SETTINGS & SAFETY DEFAULTS ---');
const settings = await getUserSettings(testPlayerId);
assert(settings.autoArchivePreference === false, 'autoArchivePreference is strictly DISABLED by default');

const updatedSettings = await saveUserSettings(testPlayerId, {
  soundEnabled: false,
  reducedMotion: true,
  autoArchivePreference: false,
});
assert(updatedSettings.soundEnabled === false, 'Saves sound preference');
assert(updatedSettings.reducedMotion === true, 'Saves reduced motion preference');
assert(updatedSettings.autoArchivePreference === false, 'Keeps autoArchive disabled');

// --- 7. MULTI-USER DATA ISOLATION ---
console.log('\n--- 7. USER DATA ISOLATION (CROSS-USER PROTECTION) ---');
const playerAId = `player-A-${Date.now()}`;
const playerBId = `player-B-${Date.now()}`;

await savePlayerProfile(playerAId, { totalXP: 9999, level: 30 });
await savePlayerProfile(playerBId, { totalXP: 100, level: 1 });

const profileA = await getPlayerProfile(playerAId);
const profileB = await getPlayerProfile(playerBId);

assert(profileA.totalXP === 9999, 'Player A data is isolated and intact');
assert(profileB.totalXP === 100, 'Player B data is isolated and intact');
assert(profileA.totalXP !== profileB.totalXP, 'Players cannot read or overwrite each other');

// --- 8. LIVE BACKEND REST ENDPOINTS ---
console.log('\n--- 8. LIVE BACKEND REST ENDPOINTS INTEGRATION ---');
try {
  // 1. Health check includes persistence
  const healthRes = await fetch('http://localhost:3001/api/health');
  const healthData = await healthRes.json();
  assert(healthRes.status === 200, 'GET /api/health returned 200 OK');
  assert(Boolean(healthData.firebase), 'Health response includes firebase status');

  // 2. Firebase status endpoint
  const fbRes = await fetch('http://localhost:3001/api/firebase/status');
  const fbData = await fbRes.json();
  assert(fbRes.status === 200, 'GET /api/firebase/status returned 200 OK');
  assert(typeof fbData.storageType === 'string', 'Firebase status returns storageType');

  // 3. Player profile endpoint
  const profRes = await fetch('http://localhost:3001/api/player/profile');
  const profData = await profRes.json();
  assert(profRes.status === 200, 'GET /api/player/profile returned 200 OK');
  assert(typeof profData.level === 'number', 'API returns player level');

  // 4. Player settings endpoint
  const setRes = await fetch('http://localhost:3001/api/player/settings');
  const setData = await setRes.json();
  assert(setRes.status === 200, 'GET /api/player/settings returned 200 OK');
  assert(setData.autoArchivePreference === false, 'API settings confirm autoArchive is false by default');
} catch (err) {
  assert(false, 'Live HTTP endpoint check', err.message);
}

console.log('\n🔮 ======================================================== 🔮');
console.log(`   TOTAL TESTS: ${pass + fail} | PASSED: ${pass} | FAILED: ${fail}`);
console.log('🔮 ======================================================== 🔮\n');

if (fail > 0) process.exit(1);

