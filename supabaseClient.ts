import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Connection Configuration
 */
const supabaseUrl = 'https://izzpdxepqtetfbiyrbxu.supabase.co';
const supabaseAnonKey = 'sb_publishable_jrUhMeb7sPKwQtnjUmt2dQ_XEMg-6pr';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);