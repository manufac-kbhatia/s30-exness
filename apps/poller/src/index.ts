import { client } from "@repo/redis";
import WebSocket, { RawData } from "ws";

const BASE_SPREAD = 21.60;

const ws = new WebSocket(
  "wss://stream.binance.com:9443/stream?streams=btcusdt@trade/btcusdt@bookTicker"
);

const calculateAdjustedPrices = (originalBid: number, originalAsk: number) => {
  const markup = (BASE_SPREAD) / 2;

  const newBid = originalBid - markup;
  const newAsk = originalAsk + markup;

  return {
    bid: Number(newBid.toFixed(2)),
    ask: Number(newAsk.toFixed(2)),
  };
};


ws.on("error", console.error);

ws.on("open", async function open() {
  console.log("connected to binance streams!!!");
});

ws.on("message", async (rawData: RawData) => {
  const streamType = JSON.parse(rawData.toString()).stream.split("@")[1];
  if (streamType === "bookTicker") {
    // calculate the bid and ask with spread of 21.6.
    const data = JSON.parse(rawData.toString()).data; // {bid, ask}
    const originalBid = Number(data.b);
    const originalAsk = Number(data.a);
    
    const adjusted = calculateAdjustedPrices(originalBid, originalAsk);
    const quote = {...adjusted, symbol: data.s};
    await client.publish("quote", JSON.stringify(quote));
  } else {
    await client.lPush("trade", rawData.toString());
  }
});