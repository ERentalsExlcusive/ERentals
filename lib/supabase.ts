/**
 * Supabase Client Configuration
 * Handles authentication and database operations for ERentals
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables for Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// Lazy-initialized Supabase client to avoid errors during static export
let _supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    if (!isSupabaseConfigured()) {
      // Create a dummy client that won't be used - operations should check isSupabaseConfigured first
      _supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
        auth: { persistSession: false },
      });
    } else {
      _supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: typeof window !== 'undefined',
          autoRefreshToken: true,
          detectSessionInUrl: typeof window !== 'undefined',
        },
      });
    }
  }
  return _supabase;
}

// Export as a getter-like object for backwards compatibility
export const supabase = {
  get auth() { return getSupabaseClient().auth; },
  from: (table: string) => getSupabaseClient().from(table),
};

// Database types for type safety
export interface Database {
  public: {
    Tables: {
      owners: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'owner' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: 'owner' | 'admin';
        };
        Update: {
          email?: string;
          name?: string;
          role?: 'owner' | 'admin';
        };
      };
      owner_assets: {
        Row: {
          id: string;
          owner_id: string;
          property_slug: string;
          property_name: string;
          status: 'active' | 'draft' | 'unavailable';
          created_at: string;
        };
        Insert: {
          owner_id: string;
          property_slug: string;
          property_name: string;
          status?: 'active' | 'draft' | 'unavailable';
        };
        Update: {
          status?: 'active' | 'draft' | 'unavailable';
        };
      };
      inquiries: {
        Row: {
          id: string;
          owner_id: string;
          property_slug: string;
          guest_name: string;
          guest_email: string;
          guest_phone: string | null;
          check_in: string | null;
          check_out: string | null;
          guests: number | null;
          message: string | null;
          stage: 'new' | 'contacted' | 'options_sent' | 'negotiating' | 'confirmed' | 'lost';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          owner_id: string;
          property_slug: string;
          guest_name: string;
          guest_email: string;
          guest_phone?: string | null;
          check_in?: string | null;
          check_out?: string | null;
          guests?: number | null;
          message?: string | null;
          stage?: 'new' | 'contacted' | 'options_sent' | 'negotiating' | 'confirmed' | 'lost';
          notes?: string | null;
        };
        Update: {
          stage?: 'new' | 'contacted' | 'options_sent' | 'negotiating' | 'confirmed' | 'lost';
          notes?: string | null;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
        };
        Update: {
          name?: string | null;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          property_id: number;
          property_slug: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          property_id: number;
          property_slug: string;
        };
        Update: never;
      };
    };
  };
}
