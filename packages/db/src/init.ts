import { client } from ".";

export async function initHyperTable() {
  // Step 1: Enable TimescaleDB extension
  await client.$executeRawUnsafe(`
    CREATE EXTENSION IF NOT EXISTS timescaledb;
  `);

  // Step 2: Create ticks table with quantity instead of day_volume
  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ticks (
      time TIMESTAMPTZ NOT NULL,
      symbol TEXT NOT NULL,
      price NUMERIC NOT NULL,
      quantity NUMERIC NOT NULL
    );
  `);

  // Step 3: Convert ticks into a hypertable (partitioned by time)
  await client.$executeRawUnsafe(`
    SELECT create_hypertable(
      'ticks', 
      'time', 
      chunk_time_interval => INTERVAL '1 day', 
      if_not_exists => TRUE
    );
  `);

  // Step 4: Create continuous aggregates (OHLCV)

  // 1-minute candles
  await client.$executeRawUnsafe(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS candle_1m
    WITH (timescaledb.continuous) AS
    SELECT
      symbol,
      time_bucket('1 minute', "time") AS bucket,
      FIRST(price, "time") AS open,
      MAX(price) AS high,
      MIN(price) AS low,
      LAST(price, "time") AS close,
      SUM(quantity) AS volume
    FROM ticks
    GROUP BY symbol, bucket;
  `);

  // 5-minute candles
  await client.$executeRawUnsafe(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS candle_5m
    WITH (timescaledb.continuous) AS
    SELECT
      symbol,
      time_bucket('5 minutes', "time") AS bucket,
      FIRST(price, "time") AS open,
      MAX(price) AS high,
      MIN(price) AS low,
      LAST(price, "time") AS close,
      SUM(quantity) AS volume
    FROM ticks
    GROUP BY symbol, bucket;
  `);

  // 1-day candles
  await client.$executeRawUnsafe(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS candle_1d
    WITH (timescaledb.continuous) AS
    SELECT
      symbol,
      time_bucket('1 day', "time") AS bucket,
      FIRST(price, "time") AS open,
      MAX(price) AS high,
      MIN(price) AS low,
      LAST(price, "time") AS close,
      SUM(quantity) AS volume
    FROM ticks
    GROUP BY symbol, bucket;
  `);

  // Step 5: Add policies to refresh aggregates automatically
  await client.$executeRawUnsafe(`
    SELECT add_continuous_aggregate_policy('candle_1m',
      start_offset => INTERVAL '1 day',
      end_offset   => INTERVAL '1 minute',
      schedule_interval => INTERVAL '1 minute');
  `);

  await client.$executeRawUnsafe(`
    SELECT add_continuous_aggregate_policy('candle_5m',
      start_offset => INTERVAL '7 days',
      end_offset   => INTERVAL '5 minutes',
      schedule_interval => INTERVAL '5 minutes');
  `);

  await client.$executeRawUnsafe(`
    SELECT add_continuous_aggregate_policy('candle_1d',
      start_offset => INTERVAL '30 days',
      end_offset   => INTERVAL '1 day',
      schedule_interval => INTERVAL '1 day');
  `);

  console.log("✅ Hypertable + continuous aggregates for OHLCV created successfully");
}

// Run the setup
initHyperTable().catch(console.error).finally(() => client.$disconnect());
