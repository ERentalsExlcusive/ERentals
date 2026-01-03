/**
 * Centralized configuration for ERentals backend services
 * Loads from environment variables with sensible defaults
 */

// GHL API Configuration
export const GHL_CONFIG = {
  apiKey: process.env.GHL_API_KEY || '',
  locationId: process.env.GHL_LOCATION_ID || '',
  baseUrl: 'https://services.leadconnectorhq.com',

  // Pipeline stages
  pipelineId: process.env.GHL_PIPELINE_ID || '',
  stages: {
    newInquiry: process.env.GHL_STAGE_NEW_INQUIRY || '',
    quoteSent: process.env.GHL_STAGE_QUOTE_SENT || '',
    replied: process.env.GHL_STAGE_REPLIED || '',
    booked: process.env.GHL_STAGE_BOOKED || '',
  },

  // Custom field keys (GHL internal names)
  customFields: {
    propertyName: process.env.GHL_FIELD_PROPERTY_NAME || 'property_name',
    checkIn: process.env.GHL_FIELD_CHECK_IN || 'check_in',
    checkOut: process.env.GHL_FIELD_CHECK_OUT || 'check_out',
    guests: process.env.GHL_FIELD_GUESTS || 'guest_count',
    budget: process.env.GHL_FIELD_BUDGET || 'budget',
    assetSlug: process.env.GHL_FIELD_ASSET_SLUG || 'asset_slug',
    assetCategory: process.env.GHL_FIELD_ASSET_CATEGORY || 'asset_category',
    source: process.env.GHL_FIELD_SOURCE || 'lead_source',
    creatorId: process.env.GHL_FIELD_CREATOR_ID || 'creator_id',
    // Additional charter fields
    charterDuration: 'charter_duration',
    charterTime: 'charter_time',
    occasion: 'occasion',
    pickupLocation: 'pickup_location',
    dropoffLocation: 'dropoff_location',
  },
};

// Security Configuration
export const SECURITY_CONFIG = {
  opsSecret: process.env.OPS_SECRET || '',
};

// Database Configuration (optional)
export const DB_CONFIG = {
  url: process.env.DATABASE_URL || '',
  enabled: !!process.env.DATABASE_URL,
};

// Validation helpers
export function isGHLConfigured(): boolean {
  return !!(GHL_CONFIG.apiKey && GHL_CONFIG.locationId);
}

export function isPipelineConfigured(): boolean {
  return !!(GHL_CONFIG.pipelineId && GHL_CONFIG.stages.newInquiry);
}

export function isOpsSecured(): boolean {
  return !!SECURITY_CONFIG.opsSecret;
}

// Environment helpers
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
