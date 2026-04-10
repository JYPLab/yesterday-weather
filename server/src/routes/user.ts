import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../db/pool.js';
import { findRegion } from 'yesterday-weather-shared';

// Basic Auth 검증 미들웨어
function requireBasicAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers['authorization'];
  const expected = `Basic ${Buffer.from(process.env.DISCONNECT_BASIC_AUTH ?? '').toString('base64')}`;
  if (!auth || auth !== expected) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

const router = Router();

router.post('/user-config', async (req, res) => {
  try {
    const { userId, location, alarmHour } = req.body;

    if (!userId || !location) {
      res
        .status(400)
        .json({ error: 'userId와 location은 필수입니다' });
      return;
    }

    const region = findRegion(location);
    if (!region) {
      res.status(404).json({ error: '지원하지 않는 지역입니다' });
      return;
    }

    const hour = alarmHour ?? 7;

    await pool.query(
      `INSERT INTO user_config (user_id, location, nx, ny, alarm_hour)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id)
       DO UPDATE SET location = $2, nx = $3, ny = $4, alarm_hour = $5, updated_at = NOW()`,
      [userId, location, region.code.nx, region.code.ny, hour]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('User config error:', error);
    res.status(500).json({ error: '설정 저장에 실패했습니다' });
  }
});

router.get('/user-config/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_config WHERE user_id = $1',
      [req.params.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: '설정이 없습니다' });
      return;
    }

    const row = result.rows[0];
    res.json({
      userId: row.user_id,
      location: row.location,
      nx: row.nx,
      ny: row.ny,
      alarmHour: row.alarm_hour,
    });
  } catch (error) {
    console.error('User config error:', error);
    res.status(500).json({ error: '설정을 불러올 수 없습니다' });
  }
});

// 토스 연결 끊기 콜백 - 회원 탈퇴 시 유저 데이터 삭제
router.post('/user-disconnect', requireBasicAuth, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ error: 'userId는 필수입니다' });
      return;
    }

    await pool.query('DELETE FROM user_config WHERE user_id = $1', [userId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Disconnect callback error:', error);
    res.status(500).json({ error: '데이터 삭제에 실패했습니다' });
  }
});

export default router;
