const { createClient } = require('@supabase/supabase-js');

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://vyjqzwjgtgominrllmzf.supabase.co';

const supabaseKey =
  process.env.SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_Vh5JlR_HjQe2MWsjf2n9jw_1IM3iXEx';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Test connectivity to Supabase project
 */
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error && error.status !== 400 && error.status !== 401) {
      return { connected: false, error: error.message };
    }
    return { connected: true, url: supabaseUrl };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

module.exports = {
  supabase,
  testSupabaseConnection,
};
