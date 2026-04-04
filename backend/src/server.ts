import app from './app';
import { config } from './config';

const start = () => {
  // Validate critical env vars
  if (!config.databaseUrl) {
    console.error('❌ DATABASE_URL is required. Copy .env.example to .env and fill it in.');
    process.exit(1);
  }

  if (config.jwt.secret === 'fallback-secret-change-me') {
    console.warn('⚠️  WARNING: Using fallback JWT secret. Set JWT_SECRET in .env for production.');
  }

  app.listen(config.port, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║           🏠 HOMYS API SERVER                ║
╠══════════════════════════════════════════════╣
║  Status:  Running                            ║
║  Port:    ${String(config.port).padEnd(35)}║
║  Mode:    ${config.nodeEnv.padEnd(35)}║
║  API:     http://localhost:${config.port}/api${' '.repeat(12)}║
║  Health:  http://localhost:${config.port}/api/health${' '.repeat(5)}║
╚══════════════════════════════════════════════╝
    `);
  });
};

start();
