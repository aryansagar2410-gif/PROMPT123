# 🔥 Firebase Cloud Functions Deployment Guide

This document outlines the deployment path for migrating the standalone Node.js backend to **Firebase Cloud Functions (2nd Gen)** with **Google Cloud Secret Manager**.

---

## 1. Prerequisites
- Node.js 20+
- Firebase CLI installed: `npm install -g firebase-tools`
- A Firebase project created at [console.firebase.google.com](https://console.firebase.google.com)

---

## 2. Setting Up Cloud Functions
1. In the project root, initialize Firebase Functions:
   ```bash
   firebase init functions
   ```
   - Language: **JavaScript (ES Modules)**
   - Do NOT overwrite existing package.json or server files.

2. Securely store your Gemini API Key using Google Cloud Secret Manager:
   ```bash
   firebase functions:secrets:set GEMINI_API_KEY
   ```
   *(Paste your Gemini API key from Google AI Studio when prompted)*

---

## 3. Function Definition (`functions/index.js`)

```javascript
import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";
import { classifyEmailWithGemini } from "./geminiService.js";
import { evaluateGuardianProtocol } from "./guardianEngine.js";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// API Routes (same as server/index.js)
app.post("/classify", async (req, res) => {
  const { email, options } = req.body;
  const geminiResult = await classifyEmailWithGemini(email, process.env.GEMINI_API_KEY);
  const guardianResult = evaluateGuardianProtocol(email, geminiResult.data, options);
  res.json({ emailId: email.id, gemini: geminiResult.data, guardian: guardianResult });
});

// Export Cloud Function with Secret Injection
export const api = onRequest(
  { secrets: ["GEMINI_API_KEY"], timeoutSeconds: 30, memory: "512MiB" },
  app
);
```

---

## 4. Deploying to Firebase
```bash
firebase deploy --only functions
```

Your API endpoints will be accessible at:
`https://<region>-<project-id>.cloudfunctions.net/api/classify`

