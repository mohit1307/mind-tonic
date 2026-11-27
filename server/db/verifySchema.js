const { supabase, testSupabaseConnection } = require('../config/supabase');
const { supabaseDb } = require('./supabaseDb');

const TABLES = [
  'profiles',
  'user_preferences',
  'tasks',
  'schedules',
  'schedule_events',
  'habits',
  'habit_logs',
  'study_subjects',
  'study_sessions',
  'revision_schedules',
  'notifications',
  'documents',
  'expenses',
  'ai_conversations',
];

async function verifySchema() {
  console.log('🔍 Testing Supabase PostgreSQL connectivity and tables...\n');

  const connStatus = await testSupabaseConnection();
  console.log(`Endpoint: ${connStatus.url}`);
  console.log(`Connected: ${connStatus.connected ? '✅ YES' : '❌ NO'}`);

  if (!connStatus.connected) {
    console.error(`Connection Error: ${connStatus.error}`);
    process.exit(1);
  }

  console.log('\nChecking table accessibility:');
  const results = {};

  for (const table of TABLES) {
    try {
      const { data, error } = await supabase.from(table).select('id').limit(1);
      if (error) {
        results[table] = { ready: false, message: error.message, code: error.code };
      } else {
        results[table] = { ready: true, rowsFound: data.length };
      }
    } catch (err) {
      results[table] = { ready: false, message: err.message };
    }
  }

  let allReady = true;
  for (const [tbl, res] of Object.entries(results)) {
    if (res.ready) {
      console.log(`  ✅ public.${tbl.padEnd(22)}: Ready`);
    } else {
      console.log(`  ⚠️ public.${tbl.padEnd(22)}: Not found or awaiting migration (${res.message})`);
      allReady = false;
    }
  }

  console.log('\n------------------------------------------------------------');
  if (allReady) {
    console.log('🎉 All 14 Supabase PostgreSQL tables are online and verified!');
  } else {
    console.log('📌 Notice: Some tables need the SQL migration script applied in Supabase.');
    console.log('   SQL File Path: server/db/migrations/001_initial_schema.sql');
    console.log('   You can run this migration in the Supabase Dashboard SQL Editor.');
  }
  console.log('------------------------------------------------------------\n');

  return { allReady, results };
}

if (require.main === module) {
  verifySchema()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { verifySchema, TABLES };
