export const MOCK_PLAYER = {
  name: 'Archmage Valen',
  title: 'Novice Sanctum Purifier',
  level: 14,
  currentXP: 4250,
  maxXP: 6000,
  gold: 3840,
  manaShards: 120,
  equippedCompanion: 'blaze',
  isDemo: true,
};

export const MOCK_DUNGEON_METRICS = {
  inboxPollutionPercent: 68,
  totalEmailsScanned: 1842,
  junkDetected: 1120,
  emailsProtected: 215,
  pendingReplies: 48,
  archivedToday: 134,
  currentFloor: {
    number: 4,
    totalFloors: 10,
    name: 'The Obsidian Mail Crypt',
    bossName: 'Lord Spammerus the Unsubscribed',
    difficulty: 'Nightmare',
    purificationRate: 42,
  },
  elementalSummary: {
    fireArchived: 980,
    iceProtected: 215,
    voltSnoozed: 48,
  }
};

export const MOCK_RECENT_ACTIVITY = [
  {
    id: 'act-1',
    time: '2 mins ago',
    guardian: 'blaze',
    action: 'Purged 42 Dark Promo Specters',
    details: 'Newsletter horde from "FastFashion Deals" disintegrated in flame.',
    xpGained: 150,
    type: 'purge',
  },
  {
    id: 'act-2',
    time: '18 mins ago',
    guardian: 'frost',
    action: 'Cast Permafrost on Tax Invoice Scroll',
    details: 'Enchanted and starred in the Cold Vault for 3 years safe-keeping.',
    xpGained: 200,
    type: 'protect',
  },
  {
    id: 'act-3',
    time: '45 mins ago',
    guardian: 'volt',
    action: 'Charged Chrono Surge on Client Contract',
    details: 'Temporal strike set for Monday, 09:00 AM Arcane Standard Time.',
    xpGained: 120,
    type: 'surge',
  },
  {
    id: 'act-4',
    time: '2 hours ago',
    guardian: 'elderByte',
    action: 'Dungeon Room Cleansed: Subscriptions Crypt',
    details: 'Eliminated 14 undead recurring billing reminders.',
    xpGained: 500,
    type: 'boss',
  }
];

