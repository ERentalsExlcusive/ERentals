import type { VercelRequest, VercelResponse } from '@vercel/node';

// GoHighLevel webhook URL
const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/erentals-inquiry';

interface LeadPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferWhatsApp: boolean;
  propertyName: string;
  propertyId: number;
  price?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number | string;
  message?: string;
  source?: string;
  submittedAt?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  er_id?: string;
  creator_id?: string;
  tags?: string[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body as LeadPayload;

    // Validate required fields
    if (!payload.firstName || !payload.lastName || !payload.email || !payload.phone) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['firstName', 'lastName', 'email', 'phone']
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Forward to GoHighLevel
    const ghlPayload = {
      ...payload,
      source: payload.source || 'ERentals Exclusive App',
      submittedAt: payload.submittedAt || new Date().toISOString(),
    };

    console.log('Forwarding lead to GoHighLevel:', {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      propertyName: payload.propertyName,
    });

    const ghlResponse = await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ghlPayload),
    });

    const ghlStatus = ghlResponse.status;
    let ghlData = null;
    try {
      ghlData = await ghlResponse.text();
    } catch (e) {
      // Ignore parse errors
    }

    console.log('GoHighLevel response:', ghlStatus, ghlData);

    // Return success even if GHL fails (we've logged the lead)
    // But include a warning flag
    return res.status(200).json({
      success: true,
      message: 'Inquiry submitted successfully',
      webhookDelivered: ghlResponse.ok,
      leadId: `lead_${Date.now()}`,
    });

  } catch (error) {
    console.error('Lead submission error:', error);

    // Still return success - we don't want to lose leads due to webhook issues
    return res.status(200).json({
      success: true,
      message: 'Inquiry received (processing delayed)',
      webhookDelivered: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
