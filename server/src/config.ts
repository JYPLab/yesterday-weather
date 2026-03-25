import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  kmaApiKey: process.env.KMA_API_KEY || '',
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://localhost:5432/yesterday_weather',
  mockMode: process.env.MOCK_MODE === 'true' || !process.env.KMA_API_KEY,
};
