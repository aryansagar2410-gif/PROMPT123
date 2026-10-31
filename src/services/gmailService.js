/**
 * INBOX ZERO DUNGEON — FRONTEND GMAIL API CLIENT
 * 
 * Communicates with the secure Node.js backend for:
 * - OAuth 2.0 authorization URL and status
 * - Fetching real inbox scrolls
 * - Executing elemental actions on real Gmail (Inferno/Frost/Thunder)
 * - Real Time Rewind (undo)
 */

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Checks whether the user's Gmail account is connected.
 */
export async function getGmailStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/gmail/status`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[GmailClient] Failed to check status:', err.message);
    return {
      connected: false,
      configured: false,
      error: err.message,
    };
  }
}

/**
 * Gets the OAuth 2.0 consent authorization URL.
 */
export async function getGmailAuthUrl() {
  const res = await fetch(`${API_BASE_URL}/gmail/auth-url`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to generate auth URL (${res.status})`);
  }
  return await res.json();
}

/**
 * Disconnects the Gmail account.
 */
export async function disconnectGmail() {
  const res = await fetch(`${API_BASE_URL}/gmail/disconnect`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Failed to disconnect (${res.status})`);
  return await res.json();
}

/**
 * Fetches the latest 50 real inbox messages from Gmail.
 */
export async function fetchGmailMessages(maxResults = 50) {
  const res = await fetch(`${API_BASE_URL}/gmail/messages?maxResults=${maxResults}`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to fetch messages (${res.status})`);
  }
  return await res.json();
}

/**
 * ARCHIVE ACTION (INFERNO SLASH)
 * Removes the 'INBOX' label from the real message.
 */
export async function archiveGmailMessage(messageId) {
  const res = await fetch(`${API_BASE_URL}/gmail/actions/archive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ messageId }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to archive message (${res.status})`);
  }
  return await res.json();
}

/**
 * KEEP ACTION (FROST SHIELD)
 * Preserves the email in the inbox without label changes.
 */
export async function keepGmailMessage(messageId) {
  const res = await fetch(`${API_BASE_URL}/gmail/actions/keep`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ messageId }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to keep message (${res.status})`);
  }
  return await res.json();
}

/**
 * REPLY LATER ACTION (THUNDER PORTAL)
 * Attaches the 'Reply Later' label to the email.
 */
export async function replyLaterGmailMessage(messageId) {
  const res = await fetch(`${API_BASE_URL}/gmail/actions/reply-later`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ messageId }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to apply Reply Later (${res.status})`);
  }
  return await res.json();
}

/**
 * TIME REWIND (UNDO)
 * Restores the previous label state of the last acted email.
 */
export async function undoLastGmailAction() {
  const res = await fetch(`${API_BASE_URL}/gmail/undo`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to rewind action (${res.status})`);
  }
  return await res.json();
}

/**
 * Universal executor for elemental actions on Gmail
 */
export async function executeGmailAction(type, messageId) {
  if (type === 'inferno') return archiveGmailMessage(messageId);
  if (type === 'frost') return keepGmailMessage(messageId);
  if (type === 'volt') return replyLaterGmailMessage(messageId);
  throw new Error(`Unknown elemental action type: ${type}`);
}


