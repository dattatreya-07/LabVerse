/**
 * Server-side input sanitization, PII suppression, and prompt injection defense.
 */

// Patterns indicating potential prompt injection attempts
const PROMPT_INJECTION_PATTERNS = [
  /ignore (all )?previous (instructions|prompts|rules)/i,
  /system prompt/i,
  /you are now a/i,
  /override safety rules/i,
  /disregard (the )?above/i,
  /reveal (the )?secret/i,
  /act as an unrestricted/i,
  /jailbreak/i,
];

// PII patterns to scrub before passing data to third-party APIs (LLM/Groq)
const PII_PATTERNS = [
  // Emails
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // Phone numbers (US / international formats)
  /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  // Social security numbers
  /\b\d{3}-\d{2}-\d{4}\b/g,
];

export interface SanitizationResult {
  sanitized: string;
  isFlagged: boolean;
  flagReason?: string;
}

/**
 * Strips dangerous HTML/script tags and sanitizes user prompt text.
 */
export function sanitizeUserText(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip script tags
    .replace(/<[^>]+>/g, '') // Strip all HTML tags
    .replace(/javascript:/gi, '') // Strip inline JS protocols
    .replace(/on\w+="[^"]*"/gi, '') // Strip inline event handlers
    .trim();
}

/**
 * Scrubs any accidentally included PII from text before transmitting to AI providers.
 */
export function scrubPII(text: string): string {
  if (!text) return '';
  let scrubbed = text;
  PII_PATTERNS.forEach(pattern => {
    scrubbed = scrubbed.replace(pattern, '[REDACTED_PII]');
  });
  return scrubbed;
}

/**
 * Inspects a student query for prompt injection attacks and sanitizes content.
 */
export function validateAndSanitizePrompt(rawInput: string): SanitizationResult {
  const sanitized = sanitizeUserText(rawInput);

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      return {
        sanitized: scrubPII(sanitized.replace(pattern, '[SUSPICIOUS_PHRASE]')),
        isFlagged: true,
        flagReason: 'Potential prompt injection attempt detected',
      };
    }
  }

  const cleanText = scrubPII(sanitized);

  return {
    sanitized: cleanText,
    isFlagged: false,
  };
}

/**
 * Safely parses and bounds pagination parameters to prevent unbounded database queries.
 */
export function getBoundedPagination(
  urlParams: URLSearchParams,
  defaultLimit: number = 20,
  maxLimit: number = 100
): { page: number; limit: number; offset: number } {
  const rawPage = parseInt(urlParams.get('page') || '1', 10);
  const rawLimit = parseInt(urlParams.get('limit') || String(defaultLimit), 10);

  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  let limit = isNaN(rawLimit) || rawLimit < 1 ? defaultLimit : rawLimit;
  if (limit > maxLimit) limit = maxLimit;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}
