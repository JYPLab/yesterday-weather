import cron from 'node-cron';
import { pool } from '../db/pool.js';
import { getWeatherComparison } from '../services/weatherService.js';
import { sendPush } from '../services/pushService.js';

export function startScheduler(): void {
  // 매 정각: 해당 시간 알림 대상 유저에게 푸시 발송
  cron.schedule('0 * * * *', async () => {
    const kstNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const hour = kstNow.getHours();
    console.log(`[CRON] Running push job for hour ${hour}`);

    try {
      const result = await pool.query(
        'SELECT * FROM user_config WHERE alarm_hour = $1',
        [hour]
      );

      for (const user of result.rows) {
        try {
          const comparison = await getWeatherComparison(
            user.nx,
            user.ny
          );
          await sendPush(user.user_id, comparison.delta.daily);
        } catch (err) {
          console.error(
            `[CRON] Push failed for ${user.user_id}:`,
            err
          );
        }
      }
    } catch (err) {
      console.error('[CRON] Scheduler error:', err);
    }
  });

  console.log('Scheduler started');
}
