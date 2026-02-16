import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Connection Setup
 * 
 * Paste your Supabase Project URL and Public API Key below.
 */

const SUPABASE_URL = "https://izzpdxepqtetfbiyrbxu.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_jrUhMeb7sPKwQtnjUmt2dQ_XEMg-6pr";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);