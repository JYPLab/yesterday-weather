import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import healthRoutes from './routes/health.js';
import weatherRoutes from './routes/weather.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', healthRoutes);
app.use('/api', weatherRoutes);

async function start() {
  if (config.mockMode) {
    console.log('Running in MOCK mode (no DB, no external API)');
  } else {
    // DB와 스케줄러는 실제 모드에서만
    try {
      const { runMigrations } = await import('./db/migrate.js');
      await runMigrations();
      console.log('DB migrations complete');
    } catch (err) {
      console.warn('DB migration skipped:', (err as Error).message);
    }

    try {
      const userRoutes = (await import('./routes/user.js')).default;
      app.use('/api', userRoutes);

      const { startScheduler } = await import('./cron/scheduler.js');
      startScheduler();
    } catch (err) {
      console.warn('Scheduler skipped:', (err as Error).message);
    }
  }

  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
}

start();
