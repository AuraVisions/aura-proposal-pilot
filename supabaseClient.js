import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Connection Setup
 * 
 * 1. Paste your Supabase project URL into SUPABASE_URL.
 * 2. Paste your Supabase public anon key into SUPABASE_PUBLIC_KEY.
 */

const SUPABASE_URL = "sb_publishable_jrUhMeb7sPKwQtnjUmt2dQ_XEMg-6pr";
const SUPABASE_PUBLIC_KEY = "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);