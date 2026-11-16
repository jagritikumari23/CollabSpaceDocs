import { createClient } from '@supabase/supabase-js';

let rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
if (rawUrl && !rawUrl.startsWith('http')) {
  rawUrl = `https://${rawUrl}.supabase.co`;
}
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  supabaseAnonKey &&
  !rawUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder')
);

export const supabaseUrl = rawUrl;

// If configured, create a real client; otherwise create a dummy client or null
export const supabase = isSupabaseConfigured
  ? createClient(rawUrl, supabaseAnonKey)
  : null;
