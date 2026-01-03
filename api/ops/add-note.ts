import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ghlClient } from '../../lib/ghl-client';
import { SECURITY_CONFIG, isOpsSecured } from '../../lib/config';
import { generateTraceId } from '../../lib/utils/trace';

/**
 * POST /api/ops/add-note
 * Add a note to a contact in GoHighLevel
 *
 * Headers:
 *   x-ops-key: <OPS_SECRET>
 *
 * Body:
 *   { contact_id: string, note: string }
 */

interface AddNoteRequest {
  contact_id: string;
  note: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const traceId = generateTraceId();

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-ops-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed', trace_id: traceId });
  }

  // Auth check
  if (isOpsSecured()) {
    const providedKey = req.headers['x-ops-key'];
    if (providedKey !== SECURITY_CONFIG.opsSecret) {
      console.warn(`[${traceId}] Unauthorized ops request`);
      return res.status(401).json({ ok: false, error: 'Unauthorized', trace_id: traceId });
    }
  }

  try {
    const { contact_id, note } = req.body as AddNoteRequest;

    if (!contact_id || !note) {
      return res.status(400).json({
        ok: false,
        error: 'contact_id and note are required',
        trace_id: traceId,
      });
    }

    console.log(`[${traceId}] Adding note to contact: ${contact_id}`);

    const { note: createdNote, error } = await ghlClient.addNote(contact_id, note);

    if (error) {
      console.error(`[${traceId}] Error adding note:`, error);
      return res.status(error.statusCode || 500).json({
        ok: false,
        error: error.message,
        trace_id: traceId,
      });
    }

    console.log(`[${traceId}] Note added successfully: ${createdNote?.id}`);

    return res.status(200).json({
      ok: true,
      trace_id: traceId,
      note_id: createdNote?.id,
    });
  } catch (err) {
    console.error(`[${traceId}] Unhandled error:`, err);
    return res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : 'Internal error',
      trace_id: traceId,
    });
  }
}
