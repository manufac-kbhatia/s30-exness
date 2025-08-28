import { client } from "@repo/db";
import { WebSocket } from "ws";

const ws = new WebSocket(
  "wss://stream.binance.com:9443/stream?streams=btcusdt@trade",
);

(async () => {
  await client.ticks.create({
    data: {
      price: "110023.234234",
      stream: "BTCUDT",
      symbol: "Asdf",
      tradeId: 12,
      tradeTime: 1222,
    }
  });
})()