/**
 * Trace ID utilities for request tracking and observability
 */

/**
 * Generate a unique trace ID for request tracking
 * Format: trace_{timestamp}_{random}
 */
export function generateTraceId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `trace_${timestamp}_${random}`;
}

/**
 * Generate a short unique ID (for dedup keys, etc.)
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Create a dedup key from inquiry details
 * Used to prevent duplicate opportunities within a time window
 */
export function createDedupKey(email: string, propertyId: number | string, checkIn?: string): string {
  const parts = [
    email.toLowerCase().trim(),
    String(propertyId),
    checkIn || 'no-date',
  ];
  return parts.join('|');
}

/**
 * Check if a timestamp is within a time window (in minutes)
 */
export function isWithinWindow(timestamp: Date | string, windowMinutes: number): boolean {
  const then = new Date(timestamp).getTime();
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  return (now - then) < windowMs;
}
