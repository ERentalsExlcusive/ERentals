import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ghlClient } from '../../lib/ghl-client';
import { SECURITY_CONFIG, isOpsSecured } from '../../lib/config';
import { generateTraceId } from '../../lib/utils/trace';

/**
 * POST /api/ops/add-tag
 * Add tags to a contact in GoHighLevel
 *
 * Headers:
 *   x-ops-key: <OPS_SECRET>
 *
 * Body:
 *   { contact_id: string, tags: string[] }
 */

interface AddTagRequest {
  contact_id: string;
  tags: string[];
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
    const { contact_id, tags } = req.body as AddTagRequest;

    if (!contact_id || !tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'contact_id and tags (non-empty array) are required',
        trace_id: traceId,
      });
    }

    console.log(`[${traceId}] Adding ${tags.length} tags to contact: ${contact_id}`);

    const { success, error } = await ghlClient.addContactTags(contact_id, tags);

    if (error) {
      console.error(`[${traceId}] Error adding tags:`, error);
      return res.status(error.statusCode || 500).json({
        ok: false,
        error: error.message,
        trace_id: traceId,
      });
    }

    console.log(`[${traceId}] Tags added successfully`);

    return res.status(200).json({
      ok: true,
      trace_id: traceId,
      tags_added: tags,
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
