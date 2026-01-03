import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GHL_CONFIG, isGHLConfigured, isPipelineConfigured } from '../../lib/config';
import { ghlClient } from '../../lib/ghl-client';

/**
 * GET /api/ops/ghl-test
 * Test GHL operations
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!isGHLConfigured()) {
    return res.status(500).json({ error: 'GHL not configured' });
  }

  const action = req.query.action || 'search';
  const email = (req.query.email as string) || 'test-debug@example.com';

  try {
    if (action === 'config') {
      // Check config status
      return res.status(200).json({
        action: 'config',
        ghlConfigured: isGHLConfigured(),
        pipelineConfigured: isPipelineConfigured(),
        pipelineId: GHL_CONFIG.pipelineId || '(not set)',
        stageNewInquiry: GHL_CONFIG.stages.newInquiry || '(not set)',
      });
    }

    if (action === 'debug') {
      // Direct API call to debug - try email filter
      const searchUrl = `https://services.leadconnectorhq.com/contacts/?locationId=${GHL_CONFIG.locationId}&query=${encodeURIComponent(email)}&limit=5`;
      console.log('Debug search URL:', searchUrl);

      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GHL_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
      });

      const data = await response.json();
      return res.status(200).json({
        action: 'debug',
        url: searchUrl,
        status: response.status,
        data,
      });
    }

    if (action === 'search') {
      // Test search
      console.log('Testing search for:', email);
      const contact = await ghlClient.searchContactByEmail(email);
      return res.status(200).json({
        action: 'search',
        email,
        found: !!contact,
        contact,
      });
    }

    if (action === 'create') {
      // Test create new contact
      const testEmail = `test-${Date.now()}@example.com`;
      console.log('Creating contact:', testEmail);

      const { contact, created, error } = await ghlClient.findOrCreateContact({
        firstName: 'Test',
        lastName: 'User',
        email: testEmail,
        phone: '+15551234567',
        tags: ['test-tag'],
      });

      return res.status(200).json({
        action: 'create',
        email: testEmail,
        contact,
        created,
        error,
      });
    }

    if (action === 'opportunity') {
      // Test opportunity creation
      const contactId = req.query.contact_id as string;
      if (!contactId) {
        return res.status(400).json({ error: 'Missing contact_id' });
      }

      const { opportunity, error } = await ghlClient.createOpportunity({
        name: 'Test Opportunity - Villa',
        pipelineId: GHL_CONFIG.pipelineId,
        pipelineStageId: GHL_CONFIG.stages.newInquiry,
        contactId,
        monetaryValue: 5000,
      });

      return res.status(200).json({
        action: 'opportunity',
        opportunity,
        error,
      });
    }

    return res.status(400).json({ error: 'Unknown action. Use ?action=search, ?action=create, ?action=config, ?action=opportunity' });
  } catch (err) {
    console.error('Test error:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
