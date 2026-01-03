import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateTraceId } from '../../lib/utils/trace';

/**
 * POST /api/ghl/events
 * Webhook receiver for inbound GoHighLevel events
 *
 * Events received:
 * - Inbound message (SMS/email)
 * - Stage change
 * - Email reply
 * - Tag added
 *
 * This is a scaffold - full implementation requires:
 * 1. Database for lead_events storage
 * 2. Lead snapshot updates
 * 3. Automation triggers
 */

interface GHLWebhookEvent {
  type: string;
  locationId: string;
  contactId?: string;
  opportunityId?: string;
  data?: Record<string, unknown>;
  timestamp?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const traceId = generateTraceId();

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const event = req.body as GHLWebhookEvent;

    console.log(`[${traceId}] GHL webhook received:`, {
      type: event.type,
      contactId: event.contactId,
      opportunityId: event.opportunityId,
    });

    // TODO: Verify webhook signature (if GHL provides one)

    // TODO: Store event in lead_events table
    // await db.insert(leadEvents).values({
    //   trace_id: traceId,
    //   event_type: 'webhook_inbound',
    //   raw_payload: event,
    //   ghl_contact_id: event.contactId,
    //   ghl_opportunity_id: event.opportunityId,
    //   status: 'pending',
    //   created_at: new Date(),
    // });

    // TODO: Update lead_snapshots based on event type
    // switch (event.type) {
    //   case 'message.inbound':
    //     // Update last_touch_at
    //     break;
    //   case 'opportunity.stageChange':
    //     // Update stage
    //     break;
    //   case 'contact.tagAdded':
    //     // Update tags
    //     break;
    // }

    // For now, just acknowledge receipt
    return res.status(200).json({
      ok: true,
      trace_id: traceId,
      message: 'Event received',
    });
  } catch (err) {
    console.error(`[${traceId}] Webhook error:`, err);
    return res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : 'Internal error',
      trace_id: traceId,
    });
  }
}
