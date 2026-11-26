const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Ensure uploads directory exists
  const fs = require('fs');
  const path = require('path');
  const uploadsDir = path.resolve(__dirname, env.UPLOAD_DIR);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Start the server
  const server = app.listen(env.PORT, () => {
    console.log(`\n🧠 Mind Tonic API Server`);
    console.log(`   Environment: ${env.NODE_ENV}`);
    console.log(`   Port:        ${env.PORT}`);
    console.log(`   URL:         http://localhost:${env.PORT}`);
    console.log(`   Health:      http://localhost:${env.PORT}/api/health\n`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      const mongoose = require('mongoose');
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
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
