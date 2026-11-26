import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://vyjqzwjgtgominrllmzf.supabase.co';

const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_Vh5JlR_HjQe2MWsjf2n9jw_1IM3iXEx';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Test and verify live connection to Supabase
 */
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error && error.status !== 400 && error.status !== 401) {
      console.warn('Supabase status check warning:', error.message);
      return { connected: false, error: error.message };
    }
    return { connected: true, url: supabaseUrl };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

export default supabase;
