# ⚔️ INBOX ZERO DUNGEON — FIREBASE & FIRESTORE SETUP GUIDE

This guide provides instructions to connect your **Inbox Zero Dungeon** application to **Google Firebase** and **Cloud Firestore** for cloud data persistence.

---

## 1. Create a Firebase Project

1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Project name: `inbox-zero-dungeon` (or your choice).
4. (Optional) Disable Google Analytics for this hackathon project, then click **Create project**.

---

## 2. Enable Cloud Firestore

1. In the Firebase Console left sidebar, click **Build > Firestore Database**.
2. Click **Create database**.
3. Choose your database location (e.g. `us-central1` or nearest region).
4. Start in **Production mode** (security rules will be deployed from [`firestore.rules`](./firestore.rules)).
5. Click **Create**.

---

## 3. Generate Backend Service Account Key (Firebase Admin SDK)

> [!CAUTION]
> **Zero Exposure Rule**: The Firebase Admin private key has full administrative read/write access. It must exist **only on the server** in `.env` or as a backend file. **NEVER** expose this file or its contents in React, Git, or frontend environment variables (`VITE_*`).

1. In Firebase Console, click the **Gear icon (Project settings)** next to "Project Overview".
2. Select the **Service accounts** tab.
3. Under **Firebase Admin SDK**, choose **Node.js**.
4. Click **Generate new private key** and confirm with **Generate key**.
5. Save the downloaded JSON file securely (e.g., as `serviceAccountKey.json` inside the project root or a secure folder).
6. Ensure `serviceAccountKey.json` is listed in your `.gitignore`.

Alternatively, configure the three environment variables in your server `.env`:
```env
FIREBASE_PROJECT_ID=inbox-zero-dungeon
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@inbox-zero-dungeon.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk...YOUR_KEY...\n-----END PRIVATE KEY-----\n"
```

---

## 4. Register Web Application (Optional for Frontend Direct Auth)

1. In Project settings under the **General** tab, scroll to **Your apps**.
2. Click the **Web** icon (`</>`).
3. App nickname: `Inbox Zero Dungeon Web`.
4. (Optional) Check "Also set up Firebase Hosting".
5. Click **Register app**.
6. The frontend uses the secure Node.js backend API proxy for persistence, preventing any credential leakage.

---

## 5. Deploy Firestore Security Rules

Deploy the included [`firestore.rules`](./firestore.rules) using Firebase CLI:

```bash
# 1. Install Firebase CLI globally (if not already installed)
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Initialize Firestore in your project directory
firebase init firestore

# 4. Deploy rules to your project
firebase deploy --only firestore:rules
```

The deployed rules enforce:
- **User Data Isolation**: Only authenticated players can access their own `/players/{playerId}` documents.
- **Immutable Achievements**: Once granted, achievements cannot be deleted by users.
- **Default Deny**: All other collections are inaccessible.

---

## 6. Offline & Demo Mode Architecture

If Firebase is not yet configured or is temporarily offline:
- The game automatically activates **Local Sanctum Cache** fallback storage.
- All game mechanics (XP gains, leveling, boss fights, achievements, Time Rewind) function without interruption.
- A status badge on the Dashboard displays:
  - ☁️ **Cloud Save Active: [Project ID]** when connected to Firebase.
  - 💾 **Local Sanctum Cache (Offline / Demo)** when running in standalone mode.

