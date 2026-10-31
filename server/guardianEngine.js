/**
 * GUARDIAN PROTOCOL — INDEPENDENT SAFETY ENGINE (SERVER-SIDE)
 * 
 * Strict deterministic safety evaluation executed AFTER Gemini AI classification.
 * Model output alone is NEVER trusted to authorize an archive.
 * Automatic archive is DISABLED by default.
 */

// Protected categories that can NEVER be auto-archived
export const PROTECTED_CATEGORIES = [
  'banking_financial',
  'university_education',
  'employment_recruitment',
  'healthcare_medical',
  'government_legal_tax',
  'personal_family',
  'account_security_otp',
  'orders_payments_deliveries',
];

// Independent heuristic patterns to catch protected emails regardless of AI classification
const PROTECTED_PATTERNS = {
  banking_financial: [
    /bank|wire transfer|credit card|debit card|loan|mortgage|swift|routing|checking account|balance alert|statement ready/i,
    /@.*(bank|vault|creditunion|chase|wellsfargo|citi|capitalone|fidelity|schwab)/i,
  ],
  university_education: [
    /university|college|registrar|exam|thesis|academic|dissertation|gpa|student portal|grading|enrollment|tuition/i,
    /\.(edu|ac\.[a-z]{2})$/i,
  ],
  employment_recruitment: [
    /offer letter|interview scheduled|job application|hiring manager|onboarding|w-2|salary|compensation|recruiter/i,
  ],
  healthcare_medical: [
    /doctor|hospital|clinic|prescription|lab results|diagnostic|patient portal|medical records|health insurance|hipaa/i,
  ],
  government_legal_tax: [
    /irs|tax return|internal revenue|subpoena|court|legal counsel|trademark|patent|uspto|audit|w-8ben|government/i,
  ],
  personal_family: [
    /mom|dad|family|urgent|confidential|friend|personal|wedding|relative/i,
  ],
  account_security_otp: [
    /verification code|passcode|one-time password|otp|2fa|multi-factor|password reset|security alert|login attempt|suspicious activity/i,
  ],
  orders_payments_deliveries: [
    /order confirmed|shipped|tracking number|package delivered|invoice #|receipt for|payment received|fedex|ups|dhl|usps/i,
  ],
};

/**
 * Checks if the email matches any protected category pattern
 */
export function detectProtectedCategories(email) {
  const detected = [];
  const textToScan = `${email.sender || ''} ${email.subject || ''} ${email.preview || ''} ${email.classification || ''}`.toLowerCase();

  for (const [category, patterns] of Object.entries(PROTECTED_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(textToScan)) {
        detected.push(category);
        break;
      }
    }
  }

  // Also check email metadata flags from the dataset
  if (email.classification === 'banking' && !detected.includes('banking_financial')) detected.push('banking_financial');
  if (email.classification === 'university' && !detected.includes('university_education')) detected.push('university_education');
  if (email.classification === 'order_update' && !detected.includes('orders_payments_deliveries')) detected.push('orders_payments_deliveries');
  if (email.isProtectedByDefault && !detected.includes('personal_family')) detected.push('personal_family');

  return detected;
}

/**
 * Independent Safety Evaluation.
 * Returns {
 *   autoArchiveEligible: boolean,
 *   autoArchiveDecision: 'auto-archive-eligible' | 'requires-human-review' | 'protected-from-archive',
 *   blockedReasons: string[],
 *   detectedProtectedCategories: string[],
 *   isPhishingAlert: boolean
 * }
 */
export function evaluateGuardianProtocol(email, geminiResult, options = {}) {
  const { userEnabledAutoArchive = false } = options;
  const blockedReasons = [];
  const detectedProtected = detectProtectedCategories(email);

  // Condition 1: User explicitly enabled auto-archive
  if (!userEnabledAutoArchive) {
    blockedReasons.push('User has not explicitly enabled automatic archiving (default safe state).');
  }

  // Condition 2: Classification must be obvious-junk
  if (geminiResult.classification !== 'obvious-junk') {
    blockedReasons.push(`AI classified email as "${geminiResult.classification}" (must be "obvious-junk").`);
  }

  // Condition 3: Confidence must be at least 0.98
  if (typeof geminiResult.confidence !== 'number' || geminiResult.confidence < 0.98) {
    blockedReasons.push(`Confidence is ${(geminiResult.confidence * 100).toFixed(1)}% (minimum required is 98.0%).`);
  }

  // Condition 4: Phishing risk must be low
  const isHighRiskPhishing = geminiResult.phishingRisk === 'high' || email.phishingRisk === 'high';
  if (geminiResult.phishingRisk !== 'low') {
    blockedReasons.push(`Phishing risk is assessed as "${geminiResult.phishingRisk}" (must be "low").`);
  }

  // Condition 5: No importance indicators present
  const importanceList = Array.isArray(geminiResult.importanceIndicators) ? geminiResult.importanceIndicators : [];
  if (importanceList.length > 0) {
    blockedReasons.push(`Importance indicators detected: [${importanceList.join(', ')}].`);
  }

  // Condition 6: Email must not belong to any protected category
  if (detectedProtected.length > 0) {
    blockedReasons.push(`Protected categories detected: [${detectedProtected.join(', ')}].`);
  }

  // High-risk phishing must NEVER be auto-archived
  if (isHighRiskPhishing) {
    blockedReasons.push('HIGH-RISK PHISHING: Sent immediately to human security quarantine.');
  }

  const autoArchiveEligible = blockedReasons.length === 0;

  let autoArchiveDecision = 'protected-from-archive';
  if (isHighRiskPhishing) {
    autoArchiveDecision = 'requires-human-review';
  } else if (geminiResult.classification === 'ambiguous') {
    autoArchiveDecision = 'requires-human-review';
  } else if (autoArchiveEligible) {
    autoArchiveDecision = 'auto-archive-eligible';
  }

  return {
    autoArchiveEligible,
    autoArchiveDecision,
    blockedReasons,
    detectedProtectedCategories: detectedProtected,
    isPhishingAlert: isHighRiskPhishing,
    evaluationTimestamp: new Date().toISOString(),
  };
}

