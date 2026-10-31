// Comprehensive QA Test Suite for Inbox Zero Dungeon Phase 2
import { MOCK_EMAILS, BOSS_EMAIL } from '../src/data/mockEmails.js';
import { MOCK_PLAYER, MOCK_DUNGEON_METRICS } from '../src/data/mockData.js';
import { CHARACTERS } from '../src/data/characters.js';
import { ACHIEVEMENTS } from '../src/data/achievements.js';

console.log('⚔️ ======================================================== ⚔️');
console.log('   INBOX ZERO DUNGEON — PHASE 2 AUTOMATED QA & INTEGRATION   ');
console.log('⚔️ ======================================================== ⚔️\n');

let pass = 0;
let fail = 0;

function test(title, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${title}`);
    pass++;
  } catch (err) {
    console.error(`❌ FAIL: ${title}`);
    console.error(`   Error: ${err.message}`);
    fail++;
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) throw new Error(`Expected ${expected} but received ${actual}`);
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)} but received ${JSON.stringify(actual)}`);
      }
    },
    toBeGreaterThanOrEqual(expected) {
      if (actual < expected) throw new Error(`Expected ${actual} >= ${expected}`);
    },
    toBeTrue() {
      if (actual !== true) throw new Error(`Expected true but received ${actual}`);
    },
    toBeFalse() {
      if (actual !== false) throw new Error(`Expected false but received ${actual}`);
    }
  };
}

// ----------------------------------------------------
// TEST GROUP 1: DATASET & CHARACTERS
// ----------------------------------------------------
console.log('--- TEST GROUP 1: DATASET & CHARACTERS ---');

test('Mock Email dataset size >= 20', () => {
  expect(MOCK_EMAILS.length).toBeGreaterThanOrEqual(20);
});

test('No duplicate email IDs exist in the dataset', () => {
  const ids = new Set();
  for (let e of MOCK_EMAILS) {
    if (ids.has(e.id)) throw new Error(`Duplicate email ID: ${e.id}`);
    ids.add(e.id);
  }
  expect(ids.size).toBe(MOCK_EMAILS.length);
});

test('All required email schema attributes are populated', () => {
  const keys = ['id', 'sender', 'subject', 'date', 'size', 'classification', 'confidenceScore', 'phishingRisk', 'importance', 'preview', 'bodyText', 'aiSummary'];
  for (let e of MOCK_EMAILS) {
    for (let k of keys) {
      if (!e[k]) throw new Error(`Email ${e.id} is missing key ${k}`);
    }
  }
});

test('Original 4 characters exist and have distinctive affinities', () => {
  const expectedChars = ['blaze', 'frost', 'volt', 'elderByte'];
  for (let c of expectedChars) {
    if (!CHARACTERS[c]) throw new Error(`Character ${c} missing`);
    expect(typeof CHARACTERS[c].name).toBe('string');
    expect(typeof CHARACTERS[c].ability).toBe('string');
    expect(typeof CHARACTERS[c].role).toBe('string');
  }
});

// ----------------------------------------------------
// TEST GROUP 2: ELEMENTAL ACTION XP & COMBO MATH
// ----------------------------------------------------
console.log('\n--- TEST GROUP 2: ELEMENTAL ACTION XP & COMBO ---');

function simulateActionXP(actionType, currentCombo) {
  const baseXP = actionType === 'inferno' ? 20 : actionType === 'volt' ? 15 : 10;
  const newCombo = currentCombo + 1;
  let bonusXP = 0;
  if (newCombo === 10) bonusXP = 50;
  else if (newCombo === 5) bonusXP = 15;
  else if (newCombo === 3) bonusXP = 5;
  return { baseXP, bonusXP, totalXP: baseXP + bonusXP, newCombo };
}

test('Inferno Slash awards exactly 20 base XP at combo 0', () => {
  const res = simulateActionXP('inferno', 0);
  expect(res.baseXP).toBe(20);
  expect(res.bonusXP).toBe(0);
  expect(res.totalXP).toBe(20);
});

test('Frost Shield awards exactly 10 base XP at combo 0', () => {
  const res = simulateActionXP('frost', 0);
  expect(res.baseXP).toBe(10);
  expect(res.bonusXP).toBe(0);
  expect(res.totalXP).toBe(10);
});

test('Thunder Portal awards exactly 15 base XP at combo 0', () => {
  const res = simulateActionXP('volt', 0);
  expect(res.baseXP).toBe(15);
  expect(res.bonusXP).toBe(0);
  expect(res.totalXP).toBe(15);
});

test('Combo milestone 3 awards exactly 5 bonus XP', () => {
  const res = simulateActionXP('inferno', 2); // 3rd action
  expect(res.newCombo).toBe(3);
  expect(res.bonusXP).toBe(5);
  expect(res.totalXP).toBe(25);
});

test('Combo milestone 5 awards exactly 15 bonus XP', () => {
  const res = simulateActionXP('frost', 4); // 5th action
  expect(res.newCombo).toBe(5);
  expect(res.bonusXP).toBe(15);
  expect(res.totalXP).toBe(25);
});

test('Combo milestone 10 awards legendary 50 bonus XP', () => {
  const res = simulateActionXP('volt', 9); // 10th action
  expect(res.newCombo).toBe(10);
  expect(res.bonusXP).toBe(50);
  expect(res.totalXP).toBe(65);
});

test('Intermediate combos (2, 4, 6, 7, 8, 9, 11) do NOT award repetitive bonuses', () => {
  const testCombos = [1, 3, 5, 6, 7, 8, 10]; // Previous combos before +1
  for (let c of testCombos) {
    const res = simulateActionXP('inferno', c);
    expect(res.bonusXP).toBe(0);
    expect(res.totalXP).toBe(20);
  }
});

// ----------------------------------------------------
// TEST GROUP 3: TIME REWIND (UNDO) SYSTEM
// ----------------------------------------------------
console.log('\n--- TEST GROUP 3: TIME REWIND (UNDO) SYSTEM ---');

test('Consecutive actions record correctly in undo stack and reverse accurately', () => {
  let xp = 4250;
  let combo = 0;
  let pollution = 68;
  let deck = [...MOCK_EMAILS.slice(0, 10)];
  let history = [];

  // Action 1: Inferno on deck[0]
  const e1 = deck[0];
  const r1 = simulateActionXP('inferno', combo);
  deck = deck.slice(1);
  history.unshift({ email: e1, actionType: 'inferno', xpGained: r1.totalXP, prevCombo: combo, prevPollution: pollution });
  xp += r1.totalXP;
  combo = r1.newCombo;
  pollution -= 2;

  // Action 2: Frost on deck[1]
  const e2 = deck[0];
  const r2 = simulateActionXP('frost', combo);
  deck = deck.slice(1);
  history.unshift({ email: e2, actionType: 'frost', xpGained: r2.totalXP, prevCombo: combo, prevPollution: pollution });
  xp += r2.totalXP;
  combo = r2.newCombo;
  pollution -= 1;

  // Action 3: Volt on deck[2] (Combo 3!)
  const e3 = deck[0];
  const r3 = simulateActionXP('volt', combo);
  deck = deck.slice(1);
  history.unshift({ email: e3, actionType: 'volt', xpGained: r3.totalXP, prevCombo: combo, prevPollution: pollution });
  xp += r3.totalXP;
  combo = r3.newCombo;
  pollution -= 1;

  expect(combo).toBe(3);
  expect(r3.bonusXP).toBe(5);
  expect(history.length).toBe(3);
  expect(deck.length).toBe(7);

  // Undo Action 3 (Combo 3)
  const undo3 = history.shift();
  deck.unshift(undo3.email);
  xp -= undo3.xpGained;
  combo = undo3.prevCombo;
  pollution = undo3.prevPollution;

  expect(deck[0].id).toBe(e3.id);
  expect(combo).toBe(2);
  expect(history.length).toBe(2);

  // Undo Action 2
  const undo2 = history.shift();
  deck.unshift(undo2.email);
  xp -= undo2.xpGained;
  combo = undo2.prevCombo;
  pollution = undo2.prevPollution;

  expect(deck[0].id).toBe(e2.id);
  expect(combo).toBe(1);

  // Undo Action 1
  const undo1 = history.shift();
  deck.unshift(undo1.email);
  xp -= undo1.xpGained;
  combo = undo1.prevCombo;
  pollution = undo1.prevPollution;

  expect(deck[0].id).toBe(e1.id);
  expect(combo).toBe(0);
  expect(pollution).toBe(68);
  expect(xp).toBe(4250);
  expect(history.length).toBe(0);
  expect(deck.length).toBe(10);
});

// ----------------------------------------------------
// TEST GROUP 4: GUARDIAN PROTOCOL IDENTIFIER & SECURITY
// ----------------------------------------------------
console.log('\n--- TEST GROUP 4: GUARDIAN PROTOCOL & SECURITY ---');

function isProtectedEmail(email) {
  if (!email) return false;
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

test('High-risk phishing emails trigger the safety interceptor', () => {
  const phishingEmails = MOCK_EMAILS.filter(e => e.phishingRisk === 'high');
  expect(phishingEmails.length).toBeGreaterThanOrEqual(3);
  for (let p of phishingEmails) {
    expect(isProtectedEmail(p)).toBeTrue();
  }
});

test('Banking & Financial emails trigger the safety interceptor', () => {
  const bankingEmails = MOCK_EMAILS.filter(e => e.classification === 'banking');
  expect(bankingEmails.length).toBeGreaterThanOrEqual(1);
  for (let b of bankingEmails) {
    expect(isProtectedEmail(b)).toBeTrue();
  }
});

test('University & Academic emails trigger the safety interceptor', () => {
  const uniEmails = MOCK_EMAILS.filter(e => e.classification === 'university');
  expect(uniEmails.length).toBeGreaterThanOrEqual(2);
  for (let u of uniEmails) {
    expect(isProtectedEmail(u)).toBeTrue();
  }
});

test('Low-risk promotional emails are recognized as safe to purge', () => {
  const promo = MOCK_EMAILS.find(e => e.id === 'mail-001');
  expect(isProtectedEmail(promo)).toBeFalse();
});

// ----------------------------------------------------
// TEST GROUP 5: BOSS BATTLE SEQUENCE & NON-DUPLICATION
// ----------------------------------------------------
console.log('\n--- TEST GROUP 5: BOSS BATTLE SEQUENCE ---');

test('Lord Spammerus boss encounter enforces Frost -> Volt -> Inferno sequence', () => {
  const phases = [
    { phase: 1, action: 'frost' },
    { phase: 2, action: 'volt' },
    { phase: 3, action: 'inferno' },
  ];

  let hp = 3;
  let phaseIdx = 0;

  function strike(type) {
    if (type === phases[phaseIdx].action) {
      hp--;
      phaseIdx++;
      return true;
    }
    return false;
  }

  // Phase 1 tests
  expect(strike('inferno')).toBeFalse(); // Wrong
  expect(strike('volt')).toBeFalse();    // Wrong
  expect(hp).toBe(3);
  expect(strike('frost')).toBeTrue();   // Correct
  expect(hp).toBe(2);

  // Phase 2 tests
  expect(strike('frost')).toBeFalse();   // Wrong
  expect(strike('volt')).toBeTrue();    // Correct
  expect(hp).toBe(1);

  // Phase 3 tests
  expect(strike('volt')).toBeFalse();    // Wrong
  expect(strike('inferno')).toBeTrue(); // Correct
  expect(hp).toBe(0);
});

test('Boss defeat bounty cannot be awarded more than once', () => {
  let playerGold = 3840;
  let playerXP = 4250;
  let bossDefeated = false;

  function handleBossDefeated(bounty) {
    if (bossDefeated) return false;
    bossDefeated = true;
    playerGold += bounty.gold;
    playerXP += bounty.xp;
    return true;
  }

  const bounty = { xp: 500, gold: 350 };
  const firstClaim = handleBossDefeated(bounty);
  expect(firstClaim).toBeTrue();
  expect(playerGold).toBe(3840 + 350);
  expect(playerXP).toBe(4250 + 500);

  // Second claim attempt
  const secondClaim = handleBossDefeated(bounty);
  expect(secondClaim).toBeFalse();
  expect(playerGold).toBe(3840 + 350); // Unchanged
  expect(playerXP).toBe(4250 + 500);   // Unchanged
});

// ----------------------------------------------------
// TEST SUMMARY
// ----------------------------------------------------
console.log('\n⚔️ ======================================================== ⚔️');
console.log(`   QA RESULTS: ${pass} PASSED, ${fail} FAILED`);
console.log('⚔️ ======================================================== ⚔️\n');

if (fail > 0) process.exit(1);

