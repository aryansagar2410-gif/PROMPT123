/**
 * INBOX ZERO DUNGEON — GMAIL OAUTH 2.0 & API SERVICE
 * 
 * Provides secure server-side OAuth 2.0 flow, session management,
 * message retrieval, elemental actions (Inferno/Frost/Thunder), and Time Rewind (undo).
 * 
 * OAuth Scopes:
 * - https://www.googleapis.com/auth/gmail.modify (read/modify labels, archive, reply-later)
 * - https://www.googleapis.com/auth/userinfo.email (retrieve connected account email)
 * 
 * Security Guardrails:
 * - NEVER exposes client secrets, access tokens, or refresh tokens to React or API responses.
 * - Server-side session mapping with cryptographic CSRF state verification.
 * - Zero permanent deletion (only label modifications: remove INBOX for archive).
 */

import { google } from 'googleapis';
import crypto from 'crypto';

// In-memory session store: Map<sessionId, { tokens, email, undoStack: [] }>
const sessions = new Map();

// In-memory OAuth CSRF state store: Map<state, { timestamp, sessionId }>
const oauthStates = new Map();

// Clean up expired states every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [state, data] of oauthStates.entries()) {
    if (now - data.timestamp > 15 * 60 * 1000) {
      oauthStates.delete(state);
    }
  }
}, 5 * 60 * 1000);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/userinfo.email',
];

/**
 * Checks whether Google OAuth 2.0 credentials are configured.
 */
export function isGmailConfigured() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return Boolean(
    clientId &&
    clientSecret &&
    !clientId.includes('your_google_client_id') &&
    !clientSecret.includes('your_google_client_secret') &&
    clientId.trim().length > 0 &&
    clientSecret.trim().length > 0
  );
}

/**
 * Creates a new OAuth2 client instance.
 */
function createOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/gmail/callback';

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Generates an OAuth 2.0 authorization URL with a cryptographically secure CSRF state token.
 */
export function generateAuthUrl(sessionId) {
  if (!isGmailConfigured()) {
    throw new Error('Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.');
  }

  const oauth2Client = createOAuth2Client();
  const state = crypto.randomBytes(32).toString('hex');

  // Store state for CSRF validation
  oauthStates.set(state, {
    timestamp: Date.now(),
    sessionId,
  });

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Ensures refresh token is provided
    scope: SCOPES,
    state,
  });

  return { authUrl, state };
}

/**
 * Handles the OAuth 2.0 callback, exchanges the code for tokens, and fetches the user's email.
 */
export async function handleOAuthCallback(code, state) {
  if (!state || !oauthStates.has(state)) {
    throw new Error('Invalid or expired OAuth state token (CSRF protection failed).');
  }

  const stateData = oauthStates.get(state);
  oauthStates.delete(state);

  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Retrieve user email to verify identity
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const profileRes = await gmail.users.getProfile({ userId: 'me' });
  const userEmail = profileRes.data.emailAddress || 'unknown@gmail.com';

  const sessionId = stateData.sessionId || crypto.randomUUID();

  // Store tokens securely in server session
  sessions.set(sessionId, {
    tokens,
    email: userEmail,
    connectedAt: new Date().toISOString(),
    undoStack: [],
  });

  return {
    sessionId,
    email: userEmail,
  };
}

/**
 * Retrieves the connection status for a session.
 */
export function getSessionStatus(sessionId) {
  const configured = isGmailConfigured();
  if (!sessionId || !sessions.has(sessionId)) {
    return {
      connected: false,
      configured,
      message: configured ? 'Gmail credentials ready. Connect your account.' : 'Google OAuth credentials missing in .env.',
    };
  }

  const session = sessions.get(sessionId);
  return {
    connected: true,
    email: session.email,
    configured,
    connectedAt: session.connectedAt,
    undoAvailable: session.undoStack.length > 0,
    undoCount: session.undoStack.length,
  };
}

/**
 * Disconnects the session and clears all tokens.
 */
export function disconnectSession(sessionId) {
  if (sessionId && sessions.has(sessionId)) {
    sessions.delete(sessionId);
  }
  return { success: true, connected: false };
}

/**
 * Helper to get an authenticated OAuth2Client for a session.
 */
function getAuthenticatedClient(sessionId) {
  if (!sessionId || !sessions.has(sessionId)) {
    throw new Error('Gmail account not connected. Please authenticate first.');
  }

  const session = sessions.get(sessionId);
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(session.tokens);

  // Auto-persist refreshed tokens if the SDK automatically refreshes them
  oauth2Client.on('tokens', (newTokens) => {
    session.tokens = {
      ...session.tokens,
      ...newTokens,
    };
  });

  return { oauth2Client, session };
}

/**
 * Decodes header value from Gmail message payload headers.
 */
function getHeader(headers, name) {
  if (!Array.isArray(headers)) return '';
  const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return header ? header.value : '';
}

/**
 * Formats a raw From header into a display-friendly sender string.
 */
function formatSender(fromHeader) {
  if (!fromHeader) return 'Unknown Sender';
  return fromHeader.trim();
}

/**
 * Classifies an email heuristically into game categories for Demo/Gmail hybrid arena.
 */
function inferClassification(sender, subject, snippet) {
  const text = `${sender} ${subject} ${snippet}`.toLowerCase();

  if (text.includes('promo') || text.includes('deal') || text.includes('sale') || text.includes('discount') || text.includes('newsletter') || text.includes('unsubscribe')) {
    return { classification: 'promotional', phishingRisk: 'low', importance: 'normal' };
  }
  if (text.includes('bank') || text.includes('statement') || text.includes('wire') || text.includes('credit card') || text.includes('invoice') || text.includes('transaction')) {
    return { classification: 'banking', phishingRisk: 'low', importance: 'critical', isProtectedByDefault: true };
  }
  if (text.includes('university') || text.includes('.edu') || text.includes('course') || text.includes('professor') || text.includes('grades') || text.includes('exam')) {
    return { classification: 'university', phishingRisk: 'low', importance: 'vip', isProtectedByDefault: true };
  }
  if (text.includes('verify your password') || text.includes('suspended') || text.includes('urgent action required') || text.includes('crypto reward') || text.includes('bit.ly')) {
    return { classification: 'phishing', phishingRisk: 'high', importance: 'normal', guardianFlag: 'suspicious_phishing' };
  }
  if (text.includes('meeting') || text.includes('project') || text.includes('calendar') || text.includes('reminder') || text.includes('team')) {
    return { classification: 'work', phishingRisk: 'low', importance: 'high' };
  }

  return { classification: 'personal', phishingRisk: 'low', importance: 'normal' };
}

/**
 * Fetches up to 50 real inbox emails from Gmail.
 */
export async function fetchInboxMessages(sessionId, maxResults = 50) {
  const { oauth2Client, session } = getAuthenticatedClient(sessionId);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // List messages in INBOX
  const listRes = await gmail.users.messages.list({
    userId: 'me',
    q: 'in:inbox',
    maxResults: Math.min(50, Math.max(1, maxResults)),
  });

  const messageList = listRes.data.messages || [];
  if (messageList.length === 0) {
    return {
      messages: [],
      total: 0,
      userEmail: session.email,
    };
  }

  // Fetch metadata for each message
  const detailedMessages = await Promise.all(
    messageList.map(async (item) => {
      try {
        const msgRes = await gmail.users.messages.get({
          userId: 'me',
          id: item.id,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date'],
        });

        const headers = msgRes.data.payload?.headers || [];
        const from = getHeader(headers, 'From');
        const subject = getHeader(headers, 'Subject') || '(No Subject)';
        const dateStr = getHeader(headers, 'Date');
        const snippet = msgRes.data.snippet || '';

        const inferred = inferClassification(from, subject, snippet);

        return {
          id: msgRes.data.id,
          threadId: msgRes.data.threadId,
          sender: formatSender(from),
          subject,
          date: dateStr ? new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
          preview: snippet,
          snippet,
          size: msgRes.data.sizeEstimate ? `${Math.round(msgRes.data.sizeEstimate / 1024)} KB` : '14 KB',
          labelIds: msgRes.data.labelIds || [],
          isGmail: true,
          classification: inferred.classification,
          phishingRisk: inferred.phishingRisk,
          importance: inferred.importance,
          isProtectedByDefault: inferred.isProtectedByDefault || false,
          guardianFlag: inferred.guardianFlag || null,
          aiSummary: snippet ? `Gmail Summary: ${snippet.slice(0, 140)}...` : 'Real Gmail inbox scroll awaiting purificatory decree.',
        };
      } catch (err) {
        console.warn(`[GmailService] Failed to fetch message metadata for ${item.id}:`, err.message);
        return null;
      }
    })
  );

  const validMessages = detailedMessages.filter(Boolean);

  return {
    messages: validMessages,
    total: validMessages.length,
    userEmail: session.email,
  };
}

/**
 * ARCHIVE ACTION (INFERNO SLASH)
 * Removes the 'INBOX' label from the message. Never deletes or trashes.
 */
export async function archiveMessage(sessionId, messageId) {
  if (!messageId) throw new Error('Message ID is required to archive.');

  const { oauth2Client, session } = getAuthenticatedClient(sessionId);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // 1. Fetch current labels for reliable undo
  const currentMsg = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'minimal',
  });
  const previousLabelIds = currentMsg.data.labelIds || [];

  // 2. Remove 'INBOX' label
  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: {
      removeLabelIds: ['INBOX'],
    },
  });

  // 3. Store in undo stack
  const undoRecord = {
    messageId,
    previousLabelIds,
    action: 'inferno',
    timestamp: Date.now(),
  };
  session.undoStack.unshift(undoRecord);

  // Keep stack to reasonable limit (max 50)
  if (session.undoStack.length > 50) session.undoStack.pop();

  return {
    success: true,
    action: 'inferno',
    messageId,
    message: 'Message successfully archived from Inbox.',
  };
}

/**
 * KEEP ACTION (FROST SHIELD)
 * Retains the email in the inbox without modifying labels.
 */
export async function keepMessage(sessionId, messageId) {
  if (!messageId) throw new Error('Message ID is required to keep.');

  const { oauth2Client, session } = getAuthenticatedClient(sessionId);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const currentMsg = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'minimal',
  });
  const previousLabelIds = currentMsg.data.labelIds || [];

  // No modification in Gmail for keep; records undo snapshot
  const undoRecord = {
    messageId,
    previousLabelIds,
    action: 'frost',
    timestamp: Date.now(),
  };
  session.undoStack.unshift(undoRecord);
  if (session.undoStack.length > 50) session.undoStack.pop();

  return {
    success: true,
    action: 'frost',
    messageId,
    message: 'Message kept safe in Inbox.',
  };
}

/**
 * Helper to find or create the 'Reply Later' label in Gmail.
 */
async function getOrCreateReplyLaterLabel(gmail) {
  const labelsRes = await gmail.users.labels.list({ userId: 'me' });
  const labels = labelsRes.data.labels || [];

  const existingLabel = labels.find(
    (l) => l.name.toLowerCase() === 'reply later'
  );

  if (existingLabel) {
    return existingLabel.id;
  }

  // Create new 'Reply Later' label
  const createRes = await gmail.users.labels.create({
    userId: 'me',
    requestBody: {
      name: 'Reply Later',
      labelListVisibility: 'labelShow',
      messageListVisibility: 'show',
    },
  });

  return createRes.data.id;
}

/**
 * REPLY LATER ACTION (THUNDER PORTAL)
 * Creates the 'Reply Later' label if needed and attaches it to the message.
 */
export async function replyLaterMessage(sessionId, messageId) {
  if (!messageId) throw new Error('Message ID is required for Reply Later.');

  const { oauth2Client, session } = getAuthenticatedClient(sessionId);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // 1. Fetch current labels
  const currentMsg = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'minimal',
  });
  const previousLabelIds = currentMsg.data.labelIds || [];

  // 2. Ensure 'Reply Later' label exists
  const replyLaterLabelId = await getOrCreateReplyLaterLabel(gmail);

  // 3. Add label to message
  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: {
      addLabelIds: [replyLaterLabelId],
    },
  });

  // 4. Record in undo stack
  const undoRecord = {
    messageId,
    previousLabelIds,
    addedLabelId: replyLaterLabelId,
    action: 'volt',
    timestamp: Date.now(),
  };
  session.undoStack.unshift(undoRecord);
  if (session.undoStack.length > 50) session.undoStack.pop();

  return {
    success: true,
    action: 'volt',
    messageId,
    labelId: replyLaterLabelId,
    message: 'Message marked with Reply Later label.',
  };
}

/**
 * TIME REWIND (UNDO) SYSTEM
 * Accurately reverses the last elemental action on Gmail.
 */
export async function undoLastAction(sessionId) {
  const { oauth2Client, session } = getAuthenticatedClient(sessionId);

  if (!session.undoStack || session.undoStack.length === 0) {
    throw new Error('No actions in history stack to undo.');
  }

  const lastAction = session.undoStack.shift();
  const { messageId, action, addedLabelId } = lastAction;

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    if (action === 'inferno') {
      // Re-add 'INBOX' label
      await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: ['INBOX'],
        },
      });
    } else if (action === 'volt' && addedLabelId) {
      // Remove 'Reply Later' label
      await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: [addedLabelId],
        },
      });
    } else if (action === 'frost') {
      // Keep was no-op on Gmail, nothing to alter
    }

    return {
      success: true,
      undoneAction: action,
      messageId,
      message: `Successfully rewound ${action} action on Gmail.`,
    };
  } catch (err) {
    // If undo failed on Gmail, restore entry back to stack
    session.undoStack.unshift(lastAction);
    throw new Error(`Gmail undo failed: ${err.message}`);
  }
}

/**
 * FOR TESTING / MOCKING:
 * Injects a mock session with mock emails for automated testing when real credentials are not present.
 */
export function injectMockSessionForTesting(sessionId, mockEmail = 'tester@gmail.com') {
  sessions.set(sessionId, {
    tokens: { access_token: 'mock_token', refresh_token: 'mock_refresh' },
    email: mockEmail,
    connectedAt: new Date().toISOString(),
    undoStack: [],
  });
}

