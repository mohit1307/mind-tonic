const dotenv = require('dotenv');
const path = require('path');

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

const env = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/mind-tonic',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '15m',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
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
    console.warn(`⚠️  Missing env vars (using defaults): ${missing.join(', ')}`);
    // Set development defaults
    if (!env.JWT_SECRET) env.JWT_SECRET = 'dev-jwt-secret-change-in-production-min32chars!!';
    if (!env.JWT_REFRESH_SECRET) env.JWT_REFRESH_SECRET = 'dev-refresh-secret-change-in-production-min32!!';
  }
}

validateEnv();

module.exports = env;
