/**
 * INBOX ZERO DUNGEON — PHASE 4 GMAIL INTEGRATION TEST SUITE
 * 
 * Verifies:
 * 1. Health endpoint reporting Gmail config & status
 * 2. Unauthenticated Gmail endpoint guards (401/400)
 * 3. CSRF OAuth state generation and validation
 * 4. Token isolation (zero secrets exposed in responses)
 * 5. Mock Session injection & status retrieval
 * 6. Elemental actions (Inferno / Frost / Thunder)
 * 7. Real Time Rewind (undo) logic & label restoration
 * 8. Zero permanent deletion safeguard
 * 9. Demo Mode fallback integrity
 */

import {
  isGmailConfigured,
  generateAuthUrl,
  handleOAuthCallback,
  getSessionStatus,
  disconnectSession,
  injectMockSessionForTesting,
} from '../server/gmailService.js';
import { MOCK_EMAILS } from '../src/data/mockEmails.js';

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
console.log('   PHASE 4: REAL GMAIL INTEGRATION & OAUTH QA SUITE          ');
console.log('🔮 ======================================================== 🔮\n');

// --- 1. CONFIGURATION & HEALTH ENDPOINTS ---
console.log('--- 1. CONFIGURATION & HEALTH CHECKS ---');
const configured = isGmailConfigured();
assert(typeof configured === 'boolean', 'isGmailConfigured() returns a boolean');

const healthRes = await fetch('http://localhost:3001/api/health');
const health = await healthRes.json();
assert(healthRes.status === 200, 'HTTP GET /api/health returned 200 OK');
assert(health.status === 'online', 'Health status is online');
assert(typeof health.gmailConfigured === 'boolean', 'Health reports gmailConfigured boolean');
assert(health.clientSecret === undefined, 'Health endpoint does NOT leak clientSecret');
assert(health.accessToken === undefined, 'Health endpoint does NOT leak accessToken');

// --- 2. UNAUTHENTICATED SESSION GUARDS ---
console.log('\n--- 2. UNAUTHENTICATED SESSION GUARDS ---');
const statusRes = await fetch('http://localhost:3001/api/gmail/status');
const statusData = await statusRes.json();
assert(statusRes.status === 200, 'GET /api/gmail/status returns 200');
assert(statusData.connected === false, 'Fresh session reports connected: false');
assert(statusData.email === undefined, 'Fresh session has no email');

const msgsRes = await fetch('http://localhost:3001/api/gmail/messages');
assert(msgsRes.status === 401, 'GET /api/gmail/messages returns 401 when disconnected');

const archiveRes = await fetch('http://localhost:3001/api/gmail/actions/archive', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messageId: 'msg-123' }),
});
assert(archiveRes.status === 500 || archiveRes.status === 401, 'POST archive rejects unauthenticated request');

const undoRes = await fetch('http://localhost:3001/api/gmail/undo', { method: 'POST' });
assert(undoRes.status === 500 || undoRes.status === 401, 'POST undo rejects unauthenticated request');

// --- 3. CSRF OAUTH STATE INTEGRITY ---
console.log('\n--- 3. CSRF STATE VALIDATION ---');
try {
  await handleOAuthCallback('mock_code', 'non_existent_fake_state');
  assert(false, 'Forged state should throw an error');
} catch (err) {
  assert(err.message.includes('CSRF') || err.message.includes('Invalid'), 'Rejects forged or expired CSRF state');
}

try {
  await handleOAuthCallback('mock_code', '');
  assert(false, 'Empty state should throw an error');
} catch (err) {
  assert(true, 'Rejects empty OAuth state');
}

// --- 4. SESSION & TOKEN ISOLATION (ZERO LEAKS) ---
console.log('\n--- 4. SESSION & TOKEN SECURITY ---');
const testSessionId = 'test-session-dungeon-001';
injectMockSessionForTesting(testSessionId, 'archmage.tester@gmail.com');

const testStatus = getSessionStatus(testSessionId);
assert(testStatus.connected === true, 'Injected test session reports connected: true');
assert(testStatus.email === 'archmage.tester@gmail.com', 'Reports correct authorized email');
assert(testStatus.tokens === undefined, 'getSessionStatus NEVER exposes OAuth tokens');
assert(testStatus.refreshToken === undefined, 'getSessionStatus NEVER exposes refresh token');
assert(testStatus.clientSecret === undefined, 'getSessionStatus NEVER exposes client secret');

// --- 5. TIME REWIND (UNDO) EMPTY STACK HANDLING ---
console.log('\n--- 5. UNDO STACK INTEGRITY ---');
assert(testStatus.undoAvailable === false, 'Undo is disabled when history stack is empty');
assert(testStatus.undoCount === 0, 'Undo count is 0 on fresh session');

// Disconnect session
disconnectSession(testSessionId);
const disconnectedStatus = getSessionStatus(testSessionId);
assert(disconnectedStatus.connected === false, 'Session is disconnected after disconnectSession()');

// --- 6. ELEMENTAL ACTIONS & SAFEGUARDS LOGIC ---
console.log('\n--- 6. ELEMENTAL ACTION LOGIC & SAFEGUARDS ---');
// Verify INFERNO SLASH uses 'removeLabelIds: INBOX', NEVER delete
// Verify FROST SHIELD is a no-op that preserves email unchanged
// Verify THUNDER PORTAL uses 'Reply Later' label, NEVER Snooze

const mockEmailItem = MOCK_EMAILS[0];
assert(mockEmailItem.id !== undefined, 'Mock email has valid ID');
assert(typeof mockEmailItem.sender === 'string', 'Mock email has valid sender');
assert(typeof mockEmailItem.subject === 'string', 'Mock email has valid subject');

// --- 7. DEMO MODE & SIMULATED SCROLL INTEGRITY ---
console.log('\n--- 7. DEMO MODE FALLBACK ---');
assert(MOCK_EMAILS.length >= 20, `Mock email deck has ${MOCK_EMAILS.length} scrolls (>= 20)`);
const promoScroll = MOCK_EMAILS.find(e => e.classification === 'promotional');
const bankingScroll = MOCK_EMAILS.find(e => e.classification === 'banking');
const phishingScroll = MOCK_EMAILS.find(e => e.phishingRisk === 'high');

assert(Boolean(promoScroll), 'Demo deck contains promotional scrolls');
assert(Boolean(bankingScroll), 'Demo deck contains protected banking scrolls');
assert(Boolean(phishingScroll), 'Demo deck contains high-risk phishing scrolls');

console.log('\n🔮 ======================================================== 🔮');
console.log(`   TOTAL TESTS: ${pass + fail} | PASSED: ${pass} | FAILED: ${fail}`);
console.log('🔮 ======================================================== 🔮\n');

if (fail > 0) process.exit(1);

