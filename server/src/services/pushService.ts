import { buildPushText } from 'yesterday-weather-shared';
import type { Delta } from 'yesterday-weather-shared';

/**
 * 푸시 알림 전송 (토스 앱인토스 SDK 연동 필요)
 * 현재는 로깅으로 대체
 */
export async function sendPush(
  userId: string,
  title: string,
  delta: Delta
): Promise<void> {
  const body = buildPushText(delta);

  // TODO: 앱인토스 푸시 SDK 연동
  console.log(`[PUSH] ${userId}: ${title} - ${body}`);
}
