# ⚔️ INBOX ZERO DUNGEON
> **A Gamified AI-Powered Email Management RPG**

*“Your inbox is the dungeon. Become its hero.”*

---

## 🌌 Creative Direction & Visual Style
- **Dark Fantasy AAA RPG Theme**: Deep charcoal backgrounds, obsidian arches, neon purple magical rifts, glowing fire orange, permafrost cyan, and electric violet.
- **Runic Accents & Atmospheric Fog**: Golden rune borders, animated particulate mist, floating arcane dust, and glowing SVG character avatars.
- **Synthesized Web Audio Engine**: Zero-dependency procedural sound synthesizer for gate rumbling, elemental spells, rune clicks, and victory fanfares.

---

## 🧙‍♂️ Original Game Characters
1. **BLAZE — Fire Guardian**
   - **Role**: Email Archiving & Purging
   - **Affinity**: Flame & Ash
   - **Visual**: Fiery little flame warrior with burning horns, obsidian pauldrons, and animated floating sparks.
   - **Ability**: *Inferno Archive* — Consumes batches of read clutter into the ancient ash archives.
2. **FROST — Ice Guardian**
   - **Role**: VIP & Important Scroll Protection
   - **Affinity**: Glacial Crystal
   - **Visual**: Serene ice mage in a crystalline hood with a rotating runic snowflake halo and floating ice shards.
   - **Ability**: *Permafrost Aegis* — Freezes urgent client scrolls and security alerts beneath enchanted ice runes.
3. **VOLT — Storm Guardian**
   - **Role**: Reply Later & Snooze Scheduling
   - **Affinity**: Violet Lightning
   - **Visual**: Kinetic storm mage with crackling lightning visor, thunder horns, and violet electric arcs.
   - **Ability**: *Chrono Surge* — Parks pending replies in a temporal thunder rift until peak focus hours.
4. **ELDER BYTE — Dungeon Master**
   - **Role**: Arch-Sage & Overseer
   - **Affinity**: Cosmic Gold & Arcane Void
   - **Visual**: Ancient cyber-arcane arch-mage with obsidian rune mask, golden diadem, and rotating celestial halo rings.
   - **Ability**: *Total Zero Decree* — Guides the player to absolute Inbox Zero.

---

## 🏰 Implemented Screens

### 🎬 Screen 1: Cinematic Intro (`/intro`)
- Dark screen opening into an ancient, massive dungeon gate.
- Gate opens outward with purple arcane light, smoke, and particle bursts.
- Elemental introductions for **Blaze**, **Frost**, and **Volt** with distinct spells and sounds.
- **Elder Byte** apparition with interactive multi-stage dialogue.
- Epic title reveal with transition into the citadel.
- Full utility support: **Skip Intro**, **Sound toggle**, **Reduced-motion toggle**, and **Step navigation**.

### 🛡️ Screen 2: Landing Page (`/landing`)
- Animated game title and logo.
- Tagline: *"Your inbox is the dungeon. Become its hero."*
- **Play Demo** button with direct navigation to the Dashboard.
- **Connect Gmail** button with safe, clearly-labelled "Coming in Phase 2" modal (zero fake auth, explains OAuth 2.0 and non-destructive archiving).
- Character companions showcase with stat sheets, voice triggers, and ability details.

### 📊 Screen 3: Game Dashboard (`/dashboard`)
- **Player XP & Level Bar**: Level crest, gold bounty, progress bar with shimmer, and rank titles.
- **Inbox Pollution Meter**: Circular SVG gauge tracking corruption percentage, infected scroll count, and purification status.
- **Expedition Gate ("Enter Battle Arena")**: Direct gateway into the Email Battle Arena or automated quick expedition.
- **Dashboard Stats**: 4 metric cards (Total Scanned, Junk Detected, Protected Scrolls, Snoozed Replies) with simulated action triggers.

### ⚔️ Screen 4: Email Battle Arena (`/battle`)
- **Framer Motion Draggable Stack**: 3D card stack supporting mouse drag, touch swipe, and keyboard controls:
  - **Left / A**: `INFERNO SLASH` (+20 XP, Flame FX & Embers, Archive).
  - **Right / D**: `FROST SHIELD` (+10 XP, Cyan Ice Crystals, Protect & Star).
  - **Up / W**: `THUNDER PORTAL` (+15 XP, Violet Lightning Vortex, Reply Later).
  - **Z / Backspace**: `TIME REWIND` (Reverses action, restores XP/combo, particle reconstruction).
  - **Space / I**: `INSPECT SCROLL` (Guardian Protocol Deep Inspection).
- **Guardian Protocol Safety Interceptor**:
  - Automatically flags phishing threats and high-value banking/university scrolls.
  - Pauses accidental destructive archiving to enforce deep inspection.
  - Comprehensive simulated security audit (SPF/DKIM seals, domain trust, AI risk analysis).
- **Companion Live Bar & Dynamic Reactions**:
  - Reactive dialogue speech bubbles for Blaze, Frost, Volt, and Elder Byte.
  - Dynamic commentary on combos, dangerous phishing scrolls, and elemental strikes.
- **Dynamic Combo System**:
  - Consecutive actions build combo multipliers with audio bursts.
  - Transparent bonus XP awarded at milestones (x3, x5, x10 Legendary Surge).
- **Boss Encounter**:
  - Confront *Lord Spammerus the Unsubscribed* with multi-phase elemental mechanics (Frost to shatter shield, Volt to overload, Inferno to incinerate).
  - Boss health bar, screen shake, custom dialogue, and +500 XP achievement bounty.
- **Expedition Debrief Results**:
  - Complete review of archived, protected, and snoozed counts.
  - Net XP gained, peak combo record, and net drop in dungeon pollution.
### 🧠 Screen 5: Gemini AI Brain & Sanctum Scan (`Dashboard` & `/battle`)
- **Secure Backend API Server**: Node.js Express service running on port 3001 with secret key isolation (`process.env.GEMINI_API_KEY`).
- **Gemini 3.8 Flash Classification**:
  - Classifies into exactly one category: `obvious-junk`, `obvious-keep`, or `ambiguous`.
  - Strict JSON schema with confidence scoring, AI summaries, phishing risk analysis, and structured rationales.
  - Multi-tiered prompt injection defenses embedded in the model system instructions.
- **Guardian Protocol Independent Safety Engine**:
  - Auto-archive is strictly disabled by default.
  - Requires: explicit user toggle, `obvious-junk` category, >= 0.98 confidence, low phishing risk, zero importance indicators, and zero membership in 8 protected categories.
  - High-risk phishing is quarantined immediately to human review with prominent alerts.
- **AI Scan Workflow**:
  - Batch scans the 22 mock emails and groups them into Obvious-Keep (protected), Obvious-Junk (archive candidates), and Ambiguous (routed to Battle Arena).
- **Graceful Fallback & Demo Mode**:
  - Operates seamlessly in Demo Mode even without a Gemini API key.

---

### 📬 Screen 6: Live Gmail Integration & OAuth 2.0 (`/dashboard` & `/battle`)
- **Official Google OAuth 2.0 Flow**: Direct server-side token exchange and session handling with `https://www.googleapis.com/auth/gmail.modify`.
- **Live Inbox Swiping**: Fetches real unread/inbox emails, synthesizes them with Gemini AI, and renders them onto battle cards.
- **Authoritative Actions & Non-Destructive Modifiers**:
  - `INFERNO SLASH`: Removes `INBOX` label (safe archiving; never deletes or trashes).
  - `FROST SHIELD`: Adds `STARRED` label.
  - `THUNDER PORTAL`: Applies `InboxZero/ReplyLater` label.
- **Authoritative Gmail Time Rewind**: Reverses actions on Gmail servers and restores inbox state.
- **Safety Interceptors**: Phishing shields, VIP protections, and un-archiving audits.

### 💾 Screen 7: Firebase Persistence & Cloud Sanctum (`/dashboard` & `/battle`)
- **Cloud Firestore Persistence**: Player profiles, game sessions, action audit history, achievements, and user preferences stored with strict user isolation.
- **Zero Duplicate Rewards**: Backend atomic lock enforces achievements can only be claimed once across all sessions.
- **Seamless Offline / Demo Resilience**: Automatic transparent fallback to in-memory `LocalSanctumStore` when Firebase credentials are omitted or offline.
- **Multi-Tenant Security Rules**: Production `firestore.rules` preventing cross-user eavesdropping and tampering.

---

## 📁 Project Architecture

```
promptwars/
├── firestore.rules              # Production-grade Firestore security rules
├── FIREBASE_SETUP_GUIDE.md      # Step-by-step setup guide for Firebase & Firestore
├── server/
│   ├── index.js                 # Express server with Gmail, Gemini & Firebase REST APIs
│   ├── firebaseService.js       # Firebase Admin SDK & Local Sanctum Cache fallback store
│   ├── gmailService.js          # Google Gmail API OAuth 2.0 & label modification engine
│   ├── geminiService.js         # Google Gen AI SDK integration (Gemini 3.8 Flash & injection defense)
│   ├── guardianEngine.js        # Independent Guardian Protocol safety evaluation
│   ├── validator.js             # Strict JSON schema validation
│   └── firebaseDeployGuide.md   # Deployment guide for Firebase Cloud Functions
├── .env.example                 # Environment variables template
├── public/
│   └── favicon.svg              # Custom arcane seal favicon
├── src/
│   ├── animations/
│   │   └── variants.js          # Framer Motion entrance & gate animation variants
│   ├── audio/
│   │   └── soundEffects.js      # Web Audio API synthesizer (SFX & ambient audio)
│   ├── components/
│   │   ├── AchievementBadge.jsx # RPG achievement crest
│   │   ├── ArenaResults.jsx     # Expedition debrief results
│   │   ├── BattleCard.jsx       # Draggable Framer Motion email card (Live Gmail & Demo)
│   │   ├── BossBattle.jsx       # 3-phase Lord Spammerus boss encounter
│   │   ├── CharacterAvatar.jsx  # Original custom SVG vector illustrations
│   │   ├── CharacterCard.jsx    # Interactive companion card with voice preview
│   │   ├── CompanionBar.jsx     # Reactive companion speech bubbles
│   │   ├── DashboardStats.jsx   # 4 core metric cards & dungeon progress
│   │   ├── DungeonBackground.jsx# Ambient dark fantasy lighting & fog layers
│   │   ├── ElementalEffects.jsx # Full-screen elemental visual FX overlays
│   │   ├── GameButton.jsx       # Themed button with rune clips and sounds
│   │   ├── GmailModal.jsx       # Gmail OAuth connection modal & live status
│   │   ├── GuardianProtocolModal.jsx # Deep inspection modal with AI explanation
│   │   ├── IntroSequence.jsx    # Screen 1 cinematic dungeon opening sequence
│   │   ├── Navbar.jsx           # Top fantasy navigation, level & live status badges
│   │   ├── PollutionMeter.jsx   # Radial inbox corruption threat gauge
│   │   ├── RuneDecorations.jsx  # Arcane particles and decorative runes
│   │   └── XPBar.jsx            # Experience bar with level crest & gold
│   ├── data/
│   │   ├── achievements.js      # Achievement tiers and descriptions
│   │   ├── characters.js        # Detailed lore, stats, and abilities for 4 heroes
│   │   ├── mockData.js          # Realistic demo statistics and activity log
│   │   └── mockEmails.js        # 22+ simulated mock emails + Boss email
│   ├── hooks/
│   │   └── useSound.js          # React hook for sound engine and mute state
│   ├── pages/
│   │   ├── BattleArenaPage.jsx  # Screen 4: Email Battle Arena (Persistent stats & sessions)
│   │   ├── DashboardPage.jsx    # Screen 3: Game Dashboard (Persistent profile, status pills)
│   │   └── LandingPage.jsx      # Screen 2: Landing Page
│   ├── services/
│   │   ├── aiService.js         # Frontend client service for Gemini API
│   │   ├── gmailService.js      # Frontend client service for Gmail OAuth & actions
│   │   └── persistenceService.js# Frontend client service for Firestore persistence
│   ├── styles/
│   │   └── index.css            # Tailwind layers, fantasy borders & scanlines
│   ├── App.jsx                  # React Router routes & layout
│   └── main.jsx                 # Entry point
├── index.html                   # Fonts (Cinzel, Cinzel Decorative, Inter)
├── package.json
├── tailwind.config.js           # Custom palette (blaze, frost, volt, elder, gold)
└── vite.config.js
```

---

## 🚀 How to Run

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Configure Environment Variables (Optional for Live Mode)**:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Populate credentials if desired:
     - `GEMINI_API_KEY`: Google AI Studio Gemini API key.
     - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`: Google Cloud OAuth credentials.
     - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`: Firebase Service Account credentials.
   - *Note: If any API keys or credentials are omitted, the game automatically operates in high-fidelity, crash-proof Demo Mode with Local Sanctum Cache persistence.*
3. **Start the backend server**:
   ```bash
   npm run server
   ```
4. **Start the frontend application**:
   ```bash
   npm run dev
   ```
5. Open browser at: `http://localhost:5173`

