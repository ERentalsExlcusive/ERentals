/**
 * Input normalization utilities for lead data
 */

/**
 * Normalize email address
 * - Lowercase
 * - Trim whitespace
 * - Basic validation
 */
export function normalizeEmail(email: string | undefined | null): string | null {
  if (!email) return null;
  const normalized = email.toLowerCase().trim();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    return null;
  }

  return normalized;
}

/**
 * Normalize phone number to E.164 format (best effort)
 * - Remove all non-digit characters except leading +
 * - Add country code if missing (assumes US +1)
 * - Returns null if clearly invalid
 */
export function normalizePhone(phone: string | undefined | null): string | null {
  if (!phone) return null;

  // Remove all non-digit characters except leading +
  let cleaned = phone.trim();
  const hasPlus = cleaned.startsWith('+');
  cleaned = cleaned.replace(/\D/g, '');

  // Need at least 10 digits for a valid phone
  if (cleaned.length < 10) {
    return null;
  }

  // If starts with 1 and has 11 digits, it's already US format
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }

  // If exactly 10 digits, assume US and prepend +1
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  // If it had a + and has valid length, use as-is
  if (hasPlus && cleaned.length >= 10 && cleaned.length <= 15) {
    return `+${cleaned}`;
  }

  // Otherwise return cleaned with + if it looks valid
  if (cleaned.length >= 10 && cleaned.length <= 15) {
    return `+${cleaned}`;
  }

  return null;
}

/**
 * Normalize date string to ISO format (YYYY-MM-DD)
 */
export function normalizeDate(date: string | undefined | null): string | null {
  if (!date) return null;

  try {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

/**
 * Normalize name (trim, title case first letter)
 */
export function normalizeName(name: string | undefined | null): string {
  if (!name) return '';
  return name.trim();
}

/**
 * Split full name into first and last
 */
export function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
}

/**
 * Extract budget amount from display string
 * "$5,000 - $8,000" -> 5000 (uses lower bound)
 */
export function extractBudgetAmount(budget: string | undefined | null): number | null {
  if (!budget) return null;

  // Find first number in string
  const match = budget.replace(/,/g, '').match(/\d+/);
  if (!match) return null;

  return parseInt(match[0], 10);
}

/**
 * Categorize budget into buckets for tagging
 */
export function getBudgetBucket(budget: string | undefined | null): string | null {
  const amount = extractBudgetAmount(budget);
  if (!amount) return null;

  if (amount < 3000) return 'budget:under-3k';
  if (amount < 5000) return 'budget:3k-5k';
  if (amount < 10000) return 'budget:5k-10k';
  if (amount < 20000) return 'budget:10k-20k';
  return 'budget:20k-plus';
}
