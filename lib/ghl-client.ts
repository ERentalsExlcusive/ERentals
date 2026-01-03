/**
 * GoHighLevel API Client
 * Handles contact, opportunity, and note operations
 */

import { GHL_CONFIG } from './config';

// =============================================================================
// Types
// =============================================================================

export interface GHLContact {
  id: string;
  locationId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  customFields?: Record<string, string | number | boolean>;
  dateAdded?: string;
  dateUpdated?: string;
}

export interface GHLContactInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  customFields?: Record<string, string | number | boolean>;
  source?: string;
}

export interface GHLOpportunity {
  id: string;
  name: string;
  pipelineId: string;
  pipelineStageId: string;
  status: string;
  contactId: string;
  monetaryValue?: number;
  dateAdded?: string;
  dateUpdated?: string;
}

export interface GHLOpportunityInput {
  name: string;
  pipelineId: string;
  pipelineStageId: string;
  contactId: string;
  monetaryValue?: number;
  status?: string;
}

export interface GHLNote {
  id: string;
  body: string;
  contactId: string;
  dateAdded: string;
}

export interface GHLError {
  statusCode: number;
  message: string;
  error?: string;
}

// =============================================================================
// API Client
// =============================================================================

class GHLClient {
  // Use getters to read config at request time, not module load time
  private get apiKey(): string {
    return GHL_CONFIG.apiKey;
  }

  private get locationId(): string {
    return GHL_CONFIG.locationId;
  }

  private get baseUrl(): string {
    return GHL_CONFIG.baseUrl;
  }

  private get headers(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    };
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: object
  ): Promise<{ data: T | null; error: GHLError | null }> {
    if (!this.apiKey) {
      return { data: null, error: { statusCode: 500, message: 'GHL API key not configured' } };
    }

    try {
      const url = `${this.baseUrl}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: this.headers,
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: {
            statusCode: response.status,
            message: data.message || 'GHL API error',
            error: data.error,
          },
        };
      }

      return { data: data as T, error: null };
    } catch (err) {
      return {
        data: null,
        error: {
          statusCode: 500,
          message: err instanceof Error ? err.message : 'Network error',
        },
      };
    }
  }

  // ===========================================================================
  // Contact Operations
  // ===========================================================================

  /**
   * Search for a contact by email
   */
  async searchContactByEmail(email: string): Promise<GHLContact | null> {
    // GHL uses 'query' param for searching (not 'email')
    const { data, error } = await this.request<{ contacts: GHLContact[] }>(
      'GET',
      `/contacts/?locationId=${this.locationId}&query=${encodeURIComponent(email)}&limit=1`
    );

    if (error || !data?.contacts?.length) {
      return null;
    }

    // Verify exact email match (query can return partial matches)
    const exactMatch = data.contacts.find(c => c.email?.toLowerCase() === email.toLowerCase());
    return exactMatch || null;
  }

  /**
   * Search for a contact by phone
   */
  async searchContactByPhone(phone: string): Promise<GHLContact | null> {
    // Clean phone for search
    const cleanPhone = phone.replace(/\D/g, '');

    // GHL uses 'query' param for searching
    const { data, error } = await this.request<{ contacts: GHLContact[] }>(
      'GET',
      `/contacts/?locationId=${this.locationId}&query=${encodeURIComponent(phone)}&limit=5`
    );

    if (error || !data?.contacts?.length) {
      return null;
    }

    // Find phone match (comparing cleaned versions)
    return data.contacts.find(c => {
      const cPhone = c.phone?.replace(/\D/g, '') || '';
      return cPhone === cleanPhone || cPhone.endsWith(cleanPhone) || cleanPhone.endsWith(cPhone);
    }) || null;
  }

  /**
   * Create a new contact
   */
  async createContact(input: GHLContactInput): Promise<{ contact: GHLContact | null; error: GHLError | null }> {
    const { data, error } = await this.request<{ contact: GHLContact }>(
      'POST',
      '/contacts/',
      {
        locationId: this.locationId,
        ...input,
      }
    );

    return { contact: data?.contact || null, error };
  }

  /**
   * Update an existing contact
   */
  async updateContact(
    contactId: string,
    input: Partial<GHLContactInput>
  ): Promise<{ contact: GHLContact | null; error: GHLError | null }> {
    const { data, error } = await this.request<{ contact: GHLContact }>(
      'PUT',
      `/contacts/${contactId}`,
      input
    );

    return { contact: data?.contact || null, error };
  }

  /**
   * Add tags to a contact
   */
  async addContactTags(contactId: string, tags: string[]): Promise<{ success: boolean; error: GHLError | null }> {
    const { error } = await this.request<void>(
      'POST',
      `/contacts/${contactId}/tags`,
      { tags }
    );

    return { success: !error, error };
  }

  /**
   * Find or create a contact (deduplication)
   */
  async findOrCreateContact(
    input: GHLContactInput
  ): Promise<{ contact: GHLContact | null; created: boolean; error: GHLError | null }> {
    // Try to find by email first
    if (input.email) {
      const existing = await this.searchContactByEmail(input.email);
      if (existing) {
        // Update with any new info
        const { contact, error } = await this.updateContact(existing.id, input);
        return { contact: contact || existing, created: false, error };
      }
    }

    // Try to find by phone
    if (input.phone) {
      const existing = await this.searchContactByPhone(input.phone);
      if (existing) {
        // Update with any new info
        const { contact, error } = await this.updateContact(existing.id, input);
        return { contact: contact || existing, created: false, error };
      }
    }

    // Create new contact
    const { contact, error } = await this.createContact(input);
    return { contact, created: true, error };
  }

  // ===========================================================================
  // Opportunity Operations
  // ===========================================================================

  /**
   * Create a new opportunity
   */
  async createOpportunity(input: GHLOpportunityInput): Promise<{ opportunity: GHLOpportunity | null; error: GHLError | null }> {
    const { data, error } = await this.request<{ opportunity: GHLOpportunity }>(
      'POST',
      '/opportunities/',
      {
        locationId: this.locationId,
        ...input,
        status: input.status || 'open',
      }
    );

    return { opportunity: data?.opportunity || null, error };
  }

  /**
   * Update an opportunity
   */
  async updateOpportunity(
    opportunityId: string,
    input: Partial<GHLOpportunityInput>
  ): Promise<{ opportunity: GHLOpportunity | null; error: GHLError | null }> {
    const { data, error } = await this.request<{ opportunity: GHLOpportunity }>(
      'PUT',
      `/opportunities/${opportunityId}`,
      input
    );

    return { opportunity: data?.opportunity || null, error };
  }

  /**
   * Move opportunity to a different stage
   */
  async moveOpportunityStage(
    opportunityId: string,
    stageId: string
  ): Promise<{ opportunity: GHLOpportunity | null; error: GHLError | null }> {
    return this.updateOpportunity(opportunityId, { pipelineStageId: stageId });
  }

  /**
   * Get opportunities for a contact
   */
  async getContactOpportunities(contactId: string): Promise<GHLOpportunity[]> {
    const { data, error } = await this.request<{ opportunities: GHLOpportunity[] }>(
      'GET',
      `/opportunities/search?locationId=${this.locationId}&contactId=${contactId}`
    );

    if (error || !data?.opportunities) {
      return [];
    }

    return data.opportunities;
  }

  // ===========================================================================
  // Notes Operations
  // ===========================================================================

  /**
   * Add a note to a contact
   */
  async addNote(contactId: string, body: string): Promise<{ note: GHLNote | null; error: GHLError | null }> {
    const { data, error } = await this.request<{ note: GHLNote }>(
      'POST',
      `/contacts/${contactId}/notes`,
      { body }
    );

    return { note: data?.note || null, error };
  }
}

// Export singleton instance
export const ghlClient = new GHLClient();

// Export class for testing
export { GHLClient };
