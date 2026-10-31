/**
 * STRICT GEMINI RESPONSE VALIDATOR
 * Never trust free-form model output.
 */

const ALLOWED_CLASSIFICATIONS = ['obvious-junk', 'obvious-keep', 'ambiguous'];
const ALLOWED_PHISHING_RISKS = ['low', 'medium', 'high'];

export function validateGeminiResponse(rawOutput) {
  let parsed = null;

  // 1. JSON parsing validation
  if (typeof rawOutput === 'object' && rawOutput !== null) {
    parsed = rawOutput;
  } else if (typeof rawOutput === 'string') {
    try {
      // Strip markdown code fences if present (e.g. ```json ... ```)
      const sanitized = rawOutput
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      parsed = JSON.parse(sanitized);
    } catch (err) {
      return {
        valid: false,
        error: `Model output is not valid JSON: ${err.message}`,
        data: null,
      };
    }
  } else {
    return {
      valid: false,
      error: 'Model output is neither string nor object',
      data: null,
    };
  }

  // 2. Validate classification field
  if (!parsed.classification || !ALLOWED_CLASSIFICATIONS.includes(parsed.classification)) {
    return {
      valid: false,
      error: `Invalid or missing classification: "${parsed.classification}". Allowed: [${ALLOWED_CLASSIFICATIONS.join(', ')}]`,
      data: null,
    };
  }

  // 3. Validate confidence score (must be number in range [0.0, 1.0])
  if (
    typeof parsed.confidence !== 'number' ||
    isNaN(parsed.confidence) ||
    parsed.confidence < 0.0 ||
    parsed.confidence > 1.0
  ) {
    return {
      valid: false,
      error: `Confidence value must be a number between 0.0 and 1.0. Received: ${parsed.confidence}`,
      data: null,
    };
  }

  // 4. Validate summary string
  if (typeof parsed.summary !== 'string' || parsed.summary.trim().length === 0) {
    return {
      valid: false,
      error: 'Summary must be a non-empty string',
      data: null,
    };
  }

  // 5. Validate phishingRisk
  if (!parsed.phishingRisk || !ALLOWED_PHISHING_RISKS.includes(parsed.phishingRisk)) {
    return {
      valid: false,
      error: `Invalid or missing phishingRisk: "${parsed.phishingRisk}". Allowed: [${ALLOWED_PHISHING_RISKS.join(', ')}]`,
      data: null,
    };
  }

  // 6. Validate importanceIndicators (must be array)
  if (!Array.isArray(parsed.importanceIndicators)) {
    return {
      valid: false,
      error: 'importanceIndicators must be an array of strings',
      data: null,
    };
  }

  // 7. Validate reasons (must be array)
  if (!Array.isArray(parsed.reasons)) {
    return {
      valid: false,
      error: 'reasons must be an array of strings',
      data: null,
    };
  }

  // Return clean, strictly typed validated object
  return {
    valid: true,
    error: null,
    data: {
      classification: parsed.classification,
      confidence: Math.round(parsed.confidence * 1000) / 1000,
      summary: parsed.summary.trim(),
      phishingRisk: parsed.phishingRisk,
      importanceIndicators: parsed.importanceIndicators.map(i => String(i).trim()),
      reasons: parsed.reasons.map(r => String(r).trim()),
    },
  };
}

