CREATE TABLE IF NOT EXISTS user_config (
  user_id     VARCHAR PRIMARY KEY,
  location    VARCHAR NOT NULL,
  nx          INTEGER NOT NULL,
  ny          INTEGER NOT NULL,
  alarm_hour  INTEGER NOT NULL DEFAULT 7,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weather_cache (
  id          SERIAL PRIMARY KEY,
  nx          INTEGER NOT NULL,
  ny          INTEGER NOT NULL,
  base_date   VARCHAR(8) NOT NULL,
  data        JSONB NOT NULL,
  fetched_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(nx, ny, base_date)
);
