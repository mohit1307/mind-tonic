const app = require('./app');
const { testSupabaseConnection } = require('./config/supabase');
const env = require('./config/env');

const startServer = async () => {
  // Test connectivity to Supabase PostgreSQL
  console.log('🔗 Connecting to Supabase PostgreSQL...');
  const conn = await testSupabaseConnection();
  if (conn.connected) {
    console.log(`✅ Supabase PostgreSQL connected: ${conn.url}`);
  } else {
    console.warn(`⚠️  Supabase connectivity warning: ${conn.error}`);
  }

  // Initialize background cron jobs
  const jobManager = require('./jobs');
  jobManager.initJobs();

  // Ensure uploads directory exists
  const fs = require('fs');
  const path = require('path');
  const uploadsDir = path.resolve(__dirname, env.UPLOAD_DIR);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Start the Express server
  const server = app.listen(env.PORT, () => {
    console.log(`\n🧠 Mind Tonic API Server`);
    console.log(`   Database:    Supabase PostgreSQL`);
    console.log(`   Auth:        Supabase Auth`);
    console.log(`   Environment: ${env.NODE_ENV}`);
    console.log(`   Port:        ${env.PORT}`);
    console.log(`   URL:         http://localhost:${env.PORT}`);
    console.log(`   Health:      http://localhost:${env.PORT}/api/health\n`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('Mind Tonic API Server closed.');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    shutdown('UNHANDLED_REJECTION');
  });
};

startServer();
