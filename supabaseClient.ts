import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Connection Configuration
 * 
 * Replace the values below with your specific Supabase Project credentials.
 * You can find these in your Supabase Project Settings > API.
 */
const supabaseUrl = 'YOUR_SUPABASE_URL_HERE';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY_HERE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);