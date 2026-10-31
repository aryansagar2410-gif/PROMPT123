/**
 * FRONTEND AI SERVICE
 * 
 * Communicates with the secure backend at http://localhost:3001/api.
 * Includes graceful offline fallback for pure Demo Mode.
 * NEVER stores or exposes the Gemini API key.
 */

const BACKEND_URL = 'http://localhost:3001/api';

/**
 * Checks backend health and AI engine status
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      status: 'offline',
      service: 'Inbox Zero Dungeon Backend (Offline)',
      geminiConfigured: false,
      activeModel: 'Client-Side Safe Fallback (Demo Mode)',
    };
  }
}

/**
 * Classifies an individual email via the backend.
 * Falls back to local deterministic engine if server is unreachable.
 */
export async function classifyEmail(email, options = { userEnabledAutoArchive: false }) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const res = await fetch(`${BACKEND_URL}/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, options }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`[AIService] Backend request failed (${err.message}). Using local safe evaluation.`);
    
    // Local safe fallback
    const isPhishing = email.phishingRisk === 'high' || email.classification === 'phishing';
    const isProtected = email.isProtectedByDefault || email.importance === 'vip' || email.classification === 'banking' || email.classification === 'university';
    const isJunk = email.classification === 'promotional';

    const fallbackClassification = isPhishing ? 'ambiguous' : isProtected ? 'obvious-keep' : isJunk ? 'obvious-junk' : 'ambiguous';

    return {
      emailId: email.id,
      gemini: {
        classification: fallbackClassification,
        confidence: isProtected || isJunk ? 0.99 : 0.85,
        summary: email.aiSummary || 'Parchment analyzed via local safe heuristics.',
        phishingRisk: email.phishingRisk || 'low',
        importanceIndicators: isProtected ? ['protected_category'] : [],
        reasons: ['Evaluated via local client safety fallback engine.'],
        engine: 'client-fallback',
      },
      guardian: {
        autoArchiveEligible: isJunk && options.userEnabledAutoArchive && !isProtected && !isPhishing,
        autoArchiveDecision: isProtected ? 'protected-from-archive' : isPhishing ? 'requires-human-review' : 'ambiguous',
        blockedReasons: isProtected ? ['Protected category detected.'] : ['Auto-archive disabled by default.'],
        detectedProtectedCategories: isProtected ? [email.classification] : [],
        isPhishingAlert: isPhishing,
      },
      isDemoMode: true,
      message: 'Classified using local client fallback (Server offline or Demo Mode active)',
    };
  }
}

/**
 * Scans a batch of emails using the backend /api/scan endpoint.
 */
export async function scanEmailBatch(emails, options = { userEnabledAutoArchive: false }) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(`${BACKEND_URL}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ emails, options }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`[AIService] Batch scan failed (${err.message}). Executing local simulation.`);
    
    // Simulate batch scan locally
    const results = [];
    const obviousJunk = [];
    const obviousKeep = [];
    const ambiguous = [];
    const autoArchiveCandidates = [];

    for (const email of emails) {
      const single = await classifyEmail(email, options);
      results.push(single);

      if (single.gemini.classification === 'obvious-junk') obviousJunk.push(email.id);
      else if (single.gemini.classification === 'obvious-keep') obviousKeep.push(email.id);
      else ambiguous.push(email.id);

      if (single.guardian.autoArchiveEligible) {
        autoArchiveCandidates.push(email.id);
      }
    }

    return {
      totalScanned: emails.length,
      obviousJunkCount: obviousJunk.length,
      obviousKeepCount: obviousKeep.length,
      ambiguousCount: ambiguous.length,
      autoArchiveCandidatesCount: autoArchiveCandidates.length,
      autoArchiveCandidates,
      categories: {
        obviousJunk,
        obviousKeep,
        ambiguous,
      },
      results,
      isDemoMode: true,
      timestamp: new Date().toISOString(),
    };
  }
}

