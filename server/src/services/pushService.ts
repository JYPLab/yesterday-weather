import { Agent, fetch as undiciFetch } from 'undici';
import { getTempLevel, getTempText } from 'yesterday-weather-shared';
import type { Delta } from 'yesterday-weather-shared';
import { TEMP_TEXT_CONNECTIVE } from 'yesterday-weather-shared';

const TOSS_MESSENGER_API = 'https://apps-in-toss-api.toss.im';
const TEMPLATE_SET_CODE = 'yesterday-weather-daily';

function createMtlsAgent(): Agent {
  const cert = process.env.TOSS_MTLS_CERT;
  const key = process.env.TOSS_MTLS_KEY;
  if (!cert || !key) throw new Error('TOSS_MTLS_CERT / TOSS_MTLS_KEY 환경변수가 없습니다');
  return new Agent({ connect: { cert, key } });
}

/**
 * delta → {message} 변수값 생성 (끝에 '요' 없이, 템플릿에서 붙임)
 * 예: "어제보다 3도 쌀쌀해", "어제랑 비슷한데 비 와", "어제랑 비슷해"
 */
function buildMessage(delta: Delta): string {
  const level = getTempLevel(delta.feelsLikeDelta);
  const isSimilar = level === 'SIMILAR';
  const prefix = isSimilar ? '어제랑' : '어제보다';
  const diff = Math.abs(Math.round(delta.feelsLikeDelta));
  const connective = TEMP_TEXT_CONNECTIVE[level];
  const text = getTempText(delta.feelsLikeDelta);

  if (delta.newSnow) {
    return isSimilar
      ? `${prefix} ${connective} 눈 와`
      : `${prefix} ${diff}도 ${connective} 눈 와`;
  }
  if (delta.newRain) {
    return isSimilar
      ? `${prefix} ${connective} 비 와`
      : `${prefix} ${diff}도 ${connective} 비 와`;
  }
  if (isSimilar) {
    return `${prefix} ${text}`;
  }
  return `${prefix} ${diff}도 ${text}`;
}

export async function sendPush(userId: string, delta: Delta): Promise<void> {
  const message = buildMessage(delta);
  const userKey = parseInt(userId, 10);

  if (isNaN(userKey)) {
    console.warn(`[PUSH] 유효하지 않은 userId: ${userId}, 발송 건너뜀`);
    return;
  }

  let agent: Agent;
  try {
    agent = createMtlsAgent();
  } catch (e) {
    console.error('[PUSH] mTLS 에이전트 생성 실패:', e);
    return;
  }

  const res = await undiciFetch(
    `${TOSS_MESSENGER_API}/api-partner/v1/apps-in-toss/messenger/send-message`,
    {
      dispatcher: agent,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Toss-User-Key': String(userKey),
      },
      body: JSON.stringify({
        templateSetCode: TEMPLATE_SET_CODE,
        context: { message },
      }),
    }
  );

  const result = await res.json() as { resultType: string };
  if (result.resultType !== 'SUCCESS') {
    console.error(`[PUSH] 발송 실패 userId=${userId}:`, result);
  } else {
    console.log(`[PUSH] 발송 성공 userId=${userId}: ${message}요.`);
  }
}
