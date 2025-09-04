import { client } from "@repo/db";


export async function getAll5MinCandles(symbol: string) {
  const result = await client.$queryRawUnsafe(`
    SELECT bucket, open, high, low, close
    FROM candle_5m
    WHERE symbol = $1
    ORDER BY bucket ASC;
  `, symbol);

  return result;
}

getAll5MinCandles("BTCUSDT");
