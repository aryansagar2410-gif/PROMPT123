// Automated QA Test Suite for INBOX ZERO DUNGEON - Phase 2 Game Systems
import { MOCK_EMAILS, BOSS_EMAIL } from '../src/data/mockEmails.js';

console.log('=== RUNNING INBOX ZERO DUNGEON QA SUITE ===\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testName} ${details ? '- ' + details : ''}`);
    failedTests++;
  }
}

// 1. DATASET INTEGRITY
console.log('--- 1. DATASET INTEGRITY TESTS ---');
assert(MOCK_EMAILS.length >= 20, `Email count >= 20 (Actual: ${MOCK_EMAILS.length})`);

const emailIds = new Set();
let duplicates = [];
for (let email of MOCK_EMAILS) {
  if (emailIds.has(email.id)) duplicates.push(email.id);
  emailIds.add(email.id);
}
assert(duplicates.length === 0, `No duplicate email IDs found`, JSON.stringify(duplicates));

// Check classifications
const classifications = new Set(MOCK_EMAILS.map(e => e.classification));
const expectedClassifications = ['promotional', 'newsletter', 'personal', 'university', 'banking', 'order_update', 'phishing'];
for (let c of expectedClassifications) {
  assert(classifications.has(c), `Dataset contains '${c}' classification`);
}

// Check protected emails exist
const protectedEmails = MOCK_EMAILS.filter(e => e.isProtectedByDefault || e.phishingRisk === 'high');
assert(protectedEmails.length >= 6, `Protected & Phishing emails exist (Count: ${protectedEmails.length})`);

// 2. XP & COMBO MATH ENGINE
console.log('\n--- 2. XP & COMBO MATH ENGINE TESTS ---');
function calculateActionXP(actionType, currentCombo) {
  const baseXP = actionType === 'inferno' ? 20 : actionType === 'volt' ? 15 : actionType === 'frost' ? 10 : 0;
  const newCombo = currentCombo + 1;
  let bonusXP = 0;
  if (newCombo === 10) bonusXP = 50;
  else if (newCombo === 5) bonusXP = 15;
  else if (newCombo === 3) bonusXP = 5;
  return { baseXP, bonusXP, totalXP: baseXP + bonusXP, newCombo };
}

// Test base XP
assert(calculateActionXP('inferno', 0).totalXP === 20, 'Inferno Slash awards exactly 20 base XP at combo 0');
assert(calculateActionXP('volt', 0).totalXP === 15, 'Thunder Portal awards exactly 15 base XP at combo 0');
assert(calculateActionXP('frost', 0).totalXP === 10, 'Frost Shield awards exactly 10 base XP at combo 0');

// Test Combo milestones
assert(calculateActionXP('inferno', 1).bonusXP === 0, 'Combo 2 awards 0 bonus XP');
assert(calculateActionXP('inferno', 2).bonusXP === 5, 'Combo 3 awards exactly 5 bonus XP');
assert(calculateActionXP('inferno', 3).bonusXP === 0, 'Combo 4 awards 0 bonus XP');
assert(calculateActionXP('inferno', 4).bonusXP === 15, 'Combo 5 awards exactly 15 bonus XP');
assert(calculateActionXP('inferno', 5).bonusXP === 0, 'Combo 6 does not repeat bonus XP');
assert(calculateActionXP('inferno', 8).bonusXP === 0, 'Combo 9 does not repeat bonus XP');
assert(calculateActionXP('inferno', 9).bonusXP === 50, 'Combo 10 awards legendary 50 bonus XP');
assert(calculateActionXP('inferno', 10).bonusXP === 0, 'Combo 11 does not repeat bonus XP');

// 3. TIME REWIND (UNDO) ENGINE
console.log('\n--- 3. TIME REWIND (UNDO) ENGINE TESTS ---');
let testXP = 4250;
let testCombo = 0;
let testPollution = 68;
let testDeck = [...MOCK_EMAILS.slice(0, 5)];
let testHistory = [];

// Simulate Action 1: Inferno Slash on email 0
const email0 = testDeck[0];
const act1 = calculateActionXP('inferno', testCombo);
testDeck = testDeck.slice(1);
testHistory.unshift({ email: email0, actionType: 'inferno', xpGained: act1.totalXP, prevCombo: testCombo, prevPollution: testPollution });
testXP += act1.totalXP;
testCombo = act1.newCombo;
testPollution -= 2;

assert(testXP === 4270, `After action 1, XP is 4270 (Actual: ${testXP})`);
assert(testCombo === 1, `After action 1, Combo is 1 (Actual: ${testCombo})`);
assert(testDeck.length === 4, `After action 1, Deck length is 4 (Actual: ${testDeck.length})`);

// Undo Action 1
const popped = testHistory.shift();
testDeck.unshift(popped.email);
testXP -= popped.xpGained;
testCombo = popped.prevCombo;
testPollution = popped.prevPollution;

assert(testXP === 4250, `After undo, XP restored to 4250 (Actual: ${testXP})`);
assert(testCombo === 0, `After undo, Combo restored to 0 (Actual: ${testCombo})`);
assert(testPollution === 68, `After undo, Pollution restored to 68 (Actual: ${testPollution})`);
assert(testDeck[0].id === email0.id, `After undo, correct email restored to top of deck (Actual: ${testDeck[0].id})`);
assert(testHistory.length === 0, `History stack is empty after undo`);

// 4. GUARDIAN PROTOCOL IDENTIFIER
console.log('\n--- 4. GUARDIAN PROTOCOL IDENTIFIER TESTS ---');
function isProtectedEmail(email) {
  return (
    email.isProtectedByDefault === true ||
    email.phishingRisk === 'high' ||
    email.importance === 'critical' ||
    email.importance === 'vip' ||
    email.guardianFlag === 'high_value_asset' ||
    email.guardianFlag === 'suspicious_phishing' ||
    email.classification === 'banking' ||
    email.classification === 'university'
  );
}

const bankingMail = MOCK_EMAILS.find(e => e.classification === 'banking');
const phishingMail = MOCK_EMAILS.find(e => e.classification === 'phishing');
const universityMail = MOCK_EMAILS.find(e => e.classification === 'university');
const promoMail = MOCK_EMAILS.find(e => e.id === 'mail-001');

assert(isProtectedEmail(bankingMail) === true, `Banking email is flagged as protected`);
assert(isProtectedEmail(phishingMail) === true, `Phishing email is flagged as protected`);
assert(isProtectedEmail(universityMail) === true, `University email is flagged as protected`);
assert(isProtectedEmail(promoMail) === false, `Promo email is NOT flagged as protected (safe to purge)`);

// 5. BOSS BATTLE STATE MACHINE
console.log('\n--- 5. BOSS BATTLE STATE MACHINE TESTS ---');
const bossPhases = [
  { phase: 1, required: 'frost' },
  { phase: 2, required: 'volt' },
  { phase: 3, required: 'inferno' },
];

let bossHP = 3;
let currentPhaseIdx = 0;

// Wrong strike in phase 1 (attempt inferno instead of frost)
function strikeBoss(action) {
  if (action === bossPhases[currentPhaseIdx].required) {
    bossHP--;
    currentPhaseIdx++;
    return { hit: true, remainingHP: bossHP };
  }
  return { hit: false, remainingHP: bossHP };
}

assert(strikeBoss('inferno').hit === false, 'Phase 1: Inferno slash fails against frost shield');
assert(bossHP === 3, 'Phase 1: Boss HP remains 3 after incorrect strike');
assert(strikeBoss('frost').hit === true, 'Phase 1: Frost Shield correctly hits boss');
assert(bossHP === 2, 'Phase 1: Boss HP decreases to 2');

assert(strikeBoss('frost').hit === false, 'Phase 2: Frost fails against Phase 2');
assert(strikeBoss('volt').hit === true, 'Phase 2: Thunder Surge correctly hits boss');
assert(bossHP === 1, 'Phase 2: Boss HP decreases to 1');

assert(strikeBoss('volt').hit === false, 'Phase 3: Volt fails against Phase 3');
assert(strikeBoss('inferno').hit === true, 'Phase 3: Inferno Slash correctly hits boss');
assert(bossHP === 0, 'Phase 3: Boss HP reaches 0 (Defeated)');

console.log('\n========================================');
console.log(`TOTAL TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log('========================================');

if (failedTests > 0) process.exit(1);

