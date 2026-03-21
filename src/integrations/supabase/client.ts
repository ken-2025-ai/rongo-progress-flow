// Supabase Client Configuration for Vite + React
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Environment variables (mapped from NEXT_PUBLIC_* via vite.config.ts)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

// Connection status check
export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('placeholder') &&
  !SUPABASE_ANON_KEY.includes('placeholder')
);

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Debug helper - only in development
if (import.meta.env.DEV) {
  console.log('[v0] Supabase Config:', {
    url: SUPABASE_URL ? `${SUPABASE_URL.substring(0, 30)}...` : 'NOT SET',
    keySet: SUPABASE_ANON_KEY ? 'YES' : 'NO',
    isConfigured: isSupabaseConfigured,
  });
}
