import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { runMigrations } from './db/migrate.js';
import healthRoutes from './routes/health.js';
import weatherRoutes from './routes/weather.js';
import userRoutes from './routes/user.js';
import { startScheduler } from './cron/scheduler.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', healthRoutes);
app.use('/api', weatherRoutes);
app.use('/api', userRoutes);

async function start() {
  try {
    await runMigrations();
    console.log('DB migrations complete');
  } catch (err) {
    console.warn('DB migration skipped (DB not available):', (err as Error).message);
  }

  startScheduler();

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

start();
