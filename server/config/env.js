const dotenv = require('dotenv');
const path = require('path');

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredVars = ['SUPABASE_URL', 'SUPABASE_KEY'];

const env = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vyjqzwjgtgominrllmzf.supabase.co',
  SUPABASE_KEY: process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Vh5JlR_HjQe2MWsjf2n9jw_1IM3iXEx',
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'gemini',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760,
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
};

function validateEnv() {
  const missing = requiredVars.filter((key) => !env[key]);
  if (missing.length > 0 && env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  if (missing.length > 0) {
    console.warn(`⚠️  Missing env vars: ${missing.join(', ')}`);
  }
}

validateEnv();

module.exports = env;
