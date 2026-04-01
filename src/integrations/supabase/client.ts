// Supabase Client Configuration for Vite + React
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Support both VITE_ prefixed (for local dev) and non-prefixed (for Vercel integration) env vars
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '';

// Institutional Resilience Constant
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Use neutral placeholders to prevent library initialization crash during boot
const INITIAL_URL = SUPABASE_URL || 'https://placeholder.supabase.co';
const INITIAL_KEY = SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient<Database>(INITIAL_URL, INITIAL_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
