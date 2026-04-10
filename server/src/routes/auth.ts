import { Router } from 'express';
import { Agent, fetch as undiciFetch } from 'undici';

const router = Router();

const TOSS_API_BASE = 'https://api.toss.im';

function createMtlsAgent(): Agent {
  const cert = process.env.TOSS_MTLS_CERT;
  const key = process.env.TOSS_MTLS_KEY;
  if (!cert || !key) {
    throw new Error('TOSS_MTLS_CERT / TOSS_MTLS_KEY 환경변수가 없습니다');
  }
  return new Agent({ connect: { cert, key } });
}

router.post('/auth/toss-login', async (req, res) => {
  try {
    const { authorizationCode, referrer } = req.body;

    if (!authorizationCode || !referrer) {
      res.status(400).json({ error: 'authorizationCode와 referrer는 필수입니다' });
      return;
    }

    let agent: Agent;
    try {
      agent = createMtlsAgent();
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: '서버 설정 오류 (mTLS 인증서 없음)' });
      return;
    }

    // 1. 인가 코드 → 액세스 토큰
    const tokenRes = await undiciFetch(
      `${TOSS_API_BASE}/api-partner/v1/apps-in-toss/user/oauth2/generate-token`,
      {
        dispatcher: agent,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorizationCode, referrer }),
      }
    );

    if (!tokenRes.ok) {
      console.error('Token exchange failed:', await tokenRes.text());
      res.status(502).json({ error: '토스 토큰 교환 실패' });
      return;
    }

    const { accessToken } = (await tokenRes.json()) as { accessToken: string };

    // 2. 액세스 토큰 → 유저 정보 (userKey)
    const userRes = await undiciFetch(
      `${TOSS_API_BASE}/api-partner/v1/apps-in-toss/user/oauth2/login-me`,
      {
        dispatcher: agent,
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!userRes.ok) {
      console.error('User info fetch failed:', await userRes.text());
      res.status(502).json({ error: '토스 유저 정보 조회 실패' });
      return;
    }

    const { userKey } = (await userRes.json()) as { userKey: string };
    res.json({ userKey });
  } catch (error) {
    console.error('Toss login error:', error);
    res.status(500).json({ error: '로그인 처리 중 오류가 발생했습니다' });
  }
});

export default router;
