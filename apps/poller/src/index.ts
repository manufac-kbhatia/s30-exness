import { client } from "@repo/redis";
import WebSocket, { RawData } from "ws";

const BASE_SPREAD = 21.6;
let volatility = 1.0;
let priceHistory: number[] = [];

const ws = new WebSocket(
  "wss://stream.binance.com:9443/stream?streams=btcusdt@trade/btcusdt@bookTicker"
);

// Function to calculate market volatility (simplified)
const calculateVolatility = (prices: number[]) => {
  if (prices.length < 10) return 1.0;

  const recent = prices.slice(-10);
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const variance =
    recent.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) /
    recent.length;
  const stdDev = Math.sqrt(variance);

  // Normalize volatility (this is simplified)
  return Math.max(1.0, Math.min(3.0, 1 + (stdDev / avg) * 1000));
};

const calculateAdjustedPrices = (originalBid: number, originalAsk: number) => {
  // Broker approach: Take the better price from the source and add markup
  const sourceSpread = originalAsk - originalBid;

  // Calculate dynamic spread based on volatility and minimum spread
  const dynamicSpread = Math.max(BASE_SPREAD, BASE_SPREAD * volatility);
  const markup = (dynamicSpread - sourceSpread) / 2;

  // Apply markup symmetrically around the source prices
  const newBid = originalBid - markup;
  const newAsk = originalAsk + markup;

  return {
    bid: Number(newBid.toFixed(2)),
    ask: Number(newAsk.toFixed(2)),
    dynamicSpread: Number(dynamicSpread.toFixed(2)),
  };
};


ws.on("error", console.error);

ws.on("open", async function open() {
  console.log("connected to binance streams!!!");
});

ws.on("message", async (rawData: RawData) => {
  const streamType = JSON.parse(rawData.toString()).stream.split("@")[1];
  if (streamType === "bookTicker") {
    // calculate the bid and ask with spread.
    const data = JSON.parse(rawData.toString()).data;
    const originalBid = Number(data.b);
    const originalAsk = Number(data.a);
    const midPrice = (originalBid + originalAsk) / 2;

    priceHistory = [...priceHistory, midPrice].slice(-50); // Keep last 50 prices
    const newVolatility = calculateVolatility(priceHistory);
    volatility = newVolatility;

    const adjusted = calculateAdjustedPrices(originalBid, originalAsk);
    const quote = {...adjusted, symbol: data.s};
    await client.publish("quote", JSON.stringify(quote));
  } else {
    await client.lPush("trade", rawData.toString());
  }
});
