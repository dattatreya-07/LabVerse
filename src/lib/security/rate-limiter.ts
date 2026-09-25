/**
 * In-memory sliding window rate limiter for API routes.
 * Designed for serverless/edge environments with automatic window cleanup.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const storage = new Map<string, RateLimitRecord>();

// Clean up stale IP records every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of storage.entries()) {
      record.timestamps = record.timestamps.filter(t => now - t < 60000);
      if (record.timestamps.length === 0) {
        storage.delete(ip);
      }
    }
  }, 300000);
}

export interface RateLimitResult {
  isAllowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Enforces sliding window rate limit for a specific IP key.
 * @param key Client identifier (IP address, user ID, or request token)
 * @param limit Maximum allowed requests within window (default: 20 req/min)
 * @param windowMs Time window in milliseconds (default: 60,000 ms = 1 min)
 */
export function checkRateLimit(
  key: string,
  limit: number = 20,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const record = storage.get(key) || { timestamps: [] };

  // Keep timestamps within the window
  const validTimestamps = record.timestamps.filter(t => now - t < windowMs);

  if (validTimestamps.length >= limit) {
    const oldestTimestamp = validTimestamps[0];
    const resetSeconds = Math.ceil((oldestTimestamp + windowMs - now) / 1000);

    return {
      isAllowed: false,
      limit,
      remaining: 0,
      resetSeconds: Math.max(1, resetSeconds),
    };
  }

  validTimestamps.push(now);
  storage.set(key, { timestamps: validTimestamps });

  return {
    isAllowed: true,
    limit,
    remaining: limit - validTimestamps.length,
    resetSeconds: Math.ceil(windowMs / 1000),
  };
}

/**
 * Extracts client IP address from Next.js request headers securely
 */
export function getClientIP(headers: Headers): string {
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',').map(ip => ip.trim());
    return ips[0] || '127.0.0.1';
  }
  const xRealIP = headers.get('x-real-ip');
  if (xRealIP) {
    return xRealIP.trim();
  }
  return '127.0.0.1';
}
