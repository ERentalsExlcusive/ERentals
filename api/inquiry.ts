import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ghlClient } from '../lib/ghl-client';
import { GHL_CONFIG, isGHLConfigured, isPipelineConfigured } from '../lib/config';
import { normalizeEmail, normalizePhone, normalizeDate, splitName, getBudgetBucket } from '../lib/normalize';
import { generateTraceId, createDedupKey } from '../lib/utils/trace';

// =============================================================================
// Types
// =============================================================================

interface InquiryPayload {
  // Contact (required: email OR phone)
  firstName?: string;
  lastName?: string;
  name?: string; // Alternative to firstName/lastName
  email?: string;
  phone?: string;
  preferWhatsApp?: boolean;

  // Property
  propertyName: string;
  propertyId: number;
  propertySlug?: string;
  propertyCategory: 'villa' | 'yacht' | 'transport';

  // Villa-specific
  checkIn?: string;
  checkOut?: string;
  guests?: number;

  // Yacht-specific
  charterDate?: string;
  charterTime?: string;
  charterDuration?: string;
  occasion?: string;

  // Transport-specific
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDate?: string;
  pickupTime?: string;

  // Shared
  message?: string;
  budget?: string;
  price?: string;

  // Attribution
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  er_id?: string;
  creator_id?: string;
}

interface InquiryResponse {
  ok: boolean;
  trace_id: string;
  contact_id?: string;
  opportunity_id?: string;
  error?: string;
  warning?: string;
}

// =============================================================================
// In-memory dedup cache (for short-term deduplication)
// In production, this would be stored in Redis or database
// =============================================================================

const recentInquiries = new Map<string, number>();

function isDuplicate(key: string, windowMs: number = 120000): boolean {
  const lastTime = recentInquiries.get(key);
  if (!lastTime) return false;
  return (Date.now() - lastTime) < windowMs;
}

function recordInquiry(key: string): void {
  recentInquiries.set(key, Date.now());
  // Clean old entries (keep last 1000)
  if (recentInquiries.size > 1000) {
    const cutoff = Date.now() - 300000; // 5 minutes
    for (const [k, v] of recentInquiries) {
      if (v < cutoff) recentInquiries.delete(k);
    }
  }
}

// =============================================================================
// Helper: Build structured note
// =============================================================================

function buildLeadContextNote(payload: InquiryPayload, normalized: {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
}): string {
  const lines: string[] = [
    '📋 LEAD CONTEXT',
    '───────────────',
    `Contact: ${normalized.firstName} ${normalized.lastName}`.trim() +
      (normalized.email ? ` (${normalized.email})` : ''),
    `Property: ${payload.propertyName}`,
  ];

  // Category-specific details
  if (payload.propertyCategory === 'villa') {
    if (payload.checkIn && payload.checkOut) {
      const checkIn = new Date(payload.checkIn);
      const checkOut = new Date(payload.checkOut);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      lines.push(`Dates: ${formatDate(checkIn)} - ${formatDate(checkOut)} (${nights} nights)`);
    }
    if (payload.guests) {
      lines.push(`Guests: ${payload.guests}`);
    }
  } else if (payload.propertyCategory === 'yacht') {
    if (payload.charterDate) {
      lines.push(`Charter Date: ${payload.charterDate}`);
    }
    if (payload.charterTime) {
      lines.push(`Time: ${payload.charterTime}`);
    }
    if (payload.charterDuration) {
      lines.push(`Duration: ${payload.charterDuration}`);
    }
    if (payload.occasion) {
      lines.push(`Occasion: ${payload.occasion}`);
    }
    if (payload.guests) {
      lines.push(`Guests: ${payload.guests}`);
    }
  } else if (payload.propertyCategory === 'transport') {
    if (payload.pickupLocation) {
      lines.push(`Pickup: ${payload.pickupLocation}`);
    }
    if (payload.dropoffLocation) {
      lines.push(`Dropoff: ${payload.dropoffLocation}`);
    }
    if (payload.pickupDate) {
      lines.push(`Date: ${payload.pickupDate}`);
    }
    if (payload.pickupTime) {
      lines.push(`Time: ${payload.pickupTime}`);
    }
  }

  if (payload.budget || payload.price) {
    lines.push(`Budget: ${payload.budget || payload.price}`);
  }

  lines.push(`Source: ${payload.source || 'website'}`);

  if (payload.message) {
    lines.push('');
    lines.push('Message:');
    lines.push(payload.message);
  }

  lines.push('');
  lines.push('Next Steps:');
  lines.push('• Confirm availability');
  lines.push('• Send quote with options');

  return lines.join('\n');
}

// =============================================================================
// Main Handler
// =============================================================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed', trace_id: '' });
  }

  const traceId = generateTraceId();
  const payload = req.body as InquiryPayload;

  console.log(`[${traceId}] Inquiry received:`, {
    propertyName: payload.propertyName,
    category: payload.propertyCategory,
    email: payload.email,
  });

  try {
    // =========================================================================
    // 1. Normalize input
    // =========================================================================

    // Handle name splitting
    let firstName = payload.firstName || '';
    let lastName = payload.lastName || '';
    if (!firstName && payload.name) {
      const split = splitName(payload.name);
      firstName = split.firstName;
      lastName = split.lastName;
    }

    const normalizedEmail = normalizeEmail(payload.email);
    const normalizedPhone = normalizePhone(payload.phone);

    // Validate: need at least email or phone
    if (!normalizedEmail && !normalizedPhone) {
      console.error(`[${traceId}] Missing contact info`);
      return res.status(400).json({
        ok: false,
        error: 'Email or phone required',
        trace_id: traceId,
      } as InquiryResponse);
    }

    // Validate: need property info
    if (!payload.propertyName || !payload.propertyId) {
      console.error(`[${traceId}] Missing property info`);
      return res.status(400).json({
        ok: false,
        error: 'Property name and ID required',
        trace_id: traceId,
      } as InquiryResponse);
    }

    // =========================================================================
    // 2. Dedup check (prevent duplicate opportunities)
    // =========================================================================

    const dedupKey = createDedupKey(
      normalizedEmail || normalizedPhone || '',
      payload.propertyId,
      payload.checkIn || payload.charterDate || payload.pickupDate
    );

    if (isDuplicate(dedupKey)) {
      console.log(`[${traceId}] Duplicate inquiry detected, skipping opportunity creation`);
      // Still return success - just don't create duplicate
      return res.status(200).json({
        ok: true,
        trace_id: traceId,
        warning: 'Duplicate inquiry detected within 2 minutes',
      } as InquiryResponse);
    }

    // =========================================================================
    // 3. Check GHL configuration
    // =========================================================================

    if (!isGHLConfigured()) {
      console.warn(`[${traceId}] GHL not configured - logging only`);
      recordInquiry(dedupKey);
      return res.status(200).json({
        ok: true,
        trace_id: traceId,
        warning: 'Lead logged but GHL not configured',
      } as InquiryResponse);
    }

    // =========================================================================
    // 4. Find or create contact (with deduplication)
    // =========================================================================

    // Build custom fields based on category
    const customFields: Record<string, string> = {
      [GHL_CONFIG.customFields.propertyName]: payload.propertyName,
      [GHL_CONFIG.customFields.assetSlug]: payload.propertySlug || '',
      [GHL_CONFIG.customFields.assetCategory]: payload.propertyCategory,
      [GHL_CONFIG.customFields.source]: payload.source || 'website',
    };

    if (payload.propertyCategory === 'villa') {
      if (payload.checkIn) customFields[GHL_CONFIG.customFields.checkIn] = normalizeDate(payload.checkIn) || payload.checkIn;
      if (payload.checkOut) customFields[GHL_CONFIG.customFields.checkOut] = normalizeDate(payload.checkOut) || payload.checkOut;
      if (payload.guests) customFields[GHL_CONFIG.customFields.guests] = String(payload.guests);
    } else if (payload.propertyCategory === 'yacht') {
      if (payload.charterDate) customFields[GHL_CONFIG.customFields.checkIn] = payload.charterDate;
      if (payload.charterDuration) customFields[GHL_CONFIG.customFields.charterDuration] = payload.charterDuration;
      if (payload.charterTime) customFields[GHL_CONFIG.customFields.charterTime] = payload.charterTime;
      if (payload.occasion) customFields[GHL_CONFIG.customFields.occasion] = payload.occasion;
      if (payload.guests) customFields[GHL_CONFIG.customFields.guests] = String(payload.guests);
    } else if (payload.propertyCategory === 'transport') {
      if (payload.pickupDate) customFields[GHL_CONFIG.customFields.checkIn] = payload.pickupDate;
      if (payload.pickupLocation) customFields[GHL_CONFIG.customFields.pickupLocation] = payload.pickupLocation;
      if (payload.dropoffLocation) customFields[GHL_CONFIG.customFields.dropoffLocation] = payload.dropoffLocation;
      if (payload.pickupTime) customFields[GHL_CONFIG.customFields.charterTime] = payload.pickupTime;
    }

    if (payload.budget || payload.price) {
      customFields[GHL_CONFIG.customFields.budget] = payload.budget || payload.price || '';
    }

    if (payload.creator_id) {
      customFields[GHL_CONFIG.customFields.creatorId] = payload.creator_id;
    }

    // Build tags
    const tags: string[] = [
      'source:site2',
      `inquiry:${payload.propertyCategory}`,
    ];

    const budgetBucket = getBudgetBucket(payload.budget || payload.price);
    if (budgetBucket) tags.push(budgetBucket);

    if (payload.utm_source) tags.push(`utm:${payload.utm_source}`);
    if (payload.creator_id) tags.push(`creator:${payload.creator_id}`);
    if (payload.preferWhatsApp) tags.push('prefers:whatsapp');

    // Find or create contact
    console.log(`[${traceId}] Creating contact with:`, { firstName, lastName, email: normalizedEmail, phone: normalizedPhone });

    const { contact, created, error: contactError } = await ghlClient.findOrCreateContact({
      firstName,
      lastName,
      email: normalizedEmail || undefined,
      phone: normalizedPhone || undefined,
      tags,
      // Note: Custom fields require specific field IDs configured in GHL
      // Uncomment and configure GHL_FIELD_* env vars to enable
      // customFields,
    });

    if (contactError || !contact) {
      console.error(`[${traceId}] Contact error:`, JSON.stringify(contactError));
      return res.status(500).json({
        ok: false,
        error: 'Failed to create contact',
        trace_id: traceId,
        details: contactError?.message,
      } as InquiryResponse);
    }

    console.log(`[${traceId}] Contact ${created ? 'created' : 'found'}: ${contact.id}`);

    // =========================================================================
    // 5. Create opportunity (if pipeline configured)
    // =========================================================================

    let opportunityId: string | undefined;

    if (isPipelineConfigured()) {
      // Build opportunity name
      let oppName = `${payload.propertyName}`;
      if (payload.propertyCategory === 'villa' && payload.checkIn && payload.checkOut) {
        const checkInFormatted = new Date(payload.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const checkOutFormatted = new Date(payload.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        oppName += ` – ${checkInFormatted} to ${checkOutFormatted}`;
      } else if (payload.charterDate) {
        oppName += ` – ${payload.charterDate}`;
      } else if (payload.pickupDate) {
        oppName += ` – ${payload.pickupDate}`;
      }
      oppName += ` – ${lastName || firstName}`;

      const { opportunity, error: oppError } = await ghlClient.createOpportunity({
        name: oppName,
        pipelineId: GHL_CONFIG.pipelineId,
        pipelineStageId: GHL_CONFIG.stages.newInquiry,
        contactId: contact.id,
        monetaryValue: payload.budget ? parseInt(payload.budget.replace(/\D/g, '')) || undefined : undefined,
      });

      if (oppError) {
        console.warn(`[${traceId}] Opportunity error (non-fatal):`, oppError);
      } else if (opportunity) {
        opportunityId = opportunity.id;
        console.log(`[${traceId}] Opportunity created: ${opportunityId}`);
      }
    }

    // =========================================================================
    // 6. Add structured note
    // =========================================================================

    const noteContent = buildLeadContextNote(payload, {
      firstName,
      lastName,
      email: normalizedEmail,
      phone: normalizedPhone,
    });

    const { error: noteError } = await ghlClient.addNote(contact.id, noteContent);
    if (noteError) {
      console.warn(`[${traceId}] Note error (non-fatal):`, noteError);
    }

    // =========================================================================
    // 7. Record for dedup and return success
    // =========================================================================

    recordInquiry(dedupKey);

    console.log(`[${traceId}] Inquiry processed successfully`);

    return res.status(200).json({
      ok: true,
      trace_id: traceId,
      contact_id: contact.id,
      opportunity_id: opportunityId,
    } as InquiryResponse);

  } catch (err) {
    console.error(`[${traceId}] Unhandled error:`, err);

    return res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : 'Internal server error',
      trace_id: traceId,
    } as InquiryResponse);
  }
}
