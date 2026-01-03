import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ghlClient } from '../../lib/ghl-client';
import { SECURITY_CONFIG, isOpsSecured } from '../../lib/config';
import { generateTraceId } from '../../lib/utils/trace';

/**
 * POST /api/ops/move-stage
 * Move an opportunity to a different pipeline stage
 *
 * Headers:
 *   x-ops-key: <OPS_SECRET>
 *
 * Body:
 *   { opportunity_id: string, stage_id: string }
 */

interface MoveStageRequest {
  opportunity_id: string;
  stage_id: string;
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
    const { opportunity_id, stage_id } = req.body as MoveStageRequest;

    if (!opportunity_id || !stage_id) {
      return res.status(400).json({
        ok: false,
        error: 'opportunity_id and stage_id are required',
        trace_id: traceId,
      });
    }

    console.log(`[${traceId}] Moving opportunity ${opportunity_id} to stage ${stage_id}`);

    const { opportunity, error } = await ghlClient.moveOpportunityStage(opportunity_id, stage_id);

    if (error) {
      console.error(`[${traceId}] Error moving stage:`, error);
      return res.status(error.statusCode || 500).json({
        ok: false,
        error: error.message,
        trace_id: traceId,
      });
    }

    console.log(`[${traceId}] Stage updated successfully`);

    return res.status(200).json({
      ok: true,
      trace_id: traceId,
      opportunity: {
        id: opportunity?.id,
        stage_id: opportunity?.pipelineStageId,
      },
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
