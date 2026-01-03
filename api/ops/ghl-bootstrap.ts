import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GHL_CONFIG, SECURITY_CONFIG, isOpsSecured, isGHLConfigured } from '../../lib/config';
import { generateTraceId } from '../../lib/utils/trace';

/**
 * GET /api/ops/ghl-bootstrap
 * Fetch GHL pipelines and stages to help configure the integration
 *
 * Headers:
 *   x-ops-key: <OPS_SECRET>
 *
 * Returns pipeline IDs and stage IDs for configuration
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const traceId = generateTraceId();

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-ops-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
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

  // Check GHL config
  if (!isGHLConfigured()) {
    return res.status(500).json({
      ok: false,
      error: 'GHL not configured. Set GHL_API_KEY and GHL_LOCATION_ID environment variables.',
      trace_id: traceId,
    });
  }

  try {
    console.log(`[${traceId}] Fetching GHL pipelines...`);

    // Fetch pipelines
    const pipelinesUrl = `${GHL_CONFIG.baseUrl}/opportunities/pipelines?locationId=${GHL_CONFIG.locationId}`;

    const response = await fetch(pipelinesUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GHL_CONFIG.apiKey}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${traceId}] GHL API error:`, response.status, errorText);
      return res.status(response.status).json({
        ok: false,
        error: `GHL API error: ${response.status}`,
        details: errorText,
        trace_id: traceId,
      });
    }

    const data = await response.json();
    console.log(`[${traceId}] Pipelines fetched successfully`);

    // Format the response for easy reading
    const pipelines = (data.pipelines || []).map((pipeline: any) => ({
      id: pipeline.id,
      name: pipeline.name,
      stages: (pipeline.stages || []).map((stage: any) => ({
        id: stage.id,
        name: stage.name,
        position: stage.position,
      })),
    }));

    // Generate env var suggestions
    const envSuggestions: string[] = [];
    if (pipelines.length > 0) {
      const firstPipeline = pipelines[0];
      envSuggestions.push(`GHL_PIPELINE_ID=${firstPipeline.id}`);

      if (firstPipeline.stages && firstPipeline.stages.length > 0) {
        // Try to find common stage names
        const stages = firstPipeline.stages;
        const newStage = stages.find((s: any) =>
          s.name.toLowerCase().includes('new') ||
          s.name.toLowerCase().includes('inquiry') ||
          s.name.toLowerCase().includes('lead')
        ) || stages[0];

        const quoteStage = stages.find((s: any) =>
          s.name.toLowerCase().includes('quote') ||
          s.name.toLowerCase().includes('sent')
        );

        const repliedStage = stages.find((s: any) =>
          s.name.toLowerCase().includes('replied') ||
          s.name.toLowerCase().includes('contact')
        );

        const bookedStage = stages.find((s: any) =>
          s.name.toLowerCase().includes('booked') ||
          s.name.toLowerCase().includes('won') ||
          s.name.toLowerCase().includes('closed')
        );

        envSuggestions.push(`GHL_STAGE_NEW_INQUIRY=${newStage.id}  # ${newStage.name}`);
        if (quoteStage) envSuggestions.push(`GHL_STAGE_QUOTE_SENT=${quoteStage.id}  # ${quoteStage.name}`);
        if (repliedStage) envSuggestions.push(`GHL_STAGE_REPLIED=${repliedStage.id}  # ${repliedStage.name}`);
        if (bookedStage) envSuggestions.push(`GHL_STAGE_BOOKED=${bookedStage.id}  # ${bookedStage.name}`);
      }
    }

    return res.status(200).json({
      ok: true,
      trace_id: traceId,
      location_id: GHL_CONFIG.locationId,
      pipelines,
      env_suggestions: envSuggestions,
      instructions: [
        '1. Copy the pipeline ID you want to use',
        '2. Copy the stage IDs for each stage',
        '3. Add them to Vercel Environment Variables',
        '4. Redeploy to apply changes',
      ],
    });
  } catch (err) {
    console.error(`[${traceId}] Bootstrap error:`, err);
    return res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : 'Internal error',
      trace_id: traceId,
    });
  }
}
