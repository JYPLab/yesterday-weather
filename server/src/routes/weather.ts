import { Router } from 'express';
import { findRegion, LOCATION_CODES } from 'yesterday-weather-shared';
import { config } from '../config.js';
import { getWeatherComparison } from '../services/weatherService.js';
import { getWeatherComparisonMock } from '../services/mockWeatherService.js';

const router = Router();

router.get('/weather', async (req, res) => {
  try {
    const regionName = req.query.region as string;
    if (!regionName) {
      res.status(400).json({ error: '지역명을 입력해주세요' });
      return;
    }

    const region = findRegion(regionName);
    if (!region) {
      res.status(404).json({ error: '지원하지 않는 지역입니다' });
      return;
    }

    const comparison = config.mockMode
      ? await getWeatherComparisonMock(region.code.nx, region.code.ny, regionName)
      : await getWeatherComparison(region.code.nx, region.code.ny);

    res.json(comparison);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: '날씨 정보를 불러올 수 없습니다' });
  }
});

router.get('/regions', (req, res) => {
  const query = (req.query.q as string) || '';
  const regions = Object.entries(LOCATION_CODES)
    .filter(([name]) => name.includes(query))
    .map(([name, code]) => ({ name, ...code }));
  res.json(regions);
});

export default router;
