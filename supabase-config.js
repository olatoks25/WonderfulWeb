/**
 * =====================================================
 * Supabase Configuration
 * =====================================================
 * 1. Go to your Supabase project → Settings → API
 * 2. Copy "Project URL" and paste below as SUPABASE_URL
 * 3. Copy "anon public" key and paste below as SUPABASE_ANON_KEY
 *
 * It is SAFE to expose the anon key in frontend code —
 * it's designed for public/client-side use. Row Level
 * Security (RLS) policies (set up via supabase_setup.sql)
 * control what it's actually allowed to do.
 * =====================================================
 */

const SUPABASE_URL = "https://wnyljtbnljrmffuzunde.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_aPFZ3YlUDswD3OhYQ7P5Jg_OOByTqFB";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
