// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// These should be in your environment variables for security
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Create a single Supabase client for your app
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Avoid detecting sessions from URL on visibility changes or redirects.
    // This reduces automatic navigation/session recovery that can cause full page reloads
    // when the browser restores a background tab. Set to false unless you're using
    // OAuth implicit/PKCE redirects that require session detection from the URL.
    detectSessionInUrl: false,
  },
});
